import { Banner } from '../components/common/Banner';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SafeHtml } from '../components/common/SafeHtml';

// Fallbacks match the page's current live copy exactly, so nothing changes
// visually until an admin edits something in Admin > Seiten > Reisen (see
// backend SitePageContent model / sitePageContent.routes.ts). Text, images,
// and the "WEITERLESEN" links are all admin-editable; only the layout/CSS
// stays fixed. The "KOMMENTAR" link/count next to each tour is left
// hardcoded - it's tied to that tour's real comment count, not admin copy.
const DEFAULT_CONTENT = {
  introQuote: 'Die Hotspots der Fliegerszene erkunden mit Flugbetreuung.',
  introHtml: 'Unsere <a href="/reisen">Reisen</a> führen uns in die bekannten Fluggebiet-Hotspots. So zählt <a href="/reisen/bassano-tour">Bassano</a> – das Mekka der Gleitschirmszene – jährlich fest zum Programm. Aber auch entlegene Ziele wollen wir euch nicht vorenthalten und bieten euch Reisen nach <a href="/reisen/suedafrika-tour">Südafrika</a> und weiteren besonderen Zielen weltweit an. Im Rahmen unserer <a href="/reisen">Reisen</a> könnt ihr unter Fluglehrerbetreuung sehr viel Erfahrung sammeln, eure Flugtechnik verbessern und zahlreiche großartige Flugstunden genießen.',
  calendarButtonLink: '/buchungskalender',
  tours: [
    { heading: 'Brasilien-Tour', description: 'Fliegen in Rio de Janeiro – Uma cidade maravilhosa (eine wunderbare Stadt). Bei unserer Rundreise in Brasilien wollen wir neben den Startplätzen in und um Rio auch einige Startplätze im Landesinneren kennen lernen, wir machen außerdem an den bekannten PWC-Geländen Halt. Die Landschaften sind atemberaubend.', image: '/images/reisen/brasilien.jpg', link: '/reisen/brasilien-tour' },
    { heading: 'Kolumbien-Tour', description: 'Wir fliegen über den grünen Landschaften des Valle del Cauca. Dabei genießen wir die großartige Gastfreundschaft der Kolumbianer und befliegen über mehrere Stationen die besten Fluggebiete von Cali Richtung Medellin. Die sanfte Thermik und das breite Tal mit zahllosen Landemöglichkeiten laden zu gemeinsamen Thermik- und Streckenflügen ein.', image: '/images/reisen/kolumbien.jpg', link: '/reisen/kolumbien-tour' },
    { heading: 'Südafrika-Tour', description: 'Auf der Südhalbkugel, im Land der unerschöpflichen fliegerischen Möglichkeiten, können wir beste thermische Flugbedingungen unbegrenzt gemeinsam genießen und uns zudem an hochsommerlichen Temperaturen erfreuen. Einerseits erwarten uns phantastische Flüge in den attraktivsten Soaring-, Thermik- und Streckenfluggebieten in Wilderness, Hermanus, Porterville und Kapstadt.', image: '/images/reisen/suedafrika.jpg', link: '/reisen/suedafrika-tour' },
    { heading: 'Bassano-Tour', description: 'Bassano ist das unbestrittene Mekka der Gleitschirm- und Drachenszene in den Südalpen. Besonders im Winter und zeitigen Frühjahr trifft sich hier die Szene. Die Thermik ist ganzjährig interessant und kann schon früh im Jahr für Streckenflüge in Bella Italia genutzt werden. Von wunderschönen, stundenlangen Thermikflügen am Monte Grappa mit herrlichem Blick auf die Poebene bis zu schönen Streckenflügen ist in Bassano alles möglich.', image: '/images/reisen/bassano.jpg', link: '/reisen/bassano-tour' },
    { heading: 'Slowenien-Tour', description: 'Thermik und Streckenfliegen in Slowenien in den julischen Alpen heißt fliegen entlang der türkisblauen Soča in der Nähe von Kobarid und Tolmin.', image: '/images/reisen/slowenien.jpg', link: '/reisen/slowenien-tour' },
    { heading: 'Griechenland-Tour', description: 'Die Flugsafari ist eine tolle Kombination von Thermik- und Streckenfliegen im Pindosgebirge sowie dem Küstensoaren auf der Insel Lefkada an der Westküste Griechenlands..', image: '/images/reisen/griechenland.jpg', link: '/reisen/griechenland-tour' },
    { heading: 'Bergamo-Tour', description: 'Wer in Italien einmal abseits der ausgetretenen Pfade fliegen möchte, ist goldrichtig in der Region rund um Bergamo, den Ausläufern der Südalpen kurz vor Mailand.', image: '/images/reisen/bergamo.jpg', link: '/reisen/bergamo-tour' },
    { heading: 'Savoyer Alpentour', description: "Eine Woche durch die Savoyer Alpen touren. Die Savoyer Alpen befinden sich grob zwischen Genf, Chamonix und Grenoble. Unser Standort ist der Campingplatz La ferme de la Serraz neben dem Lac d' Annecy in Doussard. Um den See liegen alleine schon 3 Fluggelände, die von der Hauptwindrichtung recht unabhängig und fast täglich fliegbar sind.", image: '/images/reisen/savoye.jpg', link: '/reisen/savoye-tour' },
    { heading: 'Vogesen-Tour', description: "Die Vogesen schließen sich nahtlos an das Pfälzer Bergland an und bilden ganz im Süden mit den Fluggebieten le Treh, le Drumont, Gustiberg und Ballon d'Alsace eine phantastische Flug-Arena. Sie bieten dem Einsteiger einfache Startplätze mit großzügigen Landeplätzen im Gleitwinkelbereich, dem Fortgeschrittenen die Möglichkeit für erste Streckenflüge.", image: '/images/reisen/vogesen.jpg', link: '/reisen/vogesen-tour' },
    { heading: 'Pfalz-Tour', description: 'Rund um das kleine Städtchen Annweiler in der Südpfalz liegen 7 schöne Startplätze, die allemal einen Besuch wert sind. Die Buckel der Südpfälzer haben einen Höhenunterschied von bis zu 320 m. Es werden von dort regelmäßig schöne Streckenflüge in den DHV-XC eingereicht.', image: '/images/reisen/pfalz.jpg', link: '/reisen/pfalz-tour' },
  ],
};

const COMMENT_COUNTS = [1, 0, 0, 3, 0, 0, 4, 0, 0, 6];

export const Reisen = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'reisen'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Reisen content:', err));
  }, [contentId]);

  const [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9] = content.tours;
  return (
    <div className="w-full bg-white">
      <Banner />

      <div className="container mx-auto px-4 py-12 max-w-[1200px]">
        
        {/* Main Title */}
        <div className="text-center mb-16 mt-8">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide break-words hyphens-auto">
            AUF TOUR MIT DER FLUGSCHULE HIRONDELLE
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto mb-8"></div>
        </div>

        {/* Intro Section */}
        <div className="mb-24 flex flex-col items-center text-center">
          <h3 className="text-xl md:text-2xl italic text-luxury-heading font-luxury mb-6 leading-relaxed max-w-4xl">
            "{content.introQuote}"
          </h3>
          <SafeHtml
            html={content.introHtml}
            className="text-gray-500 leading-relaxed font-light mb-10 max-w-4xl [&_a]:text-[#428bca] [&_a:hover]:text-[#2a6496] [&_a:hover]:underline [&_a]:font-bold"
          />
          <Link to={content.calendarButtonLink} className="px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
            ZUR KALENDERÜBERSICHT
          </Link>
        </div>

        {/* Tours List */}
        <div className="flex flex-col gap-24 mt-12">
          
          {/* Brasilien (Image Right) */}
          <div id="brasilien" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t0.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t0.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t0.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t0.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[0]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t0.image} alt="Brasilien Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Kolumbien (Image Left) */}
          <div id="kolumbien" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t1.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t1.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t1.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t1.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[1]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t1.image} alt="Kolumbien Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Südafrika (Image Right) */}
          <div id="suedafrika" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t2.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t2.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t2.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t2.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[2]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t2.image} alt="Südafrika Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Bassano (Image Left) */}
          <div id="bassano" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t3.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t3.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t3.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t3.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[3]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t3.image} alt="Bassano Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Slowenien (Image Right) */}
          <div id="slowenien" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t4.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t4.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t4.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t4.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[4]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t4.image} alt="Slowenien Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Griechenland (Image Left) */}
          <div id="griechenland" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t5.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t5.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t5.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t5.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[5]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t5.image} alt="Griechenland Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Bergamo (Image Right) */}
          <div id="bergamo" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t6.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t6.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t6.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t6.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[6]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t6.image} alt="Bergamo Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Savoye (Image Left) */}
          <div id="savoye" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t7.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t7.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t7.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t7.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[7]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t7.image} alt="Savoyer Alpentour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>
          
          {/* Vogesen (Image Right) */}
          <div id="vogesen" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t8.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t8.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t8.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t8.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[8]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t8.image} alt="Vogesen Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Pfalz (Image Left) */}
          <div id="pfalz" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{t9.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                {t9.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={t9.link} className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to={`${t9.link}#comments`} className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR ({COMMENT_COUNTS[9]})
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={t9.image} alt="Pfalz Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
