import { Banner } from '../components/common/Banner';

const KACHELMANN_LINKS = [
  "Kachelmann Wetter Weinbiet 4-Tage Prognose",
  "Kachelmann Wetter Landau 4-Tage Prognose",
  "Kachelmann Wetter Michelstadt-Vielbrunn 4-Tage Prognose",
  "Kachelmann Wetter Kirchheimbolanden 4-Tage Prognose",
  "Kachelmann Wetter Mannheim 4-Tage Prognose"
];

export const Wetter = () => {
  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          
          {/* Main Title */}
          <div className="mb-16">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              WETTER
            </h1>
            <div className="w-24 h-px bg-luxury-gold"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Left Column (Main Links) */}
            <div className="lg:col-span-8">
              <ul className="space-y-12">
                {KACHELMANN_LINKS.map((link, index) => (
                  <li key={index} className="group relative">
                    <a 
                      href="#" 
                      className="block text-gray-600 italic text-[15px] md:text-lg hover:text-luxury-gold transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column (Weitere Links & Apps) */}
            <div className="lg:col-span-4">
              
              <div className="mb-12">
                <h3 className="italic text-xl md:text-2xl text-gray-700 font-luxury mb-6">Weitere Links</h3>
                
                <div className="mb-8">
                  <p className="text-[15px] text-gray-700 mb-1">Pfalz:</p>
                  <p className="text-[14px] italic text-gray-500">
                    Raspkarten -Thermik-Karten{' '}
                    <a href="#" className="text-[#53a8c7] hover:text-luxury-gold not-italic ml-1 transition-colors">
                      [ mehr ]
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="italic text-[15px] font-bold text-gray-700 mb-4">Nützliche Smartphone Apps:</h3>
                
                <div className="mb-6">
                  <p className="text-[14px] italic text-gray-500 mb-1">
                    Windfinder (der Name ist Programm)
                  </p>
                  <p className="text-[14px] text-gray-500">
                    für{' '}
                    <a href="#" className="text-[#53a8c7] hover:text-luxury-gold italic transition-colors">iOS</a> 
                    {' '}oder{' '} 
                    <a href="#" className="text-[#53a8c7] hover:text-luxury-gold italic transition-colors">Android</a>
                  </p>
                </div>

                <div>
                  <p className="text-[14px] italic text-gray-500 mb-1">
                    RegenRadar (Darstellung Fronten/Schauer)
                  </p>
                  <p className="text-[14px] text-gray-500">
                    für{' '}
                    <a href="#" className="text-[#53a8c7] hover:text-luxury-gold italic transition-colors">iOS</a> 
                    {' '}oder{' '} 
                    <a href="#" className="text-[#53a8c7] hover:text-luxury-gold italic transition-colors">Android</a>
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
