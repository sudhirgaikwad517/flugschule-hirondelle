import React from 'react';
import { Link } from 'react-router-dom';
import { Bird } from 'lucide-react';
import { Banner } from '../components/common/Banner';

export const Ausbildung = () => {
  return (
    <div className="w-full bg-white">
      <Banner />

      <div className="container mx-auto px-4 py-12 max-w-[1200px]">
        
        {/* Main Title Removed as per request */}
        <div className="text-center mb-16 mt-8">
          
          {/* Intro text */}
          <p className="text-xl md:text-2xl text-luxury-gold italic font-luxury mb-8 max-w-3xl mx-auto leading-relaxed">
            "Die Flugschule Hirondelle bietet euch eine qualifizierte, sichere und vielseitige Ausbildung."
          </p>
          
          <div className="max-w-4xl mx-auto text-gray-500 space-y-6 text-sm md:text-base font-light leading-relaxed text-justify">
            <p>
              Wir begleiten euch von den ersten Hüpfern bis zu euren ersten Strecken- und Thermikflügen hier im Odenwald, in der Pfalz, im Kraichtal, im Nahetal und überall sonst auf der Welt.
            </p>
            <p>
              Im Nachfolgenden sind die Ausbildungswege in der Flugschule Hirondelle vom <Link to="/ausbildung/schnupperkurs" className="text-luxury-gold hover:underline font-normal">Schnupper-/Einsteigerkurs</Link> über den <Link to="/ausbildung/l-schein" className="text-luxury-gold hover:underline font-normal">L-Schein</Link> und die <Link to="/ausbildung/a-schein" className="text-luxury-gold hover:underline font-normal">Höhenflugschulung (A-Schein)</Link> bis zum <Link to="/ausbildung/b-schein" className="text-luxury-gold hover:underline font-normal">unbeschränkten Luftfahrerschein (B-Schein)</Link> aufgelistet.
            </p>
          </div>
        </div>

        {/* Table and Graphic Section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16">
          
          {/* Table */}
          <div className="w-full lg:w-3/5 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-gray-300 text-[11px] sm:text-sm">
                  <th className="py-2 text-[#53a8c7] font-semibold w-[40%] pr-1">Kurse/Zeiten</th>
                  <th className="py-2 text-[#53a8c7] font-semibold w-[40%] pr-1">Kursinhalt</th>
                  <th className="py-2 text-[#53a8c7] font-semibold w-[20%] text-right">Kurspreis*</th>
                </tr>
              </thead>
              <tbody className="text-[11px] sm:text-sm">
                <tr className="bg-[#78b846] text-black">
                  <td className="py-2 px-1 sm:px-2 font-bold break-words pr-2">Schnupper-/Einsteigerkurs <br className="sm:hidden" /><span className="font-normal text-[10px] sm:text-sm">(1 – 2 Tage)</span></td>
                  <td className="py-2 px-1 sm:px-2 pr-2">Ausrüstung kennen lernen, die ersten Flüge</td>
                  <td className="py-2 px-1 sm:px-2 text-right font-semibold">ab 149,- €</td>
                </tr>
                <tr className="bg-[#388e3c] text-white">
                  <td className="py-2 px-1 sm:px-2 font-bold break-words pr-2">L-Schein <br className="sm:hidden" /><span className="font-normal text-[10px] sm:text-sm">(3 – 4 Tage)</span></td>
                  <td className="py-2 px-1 sm:px-2 pr-2">15 Flüge am Grundkurs-Übungshang</td>
                  <td className="py-2 px-1 sm:px-2 text-right font-semibold">620,- €</td>
                </tr>
                <tr className="bg-[#fbc02d] text-black">
                  <td className="py-2 px-1 sm:px-2 font-bold break-words pr-2">Windenschein <br className="sm:hidden" /><span className="font-normal text-[10px] sm:text-sm">(3 Tage)</span></td>
                  <td className="py-2 px-1 sm:px-2 pr-2">20 Flüge an der Winde</td>
                  <td className="py-2 px-1 sm:px-2 text-right font-semibold">450,- €</td>
                </tr>
                <tr className="bg-[#fb8c00] text-black">
                  <td className="py-2 px-1 sm:px-2 font-bold break-words pr-2">A-Schein <br className="sm:hidden" /><span className="font-normal text-[10px] sm:text-sm">(mind. 1 Woche)</span></td>
                  <td className="py-2 px-1 sm:px-2 pr-2">40 Höhenflüge</td>
                  <td className="py-2 px-1 sm:px-2 text-right font-semibold">ab 990,- €</td>
                </tr>
                <tr className="bg-[#ef6c00] text-white">
                  <td className="py-2 px-1 sm:px-2 font-bold break-words pr-2">B-Schein <br className="sm:hidden" /><span className="font-normal text-[10px] sm:text-sm">(mind. 1 Woche)</span></td>
                  <td className="py-2 px-1 sm:px-2 pr-2">20 Höhenflüge</td>
                  <td className="py-2 px-1 sm:px-2 text-right font-semibold">ab 990,- €</td>
                </tr>
                <tr className="bg-[#bdbdbd] text-black border-b border-gray-300">
                  <td className="py-2 px-1 sm:px-2 font-bold break-words pr-2">Tandemschein <br className="sm:hidden" /><span className="font-normal text-[10px] sm:text-sm">(mind. 1 Woche)</span></td>
                  <td className="py-2 px-1 sm:px-2 pr-2">40 Höhenflüge mit einem Passagier</td>
                  <td className="py-2 px-1 sm:px-2 text-right font-semibold">ab 790,- €</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">*exkl. Zusatzkosten vor Ort (z. B. Geländegebühren, Auffahrtskosten etc.)</p>
          </div>

          {/* Graphic */}
          <div className="w-full lg:w-2/5 flex flex-col justify-end">
            <img 
              src="https://www.fs-hirondelle.de/images/inhalte/ausbildungswege.png" 
              alt="Ausbildungswege Grafik" 
              className="w-full object-contain mb-2"
              onError={(e) => {
                // Fallback if the original image fails to load
                e.currentTarget.src = "https://picsum.photos/id/1018/800/400";
                e.currentTarget.className = "w-full h-48 object-cover opacity-50 grayscale mb-2";
              }}
            />
            <p className="text-[13px] text-gray-600 text-center mb-6">
              hm = ca. Höhenmeter-Differenz zwischen Start- und Landeplatz
            </p>
            <div className="flex justify-start">
              <button className="px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </button>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="flex flex-col gap-24 mt-24">
          
          {/* Schnupperkurs (Image Right) */}
          <div id="schnupper" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Schnupper-/Einsteigerkurs</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Der Anfang einer neuen Leidenschaft....</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Am Schnuppertag / Einsteigerkurs lernst du die Grundzüge des Gleitschirmfliegens kennen. Anfängliche Aufzieh- und Laufübungen bereiten dich auf deine ersten Flüge vor: Kappe auslegen, Leinen sortieren, Eintrittsöffnungen kontrollieren, damit der Gleitschirm anschließend richtig über euch steigt. Gurtzeug anlegen, Startcheck und los geht's zum ersten Versuch.
              </p>
              <Link to="/ausbildung/schnupperkurs" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="https://picsum.photos/id/1015/800/800" alt="Schnupperkurs" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* L-Schein (Image Left) */}
          <div id="l-schein" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">L-Schein</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Du legst den Grundstein...</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Aufbauend auf den Schnupperkurs werden im Grundkurs die fehlenden Flüge zur Erlangung des L-Scheins absolviert. Ziel des Kurses ist es, mindestens 15 Flüge am Hang oder an der Winde zu absolvieren, bei denen die Höhendifferenz schon bis zu 200 Meter betragen kann. Kurvenflug und Schirmkontrolle sind einige der Lerninhalte, die in diesem Kurs auf dem Lehrplan stehen.
              </p>
              <Link to="/ausbildung/l-schein" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="https://picsum.photos/id/1016/800/800" alt="L-Schein" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* A-Schein (Image Right) */}
          <div id="a-schein" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">A-Schein</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Was dich erwartet beim Höhenflugkurs...</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Aufbauend auf dem Grundkurs, werden beim Höhenflugkurs die ersten 15 Flüge für den beschränkten Luftfahrerschein (A-Schein) durchgeführt. Das Ziel des Höhenflugkurses ist der Höhenflugausweis.
              </p>
              <Link to="/ausbildung/a-schein" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="https://picsum.photos/id/1018/800/800" alt="A-Schein" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* B-Schein (Image Left) */}
          <div id="b-schein" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">B-Schein</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Auf Strecke mit dem unbeschränkten Luftfahrerschein...</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Das Gleitpotential des Gleitschirms ausreizen, die Thermik ausfliegen und dann auf Strecke gehen. Von Aufwind zu Aufwind gleiten und die Landschaft aus der Vogelperspektive genießen, das ist der Traum vieler Flieger.
              </p>
              <Link to="/ausbildung/b-schein" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="https://picsum.photos/id/1036/800/800" alt="B-Schein" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Windenschein (Image Right) */}
          <div id="winde" className="flex flex-col md:flex-row gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Windenschein</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Windenschlepp mit dem Gleitschirm...</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Das Schleppen an der Winde ist eine ideale Möglichkeit, auch im Flachland mit dem Gleitschirm in die Luft zu kommen. Der Windenschein ist die ideale Ergänzung zum A-Scheinkurs da ihr hier schnell einen Großteil der nötigen Flüge für die A-Scheinprüfung sammeln könnt.
              </p>
              <Link to="/ausbildung/windenschein" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="https://picsum.photos/id/1043/800/800" alt="Windenschein" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

          {/* Tandemschein (Image Left) */}
          <div id="tandem" className="flex flex-col md:flex-row-reverse gap-12 items-center scroll-mt-[100px]">
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark mb-4">Tandemschein</h2>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              <h3 className="text-xl italic text-luxury-gold font-luxury mb-6">Zusammen mit Freunden zum Fliegen gehen.</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-light text-justify">
                Zum Fliegen gehen und die Leidenschaft mit Freunden teilen? Mit dem Tandemschein kein Problem! Die Freiheit und die Eindrücke in der Luft mit jemanden teilen zu können ist ein fantastisches Erlebnis sowohl für den Piloten auch für den Passagier. Einfach ein Traum.
              </p>
              <Link to="/ausbildung/tandemschein" className="inline-block px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                WEITERLESEN
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden rounded-sm shadow-xl">
                <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                <img src="https://picsum.photos/id/1044/800/800" alt="Tandemschein" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
