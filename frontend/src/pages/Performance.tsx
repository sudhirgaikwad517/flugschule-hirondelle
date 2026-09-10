import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

export const Performance = () => {
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
            <p className="text-xl md:text-2xl text-luxury-gold italic font-luxury mb-6 leading-relaxed text-center lg:text-left">
              "Als SkyPerformance Trainer bieten wir ein umfangreiches Fortbildungsangebot unter der Leitung speziell ausgebildeter Fluglehrer."
            </p>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="bg-[#f09a37] text-white text-center py-4 px-3 text-[11px] sm:text-xs font-semibold cursor-pointer hover:opacity-90 rounded-sm shadow-sm transition-opacity uppercase tracking-wider">Streckenflugtraining</div>
              <div className="bg-[#8ec254] text-white text-center py-4 px-3 text-[11px] sm:text-xs font-semibold cursor-pointer hover:opacity-90 rounded-sm shadow-sm transition-opacity uppercase tracking-wider">Soaringtraining</div>
              <div className="bg-[#d95a28] text-white text-center py-4 px-3 text-[11px] sm:text-xs font-semibold cursor-pointer hover:opacity-90 rounded-sm shadow-sm transition-opacity uppercase tracking-wider">Sicherheitstraining</div>
              <div className="bg-[#5c9ccc] text-white text-center py-4 px-3 text-[11px] sm:text-xs font-semibold cursor-pointer hover:opacity-90 rounded-sm shadow-sm transition-opacity uppercase tracking-wider">Rettungsgerätetraining</div>
              <div className="bg-[#38a84c] text-white text-center py-4 px-3 text-[11px] sm:text-xs font-semibold cursor-pointer hover:opacity-90 rounded-sm shadow-sm transition-opacity uppercase tracking-wider">Thermik- und Flugtechniktraining</div>
              <div className="bg-[#2978b5] text-white text-center py-4 px-3 text-[11px] sm:text-xs font-semibold cursor-pointer hover:opacity-90 rounded-sm shadow-sm transition-opacity uppercase tracking-wider">Groundhandlingtraining</div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="flex flex-col gap-24 mt-24">
          
          {/* Sicherheitstraining (Image Right) */}
          <div id="sicherheit" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Sicherheitstraining - Gardasee</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Sicherheitstraining am Gardasee...</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Fünf Tage für deine Sicherheit, für die Verbesserung von richtigen Reaktionen und deinem fliegerischem Können. Am Südrand der italienischen Alpen liegt der wunderschöne Gardasee, den wir als Ausgangspunkt unseres Sicherheitstrainings genießen dürfen.
              </p>
              <Link to="/performance/sicherheitstraining" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/performance/sicherheitstraining.jpg" alt="Sicherheitstraining Gardasee" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Rettungsgerätetraining (Image Left) */}
          <div id="rettung" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Rettungsgerätetraining</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Ein Muss für jeden Gleitschirmpiloten...</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Gleitschirmfliegen ist eigentlich eine sehr sichere Sache aber dennoch kann es vorkommen, dass ihr in eine Situation geratet, die für euch als Pilot unbeherrschbar ist. Ein Muss für jeden Gleitschirm- und Drachenpiloten ist daher ein Rettungsgerätewurftraining mit der eigenen Ausrüstung.
              </p>
              <Link to="/performance/rettungsgeraetetraining" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/performance/rettungsgeraetetraining.jpg" alt="Rettungsgerätetraining" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Refresherkurs (Image Right) */}
          <div id="refresher" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Refresherkurs</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Sicher in allen Situationen...</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Der Refresher-Kurs richtet sich an alle Piloten, die bereits ihre Ausbildung abgeschlossen haben. Wer unseren schönen Sport einmal gelernt hat und aus welchen Gründen auch immer länger nicht mehr geflogen ist.
              </p>
              <Link to="/performance/refresher" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/performance/refresher.jpg" alt="Refresherkurs" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Groundhandling (Image Left) */}
          <div id="groundhandling" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Groundhandling Kurs</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Auf Tuchfühlung mit dem Gleitschirm...</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Den Gleitschirm kennen lernen und als riesigen Lenkdrachen benutzen, Windsprünge meistern, den Hang kreuzen oder mit geöffnetem Segel bergauf laufen – das sind die Lernziele im diesem Seminar. Groundhandling ist das A & O für jeden Piloten, um den eigenen Schirm sicher zu steuern.
              </p>
              <Link to="/performance/groundhandling" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/performance/groundhandling.jpg" alt="Groundhandling Kurs" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
