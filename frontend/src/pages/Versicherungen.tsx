import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

export const Versicherungen = () => {
  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          
          {/* Main Title */}
          <div className="mb-12">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              VERSICHERUNGEN
            </h1>
            <div className="w-full h-px bg-[#53a8c7] opacity-40"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Column (Text Content) */}
            <div className="lg:col-span-7 xl:col-span-8">
              
              <h2 className="italic text-xl md:text-2xl text-gray-700 font-luxury mb-6">
                Irgendwas ist immer - kurzfristig krank, und nun?
              </h2>

              <div className="space-y-6 text-[15px] text-gray-600 font-light leading-relaxed mb-8">
                <p>
                  Ihr freut euch seit Wochen auf den Kurs und könnt aufgrund Krankheit nicht teilnehmen? Wir wollen euch eine gute Ausbildung ermöglichen und setzen daher in unseren Schulungen auf kleinere Gruppen, um eine individuelle Betreuung zu gewährleisten. Daher sind unsere Plätze limitiert und oft ausgebucht, und wir können euch bei kurzfristigen Absagen kein Geld nachlassen oder gar zurück erstatten.
                </p>
                <p>
                  Seit Coronoa haben wir immer wieder und deutlich verstärkt mit kurzfristigen Absagen und Stornos zu kämpfen. Bitte beachtet deshalb, dass eine Teilnahme bei unseren Kursen und Reisen verbindlich ist, mit eurer Kursbuchung bestätigt ihr unsere <Link to="/agb" className="text-[#53a8c7] font-medium hover:text-luxury-gold transition-colors">AGB</Link> mit den Stornobedingungen. Hier ein Auszug:
                </p>
              </div>

              {/* Storno Table / List */}
              <div className="mb-8 pl-4 md:pl-8">
                <p className="italic text-gray-700 mb-4 font-medium text-[15px]">
                  7.5 Der pauschalierte Anspruch auf Rücktrittsgebühren beträgt in der Regel bei Stornierungen:
                </p>
                <div className="space-y-1 text-gray-600 italic text-[15px]">
                  <div className="flex">
                    <span className="w-56 md:w-64">bis 4 Wochen vor Kursbeginn:</span>
                    <span>25 %</span>
                  </div>
                  <div className="flex">
                    <span className="w-56 md:w-64">bis 3 Wochen vor Kursbeginn:</span>
                    <span>50 %</span>
                  </div>
                  <div className="flex">
                    <span className="w-56 md:w-64">bis 2 Wochen vor Kursbeginn:</span>
                    <span>75 %</span>
                  </div>
                  <div className="flex">
                    <span className="w-56 md:w-64">bis 1 Woche vor Kursbeginn:</span>
                    <span>100 %</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-[15px] text-gray-600 font-light leading-relaxed mb-10">
                <p>
                  Hier findet ihr die <Link to="/agb" className="text-[#53a8c7] font-medium hover:text-luxury-gold transition-colors">AGB</Link> in voller Länge.
                </p>
                <p>
                  Wir wollen euch aber nicht im Regen stehen lassen und arbeiten mit einer Versicherung zusammen, über die ihr euch für den Fall der Fälle absichern könnt.
                </p>
              </div>

              <div className="w-full h-px bg-gray-200 mb-8"></div>

              <div className="text-[15px] text-gray-600 font-light leading-relaxed mb-8">
                <p>
                  Zur Teilnahme an unseren Kursen könnt ihr also eine Seminarversicherung für kleines Geld abschließen, die den Seminarpreis abdeckt. Hier geht's zur <strong>Seminarversicherung</strong>: <a href="https://secure.hmrv.de" target="_blank" rel="noopener noreferrer" className="text-[#53a8c7] hover:text-luxury-gold transition-colors">https://secure.hmrv.de</a>
                </p>
              </div>

              <div className="w-full h-px bg-gray-200 mb-8"></div>

              <div className="space-y-6 text-[15px] text-gray-600 font-light leading-relaxed mb-10">
                <p>
                  Für unsere Reisen empfehlen wir euch außerdem <strong>Reiseversicherungen</strong> für Reiserücktritt-/Abbruch, Gepäck bzw. Auslandskrankenversicherung.
                </p>
                <p>
                  Hier geht's zu den Versicherungen:
                </p>

                <ul className="list-disc pl-5 space-y-2 marker:text-gray-400 font-normal text-gray-700">
                  <li>
                    Reiserücktritt/-abbruchversicherung{' '}
                    <a href="https://secure.hmrv.de" target="_blank" rel="noopener noreferrer" className="text-[#53a8c7] hover:text-luxury-gold font-light transition-colors">https://secure.hmrv.de</a>
                  </li>
                  <li>
                    Jahres-Auslandskrankenversicherung (für beliebig viele Reisen bis 56 Tage){' '}
                    <a href="https://secure.hmrv.de" target="_blank" rel="noopener noreferrer" className="text-[#53a8c7] hover:text-luxury-gold font-light transition-colors">https://secure.hmrv.de</a>
                  </li>
                  <li>
                    Reisegepäckversicherung{' '}
                    <a href="https://secure.hmrv.de" target="_blank" rel="noopener noreferrer" className="text-[#53a8c7] hover:text-luxury-gold font-light transition-colors">https://secure.hmrv.de</a>
                  </li>
                </ul>
              </div>

              <p className="text-[15px] text-gray-600 font-light leading-relaxed">
                So seid ihr optimal abgesichert und könnt euch ohne Risiko auf euren gebuchten Kurs freuen :-)
              </p>

            </div>

            {/* Right Column (Poster Graphic) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div 
                className="w-full p-10 md:p-14 flex flex-col items-center justify-center text-white shadow-xl aspect-[3/4] sticky top-32"
                style={{ backgroundColor: '#119abf' }}
              >
                
                {/* Logo Circle */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[5px] md:border-[6px] border-white flex items-center justify-center mb-10 md:mb-12">
                  <img 
                    src="/google.png" 
                    alt="Logo" 
                    className="w-16 h-16 md:w-20 md:h-20 object-contain brightness-0 invert opacity-90"
                  />
                </div>

                {/* Text */}
                <div className="text-center font-sans tracking-wide leading-tight">
                  <div className="text-4xl md:text-5xl font-normal mb-1 md:mb-2">KEEP</div>
                  <div className="text-4xl md:text-5xl font-normal mb-8 md:mb-10">CALM</div>
                  
                  <div className="text-lg md:text-xl font-medium mb-8 md:mb-10 tracking-widest">AND</div>
                  
                  <div className="text-4xl md:text-5xl font-normal mb-1 md:mb-2">STAY</div>
                  <div className="text-4xl md:text-5xl font-normal">SAFE</div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
