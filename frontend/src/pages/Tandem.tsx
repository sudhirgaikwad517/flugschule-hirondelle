import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Banner } from '../components/common/Banner';
import { useLightbox } from '../components/common/Lightbox';
import { SafeHtml } from '../components/common/SafeHtml';

// Old site's actual "Simple Image Gallery" filenames for this page
// (/images/bilder/1-passagier/*), in their real order. Not admin-editable -
// same as most other fixed pages' decorative image galleries.
const GALLERY_FILES = [
  '1PLatzhalterbildTandem.png', 'bild.jpg', 'tandem1.jpg', 'tandem2.jpg', 'tandem3.jpg',
];

interface Pilot { name: string; img: string }

interface TandemData {
  heading: string;
  videoUrl: string;
  quote: string;
  introHtml: string;
  priceLabel: string;
  priceNote: string;
  price: string;
  warningText: string;
  terminHeading: string;
  terminHtml: string;
  pilots: Pilot[];
  services: string[];
  requirements: string[];
}

const DEFAULT_CONTENT: TandemData = {
  heading: 'EIN TANDEMFLUG MIT DEM GLEITSCHIRM?',
  videoUrl: 'https://www.youtube-nocookie.com/embed/o1MzMmYM_ls?rel=0',
  quote: 'Der erste Schritt, um sicher in die Luft zu kommen!',
  introHtml:
    '<p>Ein ganz besonderes Erlebnis erwartet euch bei einem Tandemflug mit einem unserer Piloten hier in der Region Rhein/Main/Neckar, Odenwald oder Pfalz.</p>' +
    '<p>Da wir fürs Tandemfliegen spezielle Wind- und Wetterbedingungen brauchen und nur ganz bestimmte Gelände hier in der Region dafür nutzen können, kann es schon mal sein, dass man etwas auf einen passenden Termin warten muss. Aber es lohnt sich - versprochen :-)</p>' +
    '<p>Wir fliegen im Moment mainly in Heidelberg, Schriesheim und in Erlau (Odenwald). Ab und zu auch in der Pfalz bei Annweiler, an der Madenburg oder auch an der Winde bei Speyer bzw. in Offenbach bei Landau.</p>' +
    '<p>Je nach Wetterbedingungen und welcher unserer Piloten gerade Zeit hat, wählen wir den Flugort aus - das ist leider nicht wählbar. Die Termine sind ganzwöchig von Montag bis Sonntag und auch ganzjährig, also nicht nur im Sommer. Im Winter sind auch ab und an schöne Flüge möglich. Einziges Manko - man muss sich etwas dicker anziehen...</p>' +
    '<p>Da wir mit der Flugschule sehr oft im Ausland unterwegs sind und die Tandemflüge oft von unterwegs abwickeln, haben wir ein spezielles System für die Abwicklung der Termine.</p>',
  priceLabel: 'Tandemflug',
  priceNote: 'Barzahlung vor Ort',
  price: '150,- €',
  warningText: 'Wir verkaufen keine Gutscheine für Tandemflüge - es können nur bereits erworbene Gutscheine eingelöst werden. Wer ohne Gutschein mitfliegen will, einfach unten in den Tandemnewsletter eintragen und dann beim Termin bar zahlen.',
  terminHeading: "TERMIN VEREINBAREN - SO FUNKTIONIERT'S...",
  terminHtml:
    '<p>Gleitschirmfliegen ist wetterabhängig. Wir brauchen Wind in richtiger Stärke und aus der geeigneten Richtung. Weil es selbst den besten Wetterfröschen kaum möglich ist, das Wetter auf längere Sicht abzuschätzen, bieten wir euch ein eigenes System zur Terminvereinbarung an, um die vereinbarten Tandemflüge sicher durchzuführen.</p>' +
    '<p>Wir haben daher zur Terminvereinbarung einen Tandem-Newsletter auf unserer Homepage unten eingerichtet. In diesen Tandemnewsletter (wichtig - nicht in den allgemeinen Newsletter eintragen!!!) tragt ihr euch ein.</p>' +
    '<p>Wenn wir passendes Wetter (nur Sonne reicht nicht) zum Tandemfliegen sehen und auch Zeit haben, die Flüge durchzuführen, schicken wir eine E-Mail an alle, die sich im Tandemnewsletter angemeldet haben. An so einem Termin bieten wir in der Regel zwischen 3-5 Flüge pro Tag an. Wenn ihr zu diesem Termin Lust und Zeit habt, meldet ihr euch schnellstmöglich mit den in unserer Mail gefragten Details zurück und bekommt dann von uns nochmal Rückantwort via E-Mail mit dem genauen Treffpunkt und der Uhrzeit. Ganz wichtig: es bekommen nur die Schnellsten eine Rückantwort die auch den Zuschlag für den Flug bekommen.</p>' +
    '<p>Falls ihr jemanden mit einem Tandemflug beschenken wollt, könnt ihr gerne selbst einen Gutschein basteln und diesen verschenken. Bezahlt wird allerdings bar vor Ort beim Tandempiloten. Wir haben in der Vergangenheit oft Gutscheine ausgestellt, die die Beschenkten dann mitunter nicht einlösen konnten, da deren Freizeit nicht zu unseren Terminen gepasst haben.</p>' +
    '<p>Wir haben über die Jahre schon viel ausprobiert wie wir die Abwicklung organisieren können und dies ist der beste und einzige Weg. Da es für uns nur wie oben beschrieben funktioniert, vereinbaren wir auch keine Wunschtermine und vergeben auch auf telefonische Nachfrage keine Tandemtermine.</p>' +
    '<p>Falls jemand noch schneller in die Luft möchte können wir euch alternativ unseren <a href="/ausbildung/schnupperkurs" class="text-[#428bca] hover:text-[#2a6496] hover:underline font-semibold">Schnupperkurs</a> wärmstens empfehlen.</p>',
  pilots: [
    { name: 'Alex', img: '/images/team/schlink.jpg' },
    { name: 'Markus', img: '/images/team/markus.jpg' },
    { name: 'Karl-Peter', img: '/images/team/karlpeter.jpg' },
    { name: 'Tobi', img: '/images/team/tobi.jpg' },
  ],
  services: [
    'Tandemflug hier in der Region (kurze Anfahrtswege)',
    'Erfahrene Tandempiloten',
    'Aktuelle Tandemausrüstung',
  ],
  requirements: [
    'Passagiere ab 50 kg bis 100 kg',
    'Keine Altersbeschränkung aber gut zu Fuß - man muss 10-20 m rennen können ;-)!',
  ],
};

export const Tandem = ({ contentId }: { contentId?: string } = {}) => {
  const { openGallery } = useLightbox();
  const [content, setContent] = useState<TandemData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'tandem'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Tandem content:', err));
  }, [contentId]);

  return (
    <div className="w-full bg-white pb-20">
      <Banner />

      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        {/* Main Title */}
        <div className="text-center mb-16 mt-8">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide break-words hyphens-auto uppercase">
            {content.heading}
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto mb-8"></div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          {/* Left Column (Video & Text) */}
          <div className="w-full lg:w-3/5">
            {/* Video - old site just embeds the iframe directly, no
                click-to-play preview thumbnail, so this doesn't either. */}
            <div className="w-full aspect-video overflow-hidden rounded-sm shadow-xl mb-12">
              <iframe
                className="w-full h-full"
                src={content.videoUrl}
                title="Tandemflug in der Pfalz - Flugschule Hirondelle"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <h3 className="text-xl md:text-2xl italic text-luxury-heading font-luxury mb-6 leading-relaxed max-w-4xl">
              "{content.quote}"
            </h3>

            <div className="space-y-6 text-[15px] font-light text-gray-500 leading-relaxed text-justify">
              <SafeHtml html={content.introHtml} />
            </div>
          </div>

          {/* Right Column (Pricing & Impressions) */}
          <div className="w-full lg:w-2/5">
            {/* Pricing & Info Card - same card treatment as the booking
                boxes on Ausbildung/Performance pages (e.g.
                Sicherheitstraining.tsx): soft card background, hover
                accent bar, bold price row, full-bleed footer bar. Tandem
                has no bookable event to link to (payment is cash on site,
                arranged via the Tandem-Newsletter described below), so the
                footer bar carries the "Achtung" notice instead of a
                "Termin siehe Kalender" link. */}
            <div className="mb-12 bg-[#FAF9F7] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>

              <div className="p-8">
                <div className="bg-[#53a8c7] text-white text-center py-3 uppercase tracking-widest font-semibold text-[13px] mb-8 shadow-md">
                  Tandemflüge
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-gray-600 font-light text-[13px]">
                      <p className="font-bold text-luxury-dark mb-1">{content.priceLabel}</p>
                      <p>{content.priceNote}</p>
                    </div>
                    <p className="font-bold text-luxury-dark text-lg whitespace-nowrap mt-0.5">{content.price}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-t border-red-100 px-8 py-6">
                <p className="text-red-800 text-[13px] leading-relaxed font-light">
                  <span className="font-bold uppercase tracking-widest block mb-1">Achtung:</span>
                  {content.warningText}
                </p>
              </div>
            </div>

            {/* Impressions */}
            <div className="mb-8">
              <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wide">IMPRESSIONEN</h3>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>

              <div className="grid grid-cols-3 gap-2">
                {GALLERY_FILES.map((file, index) => (
                  <div
                    key={file}
                    className="relative aspect-square overflow-hidden group cursor-zoom-in bg-gray-100"
                    onClick={() => openGallery(
                      GALLERY_FILES.map((f) => ({ src: `/images/tandem-page/${f}`, alt: 'Impression' })),
                      index
                    )}
                  >
                    <img
                      src={`/images/tandem-page/${file}`}
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

        {/* Bottom Section */}
        <div className="mt-20">
          <h2 className="font-luxury text-3xl text-luxury-dark mb-4 uppercase tracking-wide">{content.terminHeading}</h2>
          <div className="w-12 h-px bg-luxury-gold mb-8"></div>

          <div className="space-y-6 text-[15px] font-light text-gray-500 leading-relaxed mb-10 max-w-4xl text-justify">
            <SafeHtml html={content.terminHtml} />
          </div>

          {/* No standalone "Tandem-Newsletter" signup box here - old's real
              site has one in its markup (a locked-to-Tandem-list legacy
              acymailing module), but it's dead: custom.css hides
              `.acymailing_module` with an unconditional `display:None`, so
              it never actually renders on the live site. The body text
              above ("...auf unserer Homepage unten eingerichtet") is
              itself pointing at the one signup widget that IS real and
              visible - the site-wide footer's Newsletter/Tandemflüge
              Newsletter checkboxes (Footer.tsx), already wired to the same
              TANDEM list. */}
        </div>

        {/* Pilots */}
        <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wide">UNSERE TANDEMPILOTEN</h3>
        <div className="w-12 h-px bg-luxury-gold mb-10"></div>

        <div className="flex flex-wrap gap-12 md:gap-16 mb-20">
          {content.pilots.map((pilot) => (
            <div key={pilot.name} className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-[4px] border-white shadow-lg group-hover:border-luxury-gold transition-colors duration-500 relative">
                <img src={pilot.img} alt={pilot.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <span className="font-luxury text-xl text-luxury-dark">{pilot.name}</span>
            </div>
          ))}
        </div>

        {/* Services & Prerequisites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
          <div>
            <h2 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wide">UNSERE LEISTUNGEN</h2>
            <div className="w-12 h-px bg-luxury-gold mb-6"></div>
            <ul className="list-disc list-outside ml-5 space-y-3 text-[15px] font-light text-gray-500">
              {content.services.map((service, i) => <li key={i}>{service}</li>)}
            </ul>
          </div>

          <div>
            <h2 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wide">VORAUSSETZUNG</h2>
            <div className="w-12 h-px bg-luxury-gold mb-6"></div>
            <ul className="list-disc list-outside ml-5 space-y-3 text-[15px] font-light text-gray-500">
              {content.requirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
