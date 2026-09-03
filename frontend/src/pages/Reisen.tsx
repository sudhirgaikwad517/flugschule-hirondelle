import { Banner } from '../components/common/Banner';
import { Link } from 'react-router-dom';

export const Reisen = () => {
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
          <h3 className="text-xl md:text-2xl italic text-luxury-gold font-luxury mb-6 leading-relaxed max-w-4xl">
            "Die Hotspots der Fliegerszene erkunden mit Flugbetreuung."
          </h3>
          <p className="text-gray-500 leading-relaxed font-light mb-10 max-w-4xl">
            Unsere Reisen führen uns in die bekannten Fluggebiet-Hotspots. So zählt Bassano – das Mekka der Gleitschirmszene – jährlich fest zum Programm. Aber auch entlegene Ziele wollen wir euch nicht vorenthalten und bieten euch Reisen nach Südafrika und weiteren besonderen Zielen weltweit an. Im Rahmen unserer Reisen könnt ihr unter Fluglehrerbetreuung sehr viel Erfahrung sammeln, eure Flugtechnik verbessern und zahlreiche großartige Flugstunden genießen.
          </p>
          <button className="px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
            ZUR KALENDERÜBERSICHT
          </button>
        </div>

        {/* Tours List */}
        <div className="flex flex-col gap-24 mt-12">
          
          {/* Brasilien (Image Right) */}
          <div id="brasilien" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Brasilien-Tour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Fliegen in Rio de Janeiro – Uma cidade maravilhosa (eine wunderbare Stadt). Bei unserer Rundreise in Brasilien wollen wir neben den Startplätzen in und um Rio auch einige Startplätze im Landesinneren kennen lernen, wir machen außerdem an den bekannten PWC-Geländen Halt. Die Landschaften sind atemberaubend.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/brasilien-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/brasilien-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (1)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/brasilien.jpg" alt="Brasilien Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Kolumbien (Image Left) */}
          <div id="kolumbien" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Kolumbien-Tour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Wir fliegen über den grünen Landschaften des Valle del Cauca. Dabei genießen wir die großartige Gastfreundschaft der Kolumbianer und befliegen über mehrere Stationen die besten Fluggebiete von Cali Richtung Medellin. Die sanfte Thermik und das breite Tal mit zahllosen Landemöglichkeiten laden zu gemeinsamen Thermik- und Streckenflügen ein.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/kolumbien-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/kolumbien-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (0)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/kolumbien.jpg" alt="Kolumbien Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Südafrika (Image Right) */}
          <div id="suedafrika" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Südafrika-Tour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Auf der Südhalbkugel, im Land der unerschöpflichen fliegerischen Möglichkeiten, können wir beste thermische Flugbedingungen unbegrenzt gemeinsam genießen und uns zudem an hochsommerlichen Temperaturen erfreuen. Einerseits erwarten uns phantastische Flüge in den attraktivsten Soaring-, Thermik- und Streckenfluggebieten in Wilderness, Hermanus, Porterville und Kapstadt.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/suedafrika-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/suedafrika-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (0)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/suedafrika.jpg" alt="Südafrika Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Bassano (Image Left) */}
          <div id="bassano" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Bassano-Tour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Bassano ist das unbestrittene Mekka der Gleitschirm- und Drachenszene in den Südalpen. Besonders im Winter und zeitigen Frühjahr trifft sich hier die Szene. Die Thermik ist ganzjährig interessant und kann schon früh im Jahr für Streckenflüge in Bella Italia genutzt werden. Von wunderschönen, stundenlangen Thermikflügen am Monte Grappa mit herrlichem Blick auf die Poebene bis zu schönen Streckenflügen ist in Bassano alles möglich.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/bassano-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/bassano-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (3)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/bassano.jpg" alt="Bassano Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Slowenien (Image Right) */}
          <div id="slowenien" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Slowenien-Tour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Thermik und Streckenfliegen in Slowenien in den julischen Alpen heißt fliegen entlang der türkisblauen Soča in der Nähe von Kobarid und Tolmin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/slowenien-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/slowenien-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (0)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/slowenien.jpg" alt="Slowenien Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Griechenland (Image Left) */}
          <div id="griechenland" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Griechenland-Tour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Die Flugsafari ist eine tolle Kombination von Thermik- und Streckenfliegen im Pindosgebirge sowie dem Küstensoaren auf der Insel Lefkada an der Westküste Griechenlands..
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/griechenland-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/griechenland-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (0)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/griechenland.jpg" alt="Griechenland Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Bergamo (Image Right) */}
          <div id="bergamo" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Bergamo-Tour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Wer in Italien einmal abseits der ausgetretenen Pfade fliegen möchte, ist goldrichtig in der Region rund um Bergamo, den Ausläufern der Südalpen kurz vor Mailand.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/bergamo-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/bergamo-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (4)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/bergamo.jpg" alt="Bergamo Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Savoye (Image Left) */}
          <div id="savoye" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Savoyer Alpentour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Eine Woche durch die Savoyer Alpen touren. Die Savoyer Alpen befinden sich grob zwischen Genf, Chamonix und Grenoble. Unser Standort ist der Campingplatz La ferme de la Serraz neben dem Lac d' Annecy in Doussard. Um den See liegen alleine schon 3 Fluggelände, die von der Hauptwindrichtung recht unabhängig und fast täglich fliegbar sind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/savoye-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/savoye-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (0)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/savoye.jpg" alt="Savoyer Alpentour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>
          
          {/* Vogesen (Image Right) */}
          <div id="vogesen" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Vogesen-Tour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Die Vogesen schließen sich nahtlos an das Pfälzer Bergland an und bilden ganz im Süden mit den Fluggebieten le Treh, le Drumont, Gustiberg und Ballon d'Alsace eine phantastische Flug-Arena. Sie bieten dem Einsteiger einfache Startplätze mit großzügigen Landeplätzen im Gleitwinkelbereich, dem Fortgeschrittenen die Möglichkeit für erste Streckenflüge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/vogesen-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/vogesen-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (0)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/vogesen.jpg" alt="Vogesen Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Pfalz (Image Left) */}
          <div id="pfalz" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Pfalz-Tour</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <p className="text-gray-500 mb-8 leading-relaxed font-light">
                Rund um das kleine Städtchen Annweiler in der Südpfalz liegen 7 schöne Startplätze, die allemal einen Besuch wert sind. Die Buckel der Südpfälzer haben einen Höhenunterschied von bis zu 320 m. Es werden von dort regelmäßig schöne Streckenflüge in den DHV-XC eingereicht.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reisen/pfalz-tour" className="px-6 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  WEITERLESEN
                </Link>
                <Link to="/reisen/pfalz-tour#comments" className="px-6 py-3 bg-transparent border border-gray-300 text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center">
                  KOMMENTAR (6)
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="/images/reisen/pfalz.jpg" alt="Pfalz Tour" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
