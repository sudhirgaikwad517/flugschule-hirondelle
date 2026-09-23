import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';

interface LinkItem {
  label: string;
  url: string;
}

interface WetterData {
  heading: string;
  kachelmannLinks: LinkItem[];
  weitereLinksHeading: string;
  pfalzLabel: string;
  raspkartenLabel: string;
  raspkartenLinkText: string;
  raspkartenUrl: string;
  appsHeading: string;
  windfinderLabel: string;
  windfinderIosUrl: string;
  windfinderAndroidUrl: string;
  regenradarLabel: string;
  regenradarIosUrl: string;
  regenradarAndroidUrl: string;
}

const DEFAULT_CONTENT: WetterData = {
  heading: 'WETTER',
  kachelmannLinks: [
    { label: 'Kachelmann Wetter Weinbiet 4-Tage Prognose', url: '' },
    { label: 'Kachelmann Wetter Landau 4-Tage Prognose', url: '' },
    { label: 'Kachelmann Wetter Michelstadt-Vielbrunn 4-Tage Prognose', url: '' },
    { label: 'Kachelmann Wetter Kirchheimbolanden 4-Tage Prognose', url: '' },
    { label: 'Kachelmann Wetter Mannheim 4-Tage Prognose', url: '' },
  ],
  weitereLinksHeading: 'Weitere Links',
  pfalzLabel: 'Pfalz:',
  raspkartenLabel: 'Raspkarten -Thermik-Karten',
  raspkartenLinkText: '[ mehr ]',
  raspkartenUrl: '',
  appsHeading: 'Nützliche Smartphone Apps:',
  windfinderLabel: 'Windfinder (der Name ist Programm)',
  windfinderIosUrl: '',
  windfinderAndroidUrl: '',
  regenradarLabel: 'RegenRadar (Darstellung Fronten/Schauer)',
  regenradarIosUrl: '',
  regenradarAndroidUrl: '',
};

export const Wetter = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState<WetterData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'wetter'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Wetter content:', err));
  }, [contentId]);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">

          {/* Main Title */}
          <div className="mb-16">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              {content.heading}
            </h1>
            <div className="w-24 h-px bg-luxury-gold"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

            {/* Left Column (Main Links) */}
            <div className="lg:col-span-8">
              <ul className="space-y-12">
                {content.kachelmannLinks.map((link, index) => (
                  <li key={index} className="group relative">
                    <a
                      href={link.url || '#'}
                      className="block text-gray-600 italic text-[15px] md:text-lg hover:text-luxury-gold transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column (Weitere Links & Apps) */}
            <div className="lg:col-span-4">

              <div className="mb-12">
                <h3 className="italic text-xl md:text-2xl text-gray-700 font-luxury mb-6">{content.weitereLinksHeading}</h3>

                <div className="mb-8">
                  <p className="text-[15px] text-gray-700 mb-1">{content.pfalzLabel}</p>
                  <p className="text-[14px] italic text-gray-500">
                    {content.raspkartenLabel}{' '}
                    <a href={content.raspkartenUrl || '#'} className="text-[#53a8c7] hover:text-luxury-gold not-italic ml-1 transition-colors">
                      {content.raspkartenLinkText}
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="italic text-[15px] font-bold text-gray-700 mb-4">{content.appsHeading}</h3>

                <div className="mb-6">
                  <p className="text-[14px] italic text-gray-500 mb-1">
                    {content.windfinderLabel}
                  </p>
                  <p className="text-[14px] text-gray-500">
                    für{' '}
                    <a href={content.windfinderIosUrl || '#'} className="text-[#53a8c7] hover:text-luxury-gold italic transition-colors">iOS</a>
                    {' '}oder{' '}
                    <a href={content.windfinderAndroidUrl || '#'} className="text-[#53a8c7] hover:text-luxury-gold italic transition-colors">Android</a>
                  </p>
                </div>

                <div>
                  <p className="text-[14px] italic text-gray-500 mb-1">
                    {content.regenradarLabel}
                  </p>
                  <p className="text-[14px] text-gray-500">
                    für{' '}
                    <a href={content.regenradarIosUrl || '#'} className="text-[#53a8c7] hover:text-luxury-gold italic transition-colors">iOS</a>
                    {' '}oder{' '}
                    <a href={content.regenradarAndroidUrl || '#'} className="text-[#53a8c7] hover:text-luxury-gold italic transition-colors">Android</a>
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
