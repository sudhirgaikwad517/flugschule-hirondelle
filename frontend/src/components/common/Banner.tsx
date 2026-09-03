import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  image: string;
  text?: string;
  linkUrl?: string;
}

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
            setSlides(dynamicSlides);
          }
        }
      } catch (err) {
        console.error('Failed to fetch banners', err);
      }
    };
    fetchBanners();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlideData = slides[currentSlide] || slides[0];

  if (!currentSlideData) return null;

  return (
    <section className="relative w-full h-[calc(100vh-80px)] min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center text-center text-white overflow-hidden group">
      
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url("${slide.image}")` }}
        >
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      ))}

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

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all rounded-full border border-white/50 ${
              index === currentSlide 
                ? 'w-3 h-3 bg-white border-white scale-110' 
                : 'w-2.5 h-2.5 bg-transparent hover:bg-white/50'
            }`}
            aria-label={`Gehe zu Bild ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
