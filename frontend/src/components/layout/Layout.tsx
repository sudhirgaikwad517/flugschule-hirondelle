import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieConsent } from '../common/CookieConsent';

export const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <Header />
      
      <main className="flex-grow w-full pt-[80px]">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};
