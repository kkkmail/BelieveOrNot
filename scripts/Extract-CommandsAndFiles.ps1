function Extract-CommandsAndFiles {
    param([string]$Response)
    
    $lines = $Response -split "`n"
    $commands = @()
    $files = @{}
    $currentFile = $null
    $currentContent = @()
    $inCodeBlock = $false
    $codeType = $null
    
    foreach ($line in $lines) {
        # Detect code blocks
        if ($line.Trim() -match '^```') {
            if ($inCodeBlock) {
                # End of code block
                if ($codeType -eq 'sh' -or $codeType -eq 'bash') {
                    $commands += $currentContent | Where-Object { $_.Trim() -and -not $_.Trim().StartsWith('#') } | ForEach-Object { $_.Trim() }
                }
                elseif ($currentFile) {
                    $files[$currentFile] = $currentContent -join "`n"
                }
                $inCodeBlock = $false
                $currentFile = $null
                $currentContent = @()
                $codeType = $null
            }
            else {
                # Start of code block
                $inCodeBlock = $true
                $parts = $line.Trim().Substring(3).Split()
                if ($parts.Length -gt 0) {
                    $codeType = $parts[0]
                }
                $currentContent = @()
            }
        }
        elseif ($inCodeBlock) {
            $currentContent += $line
        }
        else {
            # Look for file references
            if ($line.Trim() -match '\.(cs|csproj|sln|md)) {
                $potentialFile = $line.Trim() -replace ':, ''
                if ($potentialFile -match '[/\\]' -or $potentialFile -match '\.') {
                    $currentFile = $potentialFile
                }
            }
        }
    }
    
    return $commands, $files
}