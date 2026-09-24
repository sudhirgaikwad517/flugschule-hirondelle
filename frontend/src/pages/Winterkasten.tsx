import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// Own dedicated page for the "Winterkasten" Gelände detail article
// (/infos/gelaende/winterkasten) - replaces the old single-raw-HTML-blob
// version (was part of the shared GelaendeArticlePage.tsx factory) with
// real structured fields, same "own page, own admin editor, own
// Duplizieren/Titel/URL settings" pattern as every other page converted
// this session. Content/map sit side by side via CSS grid instead of the
// old injected-Bootstrap-HTML approach.

interface EckdatenRow {
  label: string;
  value: string;
}

interface WinterkastenData {
  title: string;
  warningBanner: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  addressHeading: string;
  addressText: string;
  pdfUrl: string;
  pdfLabel: string;
  parkplatzHeading: string;
  parkplatzText: string;
  vomParkplatzHeading: string;
  vomParkplatzText: string;
  mapEmbedUrl: string;
}

const DEFAULT_CONTENT: WinterkastenData = {
  title: 'Winterkasten',
  warningBanner: 'Flugbetrieb nur bei Anwesenheit der Flugschule!',
  eckdatenRows: [
    { label: 'Ausrichtung', value: 'Südost-Süd' },
    { label: 'Windspektrum', value: '120° bis 180°' },
    { label: 'Höhendifferenz', value: '80 Meter' },
    { label: 'Geländehalter', value: 'Flugschule Hirondelle' },
  ],
  routenplanerUrl: 'http://maps.apple.com/?q=%2049.699875,%208.791619',
  addressHeading: 'Adresse/ Anfahrt',
  addressText: '64678 Lindenfels<br />Ortsteil Winterkasten',
  pdfUrl: '/pdf/Gelaendebeschreibung%20Winterkasten.pdf',
  pdfLabel: 'Download Infos & Geländebeschreibung',
  parkplatzHeading: 'Parkplatz:',
  parkplatzText: 'Bismarckturmstraße 7, 64678<br />Lindenfels Ortsteil Winterkasten<br />GPS N 49°41´59,31´´ O 08°47´29,71´´',
  vomParkplatzHeading: 'Vom Parkplatz zum Fluggelände:',
  vomParkplatzText: 'Die Bismarckturmstraße ca. 100 Meter weiter bis zur Hauptstraße laufen. Dort links und nach 50 Meter rechts in den Laudenauer Weg. Nach ca. 100 Meter<br />links den Feldweg zum Startplatz GPS N 49°42´06,07´´ O 08°47´47.18´´laufen.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8460.761300862583!2d8.787677443086652!3d49.70014901142218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd61cf3112d683%3A0x92442aec10e628fa!2sBismarckturmstra%C3%9Fe%207%2C%2064678%20Lindenfels!5e1!3m2!1sde!2sde!4v1588790846657!5m2!1sde!2sde',
};

export const Winterkasten = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<WinterkastenData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'winterkasten'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Winterkasten content:', err));
  }, [contentId]);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="mb-10">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              {content.title}
            </h1>
            <div className="w-24 h-px bg-luxury-gold"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 items-start">
            {/* Content column */}
            <div className="text-[15px] text-gray-600 font-light leading-relaxed">
              {content.warningBanner && (
                <div className="mb-6 px-5 py-4 border-2 border-luxury-gold bg-luxury-gold/10 rounded-sm">
                  <p className="font-luxury text-xl md:text-2xl text-luxury-dark font-semibold">{content.warningBanner}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-gray-800 font-semibold mb-1">Eckdaten:</p>
                {content.eckdatenRows.map((row, i) => (
                  <p key={i} className="mb-0">{row.label}: {row.value}</p>
                ))}
              </div>

              <div className="mb-4 flex items-center gap-3">
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer">
                  <img src="/images/Google_Routenplaner_Maps_org.gif" alt="Google Routenplaner Maps org" width={120} height={90} />
                </a>
                <a
                  href={content.routenplanerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#428bca] underline font-bold hover:text-[#2a6496]"
                >
                  Routenplaner für Smartphones
                </a>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 font-semibold mb-1">{content.addressHeading}</p>
                <SafeHtml html={content.addressText} />
              </div>

              {content.pdfUrl && (
                <a
                  href={content.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-luxury-gold text-white no-underline px-5 py-2.5 rounded-sm font-semibold my-2 hover:opacity-90"
                >
                  {content.pdfLabel}
                </a>
              )}

              <div className="mb-4 mt-4">
                <p className="text-gray-800 font-semibold mb-1">{content.parkplatzHeading}</p>
                <SafeHtml html={content.parkplatzText} />
              </div>

              <div className="mb-4">
                <p className="text-gray-800 font-semibold mb-1">{content.vomParkplatzHeading}</p>
                <SafeHtml html={content.vomParkplatzText} />
              </div>
            </div>

            {/* Map column */}
            <div>
              <iframe
                src={content.mapEmbedUrl}
                className="w-full aspect-[4/3] max-w-full rounded-sm shadow-md"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                title={`Karte ${content.title}`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
