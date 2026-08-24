import { Banner } from '../components/common/Banner';
import { Link } from 'react-router-dom';

export const Gutscheine = () => {
  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          
          {/* Main Title */}
          <div className="mb-16">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              GESCHENK-GUTSCHEIN
            </h1>
            <div className="w-full md:w-[1200px] h-px bg-luxury-gold opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Column (Text Content) */}
            <div className="lg:col-span-7">
              
              {/* Intro Text */}
              <div className="mb-10">
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-1">
                  ...nicht schon wieder Socken ;-) ...
                </p>
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-1 ml-8 md:ml-12">
                  Du suchst ein schönes Geschenk
                </p>
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-8 ml-8 md:ml-12">
                  und möchtest einem lieben Menschen einen Traum erfüllen?
                </p>
              </div>

              <p className="text-[15px] text-gray-700 font-light leading-relaxed mb-12">
                Bei uns erhältst du Gutscheine für alle Kurse, Weiterbildungen, Reisen oder auch für Tandemflüge.
              </p>

              {/* Subheading */}
              <h2 className="italic text-2xl text-gray-700 font-luxury mb-5">
                Gutschein einlösen – so geht's
              </h2>
              
              <div className="space-y-6 text-[15px] text-gray-600 font-light leading-relaxed mb-10">
                <p>
                  Unsere Gutscheine könnt ihr wie ein Zahlungsmittel einsetzen – ihr bringt sie einfach zum Termin mit!
                </p>
                <p>
                  Gleitschirmfliegen ist wetterabhängig. Wir brauchen Wind in richtiger Stärke und aus der geeigneten Richtung. Weil es selbst den besten Wetterfröschen kaum möglich ist, das Wetter auf längere Sicht abzuschätzen, bieten wir euch ein eigenes System zur Termin-/Ortsankündigung an, um die vereinbarten Tandemflüge und geplante Schnupperkurse sicher durchzuführen. Hierüber informieren wir euch 1 bis 2 Tage im voraus, dass das Wetter passt und wo wir mit euch fliegen können.
                </p>
              </div>

              {/* Bullet points */}
              <ul className="space-y-8 text-[15px] text-gray-600 font-light leading-relaxed list-disc pl-5 marker:text-gray-400 marker:text-sm">
                <li>
                  <span className="font-medium text-gray-800">Schnupperkurs:</span> Bei der Einlösung der Gutscheine für den{' '}
                  <Link to="/ausbildung/schnupperkurs" className="text-[#53a8c7] hover:text-luxury-gold transition-colors">
                    Schnupperkurs
                  </Link>
                  {' '}könnt ihr euch einen Termin in unserem Kalender aussuchen und bequem online buchen. Ihr habt über den Kalender euren Wunschtermin gebucht – dann werdet ihr über unseren Schulungsnewsletter 1 Tag im voraus informiert, dass das Wetter passt und wo der Schnupperkurs stattfindet [hierfür müsst ihr euch spätestens 3 Tage vor Kursbeginn in den Schulungsnewsletter eintragen].
                </li>
                <li>
                  <span className="font-medium text-gray-800">Tandemflüge:</span> Bei der Einlösung der Gutscheine für einen Tandemflug erfolgt die Terminvergabe über unsere Tandem-Newsletter [bitte in unseren Tandem-Newsletter unten Links eintragen]. Wir informieren euch über unseren Tandem-Newsletter 1 bis 2 Tage im voraus, dass das Wetter passt und wo wir mit euch fliegen können. Weitere Infos zu unseren Tandemflügen findet ihr{' '}
                  <Link to="/tandem" className="text-[#53a8c7] hover:text-luxury-gold transition-colors">
                    hier
                  </Link>
                  .
                </li>
              </ul>

            </div>

            {/* Right Column (Image) */}
            <div className="lg:col-span-5 pt-4">
              <div className="w-full">
                <img 
                  src="https://picsum.photos/seed/gutschein/800/533" 
                  alt="Geschenk-Gutschein" 
                  className="w-full h-auto object-cover shadow-sm border border-gray-100 rounded-sm"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
