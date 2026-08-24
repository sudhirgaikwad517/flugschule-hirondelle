import React from 'react';
import { Banner } from '../components/common/Banner';

export const Infos = () => {
  return (
    <div className="w-full bg-white pb-20">
      <Banner />

      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        {/* Main Title */}
        <div className="text-center mb-20 mt-8">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide uppercase">
            INFOS
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Kontakt */}
          <div className="w-full lg:w-1/2">
            <h2 className="font-luxury text-3xl text-luxury-dark mb-4 tracking-wide uppercase" id="kontakt">
              KONTAKT
            </h2>
            <div className="w-12 h-px bg-luxury-gold mb-10"></div>

            <div className="flex flex-col md:flex-row gap-12 mb-12">
              <div className="text-[15px] text-gray-500 font-light leading-relaxed">
                <p className="font-luxury text-xl text-luxury-dark mb-3">Flugschule Hirondelle</p>
                <p className="font-semibold text-gray-700 mb-2 uppercase tracking-widest text-[11px]">Shop / Theorieraum</p>
                <p>Untergasse 27</p>
                <p>69469 Weinheim</p>
              </div>

              <div className="flex flex-col items-start mt-2">
                <a href="https://maps.google.com/?q=Untergasse+27+69469+Weinheim" target="_blank" rel="noreferrer" className="flex flex-col items-center group">
                  <div className="w-16 h-16 bg-luxury-light rounded-sm shadow-sm border border-luxury-gold flex items-center justify-center mb-3 group-hover:bg-luxury-gold transition-colors duration-300">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full border border-luxury-gold group-hover:border-white flex items-center justify-center transition-colors duration-300">
                        <span className="text-[10px] font-bold text-luxury-gold group-hover:text-white uppercase tracking-wider transition-colors duration-300">Map</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-luxury-gold text-center font-bold uppercase tracking-widest group-hover:text-luxury-dark transition-colors duration-300">Routenplaner</span>
                </a>
              </div>
            </div>

            <div className="text-[15px] text-gray-500 font-light leading-relaxed mb-10">
              <p className="font-semibold text-gray-700 mb-2 uppercase tracking-widest text-[11px]">Außenstelle Landau</p>
              <p>Am Birnbach 6</p>
              <p>76829 Landau</p>
            </div>

            <div className="text-[15px] text-gray-500 font-light leading-relaxed mb-12">
              <p>Telefon: <span className="text-gray-700">+49 (0)6201 8452097</span></p>
              <p>E-Mail: <a href="mailto:info@fs-hirondelle.de" className="text-luxury-gold hover:underline">info@fs-hirondelle.de</a></p>
            </div>

            <h3 className="font-luxury text-2xl text-luxury-dark mb-4">Öffnungszeiten</h3>
            <div className="text-[15px] text-gray-500 font-light leading-relaxed mb-10">
              <p>nach Vereinbarung</p>
              <p className="text-[13px] italic">(Wird per Newsletter bekannt gegeben)</p>
            </div>

            <div className="flex items-start gap-4 mb-12 bg-luxury-light p-6 rounded-sm border-l-2 border-luxury-gold shadow-sm">
              <div className="w-10 h-10 bg-transparent text-luxury-gold border border-luxury-gold flex items-center justify-center font-luxury text-2xl shrink-0 rounded-full">
                P
              </div>
              <p className="text-[14px] text-gray-600 font-light leading-relaxed mt-1">
                Die Parkplätze im Hof der Flugschule sind ausschließlich den Anwohnern vorbehalten. Bitte umliegend in den Straßen parken – Danke!
              </p>
            </div>

            <h3 className="font-luxury text-2xl text-luxury-dark mb-4">Bankverbindung</h3>
            <div className="text-[15px] text-gray-500 font-light leading-relaxed bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
              <p className="mb-2"><span className="text-gray-400 w-32 inline-block">Kontoinhaber:</span> <span className="text-gray-700 font-medium">Alexander Schlink</span></p>
              <p className="mb-2"><span className="text-gray-400 w-32 inline-block">Bank:</span> <span className="text-gray-700">Sparkasse Südpfalz</span></p>
              <p className="mb-2"><span className="text-gray-400 w-32 inline-block">IBAN:</span> <span className="text-gray-700 font-medium tracking-wide">DE32 5485 0010 1700 1976 41</span></p>
              <p className="mb-4"><span className="text-gray-400 w-32 inline-block">BIC:</span> <span className="text-gray-700 tracking-wide">SOLADES1SUW</span></p>
              <p className="mb-2 text-[13px] text-gray-400"><span className="w-32 inline-block">Kontonummer:</span> 1700197641</p>
              <p className="text-[13px] text-gray-400"><span className="w-32 inline-block">Bankleitzahl:</span> 54850010</p>
            </div>
          </div>

          {/* Right Column: Standorte (Map) */}
          <div className="w-full lg:w-1/2">
            <h2 className="font-luxury text-3xl text-luxury-dark mb-4 tracking-wide uppercase" id="standorte">
              STANDORTE
            </h2>
            <div className="w-12 h-px bg-luxury-gold mb-10"></div>
            
            <div className="w-full h-[600px] bg-gray-100 rounded-sm shadow-md overflow-hidden relative border border-gray-200">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2595.660155239922!2d8.6657929!3d49.5446328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4797cf9286eb2973%3A0x1d5821cba50ef12!2sUntergasse%2027%2C%2069469%20Weinheim%2C%20Germany!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Flugschule Hirondelle Weinheim Location"
                className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-1000"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
