import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// One of the 10 /infos/gelaende/:slug detail pages - own SitePageContent
// kind ('herrenteich'), own Duplizieren/Titel/URL settings, same pattern
// as every other page converted this session. Unlike most of its siblings
// this article has no formal "Eckdaten:" box (just an intro paragraph) and
// its main content is an 11-entry driving-directions list (each entry a
// bold sub-heading + text) plus a separate 4-item rules list - all now
// real structured fields instead of one raw HTML blob, edited from
// HerrenteichContentEditor.tsx. Content column sits beside the map column
// on md+ screens (stacks below md), replacing the old Bootstrap
// col-md-7/col-md-5 raw-HTML layout with plain Tailwind flex.

interface DirectionEntry {
  label: string;
  text: string;
}

interface HerrenteichData {
  title: string;
  introText: string;
  routenplanerUrl: string;
  mainImage: string;
  navTipHtml: string;
  directions: DirectionEntry[];
  rulesHeading: string;
  rules: string[];
  mapEmbedUrl: string;
}

const DEFAULT_CONTENT: HerrenteichData = {
  title: 'Herrenteich',
  introText: "Der Flugplatz Herrenteich liegt ca. 15 km südlich vom Flugplatz Mannheim-Neuostheim entfernt (am Rheindamm zwischen Ketsch und Speyer).<br />Koordinaten: 49°20´46'' N&nbsp; 08°29´19´´ E.",
  routenplanerUrl: 'https://maps.app.goo.gl/149VWUMKxaXUJCvY8?g_st=aw',
  mainImage: '/images/1-gelaende/winde_herrenteich.jpg',
  navTipHtml: 'Der Flugplatz Herrenteich gehört örtlich zur Gemeinde Hockenheim. Deshalb in den Navigationssystemen zuerst den Ort Hockenheim auswählen und dann als Sonderziel/Straße Herrenteich eingeben',
  directions: [
    { label: 'Beschreibung von Schwetzingen, Ketsch, Plankstadt, Oftersheim und Heidelberg', text: 'In Schwetzingen am Schloßgarten vorbei in Richtung Hockenheim fahren. Kurz nachdem Verlassen des Ortes nach rechts in Richtung Ketsch abbiegen. In Ketsch folgt man der Hauptstraße ganz durch den Ort. Am Ende der Straße biegt man an der Kirche rechts und gleich darauf, ca. 20 Meter später, an der Eisdiele wieder links ab (in Richtung Speyer). Sie befinden sich jetzt am Altrhein. Von hier aus sind es noch ca. 3,5 Kilometer auf dem Rheindamm bis zum Flugplatz Herrenteich, vorbei am Ketscher Frei- und Hallenbad und am Hohwiesensee (kostenloser Badesee).' },
    { label: 'Beschreibung von Hockenheim', text: 'Von Hockenheim in Richtung Talhaus und weiter nach Ketsch. In Ketsch immer der Straße folgen. An der Kirche (auf der rechten Seite) links in Richtung Speyer abbiegen. Von dort sind es dann noch ca. 3,5km auf dem Rheindamm bis zum Flugplatz Herrenteich.' },
    { label: 'Beschreibung von Speyer, Waldsee, Otterstadt und Römerberg', text: 'Von Speyer über die Rheinbrücke (B39) in Richtung Ketsch. Gleich nachdem Überqueren des Rheins an der Ampel rechts in Richtung Altlußheim abbiegen. Nach ca. 500m rechts in Richtung Herrenteich abbiegen. Auf dem Rheindamm entlang zum Flugplatz Herrenteich.' },
    { label: 'Beschreibung von Altlußheim, Neulußheim, Reilingen, Rheinhausen, Waghäusel', text: 'Auf der B39 in Richtung Speyer. Kurz nach Altlußheim links auf den Rheindamm in Richtung Herrenteich abbiegen.' },
    { label: 'Beschreibung von Brühl und Rohrhof', text: 'Von Brühl in Richtung Ketsch. In Ketsch der Straße folgen und nachdem die Straße eine 90°-Kurve nach links gemacht hat, gleich nach rechts in Richtung Speyer abbiegen (auf der linken Seite befindet sich eine Kirche). Auf dem Rheindamm entlang zum Flugplatz Herrenteich.' },
    { label: 'Beschreibung von Mannheim, Rheinau, Neckarau über die B36', text: "Auf der B36 in Richtung Süden kurz nach Rheinau am Wal-Mart/McDonald's rechts in Richtung Ketsch abbiegen. An der Ampel nach dem McDonald's geradeaus in Richtung Ketsch. Die Schnellstraße läuft jetzt parallel an der Autobahn. An der 2. Ausfahrt (Ketsch/Schwetzingen) abfahren und dann rechts nach Ketsch. Der Straße durch Ketsch folgen und am Ende der Straße rechts und gleich wieder links in Richtung Speyer/Altußheim. Auf dem Rheindamm sind es jetzt noch ca. 3,5km bis zum Flugplatz Herrenteich." },
    { label: 'Beschreibung von Autobahn A6', text: 'Autobahn A6 an der Anschlussstelle Mannheim/Schwetzingen (28) in Richtung Mannheim-Rheinau/Brühl verlassen. Auf der Bundesstrasse gleich wieder rechts nach Ketsch/Brühl. An der 2. Ampel links nach Ketsch/Hockenheim. Die Schnellstraße läuft jetzt parallel an der Autobahn. An der 2. Ausfahrt (Ketsch/Schwetzingen) abfahren und dann rechts nach Ketsch. Der Straße durch Ketsch folgen und am Ende der Straße rechts und gleich wieder links in Richtung Speyer/Altußheim. Auf dem Rheindamm sind es jetzt noch ca. 3,5km bis zum Flugplatz Herrenteich.' },
    { label: 'Beschreibung von Autobahn A61', text: 'Die Autobahn A61 an der Anschlussstelle Hockenheim (64) verlassen und in Richtung Speyer fahren. An der kommenden Ampel nach links in Richtung Altlußheim abbiegen und darauf gleich wieder rechts in Richtung Herrenteich. Auf dem Rheindamm weiter zum Flugplatz Herrenteich.' },
  ],
  rulesHeading: 'Regelung des Flugbetriebes der Gleitschirmflieger auf dem Flugplatz',
  rules: [
    'Die Sonderregelungen für Gleitsegelschleppbetrieb auf Flugplätzen sind zu beachten. (B-Schein Theorie; gültiger Schleppschein)',
    'Den diensthabenden Flug- und Startleitern ist Folge zu leisten. Der Platzflugbetrieb darf nicht behindert oder gefährdet werden. Achtung auf anfliegende Flugzeuge! Die aktuellen Flugbetriebsbedingungen sind beim Flugleiter zu erfragen.',
    'Die Starts von Flugzeugen und GS finden nach Absprache statt.',
    'Eine Freigabe muß vor jedem Schleppvorgang beim diensthabenden Flugleiter eingeholt werden.',
  ],
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2599.1430771527293!2d8.487383951816065!3d49.3494404738568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4797b7ad0395ad27%3A0x734a880cb7968ffa!2sFlugplatz%20Herrenteich!5e0!3m2!1sde!2sde!4v1588788513704!5m2!1sde!2sde',
};

export const Herrenteich = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<HerrenteichData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'herrenteich'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Herrenteich content:', err));
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
            <div className="flex-1 basis-full md:basis-[58%] text-[15px] text-gray-600 font-light leading-relaxed">
              <SafeHtml className="mb-4" html={content.introText} />

              <div className="mb-6">
                <a href={content.routenplanerUrl} target="_blank" rel="noopener noreferrer">
                  <img src="/images/Google_Routenplaner_Maps_org.gif" alt="Google Routenplaner Maps org" width={120} height={90} />
                </a>
                <br />
                <a
                  href={content.routenplanerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#428bca] underline font-bold hover:text-[#2a6496]"
                >
                  Routenplaner für Smartphones
                </a>
              </div>

              {content.mainImage && (
                <img src={content.mainImage} alt="Winde Herrenteich" className="w-full rounded-sm my-4" />
              )}

              <SafeHtml
                className="mb-6 [&_b]:text-gray-800 [&_b]:font-semibold"
                html={`<b>Tipp für Navigationssysteme<br /></b>${content.navTipHtml}`}
              />

              <ul className="list-disc pl-5 mb-6 space-y-3">
                {content.directions.map((entry, i) => (
                  <li key={i}>
                    <strong className="text-gray-800 font-semibold">{entry.label}</strong>
                    <br /> {entry.text}
                  </li>
                ))}
              </ul>

              <strong className="text-gray-800 font-semibold block mb-2">{content.rulesHeading}</strong>
              <ul className="list-disc pl-5 space-y-2">
                {content.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Map column */}
            <div className="flex-1 basis-full md:basis-[calc(42%-2rem)]">
              <div className="w-full aspect-[4/3] rounded-sm shadow-md overflow-hidden">
                <iframe
                  src={content.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Flugplatz Herrenteich"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
