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


const RootLayout = () => {
  const { pathname } = useLocation();

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
            strip stays visible on scroll instead of being covered by the navbar */}
        <div className="sticky top-0 z-50">
          <Topbar />
          <Navbar />
        </div>
        {/* <BottomNav /> */}

        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>

        <Footer />
        <FloatingActions />
      </div>
    </CartProvider>
  );
};

export default RootLayout;