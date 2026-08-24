import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Play } from 'lucide-react';

export const GriechenlandTour = () => {
  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-12">
            
            <div>
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                REISEN
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Griechenland-Tour
              </h1>
            </div>

            {/* Video Box */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm group cursor-pointer bg-luxury-dark">
              <img 
                src="https://picsum.photos/id/1044/1000/600" 
                alt="Griechenland Tour 2018" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              <div className="absolute top-4 left-4 right-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full border border-white/50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-1">
                   <img src="/google.png" className="w-full h-full object-contain brightness-0 invert" alt="Logo" />
                 </div>
                 <div>
                    <h3 className="text-white font-semibold text-lg drop-shadow-md">Griechenland Tour 2018 - Gleitschirmfliegen lernen | Flugschule...</h3>
                    <p className="text-white/80 text-sm drop-shadow-md">Flugschule Hirondelle, Weinheim</p>
                 </div>
              </div>
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Griechenland-Tour Westküste</h3>
                <p>
                  Gerade die Nordwestküste Griechenlands ist von dem im Sommer auftretendem starken Nordostwind (Windsystem Meltemia) geschützt und bietet den Fliegern optimale Flugbedingungen und eine fast ganzjährige Flugsaison (März-November).
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Das Fluggebiet</h3>
                <p className="mb-4">
                  Die Reise beginnt und endet in Preveza / Flughafen. Von Preveza aus fahren wir auf die Insel Lefkada, dort sind wir während der Woche untergebracht. Unsere Fluggebiete befinden sich in einem Radius von 150 km, welche individuell je nach Wetterlage und Windrichtung angesteuert werden.
                </p>
                <p>
                  Die Flugsafari ist eine tolle Kombination von Thermik- und Streckenfliegen im Pindosgebirge sowie dem Küstensoaren auf der Insel Lefkada an der Westküste Griechenlands.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Und sonst ...</h3>
                <p>
                  Die Erlebnisse des Tages lassen wir dann abends in gemütlicher Runde nochmals in einer der vielen gemütlichen Tavernen bei einem (oder zwei?) Gläschen Retsina und einem leckeren, opulenten griechischen Fisch- oder Fleischgericht Revue passieren. An nicht fliegbaren Tagen, gibt es einige Möglichkeiten in dieser Gegend schöne Ausflüge zu unternehmen oder einfach nur am Strand zu chillen - das Meer hat Ende Mai schon echte Badetemperatur! Das Wetter ist aber um diese Jahreszeit meist so gut, dass wir hoffentlich die meiste Zeit der Reise in der Luft verbringen werden.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Für wen ist die Reise gedacht?</h3>
                <p>
                  Für diejenigen, die in einem entspannten Fluggebiet ihre ersten Soaring- und Thermikerfahrungen sammeln wollen sowie für den ambitionierten Genussflieger, der sich an seine ersten kleinen Strecken rantasten will. Die Flugreise richtet sich somit gleichermaßen an Streckenflugeinsteiger wie auch erfahrene XC-Piloten.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Anreise, Unterkunft und Verpflegung</h3>
                <p>
                  Zielflughafen und Treffpunkt ist der Flughafen Preveza im Westen Griechenlands. Ab Frankfurt fliegt Condor als Direktflug. Als Unterkünfte haben wir ein gemütliches Hotel mit Übernachtung / Frühstück vorreserviert. Das Abendessen wird angepasst an den aktuellen Tagesverlauf und entsprechend der regionalen Gegebenheiten geplant. Es findet in ausgewählten örtlichen Restaurants mit typisch griechischer Küche statt, um möglichst alle kulinarischen Besonderheiten dieser Region kennenzulernen.
                </p>
              </div>

            </div>

            {/* Leistungen inside Left Column */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase tracking-wider border-b border-gray-200 pb-4 text-[#53a8c7]">Leistungen</h3>
              <ul className="space-y-4 mb-12">
                {[
                  'Gelände- und spezielle Theorieeinweisung fürs Soaring, Thermikfliegen, Streckenfliegen',
                  'professionelle Betreuung durch unsere Fluglehrer',
                  'tägliches Flugwetterbriefing',
                  'Funkbetreuung',
                  'Videoanalyse',
                  'inkl. Transfers ab Flughafen Preveza und in die Fluggebiete',
                  'exkl. Flug und Unterkunft / Verpflegung – diese Kosten werden vom Teilnehmer selbst getragen'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-gray-600 font-light text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#53a8c7] mt-2 shrink-0"></span>
                    <span className="leading-relaxed">{item}</span>
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
            </div>
            
            {/* Booking Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <Link 
                to="/buchungskalender"
                className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-8 shadow-md flex items-center justify-center gap-2"
              >
                Reise buchen
              </Link>

              <div className="space-y-6 mb-8 text-sm">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-luxury-dark font-medium">Tourpreis</p>
                    <div className="text-right">
                      <p className="font-medium text-luxury-dark whitespace-nowrap text-lg">950,- €</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 font-light mb-4">Voraussetzung: mindestens 5 Teilnehmer, A-Schein / Sopi</p>
                </div>
              </div>

              <div className="w-full bg-[#4a5f68] text-white text-center py-3 font-semibold shadow-md">
                Termin &gt; siehe Kalender
              </div>
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
                 <img src="https://picsum.photos/id/1018/600/300" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gutschein" />
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
                 {[1044, 1025, 1035, 1045, 1055, 1065, 1075, 1085, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018].map((id, index) => (
                   <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-900">
                     <img 
                       src={`https://picsum.photos/id/${id}/200/200`} 
                       alt={`Impression ${index + 1}`} 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                   </div>
                 ))}
               </div>
            </div>

          </div>
          
        </div>
      </section>

    </div>
  );
};
