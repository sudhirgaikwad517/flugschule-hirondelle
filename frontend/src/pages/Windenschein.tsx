import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Info, Play } from 'lucide-react';

export const Windenschein = () => {
  const [showVideo, setShowVideo] = useState(false);
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
                Windenschein
              </h1>
            </div>

            {/* Featured Video */}
            <div className="w-full h-[400px] overflow-hidden rounded-sm shadow-sm relative group bg-black">
              {showVideo ? (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/KSdpddm3Rnw?autoplay=1"
                  title="A-Schein Windenstarts - Paragliding lernen | Flugschule Hirondelle"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button type="button" onClick={() => setShowVideo(true)} className="w-full h-full block cursor-pointer">
                  <img
                    src="/images/windenschein/hero.jpg"
                    alt="Windenschlepp Video"
                    className="w-full h-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-14 bg-red-600 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <Play className="text-white w-8 h-8 fill-current" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 right-4 text-white text-left">
                    <h3 className="font-semibold text-lg drop-shadow-md">A-Schein Windenstarts - Paragliding lernen | Flugschule Hirondelle</h3>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16">
                     <h2 className="font-luxury text-7xl text-white font-bold tracking-widest drop-shadow-2xl opacity-90">WINDE</h2>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-white text-xs font-medium flex items-center gap-2">
                     <span>Watch on YouTube</span>
                  </div>
                </button>
              )}
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Windenschlepp mit dem Gleitschirm...</h3>
                <p>
                  Das Schleppen an der Winde ist eine ideale Möglichkeit, auch im Flachland mit dem Gleitschirm in die Luft zu kommen. Nicht selten können unsere Schüler an der Winde schon etwas Thermik schnuppern und bis zu 20 Minuten durch die Luft gleiten. Viele erfolgreiche Streckenflüge sind bereits aus der Winde heraus geflogen worden. Der Windenschein ist die ideale Ergänzung zum A-Scheinkurs da ihr hier schnell einen Großteil der nötigen Flüge für die A-Scheinprüfung sammeln könnt.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Ausbildung</h3>
                <div className="space-y-4">
                  <p>
                    20 Flüge unter Fluglehreraufsicht benötigt ihr zur Erlangung der Windenschleppstartberechtigung. Nach erfolgreich abgelegter flugschulinterner Theorie- und Praxisprüfung für den Windenschlepp darfst du dann selbständig an der Winde fliegen (Voraussetzung <Link to="/ausbildung/a-schein" className="text-luxury-gold hover:underline font-medium">A-Schein</Link>!). Die Ausbildungsdauer beträgt je nach Wetterlage und persönlicher Kondition ca. 2 bis 3 Tage.
                  </p>
                  <p>
                    Für den beschränkten Luftfahrerschein können anstelle einer Höhenflugschulung auch alle 40 Flüge an der Winde absolviert werden. Der Pilot erhält dann nach der Prüfung den beschränkten Luftfahrerschein mit der Startart Windenschlepp. Später kann er 15 Flüge in entsprechenden Höhenfluggeländen machen und die Startart Hang in seinen Luftfahrerschein eintragen lassen.
                  </p>
                  <p>
                    Im Rahmen der Windenschleppausbildung findet eine Theorieschulung mit den Themengebieten Flugtechnik, Gefahreneinweisung und Luftrecht statt.
                  </p>
                  <p>
                    Die Praxistermine werden flexibel je nach Wetterlage gewählt und finden i. d. R. unter der Woche statt. Die Pilotenanzahl begrenzen wir bei der Schulung auf 6 bis 10 Schüler, da bei zu großen Gruppengrößen zu lange Wartezeiten zwischen den einzelnen Schulungsflügen entstehen. Die Termine findet ihr in unserem Kalender.
                  </p>
                  <p>
                    Bei unseren Windenschlepps setzen wir auf die modernen und sicheren Kunststoffseile. Diese sind nicht so starr wie die alten Stahlseile und daher für den Piloten beim Schlepp angenehmer und in der Windenausbildung einfacher im Handling. Seit 2022 schulen wir außerdem auf einer neuen Elektrowinde, diese erleichtert den Schulungsschlepp, da sie Unregelmäßigkeiten im Schleppvorgang, ausgelöst durch Thermik etc., selbst regelt und automatisch ausgleicht.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Fluggelände</h3>
                <div className="space-y-4">
                  <p>
                    Der Flugschule stehen mehrere Windenschleppgelände mit unterschiedlicher Wind-Ausrichtung zur Verfügung.
                  </p>
                  <p>
                    Mitten in der Rheinebene befindet sich der Flugplatz <a href="#" className="text-[#53a8c7] hover:underline font-medium">Herrenteich</a>, der gut und schnell erreichbar ist.
                  </p>
                  <p>
                    Bei Bad Kreuznach liegt das Schleppgelände <a href="#" className="text-[#53a8c7] hover:underline font-medium">Auf dem unteren Mergesfeld</a> des Drachen- und Gleitsegelclub Nahetal e.V „DGCN“.
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
                  to="/events?category=Windenschulung"
                  className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md"
                >
                  Kurs buchen
                </Link>

                <div className="space-y-5 mb-8">
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-bold text-luxury-dark text-sm">Kurspreis</p>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">450,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <p className="text-gray-600 font-light text-[13px]">darin enthalten:</p>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-gray-600 font-light text-[13px]">flugschulinterne Theorie- und Praxisprüfung</p>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">50,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="text-gray-500 font-light text-[12px] italic leading-relaxed">
                      <p>[eigene Ausrüstung erforderlich -</p>
                      <p>Leihausrüstung auf Anfrage möglich]</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p className="font-bold text-luxury-dark mb-1">Kombikurs Kompakt:</p>
                        <p>Grundkurs & Winde & A-Scheinkurs Woche 1</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">1.990,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p className="font-bold text-luxury-dark mb-1">Einweisung Windenschlepp Passagierflug Tandem</p>
                        <p className="italic text-[11px]">[ Ergänzung zum Tandemschein, 10 Einweisungsflüge ]</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">320,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p>Tagespauschale für Fluggelände</p>
                        <p className="italic text-[11px]">[ pro Flugtag ]</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">10,- €</p>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p>Leihgebühr für Schleppklinke</p>
                        <p className="italic text-[11px]">[ pro Flugtag ]</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">10,- €</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-gray-600 font-light text-[13px] leading-relaxed mb-3">
                      <p>Weitere betreute Praxisflüge an der Winde <span className="italic text-[11px]">[ pro Schlepp ]</span></p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <li className="text-gray-600 font-light text-[13px] ml-4">für (mind.) A-Schein-Inhaber</li>
                        <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5 text-right">10,- €</p>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <li className="text-gray-600 font-light text-[13px] ml-4">im Rahmen der A-Schein-Ausbildung</li>
                        <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5 text-right">20,- €</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <Link 
                to="/events?category=Windenschulung" 
                className="w-full block bg-luxury-dark hover:bg-luxury-gold text-white text-center py-4 text-sm font-semibold uppercase tracking-widest transition-colors"
              >
                Termine &gt; Zum Kalender
              </Link>
            </div>

            {/* Voucher Box */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Windenschein Verschenken
               </h3>
               <p className="text-gray-500 font-light text-sm mb-4">
                 Der Windenschein ist auch als Geschenk-Gutschein möglich
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
                       src={`/images/windenschein/gallery-${n}.jpg`}
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
                  'Theorie- und Praxisausbildung durch zertifizierte Windenfachlehrer und Windenfahrer',
                  'Funkausrüstung und -betreuung',
                  'Theorieskript',
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
                  'Leihausrüstung über die Flugschule (350,- € / Kurs)',
                  'E-Learning Prüffragen Gleitschirm-Windenschein vom DHV',
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
                  'Mindestalter: 14 Jahre (mit Einverständniserklärung der Erziehungsberechtigten!)',
                  'Überknöchelhohe Schuhe, wir empfehlen spezielle Flugschuhe oder zumindest Wanderschuhe',
                  'Outdoor-Bekleidung, je nach Wetter Wechselkleidung',
                  'Ausreichend Getränke und Verpflegung (Fliegen macht hungrig!!!)',
                  'Sonnencreme'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-600 font-light">
                    <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
