function Invoke-OllamaCoder {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PromptFile
    )

    # Load required functions
    $scriptDirectory = $PSScriptRoot
    . "$scriptDirectory\Write-ServiceLog.ps1"
    . "$scriptDirectory\Call-Ollama.ps1"
    . "$scriptDirectory\Extract-CommandsAndFiles.ps1"
    . "$scriptDirectory\Execute-Commands.ps1"
    . "$scriptDirectory\Write-Files.ps1"

    # Main execution
    if (-not (Test-Path $PromptFile)) {
        Write-ServiceLog "Prompt file not found: $PromptFile" -Level "Error"
        return
    }

    # Read the prompt
    $prompt = Get-Content $PromptFile -Raw

    Write-ServiceLog "Sending prompt to Ollama..." -Level "Info"

    # Enhanced prompt for better code generation
    $enhancedPrompt = @"
You are a senior software developer. Please read the following requirements and provide a complete implementation with:

1. All necessary shell commands (in ```sh code blocks)
2. Complete file contents (with proper file paths as headers)
3. Ensure all commands are executable and files are syntactically correct

Requirements:
$prompt

Please provide shell commands first, then all file contents. Be very explicit about file paths and ensure the project structure is correct.
"@

    $response = Call-Ollama -Prompt $enhancedPrompt

    if ($response) {
        Write-ServiceLog "Response received ($($response.Length) characters)" -Level "Info"
        
        # Extract commands and files
        $commands, $files = Extract-CommandsAndFiles -Response $response
        
        if ($commands.Count -gt 0) {
            Write-ServiceLog "Found $($commands.Count) commands:" -Level "Info"
            foreach ($cmd in $commands) {
                Write-ServiceLog "  $cmd" -Level "Info"
            }
            
            $proceed = Read-Host "`nExecute these commands? (y/N)"
            if ($proceed -eq 'y') {
                Execute-Commands -Commands $commands
            }
        }
        
        if ($files.Count -gt 0) {
            Write-ServiceLog "Found $($files.Count) files:" -Level "Info"
            foreach ($filepath in $files.Keys) {
                Write-ServiceLog "  $filepath" -Level "Info"
            }
            
            $proceed = Read-Host "`nCreate these files? (y/N)"
            if ($proceed -eq 'y') {
                Write-Files -Files $files
            }
        }
        
        # Save full response for review
        $responseFile = "response_$([System.IO.Path]::GetFileNameWithoutExtension($PromptFile)).txt"
        $response | Out-File -FilePath $responseFile -Encoding UTF8
        Write-ServiceLog "Full response saved to: $responseFile" -Level "Info"
    }
    else {
        Write-ServiceLog "Failed to get response from Ollama" -Level "Error"
    }
}