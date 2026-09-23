import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// /infos/gelaende/lindenfels - one of the 10 Gelände detail pages, each now
// its own page + kind (own Duplizieren/Titel/URL settings) with genuinely
// structured content fields instead of one raw-HTML blob (see the sibling
// Gelände detail pages for the same pattern - each is its own file since,
// unlike e.g. the Ausbildung sub-pages, these 10 articles' sections differ
// enough per article that a single shared factory doesn't fit well).

interface EckdatenRow { label: string; value: string }

interface LindenfelsData {
  title: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  mainImage: string;
  addressHeading: string;
  addressHtml: string;
  pdfUrl: string;
  pdfLabel: string;
  besonderheitenHeading: string;
  besonderheiten: string[];
  richtwerteHeading: string;
  richtwerte: string[];
  mapEmbedUrl: string;
}

const DEFAULT_CONTENT: LindenfelsData = {
  title: 'Lindenfels',
  eckdatenRows: [
    { label: 'Ausrichtung', value: 'Süd' },
    { label: 'Windspektrum', value: '150° bis 210°' },
    { label: 'Höhendifferenz', value: '30 bis 107 Meter' },
    { label: 'Geländehalter', value: 'Lindenfelser Gleitschirmflieger' },
  ],
  routenplanerUrl: 'https://maps.app.goo.gl/vQjqsJ1oVvcKNpkM9?g_st=aw',
  mainImage: '/images/1-gelaende/lindenfels.JPG',
  addressHeading: 'Adresse/ Anfahrt',
  addressHtml:
    'Schwimmbadstraße 10<br />64678 Schlierbach<br /><br />Von dort aus 100 Meter weiter Bergauffahren. Treffpunkt ist rechts am Parkplatz bei der Pferdekoppel, parken bitte in der Straße im Wald oder am Schwimmbad (im Wald weiter der Straße folgen).<br />GPS: 49°41´13.27´´ N , 8°46´08,97´´O',
  pdfUrl: '/pdf/Gelaendebeschreibung%20Lindenfels.pdf',
  pdfLabel: 'Download Infos & Geländebeschreibung',
  besonderheitenHeading: 'Besonderheiten/ Gefahrenquellen:',
  besonderheiten: [
    'Benutzung des unteren Übungshanges bei höherem Graswuchs ab 50 cm nicht möglich, da sonst Ertragsminderung bei der Heuernte durch zusammengetrampeltes Gras für die Bauern',
    'Parken der Autos am Waldrand in der Kurve am Zugang zum oberen Übungshang ist nicht erlaubt',
    'Ungeordnetes Parken bei dem Reiterhof; Behinderung der Reiter bei der Zufahrt zum Hof vermeiden',
    'Erschrecken der Pferde auf der Koppel am Reiterhof vermeiden',
    'Durch die flache Hangneigung ist es nicht immer sicher, dass man über die untere Baumreihe fliegt-Hanglandung vor der Baumreihe',
    'Bei Aufwind und Thermik muss nach der Baumreihe abgeachtert werden',
    'Durch die vorgegebene Topographie muss sich der Pilot immer auf eine Hanglandung einstellen',
    'Luftraumkontrolle, da Piloten vom den oberen Startplätzen im Startbereich des unteren Startplatzes einlanden können',
    'Anwesenheit: mindestens 2 Personen',
  ],
  richtwerteHeading: 'Richtwerte für Flüge mit dem L-Schein:',
  richtwerte: [
    'Tel. Melibokus : 06251 / 983612',
    'Windmessstation Lindenfels 0176-63307995',
    'Windrichtung zwischen 150° bis 210°; Windgeschwindigkeit im',
    'Durchschnitt kleiner 10 km/h; Spitzen kleiner 15 km/h',
  ],
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4231.533100041694!2d8.767622333468386!3d49.68691069271673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4797df5ee53e39f7%3A0x150235a5aaa4c8e8!2sReit-%20und%20Fahrverein%20Nibelungen%20e.V.!5e1!3m2!1sde!2sde!4v1588790231627!5m2!1sde!2sde',
};

export const LindenfelsGelaende = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<LindenfelsData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'lindenfels'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Lindenfels content:', err));
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

          <div className="flex flex-wrap gap-8 items-start">
            {/* Content column */}
            <div className="w-full md:flex-1 md:basis-[58%] text-[15px] text-gray-600 font-light leading-relaxed">
              <p className="mb-4">
                <strong className="text-gray-800 font-semibold">Eckdaten:</strong>
                <br />
                {content.eckdatenRows.map((row, i) => (
                  <span key={i}>
                    {row.label}: {row.value}
                    {i < content.eckdatenRows.length - 1 && <br />}
                  </span>
                ))}
              </p>

              <div className="mb-4">
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer">
                  <img src="/images/Google_Routenplaner_Maps_org.gif" alt="Google Routenplaner Maps org" width={120} height={90} />
                </a>
                <br />
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer" className="text-[#428bca] underline font-bold hover:text-[#2a6496]">
                  Routenplaner für Smartphones
                </a>
              </div>

              {content.mainImage && (
                <img src={content.mainImage} alt={content.title} className="w-full rounded-sm my-4" />
              )}

              <p className="mb-4">
                <strong className="text-gray-800 font-semibold">{content.addressHeading}:</strong>
                <br />
                <SafeHtml html={content.addressHtml} />
              </p>

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

              <p className="mb-2 mt-4">
                <strong className="text-gray-800 font-semibold">{content.besonderheitenHeading}</strong>
              </p>
              <ul className="list-disc pl-5 mb-4">
                {content.besonderheiten.map((item, i) => (
                  <li key={i} className="mb-2">{item}</li>
                ))}
              </ul>

              <p className="mb-2">
                <strong className="text-gray-800 font-semibold">{content.richtwerteHeading}</strong>
              </p>
              <ul className="list-disc pl-5 mb-4">
                {content.richtwerte.map((item, i) => (
                  <li key={i} className="mb-2">{item}</li>
                ))}
              </ul>
            </div>

            {/* Map column */}
            <div className="w-full md:flex-1 md:basis-[38%]">
              <div className="w-full aspect-[4/3] rounded-sm shadow-md overflow-hidden">
                <iframe
                  src={content.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  title={`Karte ${content.title}`}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
