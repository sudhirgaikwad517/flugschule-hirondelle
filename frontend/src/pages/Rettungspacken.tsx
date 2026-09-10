import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

export const Rettungspacken = () => {
  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="pt-16 md:pt-24 pb-8 md:pb-12 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-12">
            
            <div>
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                SERVICE
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Rettungsgeräte-Packservice
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm group cursor-pointer">
              <img 
                src="/images/service/rettungspackservice.png"
                alt="Rettungsgeräte-Packservice"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-6 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">
                  Rettung professionell gepackt – wir packen sie, als wäre es unsere eigene.
                </h3>
                <p className="mb-4">
                  Wie ihr wisst, soll jede Rettung mind. einmal jährlich gepackt werden. Die Hersteller empfehlen jedoch ein kürzeres Intervall von max. 6 Monaten! Wir packen deine Rettung innerhalb von 3 Werktagen – damit ihr schnell wieder sicher abheben könnt (wenn wir nicht grade im Ausland sind... ;-)!
                </p>
                <p className="mb-6">
                  Eure Sicherheit liegt uns am Herzen – wir packen jede Rettung mit größter Sorgfalt.
                </p>
                <p className="text-[#cc0000] font-medium mb-4">
                  Wir packen alle Standardretter vom Typ Rund- bzw. Kreuzkappen - Packschlaufen Voraussetzung!.
                </p>
                <p className="text-[#cc0000] font-medium">
                  Retter, die nicht bei uns gekauft wurden bitte ggf. vorab abklären.
                </p>
              </div>
            </div>

            {/* Formular Button */}
            <div className="pt-4">
              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-4 rounded-sm text-lg font-semibold transition-colors shadow-md">
                Um deine Rettung packen zu können, benötigen wir das ausgefüllte Formular.
              </button>
            </div>

            {/* Additional Info block */}
            <div className="pt-8">
              <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">
                Rettung packen leicht gemacht
              </h3>
              <p className="text-gray-600 font-light leading-relaxed text-justify">
                Schaut einfach mal bei einem unserer <Link to="/performance/rettungsgeraetetraining" className="text-[#53a8c7] hover:underline">Rettungsgerätetrainings</Link> vorbei. Dort lernt ihr, wie die Rettung im Notfall geworfen wird und wir zeigen euch, wie ihr die Rettung selbst packen könnt! Wenn ihr auf Nummer Sicher gehen wollt oder auch keine Lust drauf habt, packen wir die Rettung natürlich auch weiterhin für euch ;-). Nähere Details zum Rettungsgerätetraining findet ihr <Link to="/performance/rettungsgeraetetraining" className="text-[#53a8c7] hover:underline">hier</Link>.
              </p>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-12">

            {/* Pricing Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md">
                Bitte das Formular unten ausfüllen
              </button>

              <div className="space-y-6 mb-10 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-luxury-dark font-semibold">Packservice Rundkappe*</p>
                  <p className="font-bold text-luxury-dark whitespace-nowrap text-lg">55,- €</p>
                </div>
                
                <div className="flex justify-between items-start gap-4">
                  <p className="text-luxury-dark font-semibold">Packservice Rechteckkappe*</p>
                  <p className="font-bold text-luxury-dark whitespace-nowrap text-lg">55,- €</p>
                </div>
                
                <div className="pt-2">
                  <p className="text-gray-500 italic text-xs">[ andere Rettungen / Exoten auf Anfrage ]</p>
                </div>
              </div>

              <Link to="/service/service-auftrag" className="w-full block bg-[#4a5f68] hover:bg-[#394a51] text-white text-center py-3 font-semibold shadow-md rounded-sm transition-colors">
                Zum Check
              </Link>
            </div>

            {/* Pack-Auftrag Info */}
            <div>
               <h3 className="font-luxury text-2xl text-[#53a8c7] mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 PACK-AUFTRAG
               </h3>
               <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                 Du erhältst eine Kopie des Formulars per E-Mail, dieses bitte ausdrucken und zusammen mit der Rettung (im Gurtzeug) in unserer Flugschule oder alternativ in Landau vorbeibringen.
               </p>
               <div className="text-gray-600 text-sm space-y-4">
                 <p className="leading-relaxed">
                   <strong className="block text-gray-800 font-semibold mb-1">69469 Weinheim, Untergasse 27:</strong>
                   bitte wegen Öffnungszeiten Newsletter beachten
                 </p>
                 <p className="leading-relaxed">
                   <strong className="block text-gray-800 font-semibold mb-1">76829 Landau Am Birnbach 6:</strong>
                   Termin bitte telefonisch vereinbaren
                 </p>
               </div>
            </div>

          </div>
          
        </div>
      </section>

    </div>
  );
};
