# Sets GitHub Actions secrets on nfforbes/final-entry for mobile store deploy.
# Run from repo root: .\mobile\scripts\set-github-secrets.ps1
#
# Copies Apple API credentials from Weir-Here / LuKaria where possible.
# You may still need to paste PLAY_STORE_JSON_KEY and APP_STORE_CONNECT_API_ISSUER_ID
# from https://github.com/nforbesCci/LuKaria/settings/secrets/actions

$ErrorActionPreference = "Stop"
$Repo = "nfforbes/final-entry"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")

function Set-GhSecret($Name, $Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) {
        Write-Warning "Skipping $Name (empty value)"
        return $false
    }
    $Value | gh secret set $Name -R $Repo --body -
    Write-Host "Set $Name"
    return $true
}

Write-Host "Setting secrets on $Repo ..." -ForegroundColor Cyan

# --- Android (Final Entry upload keystore) ---
$KeystorePath = Join-Path $Root "my-release-key.jks"
if (Test-Path $KeystorePath) {
    $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($KeystorePath))
    Set-GhSecret "ANDROID_KEYSTORE_BASE64" $b64 | Out-Null
    Set-GhSecret "ANDROID_KEYSTORE_PASSWORD" "3cDVLHM4wmPLsbnPbhJt" | Out-Null
    Set-GhSecret "ANDROID_KEY_ALIAS" "my-key-alias" | Out-Null
    Set-GhSecret "ANDROID_KEY_PASSWORD" "3cDVLHM4wmPLsbnPbhJt" | Out-Null
} else {
    Write-Warning "Keystore not found at $KeystorePath — set ANDROID_* secrets manually"
}

# --- Apple (shared team; same as LuKaria / Weir-Here) ---
Set-GhSecret "APPLE_TEAM_ID" "3CPQ68PXHC" | Out-Null

$P8Candidates = @(
    "c:\Git\Weir-Here-v1\AuthKey_5PUPPWQ94W.p8",
    (Join-Path $Root "AuthKey_5PUPPWQ94W.p8")
)
$P8Path = $P8Candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($P8Path) {
    $p8 = Get-Content $P8Path -Raw
    Set-GhSecret "APP_STORE_CONNECT_API_KEY_ID" "5PUPPWQ94W" | Out-Null
    Set-GhSecret "APP_STORE_CONNECT_API_KEY_P8" $p8 | Out-Null
} else {
    Write-Warning "AuthKey_5PUPPWQ94W.p8 not found — set APP_STORE_CONNECT_API_KEY_* manually"
}

# Issuer ID + Play JSON cannot be read back from GitHub; prompt if not in env.
$IssuerId = $env:APP_STORE_CONNECT_API_ISSUER_ID
if ([string]::IsNullOrWhiteSpace($IssuerId)) {
    Write-Host ""
    Write-Host "APP_STORE_CONNECT_API_ISSUER_ID is required." -ForegroundColor Yellow
    Write-Host "Copy from LuKaria repo secrets: https://github.com/nforbesCci/LuKaria/settings/secrets/actions"
    $IssuerId = Read-Host "Paste APP_STORE_CONNECT_API_ISSUER_ID (or Enter to skip)"
}
if (-not [string]::IsNullOrWhiteSpace($IssuerId)) {
    Set-GhSecret "APP_STORE_CONNECT_API_ISSUER_ID" $IssuerId | Out-Null
}

$PlayJson = $env:PLAY_STORE_JSON_KEY
if ([string]::IsNullOrWhiteSpace($PlayJson)) {
    $PlayJsonPath = Read-Host "Path to play-store service account JSON (or Enter to skip)"
    if (-not [string]::IsNullOrWhiteSpace($PlayJsonPath) -and (Test-Path $PlayJsonPath)) {
        $PlayJson = Get-Content $PlayJsonPath -Raw
    }
}
if (-not [string]::IsNullOrWhiteSpace($PlayJson)) {
    Set-GhSecret "PLAY_STORE_JSON_KEY" $PlayJson | Out-Null
} else {
    Write-Host ""
    Write-Host "PLAY_STORE_JSON_KEY still needed." -ForegroundColor Yellow
    Write-Host "Copy from LuKaria: https://github.com/nforbesCci/LuKaria/settings/secrets/actions"
    Write-Host "Then: `$json = Get-Content path\to\play-store.json -Raw; `$json | gh secret set PLAY_STORE_JSON_KEY -R $Repo --body -"
}

Write-Host ""
Write-Host "Done. Verify: gh secret list -R $Repo" -ForegroundColor Green
