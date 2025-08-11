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
        Write-ServiceLog "Error calling Ollama: $_" -Level "Error"
        return $null
    }
}