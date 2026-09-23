import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

interface ReparaturServiceData {
  eyebrow: string;
  heading: string;
  heroImage: string;
  heroAlt: string;
  werkstattImage: string;
  werkstattAlt: string;
  contentHeading: string;
  contentHtml: string;
  bookingButtonText: string;
  priceLabel: string;
  priceText: string;
  noteHtml: string;
  footerButtonText: string;
  footerButtonLink: string;
}

const DEFAULT_CONTENT: ReparaturServiceData = {
  eyebrow: 'SERVICE',
  heading: 'Reparatur-Service',
  heroImage: '/images/service/reparatur.jpg',
  heroAlt: 'Reparatur-Service',
  werkstattImage: '/images/service/werkstatt.jpg',
  werkstattAlt: 'Werkstatt',
  contentHeading: 'Du hast einen Defekt an deiner Ausrüstung? Einen Riß in deinem Gleitschirm? Wir retten was noch zu retten ist ;-)',
  contentHtml: 'Wir bieten euch einen professionellen Reparatur-Service für eure Ausrüstung an. Die notwendigen Reparatur-Arbeiten führen wir in unserer Service-Werkstätte mit größter Sorgfalt und modernster Technik durch – damit ihr schnell wieder sicher abheben könnt! Nach Absprache führen wir auch gerne Teile des <a href="/service/2-jahres-check" class="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">2-Jahres-Checks</a> im Rahmen der Reparatur durch.',
  bookingButtonText: 'Meldet euch wir schauen es uns an',
  priceLabel: 'Reparaturen aller Marken',
  priceText: 'Preis auf Anfrage',
  noteHtml: 'Bitte vereinbare für den Reparaturservice einen Termin mit uns. Hierzu könnt ihr in der <a href="/infos#kontakt" class="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Flugschule</a> vorbeischauen oder ihr meldet euch telefonisch unter 0151 18836000',
  footerButtonText: 'Termin vereinbaren',
  footerButtonLink: '/infos#kontakt',
};

export const ReparaturService = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<ReparaturServiceData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'reparatur'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Reparatur-Service content:', err));
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
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm group cursor-pointer">
              <img
                src={content.heroImage}
                alt={content.heroAlt}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Content Blocks with floated image */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex-shrink-0">
                <div className="w-full h-[250px] relative overflow-hidden rounded-sm shadow-sm group cursor-pointer">
                  <img
                    src={content.werkstattImage}
                    alt={content.werkstattAlt}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="md:w-2/3 space-y-6 text-gray-600 font-light leading-relaxed text-justify">
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic leading-tight">
                  {content.contentHeading}
                </h3>
                <SafeHtml html={content.contentHtml} />
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-5 space-y-12">

            {/* Pricing Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>

              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md">
                {content.bookingButtonText}
              </button>

              <div className="space-y-6 mb-10 text-sm">
                <div className="flex justify-between items-start gap-4 border-b border-gray-200 pb-4">
                  <p className="text-luxury-dark font-semibold">{content.priceLabel}</p>
                  <p className="text-gray-600 whitespace-nowrap">{content.priceText}</p>
                </div>

                <SafeHtml className="text-gray-500 italic text-xs leading-relaxed" html={content.noteHtml} />
              </div>

              <Link to={content.footerButtonLink} className="block w-full bg-[#4a5f68] hover:bg-[#394a51] text-white text-center py-3 font-semibold shadow-md rounded-sm transition-colors">
                {content.footerButtonText}
              </Link>
            </div>

          </div>

          </div>
        </div>
      </section>

    </div>
  );
};
