# Mobile CI/CD (GitHub Actions)

Based on the [LuKaria](https://github.com/nforbesCci/LuKaria) Fastlane + GitHub Actions setup.

## Workflows

| Workflow | Trigger | What it does |
|---|---|---|
| **Android Build & Play Store** (`.github/workflows/android.yml`) | Push/PR on `mobile/**`; deploy on push to `main` | Compile check + signed AAB → Google Play |
| **iOS Build & TestFlight** (`.github/workflows/ios.yml`) | Push/PR on `mobile/**`; deploy on push to `main` | KMP iOS compile + archive → TestFlight |

Package IDs: **`com.finalentry.mobile.android`** · **`com.finalentry.mobile.ios`**

`versionCode` / iOS `CFBundleVersion` = GitHub Actions `run_number` on deploy.  
`versionName` = `1.0.2` (bump in workflow `VERSION_NAME` env when shipping a marketing version).

## One-time setup script

From repo root (Windows):

```powershell
.\mobile\scripts\set-github-secrets.ps1
```

This sets Android + Apple secrets on **`nfforbes/final-entry`**. You may still need to copy **`PLAY_STORE_JSON_KEY`** and **`APP_STORE_CONNECT_API_ISSUER_ID`** from [LuKaria repo secrets](https://github.com/nforbesCci/LuKaria/settings/secrets/actions) if the script cannot find them locally.

## Required GitHub secrets

Repo → **Settings → Secrets and variables → Actions**:

### Android (Google Play)

| Secret | Purpose |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Upload keystore (`.jks`) as base64 |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (`my-key-alias`) |
| `ANDROID_KEY_PASSWORD` | Key password |
| `PLAY_STORE_JSON_KEY` | Full Play Developer API service account JSON |

Encode keystore (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("my-release-key.jks")) | Set-Clipboard
```

Play Console → **Users and permissions** → invite the service account with **Release apps to testing tracks**.

### iOS (App Store Connect / TestFlight)

| Secret | Required? | Purpose |
|---|---|---|
| `APPLE_TEAM_ID` | Yes | 10-character Apple Developer Team ID |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Yes | ASC API issuer UUID |
| `APP_STORE_CONNECT_API_KEY_ID` | Yes | ASC API key ID |
| `APP_STORE_CONNECT_API_KEY_P8` | Yes | Contents of the `.p8` API key file |
| `IOS_DISTRIBUTION_CERT_P12_BASE64` | Optional | Pre-exported Distribution `.p12` (Fastlane can create one via API) |
| `IOS_DISTRIBUTION_CERT_PASSWORD` | Optional | `.p12` export password |

ASC API key needs **Admin** or **App Manager** role. Register bundle ID `com.finalentry.mobile.ios` before first upload.

## Local signed Android bundle

```bash
cd mobile
cp keystore.properties.example keystore.properties   # fill in passwords
./gradlew :androidApp:bundleRelease -PVERSION_CODE=4 -PVERSION_NAME=1.0.2
```

## First deploy checklist

### Google Play
1. App exists: `com.finalentry.mobile.android`
2. Play App Signing enabled; upload key matches `my-release-key.jks`
3. All five Android secrets set
4. Push to `main` or run **Android Build & Play Store** workflow manually

### Apple
1. App exists in App Store Connect: **Final Entry** / `com.finalentry.mobile.ios`
2. Four required iOS secrets set
3. Push to `main` or run **iOS Build & TestFlight** workflow manually
4. After TestFlight processing, submit for App Review in App Store Connect

CI does **not** auto-promote to Play production or the public App Store.

## If deploy fails

| Symptom | Fix |
|---|---|
| Missing secret … | Add secret; re-run workflow |
| Package not found (Android) | Create Play app with id `com.finalentry.mobile.android` |
| Insufficient Play permissions | Grant service account release access on that app |
| Distribution cert limit (iOS) | Revoke unused certs in Apple Developer portal; re-run |
| Bundle ID not found (iOS) | Register `com.finalentry.mobile.ios` in Apple Developer |
