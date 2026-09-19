import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Search } from 'lucide-react';
import { useLightbox } from '../components/common/Lightbox';
import { GutscheinBox } from '../components/common/GutscheinBox';
import { usePageGallery } from '../hooks/usePageGallery';

// Old site's actual "Simple Image Gallery" filenames for this page
// (/images/bilder/1-grundkurs/*.jpg), in their real order.
// Used only as a fallback now - see usePageGallery below - so the page keeps
// looking exactly like this until an admin configures a gallery for the
// "l-schein" slug in Admin > Seitenmedien.
const FALLBACK_GALLERY = [
  'DSC00131', 'DSC00132', 'DSC00138', 'DSC00145', 'DSC00231',
  'DSC00236', 'DSC00237', 'DSC00238', 'DSC00239', 'DSC00249',
  'DSC00251', 'DSC00255', 'gruppenevents20', 'gruppenevents22', 'gruppenevents24',
  'itemimg-grundkurs',
].map((f) => `/images/grundkurs/${f}.jpg`);

export const LSchein = () => {
  const { openGallery } = useLightbox();
  // Admin-managed gallery (falls back to FALLBACK_GALLERY above) - see
  // frontend/src/hooks/usePageGallery.ts
  const galleryImages = usePageGallery('l-schein', FALLBACK_GALLERY);
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
              L-Schein
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
                src="https://www.youtube.com/embed/fEQXD2JxcBU?rel=0"
                title="Gleitschirm Grundkurs - Einblick in unsere Schulung | Flugschule Hirondelle"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Du legst den Grundstein...</h3>
                <p>
                  Aufbauend auf den <Link to="/ausbildung/schnupperkurs" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Schnupperkurs</Link> werden im Grundkurs die fehlenden Flüge zur Erlangung des L-Scheins absolviert. Ziel des Kurses ist es, mindestens 15 Flüge am Hang oder an der <Link to="/ausbildung/winde" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Winde</Link> zu absolvieren, bei denen die Höhendifferenz schon bis zu 200 Meter betragen kann. Kurvenflug und Schirmkontrolle sind einige der Lerninhalte, die in diesem Kurs auf dem Lehrplan stehen. In der Ausbildung erlernst du das Grundwissen in Theorie und Praxis. Mit dem erlangten Lernausweis könnt ihr dann später an den Übungshängen, an denen ihr im Grundkurs mindestens 5 Flüge absolviert habt, auch selbständig fliegen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Was dich beim Grundkurs erwartet...</h3>
                <p>
                  Steigst du direkt mit dem Grundkurs ein (ohne vorherigen <Link to="/ausbildung/schnupperkurs" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Schnupperkurs</Link>), beginnen wir zunächst mit Aufzieh- und Laufübungen im flachen Gelände und arbeiten uns dann immer weiter den Hang hinauf. Bei den 15 für den Grundkurs benötigten Flügen verfeinern wir Start, Flug-, Steuer- und Landetechnik mit Hilfe ständiger Funkbetreuung. Außerdem werden die theoretischen Lerninhalte des <Link to="/ausbildung/schnupperkurs" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Schnupperkurses</Link> vertieft und ergänzt. Das Wechselspiel zwischen kurzen theoretischen Erklärungen und der direkten praktischen Umsetzung am Übungshang lassen eure Flugtechnik schnell Fortschritte machen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Alles nach Plan...</h3>
                <p>
                  Bei den Flügen werden die Lerninhalte aus dem Lehrplan abgearbeitet und falls erforderlich für die Fluggelände ergänzt. Der Lehrplan wird den Flugschulen vom <a href="https://www.dhv.de/" target="_blank" rel="noopener noreferrer" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Deutschen Hängegleiterverband (DHV)</a> vorgegeben und ist für die Gleitschirmausbildung verpflichtend. Da jeder Schüler das Gelernte unterschiedlich schnell umsetzt, kann jeder seine Flüge innerhalb des Kurses in eigenem Tempo absolvieren. Das heißt, ihr kommt so oft dazu, bis ihr die 15 Flüge voll habt. Im Kurspreis sind 2-4 Tage inkludiert, weitere notwendige Tage können gegen einen geringen Aufpreis dazu gebucht werden. Uns ist wichtig, dass euch die Gleitschirmschulung Spaß macht und sie fundiert und sicher abläuft. Habt ihr vorher einen <Link to="/ausbildung/schnupperkurs" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Schnupperkurs</Link> absolviert, so werden die absolvierten Tage sowie der anteilige Kurspreis beim Grundkurs verrechnet und abgezogen (gültig innerhalb der gleichen Saison!).
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Organisatorisches...</h3>
                <p>
                  Ort und Uhrzeit der Kurstermine erfahrt ihr am Vortag bis ca. 15 Uhr per Newsletter. Die Termine finden flexibel an Wochenenden wie auch unter der Woche statt. Je nach Wetterlage (und vor allem Windrichtung) schulen wir an einem unserer Übungshänge im Odenwald, Kraichtal, Nahetal und der Pfalz. Die Wegbeschreibungen zu den jeweiligen <Link to="/infos/gelaende" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Fluggeländen findet ihr hier</Link>. Das Skript zum Kurs und eine aktuelle Leihausrüstung sind wie beim <Link to="/ausbildung/schnupperkurs" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Schnupperkurs</Link> im Preis inbegriffen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Wie geht es weiter...</h3>
                <p>
                  Weiter geht's mit dem <Link to="/ausbildung/a-schein" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">A-Schein</Link> – dem Höhenflugausweis zum selbständigen Fliegen!
                </p>
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-5 space-y-12">
            
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
                    *Kursgebühren mit bei uns gekaufter Ausrüstung / Leihausrüstung siehe <Link to="/ausbildung/a-schein#zusatzkosten" className="text-[#428bca] hover:text-[#2a6496] hover:underline font-bold">Zusatzkosten</Link> A-Schein
                  </p>
                </div>
              </div>

              <Link 
                to="/events?category=Grundkurs" 
                className="w-full block bg-[#526a75] hover:bg-luxury-gold text-white text-center py-4 text-sm font-semibold uppercase tracking-widest transition-colors"
              >
                Termine &gt; Siehe Liste
              </Link>
            </div>

            <GutscheinBox
              heading="Grundkurs Verschenken"
              description="Der Grundkurs ist auch als Geschenk-Gutschein möglich"
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
