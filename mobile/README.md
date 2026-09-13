# Final Entry mobile (KMP)

- **Modules:** `shared` (Ktor + `FinalEntrySdk`), `androidApp` (Android Compose UI), `composeApp` (iOS Compose UI), `iosApp` (Xcode shell).

## Auth0 dashboard (required for Login)

In Auth0 → Applications → your **Native** mobile app (`VrzhxH5mE9gclkKHG5QOLhPivXFa1xNz`):

1. **Application type:** Native (Authorization Code + PKCE).
2. **Allowed Callback URLs** — add exactly:
   ```
   finalentry://callback
   ```
3. **Allowed Logout URLs** — same URL as above.
4. **API audience (optional):** Leave `AUTH0_CUSTOM_API_AUDIENCE = null` in `AuthManager.kt` unless you have created an API in Auth0. Requesting an unregistered audience causes **“service not found”** at login. With no audience, the app uses the **id token** (JWT) for `/api/mobile/*` calls.

If Universal Login shows `invalid_request` / “couldn't find your session”, the callback URL above is usually missing or mistyped in Auth0.

## Backend env (JWT for mobile)

The Next app verifies bearer **access tokens** against Auth0 JWKS (`AUTH0_DOMAIN`, audience). Typical keys:

- `AUTH0_AUDIENCE` — API identifier (optional; only if you set `AUTH0_CUSTOM_API_AUDIENCE` on mobile).
- `AUTH0_MOBILE_AUDIENCE` — optional dedicated mobile API audience.
- `AUTH0_CLIENT_ID` — web application client id (accepted as JWT audience).
- `AUTH0_MOBILE_CLIENT_ID` — native app client id (`VrzhxH5mE9gclkKHG5QOLhPivXFa1xNz`); **required on Vercel if web and mobile use different Auth0 applications**.

Android **API base URL** defaults to `https://final-entry.vercel.app` (see `FinalEntryRoot.kt`).

## Build

Open the `mobile/` folder in Android Studio and sync Gradle, or use the wrapper:

```bash
cd mobile
./gradlew :androidApp:assembleDebug          # Android
./gradlew :androidApp:bundleRelease          # signed AAB (needs keystore.properties)
```

### CI/CD

GitHub Actions builds and deploys both apps — see **[CI.md](./CI.md)** for workflow details and required secrets.

## iOS

Requires a **Mac** with Xcode 15+.

| Module | Role |
|---|---|
| `shared` | KMP core (exports `Shared.framework`) |
| `composeApp` | Compose Multiplatform UI + Auth0 (exports `ComposeApp.framework`) |
| `iosApp` | Thin SwiftUI shell that hosts `MainViewController()` |

### Build on Mac

```bash
cd mobile
./gradlew :composeApp:embedAndSignAppleFrameworkForXcode
open iosApp/iosApp.xcodeproj
```

In Xcode: set **Team** in `iosApp/Configuration/Config.xcconfig`, then run on simulator or device.

Auth0: add `finalentry://callback` to the Native app's **Allowed Callback URLs** (same as Android). iOS registers the `finalentry` URL scheme in `iosApp/iosApp/Info.plist`.

From Gradle only (no Xcode UI):

```bash
./gradlew :composeApp:linkReleaseFrameworkIosArm64
```
