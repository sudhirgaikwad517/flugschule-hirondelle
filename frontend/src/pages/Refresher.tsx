import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Gift } from 'lucide-react';

export const Refresher = () => {
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
                PERFORMANCE
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Refresherkurs
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm">
              <img 
                src="https://picsum.photos/id/1054/1000/600" 
                alt="Refresherkurs" 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Sicher in allen Situationen...</h3>
                <p className="mb-4">
                  Der Refresher-Kurs richtet sich an alle Piloten, die bereits ihre Ausbildung abgeschlossen haben. Wer unseren schönen Sport einmal gelernt hat und länger nicht mehr geflogen ist, ist eher verunsichert und traut sich deshalb vielleicht nicht mehr alleine zu fliegen. Um dem entgegen zu wirken und den Spaß am schönsten Hobby der Welt zu erhalten, bieten wir euch einen Refresher-Kurs. Dort kommt ihr mit Funkunterstüzung und ein wenig Hilfe schnell wieder sicher in die Luft.
                </p>
                <p>
                  Ganz wichtig ist uns dabei nur so schnell voran zu gehen wie ihr es für richtig haltet! Wir fangen auch gerne noch mal von vorne mit euch an.
                </p>
              </div>
            </div>

            {/* Leistungen & Checkliste inside Left Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-12 border-t border-gray-100">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">Unsere Leistungen</h3>
                <ul className="space-y-4 mt-6">
                  {[
                    'Fachkundige Betreuung durch unsere Fluglehrer',
                    'Funkausrüstung und -betreuung',
                    'Auf Wunsch Leihausrüstung'
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-600 font-light text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold mt-2 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">Deine Checkliste</h3>
                <ul className="space-y-4 mt-6">
                  {[
                    'Lust aufs Fliegen',
                    'Überknöchelhohe Schuhe, wir empfehlen spezielle Flugschuhe oder zumindest Wanderschuhe',
                    'Outdoor-Bekleidung, je nach Wetter Wechselkleidung',
                    'Ausreichend Getränke und Verpflegung (Fliegen macht hungrig!!!)',
                    'Sonnencreme'
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-600 font-light text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold mt-2 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Booking Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <div className="bg-[#53a8c7] text-white text-center py-2 mb-6 font-semibold text-sm">
                Kurs buchen
              </div>

              <div className="space-y-6 mb-8 text-sm">
                
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-luxury-dark font-medium">Kurspreis</p>
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-gray-600 font-light italic">Teilnahme im Rahmen vom Grundkurs<br/>Kurstag Sonntag, wetterbedingt kann auf Samstag vorgezogen werden</p>
                      <p className="font-medium text-luxury-dark whitespace-nowrap">149,- €</p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-luxury-dark font-medium">Kurspreis in Privatschulung</p>
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-gray-600 font-light italic">Termine auf Anfrage<br/><br/>[eigene Ausrüstung erforderlich,<br/>Leihausrüstung auf Anfrage]</p>
                      <div className="text-right">
                        <p className="font-medium text-luxury-dark whitespace-nowrap">490,- € /</p>
                        <p className="text-gray-500 font-light text-xs">Einheit</p>
                        <p className="text-gray-500 font-light text-xs">(3-6 h)</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <Link 
                to="/buchungskalender" 
                className="w-full block bg-luxury-dark hover:bg-luxury-gold text-white text-center py-4 text-sm font-semibold uppercase tracking-widest transition-colors shadow-md"
              >
                Termine &gt; siehe Kalender
              </Link>
            </div>

            {/* Voucher Box */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Kurs Verschenken
               </h3>
               <p className="text-gray-500 font-light text-sm mb-4">
                 Refresherkurs ist auch als Geschenk-Gutschein möglich
               </p>
               <div className="relative h-40 w-full rounded-sm overflow-hidden group cursor-pointer mb-4">
                 <img src="https://picsum.photos/id/1018/600/300" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gutschein" />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                 <div className="absolute right-0 top-0 bottom-0 w-16 bg-[#0088cc] flex items-center justify-center">
                   <div className="rotate-[-90deg] text-white font-bold tracking-widest whitespace-nowrap">Gutschein</div>
                 </div>
               </div>
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
                 {[1015, 1025, 1035, 1045, 1055, 1065, 1075, 1085, 1011, 1012, 1013, 1014].map((id, index) => (
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
      </section>

    </div>
  );
};
