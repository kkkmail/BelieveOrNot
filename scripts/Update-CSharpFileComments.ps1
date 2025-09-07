# Update-CSharpFileComments.ps1
# Script to add/update top comments in C# files with their relative paths from Server folder

param(
    [string]$RootPath = (Get-Location).Path
)

# Define the Server path
$ServerPath = Join-Path $RootPath "Server"

# Check if Server directory exists
if (-not (Test-Path $ServerPath)) {
    Write-Error "Server directory not found at: $ServerPath"
    exit 1
}

Write-Host "Scanning C# files in: $ServerPath" -ForegroundColor Green

# Get all CS files recursively
$Files = Get-ChildItem -Path $ServerPath -Recurse -Include "*.cs"

Write-Host "Found $($Files.Count) files to process" -ForegroundColor Yellow

function Get-RelativePathFromServer {
    param(
        [string]$FilePath,
        [string]$ServerPath
    )
    
    # Get relative path from Server folder
    $RelativePath = $FilePath.Substring($ServerPath.Length + 1).Replace('\', '/')
    return $RelativePath
}

function Normalize-Whitespace {
    param([string]$Text)
    
    # Replace multiple whitespace characters with single spaces
    $Normalized = $Text -replace '\s+', ' '
    # Trim leading and trailing whitespace
    return $Normalized.Trim()
}

foreach ($File in $Files) {
    # Calculate relative path from Server folder
    $RelativePath = Get-RelativePathFromServer -FilePath $File.FullName -ServerPath $ServerPath
    
    # Create the expected comment with proper spacing
    $ExpectedComment = "// $RelativePath"
    
    # Read file content
    try {
        $Content = Get-Content -Path $File.FullName -Raw -Encoding UTF8
        if ([string]::IsNullOrEmpty($Content)) {
            Write-Host "Skipping empty file: $RelativePath" -ForegroundColor Gray
            continue
        }
        
        $Lines = Get-Content -Path $File.FullName -Encoding UTF8
        if ($Lines.Count -eq 0) {
            Write-Host "Skipping empty file: $RelativePath" -ForegroundColor Gray
            continue
        }
        
        $FirstLine = $Lines[0]
        $NormalizedFirstLine = Normalize-Whitespace -Text $FirstLine
        $NormalizedExpectedComment = Normalize-Whitespace -Text $ExpectedComment
        
        # Check if first line is already the correct comment (after normalization)
        if ($NormalizedFirstLine -eq $NormalizedExpectedComment) {
            Write-Host "✓ Already correct: $RelativePath" -ForegroundColor Green
            continue
        }
        
        # Check if first line contains a comment with the filename
        $FileName = [System.IO.Path]::GetFileName($File.Name)
        $HasFileNameComment = $false
        
        # Check if it's a comment line and contains the filename
        if ($FirstLine.TrimStart().StartsWith("//")) {
            $CommentContent = $FirstLine.TrimStart().Substring(2).Trim()
            
            # Check if the comment contains the filename (with or without path)
            if ($CommentContent.Contains($FileName)) {
                $HasFileNameComment = $true
            }
        }
        
        if ($HasFileNameComment) {
            # Replace the first line with the correct comment
            $Lines[0] = $ExpectedComment
            Write-Host "→ Updated comment: $RelativePath" -ForegroundColor Cyan
            Write-Host "  Old: $($FirstLine.Trim())" -ForegroundColor DarkGray
            Write-Host "  New: $ExpectedComment" -ForegroundColor DarkGray
        }
        else {
            # Add new comment at the top
            $NewLines = @($ExpectedComment) + $Lines
            $Lines = $NewLines
            Write-Host "+ Added comment: $RelativePath" -ForegroundColor Blue
            Write-Host "  Added: $ExpectedComment" -ForegroundColor DarkGray
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