import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// The Gelände detail page for "Nonroder Höhe" - was previously one raw
// HTML blob (a straight transcription of the old Joomla article, including
// its Bootstrap-era column markup for the map) edited as a single admin
// textarea. Broken out into real fields/JSX here (Eckdaten rows,
// Routenplaner link, main image, Adresse text, Besonderheiten/Richtwerte
// lists, a combined "Zum Fluggelände/Parken" paragraph, map URL) so each
// piece is its own editable field in NonrodContentEditor.tsx, same as
// every other converted page this session.

interface EckdatenRow { label: string; value: string }

interface NonrodData {
  title: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  mainImage: string;
  addressHeading: string;
  addressText: string;
  besonderheitenHeading: string;
  besonderheiten: string[];
  richtwerteHeading: string;
  richtwerte: string[];
  zumFluggelaendeHeading: string;
  zumFluggelaendeText: string;
  parkenWenigHeading: string;
  parkenWenigText: string;
  parkenVielHeading: string;
  parkenVielText: string;
  mapEmbedUrl: string;
}

const DEFAULT_CONTENT: NonrodData = {
  title: 'Nonroder Höhe',
  eckdatenRows: [
    { label: 'Ausrichtung', value: 'West bis Nord' },
    { label: 'Optimale Ausrichtung', value: 'Nordwest' },
    { label: 'Windspektrum', value: '270° bis 360°' },
    { label: 'Höhendifferenz', value: '50 Meter' },
    { label: 'Geländehalter', value: 'Flugschule Hirondelle' },
  ],
  routenplanerUrl: 'https://maps.app.goo.gl/mnKkez6nw1gWdnV36?g_st=aw',
  mainImage: '/images/1-gelaende/nonrod.JPG',
  addressHeading: 'Adresse/ Anfahrt',
  addressText: 'Am Lohberg 3<br />64405 Fischbachtal<br />Ortsteil Nonrod<br /><br />Dort rechts die Schottereinfahrt hoch fahren, GPS: 49°45´18.77´´ N , 8°49´19,52´´O',
  besonderheitenHeading: 'Besonderheiten / Gefahrenquellen',
  besonderheiten: [
    'Die besten Flugbedingungen stellen sich an dem nordwestlich ausgerichteten Hang oft am späten Nachmittag ein. Vom Fischbachtal kommt weht der Wind Richtung Nonroder Höhe und steht dann ideal am Übungshang an.',
    'Kleines Leegebiet hinter dem Wald links vom Landeplatz',
    'Fliegen auf dem Gelände: Mindestens zwei Personen müssen anwesend sein!!!',
  ],
  richtwerteHeading: 'Richtwerte für Flüge mit dem L-Schein',
  richtwerte: [
    'Windrichtung zwischen 270° bis 360°; Windgeschwindigkeit im Durchschnitt kleiner 10 km/h; Spitzen kleiner 15 km/h.',
  ],
  zumFluggelaendeHeading: 'Zum Fluggelände:',
  zumFluggelaendeText: 'An der Halle vorbei (siehe Googleearthbild) dort hängt der Briefkasten und die Umschläge zum Bezahlen. Bitte nochmals dort die Flugregeln durchlesen. Tagesgebühr von 2,- € für jeden Flieger.',
  parkenWenigHeading: 'Parken bei wenig Flugbetrieb:',
  parkenWenigText: 'Parken unten entlang der Straße „Am Lohberg" könnt ihr die Autos parken oder hinter der Halle (nach Einweisung durch die Eigentümerin). Bitte nicht im Ort parken!',
  parkenVielHeading: 'Parken bei viel Flugbetrieb:',
  parkenVielText: 'Das Material kann am Fluggelände abgeladen werden. Geparkt wird am Rast-und Parkplatz Nonroder Höhe (GPS´49°45´21,15´´8°49´45,15´´) Wegbeschreibung: Zurück zur Ortsdurchfahrtsstraße (Rodensteiner Straße). Dort links und nach ca. 300 Meter wieder links. 150 Meter gerade aus bis zur Haselnussgruppe. Dort links auf dem Schotterweg bis im Wald auf der rechten Seite der Parkplatz kommt. Wenn ihr zurück lauft den gleichen Weg benutzen und nicht über die Felder der Bauen laufen…gab schon Ärger!',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2357.8804577125984!2d8.82110668090161!3d49.75501531322468!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd60d7f43e4385%3A0x15cabe4b43fddd4!2sAm%20Lohberg%203%2C%2064405%20Fischbachtal!5e1!3m2!1sde!2sde!4v1588790435591!5m2!1sde!2sde',
};

export const Nonrod = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<NonrodData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'nonrod'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Nonrod content:', err));
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

              {content.mainImage && (
                <img src={content.mainImage} alt={content.title} className="w-full rounded-sm mb-6" />
              )}

              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">{content.addressHeading}:</p>
                <SafeHtml html={content.addressText} />
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">{content.besonderheitenHeading}:</p>
                <ul className="list-disc pl-5">
                  {content.besonderheiten.map((item, i) => (
                    <li key={i} className="mb-2">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">{content.richtwerteHeading}:</p>
                <ul className="list-disc pl-5">
                  {content.richtwerte.map((item, i) => (
                    <li key={i} className="mb-2">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">{content.zumFluggelaendeHeading}</p>
                <p>{content.zumFluggelaendeText}</p>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">{content.parkenWenigHeading}</p>
                <p>{content.parkenWenigText}</p>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">{content.parkenVielHeading}</p>
                <p>{content.parkenVielText}</p>
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
                  title="Fluggelände Nonroder Höhe"
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
