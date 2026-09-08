import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  image: string;
  text?: string;
  linkUrl?: string;
}

// Cycled per-slide (not randomized, so the layout is stable across
// re-renders) to mimic the old site's "Camera" slideshow choosing a random
// zoom anchor corner per slide - zooming toward a corner instead of the
// center is what actually reads as a Ken Burns pan+zoom.
const KENBURNS_ORIGINS = ['top left', 'bottom right', 'top right', 'bottom left'];

const BANNER_SLIDES: BannerSlide[] = [
  {
    image: 'https://picsum.photos/id/1018/1920/1080',
    text: 'Über den Zuckerrohrfeldern in Kolumbien'
  },
  {
    image: 'https://picsum.photos/id/1036/1920/1080',
    text: 'Sicherheitstraining am Gardasee'
  },
  {
    image: 'https://picsum.photos/id/1043/1920/1080',
    // No text plate for this one
  },
  {
    image: 'https://picsum.photos/id/1044/1920/1080',
    text: 'Genuss unter den Wolken'
  },
  {
    image: 'https://picsum.photos/id/1050/1920/1080',
    text: 'Fliegen im Sommer an der Düne...'
  },
  {
    image: 'https://picsum.photos/id/1060/1920/1080',
    text: '... und im Winter im Schnee'
  },
  {
    image: 'https://picsum.photos/id/1070/1920/1080',
    // No text plate for this one
  },
  {
    image: 'https://picsum.photos/id/1080/1920/1080',
    text: 'Traumhafte Ausblicke von ganz oben'
  }
];

export const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(BANNER_SLIDES);
  // The curated default slides are all known 1920x1080 (16:9), so a corner
  // zoom/pan never crops the actual subject out of frame - but admin-
  // uploaded CMS banners can be any aspect ratio (e.g. a portrait photo),
  // where anchoring bg-cover to a corner risks cropping the subject. Only
  // apply the corner pan to the curated defaults; CMS slides get a safe
  // center anchor instead.
  const [isDynamic, setIsDynamic] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners/public');
        if (res.ok) {
          const data = await res.json();
          const topBanners = data.filter((b: any) => b.position === 'home_top');

          if (topBanners.length > 0) {
            const dynamicSlides = topBanners.map((b: any) => ({
              image: b.imageUrl,
              text: b.title,
              linkUrl: b.linkUrl
            }));

            // Mix static and dynamic, or just replace
            // Replacing if dynamic exists is usually preferred for CMS control
            setIsDynamic(true);
            setSlides(dynamicSlides);
          }
        }
      } catch (err) {
        console.error('Failed to fetch banners', err);
      }
    };
    fetchBanners();
  }, []);

  // If the CMS fetch above replaces `slides` with a shorter array than
  // whatever the user (or the 7s autoplay) had already scrolled to,
  // `currentSlide` can end up pointing past the end - every slide's
  // `index === currentSlide` check then fails at once, so the banner shows
  // no image at all until the next click or autoplay tick self-heals it.
  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-play functionality - 7s dwell time matches the old site's Camera
  // slideshow (`time: 7000` in its config)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlideData = slides[currentSlide] || slides[0];

  if (!currentSlideData) return null;

  return (
    <section className="relative w-full h-[calc(100vh-80px)] min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center text-center text-white overflow-hidden group">
      
      {/* Background Images - Ken Burns effect, matching the old site's real
          "Camera" jQuery slideshow (mod_slideshowck) behaviour: a plain
          simultaneous crossfade (1.5s, linear - both slides move together,
          not sequentially) plus a zoom that pans toward a randomly-chosen
          corner per slide (via transform-origin) rather than a flat
          center-zoom, which is what actually gives it that diagonal
          "Ken Burns" motion instead of just growing in place. */}
      {slides.map((slide, index) => {
        const origin = isDynamic ? 'center center' : KENBURNS_ORIGINS[index % KENBURNS_ORIGINS.length];
        return (
          <div
            key={index}
            className={`absolute inset-0 overflow-hidden transition-opacity duration-[3000ms] ease-linear ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-no-repeat ${
                index === currentSlide ? 'kenburns-active' : ''
              }`}
              style={{ backgroundImage: `url("${slide.image}")`, backgroundPosition: origin, transformOrigin: origin }}
            ></div>
            {/* Subtle overlay for text readability */}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        );
      })}

      {/* Name Plate Container - Aligned to bottom left of container */}
      <div className="absolute inset-0 z-20 flex items-end pb-24 md:pb-32">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px] w-full flex justify-start">
          
          {/* Conditionally render Name Plate */}
          {currentSlideData.text && (
            <div className="bg-[#53a8c7]/90 inline-flex items-center gap-3 md:gap-5 pl-4 pr-10 py-3 md:py-4 max-w-full backdrop-blur-[2px]">
              {/* Logo from google.png - Filtered to be pure white */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[2px] border-white flex items-center justify-center shrink-0">
                <img 
                  src="/google.png" 
                  alt="Logo" 
                  className="w-6 h-6 md:w-8 md:h-8 object-contain brightness-0 invert opacity-100" 
                />
              </div>
              
              {/* Italic Text */}
              {currentSlideData.linkUrl ? (
                <a href={currentSlideData.linkUrl} target="_blank" rel="noopener noreferrer" className="text-white text-xl md:text-[24px] lg:text-[28px] italic font-semibold tracking-wide drop-shadow-sm text-left leading-tight truncate hover:underline">
                  {currentSlideData.text}
                </a>
              ) : (
                <p className="text-white text-xl md:text-[24px] lg:text-[28px] italic font-semibold tracking-wide drop-shadow-sm text-left leading-tight truncate">
                  {currentSlideData.text}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons (Simple thin arrows like in screenshot) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center text-white hover:text-white/80 transition-colors drop-shadow-md"
        aria-label="Vorheriges Bild"
      >
        <ChevronLeft className="w-10 h-10 md:w-12 md:h-12 stroke-[1.5]" />
      </button>

      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center text-white hover:text-white/80 transition-colors drop-shadow-md"
        aria-label="Nächstes Bild"
      >
        <ChevronRight className="w-10 h-10 md:w-12 md:h-12 stroke-[1.5]" />
      </button>

    </section>
  );
};
