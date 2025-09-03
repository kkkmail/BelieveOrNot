# scripts\Generate-JsScriptList.ps1
# Scans Server\wwwroot\js (recursively), groups files by folder, topologically orders
# each folder block so local static ESM imports (./ or ../) appear before dependents,
# then writes Server\wwwroot\js.txt with <script src="js/..."></script> lines.

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Roots
$jsRootRel = 'Server\wwwroot\js'
$jsRoot    = (Resolve-Path $jsRootRel).Path
$wwwroot   = Split-Path -Parent $jsRoot
$outFile   = Join-Path $wwwroot 'js.txt'

# Helpers
function Resolve-RelPath([string]$fromRoot, [string]$fullPath) {
  $uRoot = [Uri]("$fromRoot" + [IO.Path]::DirectorySeparatorChar)
  $uFile = [Uri]$fullPath
  $rel   = $uRoot.MakeRelativeUri($uFile).ToString()  # forward slashes
  return $rel
}
function Resolve-RelDir([string]$fromRoot, [string]$fullDir) {
  $uRoot = [Uri]("$fromRoot" + [IO.Path]::DirectorySeparatorChar)
  $uDir  = [Uri]("$fullDir" + [IO.Path]::DirectorySeparatorChar)
  $rel   = $uRoot.MakeRelativeUri($uDir).ToString().TrimEnd('/')
  return $rel  # "" for root
}
function Resolve-ImportPath([string]$importSpec, [string]$baseDir){
  if ($importSpec -notmatch '^(?:\./|\.\./)') { return $null }  # only local relative
  $p = Join-Path $baseDir ($importSpec -replace '/','\')
  $candidates = @()
  if (Test-Path $p)              { $candidates += (Resolve-Path $p).Path }
  if (Test-Path ($p + '.js'))    { $candidates += (Resolve-Path ($p + '.js')).Path }
  if (Test-Path (Join-Path $p 'index.js')) { $candidates += (Resolve-Path (Join-Path $p 'index.js')).Path }
  if ($candidates.Count -gt 0) { return $candidates[0] }
  return $null
}

# Collect files
$allJs = Get-ChildItem -Path $jsRoot -Recurse -File -Include *.js

# Pre-index files
$files = @{}
foreach ($f in $allJs) {
  $relPath   = Resolve-RelPath $jsRoot $f.FullName       # e.g., "actions/playCards.js"
  $folderRel = Resolve-RelDir  $jsRoot $f.DirectoryName  # e.g., "actions" or "utils/helpers" or ""
  $files[$f.FullName] = [pscustomobject]@{
    FullName   = $f.FullName
    RelPath    = $relPath
    FolderRel  = $folderRel
    BaseName   = $f.BaseName
    DepsSameDir= @()  # filled later: rel paths of deps in same folder
  }
}

# Extract same-folder static imports
$rxFrom   = [regex]'(?m)^\s*import\s+(?:[^;]*?)\s+from\s+["''](.+?)["'']\s*;'
$rxBare   = [regex]'(?m)^\s*import\s+["''](.+?)["'']\s*;'
foreach ($k in $files.Keys) {
  $fi   = $files[$k]
  $text = Get-Content -LiteralPath $fi.FullName -Raw
  $imports = @()
  foreach ($m in $rxFrom.Matches($text)) { $imports += $m.Groups[1].Value }
  foreach ($m in $rxBare.Matches($text)) { $imports += $m.Groups[1].Value }
  $baseDir = Split-Path -Parent $fi.FullName
  $sameDirDeps = @()
  foreach ($imp in $imports) {
    $resolved = Resolve-ImportPath $imp $baseDir
    if ($null -ne $resolved -and $files.ContainsKey($resolved)) {
      $dep = $files[$resolved]
      if ($dep.FolderRel -eq $fi.FolderRel) {
        $sameDirDeps += $dep.RelPath
      }
    }
  }
  $fi.DepsSameDir = ($sameDirDeps | Select-Object -Unique)
}

# Group by folder, sort folders
$groups = $files.Values | Group-Object FolderRel | Sort-Object { $_.Name } -Culture 'en-US'

# Topo-sort within each folder (dependencies first, then alpha by BaseName)
function Order-FilesByDeps([object[]]$nodes) {
  $byRel = @{}
  foreach ($n in $nodes) { $byRel[$n.RelPath] = $n }

  # Build indegree and edges: dep -> dependent
  $indeg = @{}
  $edges = @{}
  foreach ($n in $nodes) {
    $indeg[$n.RelPath] = 0
    $edges[$n.RelPath] = New-Object System.Collections.Generic.List[string]
  }
  foreach ($n in $nodes) {
    foreach ($depRel in $n.DepsSameDir) {
      if ($byRel.ContainsKey($depRel)) {
        $edges[$depRel].Add($n.RelPath)
        $indeg[$n.RelPath]++
      }
    }
  }

  $result = New-Object System.Collections.Generic.List[object]
  $remaining = New-Object System.Collections.Generic.HashSet[string]
  foreach ($n in $nodes) { $null = $remaining.Add($n.RelPath) }

  while ($true) {
    $ready = @()
    foreach ($rel in $remaining) { if ($indeg[$rel] -eq 0) { $ready += $byRel[$rel] } }
    if ($ready.Count -eq 0) { break }
    $ready = $ready | Sort-Object BaseName, RelPath -Culture 'en-US'
    foreach ($r in $ready) {
      $result.Add($r) | Out-Null
      $null = $remaining.Remove($r.RelPath)
      foreach ($to in $edges[$r.RelPath]) { $indeg[$to]-- }
    }
  }

  # Cycle fallback: append remaining alphabetically
  if ($remaining.Count -gt 0) {
    $left = @()
    foreach ($rel in $remaining) { $left += $byRel[$rel] }
    $left = $left | Sort-Object BaseName, RelPath -Culture 'en-US'
    foreach ($x in $left) { $result.Add($x) | Out-Null }
  }

  return $result
}

# Emit
$lines = New-Object System.Collections.Generic.List[string]
foreach ($g in $groups) {
  $ordered = Order-FilesByDeps ($g.Group)
  foreach ($n in $ordered) {
    $src = 'js/' + ($n.RelPath -replace '\\','/')
    $lines.Add("<script type=""module"" src=""$src""></script>") | Out-Null
  }
  $lines.Add('') | Out-Null  # blank line between blocks
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllLines($outFile, $lines, $utf8NoBom)
Write-Host "Wrote $outFile ($($lines.Count) lines)."
