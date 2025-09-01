#!/usr/bin/env pwsh
<#
Direct Ollama API client for code generation (PowerShell version)
Usage: .\ollama_coder.ps1 prompt_file.md
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$PromptFile,
    
    [Parameter(Mandatory=$false)]
    [string]$PromptsFolder = "prompts"
)

# Load and call the function
$scriptDirectory = "$PSScriptRoot\scripts"
. "$scriptDirectory\Invoke-OllamaCoder.ps1"

Invoke-OllamaCoder -PromptFile $PromptFile -PromptsFolder $PromptsFolder
