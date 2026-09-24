import { useState, useEffect } from 'react';
import { Banner } from '../components/common/Banner';

// Fallbacks match the page's current live copy exactly, so nothing changes
// visually until an admin edits something in Admin > Seiten > Medien (see
// backend SitePageContent model / sitePageContent.routes.ts).
const DEFAULT_CONTENT = {
  heading: 'MEDIEN',
  leftHeading: 'Events und Reisen',
  leftVideoUrl: 'https://www.youtube.com/embed/videoseries?list=PLhgO8bAZR5WcQpilBTfbEs0u0e9h0Yxg9',
  rightHeading: 'Infos rund ums Gleitschirmfliegen',
  rightVideoUrl: 'https://www.youtube.com/embed/videoseries?list=PLhgO8bAZR5We5CYDd5HqNZE04ehUf4yZU',
};

export const Medien = ({ contentId }: { contentId?: string } = {}) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`/api/sitepagecontent/public/${contentId || 'medien'}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setContent(data); })
      .catch((err) => console.error('Error fetching Medien content:', err));
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

            {/* Left Column (Events und Reisen) */}
            <div>
              <h2 className="text-2xl text-gray-700 font-light mb-6">{content.leftHeading}</h2>
              <div className="relative w-full aspect-video rounded-sm overflow-hidden shadow-lg border border-gray-100">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={content.leftVideoUrl}
                  title={content.leftHeading}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Right Column (Infos rund ums Gleitschirmfliegen) */}
            <div>
              <h2 className="text-2xl text-gray-700 font-light mb-6">{content.rightHeading}</h2>
              <div className="relative w-full aspect-video rounded-sm overflow-hidden shadow-lg border border-gray-100">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={content.rightVideoUrl}
                  title={content.rightHeading}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
