import React, { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';

declare global {
  interface Window {
    xProductBrowser?: (...args: string[]) => void;
  }
}

export const Shop = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ecwid-config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load Ecwid config', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!config) return;
    
    const storeId = config.storeId || "35710010";

    const loadEcwid = () => {
      if (window.xProductBrowser) {
        window.xProductBrowser(
          `categoriesPerRow=${config.productsPerRowGrid || 3}`,
          `views=grid(${config.productsPerPageGrid || 20},${config.productsPerRowGrid || 3}) list(60) table(60)`,
          "categoryView=grid",
          "searchView=list",
          `id=my-store-${storeId}`
        );
      }
    };

    // Avoid loading the script multiple times
    if (document.getElementById('ecwid-script')) {
      loadEcwid();
      return;
    }

    const script = document.createElement('script');
    script.id = 'ecwid-script';
    script.type = 'text/javascript';
    script.src = `https://app.ecwid.com/script.js?${storeId}&data_platform=code&data_pb_classes=1`;
    script.charset = 'utf-8';
    script.setAttribute('data-cfasync', 'false');

    script.onload = loadEcwid;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('ecwid-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [config]);

  if (loading) {
    return (
      <div className="w-full bg-[#FAF9F7] pb-20 min-h-screen">
        <Banner />
        <div className="text-center text-gray-500 py-20 flex flex-col items-center gap-4">
           <div className="w-8 h-8 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
           <p>Konfiguration wird geladen...</p>
        </div>
      </div>
    );
  }

  const storeId = config?.storeId || "35710010";

  return (
    <div className="w-full bg-[#FAF9F7] pb-20 min-h-screen">
      <Banner />
      
      <div className="container mx-auto px-4 max-w-[1200px] mt-8 mb-4">
        {/* Main Title */}
        <div className="text-center mb-16 mt-8 animate-fade-in">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide uppercase">
            SHOP
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto"></div>
        </div>

        {/* Ecwid Store Container */}
        <div id={`my-store-${storeId}`} className="w-full">
          {/* Ecwid will dynamically inject the shop HTML here */}
          <div className="text-center text-gray-500 py-20 flex flex-col items-center gap-4">
             <div className="w-8 h-8 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
             <p>Shop wird geladen...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
