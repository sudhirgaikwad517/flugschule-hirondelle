import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Search } from 'lucide-react';
import { useLightbox } from '../components/common/Lightbox';
import { GutscheinBox } from '../components/common/GutscheinBox';

// Old site's actual "Simple Image Gallery" filenames for this page
// (/images/bilder/1-rettungsgeraete/*), in their real order.
const GALLERY_FILES = [
  'platzhalterbild_rettungsgertetraining', 'rettung_2', 'rettung_3', 'rettung_4', 'rettungstraining1',
  'rettungstraining10', 'rettungstraining11', 'rettungstraining12', 'rettungstraining13', 'rettungstraining14',
  'rettungstraining15', 'rettungstraining17', 'rettungstraining19', 'rettungstraining2', 'rettungstraining20',
  'rettungstraining21', 'rettungstraining22', 'rettungstraining3', 'rettungstraining4', 'rettungstraining5',
  'rettungstraining6', 'rettungstraining7', 'rettungstraining8', 'rettungstraining9',
];

export const Rettungsgeraetetraining = () => {
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
              PERFORMANCE
            </p>
            <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
              Rettungsgerätetraining
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
                src="https://www.youtube-nocookie.com/embed/8KKXgu00pUw?rel=0"
                title="Rettungsgeräte packen & werfen (Seminar) - Paragliding lernen | Flugschule Hirondelle"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Sicher in allen Situationen...</h3>
                <p>
                  Gleitschirmfliegen ist eigentlich eine sehr sichere Sache – aber dennoch kann es vorkommen, dass ihr in eine Situation geratet, die für euch als Pilot unbeherrschbar ist. Ein Muss für jeden Gleitschirm- und Drachenpiloten ist daher ein Rettungsgerätewurftraining mit der eigenen Ausrüstung. Ebenso ist das Training für die B-Scheinausbildung gemäß Prüfungsordnung vorgeschrieben.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Drei Schritte für mehr Sicherheit</h3>
                <p className="mb-4">
                  Das Rettungsgerätetraining gliedert sich in drei Teile. Im ersten Teil wird in der Theorie erklärt, in welchen Situationen das Rettungsgerät zum Einsatz kommen soll. Dies können z.B. unkontrollierte Flugzustände, Materialversagen oder Kollisionen mit anderen Luftfahrzeugen sein. Ebenso wird der eigentliche Rettungsgerätewurf und die entsprechenden Varianten näher erläutert. Die Theorie wird mit einem kurzen Lehrfilm vom DHV abgerundet.
                </p>
                <p className="mb-4">
                  Im zweiten Teil wird anschließend das Rettungsgerät so mit einer Wurfhilfe vorbereitet, dass die Rettung beim Wurftraining nicht ganz öffnet. Dabei dokumentieren wir, wie das Rettungsgerät im Außencontainer eingebaut ist. Jeder Pilot erhält dazu sein eigenes Packset mit den entsprechenden Materialien, wie Leinenkamm, Sandsäcke, Packklammern, Packschnur usw. Jetzt wird das Rettungsgerät zweimal mit der Wurfhilfe ausgelöst. Sollten jetzt bei der Auslösung Probleme auftreten, können diese gut erkannt und abgestellt werden. Ein anderer Einbau wird in diesem Fall neu dokumentiert. Auslöseprobleme können unter anderem sein, wenn das Rettungsgerät falsch in das Gurtzeug eingebaut wurde oder zuerst der Zug vom Griff auf die Verbindungsleine zum Rettungsgerät kommt und nicht auf die Splintleine. Vor der dritten Auslösung wird die Wurfhilfe entfernt, so dass sich das Rettungsgerät dann frei entfalten kann.
                </p>
                <p className="mb-4">
                  Zu guter Letzt wird das Rettungsgerät schrittweise wieder in den Innencontainer eingepackt. Bei jedem Teilnehmer wird jeder Arbeitsvorgang sorgfältig kontrolliert. Ist der Rettungsschirm frisch gepackt im Innencontainer, wird dieser noch in das Gurtzeug eingebaut.
                </p>
                <p>
                  Das Training findet in einer Sporthalle statt und dauert vier bis sechs Stunden. Wir bieten die Trainings meist über die Wintermonate an – so kann die Schlechtwetterphase aktiv sinnvoll genutzt werden und ihr startet Jahr für Jahr wieder gut gerüstet in die neue Saison! Dieses Seminar ist auch als Geschenk-Gutschein möglich.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Booking Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <div className="bg-[#53a8c7] text-white text-center py-2 mb-6 font-semibold text-sm">
                Rettungsgerätetraining
              </div>

              <Link 
                to="/events?category=Rettungsger%C3%A4tetraining"
                className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-8 shadow-md"
              >
                Kurs buchen
              </Link>

              <div className="space-y-6 mb-8">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center gap-4">
                    <p className="text-gray-600 font-light text-sm">Kurspreis</p>
                    <p className="font-medium text-luxury-dark whitespace-nowrap">85,- €</p>
                  </div>
                </div>
              </div>

              <Link 
                to="/events?category=Rettungsger%C3%A4tetraining" 
                className="w-full block bg-[#526a75] hover:bg-luxury-gold text-white text-center py-4 text-sm font-semibold uppercase tracking-widest transition-colors"
              >
                Termine &gt; Siehe Liste
              </Link>
            </div>

            <GutscheinBox
              heading="Kurs Verschenken"
              description="Dieses Seminar ist auch als Geschenk-Gutschein möglich"
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
                       GALLERY_FILES.map((f) => ({ src: `/images/rettungsgeraete/${f}.jpg`, alt: 'Impression' })),
                       index
                     )}
                   >
                     <img
                       src={`/images/rettungsgeraete/${file}.jpg`}
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
      </section>

      {/* Full Width Bottom Section (Leistungen & Checkliste) */}
      <section className="py-16 bg-[#FAF9F7] px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div>
            <h3 className="font-luxury text-3xl text-luxury-dark mb-6 uppercase tracking-wider border-b border-luxury-gold/30 pb-4 text-left">Unsere Leistungen</h3>
            <ul className="space-y-4 mt-8">
              {[
                'Fachkundige Betreuung durch unsere Fluglehrer',
                'Einweisung ins Packen deiner Rettung',
                'Kompatibilitätsprüfung deiner Ausrüstung'
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start text-gray-600 font-light text-lg">
                  <Check className="w-6 h-6 text-luxury-gold shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-luxury text-3xl text-luxury-dark mb-6 uppercase tracking-wider border-b border-luxury-gold/30 pb-4 text-left">Deine Checkliste</h3>
            <ul className="space-y-4 mt-8">
              {[
                'Lust zu lernen, wie man seinen Rettungsschirm packt und wirft',
                'Mitbringen deiner Flugausrüstung (vor allem: Gurtzeug mit Rettung, Helm, ggf. Handschuhe)',
                'Verpflegung',
                'Wichtig, da die Trainings in der Turnhalle stattfinden: saubere Turnschuhe'
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start text-gray-600 font-light text-lg">
                  <span className="w-2 h-2 rounded-full bg-luxury-gold shrink-0 mt-2.5"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
};
