import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// The Gelände detail page for "Billings" - was previously one raw HTML
// blob (a straight transcription of the old Joomla article, including its
// Bootstrap-era column markup for the map) edited as a single admin
// textarea. Broken out into real fields/JSX here (Eckdaten rows,
// Routenplaner link, Adresse text, Besonderheiten paragraphs, map URL) so
// each piece is its own editable field in GelaendeArticleContentEditor.tsx-
// style admin screens, same as every other converted page this session.

interface EckdatenRow { label: string; value: string }

interface BillingsData {
  title: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  addressHeading: string;
  addressHtml: string;
  besonderheitenHeading: string;
  besonderheiten: string[];
  mapEmbedUrl: string;
}

const DEFAULT_CONTENT: BillingsData = {
  title: 'Billings',
  eckdatenRows: [
    { label: 'Ausrichtung', value: 'Nordwest' },
    { label: 'Windspektrum', value: '300° bis 10°' },
    { label: 'Höhendifferenz', value: '130 Meter' },
    { label: 'Geländehalter', value: '1.ODC' },
  ],
  routenplanerUrl: 'http://maps.apple.com/?q=%2049.754684, 8.794765',
  addressHeading: 'Adresse/ Anfahrt',
  addressHtml: 'Navi Landeparkplatz: 64405 Fischbachtal Ortsteil Billings Almenweg 1 GPS N 49°45´16.6´´ O 08°47´41.1´´<br />Vom Landeparkplatz zum Landeplatz: Vom Parkplatz zurück zur Brücke und auf der Meßbacher Straße leicht bergab immer Richtung Niedernhausen laufen. Die nächste links und noch ca. 100 Meter bis zu der Sitzgruppe am Landeplatz.',
  besonderheitenHeading: 'Besonderheiten / Gefahrenquellen',
  besonderheiten: [
    'Stärkerer Wind kann in Billings auf Grund des vorgelagerten höheren Berges stärkere Turbulenzen verursachen. Der Wind soll in Billings eher schwach sein und aus einem Sektor zwischen 300° bis 10° kommen. Windwerte vom Melibokus liefern sehr gute Anhaltswerte (Tel: 06251/983612).',
    'Bei Abwinden muss damit gerechnet werden, dass auf Grund der flachen Hangneigung auf einer der oberen Notlandewiesen gelandet werden muss. - Durch die flache Hangneigung ist es nicht immer sicher, dass man mit dem Gleitschirm über den unteren Weidezaun am Ende des Startplatzes kommt. Daher ist vorher seitlich am Hang zu landen',
    'Achtung es steht eine durchgehende Baumreihe entlang des Baches nördlich des Landeplatzes Richtwerte für Flüge mit dem L-Schein: - Für Piloten mit Flugauftrag: Windrichtung zwischen 300° bis 10°; Windgeschwindigkeit im Durchschnitt kleiner 10 km/h; Spitzen kleiner 20 km/h (Richtwert für Alleinflüge mit dem Höhenflugausweis - Für Piloten mit Flugauftrag maximal 5-10 km/h',
  ],
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4225.630824958612!2d8.793195951823863!3d49.754683445030565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd613866f97d8d%3A0xaffec9e3ca256d13!2sAlmenweg%201%2C%2064405%20Fischbachtal!5e1!3m2!1sde!2sde!4v1588792602122!5m2!1sde!2sde',
};

export const Billings = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<BillingsData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'billings'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Billings content:', err));
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

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Content column */}
            <div className="w-full md:w-[58%] text-[15px] text-gray-600 font-light leading-relaxed">
              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">Eckdaten:</p>
                {content.eckdatenRows.map((row, i) => (
                  <p key={i}>
                    {row.label}: {row.value}
                  </p>
                ))}
              </div>

              <div className="mb-6">
                <a
                  href={content.routenplanerUrl}
                  target="_blank"
                  rel="alternate noopener noreferrer"
                  title="Öffnet Google Maps App"
                  className="inline-block"
                >
                  <img src="/images/Google_Routenplaner_Maps_org.gif" alt="Google Routenplaner Maps org" width={120} height={90} />
                </a>
                <br />
                <a
                  href={content.routenplanerUrl}
                  target="_blank"
                  rel="alternate noopener noreferrer"
                  className="text-[#428bca] underline font-bold hover:text-[#2a6496]"
                >
                  Routenplaner für Smartphones
                </a>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">{content.addressHeading}:</p>
                <SafeHtml html={content.addressHtml} />
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">{content.besonderheitenHeading}:</p>
                {content.besonderheiten.map((paragraph, i) => (
                  <p key={i} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Map column */}
            <div className="w-full md:w-[42%]">
              <div className="w-full aspect-[4/3] rounded-sm shadow-md overflow-hidden relative border border-gray-200">
                <iframe
                  src={content.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Fluggelände Billings"
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
