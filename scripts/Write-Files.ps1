function Write-Files {
    param([hashtable]$Files)
    
    foreach ($filepath in $Files.Keys) {
        try {
            # Create directory if it doesn't exist
            $dir = Split-Path $filepath -Parent
            if ($dir -and -not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
            }
            
            $Files[$filepath] | Out-File -FilePath $filepath -Encoding UTF8
            Write-ServiceLog "Created: $filepath" -Level "Info"
        }
        catch {
            Write-ServiceLog "Error creating ${filepath}: $_" -Level "Error"
        }
    }
}