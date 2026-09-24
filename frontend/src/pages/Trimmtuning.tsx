import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';

interface AddressBlock { location: string; note: string }

interface TrimmtuningData {
  eyebrow: string;
  heading: string;
  heroImage: string;
  heroAlt: string;
  blockHeading: string;
  blockSubheading: string;
  blockParagraph: string;
  leistungenHeading: string;
  leistungen: string[];
  formularButtonText: string;
  priceCardButtonText: string;
  priceLabel: string;
  priceNote: string;
  price: string;
  priceCardBottomButtonText: string;
  trimmAuftragHeading: string;
  trimmAuftragIntro: string;
  addresses: AddressBlock[];
}

const DEFAULT_CONTENT: TrimmtuningData = {
  eyebrow: 'SERVICE',
  heading: 'Trimmtuning',
  heroImage: '/images/service/trimmtuning.jpg',
  heroAlt: 'Trimmtuning',
  blockHeading: '"Trimmtuning" – das Zauberwort in der Gleitschirmszene.',
  blockSubheading: 'Für bessere und sicherere Schirme – und mehr Freude an eurem Fluggerät!',
  blockParagraph: 'Wir messen mit Laser den Ist-Zustand des Schirmes und stellen die Leinenlängen danach so optimal wie möglich nach, damit die Trimmung wieder bestmöglich dem Zulassungsmuster entspricht. Wenn wir bei der Trimmung euer Startgewicht kennen, können auch diese Werte berücksichtigt werden und der Schirm so optimal auf euch als Pilot eingestellt werden. Idealerweise kann so in der Luft mehr Leistung rausgeholt werden, ohne dass euer Schirm dadurch an Sicherheit verliert oder anspruchsvoller wird. Der Pilot erhält 2 Messdatenblätter. Einmal den Ist-Zustand vor der Trimmung und einmal danach.',
  leistungenHeading: 'UNSERE LEISTUNGEN',
  leistungen: [
    'Vermessen der Gesamtleinenlängen',
    'Nachstellen der Trimmung, idealerweise auf euer Startgewicht',
    'Nochmaliges Vermessen',
    '2 Messdatenblätter (Messwerte der Leinenlängen vor der Trimmung / angelieferter Zustand, Messwerte der Leinenlängen nach der Trimmung / ausgelieferter Zustand)',
    'inkl. Versandkosten - Hin-/Rückversand',
  ],
  formularButtonText: 'Um deinen Gleitschirm trimmen zu können, benötigen wir das ausgefüllte Formular',
  priceCardButtonText: 'Bitte das Formular unten ausfüllen',
  priceLabel: 'Trimmtuning alle Marken',
  priceNote: '[ inkl. Versand ]',
  price: '120,- €',
  priceCardBottomButtonText: 'Zum Trimm-Auftrag > Service-Auftrag unter Sonstiges ausfüllen',
  trimmAuftragHeading: 'TRIMM-AUFTRAG',
  trimmAuftragIntro: 'Du erhältst eine Kopie des Formulars per E-Mail, dieses bitte ausdrucken und zusammen mit dem Gleitschirm in unserer Flugschule oder alternativ in Landau bzw. Offenbach vorbeibringen.',
  addresses: [
    { location: '69469 Weinheim, Untergasse 27:', note: 'bitte wegen Öffnungszeiten Newsletter beachten' },
    { location: '76829 Landau Am Birnbach 6:', note: 'Termin bitte telefonisch vereinbaren' },
  ],
};

export const Trimmtuning = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<TrimmtuningData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'trimmtuning'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Trimmtuning content:', err));
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

            {/* Content Blocks */}
            <div className="space-y-6 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">
                  {content.blockHeading}
                </h3>
                <h4 className="font-luxury text-xl text-luxury-dark mb-4 italic text-[#53a8c7]">
                  {content.blockSubheading}
                </h4>
                <p className="mb-4">
                  {content.blockParagraph}
                </p>
              </div>
            </div>

            {/* Unsere Leistungen block */}
            <div className="pt-8">
              <h3 className="font-luxury text-2xl text-[#53a8c7] mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                {content.leistungenHeading}
              </h3>
              <ul className="list-disc list-outside ml-5 text-gray-600 font-light leading-relaxed space-y-2">
                {content.leistungen.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Formular Button */}
            <div className="pt-4">
              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-4 rounded-sm text-lg font-semibold transition-colors shadow-md">
                {content.formularButtonText}
              </button>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-5 space-y-12">

            {/* Pricing Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>

              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md">
                {content.priceCardButtonText}
              </button>

              <div className="space-y-6 mb-10 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-luxury-dark font-semibold">{content.priceLabel}</p>
                    <p className="text-gray-500 italic text-xs mt-1">{content.priceNote}</p>
                  </div>
                  <p className="font-bold text-luxury-dark whitespace-nowrap text-lg">{content.price}</p>
                </div>
              </div>

              <button className="w-full bg-[#4a5f68] hover:bg-[#394a51] text-white text-center py-3 px-4 font-semibold shadow-md rounded-sm transition-colors text-sm">
                {content.priceCardBottomButtonText}
              </button>
            </div>

            {/* Trimm-Auftrag Info */}
            <div>
               <h3 className="font-luxury text-2xl text-[#53a8c7] mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 {content.trimmAuftragHeading}
               </h3>
               <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                 {content.trimmAuftragIntro}
               </p>
               <div className="text-gray-600 text-sm space-y-4">
                 {content.addresses.map((addr, idx) => (
                   <p key={idx} className="leading-relaxed">
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
