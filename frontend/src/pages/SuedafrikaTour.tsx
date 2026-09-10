import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Gift } from 'lucide-react';
import { EventComments } from '../components/common/EventComments';

export const SuedafrikaTour = () => {
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
                REISEN
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Südafrika-Tour
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm">
              <img
                src="/images/reisen/suedafrika.jpg"
                alt="Südafrika-Tour"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Gleitschirm-Safari-Rundreise</h3>
                <p>
                  Südafrika ist ein Land der Vielfalt und der Gegensätze und hat in jeder Hinsicht viel zu bieten. Auf der Südhalbkugel, im Land der unerschöpflichen fliegerischen Möglichkeiten, können wir beste thermische Flugbedingungen unbegrenzt gemeinsam genießen und uns zudem an hochsommerlichen Temperaturen erfreuen. Einerseits erwarten uns phantastische Flüge in den attraktivsten Soaring-, Thermik- und Streckenfluggebieten in Wilderness, Hermanus, Porterville und Kapstadt. Andererseits bieten sich zahllose Möglichkeiten für kulturelle und kulinarische Ausflüge an.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Fluggebiete</h3>
                <p className="mb-4">
                  Die schönsten Küsten-Fluggebiete Südafrikas stehen uns in <strong>Wilderness</strong> zur Verfügung. Wir geniessen die „Seabreeze“ mit Soaring entlang der weltbekannten „Paradise-Ridge“ und der „Map of Africa“. Wilderness bedeutet noch viel mehr: Fliegen direkt aus dem Hotelzimmer, welches in unmittelbarer Nähe vom Startplatz liegt, kilometerweites Fliegen entlang der Küste, Groundhandling am Strand und, und, und…
                </p>
                <p className="mb-4">
                  <strong>Porterville</strong>, das Paragleiter-Mekka von Südafrika schlechthin, das Äquivalent zu Owen’s Valley in den USA, oder den Dolomiten in den Alpen. Erlebt, was man in Afrika unter Thermik und Cross Country versteht! Wir nutzen die erstklassige Thermik im weltbekannten Streckenflug-Eldorado und fliegen entlang der 150 km langen exotischen Bergkette im Worldcup-Fluggebiet Porterville. Mit dem Takeoff am Dasklip-Pass genießen wir Streckenflüge über faszinierende, unberührte Landschaften.
                </p>
                <p className="mb-4">
                  Das Küstenstädtchen <strong>Hermanus</strong> liegt vor einer langgestreckten Bergkette, die herrliche Flüge im laminaren Küstenwind zulässt. 180m oberhalb des Ortes verläuft die fast 10 km lange Hangkante. Sie lädt sowohl zum Soaren als auch zu kleinen Streckenflügen ein.
                </p>
                <p>
                  Die letzte Station unserer Reise führt uns die Gardenroute entlang nach Mossel Bay, über den Sir Lowrys Pass nach <strong>Kapstadt</strong> in unser Quartier. Hier genießen wir das außergewöhnliche Flair einer der schönsten Städte der Welt, mit seinen exklusiven Vororten und der weltbekannten Waterfront. In Kapstadt lassen wir unsere Reise mit Flügen am Lions Head, Signal Hill oder in Franschhoek genussvoll ausklingen. Kapstadt aus der Vogelperspektive, einfach bezaubernd.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Für wen ist die Reise gedacht?</h3>
                <p className="mb-4">
                  Die Reise ist sowohl für engagierte Hobbypiloten wie auch für Gelegenheitsflieger geeignet. Für alle, die fliegerisch dazulernen und für diejenigen, die ihre ersten kleinen Streckenflüge machen möchten – aber auch Streckencracks kommen voll auf ihre Kosten!
                </p>
                <p>
                  Nicht fliegende Begleitpersonen sind ebenfalls herzlich willkommen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Anreise, Unterkunft und Verpflegung</h3>
                <p className="mb-4">
                  Die Anreise / Hin- und Rückflug erfolgt nach Kapstadt. Idealerweise bucht ihr eure Flüge ab Frankfurt über Condor bzw. Lufthansa zwecks gemeinsamer Anreise im gleichen Zeitfenster. Hinflug Samstag, 20.2.27 (über Nacht), Beginn der Reise am Sonntag, 21.02.27. Rückflug Sonntag, 7.3.27 (über Nacht), Ankunft in Frankfurt Montag, 8.3.27.
                </p>
                <p>
                  Während unseres Aufenthalts sind wir in komfortablen Gästehäusern in unmittelbarer Nähe der Startplätze und dem Strand untergebracht. Nach dem Fliegen lassen wir den Tag in geselliger Runde bei gemeinsamem Abendessen ausklingen und lassen uns von der afrikanischen Küche verwöhnen.
                </p>
              </div>

            </div>

            {/* Leistungen inside Left Column */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase tracking-wider border-b border-gray-200 pb-4 text-[#53a8c7]">Unsere Leistungen</h3>
              <ul className="space-y-4 mb-12">
                {[
                  'professionelle Betreuung durch unsere Fluglehrer',
                  'Gelände- und spezielle Theorieeinweisung fürs Soaring, Thermikfliegen, Streckenfliegen',
                  'Flugwetterbriefing',
                  'Funkbetreuung',
                  'Videoanalyse',
                  'alle Transfers während der Reisedauer in Mietfahrzeugen sowie Auffahrten zu Startplätzen',
                  'Übernachtungen in komfortablen Gästehäusern, im Doppelzimmer inkl. Frühstück',
                  'Organisation eines Alternativprogramms bei schlechtem Wetter',
                  'exkl. Hin- und Rückflug nach Kapstadt',
                  'exkl. Geländegebühren vor Ort',
                  'exkl. Eintrittspreise für das Alternativprogramm'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-gray-600 font-light text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#53a8c7] mt-2 shrink-0"></span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              
              {/* Flyer Mockup Image */}
              <div className="w-full max-w-md mx-auto">
                <img src="/images/flyers/suedafrika.png" alt="Flugschule Hirondelle Flyer" className="w-full h-auto rounded-md shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500" />
              </div>
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
                      <p className="font-medium text-luxury-dark whitespace-nowrap text-lg">3.350,- €</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 font-light mb-4">Voraussetzung: mindestens A-Schein / Sopi</p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Die Tour findet ab 8 Teilnehmern statt, bitte vor verbindlicher Flugbuchung nachfragen, dass die Reise auch durchgeführt wird.
                  </p>
                </div>
              </div>

              <Link to="/events?search=Südafrika" className="block w-full bg-[#4a5f68] hover:bg-[#3d4f57] text-white text-center py-3 font-semibold shadow-md transition-colors">
                Termin: siehe Kalender
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
                 {Array.from({ length: 20 }, (_, i) => i + 1).map((n, index) => (
                   <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-900">
                     <img
                       src={`/images/tour-suedafrika/gallery-${n}.jpg`}
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
          <EventComments pageSlug="suedafrika-tour" />
        </div>
      </section>

    </div>
  );
};
