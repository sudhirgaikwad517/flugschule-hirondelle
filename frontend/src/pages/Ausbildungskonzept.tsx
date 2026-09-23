import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Banner } from '../components/common/Banner';
import { useLightbox } from '../components/common/Lightbox';
import { SafeHtml } from '../components/common/SafeHtml';

interface TableRow {
  name: string;
  duration: string;
  content: string;
  goal: string;
  bgColor: string;
}

interface AusbildungskonzeptData {
  heading: string;
  subheading: string;
  paragraph1: string;
  paragraph2: string;
  bulletPoints: string[];
  pathsHtml: string;
  graphicImage: string;
  graphicCaption: string;
  tableRows: TableRow[];
}

const DEFAULT_CONTENT: AusbildungskonzeptData = {
  heading: 'Ausbildungskonzept',
  subheading: 'Ausbildung mit der Flugschule Hirondelle',
  paragraph1: 'Die Flugschule Hirondelle bietet euch eine qualifizierte, sichere und vielseitige Ausbildung. Wir begleiten euch von den ersten Hüpfern bis zu euren ersten Strecken- und Thermikflügen hier im Odenwald, in der Pfalz, im Kraichtal, im Nahetal und überall sonst auf der Welt.',
  paragraph2: 'Fliegen lernen mit dem Team Hirondelle heißt persönliche und individuelle auf den Schüler zugeschnittene Ausbildung! Das zeichnet uns aus:',
  bulletPoints: [
    'Unser Team besteht aus sehr erfahrenen und ambitionierten Fluglehrern',
    'Bei uns steht der Spaß und die Sicherheit am Fliegen im Vordergrund',
    'Geniale Schulungshänge im Raum Odenwald, Kraichtal, Nahetal und in der Pfalz (5 eigene auf die Flugschule zugelassene Schulungshänge)',
    'Schulung bei jeder Windrichtung möglich',
  ],
  pathsHtml: 'Im Nachfolgenden sind die Ausbildungswege in der Flugschule Hirondelle vom <a href="/ausbildung/schnupperkurs" class="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Schnupperkurs</a> über die <a href="/ausbildung/a-schein" class="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">Höhenflugschulung</a> bis zum <a href="/ausbildung/b-schein" class="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium">unbeschränkten Luftfahrerschein</a> aufgelistet.',
  graphicImage: '/images/inhalte/ausbildungswege.png',
  graphicCaption: 'hm = ca. Höhenmeter-Differenz zwischen Start- und Landeplatz',
  tableRows: [
    { name: 'Schnupper-/Einsteigerkurs', duration: '1 – 2 Tage', content: 'Ausrüstung kennen lernen, theoretische Grundlagen, die ersten kleinen Flüge', goal: 'spielerisches Kennenlernen des Sports, selbständiges Groundhandling', bgColor: '#80c533' },
    { name: 'L-Schein', duration: '3 – 4 Tage\nGrundkurs', content: 'Inhalte Schnupperkurs, Grundlagen in Flugtechnik, 15 Flüge für den L-Schein, Lerninhalte Grundkurs', goal: 'L-Schein, selbständiges Groundhandling, eigenständiges Fliegen in den eingewiesenen Geländen', bgColor: '#34963b' },
    { name: 'Windenschein', duration: '3 – 4 Tage', content: '20 Flüge an der Winde, Lerninhalte Windenschlepp, Flugschulinterne Theorie- und Praxisprüfung für den Windenschlepp', goal: 'Windenschleppberechtigung, selbständiges Fliegen an der Winde', bgColor: '#fff600' },
    { name: 'A-Schein', duration: 'Höhenflugschulung', content: '40 Höhenflüge (20 davon können an der Winde absolviert werden) sowie 18.000 Höhenmeter, Lerninhalte A-Schein, Theorie-/Praxisprüfung zum beschränkten Luftfahrerschein vor einem Prüfer des DHV', goal: 'beschränkter Luftfahrerschein (A-Schein), selbständiges Fliegen in fast allen Geländen weltweit, innerhalb des Gleitwinkelbereiches vom Startplatz', bgColor: '#ffd700' },
    { name: 'B-Schein', duration: 'Integriert in eine Flugreise oder Fortbildung', content: '20 Höhenflüge, Lerninhalte für den unbeschränkten Luftfahrerschein Theorieprüfung zum unbeschränkten Luftfahrerschein vor einem Prüfer des DHV', goal: 'Unbeschränkter Luftfahrerschein (B-Schein), selbständiges Fliegen in allen Fluggeländen Europas, Streckenflugberechtigung', bgColor: '#e58e26' },
    { name: 'Tandemschein', duration: '', content: '40 Höhenflüge mit einem Passagier, Lerninhalte Passagierflug, Theorie-/Praxisprüfung zur Passagierflugberechtigung vor einem Prüfer des DHV', goal: 'Passagierflugberechtigung, selbständiges Passagierfliegen', bgColor: '#c4c5ca' },
  ],
};

export const Ausbildungskonzept = ({ contentId }: { contentId?: string } = {}) => {
  const { open } = useLightbox();
  const [content, setContent] = useState<AusbildungskonzeptData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'ausbildungskonzept'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Ausbildungskonzept content:', err));
  }, [contentId]);

  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto">

          <div className="mb-12">
            <h1 className="font-luxury text-4xl md:text-5xl text-[#53a8c7] uppercase tracking-wider mb-2">
              {content.heading}
            </h1>
            <div className="w-full h-px bg-[#53a8c7]/30"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column (Content) */}
            <div className="lg:col-span-5 space-y-8">
              <h3 className="font-luxury text-2xl text-luxury-dark italic">
                {content.subheading}
              </h3>

              <div className="space-y-6 text-gray-600 font-light leading-relaxed text-justify">
                <p>
                  {content.paragraph1}
                </p>
                <p>
                  {content.paragraph2}
                </p>

                <ul className="list-disc pl-5 space-y-2 text-[15px]">
                  {content.bulletPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>

                <SafeHtml html={content.pathsHtml} />
              </div>
            </div>

            {/* Right Column (Graphic and Table) */}
            <div className="lg:col-span-7 flex flex-col items-end">

              {/* Graphic - old site's mediabox plugin puts a magnifier badge in
                  the bottom-right corner of every zoomable content image. */}
              <div className="w-full max-w-2xl mb-2">
                <div
                  className="relative group/zoom cursor-zoom-in"
                  onClick={() => open(content.graphicImage, 'Ausbildungswege Grafik')}
                >
                  <img
                    src={content.graphicImage}
                    alt="Ausbildungswege Grafik"
                    className="w-full object-contain"
                  />
                  <div className="absolute bottom-2 right-2 flex items-center justify-center">
                    <Search className="w-6 h-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" />
                  </div>
                </div>
                <p className="text-center text-gray-500 text-sm mt-1">
                  {content.graphicCaption}
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
                    {content.tableRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`text-black ${idx < content.tableRows.length - 1 ? 'border-b border-white/20' : ''}`}
                        style={{ backgroundColor: row.bgColor }}
                      >
                        <td className="py-4 px-4 align-top">
                          {row.name && <div className="font-bold">{row.name}</div>}
                          {row.duration && row.duration.split('\n').map((line, lineIdx) => (
                            <div key={lineIdx}>{line}</div>
                          ))}
                        </td>
                        <td className="py-4 px-4 align-top">
                          {row.content}
                        </td>
                        <td className="py-4 px-4 align-top">
                          {row.goal}
                        </td>
                      </tr>
                    ))}
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
