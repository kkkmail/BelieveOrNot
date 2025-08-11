#!/usr/bin/env pwsh
<#
Direct Ollama API client for code generation (PowerShell version)
Usage: .\ollama_coder.ps1 prompt_file.md
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$PromptFile
)

& "$PSScriptRoot\scripts\Invoke-OllamaCoder.ps1" -PromptFile $PromptFile
