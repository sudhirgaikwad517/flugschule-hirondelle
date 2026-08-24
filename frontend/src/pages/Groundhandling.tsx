import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Gift, Play } from 'lucide-react';

export const Groundhandling = () => {
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
                Groundhandling Kurs
              </h1>
            </div>

            {/* Video Box */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm group cursor-pointer bg-luxury-dark">
              <img 
                src="https://picsum.photos/id/1063/1000/600" 
                alt="Groundhandling & Rückwärts aufziehen" 
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
                    <h3 className="text-white font-semibold text-lg drop-shadow-md">Groundhandling & Rückwärts aufziehen - So geht's!</h3>
                    <p className="text-white/80 text-sm drop-shadow-md">Flugschule Hirondelle</p>
                 </div>
              </div>
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Auf Tuchfühlung mit dem Gleitschirm...</h3>
                <p className="mb-4">
                  Unter Groundhandling verstehen wir, mit dem Schirm am Boden zu spielen, fühlen was sich 7 m über unseren Köpfen abspielt. Agieren und reagieren. Den Schirm sicher in allen Situationen zu beherrschen. Mit Blickrichtung zum Schirm rückwärts aufziehen, den Schirm kontrollieren, umdrehen und starten... Bei unserem Seminar werden verschiedene Techniken der Steuerung und Handhabung erklärt und gleich in der Praxis umgesetzt. All das hilft, den eigenen Gleitschirm spielerisch beherrschen zu lernen und macht außerdem auch richtig Spaß!
                </p>
                <p>
                  Wir brauchen ca. 3 Stunden, in denen wir euch 1:1 beim Groundhandling betreuen, um die Basics zu legen. Danach müsst ihr selbst noch mindestens 5 h auf die Wiese gehen, bis die Abläufe verinnerlicht sind. Groundhandling ist das A & O für jeden Piloten, um den eigenen Schirm kennen und steuern zu lernen. Selbst geübte Piloten gehen regelmäßig auf die Wiese, um ihr Gefühl für ihren Schirm zu verbessern. Als Anfänger ist dies ein absolutes Muss. Wer seinen Schirm am Boden perfekt beherrscht, gewinnt auch in der Luft Sicherheit. Die Groundhandling-Kurse finden – je nach Wetterlage – auf einem unserer Schulungsgelände statt. Weiche, hindernisfreie Wiesen sorgen für ungetrübten Spaß beim Trainieren. Wir bieten jährlich mehrere Groundhandling-Kurse an.
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
                    'Auf Wunsch Leihausrüstung, Kosten hierfür bitte anfragen',
                    'Haftpflichtversicherung'
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
                    'Lust mit dem Schirm am Boden zu spielen',
                    'Überknöchelhohe Schuhe, wir empfehlen spezielle Flugschuhe oder zumindest Wanderschuhe',
                    'Outdoor-Bekleidung, je nach Wetter Wechselkleidung',
                    'Ausreichend Getränke und Verpflegung (Groundhandling macht sehr hungrig ;-)))',
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
                Groundhandlingtraining Einzelschulung
              </div>

              <div className="space-y-6 mb-8 text-sm">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-gray-600 font-light">Kurspreis in Privatschulung<br/><span className="italic">[eigene Ausrüstung erforderlich, Leihausrüstung auf Anfrage]</span></p>
                    <div className="text-right">
                      <p className="font-medium text-luxury-dark whitespace-nowrap">450,- € / Einheit</p>
                      <p className="text-gray-500 font-light text-xs">(3 - 6 h)</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link 
                to="/buchungskalender" 
                className="w-full block bg-luxury-dark hover:bg-luxury-gold text-white text-center py-4 px-2 text-xs font-semibold transition-colors shadow-md leading-relaxed"
              >
                Termine werden über den Newsletter bekannt gegeben –<br/>meldet euch am Newsletter an
              </Link>
            </div>

            {/* Voucher Box */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Kurs Verschenken
               </h3>
               <p className="text-gray-500 font-light text-sm mb-4">
                 Du suchst ein außergewöhnliches Geschenk? Warum nicht einmal einen Gutschein für einen Groundhandling-Kurs verschenken!
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
