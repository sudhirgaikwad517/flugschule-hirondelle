import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Gift } from 'lucide-react';
import { EventComments } from '../components/common/EventComments';

export const BrasilienTour = () => {
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
                Brasilien-Tour
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm">
              <img 
                src="/images/reisen/brasilien.jpg"
                alt="Brasilien-Tour"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Thermik und Streckenfliegen in Brasilien</h3>
                <p className="mb-4">
                  Fliegen in Rio de Janeiro – Uma cidade maravilhosa (eine wunderbare Stadt). Aber nicht nur in und um Rio wird geflogen. Bei unserer Rundreise in Brasilien wollen wir neben den Startplätzen in und um Rio auch die Startplätze im Landesinneren kennen lernen. Die Landschaften sind atemberaubend. Die oft zu findenden rundgeschliffenen Felsformationen machen das Fliegen in Brasilien zu etwas ganz Besonderem. In der Thermik drehen wir oft mit den Urubus, den einheimischen Schwarz-Geiern. Diese treten meistens in kleinen bis großen Gruppen auf. Einfach herrlich.
                </p>
                <p className="mb-4">
                  Auf unserer kleinen Rundreise durch die Fluggebiete machen wir auch an den bekannten PWC-Geländen Halt. Hier laden uns herrlich angelegte Startplätze zum Fliegen ein. Highlight der Tour wird mit Sicherheit auch das Fluggebiet in Rio mit dem Petra Bonita, dem schwarzen Fels direkt am Meer mit der Möglichkeit, bei etwas Glück und Können, an der Christus-Statue vorbei zu fliegen. Und natürlich gehört ein Abstecher auf den Zuckerhut und den weltbekannten Strand Copacabana mit zum Pflichtprogramm.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Fluggebiete</h3>
                <p>
                  Wir sehen bei dieser Tour bis zu 10 verschiedene Fluggebiete. Einige sind mit Sternfahrten von unserer Unterkunft erreichbar, andere fahren wir direkt an. Unter anderem dabei das bekannte PWC-Gelände in Valadares und Baixo Guandu und Castelo. Wir sind gespannt, was ihr von den Fluggebieten haltet.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Für wen ist die Reise gedacht?</h3>
                <p className="mb-4">
                  Die Reise ist sowohl für engagierte Hobbypiloten wie auch für den versierten Flieger geeignet. Für alle, die fliegerisch dazulernen und neue Eindrücke gewinnen wollen, für diejenigen, die ihre ersten kleinen Streckenflüge machen möchten, Streckencracks, Genussflieger einfach alle :-)! Mindestvoraussetzung ist der A-Schein oder Sopi.
                </p>
                <p>
                  Nicht fliegende Begleitpersonen sind ebenfalls herzlich willkommen und kommen bei dieser Reise auch auf ihre Kosten.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Anreise, Unterkunft und Verpflegung</h3>
                <p className="mb-4">
                  Die Anreise / Hin- und Rückflug erfolgt nach Rio de Janeiro. Idealerweise bucht ihr eure Flüge ab z.B. Frankfurt mit Lufthansa (Direktflug). Zwecks gemeinsamer Anreise in der gleichen Maschine geben wir euch gerne die Flugnummer. Hinflug Freitag, 31.1.2020 (abends um 22 Uhr über Nacht), Beginn der Reise am Samstag, 1.2.2020. Rückflug Samstag 15.2.2020 19:40 Uhr, Ankunft in Frankfurt Sonntag, 16.2.2020.
                </p>
                <p>
                  Während unseres Aufenthalts sind wir in gemütlichen Gästehäusern (Pousadas) und Hotels untergebracht. Nach dem Fliegen lassen wir den Tag in geselliger Runde bei gemeinsamem Abendessen ausklingen und lassen uns von der brasilianischen Küche verwöhnen z. B. in einer der landestypischen Churrascarias (Fleischtempel ;-)) und genießen den ein oder anderen Caipi oder eine frische Kokosnuss am Strand.
                </p>
              </div>

            </div>

            {/* Leistungen inside Left Column (matches original design) */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase tracking-wider border-b border-gray-200 pb-4 text-[#53a8c7]">Unsere Leistungen</h3>
              <ul className="space-y-4">
                {[
                  'professionelle Betreuung durch unsere Fluglehrer und Betreuer sowie einheimische Guides',
                  'Gelände- und spezielle Theorieeinweisung fürs Soaring, Thermikfliegen, Streckenfliegen',
                  'Flugwetterbriefing',
                  'Funkbetreuung',
                  'Videoanalyse',
                  'alle Transfers während der Reisedauer sowie Auffahrten zu Startplätzen',
                  'Rückholen nach den Streckenflügen egal wo :-)!',
                  'Übernachtungen in Gästehäusern, im Doppelzimmer inkl. Frühstück',
                  'Organisation eines Alternativprogramms bei schlechtem Wetter',
                  'exkl. Hin- und Rückflug nach Rio',
                  'exkl. Eintrittspreise für das Alternativprogramm',
                  'exkl. Geländegebühren vor Ort (die sind eher gering)',
                  'exkl. Auslandskrankenversicherung inkl. Rücktransport (bitte unbedingt abschließen - gibt es für 13,90 € / Jahr beim ADAC)'
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
                to="/events?category=Reisen"
                className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-8 shadow-md flex items-center justify-center gap-2"
              >
                Reise buchen
              </Link>

              <div className="space-y-6 mb-8 text-sm">
                <div>
                  <p className="text-luxury-dark font-medium mb-2">Tourpreis</p>
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-gray-600 font-light">Die Reisepreiskalkulation basiert auf dem Wechselkurs 1,- € / 4,20 Brasilianischer Real. Nachkalkulation bei Abweichungen vorbehalten.</p>
                    <div className="text-right">
                      <p className="font-medium text-luxury-dark whitespace-nowrap text-lg">2.150,-</p>
                      <p className="font-medium text-luxury-dark whitespace-nowrap text-lg">€</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 font-light">Voraussetzung: mindestens A-Schein / Sopi</p>
                </div>
              </div>

              <Link to="/events?search=Brasilien" className="block w-full bg-[#4a5f68] hover:bg-[#3d4f57] text-white text-center py-3 font-semibold shadow-md transition-colors">
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
                 {Array.from({ length: 12 }, (_, i) => i + 1).map((n, index) => (
                   <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-900">
                     <img
                       src={`/images/tour-brasilien/gallery-${n}.jpg`}
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
          <EventComments pageSlug="brasilien-tour" />
        </div>
      </section>

    </div>
  );
};
