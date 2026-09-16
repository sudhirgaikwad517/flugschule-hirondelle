import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Search } from 'lucide-react';
import { useLightbox } from '../components/common/Lightbox';
import { GutscheinBox } from '../components/common/GutscheinBox';

// Old site's actual "Simple Image Gallery" filenames for this page
// (/images/bilder/1-groundhandling/*), in their real order.
const GALLERY_FILES = [
  '1Groundhandling_Platzhalter.jpg', 'DSC00352.jpg', 'DSC00438.jpg', 'DSC00439.jpg', 'DSC00440.jpg',
  'DSC00451.jpg', 'DSC00455.jpg', 'DSC00456.jpg', 'DSC00473.jpg', 'DSC00510.jpg',
  'DSC00511.jpg', 'DSC00525.jpg', 'DSC00531.jpg', 'groundhandling2.png', 'groundhandling4.png',
  'IMG_6154.jpg',
];

export const Groundhandling = () => {
  const { openGallery } = useLightbox();
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
              <p className="text-luxury-heading uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                PERFORMANCE
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Groundhandling Kurs
              </h1>
            </div>

            {/* Video - old site just embeds the iframe directly, no click-to-play
                preview thumbnail, so this doesn't either. */}
            <div className="w-full h-[400px] overflow-hidden rounded-sm shadow-sm">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/qh9ORewDogc?rel=0"
                title="Groundhandling & Rückwärts aufziehen - So geht's! | Flugschule Hirondelle"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
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
              
              <div className="bg-[#3274B7] text-white text-center py-2 mb-6 font-semibold text-sm">
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
                to="/events?category=Groundhandlingkurs" 
                className="w-full block bg-[#526a75] hover:bg-luxury-gold text-white text-center py-4 px-2 text-xs font-semibold transition-colors shadow-md leading-relaxed"
              >
                Termine werden über den Newsletter bekannt gegeben –<br/>meldet euch am Newsletter an
              </Link>
            </div>

            <GutscheinBox
              heading="Kurs Verschenken"
              description="Du suchst ein außergewöhnliches Geschenk? Warum nicht einmal einen Gutschein für einen Groundhandling-Kurs verschenken!"
            />

            {/* Impressions Gallery */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-6 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Impressionen
               </h3>
               <div className="grid grid-cols-3 gap-2">
                 {GALLERY_FILES.map((file, index) => (
                   <div
                     key={file}
                     className="relative aspect-square overflow-hidden group cursor-zoom-in bg-gray-100"
                     onClick={() => openGallery(
                       GALLERY_FILES.map((f) => ({ src: `/images/groundhandling/${f}`, alt: 'Impression' })),
                       index
                     )}
                   >
                     <img
                       src={`/images/groundhandling/${file}`}
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
      </section>

    </div>
  );
};
