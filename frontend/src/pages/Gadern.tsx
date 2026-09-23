import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// /infos/gelaende/gadern - one of the 10 Gelände detail pages, now its own
// dedicated page + admin editor with real structured fields (Eckdaten,
// Routenplaner, image, address, PDF download, the two long free-text
// sections, map) instead of one raw HTML blob an admin could only edit as
// a giant wall of markup. See GadernContentEditor.tsx.

interface EckdatenRow { label: string; value: string }

interface GadernData {
  title: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  mainImage: string;
  addressHeading: string;
  addressText: string;
  gasthausText: string;
  pdfUrl: string;
  pdfLabel: string;
  parkenHeading: string;
  parkenText: string;
  zumStartplatzHeading: string;
  zumStartplatzText: string;
  besonderheitenHeading: string;
  besonderheitenText: string;
  tagesgebuehrHeading: string;
  tagesgebuehrText: string;
  richtwerteHeading: string;
  richtwerteText: string;
  beschaedigungenHeading: string;
  beschaedigungenText: string;
  mapEmbedUrl: string;
}

const DEFAULT_CONTENT: GadernData = {
  title: 'Gadern',
  eckdatenRows: [
    { label: 'Ausrichtung', value: 'Nord-Ost' },
    { label: 'Windspektrum', value: '30° - 100°' },
    { label: 'Höhendifferenz', value: '50 Meter' },
    { label: 'Geländehalter', value: 'Lindenfelser Gleitschirmflieger' },
  ],
  routenplanerUrl: 'https://maps.app.goo.gl/12mDeygznMrRL3da8?g_st=aw',
  mainImage: '/images/1-gelaende/gadern.JPG',
  addressHeading: 'Adresse/ Anfahrt',
  addressText: '69483 Wald-Michelbach<br />Ortsteil Gadern',
  gasthausText: 'Gasthaus Bergblick; Stallenkandel 5; 69483 Wald-Michelbach (GPS: 49°34´41.08´´ Nord 8°48´01,16´´ Ost)',
  pdfUrl: '/pdf/Gelaendebeschreibung%20Gadern.pdf',
  pdfLabel: 'Download Infos & Geländebeschreibung',
  parkenHeading: 'Parken am Bergblick:',
  parkenText: 'Die Autos sollen auf dem Hof des Gasthauses geparkt werden. Ihr fahrt am Gasthaus vorbei in die Einfahrt nach unten bis zum Parkplatz. Der Parkplatz vor dem Gasthaus und gegenüber auf der Straße muss für die Tagesgäste frei bleiben.',
  zumStartplatzHeading: 'Vom Bergblick zum Startplatz:',
  zumStartplatzText: 'Vom Gasthaus Bergblick die Hauptstraße wieder ca. 200 Meter bergab laufen. Dort führt ein Teerweg scharf rechts ab. Diesem ca. 500 Meter bis auf die Kuppe folgen. Auf der Kuppe links und nach 100 Metern seht ihr rechts den Startplatz (GPS: 49°34´55.58´´ Nord 8°48´17,76´´ Ost)',
  besonderheitenHeading: 'Besonderheiten/ Gefahrenquellen:',
  besonderheitenText: 'Am Vormittag nach anfangs ruhigen Flugbedingungen kann der Wind sehr schnell aufleben. Beim Aufziehen vom Gleitschirm bei stärkerem Wind kann der Schirm in den hinteren Stacheldrahtzaun geraten. Der Pilotentransport wird vom Gasthaus Bergblick aus organisiert. Maximal 3 Autos am Startplatz mit sichtbarer Auffahrgenehmigung an der Windschutzscheibe. Bei Weidebetrieb ist der Übungshang gesperrt. Die Landung erfolgt seitlich am Hang (Besonderheiten Hanglandetechnik) Stärkerer Wind von rechts verursacht ein Leegebiet hinter dem Wäldchen auf der rechten Seite vom Übungshang - Es muss eine zweite Person beim Flugbetrieb anwesend sein.',
  tagesgebuehrHeading: 'Tagesgebühr:',
  tagesgebuehrText: '€ 2. - für alle Piloten und Flugschüler!!! Siehe Kiste im Startbereich.',
  richtwerteHeading: 'Richtwerte für Flüge mit dem L-Schein:',
  richtwerteText: 'Windrichtung zwischen 360° und 90°; Windgeschwindigkeit im Durchschnitt kleiner 10 km/h; Spitzen kleiner 15 km/h. Windwerte Melibokus: Tel. 06251/983612',
  beschaedigungenHeading: 'Beschädigungen am Viehzaun:',
  beschaedigungenText: 'Sollten irgendwelche Beschädigungen am Zaun entstanden sein, bitte unbedingt bei Familie Jöst; Gadener Straße 20 in 69483 Wald-Michelbach Ortsteil Gadern melden. Der Elektrozaun funktioniert dann oft nicht mehr (Erdung), was in der Vergangenheit schon viel Ärger und unnötige Arbeit ergab.',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7409.279975444094!2d8.797092468679566!3d49.58047520194445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4797dd93b3e5ef8b%3A0xf41240f507c38b86!2sBergblick!5e1!3m2!1sde!2sde!4v1588789820942!5m2!1sde!2sde',
};

export const Gadern = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<GadernData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'gadern'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Gadern content:', err));
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
              <div className="mb-6 bg-[#FAF9F7] border border-gray-100 rounded-sm p-5">
                <p className="font-semibold text-gray-800 mb-2">Eckdaten</p>
                <div className="space-y-1">
                  {content.eckdatenRows.map((row, i) => (
                    <p key={i}>
                      <span className="font-medium text-gray-700">{row.label}:</span> {row.value}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer">
                  <img src="/images/Google_Routenplaner_Maps_org.gif" alt="Google Routenplaner Maps org" width={120} height={90} />
                </a>
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer" className="text-[#428bca] hover:text-[#2a6496] underline font-medium">
                  Routenplaner für Smartphones
                </a>
              </div>

              {content.mainImage && (
                <img src={content.mainImage} alt={content.title} className="w-full rounded-sm my-4" />
              )}

              <p className="mb-2">
                <strong className="text-gray-800 font-semibold">{content.addressHeading}:</strong>
                <br />
                <SafeHtml html={content.addressText} className="inline" />
              </p>
              <p className="mb-4">{content.gasthausText}</p>

              <a
                href={content.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-luxury-gold text-white no-underline px-5 py-2.5 rounded-sm font-semibold my-2 hover:opacity-90 transition-opacity"
              >
                {content.pdfLabel}
              </a>

              <div className="mt-4">
                <p><strong className="text-gray-800 font-semibold">{content.parkenHeading}</strong></p>
                <p>{content.parkenText}</p>
              </div>

              <div className="mt-4">
                <p><strong className="text-gray-800 font-semibold">{content.zumStartplatzHeading}</strong></p>
                <p>{content.zumStartplatzText}</p>
              </div>

              <div className="mt-4">
                <p><strong className="text-gray-800 font-semibold">{content.besonderheitenHeading}</strong></p>
                <p>{content.besonderheitenText}</p>
              </div>

              <div className="mt-4">
                <p><strong className="text-gray-800 font-semibold">{content.tagesgebuehrHeading}</strong></p>
                <p>{content.tagesgebuehrText}</p>
              </div>

              <div className="mt-4">
                <p><strong className="text-gray-800 font-semibold">{content.richtwerteHeading}</strong></p>
                <p>{content.richtwerteText}</p>
              </div>

              <div className="mt-4">
                <p><strong className="text-gray-800 font-semibold">{content.beschaedigungenHeading}</strong></p>
                <p>{content.beschaedigungenText}</p>
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
                  loading="lazy"
                  allowFullScreen
                  title={`Fluggelände ${content.title}`}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
