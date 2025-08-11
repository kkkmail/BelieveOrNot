function Execute-Commands {
    param([array]$Commands)
    
    foreach ($cmd in $Commands) {
        if ($cmd.Trim()) {
            Write-ServiceLog "Executing: $cmd" -Level "Info"
            Invoke-Expression $cmd
        }
    }
}