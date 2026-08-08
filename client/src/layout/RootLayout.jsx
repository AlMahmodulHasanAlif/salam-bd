import React, { useEffect, Suspense } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';
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
  const navType = useNavigationType();

  // Set up native-app behavior (status bar, splash, hardware back button).
  // No-op on the web.
  useNativeApp();

  // Register for push notifications (FCM) and handle taps. No-op on the web.
  usePushNotifications();

  // Scroll to the top only for new (forward) navigations. On Back/Forward
  // (POP) leave the scroll alone so the browser restores the position the
  // user was at — otherwise pressing Back dumps them at the top/footer.
  useEffect(() => {
    if (navType === "POP") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, navType]);

  useEffect(() => {
    GTM.pageView(pathname);
  }, [pathname]);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">

        {/* Header — Topbar + Navbar scroll away with the page content. */}
        <div>
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