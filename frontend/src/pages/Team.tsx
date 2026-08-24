import { Banner } from '../components/common/Banner';
import { Link } from 'react-router-dom';

const TEAM_MEMBERS = [
  {
    name: "Alexander Schlink",
    image: "https://picsum.photos/id/1025/400/400",
    certificate: "https://picsum.photos/id/1026/400/600",
    paragraphs: [
      "Alex ist Fluglehrer, DHV-Performance-Trainer und Inhaber der Flugschule. Er ist stellvertretender Ausbildungsleiter bei Hirondelle sowie als DHV-Prüfer tätig und kann Prüfungen zum A-Schein, B-Schein sowie Winde und Tandem abnehmen.",
      "Er ist euer Ansprechpartner für alle Anliegen: ob Aus- oder Fortbildung, Ausrüstung / Material sowie auch die Organisation und Durchführung der zahlreichen Touren und Reisen innerhalb Deutschlands und weltweit über die Grenzen hinweg.",
      "Nach geleistetem Wehrdienst als Fallschirmjäger und diversen exzessiv ausgeführten Hobbys (Fallschirmspringen, Motorradfahren, Tauchen,...) musste während des Studiums eine neue Herausforderung her. So hat er den Vorschlag eines Kommilitonen, es doch mal mit Gleitschirmfliegen zu probieren, zunächst nur belächelt. Und am Ende aber doch zu seiner Leidenschaft gefunden!",
      "Seine fliegerische Karriere hat im Frühjahr 2005 auf dem Übungshang begonnen. Die Prüfung zum A-Schein machte er im März 2005. Alex hat mittlerweile alle Scheine, die man im Gleitschirmbereich besitzen kann... Neben dem B-Schein hat er zusätzlich den Windenfachlehrer, Windenfahrer, die Passagierflugberechtigung, Prüferlizenz und hat auch die \"Moschilizenz\" (Motorschirmlizenz).",
      "Am Liebsten fliegt Alex in seiner Heimat in der Südpfalz - 7 Berge an der Zahl hat er im Pfälzer Wald quasi direkt vor seiner Haustür und nutzt diese so oft es seine Zeit erlaubt, um in die Luft oder auf Strecke zu gehen."
    ]
  },
  {
    name: "Sarah Fuhrmann",
    image: "https://picsum.photos/id/1027/400/400",
    paragraphs: [
      "Sarah ist Fluglehrerin und Ausbildungsleiterin der Flugschule. Sie ist unsere Quotenfrau und das Küken im Team Hirondelle, was die fliegerische Karriere betrifft. Als sie Alex kennen lernte war sofort klar: \"Das muss ich auch mal probieren!\" Nach dem ersten Tandemflug in Bezau stand die Entscheidung zum Schnupperkurs und dann dem eigenen Schein. Bald wurden die Berge zu Sarah's neuer Bühne und die früheren Tanzschuhe endgültig an den Nagel gehängt.",
      "Arbeiten, wo andere Urlaub machen, dachte sie sich 2017, hat ihrem früheren Job den Rücken gekehrt, und engagiert sich seitdem Vollzeit in der Flugschule. Nach dem B-Schein kam 2018 die Ausbildung zur Windenführerin. Mit mittlerweile weit über 3.000 durchgeführten Windenschlepps - seit 2022 auf unserer Elektrowinde - und Unterstützung bei Grundkursen, Höhenflugschulungen und den weltweit durchgeführten Reisen hat sie immer mehr Erfahrung in der Gleitschirmausbildung gesammelt. 2022 hat sie daher die Ausbildung zur Fluglehrerin begonnen und diese Ende 2023 erfolgreich abgeschlossen. Seit 2024 ist sie außerdem die Ausbildungsleiterin der Flugschule.",
      "Die Marketing-Frau von der Zeitung kümmert sich außerdem um Text und Bild. Homepage, Flyer und mehr sind ihr Metier. Und auch die Ausschreibungen und Theorieskripte entspringen ihrer Feder."
    ]
  },
  {
    name: "Mathias „Tobi“ Leipner",
    image: "https://picsum.photos/id/1028/400/400",
    paragraphs: [
      "Schon als Kind hat sich Tobi fürs Fliegen und ferngesteuerte Modellflugzeuge interessiert. 2002 war es dann soweit und er ist beim Schnupperkurs im Allgäu mit dem Gleitschirm selbst das erste Mal abgehoben. Seit dieser Zeit hat ihn diese intensive Erfahrung nicht mehr losgelassen. Das Erlebnis und die Faszination, selbständig nur mit den Kräften der Natur stundenlang über weite Strecken durch die Luft zu segeln, bringen ihm Ruhe und lassen ihn zeitweise alles unter sich vergessen – es ist wie Meditation.",
      "In den Jahren folgten B-Schein, Tandemausbildung und der Fluglehrer. Seitdem freut er sich immer über die strahlenden Gesichter der Flugschüler, wenn diese ihre ersten Hüpfer am Übungshang gemacht haben.",
      "Tobi fliegt sowohl in der Pfalz als auch an der Bergstraße in heimischer Luft, aber er kreist auch unter anderem gerne in Spanien mit den Geiern Auge in Auge im Thermikbart.",
      "Wir sehen uns am Berg."
    ]
  },
  {
    name: "Holger Grimm",
    image: "https://picsum.photos/id/1029/400/400",
    paragraphs: [
      "Die Leidenschaft fürs Fliegen wurde Holger wohl in die Wiege gelegt. Anstatt des Traumberufs Luft- und Raumfahrttechniker wurde er dann aber doch Bürohengst. Doch Träume sterben nie und so hat er irgendwann nach dem B-Schein dann doch den Wunsch, Fluglehrer zu werden, in die Tat umgesetzt. Denn es gibt nichts Schöneres, als die Jubelschreie der Flugschüler/innen nach dem ersten Flug am Übungshang oder nach dem ersten \"richtigen\" Höhenflug zu erleben.",
      "Am Liebsten fliegt Holger in den Alpen oder in der Pfalz. Bei Flugreisen gilt in doppeltem Sinn: je weiter desto besser."
    ]
  },
  {
    name: "Karl-Peter Armbrust",
    image: "https://picsum.photos/id/1031/400/400",
    certificate: "https://picsum.photos/id/1032/400/600",
    paragraphs: [
      "Irgendwann in den 90ern sah er bei einer langen Motorradtour durch Frankreich auf der Spitze des Puy de dome bei Clermont Ferrand eine Horde Kinder mit seltsamen Fluggeräten jauchzend in der Luft rumturnen – die Eltern kreidebleich daneben, die Lehrer auch ;-) Damals kam die Idee, das auch zu tun; Jahre später dann die Realisierung: 2002 A-Schein mit Startart Hang und Winde, 2004 B-Schein und Windenführer, 2005 Passagierberechtigung mit Startart Hang und Winde. Nach vielen Reisen kam die Entscheidung, das Ganze ernsthaft anzugehen und 2014 die Ausbildung zum Fluglehrerassistenten zu absolvieren. Mittlerweile ergänzt Karl-Peter als Fluglehrer, Performance Trainer und Windenfachlehrer das Team.",
      "Ach ja, Fliegen tut er auch noch gerne und zwar am Liebsten hier in Rheinland-Pfalz und dem Saarland – auch gerne ganz drüber weg ;-)"
    ]
  },
  {
    name: "Markus Häcker – unser Tandem-Ass",
    image: "https://picsum.photos/id/1033/400/400",
    paragraphs: [
      "Markus ist schon immer in luftigen Höhen zu finden. Anfangs über die Modellfliegerei mit 14 Jahren bei den Segelfliegern, zwischendurch im Leistungssport Hoch- und Stabhochsprung. 1986 begann er mit dem Drachenfliegen und ging nahtlos 1989 zu den Pionieren der Gleitschirmfliegerei über. Mit einer über 25-jährigen Gleitschirmerfahrung hat er alle Epochen der Schirmentwicklungen mitgemacht. In den letzten Jahren konzentriert er sich sehr stark auf die Tandemfliegerei.",
      "Seine Passagiere steigen immer mit einem breiten Grinsen im Gesicht aus dem Gurtzeug mit der Aussage: „super geil, das war nicht das letzte Mal\"!"
    ]
  }
];

const SHOP_BRANDS = [
  { name: 'Ozone', img: 'https://picsum.photos/id/1035/200/100' },
  { name: 'Advance', img: 'https://picsum.photos/id/1036/200/100' },
  { name: 'Niviuk', img: 'https://picsum.photos/id/1037/200/100' },
  { name: 'Phi', img: 'https://picsum.photos/id/1038/200/100' },
  { name: 'Independence', img: 'https://picsum.photos/id/1039/200/100' },
  { name: 'Skyman', img: 'https://picsum.photos/id/1040/200/100' },
];

export const Team = () => {
  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-8 md:pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Flugschule Hirondelle Intro */}
            <div>
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                INFOS
              </p>
              <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase mb-6">
                DIE FLUGSCHULE HIRONDELLE
              </h1>
              <div className="w-24 h-px bg-luxury-gold mb-8"></div>
              
              <div className="text-gray-600 font-light space-y-6 leading-relaxed text-[15px]">
                <p>
                  Die Flugschule Hirondelle wurde 2005 gegründet ist seitdem aufs Gleitschirmfliegen spezialisiert. Ob Aus- und Weiterbildung, Ausrüstung oder Reisen – wir sind dein Ansprechpartner für alle Anliegen rund ums Fliegen!
                </p>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                
                {/* Ausbildung & Performance */}
                <div>
                  <h3 className="text-xl font-luxury text-luxury-dark italic mb-4">Ausbildung & Performance</h3>
                  <p className="text-[14px] text-gray-600 font-light leading-relaxed">
                    Unser Ziel ist es, unsere Schüler zu „selbständigen Piloten" auszubilden, die nach ihrer Ausbildung eigenständig fliegen und den Traum vom Fliegen wahr werden lassen können. Vom <Link to="/ausbildung/a-schein" className="text-[#53a8c7] hover:text-luxury-gold transition-colors font-medium">Grundkurs</Link> über den <Link to="/ausbildung/a-schein" className="text-[#53a8c7] hover:text-luxury-gold transition-colors font-medium">A-Schein</Link> bis zum <Link to="/ausbildung/b-schein" className="text-[#53a8c7] hover:text-luxury-gold transition-colors font-medium">B-Schein</Link> (Unbeschränkter Luftfahrerschein / Überlandflugberechtigung) werdet ihr von Fluglehrern aus unserem Team begleitet und profitiert durch die Trainervielfalt von deren unterschiedlichen Stärken sowie individueller Tipps und Erfahrungen. Wir bieten nicht die klassische 0-8-15-Ausbildung sondern eine individuelle Ausbildung nach Maß für jedermann.
                  </p>
                </div>

                {/* Reisen */}
                <div>
                  <h3 className="text-xl font-luxury text-luxury-dark italic mb-4">Reisen</h3>
                  <p className="text-[14px] text-gray-600 font-light leading-relaxed">
                    Unsere <Link to="/reisen" className="text-[#53a8c7] hover:text-luxury-gold transition-colors font-medium">Reisen</Link> führen uns in die bekannten Fluggebiet-Hotspots. So zählt <Link to="/reisen/bassano-tour" className="text-[#53a8c7] hover:text-luxury-gold transition-colors font-medium">Bassano</Link> – das Mekka der Gleitschirmszene – jährlich fest zum Programm. Aber auch entlegene Ziele wollen wir euch nicht vorenthalten und bieten euch Reisen nach <Link to="/reisen/suedafrika-tour" className="text-[#53a8c7] hover:text-luxury-gold transition-colors font-medium">Südafrika</Link> und weiteren besonderen Zielen weltweit an. Im Rahmen unserer <Link to="/reisen" className="text-[#53a8c7] hover:text-luxury-gold transition-colors font-medium">Reisen</Link> könnt ihr unter Fluglehrerbetreuung sehr viel Erfahrung sammeln, eure Flugtechnik verbessern und zahlreiche großartige Flugstunden genießen.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Das Team Section (Full Width Grid Wrapper for each member) */}
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px] pt-16 mt-8 border-t border-gray-100">
          <h2 className="font-luxury text-3xl md:text-4xl text-luxury-dark uppercase mb-6">
            DAS TEAM
          </h2>
          <div className="w-24 h-px bg-luxury-gold mb-16"></div>

          <div className="space-y-16">
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-gray-100 pb-16 last:border-0 last:pb-0">
                
                {/* Profile Info (Left 8 cols) */}
                <div className="lg:col-span-8 flex flex-col md:flex-row gap-8 items-start">
                  {/* Profile Image */}
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 shadow-lg border-2 border-white/50 bg-gray-100 md:mt-2">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Profile Text */}
                  <div className="text-gray-600 font-light space-y-4 leading-relaxed text-[15px]">
                    <h3 className="text-2xl font-luxury text-luxury-dark italic mb-2">{member.name}</h3>
                    {member.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Certificate if exists (Right 4 cols) */}
                {member.certificate ? (
                  <div className="lg:col-span-4 flex justify-center lg:justify-end items-start pt-4 lg:pt-0">
                    <div className="bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-sm border border-gray-100 w-full max-w-[280px]">
                      <img 
                        src={member.certificate} 
                        alt={`${member.name} Zertifikat`} 
                        className="w-full h-auto object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700 opacity-90"
                      />
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-3 text-center">
                        DHV Zertifiziert
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="lg:col-span-4 hidden lg:block"></div>
                )}
                
              </div>
            ))}
          </div>
        </div>

        {/* Shop Section */}
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px] pt-16 mt-8">
          <h2 className="text-2xl font-luxury text-luxury-dark uppercase mb-4">Shop</h2>
          
          <div className="lg:col-span-8">
            <p className="text-[15px] text-gray-600 font-light leading-relaxed mb-10 max-w-4xl">
              In unserem Shop findest du alles rund um deine Ausrüstung! Wir haben die Produkte der führenden Gleitschirmhersteller in unserem Programm. Gerne beraten wir dich in unserer Flugschule. Zu unseren <Link to="/infos#kontakt" className="text-[#53a8c7] hover:text-luxury-gold transition-colors font-medium">Öffnungszeiten...</Link>
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {SHOP_BRANDS.map((brand, idx) => (
                <div key={idx} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-sm p-4 flex items-center justify-center aspect-[3/2] group cursor-pointer">
                  <img 
                    src={brand.img} 
                    alt={brand.name} 
                    className="w-full h-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};
