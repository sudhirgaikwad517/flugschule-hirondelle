import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

export const ReparaturService = () => {
  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="pt-16 md:pt-24 pb-8 md:pb-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-12">
            
            <div>
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                SERVICE
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Reparatur-Service
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm group cursor-pointer">
              <img 
                src="https://picsum.photos/id/1043/1000/600" 
                alt="Reparatur-Service" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Content Blocks with floated image */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex-shrink-0">
                <div className="w-full h-[250px] relative overflow-hidden rounded-sm shadow-sm group cursor-pointer">
                  <img 
                    src="https://picsum.photos/id/1050/400/500" 
                    alt="Werkstatt" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
              </div>
              
              <div className="md:w-2/3 space-y-6 text-gray-600 font-light leading-relaxed text-justify">
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic leading-tight">
                  Du hast einen Defekt an deiner Ausrüstung? Einen Riß in deinem Gleitschirm? Wir retten was noch zu retten ist ;-)
                </h3>
                <p>
                  Wir bieten euch einen professionellen Reparatur-Service für eure Ausrüstung an. Die notwendigen Reparatur-Arbeiten führen wir in unserer Service-Werkstätte mit größter Sorgfalt und modernster Technik durch – damit ihr schnell wieder sicher abheben könnt! Nach Absprache führen wir auch gerne Teile des <Link to="/service/2-jahres-check" className="text-[#53a8c7] hover:underline">2-Jahres-Checks</Link> im Rahmen der Reparatur durch.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-12">

            {/* Pricing Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md">
                Meldet euch wir schauen es uns an
              </button>

              <div className="space-y-6 mb-10 text-sm">
                <div className="flex justify-between items-start gap-4 border-b border-gray-200 pb-4">
                  <p className="text-luxury-dark font-semibold">Reparaturen aller Marken</p>
                  <p className="text-gray-600 whitespace-nowrap">Preis auf Anfrage</p>
                </div>
                
                <p className="text-gray-500 italic text-xs leading-relaxed">
                  Bitte vereinbare für den Reparaturservice einen Termin mit uns. Hierzu könnt ihr in der <Link to="/infos#kontakt" className="text-[#53a8c7] hover:underline">Flugschule</Link> vorbeischauen oder ihr meldet euch telefonisch unter 0151 18836000
                </p>
              </div>

              <Link to="/infos#kontakt" className="block w-full bg-[#4a5f68] hover:bg-[#394a51] text-white text-center py-3 font-semibold shadow-md rounded-sm transition-colors">
                Termin vereinbaren
              </Link>
            </div>

          </div>
          
        </div>
      </section>

    </div>
  );
};
