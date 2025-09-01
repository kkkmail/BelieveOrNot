#!/usr/bin/env pwsh
<#
Direct Ollama API client for code generation (PowerShell version)
Usage: .\ollama_coder.ps1 prompt_file.md
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$PromptFile
)

function Call-Ollama {
    param(
        [string]$Prompt,
        [string]$Model = "qwen2.5-coder:14b"
    )
    
    $url = "http://localhost:11434/api/generate"
    
    $data = @{
        model = $Model
        prompt = $Prompt
        stream = $false
        options = @{
            temperature = 0.1
            top_p = 0.9
            num_ctx = 8192
        }
    }
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body ($data | ConvertTo-Json -Depth 10) -ContentType "application/json" -TimeoutSec 10800
        return $response.response
    }
    catch {
        Write-Host "Error calling Ollama: $_"
        return $null
    }
}

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
            if ($line.Trim() -match '\.(cs|csproj|sln|md)$') {
                $potentialFile = $line.Trim() -replace ':$', ''
                if ($potentialFile -match '[/\\]' -or $potentialFile -match '\.') {
                    $currentFile = $potentialFile
                }
            }
        }
    }
    
    return $commands, $files
}

function Execute-Commands {
    param([array]$Commands)
    
    foreach ($cmd in $Commands) {
        if ($cmd.Trim()) {
            Write-Host "Executing: $cmd"
            Invoke-Expression $cmd
        }
    }
}

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
            Write-Host "Created: $filepath"
        }
        catch {
            Write-Host "Error creating ${filepath}: $_"
        }
    }
}

# Main execution
if (-not (Test-Path $PromptFile)) {
    Write-Host "Prompt file not found: $PromptFile"
    exit 1
}

# Read the prompt
$prompt = Get-Content $PromptFile -Raw

Write-Host "Sending prompt to Ollama..."

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
    Write-Host "Response received ($($response.Length) characters)"
    
    # Extract commands and files
    $commands, $files = Extract-CommandsAndFiles -Response $response
    
    if ($commands.Count -gt 0) {
        Write-Host "`nFound $($commands.Count) commands:"
        foreach ($cmd in $commands) {
            Write-Host "  $cmd"
        }
        
        $proceed = Read-Host "`nExecute these commands? (y/N)"
        if ($proceed -eq 'y') {
            Execute-Commands -Commands $commands
        }
    }
    
    if ($files.Count -gt 0) {
        Write-Host "`nFound $($files.Count) files:"
        foreach ($filepath in $files.Keys) {
            Write-Host "  $filepath"
        }
        
        $proceed = Read-Host "`nCreate these files? (y/N)"
        if ($proceed -eq 'y') {
            Write-Files -Files $files
        }
    }
    
    # Save full response for review
    $responseFile = "response_$([System.IO.Path]::GetFileNameWithoutExtension($PromptFile)).txt"
    $response | Out-File -FilePath $responseFile -Encoding UTF8
    Write-Host "`nFull response saved to: $responseFile"
}
else {
    Write-Host "Failed to get response from Ollama"
}
