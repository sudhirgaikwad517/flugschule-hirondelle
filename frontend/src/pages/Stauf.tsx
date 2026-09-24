import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// Own page, own SitePageContent kind ('stauf') - structured fields (Eckdaten
// rows, Routenplaner link, address/parking blocks, images, bullet lists,
// map embed URL) instead of one raw HTML blob, same as every other page
// converted this session. See admin/StaufContentEditor.tsx for the matching
// editor.

interface EckdatenRow { label: string; value: string }

interface StaufData {
  title: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  mainImage: string;
  addressHeading: string;
  parkplatzHeading: string;
  parkplatzText: string;
  startplatzHeading: string;
  startplatzText: string;
  routeImage: string;
  achtungHtml: string;
  besonderheitenHeading: string;
  besonderheiten: string[];
  richtwerteHeading: string;
  richtwerte: string[];
  wetterstationenHeading: string;
  wetterstationenText: string;
  mapEmbedUrl: string;
}

const DEFAULT_CONTENT: StaufData = {
  title: 'Stauf',
  eckdatenRows: [
    { label: 'Ausrichtung', value: 'Südost' },
    { label: 'Windspektrum', value: '90° bis 190°' },
    { label: 'Höhendifferenz', value: '70 Meter' },
    { label: 'Geländehalter', value: 'Fliegergemeinschaft Stauf e.V.' },
  ],
  routenplanerUrl: 'https://maps.app.goo.gl/b7Wia7fqkfawjEYe8?g_st=aw',
  mainImage: '/images/1-gelaende/stauf.JPG',
  addressHeading: 'Adresse/ Anfahrt',
  parkplatzHeading: 'Parkplatz:',
  parkplatzText: '67304 Eisenberg, Ortsteil Steinborn (nicht Stauf!), Ramsener Straße<br />Parkplatz am Wendehammer im Feld<br />GPS N 49°33´00.9´´ O 08°01´41.0´´',
  startplatzHeading: 'Adresse Startplatz:',
  startplatzText: '67304 Eisenberg<br />Ortsteil Stauf Talstraße 12<br />GPS N 49°33´00.9´´ O 08°01´41.0´´',
  routeImage: '/images/1-gelaende/stauf.png',
  achtungHtml: '<strong>Achtung:</strong> Sollten wir links in der Rinne schulen, bitte unbedingt die Wege benutzen und nicht quer über die Wiese laufen. Bitte haltet euch daran... es gab schon richtig Ärger deswegen!!!',
  besonderheitenHeading: 'Besonderheiten / Gefahrenquellen:',
  besonderheiten: [
    'Durch die Kuppenlage des Staufer Hügels kommt der Wind oft von der Seite. Haben die Schornsteine in der Rheinebene einen kleinen Westschlag, ist das ein eher schlechtes Zeichen für Stauf da der Wind dann von rechts kommt.',
    'Schnelle Windzunahme bei thermischen Südostwindwetterlagen am mittleren/späten Vormittag',
    'Piloten, die vom Kuppen- Startplatz starten und über die Piloten vom Plateau- Startplatz fliegen',
    'Hecken und Weidezaun und die unten zu überfliegende Straße stellen Hindernisse dar',
    'Sollte jemand über dem Zaun landen bitte durch die Tür mit dem',
    'Zahlenschloss gehen Nr. 1102 und nicht über den Zaun steigen',
  ],
  richtwerteHeading: 'Richtwerte für Flüge mit dem L-Schein:',
  richtwerte: [
    'Für Piloten mit Flugauftrag: Windrichtung zwischen 90° bis 190°; Windgeschwindigkeit im Durchschnitt kleiner 10 km/h; Spitzen kleiner 15 km/h. Ebenso sollten sich die Winddaten mit der Wetterstation der Kalmit decken.',
  ],
  wetterstationenHeading: 'Melibokus / Kalmit Wetterstationen:',
  wetterstationenText: 'Der Melibokus (Tel.: 06352/983612) liegt ca. 60 km in Richtung Nord-Ost und die<br />Kalmit (Tel.: 06322/7909533) ca. 35 km südlich.<br /><br />Die Windwerte der Wetterstationen sollen nur als Anhaltswerte dienen.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1310.1508451382992!2d8.036379621411072!3d49.546655368246505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47963ce4f463a439%3A0x2cf394f792cc59dc!2sRamsener%20Str.%2C%2067304%20Ramsen!5e0!3m2!1sde!2sde!4v1588789021619!5m2!1sde!2sde',
};

export const Stauf = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<StaufData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'stauf'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Stauf content:', err));
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

          <div className="flex flex-wrap gap-10 items-start">
            {/* Content column */}
            <div className="w-full md:flex-1 md:basis-[58%] text-[15px] text-gray-600 font-light leading-relaxed space-y-6">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Eckdaten:</p>
                <ul className="space-y-0.5">
                  {content.eckdatenRows.map((row, i) => (
                    <li key={i}><span className="font-medium text-gray-700">{row.label}:</span> {row.value}</li>
                  ))}
                </ul>
              </div>

              <div>
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer">
                  <img src="/images/Google_Routenplaner_Maps_org.gif" alt="Google Routenplaner Maps org" width={120} height={90} />
                </a>
                <br />
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">
                  Routenplaner für Smartphones
                </a>
              </div>

              {content.mainImage && (
                <img src={content.mainImage} alt={content.title} className="w-full rounded-sm" />
              )}

              <p className="font-semibold text-gray-800">{content.addressHeading}:</p>

              <div>
                <p className="font-semibold text-gray-800">{content.parkplatzHeading}</p>
                <SafeHtml html={content.parkplatzText} />
              </div>

              <div>
                <p className="font-semibold text-gray-800">{content.startplatzHeading}</p>
                <SafeHtml html={content.startplatzText} />
              </div>

              {content.routeImage && (
                <img src={content.routeImage} alt="Anfahrt und Parkplatz Stauf" className="w-full max-w-[500px] rounded-sm" />
              )}

              <SafeHtml className="[&_strong]:text-gray-800 [&_strong]:font-semibold" html={content.achtungHtml} />

              <div>
                <p className="font-semibold text-gray-800 mb-2">{content.besonderheitenHeading}</p>
                <ul className="list-disc pl-5 space-y-2">
                  {content.besonderheiten.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">{content.richtwerteHeading}</p>
                <ul className="list-disc pl-5 space-y-2">
                  {content.richtwerte.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-800">{content.wetterstationenHeading}</p>
                <SafeHtml html={content.wetterstationenText} />
              </div>
            </div>

            {/* Map column */}
            <div className="w-full md:flex-1 md:basis-[35%]">
              <div className="w-full aspect-[4/3] rounded-sm shadow-md overflow-hidden border border-gray-200">
                <iframe
                  src={content.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  title="Stauf Kartenansicht"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
