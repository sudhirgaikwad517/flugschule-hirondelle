import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

export const Ausbildungskonzept = () => {
  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-12">
            <h1 className="font-luxury text-4xl md:text-5xl text-[#53a8c7] uppercase tracking-wider mb-2">
              Ausbildungskonzept
            </h1>
            <div className="w-full h-px bg-[#53a8c7]/30"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column (Content) */}
            <div className="lg:col-span-5 space-y-8">
              <h3 className="font-luxury text-2xl text-luxury-dark italic">
                Ausbildung mit der Flugschule Hirondelle
              </h3>
              
              <div className="space-y-6 text-gray-600 font-light leading-relaxed text-justify">
                <p>
                  Die Flugschule Hirondelle bietet euch eine qualifizierte, sichere und vielseitige Ausbildung. Wir begleiten euch von den ersten Hüpfern bis zu euren ersten Strecken- und Thermikflügen hier im Odenwald, in der Pfalz, im Kraichtal, im Nahetal und überall sonst auf der Welt.
                </p>
                <p>
                  Fliegen lernen mit dem Team Hirondelle heißt persönliche und individuelle auf den Schüler zugeschnittene Ausbildung! Das zeichnet uns aus:
                </p>
                
                <ul className="list-disc pl-5 space-y-2 text-[15px]">
                  <li>Unser Team besteht aus sehr erfahrenen und ambitionierten Fluglehrern</li>
                  <li>Bei uns steht der Spaß und die Sicherheit am Fliegen im Vordergrund</li>
                  <li>Geniale Schulungshänge im Raum Odenwald, Kraichtal, Nahetal und in der Pfalz (5 eigene auf die Flugschule zugelassene Schulungshänge)</li>
                  <li>Schulung bei jeder Windrichtung möglich</li>
                </ul>

                <p>
                  Im Nachfolgenden sind die Ausbildungswege in der Flugschule Hirondelle vom <Link to="/ausbildung/schnupperkurs" className="text-[#53a8c7] hover:underline">Schnupperkurs</Link> über die <Link to="/ausbildung/a-schein" className="text-[#53a8c7] hover:underline">Höhenflugschulung</Link> bis zum <Link to="/ausbildung/b-schein" className="text-[#53a8c7] hover:underline">unbeschränkten Luftfahrerschein</Link> aufgelistet.
                </p>
              </div>
            </div>

            {/* Right Column (Graphic and Table) */}
            <div className="lg:col-span-7 flex flex-col items-end">
              
              {/* Graphic */}
              <div className="w-full max-w-2xl mb-2">
                <img 
                  src="https://www.fs-hirondelle.de/images/inhalte/ausbildungswege.png" 
                  alt="Ausbildungswege Grafik" 
                  className="w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/id/1018/800/400";
                    e.currentTarget.className = "w-full h-48 object-cover opacity-50 grayscale";
                  }}
                />
                <p className="text-center text-gray-500 text-sm mt-1">
                  hm = ca. Höhenmeter-Differenz zwischen Start- und Landeplatz
                </p>
              </div>

              {/* Table */}
              <div className="w-full overflow-hidden mt-4 shadow-sm border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 text-[#53a8c7] font-semibold text-sm w-[25%]">Kurse/Zeiten</th>
                      <th className="py-3 px-4 text-[#53a8c7] font-semibold text-sm w-[45%]">Kursinhalt</th>
                      <th className="py-3 px-4 text-[#53a8c7] font-semibold text-sm w-[30%]">Kursziel</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    
                    {/* Schnupperkurs */}
                    <tr className="bg-[#aed581] text-black border-b border-white/20">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold">Schnupper-/Einsteigerkurs</div>
                        <div>1 – 2 Tage</div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        Ausrüstung kennen lernen, theoretische Grundlagen, die ersten kleinen Flüge
                      </td>
                      <td className="py-4 px-4 align-top">
                        spielerisches Kennenlernen des Sports, selbständiges Groundhandling
                      </td>
                    </tr>

                    {/* L-Schein */}
                    <tr className="bg-[#4caf50] text-black border-b border-white/20">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold">L-Schein</div>
                        <div>3 – 4 Tage</div>
                        <div>Grundkurs</div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        Inhalte Schnupperkurs, Grundlagen in Flugtechnik, 15 Flüge für den L-Schein, Lerninhalte Grundkurs
                      </td>
                      <td className="py-4 px-4 align-top">
                        L-Schein, selbständiges Groundhandling, eigenständiges Fliegen in den eingewiesenen Geländen
                      </td>
                    </tr>

                    {/* Winde */}
                    <tr className="bg-[#fff176] text-black border-b border-white/20">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold">Windenschein</div>
                        <div>3 – 4 Tage</div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        20 Flüge an der Winde, Lerninhalte Windenschlepp, Flugschulinterne Theorie- und Praxisprüfung für den Windenschlepp
                      </td>
                      <td className="py-4 px-4 align-top">
                        Windenschleppberechtigung, selbständiges Fliegen an der Winde
                      </td>
                    </tr>

                    {/* A-Schein */}
                    <tr className="bg-[#ffd54f] text-black border-b border-white/20">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold">A-Schein</div>
                        <div>Höhenflugschulung</div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        40 Höhenflüge (20 davon können an der Winde absolviert werden) sowie 18.000 Höhenmeter, Lerninhalte A-Schein, Theorie-/Praxisprüfung zum beschränkten Luftfahrerschein vor einem Prüfer des DHV
                      </td>
                      <td className="py-4 px-4 align-top">
                        beschränkter Luftfahrerschein (A-Schein), selbständiges Fliegen in fast allen Geländen weltweit, innerhalb des Gleitwinkelbereiches vom Startplatz
                      </td>
                    </tr>

                    {/* B-Schein */}
                    <tr className="bg-[#ffb74d] text-black border-b border-white/20">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold">B-Schein</div>
                        <div>Integriert in eine Flugreise oder Fortbildung</div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        20 Höhenflüge, Lerninhalte für den unbeschränkten Luftfahrerschein Theorieprüfung zum unbeschränkten Luftfahrerschein vor einem Prüfer des DHV
                      </td>
                      <td className="py-4 px-4 align-top">
                        Unbeschränkter Luftfahrerschein (B-Schein), selbständiges Fliegen in allen Fluggeländen Europas, Streckenflugberechtigung
                      </td>
                    </tr>

                    {/* Tandem */}
                    <tr className="bg-[#e0e0e0] text-black">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold mt-4">Tandemschein</div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        40 Höhenflüge mit einem Passagier, Lerninhalte Passagierflug, Theorie-/Praxisprüfung zur Passagierflugberechtigung vor einem Prüfer des DHV
                      </td>
                      <td className="py-4 px-4 align-top">
                        Passagierflugberechtigung, selbständiges Passagierfliegen
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
