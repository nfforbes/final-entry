# Mobile CI/CD (GitHub Actions)

## Workflows

| Workflow | Trigger | What it does |
|---|---|---|
| **Mobile CI** (`.github/workflows/mobile-ci.yml`) | Push/PR when `mobile/**` changes | Android debug APK + iOS simulator build |
| **Mobile Release** (`.github/workflows/mobile-release.yml`) | Manual **Actions → Mobile Release → Run workflow** | Signed AAB → Google Play; IPA → TestFlight |

## Required GitHub secrets

### Android (Google Play)

| Secret | Description |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded `.jks` / `.keystore` file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (e.g. `my-key-alias`) |
| `ANDROID_KEY_PASSWORD` | Key password |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Google Play Console service account JSON (Play Admin API enabled) |

Create the base64 keystore locally:

```bash
base64 -w 0 my-release-key.jks   # Linux
base64 -i my-release-key.jks   # macOS
```

In [Google Play Console](https://play.google.com/console): **Setup → API access** → link a service account with **Release to production** (or appropriate track) permission.

### iOS (App Store Connect / TestFlight)

| Secret | Description |
|---|---|
| `APPLE_TEAM_ID` | 10-character Apple Team ID |
| `APPLE_CERTIFICATE_BASE64` | Base64-encoded **Apple Distribution** `.p12` |
| `APPLE_CERTIFICATE_PASSWORD` | `.p12` export password |
| `APP_STORE_CONNECT_ISSUER_ID` | App Store Connect API issuer UUID |
| `APP_STORE_CONNECT_KEY_ID` | API key ID (e.g. `ABC123DEFG`) |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Contents of the `.p8` API key file |

Create an App Store Connect **API key** with **App Manager** (or Admin) role. Register bundle ID `com.finalentry.mobile.ios` in the Apple Developer portal before first upload.

## Local release signing

Copy `keystore.properties.example` → `keystore.properties` (gitignored) for local `./gradlew :androidApp:bundleRelease`.

## Release checklist

1. Bump `versionCode` / `versionName` in `androidApp/build.gradle.kts` and `iosApp/iosApp/Info.plist`.
2. Add GitHub secrets (once).
3. Run **Mobile Release** workflow; choose Play track (`internal` recommended first).
4. After TestFlight processing, submit for App Review in App Store Connect.
