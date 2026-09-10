import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieConsent } from '../common/CookieConsent';

export const Layout = () => {
  const { pathname, hash } = useLocation();

  // useLayoutEffect (not useEffect) so this runs before the browser paints
  // the new route - otherwise, navigating from far down a long page (e.g.
  // a footer link) briefly paints the new, usually shorter, page's DOM at
  // the OLD scroll position first, which can land at or past that page's
  // own footer before the reset kicks in on the next frame - looking like
  // the new page opened "below" the footer with the old page's tail still
  // visible above it.
  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

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
  }, [pathname, hash]);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <Header />
      
      <main className="flex-grow w-full pt-[40px]">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};
