import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Search } from 'lucide-react';
import { EventComments } from '../components/common/EventComments';
import { useLightbox } from '../components/common/Lightbox';
import { GutscheinBox } from '../components/common/GutscheinBox';

// Old site's actual "Simple Image Gallery" filenames for this page
// (/images/2-tour-griechenland-safari/*), in their real order.
const GALLERY_FILES = [
  'Griechenland_0936', 'Griechenland_0939', 'Griechenland_0948', 'Griechenland_0951', 'Griechenland_0955',
  'Griechenland_1140', 'Griechenland_1213', 'Griechenland_1214', 'Griechenland_1229', 'Griechenland_1239',
  'Griechenland_1243', 'Griechenland_1266', 'Griechenland_3999', 'Griechenland_4074', 'Griechenland_4105',
  'Griechenland_4430', 'Griechenland_4467', 'Griechenland_4514', 'Griechenland_4517', 'Griechenland_4657',
  'Griechenland_4697', 'Griechenland_4734', 'Griechenland_4735', 'Griechenland_4929', 'Griechenland_4954',
  'Griechenland_5501', 'Griechenland_7909', 'Griechenland_7932', 'Griechenland_7933', 'Griechenland_7996',
  'Griechenland_8050', 'Griechenland_8055', 'Griechenland_8063', 'Griechenland_8095', 'Griechenland_8156',
  'Griechenland_8162',
];

export const GriechenlandTour = () => {
  const { openGallery } = useLightbox();
  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto">

          {/* Page Title (full width, above the two-column grid) */}
          <div className="mb-12">
            <p className="text-luxury-heading uppercase tracking-[0.2em] text-xs font-semibold mb-3">
              REISEN
            </p>
            <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
              Griechenland-Tour
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column (Content) */}
          <div className="lg:col-span-7 space-y-12">

            {/* Video - old site just embeds the iframe directly, no click-to-play
                preview thumbnail, so this doesn't either. */}
            <div className="w-full h-[400px] overflow-hidden rounded-sm shadow-sm">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/TW9W8u_MjUM?rel=0"
                title="Griechenland Tour 2018 - Gleitschirmfliegen lernen | Flugschule Hirondelle"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Griechenland-Tour Westküste</h3>
                <p>
                  Gerade die Nordwestküste Griechenlands ist von dem im Sommer auftretendem starken Nordostwind (Windsystem Meltemia) geschützt und bietet den Fliegern optimale Flugbedingungen und eine fast ganzjährige Flugsaison (März-November).
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Das Fluggebiet</h3>
                <p className="mb-4">
                  Die Reise beginnt und endet in Preveza / Flughafen. Von Preveza aus fahren wir auf die Insel Lefkada, dort sind wir während der Woche untergebracht. Unsere Fluggebiete befinden sich in einem Radius von 150 km, welche individuell je nach Wetterlage und Windrichtung angesteuert werden.
                </p>
                <p>
                  Die Flugsafari ist eine tolle Kombination von Thermik- und Streckenfliegen im Pindosgebirge sowie dem Küstensoaren auf der Insel Lefkada an der Westküste Griechenlands.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Und sonst ...</h3>
                <p>
                  Die Erlebnisse des Tages lassen wir dann abends in gemütlicher Runde nochmals in einer der vielen gemütlichen Tavernen bei einem (oder zwei?) Gläschen Retsina und einem leckeren, opulenten griechischen Fisch- oder Fleischgericht Revue passieren. An nicht fliegbaren Tagen, gibt es einige Möglichkeiten in dieser Gegend schöne Ausflüge zu unternehmen oder einfach nur am Strand zu chillen - das Meer hat Ende Mai schon echte Badetemperatur! Das Wetter ist aber um diese Jahreszeit meist so gut, dass wir hoffentlich die meiste Zeit der Reise in der Luft verbringen werden.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Für wen ist die Reise gedacht?</h3>
                <p>
                  Für diejenigen, die in einem entspannten Fluggebiet ihre ersten Soaring- und Thermikerfahrungen sammeln wollen sowie für den ambitionierten Genussflieger, der sich an seine ersten kleinen Strecken rantasten will. Die Flugreise richtet sich somit gleichermaßen an Streckenflugeinsteiger wie auch erfahrene XC-Piloten.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Anreise, Unterkunft und Verpflegung</h3>
                <p>
                  Zielflughafen und Treffpunkt ist der Flughafen Preveza im Westen Griechenlands. Ab Frankfurt fliegt Condor als Direktflug. Als Unterkünfte haben wir ein gemütliches Hotel mit Übernachtung / Frühstück vorreserviert. Das Abendessen wird angepasst an den aktuellen Tagesverlauf und entsprechend der regionalen Gegebenheiten geplant. Es findet in ausgewählten örtlichen Restaurants mit typisch griechischer Küche statt, um möglichst alle kulinarischen Besonderheiten dieser Region kennenzulernen.
                </p>
              </div>

            </div>

            {/* Leistungen inside Left Column */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <h3 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase tracking-wider border-b border-gray-200 pb-4 text-[#53a8c7]">Leistungen</h3>
              <ul className="space-y-4 mb-12">
                {[
                  'Gelände- und spezielle Theorieeinweisung fürs Soaring, Thermikfliegen, Streckenfliegen',
                  'professionelle Betreuung durch unsere Fluglehrer',
                  'tägliches Flugwetterbriefing',
                  'Funkbetreuung',
                  'Videoanalyse',
                  'inkl. Transfers ab Flughafen Preveza und in die Fluggebiete',
                  'exkl. Flug und Unterkunft / Verpflegung – diese Kosten werden vom Teilnehmer selbst getragen'
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
          <div className="lg:col-span-5 space-y-12">

            {/* Badges */}
            <div className="flex flex-col gap-1 w-full font-semibold text-white text-center text-sm">
              <div className="bg-[#E58E26] py-2">Streckenflugtraining</div>
              <div className="bg-[#34963B] py-2">Thermik- und Flugtechniktraining</div>
              <div className="bg-[#80C533] py-2">Soaringtraining</div>
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
                      <p className="font-medium text-luxury-dark whitespace-nowrap text-lg">950,- €</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 font-light mb-4">Voraussetzung: mindestens 5 Teilnehmer, A-Schein / Sopi</p>
                </div>
              </div>

              <Link to="/events?search=Griechenland" className="block w-full bg-[#4a5f68] hover:bg-[#3d4f57] text-white text-center py-3 font-semibold shadow-md transition-colors">
                Termin &gt; siehe Kalender
              </Link>
            </div>

            <GutscheinBox
              heading="Tour Verschenken"
              description="Die Tour ist auch als Geschenk-Gutschein möglich"
              headingClassName="text-[#53a8c7]"
            />

            {/* Impressions Gallery */}
            <div>
               <h3 className="font-luxury text-2xl text-[#53a8c7] mb-6 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Impressionen
               </h3>
               <div className="grid grid-cols-3 gap-2">
                 {GALLERY_FILES.map((file, index) => (
                   <div
                     key={file}
                     className="relative aspect-square overflow-hidden group cursor-zoom-in bg-gray-100"
                     onClick={() => openGallery(
                       GALLERY_FILES.map((f) => ({ src: `/images/tour-griechenland/${f}.jpg`, alt: 'Impression' })),
                       index
                     )}
                   >
                     <img
                       src={`/images/tour-griechenland/${file}.jpg`}
                       alt={`Impression ${index + 1}`}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                     <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Search className="w-5 h-5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>

          </div>

          </div>
        </div>

        <div id="comments" className="max-w-[1200px] mx-auto mt-12">
          <EventComments pageSlug="griechenland-tour" />
        </div>
      </section>

    </div>
  );
};
