# Salam BD — Android app (Capacitor)

The Android app wraps the existing Vite/React web app in a native shell using
[Capacitor](https://capacitorjs.com/). Same codebase, same backend
(`https://salambd.com`). Native-only behavior is gated behind `isNative`.

## App identity
- **App name:** Salam BD
- **Package / applicationId:** `com.salambd.app` (permanent — never change after publishing)
- Config: [`capacitor.config.json`](./capacitor.config.json)

## Everyday workflow — after changing web code
```bash
cd client
npm run build           # compile React -> dist/ (uses .env.production => VITE_API_URL=https://salambd.com)
npx cap sync android    # copy dist/ + plugins into android/
npx cap open android    # open Android Studio to run/debug
```
Rule of thumb: **edit code → `npm run build` → `npx cap sync android`.**

## What changes in the app vs the website (native feel)
Controlled in [`src/hooks/useNativeApp.jsx`](./src/hooks/useNativeApp.jsx) and [`src/layout/RootLayout.jsx`](./src/layout/RootLayout.jsx):
- Desktop `Navbar`, big `Footer`, and floating chat bubbles are hidden.
- A native-style bottom tab bar (`Bottomnav.jsx`) is shown, with safe-area padding.
- White status bar with dark icons; splash screen hidden after load.
- Android hardware **back button** navigates back / minimizes (instead of closing).

## Push notifications (FCM)
- Client: [`src/hooks/usePushNotifications.jsx`](./src/hooks/usePushNotifications.jsx)
- Backend: `POST /api/push/token` (store device token), `POST /api/push/test` (admin),
  and a reusable `sendPush({tokens,title,body,data})` helper in
  `back-end/controllers/pushController.js`.
- **Requires** `android/app/google-services.json` from the Firebase console
  (project settings → add Android app `com.salambd.app`). Without it the app
  still builds; push just won't fire.
- Notification icon: `res/drawable-*/ic_stat_notify.png` (white silhouette),
  registered in `AndroidManifest.xml`.

## Signing & release build
- Upload keystore: `android/salambd-upload-key.jks` (**gitignored** — back it up!)
- Credentials: `android/keystore.properties` (**gitignored**)
- Gradle auto-signs release builds when `keystore.properties` is present.

Build the store bundle (`.aab`):
```bash
cd client && npm run build && npx cap sync android
cd android
# JAVA_HOME must point to a JDK 17+ (Android Studio bundles one at:
#   C:/Program Files/Android/Android Studio/jbr )
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```
Or in Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**.

## ⚠️ Back these up somewhere safe (losing them = can't update the app)
- `android/salambd-upload-key.jks`
- the keystore password (in `android/keystore.properties`)
