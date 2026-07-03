import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import CartProvider from '../context/CartProvider';
import BottomNav from '../components/Bottomnav';
import FloatingActions from '../components/FloatingActions';
import FooterContactStrip from '../components/FooterContactStrip';
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
        <Topbar />
        <Navbar />
        {/* <BottomNav /> */}
        
        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
        <FloatingActions />
      </div>
    </CartProvider>
  );
};

export default RootLayout;