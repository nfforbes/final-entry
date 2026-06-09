# Final Entry mobile (KMP)

- **Modules:** `shared` (Ktor client + models + `FinalEntrySdk`), `androidApp` (Compose shells for customer / technician / admin).

## Backend env (JWT for mobile)

The Next app verifies bearer tokens against Auth0 JWKS (`AUTH0_DOMAIN`, audience). Typical keys:

- `AUTH0_AUDIENCE` — API identifier (fallback for mobile audience).
- `AUTH0_MOBILE_AUDIENCE` — optional dedicated mobile API audience.
- Cookie-based web flows use your existing Auth0 settings; mobile pastes an **Auth0 access token** that matches the configured audience(s).

Android **API base URL** defaults to emulators pointing at host `https://10.0.2.2:3000` (editable in-app).

## Build

Open the `mobile/` folder in Android Studio and sync Gradle.

There is no committed Gradle wrapper script in-repo; generating one (`gradle wrapper`) is optional once the Android Gradle Plugin toolchain is configured locally.

## iOS

`shared` includes `iosArm64` / `iosSimulatorArm64`; a standalone Xcode app shell is left to product packaging as in the architecture plan.
