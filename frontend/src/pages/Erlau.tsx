import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// /infos/gelaende/erlau - one of the 10 Gelände detail pages. Content is
// now fully structured (Eckdaten rows, Routenplaner link, images, address/
// besonderheiten/richtwerte text, map embed URL) instead of one raw HTML
// blob, so it can be edited field-by-field in ErlauContentEditor.tsx - the
// content/map two-column layout is built directly with Tailwind flex here
// rather than injected legacy Bootstrap markup.

interface EckdatenRow { label: string; value: string }

interface ErlauData {
  title: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  mainImage: string;
  parkplatzHtml: string;
  addressHeading: string;
  addressText: string;
  zumFluggelaendeHeading: string;
  zumFluggelaendeText: string;
  besonderheitenHeading: string;
  besonderheitenText: string;
  richtwerteHeading: string;
  richtwerteText: string;
  mapEmbedUrl: string;
  mapSideImage: string;
  extraImage: string;
}

const DEFAULT_CONTENT: ErlauData = {
  title: 'Erlau',
  eckdatenRows: [
    { label: 'Ausrichtung', value: 'Ost' },
    { label: 'Windspektrum', value: '50° bis 110°' },
    { label: 'Höhendifferenz', value: '50 Meter' },
    { label: 'Geländehalter', value: '1.ODC' },
  ],
  routenplanerUrl: 'https://maps.app.goo.gl/479uTYgErKrefYuJ8?g_st=aw',
  mainImage: '/images/1-gelaende/erlau.JPG',
  parkplatzHtml: 'Parkplatz:&nbsp; <a href="https://goo.gl/maps/kPkh6ogZp5H2" class="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Wanderparkplatz Rodenstein</a>, 64407 Fränkisch-Crumbach',
  addressHeading: 'Adresse/ Anfahrt',
  addressText: 'Von Füth im Odenwald aus kommend zum Wanderparkplatz bei der Ruine Rodenstein: 100 Meter vor dem Ortsausgangsschild von 64385 Reichelsheim links ab Richtung Ruine Rodenstein / Eberbach. Durch das Örtchen Eberbach bitte mit 30 kam ha fahren. Einen km nach der Abzweigung führt ein Weg hoch, der nur für landwirtschaftlichen Verkehr freigegeben ist. Dort gerade aus (halb links) auf der normalen Straße weiterfahren. Nach weiteren 700 m kommt man dann zu einem Straßen-T an dem es links zur Ruine Rodenstein geht und rechts zum Parkplatz. Hier rechts abbiegen und den Berg hoch fahren nach 300 m beim nächsten Straßen-T links. Nach 100 m ist der große Wanderparkplatz auf der rechten Seite (49°44´03,97´´Nord 8°49´21,21´´ Ost). Oberhalb vom Parkplatz wird ein Weg vielleicht bergauf. Der Weg ist mit dem Hinweisschild „weißes Rechteck mit blauem Dreieck" gekennzeichnet. Nicht den Weg mit dem Sperr Schild nehmen. Nach 400 m kommt man an eine Gabelung, dort weiter gerade aus dem Wegweisern folgen. Nach weiteren 200 m kommt man zur nächsten Gabelung. Dort rechts halten und noch 100 m bis zum Übungshang (49°44´27,49´´Nord 8°49´28,31´´ Ost) laufen. Landeplatz 1: (49°44´28,87´´Nord 8°49´43,53´´ Ost) Landeplatz 2: (49°44´23,79´´Nord 8°49´44,29´´ Ost).',
  zumFluggelaendeHeading: 'Zum Fluggelände',
  zumFluggelaendeText: 'In Erlau wird der Wind durch das U-förmige Gelände kanalisiert und sorgt somit oft für gute Startbedingungen. Bei sehr schwachem, überregionalem Wind, bildet sich morgens in Erlau ein thermisch bedingter Ostwind aus, der dann später auf die Hauptwindrichtung dreht. Bei Seitenwindlagen ist erfahrungsgemäß ein Nordschlag turbulenzarmer als ein Südschlag. Das kommt von der Leesituation durch den hohen Buchenwald auf der rechten Seite des Übungshangs. Abends setzt sich auf dem Übungshang leichter Rückenwind ein, obwohl die Windfahne am Holunderhof noch Ostwind anzeigt. Dieser Effekt erklärt sich dadurch, dass kalte schwerere Luft bodennah nach unten abfließt. Die kalte Luft bildet sich im Wald hinter dem Übungshang, der abends im Schatten liegt.',
  besonderheitenHeading: 'Besonderheiten / Gefahrenquellen / Regeln',
  besonderheitenText: 'Wenn es gut trägt, kann man über den unteren Zaun fliegen und auf dem großen Landeplatz östlich des unteren Zauns landen. Trägt es weniger gut, muss vor dem Zaun am Hang mit Seitenwind gelandet werden. Piloten vom oberen Startplatz starten können im unteren Bereich des Übungshanges landen-Luftraumkontrolle! Am Vormittag nach anfangs ruhigen Flugbedingungen kann der Wind sehr schnell aufleben. Bei Weidebetrieb kann der Übungshang ab und zu gesperrt sein. In Erlau wird 30 km/h auf der Straße gefahren! Bitte daran halten.',
  richtwerteHeading: 'Richtwerte für Flüge mit dem L-Schein',
  richtwerteText: 'Wetterdaten Melibokus: Windrichtung zwischen 50° bis 110°; Windgeschwindigkeit im Durchschnitt kleiner 15km/h; Spitzen kleiner 25 km/h. Wind am Hang zw. 10-12Km/h optimal |&nbsp; Tel. Melibokus : 06251 / 983612',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8454.331400063544!2d8.823493765027685!3d49.73706580741055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd60e4cb678049%3A0xd65ddab5f83f13a2!2sWanderparkplatz%20Rodenstein!5e1!3m2!1sde!2sde!4v1588789569688!5m2!1sde!2sde',
  mapSideImage: '/images/1-gelaende/Erlau_1.png',
  extraImage: '/images/1-gelaende/Erlau_2.png',
};

export const Erlau = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<ErlauData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'erlau'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Erlau content:', err));
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
            <div className="w-full md:w-[calc(58.3333%-1rem)] space-y-6 text-[15px] text-gray-600 font-light leading-relaxed">
              <div className="bg-[#FAF9F7] border border-gray-100 rounded-sm p-4">
                <p className="font-semibold text-gray-800 mb-2">Eckdaten:</p>
                <div className="space-y-1">
                  {content.eckdatenRows.map((row, i) => (
                    <p key={i}><strong className="text-gray-800 font-semibold">{row.label}:</strong> {row.value}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer">
                  <img src="/images/Google_Routenplaner_Maps_org.gif" alt="Google Routenplaner Maps org" width={120} height={90} />
                </a>
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">
                  Routenplaner für Smartphones
                </a>
              </div>

              {content.mainImage && (
                <img src={content.mainImage} alt={content.title} className="w-full rounded-sm" />
              )}

              <SafeHtml html={content.parkplatzHtml} className="[&_a]:text-[#428bca] [&_a]:underline [&_a]:font-bold hover:[&_a]:text-[#2a6496]" />

              <div>
                <h2 className="font-luxury text-2xl text-luxury-dark mb-2 italic">{content.addressHeading}</h2>
                <p>{content.addressText}</p>
              </div>

              <div>
                <h2 className="font-luxury text-2xl text-luxury-dark mb-2 italic">{content.zumFluggelaendeHeading}</h2>
                <p>{content.zumFluggelaendeText}</p>
              </div>

              <div>
                <h2 className="font-luxury text-2xl text-luxury-dark mb-2 italic">{content.besonderheitenHeading}</h2>
                <p>{content.besonderheitenText}</p>
              </div>

              <div>
                <h2 className="font-luxury text-2xl text-luxury-dark mb-2 italic">{content.richtwerteHeading}</h2>
                <SafeHtml html={content.richtwerteText} />
              </div>
            </div>

            {/* Map column */}
            <div className="w-full md:w-[calc(41.6667%-1rem)] space-y-4">
              <div className="w-full aspect-[4/3] rounded-sm shadow-md overflow-hidden border border-gray-200">
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
              {content.mapSideImage && (
                <img src={content.mapSideImage} alt="" className="w-full rounded-sm" />
              )}
            </div>
          </div>

          {content.extraImage && (
            <div className="mt-8">
              <img src={content.extraImage} alt="" className="w-full max-w-md rounded-sm" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
