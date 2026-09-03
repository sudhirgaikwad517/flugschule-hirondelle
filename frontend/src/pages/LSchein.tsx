import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Gift, Play } from 'lucide-react';

export const LSchein = () => {
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
                L-Schein
              </h1>
            </div>

            {/* Video */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm group bg-luxury-dark">
              {showVideo ? (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/fEQXD2JxcBU?autoplay=1"
                  title="Gleitschirm Grundkurs - Einblick in unsere Schulung | Flugschule Hirondelle"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button type="button" onClick={() => setShowVideo(true)} className="w-full h-full block cursor-pointer">
                  <img
                    src="/images/grundkurs/hero.jpg"
                    alt="L-Schein Grundkurs"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 right-4 flex items-center gap-4 text-left">
                     <div className="w-10 h-10 rounded-full border border-white/50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-1">
                       <img src="/google.png" className="w-full h-full object-contain brightness-0 invert" alt="Logo" />
                     </div>
                     <div>
                        <h3 className="text-white font-semibold text-lg drop-shadow-md">Gleitschirm Grundkurs - Einblick in unsere Schulung</h3>
                        <p className="text-white/80 text-sm drop-shadow-md">Flugschule Hirondelle</p>
                     </div>
                  </div>
                </button>
              )}
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Du legst den Grundstein...</h3>
                <p>
                  Aufbauend auf den <Link to="/ausbildung/schnupperkurs" className="text-luxury-gold hover:underline font-medium">Schnupperkurs</Link> werden im Grundkurs die fehlenden Flüge zur Erlangung des L-Scheins absolviert. Ziel des Kurses ist es, mindestens 15 Flüge am Hang oder an der <Link to="/ausbildung/winde" className="text-luxury-gold hover:underline font-medium">Winde</Link> zu absolvieren, bei denen die Höhendifferenz schon bis zu 200 Meter betragen kann. Kurvenflug und Schirmkontrolle sind einige der Lerninhalte, die in diesem Kurs auf dem Lehrplan stehen. In der Ausbildung erlernst du das Grundwissen in Theorie und Praxis. Mit dem erlangten Lernausweis könnt ihr dann später an den Übungshängen, an denen ihr im Grundkurs mindestens 5 Flüge absolviert habt, auch selbständig fliegen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Was dich beim Grundkurs erwartet...</h3>
                <p>
                  Steigst du direkt mit dem Grundkurs ein (ohne vorherigen <Link to="/ausbildung/schnupperkurs" className="text-luxury-gold hover:underline font-medium">Schnupperkurs</Link>), beginnen wir zunächst mit Aufzieh- und Laufübungen im flachen Gelände und arbeiten uns dann immer weiter den Hang hinauf. Bei den 15 für den Grundkurs benötigten Flügen verfeinern wir Start, Flug-, Steuer- und Landetechnik mit Hilfe ständiger Funkbetreuung. Außerdem werden die theoretischen Lerninhalte des <Link to="/ausbildung/schnupperkurs" className="text-luxury-gold hover:underline font-medium">Schnupperkurses</Link> vertieft und ergänzt. Das Wechselspiel zwischen kurzen theoretischen Erklärungen und der direkten praktischen Umsetzung am Übungshang lassen eure Flugtechnik schnell Fortschritte machen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Alles nach Plan...</h3>
                <p>
                  Bei den Flügen werden die Lerninhalte aus dem Lehrplan abgearbeitet und falls erforderlich für die Fluggelände ergänzt. Der Lehrplan wird den Flugschulen vom <a href="https://www.dhv.de/" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:underline font-medium">Deutschen Hängegleiterverband (DHV)</a> vorgegeben und ist für die Gleitschirmausbildung verpflichtend. Da jeder Schüler das Gelernte unterschiedlich schnell umsetzt, kann jeder seine Flüge innerhalb des Kurses in eigenem Tempo absolvieren. Das heißt, ihr kommt so oft dazu, bis ihr die 15 Flüge voll habt. Im Kurspreis sind 2-4 Tage inkludiert, weitere notwendige Tage können gegen einen geringen Aufpreis dazu gebucht werden. Uns ist wichtig, dass euch die Gleitschirmschulung Spaß macht und sie fundiert und sicher abläuft. Habt ihr vorher einen <Link to="/ausbildung/schnupperkurs" className="text-luxury-gold hover:underline font-medium">Schnupperkurs</Link> absolviert, so werden die absolvierten Tage sowie der anteilige Kurspreis beim Grundkurs verrechnet und abgezogen (gültig innerhalb der gleichen Saison!).
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Organisatorisches...</h3>
                <p>
                  Ort und Uhrzeit der Kurstermine erfahrt ihr am Vortag bis ca. 15 Uhr per Newsletter. Die Termine finden flexibel an Wochenenden wie auch unter der Woche statt. Je nach Wetterlage (und vor allem Windrichtung) schulen wir an einem unserer Übungshänge im Odenwald, Kraichtal, Nahetal und der Pfalz. Die Wegbeschreibungen zu den jeweiligen <Link to="/infos#gelaende" className="text-luxury-gold hover:underline font-medium">Fluggeländen findet ihr hier</Link>. Das Skript zum Kurs und eine aktuelle Leihausrüstung sind wie beim <Link to="/ausbildung/schnupperkurs" className="text-luxury-gold hover:underline font-medium">Schnupperkurs</Link> im Preis inbegriffen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Wie geht es weiter...</h3>
                <p>
                  Weiter geht's mit dem <Link to="/ausbildung#a-schein" className="text-luxury-gold hover:underline font-medium">A-Schein</Link> – dem Höhenflugausweis zum selbständigen Fliegen!
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
                to="/events?category=Grundkurs"
                className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-8 shadow-md"
              >
                Kurs buchen
              </Link>

              <div className="space-y-6 mb-8">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-gray-600 font-light text-sm leading-relaxed">
                      <p className="font-medium text-luxury-dark mb-1">Grundkurs / L-Schein</p>
                      <p className="italic text-[13px]">[ mehrtägiger Kurs 2-4 Tage mit Fluggarantie ]</p>
                    </div>
                    <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">620,- €</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-gray-600 font-light text-sm leading-relaxed">
                      Zusatztage {'>'} 4 Tage - Preis pro Tag
                    </p>
                    <p className="font-medium text-luxury-dark whitespace-nowrap">149,- €</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-gray-600 font-light text-sm leading-relaxed">
                      <p className="font-bold text-luxury-dark text-[13px]">Kombikurs*:</p>
                      <p>Grundkurs & A-Scheinkurs Woche 1</p>
                    </div>
                    <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">1.590,- €</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-gray-600 font-light text-sm leading-relaxed">
                      <p className="font-bold text-luxury-dark text-[13px]">Kombikurs Kompakt*:</p>
                      <p>Grundkurs & Winde & A-Scheinkurs Woche 1</p>
                    </div>
                    <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">1.990,- €</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-gray-500 font-light text-xs italic leading-relaxed">
                    *Kursgebühren mit bei uns gekaufter Ausrüstung / Leihausrüstung siehe <Link to="/infos#zusatzkosten" className="text-luxury-gold hover:underline">Zusatzkosten</Link> A-Schein
                  </p>
                </div>
              </div>

              <Link 
                to="/events?category=Grundkurs" 
                className="w-full block bg-luxury-dark hover:bg-luxury-gold text-white text-center py-4 text-sm font-semibold uppercase tracking-widest transition-colors"
              >
                Termine &gt; Siehe Liste
              </Link>
            </div>

            {/* Voucher Box */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Grundkurs Verschenken
               </h3>
               <p className="text-gray-500 font-light text-sm mb-4">
                 Der Grundkurs ist auch als Geschenk-Gutschein möglich
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
                 {Array.from({ length: 9 }, (_, i) => i + 1).map((n, index) => (
                   <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-100">
                     <img
                       src={`/images/grundkurs/gallery-${n}.jpg`}
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
