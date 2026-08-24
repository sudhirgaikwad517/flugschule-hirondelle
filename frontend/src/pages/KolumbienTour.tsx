import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Gift } from 'lucide-react';

export const KolumbienTour = () => {
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
                Kolumbien-Tour
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm">
              <img 
                src="https://picsum.photos/id/1016/1000/600" 
                alt="Kolumbien-Tour" 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Thermik- und Streckenfliegen in Kolumbien</h3>
                <p className="mb-4">
                  Wir fliegen über den grünen Landschaften des Valle del Cauca. Dabei genießen wir die großartige Gastfreundschaft der Kolumbianer und befliegen über mehrere Stationen die besten Fluggebiete von Cali Richtung Medellin. Die sanfte Thermik und das breite Tal mit zahllosen Landemöglichkeiten laden zu gemeinsamen Thermik- und Streckenflügen ein.
                </p>
                <p>
                  Wir befliegen zuerst die Fluggebiete von Piedechinche, die in unmittelbarer Nähe zu Cali liegen. Weiter geht's Richtung Norden mit 3 weiteren Stops und diversen Fluggebieten im Valle de Cauca bis Medellin, wo wir unsere Tour beenden.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Fluggebiete</h3>
                <p className="mb-4 font-semibold uppercase text-sm tracking-widest text-[#53a8c7]">Valle del Cauca</p>
                <p className="mb-6">
                  Mit den bekannten Fluggebieten Roldanillo, dem Austragungsort des PWC 2011 und Super Finals 2013, Ansermanuevo, La Pintada und Piedechinche. Roldanillo liegt 1000 m über dem Meeresspiegel. Das Klima ist tropisch warm, die westliche Kette der Anden sperrt die Zufuhr von kühler und feuchter Luft vom Pazifischen Ozean. Die Durchschnittstemperatur liegt zw. 26° - 28° C . Die trockenen Jahreszeiten sind Dezember bis März und Juli bis August, der Rest ist Regenzeit. Die Stationen im Einzelnen:
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-luxury-dark font-medium mb-2 flex items-center gap-2">
                      <span className="text-xl">📍</span> Piedechinche – Der Auftakt in den Anden
                    </h4>
                    <p>Unsere Reise beginnt südlich von Cali im grünen Herz des Valle del Cauca. In Piedechinche, nahe Palmira, liegt unsere erste Unterkunft – umgeben von Zuckerrohrfeldern und ersten genialen Fluggebieten. Hier sammeln wir die ersten Thermikstunden bei stabilen Bedingungen mit spektakulärem Blick auf das Tal.</p>
                  </div>
                  <div>
                    <h4 className="text-luxury-dark font-medium mb-2 flex items-center gap-2">
                      <span className="text-xl">🗺️</span> La Unión – Vielfalt in der Luft & am Boden
                    </h4>
                    <p>Weiter geht's nach La Unión, bekannt für seine exzellenten Flugspots: Ansermanuevo, Roldanillo und Apía. Die Region ist das Zentrum des kolumbianischen Gleitschirmfliegens und hat schon internationale Wettbewerbe beherbergt. Neben dem Fliegen erwarten uns Kolumbiens typischer Kaffee, kleine Dörfer mit kolonialem Flair und beeindruckende Berglandschaften.</p>
                  </div>
                  <div>
                    <h4 className="text-luxury-dark font-medium mb-2 flex items-center gap-2">
                      <span className="text-xl">🏕️</span> Jericó – Hoch über dem Tal
                    </h4>
                    <p>Ein echter Geheimtipp ist unser nächster Stopp: Jericó, ein charmantes Bergstädtchen mit Top-Flugbedingungen. Die Szenerie rund um die schroffen Hänge und grünen Hochplateaus bietet beste Voraussetzungen für Thermik, Soaring – und atemberaubende Aussicht.</p>
                  </div>
                  <div>
                    <h4 className="text-luxury-dark font-medium mb-2 flex items-center gap-2">
                      <span className="text-xl">🌇</span> Finale in Medellín – Kultur, Kaffee & Cityvibes
                    </h4>
                    <p>Zum Abschluss der Reise lassen wir es uns in Medellín, der „Stadt des ewigen Frühlings“, gutgehen. Neben einem möglichen Flugspot am Stadtrand steht hier auch Sightseeing auf dem Programm: lebendige Märkte, Street Art in Comuna 13, Seilbahnfahrten über die Stadtviertel und kolumbianische Küche vom Feinsten.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Für wen ist die Reise gedacht?</h3>
                <p className="mb-4">
                  Die Reise ist sowohl für engagierte Hobbypiloten wie auch für den versierten Flieger geeignet. Für alle, die fliegerisch dazulernen und für diejenigen, die ihre ersten kleinen Streckenflüge machen möchten – aber auch Streckencracks kommen voll auf ihre Kosten!
                </p>
                <p>
                  Mindestvoraussetzung ist der A-Schein.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Anreise, Unterkunft und Verpflegung</h3>
                <p className="mb-4">
                  Die Anreise / Hin- und Rückflug erfolgt nach Cali bzw. Medellin. Zwecks gemeinsamer Anreise in der gleichen Maschine geben wir euch gerne die Flugnummer.
                </p>
                <p>
                  Während unseres Aufenthalts sind wir in landestypischen Gästehäusern oder Hotels in der Nähe der Startplätze untergebracht. Nach dem Fliegen lassen wir den Tag in geselliger Runde bei gemeinsamem Abendessen ausklingen und lassen uns von der kolumbianischen Küche verwöhnen.
                </p>
              </div>

            </div>

            {/* Leistungen inside Left Column (matches original design) */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase tracking-wider border-b border-gray-200 pb-4 text-[#53a8c7]">Unsere Leistungen</h3>
              <ul className="space-y-4">
                {[
                  'professionelle Betreuung durch unsere Fluglehrer plus mitfliegendem Guide aus Kolumbien',
                  'Gelände- und spezielle Theorieeinweisung fürs Soaring, Thermikfliegen, Streckenfliegen',
                  'Flugwetterbriefing',
                  'Funkbetreuung',
                  'Flug-/Videoanalyse',
                  'alle Transfers während der Reisedauer sowie Auffahrten zu Startplätzen',
                  'Rückholen nach den Streckenflügen :-)!',
                  'Übernachtungen in Gästehäusern, im Doppel-/Dreibettzimmer inkl. Frühstück',
                  'Organisation eines Alternativprogramms bei schlechtem Wetter',
                  'exkl. Hin- und Rückflug nach Kolumbien',
                  'exkl. Sim-Karte für Kolumbien, Datenpakete müssen separat gekauft werden',
                  'exkl. Geländegebühren vor Ort',
                  'exkl. Eintrittspreise für das Alternativprogramm',
                  'exkl. Auslandskrankenversicherung inkl. Rücktransport (Bitte unbedingt abschließen - gibt es für kleines Geld beim ADAC)'
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
              <div className="bg-[#2980b9] py-2">Groundhandlingtraining</div>
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
                      <p className="font-medium text-luxury-dark whitespace-nowrap text-lg">2.690,- €</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 font-light">Voraussetzung: mindestens A-Schein / Sopi</p>
                </div>
              </div>

              <div className="w-full bg-[#4a5f68] text-white text-center py-3 font-semibold shadow-md">
                Termin: siehe Kalender
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
                 {[1015, 1025, 1035, 1045, 1055, 1065, 1075, 1085, 1011, 1012, 1013, 1014, 1016, 1018, 1019, 1020, 1021, 1022].map((id, index) => (
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
