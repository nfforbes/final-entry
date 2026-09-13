$iconDir = Join-Path $PSScriptRoot "..\iosApp\iosApp\Assets.xcassets\AppIcon.appiconset"
New-Item -ItemType Directory -Force -Path $iconDir | Out-Null
Add-Type -AssemblyName System.Drawing

function Save-Png([string]$path, [int]$size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(255, 28, 110, 78))
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$icons = @{
    "iphone-20-2x.png" = 40
    "iphone-20-3x.png" = 60
    "iphone-29-2x.png" = 58
    "iphone-29-3x.png" = 87
    "iphone-40-2x.png" = 80
    "iphone-40-3x.png" = 120
    "iphone-60-2x.png" = 120
    "iphone-60-3x.png" = 180
    "ios-marketing-1024.png" = 1024
}

foreach ($entry in $icons.GetEnumerator()) {
    Save-Png (Join-Path $iconDir $entry.Key) $entry.Value
}

Write-Host "Generated $($icons.Count) icons in $iconDir"
