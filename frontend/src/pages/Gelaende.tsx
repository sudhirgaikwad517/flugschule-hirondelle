import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

interface OrtsschildBox { title: string; link: string }

interface GelaendeData {
  heading: string;
  introQuote: string;
  subheadingHtml: string;
  paragraph: string;
  mapEmbedUrl: string;
  schnupperkursLabel: string;
  schnupperkursBoxes: OrtsschildBox[];
  windeLabel: string;
  windeBoxes: OrtsschildBox[];
}

const DEFAULT_CONTENT: GelaendeData = {
  heading: 'FLUGGELÄNDE ÜBERSICHT',
  introQuote: 'Die Flugschule mit Shop und Theorieraum befindet sich in Weinheim.',
  subheadingHtml: 'Die Praxiskurse finden je nach Wetter in den Geländen vor Ort statt. Für weitere Infos zu unseren Fluggeländen einfach die Ortsschilder anklicken.',
  paragraph: 'Hier findet ihr die Beschreibung der Start- & Landeplätze, die Anfahrtsbeschreibung und Infos zu Geländebesonderheiten.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4242.9186224659925!2d8.671651451819987!3d49.555984059185896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4797db13e510f3f5%3A0xd6abf4967e8663e9!2sFlugschule%20Hirondelle!5e1!3m2!1sde!2sde!4v1588791930011!5m2!1sde!2sde',
  schnupperkursLabel: 'Schnupper-/Grundkurs:',
  schnupperkursBoxes: [
    { title: 'Billings', link: '/infos/gelaende/billings' },
    { title: 'Erlau', link: '/infos/gelaende/erlau' },
    { title: 'Gadern', link: '/infos/gelaende/gadern' },
    { title: 'Lindenfels', link: '/infos/gelaende/lindenfels' },
    { title: 'Nonrod Nordost', link: '/infos/gelaende/nonrod-nordost' },
    { title: 'Nonroder Höhe', link: '/infos/gelaende/nonrod' },
    { title: 'Stauf', link: '/infos/gelaende/stauf' },
    { title: 'Winterkasten', link: '/infos/gelaende/winterkasten' },
  ],
  windeLabel: 'Winde:',
  windeBoxes: [
    { title: 'Bad Kreuznach', link: '/infos/gelaende/bad-kreuznach' },
    { title: 'Herrenteich', link: '/infos/gelaende/herrenteich' },
  ],
};

// A fixed height (not aspect-[4/3]) is what actually keeps every box the
// same size - aspect-ratio only sets a *preferred* ratio, so a name that
// wraps to two lines (e.g. "Nonrod Nordost") still grows the button taller
// than a one-line name (e.g. "Stauf") sitting right next to it in the same
// grid row. The name gets a reserved two-line height (min-h + line-clamp)
// so the icon underneath lines up at the same spot regardless of whether
// the name actually wraps or not.
// Exact size (114.3 x 76.52px) measured directly off the original site's
// boxes via DevTools - w-full previously let the box stretch to whatever
// width the grid column happened to give it instead of matching that.
const Ortsschild = ({ title, link }: OrtsschildBox) => (
  <Link
    to={link}
    className="bg-[#FACA05] border-2 border-black rounded-md p-1 flex flex-col items-center justify-center text-center shadow-md hover:scale-105 transition-transform duration-300 w-[114px] h-[77px]"
  >
    <span className="text-black font-extrabold text-[13px] md:text-[14px] leading-tight mb-1 px-1 min-h-[2em] flex items-center justify-center">
      {title}
    </span>
    <div className="mt-auto">
      <img src="/google.png" alt="icon" className="w-7 h-7 object-contain" />
    </div>
  </Link>
);

export const Gelaende = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<GelaendeData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'gelaende'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Gelände content:', err));
  }, [contentId]);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-[1200px]">

          {/* Main Title */}
          <div className="mb-12">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              {content.heading}
            </h1>
            <div className="w-24 h-px bg-luxury-gold"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left Column (Map) */}
            <div className="lg:col-span-7">
              <div className="w-full h-[500px] lg:h-[600px] bg-gray-100 rounded-sm shadow-md overflow-hidden relative border border-gray-200">
                <iframe
                  src={content.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Flugschule Hirondelle Weinheim Location"
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>

            {/* Right Column (Text & Signs) */}
            <div className="lg:col-span-5 flex flex-col justify-center">

              <p className="italic text-gray-500 font-luxury text-xl md:text-2xl mb-6">
                {content.introQuote}
              </p>

              <SafeHtml
                className="text-2xl md:text-3xl font-light text-gray-700 leading-snug mb-6"
                html={content.subheadingHtml}
              />

              <p className="text-[14px] text-gray-500 font-light leading-relaxed mb-10">
                {content.paragraph}
              </p>

              {/* Schnupper-/Grundkurs */}
              <div className="mb-10">
                <h3 className="italic text-xl font-luxury text-gray-700 mb-5">
                  {content.schnupperkursLabel}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                  {content.schnupperkursBoxes.map((box, i) => (
                    <Ortsschild key={i} title={box.title} link={box.link} />
                  ))}
                </div>
              </div>

              {/* Winde */}
              <div>
                <h3 className="italic text-xl font-luxury text-gray-700 mb-5">
                  {content.windeLabel}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                  {content.windeBoxes.map((box, i) => (
                    <Ortsschild key={i} title={box.title} link={box.link} />
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
