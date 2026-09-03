import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieConsent } from '../common/CookieConsent';

export const Layout = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a tick for the target page's content to mount before scrolling to it.
      const id = hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo(0, 0);
      }, 50);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

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
