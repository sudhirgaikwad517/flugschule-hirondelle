import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

interface StornoRow { label: string; value: string }
interface InsuranceLink { label: string; url: string }
interface VersicherungenData {
  heading: string;
  subheading: string;
  paragraph1: string;
  paragraph2Html: string;
  stornoIntro: string;
  stornoRows: StornoRow[];
  paragraph3Html: string;
  paragraph4: string;
  seminarParagraphHtml: string;
  seminarUrl: string;
  reiseParagraph1Html: string;
  reiseParagraph2: string;
  insuranceLinks: InsuranceLink[];
  closingParagraph: string;
  image: string;
}

// Fallback matches the page's current live copy exactly (see backend
// SitePageContent `versicherungen` DEFAULTS / sitePageContent.routes.ts).
const DEFAULT_CONTENT: VersicherungenData = {
  heading: 'VERSICHERUNGEN',
  subheading: 'Irgendwas ist immer - kurzfristig krank, und nun?',
  paragraph1: 'Ihr freut euch seit Wochen auf den Kurs und könnt aufgrund Krankheit nicht teilnehmen? Wir wollen euch eine gute Ausbildung ermöglichen und setzen daher in unseren Schulungen auf kleinere Gruppen, um eine individuelle Betreuung zu gewährleisten. Daher sind unsere Plätze limitiert und oft ausgebucht, und wir können euch bei kurzfristigen Absagen kein Geld nachlassen oder gar zurück erstatten.',
  paragraph2Html: 'Seit Coronoa haben wir immer wieder und deutlich verstärkt mit kurzfristigen Absagen und Stornos zu kämpfen. Bitte beachtet deshalb, dass eine Teilnahme bei unseren Kursen und Reisen verbindlich ist, mit eurer Kursbuchung bestätigt ihr unsere <a href="/agb">AGB</a> mit den Stornobedinungen. Hier ein Auszug:',
  stornoIntro: '7.5 Der pauschalierte Anspruch auf Rücktrittsgebühren beträgt in der Regel bei Stornierungen:',
  stornoRows: [
    { label: 'bis 4 Wochen vor Kursbeginn:', value: '25 %' },
    { label: 'bis 3 Wochen vor Kursbeginn:', value: '50 %' },
    { label: 'bis 2 Wochen vor Kursbeginn:', value: '75 %' },
    { label: 'bis 1 Woche vor Kursbeginn:', value: '100 %' },
  ],
  paragraph3Html: 'Hier findet ihr die <a href="/agb">AGB</a> in voller Länge.',
  paragraph4: 'Wir wollen euch aber nicht im Regen stehen lassen und arbeiten mit einer Versicherung zusammen, über die ihr euch für den Fall der Fälle absichern könnt.',
  seminarParagraphHtml: "Zur Teilnahme an unseren Kursen könnt ihr also eine Seminarversicherung für kleines Geld abschließen, die den Seminarpreis abdeckt. Hier geht's zur <strong>Seminarversicherung</strong>:",
  seminarUrl: 'https://secure.hmrv.de/rvw-ba/initBa.jsp?baid=68&locale=de_DE&adnr=4226825&aid=MAK126713',
  reiseParagraph1Html: 'Für unsere Reisen empfehlen wir euch außerdem <strong>Reiseversicherungen</strong> für Reiserücktritt-/Abbruch, Gepäck bzw. Auslandskrankenversicherung.',
  reiseParagraph2: "Hier geht's zu den Versicherungen:",
  insuranceLinks: [
    { label: 'Reiserücktritt/-abbruchversicherung', url: 'https://secure.hmrv.de/rvw-ba/initBa.jsp?baid=912&locale=de_DE&adnr=4226825&aid=MAK126713' },
    { label: 'Jahres-Auslandskrankenversicherung (für beliebig viele Reisen bis 56 Tage)', url: 'https://secure.hmrv.de/rvw-ba/initBa.jsp?baid=62&subBaId=2&locale=de_DE&adnr=4226825&aid=MAK126713' },
    { label: 'Reisegepäckversicherung', url: 'https://secure.hmrv.de/rvw-ba/initBa.jsp?baid=52&locale=de_DE&adnr=4226825&aid=MAK126713' },
  ],
  closingParagraph: 'So seid ihr optimal abgesichert und könnt euch ohne Risiko auf euren gebuchten Kurs freuen :-)',
  image: '/images/inhalte/hirondelle_staysafe.jpg',
};

const linkClass = 'text-[#428bca] hover:text-[#2a6496] hover:underline font-medium';
// SafeHtml renders inner <a>/<strong> tags without their own classes, so the
// link styling used everywhere else on this page needs to be expressed as
// Tailwind arbitrary-variant selectors (one per utility) targeting the
// nested tag, not a single template-interpolated multi-class string.
const safeHtmlLinkClass = '[&_a]:text-[#428bca] [&_a]:hover:text-[#2a6496] [&_a]:hover:underline [&_a]:font-medium';
const safeHtmlStrongClass = '[&_strong]:font-semibold';

export const Versicherungen = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<VersicherungenData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'versicherungen'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Versicherungen content:', err));
  }, [contentId]);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">

          {/* Main Title */}
          <div className="mb-12">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              {content.heading}
            </h1>
            <div className="w-full h-px bg-[#53a8c7] opacity-40"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left Column (Text Content) */}
            <div className="lg:col-span-7 xl:col-span-8">

              <h2 className="italic text-xl md:text-2xl text-gray-700 font-luxury mb-6">
                {content.subheading}
              </h2>

              <div className="space-y-6 text-[15px] text-gray-600 font-light leading-relaxed mb-8">
                <p>{content.paragraph1}</p>
                <SafeHtml html={content.paragraph2Html} className={safeHtmlLinkClass} />
              </div>

              {/* Storno Table / List */}
              <div className="mb-8 pl-4 md:pl-8">
                <p className="italic text-gray-700 mb-4 font-medium text-[15px]">
                  {content.stornoIntro}
                </p>
                <div className="space-y-1 text-gray-600 italic text-[15px]">
                  {content.stornoRows.map((row, i) => (
                    <div className="flex" key={i}>
                      <span className="w-56 md:w-64">{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 text-[15px] text-gray-600 font-light leading-relaxed mb-10">
                <SafeHtml html={content.paragraph3Html} className={safeHtmlLinkClass} />
                <p>{content.paragraph4}</p>
              </div>

              <div className="w-full h-px bg-gray-200 mb-8"></div>

              <div className="text-[15px] text-gray-600 font-light leading-relaxed mb-8">
                <p>
                  <SafeHtml html={content.seminarParagraphHtml} className={`inline ${safeHtmlStrongClass}`} />{' '}
                  <a href={content.seminarUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    https://secure.hmrv.de
                  </a>
                </p>
              </div>

              <div className="w-full h-px bg-gray-200 mb-8"></div>

              <div className="space-y-6 text-[15px] text-gray-600 font-light leading-relaxed mb-10">
                <SafeHtml html={content.reiseParagraph1Html} className={safeHtmlStrongClass} />
                <p>{content.reiseParagraph2}</p>

                <ul className="list-disc pl-5 space-y-2 marker:text-gray-400 font-normal text-gray-700">
                  {content.insuranceLinks.map((item, i) => (
                    <li key={i}>
                      {item.label}{' '}
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {item.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[15px] text-gray-600 font-light leading-relaxed">
                {content.closingParagraph}
              </p>

            </div>

            {/* Right Column (Graphic) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <img
                src={content.image}
                alt="Stay Safe"
                className="w-full h-auto sticky top-32"
              />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
