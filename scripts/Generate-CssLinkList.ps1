# scripts\Generate-CssLinkList.ps1
# Scans Server\wwwroot\styles (recursively), groups by folder, and writes
# Server\wwwroot\css.txt with <link rel="stylesheet" href="styles/..."> lines.
# Blocks are sorted by folder name; files within a block sorted by name.
# Overwrites css.txt without prompting.

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$stylesRootRel = 'Server\wwwroot\styles'
$stylesRoot    = (Resolve-Path $stylesRootRel).Path
$wwwroot       = Split-Path -Parent $stylesRoot
$outFile       = Join-Path $wwwroot 'css.txt'

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

# Collect .css files (skip source maps)
$allCss = Get-ChildItem -Path $stylesRoot -Recurse -File -Filter *.css |
          Where-Object { $_.Name -notmatch '\.map$' }

$files = @()
foreach ($f in $allCss) {
  $files += [pscustomobject]@{
    FullName  = $f.FullName
    RelPath   = Resolve-RelPath $stylesRoot $f.FullName    # e.g., "game-board/core.css"
    FolderRel = Resolve-RelDir  $stylesRoot $f.DirectoryName # e.g., "game-board" or ""
    BaseName  = $f.BaseName
  }
}

# Group by folder and sort groups by folder name
$groups = $files | Group-Object FolderRel | Sort-Object { $_.Name } -Culture 'en-US'

# Emit lines
$lines = New-Object System.Collections.Generic.List[string]
foreach ($g in $groups) {
  $groupFiles = $g.Group | Sort-Object BaseName, RelPath -Culture 'en-US'
  foreach ($it in $groupFiles) {
    $href = 'styles/' + ($it.RelPath -replace '\\','/')
    $lines.Add("<link rel=""stylesheet"" href=""$href"">") | Out-Null
  }
  $lines.Add('') | Out-Null  # blank line between blocks
}

# Write css.txt (UTF-8 without BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllLines($outFile, $lines, $utf8NoBom)
Write-Host "Wrote $outFile ($($lines.Count) lines)."
