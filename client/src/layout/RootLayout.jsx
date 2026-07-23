import React, { useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import CartProvider from '../context/CartProvider';
import BottomNav from '../components/Bottomnav';
import FloatingActions from '../components/FloatingActions';
import RouteFallback from '../components/RouteFallback';
import { GTM } from '../utils/gtm';
import useNativeApp, { isNative } from '../hooks/useNativeApp';
import usePushNotifications from '../hooks/usePushNotifications';


const RootLayout = () => {
  const { pathname } = useLocation();

  // Set up native-app behavior (status bar, splash, hardware back button).
  // No-op on the web.
  useNativeApp();

  // Register for push notifications (FCM) and handle taps. No-op on the web.
  usePushNotifications();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    GTM.pageView(pathname);
  }, [pathname]);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">

        {/* Sticky header — Topbar + Navbar move together so the PC cart/account
            strip stays visible on scroll instead of being covered by the navbar.
            In the native app the desktop Navbar row is dropped (the Topbar already
            carries search/cart/menu on mobile widths). */}
        <div className="sticky top-0 z-50">
          <Topbar />
          {!isNative && <Navbar />}
        </div>

        {/* In the app, reserve room at the bottom so content clears the fixed
            tab bar (plus the Android gesture-bar safe area). */}
        <main
          className="flex-1"
          style={isNative ? { paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' } : undefined}
        >
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>

        {/* Web-only chrome: big footer + floating chat bubbles. The app uses a
            native-style bottom tab bar instead. */}
        {!isNative && <Footer />}
        {!isNative && <FloatingActions />}
        {isNative && <BottomNav />}
      </div>
    </CartProvider>
  );
};

export default RootLayout;