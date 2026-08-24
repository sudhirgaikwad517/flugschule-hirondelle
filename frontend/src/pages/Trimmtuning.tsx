import { Banner } from '../components/common/Banner';

export const Trimmtuning = () => {
  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="pt-16 md:pt-24 pb-8 md:pb-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-12">
            
            <div>
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                SERVICE
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                Trimmtuning
              </h1>
            </div>

            {/* Main Image */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm group cursor-pointer">
              <img 
                src="https://picsum.photos/id/1036/1000/600" 
                alt="Trimmtuning" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-6 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">
                  "Trimmtuning" – das Zauberwort in der Gleitschirmszene.
                </h3>
                <h4 className="font-luxury text-xl text-luxury-dark mb-4 italic text-[#53a8c7]">
                  Für bessere und sicherere Schirme – und mehr Freude an eurem Fluggerät!
                </h4>
                <p className="mb-4">
                  Wir messen mit Laser den Ist-Zustand des Schirmes und stellen die Leinenlängen danach so optimal wie möglich nach, damit die Trimmung wieder bestmöglich dem Zulassungsmuster entspricht. Wenn wir bei der Trimmung euer Startgewicht kennen, können auch diese Werte berücksichtigt werden und der Schirm so optimal auf euch als Pilot eingestellt werden. Idealerweise kann so in der Luft mehr Leistung rausgeholt werden, ohne dass euer Schirm dadurch an Sicherheit verliert oder anspruchsvoller wird. Der Pilot erhält 2 Messdatenblätter. Einmal den Ist-Zustand vor der Trimmung und einmal danach.
                </p>
              </div>
            </div>

            {/* Unsere Leistungen block */}
            <div className="pt-8">
              <h3 className="font-luxury text-2xl text-[#53a8c7] mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                UNSERE LEISTUNGEN
              </h3>
              <ul className="list-disc list-outside ml-5 text-gray-600 font-light leading-relaxed space-y-2">
                <li>Vermessen der Gesamtleinenlängen</li>
                <li>Nachstellen der Trimmung, idealerweise auf euer Startgewicht</li>
                <li>Nochmaliges Vermessen</li>
                <li>2 Messdatenblätter (Messwerte der Leinenlängen vor der Trimmung / angelieferter Zustand, Messwerte der Leinenlängen nach der Trimmung / ausgelieferter Zustand)</li>
                <li>inkl. Versandkosten - Hin-/Rückversand</li>
              </ul>
            </div>

            {/* Formular Button */}
            <div className="pt-4">
              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-4 rounded-sm text-lg font-semibold transition-colors shadow-md">
                Um deinen Gleitschirm trimmen zu können, benötigen wir das ausgefüllte Formular
              </button>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-12">

            {/* Pricing Card */}
            <div className="bg-[#FAF9F7] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md">
                Bitte das Formular unten ausfüllen
              </button>

              <div className="space-y-6 mb-10 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-luxury-dark font-semibold">Trimmtuning alle Marken</p>
                    <p className="text-gray-500 italic text-xs mt-1">[ inkl. Versand ]</p>
                  </div>
                  <p className="font-bold text-luxury-dark whitespace-nowrap text-lg">120,- €</p>
                </div>
              </div>

              <button className="w-full bg-[#4a5f68] hover:bg-[#394a51] text-white text-center py-3 px-4 font-semibold shadow-md rounded-sm transition-colors text-sm">
                Zum Trimm-Auftrag &gt; Service-Auftrag unter Sonstiges ausfüllen
              </button>
            </div>

            {/* Trimm-Auftrag Info */}
            <div>
               <h3 className="font-luxury text-2xl text-[#53a8c7] mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 TRIMM-AUFTRAG
               </h3>
               <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                 Du erhältst eine Kopie des Formulars per E-Mail, dieses bitte ausdrucken und zusammen mit dem Gleitschirm in unserer Flugschule oder alternativ in Landau bzw. Offenbach vorbeibringen.
               </p>
               <div className="text-gray-600 text-sm space-y-4">
                 <p className="leading-relaxed">
                   <strong className="block text-gray-800 font-semibold mb-1">69469 Weinheim, Untergasse 27:</strong>
                   bitte wegen Öffnungszeiten Newsletter beachten
                 </p>
                 <p className="leading-relaxed">
                   <strong className="block text-gray-800 font-semibold mb-1">76829 Landau Am Birnbach 6:</strong>
                   Termin bitte telefonisch vereinbaren
                 </p>
               </div>
            </div>

          </div>
          
        </div>
      </section>

    </div>
  );
};
