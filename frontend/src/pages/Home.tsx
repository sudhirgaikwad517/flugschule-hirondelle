import { useState, useEffect } from 'react';
import { Banner } from '../components/common/Banner';

export const Home = () => {
  const [media, setMedia] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/pagemedia/public/home`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => setMedia(data))
      .catch(err => console.error('Error fetching home media:', err));
  }, []);

  const getImage = (index: number, fallbackSrc: string) => {
    if (media?.galleryImages && media.galleryImages[index]) {
      return media.galleryImages[index];
    }
    return fallbackSrc;
  };
  return (
    <div className="w-full bg-white font-luxurysans">

      {/* 1. HERO SECTION */}
      <Banner />

      {/* 2. PROMO CARDS / UNSERE HIGHLIGHTS */}
      <section className="pt-8 pb-24 bg-white px-4 relative z-30 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          
          <div className="text-center mb-16">
            <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-4">
              ENTDECKEN SIE MEHR
            </p>
            <h2 className="font-luxury text-4xl md:text-6xl text-luxury-dark">UNSERE HIGHLIGHTS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Box 1: Fliegen Lernen */}
            <div className="relative h-[400px] group overflow-hidden bg-white shadow-xl cursor-pointer">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${getImage(7, '/images/ausbildung-5.jpg')}")` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/90 via-luxury-dark/40 to-black/20"></div>
              <div className="absolute inset-4 border border-white/20 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
              
              <div className="absolute top-8 left-8 right-8 z-20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center overflow-hidden bg-white">
                  <img src="/google.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-luxury text-white text-2xl uppercase tracking-widest">Fliegen Lernen</h3>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-white font-bold text-sm mb-2">Der Anfang einer neuen Leidenschaft!</p>
                <p className="text-white/80 text-sm font-light leading-relaxed">
                  Reinschnuppern beim 1-Tageskurs oder Schnupperwochenende
                </p>
              </div>
            </div>

            {/* Box 2: Shop Geöffnet */}
            <div className="relative h-[400px] group overflow-hidden bg-white shadow-xl cursor-pointer">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${getImage(8, '/images/ausbildung-6.jpg')}")` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/90 via-luxury-dark/40 to-black/20"></div>
              <div className="absolute inset-4 border border-white/20 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
              
              <div className="absolute top-8 left-8 right-8 z-20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center overflow-hidden bg-white">
                  <img src="/google.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-luxury text-white text-2xl uppercase tracking-widest">Shop Geöffnet</h3>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-white font-bold text-sm mb-2">Donnerstag, 16.7.26 16-19 Uhr</p>
                <p className="text-white/80 text-sm font-light leading-relaxed">
                  Alex und Sarah sind für euch in Weinheim im Laden, bitte unbedingt voranmelden!
                </p>
              </div>
            </div>

            {/* Box 3: On Tour */}
            <div className="relative h-[400px] group overflow-hidden bg-white shadow-xl cursor-pointer">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${getImage(9, '/images/ausbildung-1.jpg')}")` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/90 via-luxury-dark/40 to-black/20"></div>
              <div className="absolute inset-4 border border-white/20 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
              
              <div className="absolute top-8 left-8 right-8 z-20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center overflow-hidden bg-white">
                  <img src="/google.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-luxury text-white text-2xl uppercase tracking-widest">On Tour...</h3>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-white font-bold text-sm mb-2">23.1. - 6.2.2027 | Kolumbien</p>
                <p className="text-white/80 text-sm font-light leading-relaxed">
                  Fliegen über den grünen Landschaften des Valle del Cauca in den besten Fluggebieten von Cali Richtung Medellin...
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. NEWS & HOCH HINAUS (CONTENT FROM OLD SITE) */}
      <section className="pt-8 pb-24 bg-white px-4 border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16">
          
          {/* Left: NEWS */}
          <div className="w-full lg:w-5/12 flex flex-col">
            <div className="mb-10">
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                AKTUELLES
              </p>
              <h2 className="font-luxury text-4xl md:text-5xl text-luxury-dark">NEWS</h2>
            </div>
            
            <div className="w-full overflow-hidden h-[500px] flex items-start justify-start">
               {/* Facebook Page Plugin Iframe */}
               <iframe 
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Ffshirondelle&tabs=timeline&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none', overflow: 'hidden', maxWidth: '100%', minWidth: '280px' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
               </iframe>
            </div>
          </div>

          {/* Right: HOCH HINAUS & TEAM */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <div className="mb-10">
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                ...mit dem Team Hirondelle
              </p>
              <h2 className="font-luxury text-4xl md:text-5xl text-luxury-dark">HOCH HINAUS</h2>
            </div>
            
            <div className="text-gray-500 font-light leading-relaxed text-sm md:text-base space-y-6 mb-16">
              <p>
                Willkommen bei der Flugschule Hirondelle, der Gleitschirmschule im Rhein-Main-Neckar Dreieck. Fliegen lernen mit dem Team Hirondelle heißt: Persönliche und individuelle auf den Schüler zugeschnittene Ausbildung. Unser Team besteht aus sehr erfahrenen und ambitionierten Fluglehrern.
              </p>
              <p>
                Alles natürlich an genialen Schulungshängen im Raum Odenwald, Kraichtal, Nahetal und in der Pfalz.
              </p>
            </div>

            {/* Team Members - top row: Alex & Sarah, bottom row: the rest */}
            <div className="flex flex-col gap-y-12">
              <div className="flex justify-center gap-x-10 sm:gap-x-16">
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border border-luxury-gold/30 group-hover:border-luxury-gold transition-colors p-1">
                    <img src="/images/team/schlink.jpg" className="w-full h-full rounded-full object-cover" alt="Alex" />
                  </div>
                  <span className="font-luxury text-lg text-luxury-dark tracking-wide">Alex</span>
                </div>
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border border-luxury-gold/30 group-hover:border-luxury-gold transition-colors p-1">
                    <img src="/images/team/sarah.jpg" className="w-full h-full rounded-full object-cover" alt="Sarah" />
                  </div>
                  <span className="font-luxury text-lg text-luxury-dark tracking-wide">Sarah</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 sm:gap-x-10 gap-y-10">
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border border-luxury-gold/30 group-hover:border-luxury-gold transition-colors p-1">
                    <img src="/images/team/tobi.jpg" className="w-full h-full rounded-full object-cover" alt="Tobi" />
                  </div>
                  <span className="font-luxury text-lg text-luxury-dark tracking-wide">Tobi</span>
                </div>
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border border-luxury-gold/30 group-hover:border-luxury-gold transition-colors p-1">
                    <img src="/images/team/holger.jpg" className="w-full h-full rounded-full object-cover" alt="Holger" />
                  </div>
                  <span className="font-luxury text-lg text-luxury-dark tracking-wide">Holger</span>
                </div>
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border border-luxury-gold/30 group-hover:border-luxury-gold transition-colors p-1">
                    <img src="/images/team/markus.jpg" className="w-full h-full rounded-full object-cover" alt="Markus" />
                  </div>
                  <span className="font-luxury text-lg text-luxury-dark tracking-wide">Markus</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
