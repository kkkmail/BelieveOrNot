# Update-WebFileComments.ps1
# Script to add/update top comments in web files with their relative paths from wwwroot

param(
    [string]$RootPath = (Get-Location).Path
)

# Define the wwwroot path
$WwwrootPath = Join-Path $RootPath "Server\wwwroot"

# Check if wwwroot directory exists
if (-not (Test-Path $WwwrootPath)) {
    Write-Error "wwwroot directory not found at: $WwwrootPath"
    exit 1
}

Write-Host "Scanning files in: $WwwrootPath" -ForegroundColor Green

# Get all JS, CSS, and HTML files recursively
$FileExtensions = @("*.js", "*.css", "*.html")
$Files = Get-ChildItem -Path $WwwrootPath -Recurse -Include $FileExtensions

Write-Host "Found $($Files.Count) files to process" -ForegroundColor Yellow

foreach ($File in $Files) {
    # Calculate relative path from wwwroot
    $RelativePath = $File.FullName.Substring($WwwrootPath.Length + 1).Replace('\', '/')
    
    # Determine comment syntax based on file extension
    $CommentPrefix = switch ($File.Extension.ToLower()) {
        ".js" { "//" }
        ".css" { "/*" }
        ".html" { "<!--" }
        default { "//" }
    }
    
    $CommentSuffix = switch ($File.Extension.ToLower()) {
        ".css" { " */" }
        ".html" { " -->" }
        default { "" }
    }
    
    # Create the expected comment
    $ExpectedComment = "$CommentPrefix $RelativePath$CommentSuffix"
    
    # Read file content
    try {
        $Content = Get-Content -Path $File.FullName -Raw -Encoding UTF8
        if ([string]::IsNullOrEmpty($Content)) {
            Write-Host "Skipping empty file: $RelativePath" -ForegroundColor Gray
            continue
        }
        
        $Lines = Get-Content -Path $File.FullName -Encoding UTF8
        $FirstLine = $Lines[0]
        
        # Check if first line is already the correct comment
        if ($FirstLine -eq $ExpectedComment) {
            Write-Host "✓ Already correct: $RelativePath" -ForegroundColor Green
            continue
        }
        
        # Check if first line contains a comment with the filename but wrong path
        $FileName = [System.IO.Path]::GetFileName($File.Name)
        $HasFileNameComment = $false
        
        # Pattern to match comments containing the filename
        $FileNamePattern = [regex]::Escape($FileName)
        if ($FirstLine -match $FileNamePattern -and 
            ($FirstLine.StartsWith("//") -or $FirstLine.StartsWith("/*") -or $FirstLine.StartsWith("<!--"))) {
            $HasFileNameComment = $true
        }
        
        if ($HasFileNameComment) {
            # Replace the first line with the correct comment
            $Lines[0] = $ExpectedComment
            Write-Host "→ Updated comment: $RelativePath" -ForegroundColor Cyan
        }
        else {
            # Add new comment at the top
            $NewLines = @($ExpectedComment) + $Lines
            $Lines = $NewLines
            Write-Host "+ Added comment: $RelativePath" -ForegroundColor Blue
        }
        
        # Write the updated content back to file
        $Lines | Set-Content -Path $File.FullName -Encoding UTF8
        
    }
    catch {
        Write-Warning "Error processing file $($File.FullName): $($_.Exception.Message)"
    }
}

Write-Host "`nProcessing complete!" -ForegroundColor Green
Write-Host "Legend:" -ForegroundColor White
Write-Host "  ✓ Already correct - file already has the right comment" -ForegroundColor Green
Write-Host "  → Updated comment - replaced existing filename comment with correct path" -ForegroundColor Cyan  
Write-Host "  + Added comment - added new comment to file without one" -ForegroundColor Blue