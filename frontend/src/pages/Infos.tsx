import { useState, useEffect } from 'react';
import { Banner } from '../components/common/Banner';

// Fallbacks match the page's current live copy exactly, so nothing changes
// visually until an admin edits something in Admin > Seiten > Infos / Kontakt
// (see backend SitePageContent model / sitePageContent.routes.ts). Only
// text/links are dynamic here - the layout/CSS stays fixed.
const DEFAULT_CONTENT = {
  companyName: 'Flugschule Hirondelle',
  shopLabel: 'Shop / Theorieraum',
  shopStreet: 'Untergasse 27',
  shopCity: '69469 Weinheim',
  outpostLabel: 'Außenstelle Landau',
  outpostStreet: 'Am Birnbach 6',
  outpostCity: '76829 Landau',
  phone: '+49 (0)6201 8452097',
  email: 'info@fs-hirondelle.de',
  openingHours: 'nach Vereinbarung',
  openingHoursNote: '(Wird per Newsletter bekannt gegeben)',
  parkingNote: 'Die Parkplätze im Hof der Flugschule sind ausschließlich den Anwohnern vorbehalten. Bitte umliegend in den Straßen parken – Danke!',
  bankAccountHolder: 'Alexander Schlink',
  bankName: 'Sparkasse Südpfalz',
  iban: 'DE32 5485 0010 1700 1976 41',
  bic: 'SOLADES1SUW',
  accountNumber: '1700197641',
  bankCode: '54850010',
  routenplanerUrl: 'https://maps.app.goo.gl/kA2dQXfCx8pgAAJ99',
  mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5063.258024241909!2d8.672182056413131!3d49.555676284748415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4797db13e510f3f5%3A0xd6abf4967e8663e9!2sFlugschule%20Hirondelle!5e1!3m2!1sde!2sde!4v1588792949558!5m2!1sde!2sde',
};

export const Infos = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'infos'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Infos content:', err));
  }, [contentId]);

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
                <p className="font-luxury text-xl text-luxury-dark mb-3">{content.companyName}</p>
                <p className="font-semibold text-gray-700 mb-2 uppercase tracking-widest text-[11px]">{content.shopLabel}</p>
                <p>{content.shopStreet}</p>
                <p>{content.shopCity}</p>
              </div>

              <div className="flex flex-col items-start mt-2">
                {/* Old site's actual route-planner badge (Google_Routenplaner_Maps_org.gif)
                    and its real short link, not a fabricated "Map" square
                    pointing at a generic maps search. */}
                <a href={content.routenplanerUrl} target="_blank" rel="noreferrer">
                  <img src="/images/infos/google-routenplaner.gif" alt="Google Routenplaner Maps org" width="120" height="90" />
                </a>
                <a href={content.routenplanerUrl} target="_blank" rel="noreferrer" className="text-[13px] text-[#428bca] hover:text-[#2a6496] hover:underline mt-2 font-bold">
                  Routenplaner für Smartphones
                </a>
              </div>
            </div>

            <div className="text-[15px] text-gray-500 font-light leading-relaxed mb-10">
              <p className="font-semibold text-gray-700 mb-2 uppercase tracking-widest text-[11px]">{content.outpostLabel}</p>
              <p>{content.outpostStreet}</p>
              <p>{content.outpostCity}</p>
            </div>

            <div className="text-[15px] text-gray-500 font-light leading-relaxed mb-12">
              <p>Telefon: <span className="text-gray-700">{content.phone}</span></p>
              <p>E-Mail: <a href={`mailto:${content.email}`} className="text-[#428bca] hover:text-[#2a6496] hover:underline font-bold">{content.email}</a></p>
            </div>

            <h3 className="font-luxury text-2xl text-luxury-dark mb-4">Öffnungszeiten</h3>
            <div className="text-[15px] text-gray-500 font-light leading-relaxed mb-10">
              <p>{content.openingHours}</p>
              <p className="text-[13px] italic">{content.openingHoursNote}</p>
            </div>

            <div className="flex items-start gap-4 mb-12 bg-luxury-light p-6 rounded-sm border-l-2 border-luxury-gold shadow-sm">
              <div className="w-10 h-10 bg-transparent text-luxury-gold border border-luxury-gold flex items-center justify-center font-luxury text-2xl shrink-0 rounded-full">
                P
              </div>
              <p className="text-[14px] text-gray-600 font-light leading-relaxed mt-1">
                {content.parkingNote}
              </p>
            </div>

            <h3 className="font-luxury text-2xl text-luxury-dark mb-4">Bankverbindung</h3>
            <div className="text-[15px] text-gray-500 font-light leading-relaxed bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
              <p className="mb-2"><span className="text-gray-400 w-32 inline-block">Kontoinhaber:</span> <span className="text-gray-700 font-medium">{content.bankAccountHolder}</span></p>
              <p className="mb-2 text-gray-700">{content.bankName}</p>
              <p className="mb-2"><span className="text-gray-400 w-32 inline-block">IBAN:</span> <span className="text-gray-700 font-medium tracking-wide">{content.iban}</span></p>
              <p className="mb-4"><span className="text-gray-400 w-32 inline-block">BIC:</span> <span className="text-gray-700 tracking-wide">{content.bic}</span></p>
              <p className="mb-2 text-[13px] text-gray-400"><span className="w-32 inline-block">Kontonummer:</span> {content.accountNumber}</p>
              <p className="text-[13px] text-gray-400"><span className="w-32 inline-block">Bankleitzahl:</span> {content.bankCode}</p>
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
                src={content.mapsEmbedUrl}
                width="100%"
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Flugschule Hirondelle Weinheim Location"
                className="absolute inset-0"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
