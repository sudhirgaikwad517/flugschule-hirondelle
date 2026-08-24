import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

export const SavoyeTour = () => {
  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="pt-16 md:pt-24 pb-8 md:pb-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-12">
            
            <div>
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                REISEN
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Savoyer Alpentour
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm">
              <img 
                src="https://picsum.photos/id/1060/1000/600" 
                alt="Savoyer Alpentour" 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              
              <div>
                <p>
                  Die Savoyer Alpen befinden sich grob zwischen Genf, Chamonix und Grenoble. In dieser Region dürfte es wohl die weltweit größte Fluggebietsdichte geben. Unser Standort ist der Campingplatz La ferme de la Serraz neben dem Lac d' Annecy in Doussard. Um den See liegen alleine schon 3 Fluggelände, die von der Hauptwindrichtung recht unabhängig sind und fast täglich Flugbedingungen bieten. Von dort aus unternehmen wir dann Tagestouren in die umliegenden Fluggebiete, bspw. Allevard / St. Hilaire oder Samoëns.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Die Tour...</h3>
                <p>
                  Die Start- und Landeplätze der Savoyer Alpen sind von ihrem Grundcharakter einfach. Landschaftlich ist die Region mit ihren weißen Kalkfelsen, Wald und den 3 tiefblauen Seen der Renner. Der Blick zum Mt. Blanc, die Cafés, Boulangerien und Patisserien sprechen für sich. Durch die Geländevielfalt muss sich der Pilot auf neue Start- und Landeplatzsituationen einstellen, was einen sehr guten Weiterbildungseffekt hat. Thermisch sind die Savoyer Alpen sehr gut. Genauso gibt es viele Kanten, an denen mit dem Gleitschirm stundenlang gesoart werden kann. Ist genügend Arbeitshöhe vorhanden, können kleinere Strecken geflogen werden. Passt das Wetter am Col de la Forclaz, können die Piloten den Streckenflugklassiker "die kleine Seerunde" nach vorheriger Besprechung in Angriff nehmen. Und schon habt ihr den Streckenflug für den B-Schein in der Tasche.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Für wen ist die Reise gedacht?</h3>
                <p>
                  Für den Gelegenheits-Genussflieger der fliegerisch dazulernen und für denjenigen, der seine ersten kleinen Streckenflüge machen möchte. Mit einer Starthöhe von über 1.000 Metern bieten die Savoyer Alpen durchaus alpine Thermik- und Streckenflugqualitäten.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Anreise, Unterkunft und Verpflegung</h3>
                <p>
                  Wir übernachten in Frankreich auf dem Campingplatz – für alle ohne eigenes Dach / Haus gibt es dort voll ausgestattete Mobilehomes zum Mieten.
                </p>
              </div>

            </div>

            {/* Leistungen inside Left Column */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase tracking-wider border-b border-gray-200 pb-4 text-[#53a8c7]">Unsere Leistungen</h3>
              <ul className="space-y-4">
                {[
                  'professionelle Betreuung durch unsere Fluglehrer',
                  'Gelände- und spezielle Theorieeinweisung fürs Soaring, Thermikfliegen, Streckenfliegen',
                  'tägliches Flugwetterbriefing',
                  'Funkbetreuung',
                  'exkl. Übernachtungskosten, Verpflegung, Auffahrten'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-gray-600 font-light text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#53a8c7] mt-2 shrink-0"></span>
                    <span className="leading-relaxed whitespace-pre-line">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kommentare Section (Moved inside Left Column) */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h2 className="text-xl text-gray-700 mb-6 pb-3 border-b border-gray-200">
                Kommentare (0)
              </h2>

              <div className="space-y-8">
                {/* Comment Input */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-300 flex items-center justify-center text-white text-2xl shrink-0">
                     <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                       <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea 
                      className="w-full border border-gray-300 p-4 min-h-[100px] text-sm focus:outline-none focus:border-blue-500 rounded-sm"
                      placeholder="Kommentar schreiben"
                    ></textarea>
                    <div className="text-center text-xs text-gray-400 mt-4">
                      Kommentare powered by CComment
                    </div>
                  </div>
                </div>
                
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
                      <p className="font-medium text-luxury-dark whitespace-nowrap text-lg">850,- €</p>
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
                 {[1060, 1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069].map((id, index) => (
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
