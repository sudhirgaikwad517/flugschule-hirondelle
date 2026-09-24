import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// Fallbacks match the page's current live copy exactly, so nothing changes
// visually until an admin edits something in Admin > Gutscheine (see
// backend SitePageContent 'gutscheine' kind / sitePageContent.routes.ts).
const DEFAULT_CONTENT = {
  heading: 'GESCHENK-GUTSCHEIN',
  introLine1: '...nicht schon wieder Socken ;-) ...',
  introLine2: 'Du suchst ein schönes Geschenk',
  introLine3: 'und möchtest einem lieben Menschen einen Traum erfüllen?',
  paragraph: 'Bei uns erhälst du Gutscheine für alle Kurse, Weiterbildungen, Reisen oder auch für Tandemflüge.',
  subheading: "Gutschein einlösen – so geht's",
  paragraph1: 'Unsere Gutscheine könnt ihr wie ein Zahlungsmittel einsetzen – ihr bringt sie einfach zum Termin mit!',
  paragraph2: 'Gleitschirmfliegen ist wetterabhängig. Wir brauchen Wind in richtiger Stärke und aus der geeigneten Richtung. Weil es selbst den besten Wetterfröschen kaum möglich ist, das Wetter auf längere Sicht abzuschätzen, bieten wir euch ein eigenes System zur Termin-/Ortsankündigung an, um die vereinbarten Tandemflüge und geplante Schnupperkurse sicher durchzuführen. Hierüber informieren wir euch 1 bis 2 Tage im voraus, dass das Wetter passt und wo wir mit euch fliegen können.',
  bullet1Html: '<strong>Schnupperkurs:</strong> Bei der Einlösung der Gutscheine für den <a href="/ausbildung/schnupperkurs">Schnupperkurs</a> könnt ihr euch einen Termin in unserem Kalender aussuchen und bequem online buchen. Ihr habt über den Kalender euren Wunschtermin gebucht – dann werdet ihr über unseren Schulungsnewsletter 1 Tag im voraus informiert, dass das Wetter passt und wo der Schnupperkurs stattfindet [hierfür müsst ihr euch spätestens 3 Tage vor Kursbeginn in den Schulungsnewsletter eintragen].',
  bullet2Html: '<strong>Tandemflüge:</strong> Bei der Einlösung der Gutscheine für einen Tandemflug erfolgt die Terminvergabe über unsere Tandem-Newsletter [bitte in unseren Tandem-Newsletter unten Links eintragen]. Wir informieren euch über unseren Tandem-Newsletter 1 bis 2 Tage im voraus, dass das Wetter passt und wo wir mit euch fliegen können. Weitere Infos zu unseren Tandemflügen findet ihr <a href="/tandem">hier</a>.',
  image: '/images/gutscheine/gutschein.jpg',
  shopUrl: 'https://shop.flugschule-hirondelle.de/GUTSCHEINE/Gutschein-Tandemflug-und-Schnuppertag.html',
};

const LINK_CLASSES = '[&_a]:text-[#428bca] [&_a]:hover:text-[#2a6496] [&_a]:hover:underline [&_a]:font-medium [&_strong]:font-medium [&_strong]:text-gray-800';

export const Gutscheine = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'gutscheine'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Gutscheine content:', err));
  }, [contentId]);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">

          {/* Main Title */}
          <div className="mb-16">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              {content.heading}
            </h1>
            <div className="w-full md:w-[1200px] h-px bg-luxury-gold opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left Column (Text Content) */}
            <div className="lg:col-span-7">

              {/* Intro Text */}
              <div className="mb-10">
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-1">
                  {content.introLine1}
                </p>
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-1 ml-8 md:ml-12">
                  {content.introLine2}
                </p>
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-8 ml-8 md:ml-12">
                  {content.introLine3}
                </p>
              </div>

              <p className="text-[15px] text-gray-700 font-light leading-relaxed mb-12">
                {content.paragraph}
              </p>

              {/* Subheading */}
              <h2 className="italic text-2xl text-gray-700 font-luxury mb-5">
                {content.subheading}
              </h2>

              <div className="space-y-6 text-[15px] text-gray-600 font-light leading-relaxed mb-10">
                <p>{content.paragraph1}</p>
                <p>{content.paragraph2}</p>
              </div>

              {/* Bullet points */}
              <ul className="space-y-8 text-[15px] text-gray-600 font-light leading-relaxed list-disc pl-5 marker:text-gray-400 marker:text-sm">
                <li>
                  <SafeHtml html={content.bullet1Html} className={LINK_CLASSES} />
                </li>
                <li>
                  <SafeHtml html={content.bullet2Html} className={LINK_CLASSES} />
                </li>
              </ul>

            </div>

            {/* Right Column (Image) */}
            <div className="lg:col-span-5 pt-4">
              <a
                href={content.shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <img
                  src={content.image}
                  alt="Geschenk-Gutschein"
                  className="w-full h-auto object-cover shadow-sm border border-gray-100 rounded-sm"
                />
              </a>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
