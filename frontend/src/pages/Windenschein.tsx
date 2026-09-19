import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Info, Search } from 'lucide-react';
import { useLightbox } from '../components/common/Lightbox';
import { GutscheinBox } from '../components/common/GutscheinBox';
import { usePageGallery } from '../hooks/usePageGallery';

// Old site's actual "Simple Image Gallery" filenames for this page
// (/images/bilder/1-winde/*.jpg), in their real order.
// Used only as a fallback now - see usePageGallery below - so the page keeps
// looking exactly like this until an admin configures a gallery for the
// "windenschein" slug in Admin > Seitenmedien.
const FALLBACK_GALLERY = [
  '1PlatzhalterbildWinde', 'Sarah_Winde_', 'winde', 'winde1', 'winde10',
  'winde12', 'winde13', 'winde14', 'winde15', 'winde16',
  'winde17', 'winde18', 'winde2', 'winde20', 'winde4',
  'winde5', 'winde6.1', 'winde6', 'winde7', 'winde8',
].map((f) => `/images/windenschein/${f}.jpg`);

export const Windenschein = () => {
  const { openGallery } = useLightbox();
  // Admin-managed gallery (falls back to FALLBACK_GALLERY above) - see
  // frontend/src/hooks/usePageGallery.ts
  const galleryImages = usePageGallery('windenschein', FALLBACK_GALLERY);
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
              AUSBILDUNG
            </p>
            <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
              Windenschein
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column (Content) */}
          <div className="lg:col-span-7 space-y-12">

            {/* Featured Video - old site just embeds the iframe directly, no
                click-to-play preview thumbnail, so this doesn't either. */}
            <div className="w-full h-[400px] overflow-hidden rounded-sm shadow-sm">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/KSdpddm3Rnw?rel=0"
                title="A-Schein Windenstarts - Paragliding lernen | Flugschule Hirondelle"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
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
                    20 Flüge unter Fluglehreraufsicht benötigt ihr zur Erlangung der Windenschleppstartberechtigung. Nach erfolgreich abgelegter flugschulinterner Theorie- und Praxisprüfung für den Windenschlepp darfst du dann selbständig an der Winde fliegen (Voraussetzung <Link to="/ausbildung/a-schein" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">A-Schein</Link>!). Die Ausbildungsdauer beträgt je nach Wetterlage und persönlicher Kondition ca. 2 bis 3 Tage.
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
                    Mitten in der Rheinebene befindet sich der Flugplatz <Link to="/infos/gelaende/herrenteich" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Herrenteich</Link>, der gut und schnell erreichbar ist.
                  </p>
                  <p>
                    Bei Bad Kreuznach liegt das Schleppgelände <Link to="/infos/gelaende/bad-kreuznach" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Auf dem unteren Mergesfeld</Link> des Drachen- und Gleitsegelclub Nahetal e.V „DGCN“.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-5 space-y-12">
            
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
                className="w-full block bg-[#526a75] hover:bg-luxury-gold text-white text-center py-4 text-sm font-semibold uppercase tracking-widest transition-colors"
              >
                Termine &gt; Zum Kalender
              </Link>
            </div>

            <GutscheinBox
              heading="Windenschein Verschenken"
              description="Der Windenschein ist auch als Geschenk-Gutschein möglich"
            />

            {/* Impressions Gallery */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-6 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Impressionen
               </h3>
               <div className="grid grid-cols-3 gap-2">
                 {galleryImages.map((img, index) => (
                   <div
                     key={img}
                     className="relative aspect-square overflow-hidden group cursor-zoom-in bg-gray-100"
                     onClick={() => openGallery(
                       galleryImages.map((g) => ({ src: g, alt: 'Impression' })),
                       index
                     )}
                   >
                     <img
                       src={img}
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

        {/* Leistungen & Checkliste Grid (Full Width) */}
        <div className="max-w-[1200px] mx-auto mt-8">
          <hr className="border-gray-100 mb-10" />
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
                  <>E-Learning Prüffragen <a href="https://shop.dhv.de/collections/prufungsfragen" target="_blank" rel="noopener noreferrer" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Gleitschirm-Windenschein</a> vom DHV</>,
                  <><a href="#" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Prüfungsgebühren ab 03.04.2023</a> DHV</>
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
