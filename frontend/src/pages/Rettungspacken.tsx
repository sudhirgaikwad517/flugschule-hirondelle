import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

interface AddressBlock { location: string; note: string }
interface PriceRow { label: string; price: string }

interface RettungspackenData {
  eyebrow: string;
  title: string;
  heroImage: string;
  heroAlt: string;
  block1Heading: string;
  paragraph1: string;
  paragraph2: string;
  redParagraph1: string;
  redParagraph2: string;
  formularButtonText: string;
  infoHeading: string;
  infoHtml: string;
  priceButtonText: string;
  priceRows: PriceRow[];
  priceNote: string;
  checkButtonText: string;
  packAuftragHeading: string;
  packAuftragIntro: string;
  addresses: AddressBlock[];
}

const DEFAULT_CONTENT: RettungspackenData = {
  eyebrow: 'SERVICE',
  title: 'Rettungsgeräte-Packservice',
  heroImage: '/images/service/rettungspackservice.png',
  heroAlt: 'Rettungsgeräte-Packservice',
  block1Heading: 'Rettung professionell gepackt – wir packen sie, als wäre es unsere eigene.',
  paragraph1: 'Wie ihr wisst, soll jede Rettung mind. einmal jährlich gepackt werden. Die Hersteller empfehlen jedoch ein kürzeres Intervall von max. 6 Monaten! Wir packen deine Rettung innerhalb von 3 Werktagen – damit ihr schnell wieder sicher abheben könnt (wenn wir nicht grade im Ausland sind... ;-)!',
  paragraph2: 'Eure Sicherheit liegt uns am Herzen – wir packen jede Rettung mit größter Sorgfalt.',
  redParagraph1: 'Wir packen alle Standardretter vom Typ Rund- bzw. Kreuzkappen - Packschlaufen Voraussetzung!.',
  redParagraph2: 'Retter, die nicht bei uns gekauft wurden bitte ggf. vorab abklären.',
  formularButtonText: 'Um deine Rettung packen zu können, benötigen wir das ausgefüllte Formular.',
  infoHeading: 'Rettung packen leicht gemacht',
  infoHtml: 'Schaut einfach mal bei einem unserer <a href="/performance/rettungsgeraetetraining" class="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Rettungsgerätetrainings</a> vorbei. Dort lernt ihr, wie die Rettung im Notfall geworfen wird und wir zeigen euch, wie ihr die Rettung selbst packen könnt! Wenn ihr auf Nummer Sicher gehen wollt oder auch keine Lust drauf habt, packen wir die Rettung natürlich auch weiterhin für euch ;-). Nähere Details zum Rettungsgerätetraining findet ihr <a href="/performance/rettungsgeraetetraining" class="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">hier</a>.',
  priceButtonText: 'Bitte das Formular unten ausfüllen',
  priceRows: [
    { label: 'Packservice Rundkappe*', price: '55,- €' },
    { label: 'Packservice Rechteckkappe*', price: '55,- €' },
  ],
  priceNote: '[ andere Rettungen / Exoten auf Anfrage ]',
  checkButtonText: 'Zum Check',
  packAuftragHeading: 'PACK-AUFTRAG',
  packAuftragIntro: 'Du erhältst eine Kopie des Formulars per E-Mail, dieses bitte ausdrucken und zusammen mit der Rettung (im Gurtzeug) in unserer Flugschule oder alternativ in Landau vorbeibringen.',
  addresses: [
    { location: '69469 Weinheim, Untergasse 27:', note: 'bitte wegen Öffnungszeiten Newsletter beachten' },
    { location: '76829 Landau Am Birnbach 6:', note: 'Termin bitte telefonisch vereinbaren' },
  ],
};

export const Rettungspacken = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<RettungspackenData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'rettungspacken'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Rettungspacken content:', err));
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
              {content.title}
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

            {/* Content Blocks */}
            <div className="space-y-6 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">
                  {content.block1Heading}
                </h3>
                <p className="mb-4">
                  {content.paragraph1}
                </p>
                <p className="mb-6">
                  {content.paragraph2}
                </p>
                <p className="text-[#cc0000] font-medium mb-4">
                  {content.redParagraph1}
                </p>
                <p className="text-[#cc0000] font-medium">
                  {content.redParagraph2}
                </p>
              </div>
            </div>

            {/* Formular Button */}
            <div className="pt-4">
              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-4 rounded-sm text-lg font-semibold transition-colors shadow-md">
                {content.formularButtonText}
              </button>
            </div>

            {/* Additional Info block */}
            <div className="pt-8">
              <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">
                {content.infoHeading}
              </h3>
              <SafeHtml
                className="text-gray-600 font-light leading-relaxed text-justify"
                html={content.infoHtml}
              />
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-5 space-y-12">

            {/* Pricing Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>

              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md">
                {content.priceButtonText}
              </button>

              <div className="space-y-6 mb-10 text-sm">
                {content.priceRows.map((row, i) => (
                  <div key={i} className="flex justify-between items-start gap-4">
                    <p className="text-luxury-dark font-semibold">{row.label}</p>
                    <p className="font-bold text-luxury-dark whitespace-nowrap text-lg">{row.price}</p>
                  </div>
                ))}

                <div className="pt-2">
                  <p className="text-gray-500 italic text-xs">{content.priceNote}</p>
                </div>
              </div>

              <Link to="/service/service-auftrag" className="w-full block bg-[#4a5f68] hover:bg-[#394a51] text-white text-center py-3 font-semibold shadow-md rounded-sm transition-colors">
                {content.checkButtonText}
              </Link>
            </div>

            {/* Pack-Auftrag Info */}
            <div>
               <h3 className="font-luxury text-2xl text-[#53a8c7] mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 {content.packAuftragHeading}
               </h3>
               <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                 {content.packAuftragIntro}
               </p>
               <div className="text-gray-600 text-sm space-y-4">
                 {content.addresses.map((addr, i) => (
                   <p key={i} className="leading-relaxed">
                     <strong className="block text-gray-800 font-semibold mb-1">{addr.location}</strong>
                     {addr.note}
                   </p>
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
