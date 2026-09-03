import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Wann bzw. wie fange ich Gleitschirmfliegen an?',
    answer: (
      <>
        Die Ausbildung beginnt mit dem <Link to="/ausbildung/l-schein" className="text-[#53a8c7] hover:underline">Grundkurs</Link> oder optional davor mit einem{' '}
        <Link to="/ausbildung/schnupperkurs" className="text-[#53a8c7] hover:underline">Schnupperkurs</Link>. Danach folgt die Höhenflugschulung mit abschließender Prüfung zum{' '}
        <Link to="/ausbildung/a-schein" className="text-[#53a8c7] hover:underline">A-Schein</Link>, mit dem du dann selbständig fliegen darfst. Gerne beraten wir dich zum Ausbildungsverlauf in unserer{' '}
        <Link to="/infos#kontakt" className="text-[#53a8c7] hover:underline">Flugschule</Link> oder auch per Telefon, den Kurs buchen kannst du dann direkt online.
      </>
    )
  },
  {
    question: 'Wie alt muss man mindestens sein, um an einem Kurs teilnehmen zu können?',
    answer: (
      <>
        Das Mindestalter für die Teilnahme an Kursen liegt bei 14 Jahren, wobei bei Teilnahme Minderjähriger eine schriftliche Einverständniserklärung beider Erziehungsberechtigten erforderlich ist. Nach oben hin gibt es keine Altersgrenze! Noch unsicher? Unser{' '}
        <Link to="/ausbildung/schnupperkurs" className="text-[#53a8c7] hover:underline">Schnupperkurs</Link> bietet dir die Möglichkeit, Gleitschirmfliegen unverbindlich zu testen.
      </>
    )
  },
  {
    question: 'Wo finden die Kurse statt?',
    answer: (
      <>
        Alle unsere Fluggelände findet ihr <Link to="/infos/gelaende" className="text-[#53a8c7] hover:underline">hier</Link>.
      </>
    )
  },
  {
    question: 'Wie lange dauert ein Schnupperkurs?',
    answer: (
      <>
        Der <Link to="/ausbildung/schnupperkurs" className="text-[#53a8c7] hover:underline">Schnupperkurs</Link> findet in der Regel am Wochenende (Samstag & Sonntag) statt. Wir beginnen meist früh um 8.00 Uhr und schulen bis Nachmittags (15.00 bis 17.00 Uhr) – solange es das Wetter zulässt.
      </>
    )
  },
  {
    question: 'Was muss ich zum Schnupperkurs mitbringen?',
    answer: (
      <>
        Wichtigste Voraussetzung für den <Link to="/ausbildung/schnupperkurs" className="text-[#53a8c7] hover:underline">Schnupperkurs</Link> sind <strong>feste, überknöchelhohe (Wander-)Schuhe</strong>, lange Hosen, Sonnencreme, Getränke/Verpflegung und jede Menge gute Laune.
      </>
    )
  },
  {
    question: 'Welche Ausrüstung benötige ich für die Kurse?',
    answer: (
      <>
        Zum Gleitschirmfliegen benötigst du zunächst nur feste, überknöchelhohe (Wander-)Schuhe sowie normale (Outdoor-)Kleidung. Alles weitere wie Gleitschirm, Gurtzeug etc. wird beim{' '}
        <Link to="/ausbildung/schnupperkurs" className="text-[#53a8c7] hover:underline">Schnupperkurs</Link> und <Link to="/ausbildung/l-schein" className="text-[#53a8c7] hover:underline">Grundkurs</Link> von uns gestellt. Danach fliegt ihr mit eigener Ausrüstung oder alternativ mit Leihausrüstung, hier beraten wir euch gerne bei uns in der{' '}
        <Link to="/infos#kontakt" className="text-[#53a8c7] hover:underline">Flugschule</Link>.
      </>
    )
  },
  {
    question: 'Was kann ich nach Abschluss des Grundkurses im Gleitschirmfliegen?',
    answer: (
      <>
        Der <Link to="/ausbildung/l-schein" className="text-[#53a8c7] hover:underline">Grundkurs</Link> bildet die Basis für die Teilnahme an der Höhenflugschulung ({' '}
        <Link to="/ausbildung/a-schein" className="text-[#53a8c7] hover:underline">A-Schein</Link>). Hauptlernziele sind Starten, Steuern, Landen.
      </>
    )
  },
  {
    question: 'Wie lange dauert der A-Schein (Höhenflugschulung)?',
    answer: (
      <>
        Da wir abhängig vom Wetter sind, kann man schwer sagen, wie lange es genau dauert. Geht man davon aus, jeden Tag passendes Wetter und Zeit zu haben, kann man für die{' '}
        <Link to="/ausbildung/a-schein" className="text-[#53a8c7] hover:underline">A-Schein-Ausbildung</Link> ca. 1 bis 3 Wochen einplanen. Kann aber auch länger dauern.
      </>
    )
  },
  {
    question: 'Ich bin Pilot/in, aber schon längere Zeit nicht mehr geflogen und möchte wieder anfangen.',
    answer: (
      <>
        Für alle, die längere Zeit nicht geflogen sind, bieten wir <Link to="/performance/refresher" className="text-[#53a8c7] hover:underline">Refresher-Kurse</Link> an. So gelingt ein sicherer und erfolgreicher Wiedereinstieg mit Fluglehrerbetreuung.
      </>
    )
  }
];

const AccordionItem = ({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) => (
  <div className="border-b border-gray-200">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 py-5 text-left"
    >
      <span className="font-luxury text-lg md:text-xl text-luxury-dark">{item.question}</span>
      <ChevronDown className={`w-5 h-5 text-luxury-gold shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
      <div className="overflow-hidden">
        <p className="text-gray-600 font-light leading-relaxed pb-6 pr-8">{item.answer}</p>
      </div>
    </div>
  </div>
);

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">

          {/* Main Title */}
          <div className="mb-16">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              Häufig gestellte Fragen
            </h1>
            <div className="w-24 h-px bg-luxury-gold opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left Column - Accordion */}
            <div className="lg:col-span-7">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={index}
                  item={item}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>

            {/* Right Column - Contact */}
            <div className="lg:col-span-5">
              <div className="bg-[#FAF9F7] border border-gray-100">
                <div className="px-8 pt-8">
                  <h2 className="font-luxury text-2xl text-luxury-dark uppercase tracking-wide mb-6">Noch Fragen?!</h2>
                </div>
                <img src="/images/inhalte/fragen_4.jpg" alt="Noch Fragen?" className="w-full h-auto" />
                <div className="p-8 space-y-4 text-[15px] text-gray-600 font-light leading-relaxed">
                  <p>Wir vom Team Hirondelle stehen euch für alle eure Anliegen gerne zur Verfügung! Sprecht uns an oder besucht uns in der Flugschule!</p>
                  <p>
                    <span className="font-semibold text-luxury-dark">Öffnungszeiten</span><br />
                    nach Vereinbarung<br />
                    (Wird per Newsletter bekannt gegeben)
                  </p>
                  <div className="w-full h-px bg-gray-200"></div>
                  <p>
                    Flugschule Hirondelle<br />
                    Untergasse 27<br />
                    69469 Weinheim / Germany
                  </p>
                  <p>
                    <a href="mailto:info@fs-hirondelle.de" className="text-[#53a8c7] hover:underline">info@fs-hirondelle.de</a>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
