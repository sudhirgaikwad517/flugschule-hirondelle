import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';

// /infos/gelaende/bad-kreuznach - one of the 10 Gelände detail pages,
// rebuilt from a single raw-HTML blob into real structured fields (see
// GelaendeArticleContentEditor.tsx's predecessor for why - admin couldn't
// usefully edit one giant HTML textarea). Unlike most of its siblings, the
// source content has a section heading ABOVE the two-column split (not
// inside it), uses a 50/50 column split (not 58/42), has no formal
// "Eckdaten:" box (folded into one line), and has two images instead of
// one - reflected below as-is rather than forced into the other articles'
// shape.

interface EckdatenRow {
  label: string;
  value: string;
}

interface BadKreuznachData {
  title: string;
  sectionHeading: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  mainImage: string;
  anfahrtHeading: string;
  anfahrtText: string;
  parkplatzText: string;
  routeImage: string;
  mapEmbedUrl: string;
}

const DEFAULT_CONTENT: BadKreuznachData = {
  title: 'Bad Kreuznach',
  sectionHeading: 'Schleppgelände "Auf dem unteren Mergesfeld"',
  eckdatenRows: [
    { label: 'Standort', value: '55595 St. Katharinen N 49°52´26” O 07°46´19”' },
    { label: 'Ausrichtung', value: 'SO, NW' },
    { label: 'Schlepplänge', value: '1000m' },
  ],
  routenplanerUrl: 'https://maps.app.goo.gl/EDBjt7yqxjycCQ6K7',
  mainImage: '/images/1-Bilderfuernewsletter/winde_.jpg',
  anfahrtHeading: 'Anfahrt:',
  anfahrtText: 'Koordinaten fürs Navi zur groben Anfahrt: 55595 St. Katharinen, Am Roten Berg.',
  parkplatzText: 'Der Parkplatz zur Schleppstrecke befindet sich je nach Windrichtung am jeweiligen Ende der Schleppstrecke.',
  routeImage: '/images/1-gelaende/Winde_BK.jpg',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1114.0837256408527!2d7.7706789!3d49.8734767!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bdfb851f76b23b%3A0xe949a328638b87aa!2sFluggel%C3%A4nde%20Drachen-%20und%20Gleitsegelclub%20Nahetal!5e1!3m2!1sde!2sde!4v1742289349048!5m2!1sde!2sde',
};

export const BadKreuznach = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<BadKreuznachData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'bad-kreuznach'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Bad Kreuznach content:', err));
  }, [contentId]);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="mb-10">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              {content.title}
            </h1>
            <div className="w-24 h-px bg-luxury-gold"></div>
          </div>

          <h2 className="font-luxury text-2xl md:text-3xl text-luxury-dark mb-8">
            {content.sectionHeading}
          </h2>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Content column */}
            <div className="w-full md:w-1/2 text-[15px] text-gray-600 font-light leading-relaxed">
              <div className="bg-[#FAF9F7] border border-gray-100 rounded-sm p-6 mb-6">
                <p className="font-semibold text-gray-800 mb-2">Eckdaten:</p>
                <div className="space-y-1">
                  {content.eckdatenRows.map((row, i) => (
                    <p key={i}>
                      <span className="font-medium text-gray-700">{row.label}:</span> {row.value}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <a href={content.routenplanerUrl} target="_blank" rel="alternate noopener noreferrer">
                  <img
                    src="/images/Google_Routenplaner_Maps_org.gif"
                    alt="Google Routenplaner Maps org"
                    width={120}
                    height={90}
                  />
                </a>
                <a
                  href={content.routenplanerUrl}
                  target="_blank"
                  rel="alternate noopener noreferrer"
                  className="text-[#428bca] hover:text-[#2a6496] hover:underline font-medium"
                >
                  Routenplaner für Smartphones
                </a>
              </div>

              {content.mainImage && (
                <img src={content.mainImage} alt="Winde Unteres Mergesfeld" className="w-full h-auto rounded-sm my-4" />
              )}

              <p className="font-semibold text-gray-800 mb-1">{content.anfahrtHeading}</p>
              <p className="mb-4">{content.anfahrtText}</p>
              <p className="mb-6">{content.parkplatzText}</p>

              {content.routeImage && (
                <img src={content.routeImage} alt="Winde BK" className="w-full h-auto rounded-sm my-4" />
              )}
            </div>

            {/* Map column */}
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-sm shadow-md overflow-hidden relative border border-gray-200">
                <iframe
                  src={content.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  title="Bad Kreuznach Fluggelände"
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
