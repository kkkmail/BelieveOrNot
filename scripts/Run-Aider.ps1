$scriptDirectory = $PSScriptRoot
. "$scriptDirectory\Write-ServiceLog.ps1"

if ($args.Count -lt 1 -or [string]::IsNullOrWhiteSpace($args[0])) {
    Write-ServiceLog "Usage: Run-Aider.ps1 <promptFileName.txt>" -Level "Error"
    exit 1
}

# Remove the @@ marker prefix
$PromptFile = $args[0] -replace '^@@', ''

# If relative, prepend prompts folder
if (-not (Split-Path $PromptFile -IsAbsolute)) {
    $repoRoot   = Split-Path $scriptDirectory -Parent
    $PromptFile = Join-Path (Join-Path $repoRoot "prompts") $PromptFile
}

if (-not (Test-Path $PromptFile)) {
    Write-ServiceLog "Prompt file not found: $PromptFile" -Level "Error"
    exit 1
}

$prompt = Get-Content $PromptFile -Raw
Write-ServiceLog "Running aider with prompt file: $PromptFile"
aider --message $prompt
