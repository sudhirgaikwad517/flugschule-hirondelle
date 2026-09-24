import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Banner } from '../components/common/Banner';
import { useLightbox } from '../components/common/Lightbox';

// Old site's actual "Simple Image Gallery" filenames for this page
// (/images/bilder/1-firmenevents/*), in their real order (no 13 - skipped
// on the old site too). Deliberately left out of the admin-editable
// content below - a separate admin Gallery feature manages image grids
// like this one.
const GALLERY_FILES = [
  'gruppenevents1', 'gruppenevents2', 'gruppenevents3', 'gruppenevents4', 'gruppenevents5',
  'gruppenevents6', 'gruppenevents7', 'gruppenevents8', 'gruppenevents9', 'gruppenevents10',
  'gruppenevents11', 'gruppenevents12', 'gruppenevents14', 'gruppenevents15', 'gruppenevents16',
  'gruppenevents17', 'gruppenevents18', 'gruppenevents19', 'gruppenevents20', 'platzhalterbild',
];

// Fallbacks match the page's current live copy exactly, so nothing changes
// visually until an admin edits something in Admin > Seiten > Gruppenevents
// (see backend SitePageContent model / sitePageContent.routes.ts).
const DEFAULT_CONTENT = {
  heading: 'GRUPPENEVENTS',
  introLine1: 'Du willst ein Gruppenevent planen...',
  introLine2: '... das zu einem echten Überflieger werden soll?',
  paragraph1: 'Warum dann nicht mit deinen Freunden, Familienmitgliedern oder Arbeitskollegen gemeinsam in die Luft zu gehen?',
  paragraph2: 'Bei den atemberaubenden Gleitschirmflügen hoch über dem Odenwald oder der Pfalz wird das Event zu einem unvergesslichen Erlebnis, von dem ihr noch lange zehren könnt! Jede Menge Spaß und Action sind garantiert und schweißen euch als Gruppe/Team zusammen.',
  paragraph3: 'Vom eintägigen Event bis zur mehrtägigen Veranstaltung – wir stehen für eine Eventplanung in unserer Flugschule persönlich zur Verfügung und erstellen ein Angebot nach euren individuellen Vorstellungen!',
  heroImage: '/images/gruppenevents/platzhalterbild.jpg',
  contactButtonText: 'Sprechen Sie uns an',
  rowLabel: 'Firmen oder Gruppen Events',
  rowPrice: 'Preis auf Anfrage',
  cardParagraph1: 'Sie können gerne einen Termin mit uns abstimmen der dann für Ihre Firma oder Ihre Gruppe von uns geblockt wird. Am Besten sprechen Sie direkt mit uns über Ihr Vorhaben dann können wir gemeinsam ein Konzept dafür erstellen.',
  phoneDisplay: '+49 (0)6201 8452097',
  phoneHref: '+4962018452097',
  mailtoEmail: 'info@fs-hirondelle.de',
  mailtoSubject: 'Gleitschirm Event vereinbaren',
  footerButtonText: 'Termin vereinbaren',
  galleryHeading: 'IMPRESSIONEN',
};

export const Gruppenevents = ({ contentId }: { contentId?: string } = {}) => {
  const { openGallery } = useLightbox();
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'gruppenevents'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Gruppenevents content:', err));
  }, [contentId]);

  const mailto = `mailto:${content.mailtoEmail}?subject=${encodeURIComponent(content.mailtoSubject)}`;

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
            <div className="w-24 h-px bg-luxury-gold"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left Column (Main Content) */}
            <div className="lg:col-span-7">
              {/* Main Image */}
              <div className="w-full mb-10 overflow-hidden shadow-lg border border-gray-100">
                <img
                  src={content.heroImage}
                  alt="Gruppenevent Paragliding"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Text */}
              <div className="mb-10">
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-2">
                  {content.introLine1}
                </p>
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-8 ml-8 md:ml-12">
                  {content.introLine2}
                </p>
              </div>

              <div className="space-y-6 text-gray-600 font-light leading-relaxed">
                <p>{content.paragraph1}</p>
                <p>{content.paragraph2}</p>
                <p>{content.paragraph3}</p>
              </div>
            </div>

            {/* Right Column (Sidebar Cards) */}
            <div className="lg:col-span-5 flex flex-col space-y-12">

              {/* Contact Card */}
              <div className="bg-[#f2f2f2] rounded-md p-6 md:p-8 shadow-sm border border-gray-200">

                {/* Header Button */}
                <a href={mailto} className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-2.5 rounded-full mb-8 shadow-sm transition-colors">
                  <span className="text-sm md:text-base tracking-wide">{content.contactButtonText}</span>
                </a>

                <div className="flex justify-between items-center text-sm md:text-[15px] text-gray-700 mb-8 px-2 font-medium">
                  <span>{content.rowLabel}</span>
                  <span>{content.rowPrice}</span>
                </div>

                <p className="italic text-gray-600 text-[14px] md:text-[15px] leading-relaxed mb-6">
                  {content.cardParagraph1}
                </p>

                <p className="italic text-gray-600 text-[14px] md:text-[15px] leading-relaxed mb-10">
                  Gerne auch telefonisch unter <a href={`tel:${content.phoneHref}`} className="hover:text-luxury-gold transition-colors">{content.phoneDisplay}</a>
                </p>

                {/* Footer Button */}
                <a href={mailto} className="block w-full bg-slate-500 hover:bg-slate-600 text-white text-center py-3 rounded-md transition-colors duration-300 shadow-sm text-sm tracking-wide uppercase">
                  {content.footerButtonText}
                </a>
              </div>

              {/* Impressionen Gallery */}
              <div>
                <div className="mb-6">
                  <h2 className="font-luxury text-2xl md:text-3xl text-[#53a8c7] uppercase mb-4 tracking-wide">
                    {content.galleryHeading}
                  </h2>
                  <div className="w-full h-px bg-[#53a8c7] opacity-40"></div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {GALLERY_FILES.map((file, index) => (
                    <div
                      key={file}
                      className="relative aspect-square overflow-hidden group cursor-zoom-in bg-gray-100"
                      onClick={() => openGallery(
                        GALLERY_FILES.map((f) => ({ src: `/images/gruppenevents/${f}.jpg`, alt: 'Impression' })),
                        index
                      )}
                    >
                      <img
                        src={`/images/gruppenevents/${file}.jpg`}
                        alt={`Impression ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Search className="w-5 h-5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" />
                      </div>
                    </div>
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
