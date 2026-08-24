import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Gift } from 'lucide-react';

export const Schnupperkurs = () => {
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
                AUSBILDUNG
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Schnupper- / Einsteigerkurs
              </h1>
            </div>

            {/* Featured Image */}
            <div className="w-full h-[400px] overflow-hidden rounded-sm shadow-sm group">
              <img 
                src="https://picsum.photos/id/1015/1000/600" 
                alt="Schnupperkurs" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Der Anfang einer neuen Leidenschaft...</h3>
                <p>
                  Am Schnuppertag / Einsteigerkurs lernst du die Grundzüge des Gleitschirmfliegens kennen. Anfängliche Aufzieh- und Laufübungen bereiten dich auf deine ersten Flüge vor: Kappe auslegen, Leinen sortieren, Eintrittsöffnungen kontrollieren, damit der Gleitschirm anschließend richtig über euch steigt. Gurtzeug anlegen, Startcheck und los geht's zum ersten Versuch. Wenn alles klappt und der Wind passt, spürt ihr den Auftrieb, der euch immer leichter werden lässt.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Ab in die Luft...</h3>
                <p>
                  Die Grundlagen für die ersten kleinen Flüge sind geschafft. Der Wind passt, die Startvorbereitungen sind ausgeführt und der Fluglehrer gibt dir Kommandos über Funk. Der Schirm steigt über dich, und du beschleunigst. Schritt für Schritt wirst du schneller und schließlich hebst du ab. Ein Moment des Gleitens, der Boden kommt wieder näher, Landung. Dein erster Flug ist geschafft – was für ein Gefühl! Step by Step erklimmen wir den Übungshang und arbeiten uns immer weiter hinauf in die Luft! Ziel für den Schnupperkurs sind Flüge mit 40 bis 60 Metern Höhendifferenz. Zwischendurch erfahrt ihr Wissenswertes über Gerätekunde und Flugpraxis.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Organisatorisches...</h3>
                <p>
                  Ort und Uhrzeit des Schnupperkurses erfahrt ihr am Vortag bis ca. 15 Uhr per Newsletter. Der eintägige Schnuppertag findet regulär samstags statt, je nach Wetter kann der Termin allerdings auch auf den Sonntag verschoben werden. Je nach Windrichtung schulen wir an einem unserer Übungshänge im Odenwald, Kraichtal, Nahetal und der Pfalz. Die Wegbeschreibungen zu den jeweiligen <Link to="/infos#gelaende" className="text-luxury-gold hover:underline">Fluggeländen findet ihr hier</Link>. Eine aktuelle und sichere Leihausrüstung sind im Preis inbegriffen. Wenn aufgrund der Wetterlage der Kurs ausfällt oder nicht vollständig absolviert werden kann, ist es möglich, diesen zu einem späteren Termin kostenlos nachzuholen, tragt euch dazu bitte an einem neuen Termin über unseren Buchungskalender ein.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Wie geht es weiter...</h3>
                <p>
                  Weiter geht's mit dem <Link to="/ausbildung" className="text-luxury-gold hover:underline font-medium">Grundkurs</Link>! Die absolvierten Tage im Schnupperkurs sowie der anteilige Kurspreis werden euch hierfür angerechnet und abgezogen (gültig innerhalb der gleichen Saison!).
                </p>
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Booking Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              {/* Subtle decorative accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <Link 
                to="/buchungskalender"
                className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-8 shadow-md"
              >
                Kurs buchen
              </Link>

              <div className="space-y-6 mb-8">
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-luxury-gold text-xs uppercase tracking-widest font-semibold mb-2">Kurspreis</p>
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-gray-600 font-light text-sm leading-relaxed">
                      Schnuppertag 1-tägig Samstag,<br/>
                      wetterbedingt kann auf Sonntag verschoben werden
                    </p>
                    <p className="font-medium text-luxury-dark whitespace-nowrap">149,- €</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-gray-600 font-light text-sm leading-relaxed">
                      Einsteigerkurs 2-tägig Samstag & Sonntag
                    </p>
                    <p className="font-medium text-luxury-dark whitespace-nowrap">250,- €</p>
                  </div>
                </div>
              </div>

              <Link 
                to="/buchungskalender" 
                className="w-full block bg-luxury-dark hover:bg-luxury-gold text-white text-center py-4 text-sm font-semibold uppercase tracking-widest transition-colors"
              >
                Termine &gt; Siehe Kalender
              </Link>
            </div>

            {/* Voucher Box */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Schnupperkurs Verschenken
               </h3>
               <p className="text-gray-500 font-light text-sm mb-4">
                 Der Schnupperkurs ist auch als Geschenk-Gutschein möglich
               </p>
               <div className="relative">
                 <input 
                   type="email" 
                   placeholder="E-Mail für Gutschein..." 
                   className="w-full border border-gray-300 p-3 pl-10 focus:outline-none focus:border-luxury-gold transition-colors text-sm font-light"
                 />
                 <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               </div>
            </div>

            {/* Impressions Gallery */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-6 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Impressionen
               </h3>
               <div className="grid grid-cols-3 gap-2">
                 {[1018, 1036, 1043, 1044, 1050, 1060, 1070, 1080, 1015].map((id, index) => (
                   <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-100">
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

        {/* Leistungen & Checkliste Grid (Full Width) */}
        <div className="max-w-7xl mx-auto mt-16 lg:mt-24">
          <hr className="border-gray-100 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h2 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase">Unsere Leistungen</h2>
              <ul className="space-y-4">
                {[
                  'Theorie- und Praxisausbildung durch zertifizierte Fluglehrer',
                  'Neue und sichere Leihausrüstung',
                  'Funkausrüstung und -betreuung',
                  'Haftpflichtversicherung'
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
                  'Ausreichend Getränke und Verpflegung (Fliegen macht hungrig!)',
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
