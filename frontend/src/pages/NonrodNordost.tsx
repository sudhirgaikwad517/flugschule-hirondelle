import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// /infos/gelaende/nonrod-nordost - one of the 10 Gelände detail pages,
// rebuilt from a single raw-HTML blob into real structured fields (see
// GelaendeArticleContentEditor.tsx's old shared factory, now replaced by
// this page's own dedicated NonrodNordostContentEditor.tsx) so an admin can
// edit the Eckdaten/Routenplaner/Adresse/Parkplatz/map pieces individually
// instead of one unreadable HTML textarea.

interface EckdatenRow { label: string; value: string }

interface NonrodNordostData {
  title: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  addressHeading: string;
  addressText: string;
  parkplatzHeading: string;
  parkplatzText: string;
  mapEmbedUrl: string;
}

const DEFAULT_CONTENT: NonrodNordostData = {
  title: 'Nonrod Nordost',
  eckdatenRows: [
    { label: 'Ausrichtung', value: 'Nordost' },
    { label: 'Windspektrum', value: '10° bis 60°' },
    { label: 'Höhendifferenz', value: '31 Meter' },
    { label: 'Geländehalter', value: 'Flugschule Hirondelle' },
  ],
  routenplanerUrl: 'https://maps.app.goo.gl/TuBxGE89oS9MJRqKA?g_st=aw',
  addressHeading: 'Adresse/ Anfahrt',
  addressText: '64405 Fischbachtal<br />Ortsteil Nonrod',
  parkplatzHeading: 'Parkplatz:',
  parkplatzText: 'Das Material kann am Fluggelände abgeladen werden.<br />Geparkt wird am Rast-und Parkplatz Nonroder Höhe (GPS ´49°45´21,15´´ 8°49´45,15´´) <br /><br />Wegbeschreibung: An der Haselnussgruppe auf dem Höhenweg weiter Richtung Norden fahren. Nach ca. 200 Meter kommt der Parkplatz auf der rechten Seite.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4451.539088793464!2d8.821831558418785!3d49.75005980309465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd61cb2b29affb%3A0xcf99bf11be67ae85!2sNonroder%20H%C3%B6he!5e1!3m2!1sde!2sde!4v1588790674160!5m2!1sde!2sde',
};

export const NonrodNordost = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<NonrodNordostData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'nonrod-nordost'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Nonrod Nordost content:', err));
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

          <div className="flex flex-wrap items-start gap-8">
            {/* Content column */}
            <div className="flex-1 basis-full md:basis-[calc(58.3333%-1rem)] text-[15px] text-gray-600 font-light leading-relaxed">
              <p className="mb-6">
                <strong className="text-gray-800 font-semibold">Eckdaten:</strong>
                <br />
                {content.eckdatenRows.map((row, i) => (
                  <span key={i}>
                    {row.label}: {row.value}
                    <br />
                  </span>
                ))}
              </p>

              <div className="flex items-center gap-3 mb-6">
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer">
                  <img src="/images/Google_Routenplaner_Maps_org.gif" alt="Google Routenplaner Maps org" width="120" height="90" />
                </a>
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer" className="text-[#428bca] underline font-bold hover:text-[#2a6496]">
                  Routenplaner für Smartphones
                </a>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">{content.addressHeading}:</p>
                <SafeHtml html={content.addressText} />
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">{content.parkplatzHeading}</p>
                <SafeHtml html={content.parkplatzText} />
              </div>
            </div>

            {/* Map column */}
            <div className="flex-1 basis-full md:basis-[calc(41.6667%-1rem)]">
              <div className="w-full aspect-[4/3] rounded-sm shadow-md overflow-hidden">
                <iframe
                  src={content.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Nonrod Nordost Karte"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
