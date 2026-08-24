import { Banner } from '../components/common/Banner';

export const ZweiJahresCheck = () => {
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
                2-Jahres-Check
              </h1>
            </div>

            {/* Video Placeholder */}
            <div className="w-full h-[400px] relative overflow-hidden rounded-sm shadow-sm group cursor-pointer">
              <img 
                src="https://picsum.photos/id/1018/1000/600" 
                alt="Gleitschirm Check Video" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-colors group-hover:bg-black/10">
                <div className="w-16 h-16 bg-[#ff0000] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center overflow-hidden">
                    <img src="https://picsum.photos/id/1015/100/100" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-white font-bold text-lg text-shadow-sm">Gleitschirm Check - So läuft ein Schirmcheck ab! | PART 1 - ...</h3>
                </div>
              </div>
            </div>

            {/* Content Blocks */}
            <div className="space-y-8 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Eure Sicherheit liegt uns am Herzen</h3>
                <p className="mb-4">
                  Wir führen die Wartungsarbeiten bzw. notwendige Reparatur-Arbeiten in unserer Service-Werkstätte mit größter Sorgfalt und modernster Technik durch – damit ihr schnell wieder sicher abheben könnt!
                </p>
                <p className="mb-4">
                  Wir checken alle gängigen Modelle innerhalb von 10 bis 14 Tagen. Zu Saisonbeginn kann es schnell mal zu längeren Checkzeiten kommen, wir empfehlen daher den Check während der Wintermonate einzuplanen. Kleinere Reparaturen sind im Check ohne Aufpreis enthalten – größere Arbeiten werden vor der Durchführung mit euch individuell abgestimmt.
                </p>
                <p>
                  Gemäß der Luftgeräteprüfverordnung (§ 14) dürfen nur Gleitschirme in die Luft, die einen gültigen Check (im durch den Hersteller vorgegebenen Intervall) besitzen. Hiervon ist auch euer Versicherungsschutz abhängig, daher ist es absolut wichtig, den Schirm ordnungsgemäß überprüfen zu lassen.
                </p>
              </div>
            </div>

            {/* Prüfschritte */}
            <div className="pt-8">
              <h3 className="font-luxury text-3xl text-[#53a8c7] mb-8 uppercase tracking-wider border-b border-gray-200 pb-4">
                UNSERE PRÜFSCHRITTE
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-light mb-6">
                <li>Identifizierung des Gerätes</li>
                <li>Sichtkontrolle der Kappe</li>
                <li>Sichtkontrolle der Leinen</li>
                <li>Sichtkontrolle der Verbindungsteile</li>
                <li>Kontrolle der Leinenfestigkeit</li>
                <li>Kontrolle der Kappenfestigkeit</li>
                <li>Kontrolle der Luftdurchlässigkeit des Tuches</li>
                <li>Vermessung der Leinenlängen mit Laser-Technik</li>
                <li>Kontrolle, Berechnung und Korrektur von Trimmung sowie Einstellung falls nötig (ohne Aufpreis)</li>
                <li>Kleinere Reparaturen bei Bedarf</li>
                <li>Hin- und Rückversand deines Schirms zum Checkbetrieb (ab Flugschule)</li>
              </ul>
              <p className="font-semibold text-gray-700">
                Unsere Devise: Wer für weniger Leistung mehr Geld ausgibt, ist selbst schuld!
              </p>
            </div>

            {/* Formular Button */}
            <div className="pt-4">
              <button className="w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-4 rounded-full text-lg font-semibold transition-colors shadow-md">
                Um deinen Gleitschirm Check durchzuführen, benötigen wir das ausgefüllte Formular
              </button>
            </div>

            {/* Reference Content */}
            <div className="pt-4">
              <p className="text-sm text-gray-500 text-justify leading-relaxed">
                LuftGerPV § 14 Nachprüfungen (5) Die Lufttüchtigkeit des Luftfahrtgeräts nach § 10a ist nach den vom Hersteller vorgegebenen Anweisungen durch den Halter oder in dessen Auftrag nachzuprüfen oder nachprüfen zu lassen. Der Halter ist für die rechtzeitige und vollständige Durchführung der Prüfungen verantwortlich. Er hat Mängel an dem Luftfahrtgerät oder an den Prüfanweisungen unverzüglich dem Hersteller zu melden. §§ 15 und 18 bis 20 finden keine Anwendung.
              </p>
            </div>

            {/* Impressions Gallery */}
            <div className="pt-8 pb-12">
               <div className="grid grid-cols-4 gap-1 bg-black p-1">
                 {[1011, 1012, 1013, 1014, 1015, 1016, 1018, 1019].map((id, index) => (
                   <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-900">
                     <img 
                       src={`https://picsum.photos/id/${id}/200/200`} 
                       alt={`Impression ${index + 1}`} 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                   </div>
                 ))}
               </div>
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
                    <p className="text-luxury-dark font-semibold">Checkpreis*</p>
                    <p className="text-xs text-gray-500 italic mt-1">[inkl. Versandkosten zum Checkbetrieb ab Flugschule ]</p>
                  </div>
                  <p className="font-bold text-luxury-dark whitespace-nowrap text-lg">195,- €</p>
                </div>
                
                <div className="flex justify-between items-start gap-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-600 italic">*Aufpreis für Abgabe im Schnellpacksack</p>
                  <p className="font-bold text-luxury-dark whitespace-nowrap">10,- €</p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 italic">Zusatzkosten für Reparaturen nach Aufwand und Absprache</p>
                </div>
              </div>

              <button className="w-full bg-[#4a5f68] hover:bg-[#394a51] text-white text-center py-3 font-semibold shadow-md rounded-sm transition-colors">
                Zum Check-Formular
              </button>
            </div>

            {/* Check-Auftrag Info */}
            <div>
               <h3 className="font-luxury text-2xl text-[#53a8c7] mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 CHECK-AUFTRAG
               </h3>
               <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                 Du erhältst eine Kopie des Formulars per E-Mail, dieses bitte ausdrucken und zusammen mit dem Gleitschirm in unserer Flugschule oder alternativ in Landau vorbeibringen.
               </p>
               <div className="text-gray-600 text-sm space-y-4">
                 <p className="leading-relaxed">
                   <strong className="block text-gray-800 font-semibold mb-1">69469 Weinheim, Untergasse 27:</strong>
                   bitte wegen Öffnungszeiten Newsletter beachten
                 </p>
                 <p className="leading-relaxed">
                   <strong className="block text-gray-800 font-semibold mb-1">76829 Landau Am Birnbach 6:</strong>
                   Termin bitte telefonisch oder per E-Mail vereinbaren
                 </p>
               </div>
            </div>

          </div>
          
        </div>
      </section>

    </div>
  );
};
