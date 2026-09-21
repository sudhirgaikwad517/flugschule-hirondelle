import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Banner } from '../components/common/Banner';

// Fallbacks match the page's current live copy exactly, so nothing changes
// visually until an admin edits something in Admin > Seiten > Performance
// (see backend SitePageContent model / sitePageContent.routes.ts). Text,
// images, and the "WEITERLESEN" links are all admin-editable; only the
// layout/CSS stays fixed.
const DEFAULT_CONTENT = {
  introQuote: 'Als SkyPerformance Trainer bieten wir ein umfangreiches Fortbildungsangebot unter der Leitung speziell ausgebildeter Fluglehrer.',
  badges: [
    { label: 'Streckenflugtraining' },
    { label: 'Soaringtraining' },
    { label: 'Sicherheitstraining' },
    { label: 'Rettungsgerätetraining' },
    { label: 'Thermik- und Flugtechniktraining' },
    { label: 'Groundhandlingtraining' },
  ],
  categories: [
    { heading: 'Sicherheitstraining - Gardasee', subheading: 'Sicherheitstraining am Gardasee...', description: 'Fünf Tage für deine Sicherheit, für die Verbesserung von richtigen Reaktionen und deinem fliegerischem Können. Am Südrand der italienischen Alpen liegt der wunderschöne Gardasee, den wir als Ausgangspunkt unseres Sicherheitstrainings genießen dürfen.', image: '/images/performance/sicherheitstraining.jpg', link: '/performance/sicherheitstraining' },
    { heading: 'Rettungsgerätetraining', subheading: 'Ein Muss für jeden Gleitschirmpiloten...', description: 'Gleitschirmfliegen ist eigentlich eine sehr sichere Sache aber dennoch kann es vorkommen, dass ihr in eine Situation geratet, die für euch als Pilot unbeherrschbar ist. Ein Muss für jeden Gleitschirm- und Drachenpiloten ist daher ein Rettungsgerätewurftraining mit der eigenen Ausrüstung.', image: '/images/performance/rettungsgeraetetraining.jpg', link: '/performance/rettungsgeraetetraining' },
    { heading: 'Refresherkurs', subheading: 'Sicher in allen Situationen...', description: 'Der Refresher-Kurs richtet sich an alle Piloten, die bereits ihre Ausbildung abgeschlossen haben. Wer unseren schönen Sport einmal gelernt hat und aus welchen Gründen auch immer länger nicht mehr geflogen ist.', image: '/images/performance/refresher.jpg', link: '/performance/refresher' },
    { heading: 'Groundhandling Kurs', subheading: 'Auf Tuchfühlung mit dem Gleitschirm...', description: 'Den Gleitschirm kennen lernen und als riesigen Lenkdrachen benutzen, Windsprünge meistern, den Hang kreuzen oder mit geöffnetem Segel bergauf laufen – das sind die Lernziele im diesem Seminar. Groundhandling ist das A & O für jeden Piloten, um den eigenen Schirm sicher zu steuern.', image: '/images/performance/groundhandling.jpg', link: '/performance/groundhandling' },
  ],
};

export const Performance = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'performance'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Performance content:', err));
  }, [contentId]);

  const [p0, p1, p2, p3] = content.categories;
  const badgeColors = ['#E58E26', '#80C533', '#D24F25', '#59ABDE', '#34963B', '#3274B7'];
  return (
    <div className="w-full bg-white">
      <Banner />

      <div className="container mx-auto px-4 py-12 max-w-[1200px]">
        
        {/* Main Title */}
        <div className="text-center mb-16 mt-8">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide">
            PERFORMANCE TRAINING
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto mb-8"></div>
        </div>

        {/* Intro Section */}
        <div className="flex flex-col lg:flex-row gap-12 mb-24 items-center">
          <div className="w-full lg:w-1/2">
            <p className="text-xl md:text-2xl text-luxury-heading italic font-luxury mb-6 leading-relaxed text-center lg:text-left">
              "{content.introQuote}"
            </p>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-2 gap-2 w-full">
              {content.badges.map((badge, i) => (
                <div key={i} style={{ backgroundColor: badgeColors[i] }} className="text-white text-center py-4 px-3 text-[11px] sm:text-xs font-semibold cursor-pointer hover:opacity-90 rounded-sm shadow-sm transition-opacity uppercase tracking-wider">{badge.label}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="flex flex-col gap-24 mt-24">
          
          {/* Sicherheitstraining (Image Right) */}
          <div id="sicherheit" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{p0.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-heading font-luxury mb-6">{p0.subheading}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                {p0.description}
              </p>
              <Link to={p0.link} className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={p0.image} alt="Sicherheitstraining Gardasee" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Rettungsgerätetraining (Image Left) */}
          <div id="rettung" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{p1.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-heading font-luxury mb-6">{p1.subheading}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                {p1.description}
              </p>
              <Link to={p1.link} className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={p1.image} alt="Rettungsgerätetraining" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Refresherkurs (Image Right) */}
          <div id="refresher" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{p2.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-heading font-luxury mb-6">{p2.subheading}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                {p2.description}
              </p>
              <Link to={p2.link} className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={p2.image} alt="Refresherkurs" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Groundhandling (Image Left) */}
          <div id="groundhandling" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">{p3.heading}</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-heading font-luxury mb-6">{p3.subheading}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                {p3.description}
              </p>
              <Link to={p3.link} className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src={p3.image} alt="Groundhandling Kurs" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
