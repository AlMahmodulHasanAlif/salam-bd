// src/hooks/useNativeApp.jsx
//
// One-stop native-app behavior. Everything here is a no-op in a normal browser,
// so the same codebase runs on the web and inside the Capacitor Android app.
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

// True only when the code is running inside the native app (not a mobile browser).
// Import this anywhere you want to render app-specific UI.
export const isNative = Capacitor.isNativePlatform();

export default function useNativeApp() {
  useEffect(() => {
    if (!isNative) return;

    // --- Status bar -------------------------------------------------------
    // overlays:false reserves the status-bar strip so our white header isn't
    // hidden behind the clock/battery. White background + dark icons matches
    // the light header. (In Capacitor, Style.Light = dark icons on a light bar.)
    StatusBar.setOverlaysWebView({ overlays: false }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#ffffff" }).catch(() => {});
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});

    // --- Splash screen ----------------------------------------------------
    // React has painted by now, so drop the native launch screen.
    SplashScreen.hide().catch(() => {});

    // --- Android hardware back button ------------------------------------
    // Default Capacitor behavior on "back" from any screen is to close the app,
    // which feels broken. Instead: go back in history if we can, otherwise
    // minimize (send to background) like a normal Android app.
    const backSub = CapApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack && window.history.length > 1) {
        window.history.back();
      } else {
        CapApp.minimizeApp();
      }
    });

    return () => {
      backSub.then((s) => s.remove()).catch(() => {});
    };
  }, []);
}
