import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { EventComments } from '../components/common/EventComments';

export const BergamoTour = () => {
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
                REISEN
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Bergamo-Tour
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm">
              <img 
                src="/images/reisen/bergamo.jpg"
                alt="Bergamo-Tour"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Genussfliegen – Dolce Vita in und um Bergamo</h3>
                <p>
                  Italien einmal abseits der ausgetretenen Pfade, heißt hier Fliegen rund um Bergamo, den Ausläufern der Südalpen kurz vor Mailand. Kleine Bergdörfer und entlegene Hütten und Höfe säumen die Wege bis auf die Gipfel. Phantastische Ausblicke von der Gebirgslandschaft bis in die Poebene Richtung Mailand warten auf uns.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Fluggebiete</h3>
                <p>
                  Unsere Startplätze liegen am Rande der Südalpen rund um Bergamo. Die Startplätze sind großzügig und laden auch zum Toplanden ein.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Für wen ist die Reise gedacht?</h3>
                <p>
                  Für den Gelegenheits-Genussflieger der fliegerisch dazulernen und für denjenigen, der erste kleine Thermikflüge machen möchte. Mit Starthöhen von über 1.000 Metern bieten die Südalpen durchaus alpine Thermikflugqualitäten.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Anreise, Unterkunft und Verpflegung</h3>
                <p>
                  Die Anreise nach Italien erfolgt selbst (PKW oder Flug nach Bergamo bzw. Mailand möglich) oder mit unserem Flugschulbus. Wir übernachten in der Nähe von Bergamo in einem netten Hotel direkt in einem der Fluggebiete. Kulinarisch kommen wir mit Pizza und Pasta ebenfalls voll auf unsere Kosten.
                </p>
              </div>

            </div>

            {/* Leistungen */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase tracking-wider border-b border-gray-200 pb-4 text-[#53a8c7]">Unsere Leistungen</h3>
              <ul className="space-y-4 mb-12">
                {[
                  'professionelle Betreuung durch unsere Fluglehrer',
                  'Gelände- und spezielle Theorieeinweisung fürs Soaring, Thermikfliegen, Streckenfliegen',
                  'Flugwetterbriefing',
                  'Funkbetreuung',
                  'exkl. Anreise, Unterkunft, Verpflegung, Auffahrten',
                  'exkl. Geländegebühren',
                  'exkl. Eintrittspreise für das Alternativprogramm',
                  'exkl. Auslandskrankenversicherung inkl. Rücktransport\n(bitte unbedingt abschließen - gibt es z. B. für 13,90 € /Jahr beim ADAC)'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-gray-600 font-light text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#53a8c7] mt-2 shrink-0"></span>
                    <span className="leading-relaxed whitespace-pre-line">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-12">

            {/* Badges */}
            <div className="flex flex-col gap-1 w-full font-semibold text-white text-center text-sm">
              <div className="bg-[#e67e22] py-2">Streckenflugtraining</div>
              <div className="bg-[#27ae60] py-2">Thermik- und Flugtechniktraining</div>
              <div className="bg-[#8cc63f] py-2">Soaringtraining</div>
              <div className="bg-[#2980b9] py-2">Groundhandlingtraining</div>
            </div>
            
            {/* Booking Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <Link 
                to="/events?category=Reisen"
                className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-8 shadow-md flex items-center justify-center gap-2"
              >
                Reise buchen
              </Link>

              <div className="space-y-6 mb-8 text-sm">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-luxury-dark font-medium">Tourpreis</p>
                    <div className="text-right">
                      <p className="font-medium text-luxury-dark whitespace-nowrap text-lg">890,- €</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 font-light mb-4">Voraussetzung: mindestens A-Schein / Sopi</p>
                </div>
              </div>

              <Link to="/events?search=Bergamo" className="block w-full bg-[#4a5f68] hover:bg-[#3d4f57] text-white text-center py-3 font-semibold shadow-md transition-colors">
                Termine &gt; siehe Kalender
              </Link>
            </div>

            {/* Voucher Box */}
            <div>
               <h3 className="font-luxury text-2xl text-[#53a8c7] mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Tour Verschenken
               </h3>
               <p className="text-gray-500 font-light text-sm mb-4">
                 Die Tour ist auch als Geschenk-Gutschein möglich
               </p>
               <div className="relative h-40 w-full rounded-sm overflow-hidden group cursor-pointer mb-4">
                 <img src="/images/gutscheine/gutschein.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gutschein" />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                 <div className="absolute right-0 top-0 bottom-0 w-16 bg-[#0088cc] flex items-center justify-center">
                   <div className="rotate-[-90deg] text-white font-bold tracking-widest whitespace-nowrap">Gutschein</div>
                 </div>
               </div>
            </div>

            {/* Impressions Gallery */}
            <div>
               <h3 className="font-luxury text-2xl text-[#53a8c7] mb-6 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Impressionen
               </h3>
               <div className="grid grid-cols-2 gap-1 bg-black p-1">
                 {Array.from({ length: 10 }, (_, i) => i + 1).map((n, index) => (
                   <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-900">
                     <img
                       src={`/images/tour-bergamo/gallery-${n}.jpg`}
                       alt={`Impression ${index + 1}`}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                   </div>
                 ))}
               </div>
            </div>

          </div>
          
        </div>

        <div className="max-w-[1200px] mx-auto mt-12">
          <EventComments pageSlug="bergamo-tour" />
        </div>
      </section>

    </div>
  );
};
