param(
    [Parameter(Mandatory = $true)]
    [string] $PromptFile
)

# Get the script directory
$scriptDirectory = $PSScriptRoot

# Dot-source required functions
. "$scriptDirectory\Write-ServiceLog.ps1"

# If relative, prepend "prompts" subfolder under repo root
if (-not (Split-Path $PromptFile -IsAbsolute)) {
    $repoRoot = Split-Path $scriptDirectory -Parent
    $PromptFile = Join-Path (Join-Path $repoRoot "prompts") $PromptFile
}

if (-not (Test-Path $PromptFile)) {
    Write-ServiceLog "Prompt file not found: $PromptFile" -Level "Error"
    exit 1
}

# Read prompt content
$prompt = Get-Content $PromptFile -Raw

Write-ServiceLog "Running aider with prompt file: $PromptFile"

# Run aider (YAML config applies automatically)
aider --message $prompt
