import { Banner } from '../components/common/Banner';

const SCHNUPPER_KURS_GELAENDE = [
  'Billings', 'Erlau', 'Gadern', 'Lindenfels',
  'Nonrod Nordost', 'Nonroder Höhe', 'Stauf', 'Winterkasten'
];

const WINDE_GELAENDE = [
  'Bad Kreuznach', 'Herrenteich'
];

const Ortsschild = ({ name }: { name: string }) => (
  <button className="bg-[#FACA05] border-2 border-black rounded-md p-2 flex flex-col items-center justify-center text-center shadow-md hover:scale-105 transition-transform duration-300 w-full aspect-[4/3]">
    <span className="text-black font-bold text-[11px] md:text-[12px] leading-tight mb-2 px-1">
      {name}
    </span>
    <div className="mt-auto">
      <img src="/google.png" alt="icon" className="w-6 h-6 object-contain" />
    </div>
  </button>
);

export const Gelaende = () => {
  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          
          {/* Main Title */}
          <div className="mb-12">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              FLUGGELÄNDE ÜBERSICHT
            </h1>
            <div className="w-24 h-px bg-luxury-gold"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Column (Map) */}
            <div className="lg:col-span-7">
              <div className="w-full h-[500px] lg:h-[600px] bg-gray-100 rounded-sm shadow-md overflow-hidden relative border border-gray-200">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2595.660155239922!2d8.6657929!3d49.5446328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4797cf9286eb2973%3A0x1d5821cba50ef12!2sUntergasse%2027%2C%2069469%20Weinheim%2C%20Germany!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Flugschule Hirondelle Weinheim Location"
                  className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-1000"
                ></iframe>
              </div>
            </div>

            {/* Right Column (Text & Signs) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              
              <p className="italic text-gray-500 font-luxury text-xl md:text-2xl mb-6">
                Die Flugschule mit Shop und Theorieraum befindet sich in Weinheim.
              </p>

              <h2 className="text-2xl md:text-3xl font-light text-gray-700 leading-snug mb-6">
                Die Praxiskurse finden je nach Wetter in den Geländen vor Ort statt. Für weitere Infos zu unseren Fluggeländen einfach die Ortsschilder anklicken.
              </h2>

              <p className="text-[14px] text-gray-500 font-light leading-relaxed mb-10">
                Hier findet ihr die Beschreibung der Start- & Landeplätze, die Anfahrtsbeschreibung und Infos zu Geländebesonderheiten.
              </p>

              {/* Schnupper-/Grundkurs */}
              <div className="mb-10">
                <h3 className="italic text-xl font-luxury text-gray-700 mb-5">
                  Schnupper-/Grundkurs:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {SCHNUPPER_KURS_GELAENDE.map((name) => (
                    <Ortsschild key={name} name={name} />
                  ))}
                </div>
              </div>

              {/* Winde */}
              <div>
                <h3 className="italic text-xl font-luxury text-gray-700 mb-5">
                  Winde:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {WINDE_GELAENDE.map((name) => (
                    <Ortsschild key={name} name={name} />
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
