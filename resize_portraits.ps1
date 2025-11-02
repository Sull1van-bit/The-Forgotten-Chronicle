# PowerShell script to resize portrait images to 100x100 with nearest-neighbor scaling
# Requires ImageMagick to be installed: https://imagemagick.org/script/download.php#windows

$sourcePath = "src\assets"
$newSize = "100x100"

# Character portraits
$characterPaths = @(
    "characters\louise\character.png",
    "characters\louise\angry.png", 
    "characters\louise\happy.png",
    "characters\louise\smile.png",
    "characters\louise\veryHappy.png",
    "characters\eugene\character.png",
    "characters\eugene\angry.png",
    "characters\eugene\happy.png", 
    "characters\eugene\smile.png",
    "characters\eugene\veryHappy.png",
    "characters\alex\character.png"
)

# NPC portraits
$npcPaths = @(
    "npc\elder\character.png",
    "npc\merchant\character.png"
)

# Combine all paths
$allPaths = $characterPaths + $npcPaths

Write-Host "Resizing portrait images to 100x100 pixels..."

foreach ($relativePath in $allPaths) {
    $fullPath = Join-Path $sourcePath $relativePath
    
    if (Test-Path $fullPath) {
        Write-Host "Resizing: $relativePath"
        
        # Create backup
        $backupPath = $fullPath -replace "\.png$", "_backup.png"
        Copy-Item $fullPath $backupPath
        
        # Resize with nearest-neighbor scaling (preserves pixel art)
        & magick convert $fullPath -filter point -resize $newSize $fullPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Successfully resized"
        } else {
            Write-Host "  ✗ Failed to resize - restoring backup"
            Move-Item $backupPath $fullPath
        }
    } else {
        Write-Host "  ⚠ File not found: $fullPath"
    }
}

Write-Host "`nResize operation complete!"
Write-Host "Original files have been backed up with '_backup.png' suffix"
