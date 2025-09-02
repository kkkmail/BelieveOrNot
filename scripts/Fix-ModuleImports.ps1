# scripts\Fix-ModuleImports.ps1
# Normalizes browser-ESM imports under Server\wwwroot\js:
#  - Adds .js to relative imports that lack an extension
#  - Resolves ./dir -> ./dir/index.js
#  - (optional) If a relative import is wrong, and there's a UNIQUE file
#    with the same basename somewhere, rewrite to that path.

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$jsRootRel = 'Server\wwwroot\js'
$jsRoot    = (Resolve-Path $jsRootRel).Path
$TryRelinkByBasename = $true   # set $false to turn off heuristic relink

# Build basename index for heuristic relinks
$basenameIndex = @{}
Get-ChildItem -Path $jsRoot -Recurse -File -Filter *.js | ForEach-Object {
  $bn = $_.BaseName.ToLowerInvariant()
  if (-not $basenameIndex.ContainsKey($bn)) { $basenameIndex[$bn] = @() }
  $basenameIndex[$bn] += $_.FullName
}

function Get-RelPath([string]$fromDir, [string]$toPath) {
  $uFrom = [Uri]("$fromDir" + [IO.Path]::DirectorySeparatorChar)
  $uTo   = [Uri]$toPath
  $rel   = $uFrom.MakeRelativeUri($uTo).ToString() # forward slashes
  if ($rel -notmatch '^(?:\./|\.\./)') { $rel = "./$rel" }
  return $rel
}

function Resolve-RelativeSpec([string]$spec, [string]$baseDir) {
  # only touch relative specs
  if ($spec -notmatch '^(?:\./|\.\./)') { return $spec }

  $asPath = Join-Path $baseDir ($spec -replace '/','\')

  # 1) exact file exists
  if (Test-Path $asPath -PathType Leaf) { return ($spec -replace '\\','/') }

  # 2) try with .js
  if (Test-Path ($asPath + '.js') -PathType Leaf) {
    return (($spec + '.js') -replace '\\','/')
  }

  # 3) try directory index.js
  $index = Join-Path $asPath 'index.js'
  if (Test-Path $index -PathType Leaf) {
    $fixed = ($spec.TrimEnd('/','\') + '/index.js')
    return ($fixed -replace '\\','/')
  }

  # 4) heuristic relink by unique basename
  if ($script:TryRelinkByBasename) {
    $leaf = [IO.Path]::GetFileName($spec)
    $bn   = ($leaf -replace '\.js$','').ToLowerInvariant()
    if ($basenameIndex.ContainsKey($bn) -and $basenameIndex[$bn].Count -eq 1) {
      $target = $basenameIndex[$bn][0]
      $rel = Get-RelPath $baseDir $target
      return ($rel -replace '\\','/')
    }
  }

  return $spec
}

# Regexes (here-strings must start on a new line)
$rxFrom = [regex]::new(@'
(?m)(\bimport\s+[^;]*?\s+from\s+)(["'])(.+?)(\2)
'@)
$rxBare = [regex]::new(@'
(?m)(\bimport\s+)(["'])(.+?)(\2)
'@)
$rxDyn  = [regex]::new(@'
(?m)(\bimport\s*\(\s*)(["'])(.+?)(\2)(\s*\))
'@)

function Fix-Imports-In-Text([string]$text, [string]$baseDir) {
  $before = $text  # snapshot

  $text = $rxFrom.Replace($text, {
    param($m)
    $pre  = $m.Groups[1].Value
    $q    = $m.Groups[2].Value
    $spec = $m.Groups[3].Value
    $new  = Resolve-RelativeSpec $spec $baseDir
    return "$pre$q$new$q"
  })

  $text = $rxBare.Replace($text, {
    param($m)
    $pre  = $m.Groups[1].Value
    $q    = $m.Groups[2].Value
    $spec = $m.Groups[3].Value
    $new  = Resolve-RelativeSpec $spec $baseDir
    return "$pre$q$new$q"
  })

  $text = $rxDyn.Replace($text, {
    param($m)
    $pre  = $m.Groups[1].Value
    $q    = $m.Groups[2].Value
    $spec = $m.Groups[3].Value
    $post = $m.Groups[5].Value
    $new  = Resolve-RelativeSpec $spec $baseDir
    return "$pre$q$new$q$post"
  })

  $changed = ($text -ne $before)
  return ,$text, $changed
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$files = Get-ChildItem -Path $jsRoot -Recurse -File -Filter *.js
foreach ($f in $files) {
  $raw = Get-Content -LiteralPath $f.FullName -Raw
  $fixed, $didChange = Fix-Imports-In-Text $raw $f.DirectoryName
  if ($didChange) {
    [IO.File]::WriteAllText($f.FullName, $fixed, $utf8NoBom)
    Write-Host "Fixed imports in $($f.FullName)"
  }
}

Write-Host "Done. Next: pwsh scripts\Generate-JsScriptList.ps1"
