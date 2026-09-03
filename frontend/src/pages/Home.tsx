import { Car, Laptop, Sun, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { useState, useEffect } from 'react';

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

  const getSquareImage = (index: number, fallbackSrc: string) => {
    if (media?.galleryImages && media.galleryImages[index]) {
      return media.galleryImages[index];
    }
    return fallbackSrc;
  };
  return (
    <div className="w-full bg-white font-luxurysans">
      
      {/* 1. HERO SECTION */}
      <Banner />

      {/* 2. INTRO TEXT SECTION */}
      <section className="py-24 md:py-32 bg-white px-4 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-8">
            LEIDENSCHAFT FÜRS FLIEGEN TRIFFT AUF PROFESSIONELLE AUSBILDUNG
          </p>
          <p className="font-luxury text-3xl md:text-5xl text-luxury-dark leading-[1.4] mx-auto">
            Die Flugschule Hirondelle im Herzen der Region ist ein Meisterstück der Fliegerei und bietet moderne Ausbildung mit unvergleichlichen Fluggebieten und erfahrenen Fluglehrern.
          </p>
        </div>
      </section>

      {/* 3. HORIZONTAL IMAGE GALLERY */}
      <section className="w-full flex overflow-hidden h-[400px] md:h-[600px] relative">
        <div className="w-1/3 h-full overflow-hidden relative group">
          <img src={getSquareImage(0, '/images/ausbildung-6.jpg')} alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
        </div>
        <div className="w-1/3 h-full overflow-hidden relative group">
          <img src={getSquareImage(1, '/images/ausbildung-5.jpg')} alt="Gallery 2" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
        </div>
        <div className="w-1/3 h-full overflow-hidden relative group">
          <img src={getSquareImage(2, '/images/ausbildung-4.jpg')} alt="Gallery 3" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
        </div>
        
        {/* Navigation Arrows (Decorative) */}
        <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer hover:bg-gray-50">
            <ChevronLeft className="w-5 h-5 text-luxury-dark" />
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer hover:bg-gray-50">
            <ChevronRight className="w-5 h-5 text-luxury-dark" />
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCES CARDS (LUXURY THEME) */}
      <section className="py-24 bg-[#FAF9F7] px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-4">
              ERLEBEN SIE ULTIMATIVE FLUGERLEBNISSE
            </p>
            <h2 className="font-luxury text-4xl md:text-6xl text-luxury-dark">IHR FLUGPARADIES</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="relative h-[550px] group overflow-hidden bg-white shadow-sm cursor-pointer">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${getImage(3, '/images/ausbildung-1.jpg')}")` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/90 via-luxury-dark/20 to-transparent"></div>
              
              {/* Inner Border */}
              <div className="absolute inset-4 border border-luxury-gold/50 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold"></div>
              
              {/* Price Badge */}
              <div className="absolute top-8 left-8 bg-white px-4 py-2 z-20 shadow-md">
                <span className="text-luxury-dark text-xs font-bold tracking-widest">120€ / PERSON</span>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-white uppercase tracking-[0.2em] text-[10px] font-bold mb-2">
                  EINSTIEG
                </p>
                <h3 className="font-luxury text-white text-3xl mb-4">Schnupperkurs</h3>
                <Link to="/ausbildung" className="text-white/90 uppercase tracking-widest text-[11px] font-medium flex items-center gap-2 group-hover:text-luxury-gold transition-colors">
                  DETAILS ANSEHEN <span className="text-sm">›</span>
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative h-[550px] group overflow-hidden bg-white shadow-sm cursor-pointer">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${getImage(4, '/images/ausbildung-2.jpg')}")` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/90 via-luxury-dark/20 to-transparent"></div>
              <div className="absolute inset-4 border border-luxury-gold/50 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold"></div>
              
              <div className="absolute top-8 left-8 bg-white px-4 py-2 z-20 shadow-md">
                <span className="text-luxury-dark text-xs font-bold tracking-widest">590€ / PERSON</span>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-white uppercase tracking-[0.2em] text-[10px] font-bold mb-2">
                  AUSBILDUNG
                </p>
                <h3 className="font-luxury text-white text-3xl mb-4">Grundkurs</h3>
                <Link to="/ausbildung" className="text-white/90 uppercase tracking-widest text-[11px] font-medium flex items-center gap-2 group-hover:text-luxury-gold transition-colors">
                  DETAILS ANSEHEN <span className="text-sm">›</span>
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative h-[550px] group overflow-hidden bg-white shadow-sm cursor-pointer">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${getImage(5, '/images/ausbildung-3.jpg')}")` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/90 via-luxury-dark/20 to-transparent"></div>
              <div className="absolute inset-4 border border-luxury-gold/50 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold"></div>
              
              <div className="absolute top-8 left-8 bg-white px-4 py-2 z-20 shadow-md">
                <span className="text-luxury-dark text-xs font-bold tracking-widest">950€ / PERSON</span>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-white uppercase tracking-[0.2em] text-[10px] font-bold mb-2">
                  AUSBILDUNG
                </p>
                <h3 className="font-luxury text-white text-3xl mb-4">Höhenflugkurs</h3>
                <Link to="/ausbildung" className="text-white/90 uppercase tracking-widest text-[11px] font-medium flex items-center gap-2 group-hover:text-luxury-gold transition-colors">
                  DETAILS ANSEHEN <span className="text-sm">›</span>
                </Link>
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative h-[550px] group overflow-hidden bg-white shadow-sm cursor-pointer">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${getImage(6, '/images/ausbildung-4.jpg')}")` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/90 via-luxury-dark/20 to-transparent"></div>
              <div className="absolute inset-4 border border-luxury-gold/50 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold"></div>
              
              <div className="absolute top-8 left-8 bg-white px-4 py-2 z-20 shadow-md">
                <span className="text-luxury-dark text-xs font-bold tracking-widest">1450€ / PERSON</span>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-white uppercase tracking-[0.2em] text-[10px] font-bold mb-2">
                  REISEN
                </p>
                <h3 className="font-luxury text-white text-3xl mb-4">Kolumbien Tour</h3>
                <Link to="/reisen" className="text-white/90 uppercase tracking-widest text-[11px] font-medium flex items-center gap-2 group-hover:text-luxury-gold transition-colors">
                  DETAILS ANSEHEN <span className="text-sm">›</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. PROMO CARDS (From Old Website) */}
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

            {/* Team Members */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-6">
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
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border border-luxury-gold/30 group-hover:border-luxury-gold transition-colors p-1">
                  <img src="/images/team/tobi.jpg" className="w-full h-full rounded-full object-cover" alt="Tobi" />
                </div>
                <span className="font-luxury text-lg text-luxury-dark tracking-wide">Tobi</span>
              </div>
              <div className="flex flex-col items-center group cursor-pointer md:col-start-1 md:ml-12 lg:ml-16">
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border border-luxury-gold/30 group-hover:border-luxury-gold transition-colors p-1">
                  <img src="/images/team/holger.jpg" className="w-full h-full rounded-full object-cover" alt="Holger" />
                </div>
                <span className="font-luxury text-lg text-luxury-dark tracking-wide">Holger</span>
              </div>
              <div className="flex flex-col items-center group cursor-pointer md:col-start-2 md:mr-12 lg:mr-16">
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border border-luxury-gold/30 group-hover:border-luxury-gold transition-colors p-1">
                  <img src="/images/team/markus.jpg" className="w-full h-full rounded-full object-cover" alt="Markus" />
                </div>
                <span className="font-luxury text-lg text-luxury-dark tracking-wide">Markus</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. THE ESSENTIALS (SERVICES) */}
      <section className="pt-8 pb-24 bg-white px-4">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16">
          
          {/* Left: Text & Icons */}
          <div className="w-full lg:w-1/2">
            <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-4">
              ENTDECKEN SIE UNSERE DIENSTLEISTUNGEN
            </p>
            <h2 className="font-luxury text-5xl md:text-6xl text-luxury-dark mb-16">UNSER ANGEBOT</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-8">
              {/* Service 1 */}
              <div className="flex gap-4">
                <Car className="w-10 h-10 text-luxury-gold flex-shrink-0 stroke-[1.5]" />
                <div>
                  <h4 className="font-luxury text-2xl text-luxury-dark mb-2">Shuttle-Service</h4>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">
                    Bequemer Transport direkt zu den Startplätzen in unserem komfortablen Schulbus.
                  </p>
                </div>
              </div>
              
              {/* Service 2 */}
              <div className="flex gap-4">
                <img src="/google.png" alt="Logo" className="w-10 h-10 flex-shrink-0 object-contain" />
                <div>
                  <h4 className="font-luxury text-2xl text-luxury-dark mb-2">Moderne Ausrüstung</h4>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">
                    Wir stellen die neueste und sicherste Ausrüstung für deine Flüge zur Verfügung.
                  </p>
                </div>
              </div>

              {/* Service 3 */}
              <div className="flex gap-4">
                <Laptop className="w-10 h-10 text-luxury-gold flex-shrink-0 stroke-[1.5]" />
                <div>
                  <h4 className="font-luxury text-2xl text-luxury-dark mb-2">Online-Theorie</h4>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">
                    Bereite dich bequem von zu Hause mit unserer digitalen Lernplattform vor.
                  </p>
                </div>
              </div>

              {/* Service 4 */}
              <div className="flex gap-4">
                <Sun className="w-10 h-10 text-luxury-gold flex-shrink-0 stroke-[1.5]" />
                <div>
                  <h4 className="font-luxury text-2xl text-luxury-dark mb-2">Wetterbriefing</h4>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">
                    Tägliche detaillierte Wetteranalysen für maximale Sicherheit am Berg.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Image Collage */}
          <div className="w-full lg:w-1/2 flex gap-4 h-[600px]">
            <div className="w-1/2 h-full pt-12">
              <img 
                src={getImage(10, '/images/ausbildung-2.jpg')}
                alt="Essential 1" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-1/2 h-full pb-12">
              <img 
                src={getImage(11, '/images/ausbildung-3.jpg')}
                alt="Essential 2" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
};
