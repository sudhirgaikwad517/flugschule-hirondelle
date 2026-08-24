import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Gift, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

export const BassanoTour = () => {
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
                Bassano-Tour
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm">
              <img 
                src="https://picsum.photos/id/1036/1000/600" 
                alt="Bassano-Tour" 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Gleitschirm-Thermik-Strecken-Fliegen Bassano</h3>
                <p className="mb-4">
                  Bassano ist das unbestrittene Mekka der Gleitschirm- und Drachenszene in den Südalpen. Besonders im Winter und zeitigen Frühjahr trifft sich hier die Szene. Daher ist im Winterhalbjahr vor allem an Wochenenden viel los. Die Thermik ist ganzjährig interessant und kann schon früh im Jahr für Streckenflüge genutzt werden. Es bietet ca. 320 fliegbare Tage pro Jahr. Von wunderschönen, stundenlangen Thermikflügen mit herrlichem Blick auf die Poebene bis zu schönen Streckenflügen. Bassano bietet mehrere Startplätze die bequem mit einem Shuttlebus erreicht werden können.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Das Fluggebiet</h3>
                <p className="mb-4">
                  Das Bergmassiv Monte Grappa mit seinen ca. 1.600 Höhenmetern ist eine riesige langgezogene Bergkette, welche südlich ausgerichtet ist und für zuverlässige Thermik sorgt. Es gibt zahlreiche Startmöglichkeiten für fast alle Windrichtungen.
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-600">
                  <li>O-Startplatz: Antenna Costalunga, 755 m NN</li>
                  <li>S-Startplatz: Da Bepi, 829 m NN</li>
                  <li>W-Startplatz: Casette, 975 m NN</li>
                  <li>SSO-Startplatz: Campeggia, 1.080 m NN</li>
                  <li>SO-Startplatz: Panettone - Cima Grappa, 1.563 m NN</li>
                </ul>
                <p>
                  Bei entsprechendem Wetter sind Tagesausflüge in die benachbarten unbekannteren Fluggebiete geplant.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Für wen ist die Reise gedacht?</h3>
                <p>
                  Für diejenigen, die in einem entspannten Fluggebiet ihre ersten Thermikerfahrungen sammeln wollen, sowie den ambitionierten Genussflieger der sich an seine ersten kleinen Strecken ran tasten will.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Anreise, Unterkunft und Verpflegung</h3>
                <p>
                  Wir wollen im Hotel in der Nähe vom Landeplatz einchecken. Dort können Doppelzimmer oder auch Einzelzimmer gebucht werden (Orga über uns), jeweils inkl. Frühstück. Alternativ könnt ihr auf dem angeschlossenen Campingplatz unterkommen. Nach dem Fliegen lassen wir den Tag in geselliger Runde bei gemeinsamem Abendessen ausklingen und lassen uns von der italienischen Küche verwöhnen.
                </p>
              </div>

            </div>

            {/* Leistungen inside Left Column */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase tracking-wider border-b border-gray-200 pb-4 text-[#53a8c7]">Leistungen</h3>
              <ul className="space-y-4 mb-12">
                {[
                  'professionelle Betreuung durch unsere Fluglehrer',
                  'Gelände- und spezielle Theorieeinweisung fürs Soaring, Thermikfliegen, Streckenfliegen',
                  'Flugwetterbriefing',
                  'Funkbetreuung',
                  'Videoanalyse',
                  'exkl. Anreise, Unterkunft, Verpflegung, Auffahrten',
                  'exkl. Geländegebühren',
                  'exkl. Eintrittspreise für das Alternativprogramm',
                  'exkl. Auslandskrankenversicherung inkl. Rücktransport'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-gray-600 font-light text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#53a8c7] mt-2 shrink-0"></span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              
              {/* Flyer Mockup Image */}
              <div className="w-full max-w-xs mx-auto">
                <img src="https://picsum.photos/id/1020/600/800" alt="Flugschule Hirondelle Flyer Bassano" className="w-full h-auto rounded-md shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500" />
                {/* Kommentare Section (Moved inside Left Column) */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h2 className="text-xl text-gray-700 mb-6 pb-3 border-b border-gray-200">
                Kommentare (3)
              </h2>

              <div className="space-y-8">
                {/* Comment 1 */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-300 flex items-center justify-center text-white text-2xl shrink-0">
                    <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                       <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    </div>
                  </div>
                  <div className="flex-1 text-sm pb-8 border-b border-gray-200 border-dashed">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-semibold text-gray-700">Johannes</span>
                      <span className="text-gray-400 text-xs">Montag, 24. Mai 2021</span>
                    </div>
                    <div className="text-gray-600 font-light space-y-4">
                      <p>Liebes Hirondelle-Team,</p>
                      <p>vielen Dank für die tolle Reise! Nicht nur, dass ich viele tolle Flüge mit euch genießen konnte - auch das gesamte Setup war super. Gutes Essen, tolle Stimmung und super Betreuung in der Luft!</p>
                      <p>Bis bald und Grüße aus Mainz!</p>
                      <p>Johannes</p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-blue-500">
                      <button className="flex items-center gap-1 hover:text-blue-700"><ThumbsUp className="w-3 h-3" /> 0</button>
                      <button className="flex items-center gap-1 hover:text-blue-700"><ThumbsDown className="w-3 h-3" /></button>
                      <button className="flex items-center gap-1 hover:text-blue-700"><MessageSquare className="w-3 h-3" /> Zitat</button>
                    </div>
                  </div>
                </div>

                {/* Comment 2 */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-300 flex items-center justify-center text-white text-2xl shrink-0">
                     <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                       <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    </div>
                  </div>
                  <div className="flex-1 text-sm pb-8 border-b border-gray-200 border-dashed">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-semibold text-gray-700">Juergen Stein</span>
                      <span className="text-gray-400 text-xs">Dienstag, 25. Mai 2021</span>
                    </div>
                    <div className="text-gray-600 font-light space-y-4">
                      <p>Bisher kannte ich Bassano nur als Flugschüler und das hatte schon riesig Spaß gemacht mit dem Team Hirondelle. Dieses Mal konnten wir noch mehrere neue Startplätze kennenlernen und wurden, wie immer, bei Planung, Start, Strecke, Landung hervorragend betreut. Ich freue mich schon auf die nächste Reise mit Alex und Sarah.</p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-blue-500">
                      <button className="flex items-center gap-1 hover:text-blue-700"><ThumbsUp className="w-3 h-3" /> 0</button>
                      <button className="flex items-center gap-1 hover:text-blue-700"><ThumbsDown className="w-3 h-3" /></button>
                      <button className="flex items-center gap-1 hover:text-blue-700"><MessageSquare className="w-3 h-3" /> Zitat</button>
                    </div>
                  </div>
                </div>

                {/* Comment 3 */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-300 flex items-center justify-center text-white text-2xl shrink-0">
                     <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                       <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    </div>
                  </div>
                  <div className="flex-1 text-sm pb-8 border-b border-gray-200 border-dashed">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-semibold text-gray-700">Burkard</span>
                      <span className="text-gray-400 text-xs">Dienstag, 23. Mai 2023</span>
                    </div>
                    <div className="text-gray-600 font-light space-y-4">
                      <p>Hallo Alex & Sarah,</p>
                      <p>vielen Dank, dass wir schöne Flüge hatten, ich habe wirklich viel Neues gelernt, dass ihr immer überlegt und Risiko vermeidend uns geleitet habt, dass ihr immer sooooo geduldig ward und nicht zuletzt dass die Gruppe, das Hotel und nicht zuletzt die Restaurants alle super waren!</p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-blue-500">
                      <button className="flex items-center gap-1 hover:text-blue-700"><ThumbsUp className="w-3 h-3" /> 0</button>
                      <button className="flex items-center gap-1 hover:text-blue-700"><ThumbsDown className="w-3 h-3" /></button>
                      <button className="flex items-center gap-1 hover:text-blue-700"><MessageSquare className="w-3 h-3" /> Zitat</button>
                    </div>
                  </div>
                </div>

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
                  <p className="text-gray-600 font-light mb-4">Voraussetzung: mindestens A-Schein / Sopi</p>
                </div>
              </div>

              <div className="w-full bg-[#4a5f68] text-white text-center py-3 font-semibold shadow-md">
                Termine &gt; siehe Kalender
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
                 {[1036, 1025, 1035, 1045, 1055, 1065, 1075, 1085].map((id, index) => (
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
