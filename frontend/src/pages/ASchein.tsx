import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check, Info } from 'lucide-react';

export const ASchein = () => {
  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-12">
            
            <div>
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                AUSBILDUNG
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase">
                A-Schein
              </h1>
            </div>

            {/* Featured Image */}
            <div className="w-full h-[400px] overflow-hidden rounded-sm shadow-sm group">
              <img 
                src="https://picsum.photos/id/1018/1000/600" 
                alt="A-Schein Höhenflugkurs" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Du wirst endlich lizenzierter Pilot</h3>
                <p>
                  Auf den <Link to="/ausbildung/l-schein" className="text-luxury-gold hover:underline font-medium">Grundkurs</Link> aufbauend, werden für den A-Schein die Kenntnisse vertieft. Kurvenflug, Schirmkontrolle und vielleicht schon das erste Rückwärtsaufziehen an dem Übungshang sind einige der Lerninhalte, die in diesem Kurs neben den Höhenflügen auf dem Lehrplan stehen. Mit der vorgeschriebenen Ausbildung in Theorie und Praxis machen wir aus dir einen sicheren und umsichtigen Piloten. Nach erfolgreich bestandener Theorieprüfung und Erreichen von mind. 40 Höhenflügen sowie 18.000 Höhenmetern kannst du dann auch die praktische Prüfung ablegen. Mit dem A-Schein in deinen Händen, warten die zugelassenen Gelände in ganz Deutschland und darüber hinaus von dir erflogen zu werden!
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Was dich erwartet beim Höhenflugkurs (A-Schein)...</h3>
                <div className="space-y-4">
                  <p>
                    Für den beschränkten Luftfahrerschein (A-Schein) benötigt man mind. 40 Flüge, in denen mind. 18.000 Höhenmeter erflogen werden. Die alpinen Höhenflüge finden im Rahmen unserer Höhenflugschulungen (i. d. R. in den Alpen) statt. Weitere Flüge können auch an der <Link to="/ausbildung/winde" className="text-luxury-gold hover:underline font-medium">Winde</Link> absolviert werden (Achtung Winde: dies ist ein separater Kurs, der sich aber super mit der A-Scheinausbildung kombinieren lässt! Der <Link to="/ausbildung/winde" className="text-luxury-gold hover:underline font-medium">Windenkurs</Link> spart unterm Strich Zeit und Geld!).
                  </p>
                  <p>
                    Für die Höhenflugschulung fahren wir regelmäßig nach Bassano / Italien, sowie nach Frankreich und Österreich – weitere Fluggebiete nutzen wir nach Bedarf!
                  </p>
                  <p>
                    Auf dieser 1-wöchigen Höhenflugschulung (Samstag bis Samstag → es werden nur 5 Tage Urlaub benötigt) werden die notwendigen Höhenflüge gesammelt und Flugmanöver trainiert und du wirst auf die praktische Prüfung vorbereitet. Diese findet auch vor Ort statt und wird von einem Prüfer des DHV (Deutscher Hängegleiter Verband) abgenommen.
                  </p>
                  <p>
                    Der A-Schein berechtigt dich dann zum alleinigen Fliegen in zugelassenen Geländen in ganz Deutschland und darüber hinaus.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Der Kurs...</h3>
                <p>
                  Neue Lerninhalte wie Landeeinteilung, Vollkreis, Kurven mit unterschiedlicher Schräglage sowie Abstiegshilfen werden dem Flugschüler in diesem Ausbildungsabschnitt vermittelt. Auch die erste Thermikerfahrung sammelt ihr im Rahmen der Ausbildung zum A-Schein. Ständige Funkbegleitung versteht sich von selbst! Untermauert wird die Ausbildung mit insgesamt 20 Unterrichtsstunden Theorie (à 45 min.) in den Fächern: Meteorologie, Luftrecht, Gerätekunde, Flugtechnik und Verhalten in besonderen Fällen. Nach dem Kurs muss der Flugschüler eine offizielle Theorieprüfung in den vorher vermittelten Theoriefächern vor einem Prüfer des <a href="https://www.dhv.de/" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:underline font-medium">DHV</a> abzulegen - dies kann jederzeit in der Flugschule bei Alex erfolgen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Organisatorisches...</h3>
                <p>
                  Die Termine zur Höhenflugschulung findet ihr in unserem <Link to="/buchungskalender" className="text-luxury-gold hover:underline font-medium">Kalender</Link>. Bitte meldet euch hierüber an. Ort und genaue Uhrzeit der Kurstermine erfahrt ihr dann wie gewohnt vorab per Schulungs-Newsletter. Die Ausbildung zum Höhenflugausweis erfolgt wie gewohnt für jeden Piloten zeitoffen.
                </p>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic">Die erste eigene Ausrüstung</h3>
                <div className="space-y-4">
                  <p>
                    Mit der Ausbildung zum selbständigen Piloten kommt auch eine eigene Ausrüstung ins Spiel. Wie bei vielen anderen Sportarten ist auch beim Gleitschirmfliegen die Ausrüstung entscheidend. Doch wer die Wahl hat, hat die Qual! Man muss sich in erster Linie damit auseinandersetzen, welche Ausrüstung für einen selbst geeignet ist. Wir von der Flugschule Hirondelle setzen genau an dieser Stelle an und beraten euch auf der Suche nach dem passenden Equipment. Die von uns getroffene Auswahl spiegelt einen Querschnitt des Marktes wieder und bedient nach unserer Erfahrung nahezu alle Ansprüche und Wünsche – die Produkte der beiden Phi, Niviuk, Independence und Advance bieten für alle Zielgruppen entsprechende Ausrüstungen. Mit unserer langjährigen Auseinandersetzung mit Flugeigenschaften, Sicherheit, Qualität, Service, Handling und technischem Fortschritt unterstützen wir euch so optimal bei der Entscheidung zu eurer Neuinvestition.
                  </p>
                  <p>
                    Wollt/könnt ihr euch noch nicht gleich festlegen, besteht die Möglichkeit, die Ausbildung zum A-Schein mit einer Leihausrüstung der Flugschule zu absolvieren.
                  </p>
                  <p>
                    Oder ihr bringt eine eigene (fremdgekaufte) Ausrüstung mit, hier greift ein Aufschlag auf den Kurspreis der Höhenflugschulung in Höhe von 350,00 € pro Kurs / Woche.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Booking Card */}
            <div className="bg-[#FAF9F7] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <div className="p-8">
                <Link 
                  to="/buchungskalender"
                  className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md"
                >
                  Kurs buchen
                </Link>

                <div className="space-y-5 mb-8">
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p className="font-bold text-luxury-dark mb-1 text-sm">A-Scheinkurs</p>
                        <p className="italic">Praxisausbildung im Rahmen der Schulungswoche Höhenflugschulung 1 (790,- €) sowie A-Schein-Theorie (200,- €)</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">990,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p className="font-bold text-luxury-dark mb-1">Kombikurs:</p>
                        <p>Grundkurs & A-Scheinkurs Woche 1</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">1.590,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p>Ratenzahlung Kombikurs [ 4 Raten à 430,- € ]</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">1.720,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p className="font-bold text-luxury-dark mb-1">Kombikurs Kompakt:</p>
                        <p>Grundkurs & Winde & A-Scheinkurs Woche 1</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">1.990,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                        <p>Ratenzahlung Kombikurs Kompakt [ 4 Raten à 530,- € ]</p>
                      </div>
                      <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">2.120,- €</p>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-gray-500 font-light text-xs italic leading-relaxed">
                      alle Kursgebühren mit bei uns gekaufter Ausrüstung / Leihausrüstung siehe Zusatzkosten
                    </p>
                  </div>

                  {/* Zusatzkosten Table */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4 text-[#53a8c7]" />
                      <p className="font-bold text-luxury-dark text-sm uppercase">Zusatzkosten</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-3">
                        <p className="text-gray-600 font-light text-[13px]">eigene Ausrüstung</p>
                        <p className="text-gray-500 text-[12px] whitespace-nowrap mt-0.5 text-right">Preise auf<br/>Anfrage</p>
                      </div>

                      <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-3">
                        <div className="text-gray-600 font-light text-[13px]">
                          <p>optional Leihausrüstung</p>
                          <p className="italic text-[11px]">[pauschal pro Kurswoche]</p>
                        </div>
                        <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">350,- €</p>
                      </div>

                      <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-3">
                        <p className="text-gray-600 font-light text-[13px]">Aufschlag bei fremdgekaufter Ausrüstung</p>
                        <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">350,- €</p>
                      </div>

                      <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-3">
                        <p className="text-gray-600 font-light text-[13px]">zusätzliche Teilnahme an weiteren Höhenflugschulungswochen</p>
                        <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5">790,- €</p>
                      </div>

                      <div className="flex justify-between items-start gap-4 pt-1">
                        <div className="text-gray-600 font-light text-[13px]">
                          <p>ggf. Auffahrten zum Startplatz <span className="italic text-[11px]">[ pro Fahrt ]</span></p>
                          <p className="text-[12px]">Bus | Seilbahn (Kosten des Betreibers vor Ort)</p>
                        </div>
                        <p className="font-medium text-luxury-dark whitespace-nowrap mt-0.5 text-right">10,- € | - €</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link 
                to="/buchungskalender" 
                className="w-full block bg-luxury-dark hover:bg-luxury-gold text-white text-center py-4 text-sm font-semibold uppercase tracking-widest transition-colors"
              >
                Termine Höhenflugschulungen &gt; Siehe Kalender
              </Link>
            </div>

            {/* Voucher Box */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 A-Schein Verschenken
               </h3>
               <p className="text-gray-500 font-light text-sm mb-4">
                 Der A-Schein ist auch als Geschenk-Gutschein möglich
               </p>
               <div className="w-full h-[180px] rounded-sm overflow-hidden shadow-sm relative group cursor-pointer border border-gray-200">
                  <img src="https://picsum.photos/id/1018/600/300" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gutschein" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                     <p className="text-white font-luxury text-3xl font-bold italic opacity-90 drop-shadow-md tracking-wider">GUTSCHEIN</p>
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                     <p className="text-luxury-dark text-[10px] font-bold uppercase tracking-widest">Flugschule Hirondelle</p>
                  </div>
               </div>
            </div>

            {/* Impressions Gallery */}
            <div>
               <h3 className="font-luxury text-2xl text-luxury-dark mb-6 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Impressionen
               </h3>
               <div className="grid grid-cols-3 gap-2">
                 {[1018, 1028, 1038, 1048, 1058, 1068, 1078, 1088, 1098, 1108, 1118, 1011].map((id, index) => (
                   <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-100">
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

        </div>

        {/* Leistungen & Checkliste Grid (Full Width) */}
        <div className="max-w-7xl mx-auto mt-16 lg:mt-24">
          <hr className="border-gray-100 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h2 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase">Unsere Leistungen</h2>
              <ul className="space-y-3 mb-6">
                {[
                  'Theorie- und Praxisausbildung durch zertifizierte Fluglehrer',
                  'Organisation der Reise für die Schulungswoche Höhenflugschulung',
                  'Funkausrüstung und -betreuung',
                  'Haftpflichtversicherung bei Leihausrüstung'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-600 font-light">
                    <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <h4 className="font-medium text-luxury-dark mb-4 text-sm">Zusatzkosten können entstehen für:</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex gap-3 text-gray-600 font-light">
                  <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span>Ausrüstung</span>
                    <ul className="ml-6 mt-2 space-y-2 list-disc text-gray-500 text-sm">
                      <li>neue / gebrauchte Ausrüstung, Preise auf Anfrage</li>
                      <li>Leihausrüstung über die Flugschule (350,- € / Kurswoche)</li>
                      <li>Aufschlag auf den Kurspreis bei fremdgekaufter Ausrüstung (350,- €)</li>
                    </ul>
                  </div>
                </li>
                {[
                  <>Optional <Link to="/ausbildung/winde" className="text-luxury-gold hover:underline">Windenkurs</Link> zur Vervollständigung der 40 benötigten Flüge</>,
                  'Optional zusätzliche Teilnahme an weiteren Höhenflugschulungswochen (790,- € / Woche)',
                  'E-Learning Prüffragen Gleitschirm-A-Schein vom DHV',
                  'Prüfungsgebühren ab 03.04.2023 DHV'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-600 font-light">
                    <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-luxury text-3xl text-luxury-dark mb-8 uppercase">Deine Checkliste</h2>
              <ul className="space-y-4">
                {[
                  'Lust aufs Fliegen',
                  'Mindestalter: 14 Jahre (mit Einverständniserklärung der Erziehungsberechtigten!)',
                  'Überknöchelhohe Schuhe, wir empfehlen spezielle Flugschuhe oder zumindest Wanderschuhe',
                  'Outdoor-Bekleidung, je nach Wetter Wechselkleidung',
                  'Ausreichend Getränke und Verpflegung (Fliegen macht hungrig!!!)',
                  'Sonnencreme',
                  'Ausführliche Checkliste für die Höhenflugschulung erhaltet ihr je Reisetermin'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-600 font-light">
                    <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
