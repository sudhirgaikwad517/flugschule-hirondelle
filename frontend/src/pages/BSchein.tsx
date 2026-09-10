import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Info } from 'lucide-react';

export const BSchein = () => {
  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-12">
            
            <div>
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                AUSBILDUNG
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                B-Schein
              </h1>
            </div>

            {/* Featured Image */}
            <div className="w-full h-[400px] overflow-hidden rounded-sm shadow-sm group">
              <img 
                src="/images/b-schein/hero.jpg"
                alt="B-Schein Streckenflug"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Auf Strecke mit dem unbeschränkten Luftfahrerschein...</h3>
                <div className="space-y-4">
                  <p>
                    Wer weiter fliegen will als vom Start- zum Landeplatz braucht den unbeschränkten Luftfahrerschein (B-Schein). Dieser ist auch Voraussetzung zum Befliegen einiger Fluggelände in unserer Region und weltweit.
                  </p>
                  <p>
                    Im Rahmen der Praxisausbildung zum B-Schein sind vom Piloten (Voraussetzung: <Link to="/ausbildung/a-schein" className="text-luxury-gold hover:underline font-medium">A-Schein</Link>) 20 Flüge zu absolvieren. Davon müssen 10 Flüge eine Mindestdauer von über 30 Minuten vorweisen sowie ein Flug über eine Strecke von 15 km (inkl. 500 m Höhenzugewinn) geflogen werden. Die Praxisausbildung zum B-Schein findet im Rahmen unserer (einwöchigen) Reisen bzw. der Höhenflugschulungen im Rahmen der A-Scheinausbildung statt. Die Preise orientieren sich an den jeweiligen Touren.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Streckenplanung in der Theorie...</h3>
                <p>
                  In einer zweitägigen Theorieausbildung werden die für den B-Schein relevanten Inhalte und Kenntnisse vermittelt. In insgesamt 15 Unterrichtsstunden Theorie (à 45 Min.) werden die Inhalte aus der A-Scheinausbildung vertieft und erweitert. Maßgeblich bereiten euch die Themen Meteorologie und Navigation auf eure selbständigen Streckenflüge vor. Nach dem Kurs muss der Flugschüler eine offizielle Theorieprüfung in den vorher vermittelten Theoriefächern vor einem Prüfer des <a href="https://www.dhv.de/" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:underline font-medium">DHV</a> abzulegen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">... und Praxis</h3>
                <div className="space-y-4">
                  <p>
                    Der vorgeschriebene 15-Kilometer-Streckenflug für den unbeschränkten Luftfahrerschein wird für das Fluggelände besprochen und soll bei passender Wetterlage vom zukünftigen B-Scheinpiloten abgeflogen werden. Die Streckendokumentation erfolgt mit einem GPS und kann am Laptop vor Ort ausgelesen werden.
                  </p>
                  <p>
                    Bevor es schlussendlich auf Strecke geht, muss auch noch ein <Link to="/ausbildung/rettungsgeraetetraining" className="text-luxury-gold hover:underline font-medium">Rettungsgerätetraining</Link> absolviert werden. Diese Trainings bieten wir mehrmals im Jahr für euch an.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Booking Card */}
            <div className="bg-[#FAF9F7] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <div className="p-8">
                <Link 
                  to="/events?category=Unbeschr.%20LF-Schein%20(B-Schein)"
                  className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md"
                >
                  Kurs buchen
                </Link>

                <div className="space-y-5 mb-8">
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-bold text-luxury-dark text-sm">Kurspreis Theorie</p>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">290,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <p className="font-bold text-luxury-dark text-sm">Kurspreis Praxis</p>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p>entspricht Kurspreis des gebuchten Trainings</p>
                        <p className="italic text-[11px] mt-1">(im Rahmen der Höhenflugschulung, Sicherheitstraining, Thermik-Technik oder Streckenseminar)</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">ab 790,- €</p>
                    </div>
                  </div>

                  {/* Zusatzkosten Table */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4 text-[#53a8c7]" />
                      <p className="font-bold text-luxury-dark text-sm uppercase">Zusatzkosten</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4 pt-1">
                        <div className="text-gray-600 font-light text-[13px]">
                          <p>ggf. Auffahrten zum Startplatz</p>
                          <p className="italic text-[11px]">[ pro Fahrt, geländeabhängig ]</p>
                          <p className="text-[12px] mt-1">Bus | Seilbahn (Kosten des Betreibers vor Ort)</p>
                        </div>
                        <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5 text-right">10,- € | - €</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link 
                to="/events?category=Unbeschr.%20LF-Schein%20(B-Schein)" 
                className="w-full block bg-luxury-dark hover:bg-luxury-gold text-white text-center py-4 text-sm font-semibold uppercase tracking-widest transition-colors"
              >
                Theorie-Termine &gt; Siehe Liste
              </Link>
            </div>

            {/* Voucher Box */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 B-Schein Verschenken
               </h3>
               <p className="text-gray-500 font-light text-sm mb-4">
                 Der B-Schein ist auch als Geschenk-Gutschein möglich
               </p>
               <div className="w-full h-[180px] rounded-sm overflow-hidden shadow-sm relative group cursor-pointer border border-gray-200">
                  <img src="/images/gutscheine/gutschein.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gutschein" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                     <p className="text-white font-luxury text-3xl font-bold italic opacity-90 drop-shadow-md tracking-wider">GUTSCHEIN</p>
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                     <p className="text-luxury-dark text-[10px] font-bold uppercase tracking-widest">Flugschule Hirondelle</p>
                  </div>
               </div>
            </div>

            {/* Impressions Gallery */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-6 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Impressionen
               </h3>
               <div className="grid grid-cols-3 gap-2">
                 {Array.from({ length: 9 }, (_, i) => i + 1).map((n, index) => (
                   <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-100">
                     <img
                       src={`/images/b-schein/gallery-${n}.jpg`}
                       alt={`Impression ${index + 1}`}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                   </div>
                 ))}
               </div>
            </div>

          </div>

        </div>

        {/* Leistungen & Checkliste Grid (Full Width) */}
        <div className="max-w-[1200px] mx-auto mt-16 lg:mt-24">
          <hr className="border-gray-100 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 mb-16">
            <div>
              <h2 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase">Unsere Leistungen</h2>
              <ul className="space-y-3 mb-6">
                {[
                  'Theorie- und Praxisausbildung durch zertifizierte Fluglehrer',
                  'Organisation der Reise für die Praxisausbildung',
                  'Funkausrüstung und -betreuung',
                  'Haftpflichtversicherung'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-600 font-light">
                    <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <h4 className="font-medium text-luxury-dark mb-4 text-sm">Zusatzkosten können entstehen für:</h4>
              <ul className="space-y-3 mb-6">
                {[
                  <><Link to="/ausbildung/rettungsgeraetetraining" className="text-luxury-gold hover:underline">Rettungsgerätetraining</Link> (separat zu buchender Kurs)</>,
                  'E-Learning Prüffragen Gleitschirm-B-Schein vom DHV',
                  'Prüfungsgebühren ab 03.04.2023 DHV'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-600 font-light">
                    <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase">Deine Checkliste</h2>
              <ul className="space-y-4">
                {[
                  'Lust aufs Fliegen',
                  'Überknöchelhohe Schuhe, wir empfehlen spezielle Flugschuhe oder zumindest Wanderschuhe',
                  'Outdoor-Bekleidung, je nach Wetter Wechselkleidung',
                  'Ausreichend Getränke und Verpflegung (Fliegen macht hungrig!!!)',
                  'Sonnencreme',
                  'Ausführliche Checkliste für die Praxisausbildung erhaltet ihr je Reisetermin'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-600 font-light">
                    <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Large Blue Info Banner at bottom */}
          <div className="bg-[#53a8c7] rounded-sm p-8 md:p-12 text-center shadow-md">
             <p className="text-white text-lg md:text-xl font-medium leading-relaxed max-w-4xl mx-auto">
               Die Praxisausbildung zum B-Schein findet im Rahmen unserer Reisen bzw. Höhenflugschulungen statt. Der Kurspreis für die Praxis orientiert sich am gewählten Training bzw. der gewählten Reise.
             </p>
          </div>
        </div>
      </section>

    </div>
  );
};
