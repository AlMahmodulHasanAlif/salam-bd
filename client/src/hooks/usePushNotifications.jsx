// src/hooks/usePushNotifications.jsx
//
// Registers the device with Firebase Cloud Messaging (FCM) and handles incoming
// notifications. No-op on the web — only runs inside the native app.
import { useEffect } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import useAuth from "./useAuth";

const isNative = Capacitor.isNativePlatform();

// Injected by Vite (see vite.config.js): true only when
// android/app/google-services.json exists at build time. Calling
// PushNotifications.register() without Firebase configured crashes natively,
// so this flag keeps push off until the Firebase file is added.
const PUSH_ENABLED =
  typeof __PUSH_ENABLED__ !== "undefined" && __PUSH_ENABLED__;

export default function usePushNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isNative || !PUSH_ENABLED) return;

    let cleanup = [];

    (async () => {
      // 1) Ask for permission (Android 13+ shows a system prompt).
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === "prompt") {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive !== "granted") return; // user declined — stop quietly

      // 2) Register with FCM. Triggers the "registration" event with the token.
      await PushNotifications.register();

      // 3) Got the device token → send it to the backend so it can push to us.
      const reg = await PushNotifications.addListener("registration", async (token) => {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/push/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: token.value,
              platform: "android",
              uid: user?.uid || null,
            }),
          });
        } catch {
          // Backend endpoint optional — you can still test via Firebase Console
          // using the token below.
        }
        // Handy for testing: copy this from `npx cap run` / Logcat.
        console.log("[push] FCM token:", token.value);
      });

      const regErr = await PushNotifications.addListener("registrationError", (err) => {
        console.error("[push] registration error:", err?.error);
      });

      // 4) Notification arrives while the app is OPEN (Android won't show a
      //    system tray notification in this case) — surface it as a toast.
      const recv = await PushNotifications.addListener(
        "pushNotificationReceived",
        (n) => {
          const title = n?.title || n?.notification?.title;
          const body = n?.body || n?.notification?.body;
          if (title || body) toast(`${title ?? ""}\n${body ?? ""}`.trim());
        }
      );

      // 5) User TAPPED a notification → deep-link if the payload carries a path.
      const action = await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (event) => {
          const path = event?.notification?.data?.url;
          if (path) navigate(path);
        }
      );

      cleanup = [reg, regErr, recv, action];
    })();

    return () => {
      cleanup.forEach((h) => h?.remove?.());
    };
    // Re-run if the logged-in user changes so the token is linked to the account.
  }, [navigate, user?.uid]);
}
