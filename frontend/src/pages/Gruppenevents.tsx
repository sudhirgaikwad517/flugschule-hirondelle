import { Banner } from '../components/common/Banner';

const IMPRESSIONS = [
  'https://picsum.photos/seed/event1/400/300',
  'https://picsum.photos/seed/event2/400/300',
  'https://picsum.photos/seed/event3/400/300',
  'https://picsum.photos/seed/event4/400/300',
  'https://picsum.photos/seed/event5/400/300',
  'https://picsum.photos/seed/event6/400/300',
];

export const Gruppenevents = () => {
  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          
          {/* Main Title */}
          <div className="mb-16">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              GRUPPENEVENTS
            </h1>
            <div className="w-24 h-px bg-luxury-gold"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-7">
              {/* Main Image */}
              <div className="w-full mb-10 overflow-hidden shadow-lg border border-gray-100">
                <img 
                  src="https://picsum.photos/seed/gruppeneventmain/1200/600" 
                  alt="Gruppenevent Paragliding" 
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Text */}
              <div className="mb-10">
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-2">
                  Du willst ein Gruppenevent planen...
                </p>
                <p className="italic text-lg md:text-xl text-gray-700 font-luxury mb-8 ml-8 md:ml-12">
                  ... das zu einem echten Überflieger werden soll?
                </p>
              </div>

              <div className="space-y-6 text-gray-600 font-light leading-relaxed">
                <p>
                  Warum dann nicht mit deinen Freunden, Familienmitgliedern oder Arbeitskollegen gemeinsam in die Luft zu gehen?
                </p>
                <p>
                  Bei den atemberaubenden Gleitschirmflügen hoch über dem Odenwald oder der Pfalz wird das Event zu einem unvergesslichen Erlebnis, von dem ihr noch lange zehren könnt! Jede Menge Spaß und Action sind garantiert und schweißen euch als Gruppe/Team zusammen.
                </p>
                <p>
                  Vom eintägigen Event bis zur mehrtägigen Veranstaltung – wir stehen für eine Eventplanung in unserer Flugschule persönlich zur Verfügung und erstellen ein Angebot nach euren individuellen Vorstellungen!
                </p>
              </div>
            </div>

            {/* Right Column (Sidebar Cards) */}
            <div className="lg:col-span-5 flex flex-col space-y-12">
              
              {/* Contact Card */}
              <div className="bg-[#f2f2f2] rounded-md p-6 md:p-8 shadow-sm border border-gray-200">
                
                {/* Header Button (Decorative) */}
                <div className="w-full bg-[#53a8c7] text-white text-center py-2.5 rounded-full mb-8 shadow-sm">
                  <span className="text-sm md:text-base tracking-wide">Sprechen Sie uns an</span>
                </div>

                <div className="flex justify-between items-center text-sm md:text-[15px] text-gray-700 mb-8 px-2 font-medium">
                  <span>Firmen oder Gruppen Events</span>
                  <span>Preis auf Anfrage</span>
                </div>

                <p className="italic text-gray-600 text-[14px] md:text-[15px] leading-relaxed mb-6">
                  Sie können gerne einen Termin mit uns abstimmen der dann für Ihre Firma oder Ihre Gruppe von uns geblockt wird. Am Besten sprechen Sie direkt mit uns über Ihr Vorhaben dann können wir gemeinsam ein Konzept dafür erstellen.
                </p>

                <p className="italic text-gray-600 text-[14px] md:text-[15px] leading-relaxed mb-10">
                  Gerne auch telefonisch unter <a href="tel:+4962018452097" className="hover:text-luxury-gold transition-colors">+49 (0)6201 8452097</a>
                </p>

                {/* Footer Button */}
                <button className="w-full bg-slate-500 hover:bg-slate-600 text-white text-center py-3 rounded-md transition-colors duration-300 shadow-sm text-sm tracking-wide uppercase">
                  Termin vereinbaren
                </button>
              </div>

              {/* Impressionen Gallery */}
              <div>
                <div className="mb-6">
                  <h2 className="font-luxury text-2xl md:text-3xl text-[#53a8c7] uppercase mb-4 tracking-wide">
                    IMPRESSIONEN
                  </h2>
                  <div className="w-full h-px bg-[#53a8c7] opacity-40"></div>
                </div>

                {/* 3x2 Grid */}
                <div className="grid grid-cols-3 gap-0 border border-black overflow-hidden bg-black">
                  {IMPRESSIONS.map((src, idx) => (
                    <div key={idx} className="aspect-square relative group overflow-hidden">
                      <img 
                        src={src} 
                        alt={`Impression ${idx + 1}`} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
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
