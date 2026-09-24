import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { EventComments } from '../components/common/EventComments';
import { GutscheinBox } from '../components/common/GutscheinBox';

interface Badge { label: string; color: string }

interface VogesenTourData {
  eyebrow: string;
  heading: string;
  heroImage: string;
  heroImageAlt: string;
  introParagraph1: string;
  introParagraph2: string;
  block1Heading: string;
  block1Paragraph: string;
  block2Heading: string;
  block2Paragraph: string;
  leistungenHeading: string;
  leistungen: string[];
  badges: Badge[];
  bookingButtonText: string;
  bookingButtonLink: string;
  priceLabel: string;
  price: string;
  priceNote: string;
  scheduleButtonText: string;
  scheduleButtonLink: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
}

const DEFAULT_CONTENT: VogesenTourData = {
  eyebrow: 'REISEN',
  heading: 'Vogesen-Tour',
  heroImage: '/images/reisen/vogesen.jpg',
  heroImageAlt: 'Vogesen-Tour',
  introParagraph1: "Die Vogesen (frz. les Vosges) schließen sich nahtlos an das Pfälzer Bergland an und bilden ganz im Süden mit den Fluggebieten le Treh, le Drumont, Gustiberg und Ballon d'Alsace eine phantastische Flug-Arena.",
  introParagraph2: 'Sie bieten dem Einsteiger einfache Startplätze mit großzügigen Landeplätzen im Gleitwinkelbereich, dem Fortgeschrittenen die Möglichkeit für erste Streckenflüge, sowie dem ambitionierten Piloten Raum für ausgedehnte Wanderungen unter den Wolken. Unsere jahrelange Erfahrung in diesen Fluggebieten und Startplätze für nahezu alle Windrichtungen bieten die beste Chance, den eigenen Erfahrungsschatz enorm zu erweitern.',
  block1Heading: 'Für wen ist die Reise gedacht?',
  block1Paragraph: 'Für den Gelegenheits-Genussflieger der fliegerisch dazulernen und für denjenigen, der seine ersten kleinen Streckenflüge machen möchte. Mit einer Starthöhe von über 1.000 Metern bieten die Vogesen durchaus alpine Thermik- und Streckenflugqualitäten.',
  block2Heading: 'Anreise, Unterkunft und Verpflegung',
  block2Paragraph: 'Der genaue Treffpunkt wird den Teilnehmern kurz vor Reisebeginn per Email bekannt gegeben. Wir übernachten in Frankreich auf dem Campingplatz – alternativ haben wir Kontakt zu Vermietern von Ferienwohnungen und Pensionen. Wenn gewünscht, werden wir euch dort etwas vermitteln oder für die Gruppe reservieren.',
  leistungenHeading: 'Unsere Leistungen',
  leistungen: [
    'professionelle Betreuung durch unsere Fluglehrer',
    'Gelände- und spezielle Theorieeinweisung fürs Soaring, Thermikfliegen, Streckenfliegen',
    'Flugwetterbriefing',
    'Funkbetreuung',
    'exkl. Anreise, Unterkunft, Verpflegung, Auffahrten',
  ],
  badges: [
    { label: 'Streckenflugtraining', color: '#E58E26' },
    { label: 'Thermik- und Flugtechniktraining', color: '#34963B' },
    { label: 'Soaringtraining', color: '#80C533' },
  ],
  bookingButtonText: 'Reise buchen',
  bookingButtonLink: '/events?category=Reisen',
  priceLabel: 'Tourpreis',
  price: '450,- €',
  priceNote: 'Voraussetzung: mindestens 5 Teilnehmer, A-Schein / Sopi',
  scheduleButtonText: 'Termine > siehe Kalender',
  scheduleButtonLink: '/events?search=Vogesen',
  gutscheinHeading: 'Tour Verschenken',
  gutscheinDescription: 'Die Tour ist auch als Geschenk-Gutschein möglich',
};

export const VogesenTour = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<VogesenTourData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'vogesen-tour'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Vogesen-Tour content:', err));
  }, [contentId]);

  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="pt-16 md:pt-24 pb-8 md:pb-12 px-4">
        <div className="max-w-[1200px] mx-auto">

          {/* Page Title (full width, above the two-column grid) */}
          <div className="mb-12">
            <p className="text-luxury-heading uppercase tracking-[0.2em] text-xs font-semibold mb-3">
              {content.eyebrow}
            </p>
            <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
              {content.heading}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column (Content) */}
          <div className="lg:col-span-7 space-y-12">

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm">
              <img
                src={content.heroImage}
                alt={content.heroImageAlt}
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">

              <div>
                <p className="mb-4">
                  {content.introParagraph1}
                </p>
                <p>
                  {content.introParagraph2}
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">{content.block1Heading}</h3>
                <p>
                  {content.block1Paragraph}
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">{content.block2Heading}</h3>
                <p>
                  {content.block2Paragraph}
                </p>
              </div>

            </div>

            {/* Leistungen inside Left Column */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase tracking-wider border-b border-gray-200 pb-4 text-[#53a8c7]">{content.leistungenHeading}</h3>
              <ul className="space-y-4">
                {content.leistungen.map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-gray-600 font-light text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#53a8c7] mt-2 shrink-0"></span>
                    <span className="leading-relaxed whitespace-pre-line">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-5 space-y-12">

            {/* Badges */}
            <div className="flex flex-col gap-1 w-full font-semibold text-white text-center text-sm">
              {content.badges.map((badge, idx) => (
                <div key={idx} style={{ backgroundColor: badge.color }} className="py-2">{badge.label}</div>
              ))}
            </div>

            {/* Booking Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>

              <Link
                to={content.bookingButtonLink}
                className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-8 shadow-md flex items-center justify-center gap-2"
              >
                {content.bookingButtonText}
              </Link>

              <div className="space-y-6 mb-8 text-sm">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-luxury-dark font-medium">{content.priceLabel}</p>
                    <div className="text-right">
                      <p className="font-medium text-luxury-dark whitespace-nowrap text-lg">{content.price}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 font-light mb-4">{content.priceNote}</p>
                </div>
              </div>

              <Link to={content.scheduleButtonLink} className="block w-full bg-[#4a5f68] hover:bg-[#3d4f57] text-white text-center py-3 font-semibold shadow-md transition-colors">
                {content.scheduleButtonText}
              </Link>
            </div>

            <GutscheinBox
              heading={content.gutscheinHeading}
              description={content.gutscheinDescription}
              headingClassName="text-[#53a8c7]"
            />

          </div>

          </div>
        </div>

        <div id="comments" className="max-w-[1200px] mx-auto mt-12">
          <EventComments pageSlug="vogesen-tour" />
        </div>
      </section>

    </div>
  );
};
