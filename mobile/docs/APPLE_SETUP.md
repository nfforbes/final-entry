# Apple Developer / App Store Connect — Final Entry iOS

## Already done (via API)

| Item | Status |
|---|---|
| Bundle ID `com.finalentry.mobile.ios` | Registered (Team `3CPQ68PXHC`) |
| GitHub secrets (all 9) | Set on `nfforbes/final-entry` |
| `TEAM_ID` in `iosApp/Configuration/Config.xcconfig` | `3CPQ68PXHC` |
| Auth0 URL scheme | `finalentry://callback` in `Info.plist` |

## One manual step required

An older App Store Connect app named **Final Entry** uses bundle ID **`final-entry-1`**, which does **not** match the mobile app (`com.finalentry.mobile.ios`). Bundle IDs cannot be changed after app creation.

Create a **new** app in App Store Connect:

1. Open [App Store Connect → Apps](https://appstoreconnect.apple.com/apps)
2. Click **+** → **New App**
3. Fill in:
   - **Platforms:** iOS
   - **Name:** Final Entry Mobile (or Final Entry)
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** `com.finalentry.mobile.ios` (select from dropdown)
   - **SKU:** `finalentry-mobile-ios`
   - **User Access:** Full Access
4. Click **Create**

After that, push to `main` or run **iOS Build & TestFlight** — Fastlane will create the Distribution cert, provisioning profile, and upload the first build.

## Optional cleanup

The placeholder app **Final Entry** (`final-entry-1`) can be removed from App Store Connect if you are not using it.

## Auth0 (mobile login)

In [Auth0 Dashboard](https://manage.auth0.com/) → Native app → **Allowed Callback URLs**, ensure:

```text
finalentry://callback
```
