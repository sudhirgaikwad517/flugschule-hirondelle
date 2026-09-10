import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  image: string;
  text?: string;
  linkUrl?: string;
}

// Old site actually runs two separate slideshow modules (verified against
// the live site's HTML): "top" (id 127) on the home page only, with
// caption text baked into each slide, and "topseite" (id 140) on every
// other page, sharing most of the same photo pool but with NO caption
// text at all. That's why captions only ever appear on the home banner.
const HOME_SLIDES: BannerSlide[] = [
  { image: '/images/headers/slider4.jpg', text: 'Erlebe die Freiheit des Fliegens' },
  { image: '/images/headers/slider_gardasee.jpg', text: 'Sicherheitstraining am Gardasee' },
  { image: '/images/headers/slider_griechenland2.jpg', text: 'Türkisblaues Meer' },
  { image: '/images/headers/slider1.jpg' },
  { image: '/images/headers/sliderbschein.jpg', text: 'Genuss unter den Wolken' },
  { image: '/images/headers/slider11.jpg', text: "Fliegen im Sommer an der Düne..." },
  { image: '/images/headers/P1030577.jpg', text: '... und im Winter im Schnee' },
  { image: '/images/headers/slider_groundhandling.jpg', text: 'Groundhandling auf der Wiese' },
  { image: '/images/headers/P1030623.jpg', text: 'Traumhafte Ausblicke von ganz oben' },
  { image: '/images/headers/slider_bergamo.jpg' },
  { image: '/images/headers/slider_kolumbien1.jpg', text: 'Über den Zuckerrohrfeldern in Kolumbien' },
  { image: '/images/headers/DSC00324.jpg' },
  { image: '/images/headers/slider_pfalz.jpg', text: 'Burgumrundung im Pfälzerwald' },
  { image: '/images/headers/slider2.jpg', text: 'Ausbildung auf höchstem Niveau', linkUrl: '/' },
  { image: '/images/headers/DSC05188.png' },
  { image: '/images/headers/slider_allgu.jpg', text: 'Allgäuer Höhenluft' },
  { image: '/images/headers/slider_brasilien.jpg', text: 'Unter der Sonne Brasiliens' },
  { image: '/images/headers/slider_bassano.jpg', text: 'Bassano - das Mekka der Gleitschirmszene' },
  { image: '/images/headers/slider3.jpg', text: "Doppelt fliegt's besser: Tandemflüge" },
  { image: '/images/headers/slider_griechenland1.jpg', text: 'Griechenland - einmal die Küste abfliegen' },
  { image: '/images/headers/slider_griechenland3.jpg', text: 'Sightseeing von oben' },
  { image: '/images/headers/slider_griechenland4.jpg' },
  { image: '/images/headers/slider_griechenland5.jpg', text: 'Gechillt beim Landecocktail' },
  { image: '/images/headers/slider_kolumbien3.jpg', text: 'Packservice am Landeplatz' },
  { image: '/images/headers/slider_kolumbien4.jpg' },
  { image: '/images/headers/slider_kolumbien5.jpg' },
  { image: '/images/headers/slider_sa6.jpg', text: 'Im Sandkasten Südafrikas' },
  { image: '/images/headers/slider_pfalz2.jpg' },
  { image: '/images/headers/slider_sa4.jpg' },
  { image: '/images/headers/slider_pfalz3.jpg', text: 'Vom Pfälzer Rebenmeer in die Rheinebene' },
  { image: '/images/headers/slider_sa1.jpg' },
  { image: '/images/headers/slider_sa2.jpg', text: 'Paradiesisch an der Paradise Ridge in Südafrika' },
  { image: '/images/headers/slider_sa3.jpg' },
  { image: '/images/headers/slider_spanien.jpg' },
  { image: '/images/headers/slider_slowenien.jpg' },
  { image: '/images/headers/slider_sa5.jpg' },
  { image: '/images/headers/slider_stubai.jpg', text: 'Das Stubaital' },
];

// "topseite" module's slides, in its own order - a different subset of the
// same photo pool, deliberately with no `text` (so no caption box ever
// renders for these, matching the old site's subpages exactly).
const SUBPAGE_SLIDES: BannerSlide[] = [
  { image: '/images/headers/slider11.jpg' },
  { image: '/images/headers/P1030623.jpg' },
  { image: '/images/headers/slider_sa4.jpg' },
  { image: '/images/headers/slider_griechenland4.jpg' },
  { image: '/images/headers/slider_griechenland1.jpg' },
  { image: '/images/headers/slider4.jpg' },
  { image: '/images/headers/slider_bergamo.jpg' },
  { image: '/images/headers/slider_pfalz3.jpg' },
  { image: '/images/headers/slider_sa2.jpg' },
  { image: '/images/headers/slider_spanien.jpg' },
  { image: '/images/headers/slider_kolumbien1.jpg' },
  { image: '/images/headers/slider_sa5.jpg' },
  { image: '/images/headers/slider_bassano.jpg' },
  { image: '/images/headers/slider_pfalz2.jpg' },
  { image: '/images/headers/slider_allgu.jpg' },
  { image: '/images/headers/slider_stubai.jpg' },
  { image: '/images/headers/slider3.jpg' },
  { image: '/images/headers/slider_sa6.jpg' },
  { image: '/images/headers/slider_groundhandling.jpg' },
  { image: '/images/headers/slider2.jpg' },
  { image: '/images/headers/slider_slowenien.jpg' },
  { image: '/images/headers/slider_griechenland3.jpg' },
  { image: '/images/headers/slider_kolumbien3.jpg' },
  { image: '/images/headers/slider_griechenland5.jpg' },
  { image: '/images/headers/slider_pfalz.jpg' },
  { image: '/images/headers/slider_kolumbien4.jpg' },
  { image: '/images/headers/slider1.jpg' },
  { image: '/images/headers/slider_brasilien.jpg' },
  { image: '/images/headers/slider_gardasee.jpg' },
  { image: '/images/headers/P1030577.jpg' },
  { image: '/images/headers/slider_teneriffa.jpg' },
  { image: '/images/headers/slider_sa1.jpg' },
  { image: '/images/headers/slider_kolumbien5.jpg' },
  { image: '/images/headers/slider_griechenland2.jpg' },
];

// Ported from the classic css-101.org Ken Burns technique
// (http://www.css-101.org/articles/ken-burns_effect/css-transition.php):
// each slide's zoom origin cascades through four corners via the same
// nth-child(2n+1)/(3n+1)/(4n+1) overrides (later rule wins, matching CSS
// cascade order), so consecutive slides pan in varied directions instead
// of all zooming from the same corner. `position` is the 1-indexed slot
// (matching :nth-child's 1-indexing).
function transformOriginFor(position: number): string {
  let origin = 'bottom left';
  if (position % 2 === 1) origin = 'top right';
  if (position % 3 === 1) origin = 'top left';
  if (position % 4 === 1) origin = 'bottom right';
  return origin;
}

interface BannerProps {
  // Old site only shows the home page's slideshow with caption text
  // overlaid ("top" module); every other page uses a separate, caption-
  // free slideshow ("topseite" module). Defaulting to 'subpage' means the
  // ~50 other pages that just render <Banner /> need no changes.
  variant?: 'home' | 'subpage';
}

export const Banner = ({ variant = 'subpage' }: BannerProps) => {
  const defaultSlides = variant === 'home' ? HOME_SLIDES : SUBPAGE_SLIDES;
  const [slides, setSlides] = useState(defaultSlides);
  // The curated default slides are all known 1920x1080 (16:9), so a corner
  // zoom/pan never crops the actual subject out of frame - but admin-
  // uploaded CMS banners can be any aspect ratio (e.g. a portrait photo),
  // where anchoring to a corner risks cropping the subject. Only apply the
  // corner pan to the curated defaults; CMS slides get a safe center anchor.
  const [isDynamic, setIsDynamic] = useState(false);

  // The css-101.org reference keeps exactly two slides "active" (its .fx
  // class) at any moment - the newest (fading/zooming in) and the one
  // before it (already fully zoomed in, about to be silently replaced).
  // Removing the older one lets it transition back to rest instead of
  // snapping, but since a newer opaque slide already covers it, that
  // reverse transition is never actually seen. `activeSlides` mirrors that
  // exact two-element sliding window, oldest first.
  const [activeSlides, setActiveSlides] = useState<number[]>([0]);

  useEffect(() => {
    // Only the home page's slideshow is admin-manageable via the CMS
    // banners API (position 'home_top') - subpages always use the fixed
    // caption-free slide set, matching the old site's separate module.
    if (variant !== 'home') return;

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
  }, [variant]);

  // If the CMS fetch above replaces `slides` with a shorter array than
  // whatever was already active, an activeSlides index can end up out of
  // bounds - every slide's active check would then fail at once, blanking
  // the banner until the next tick self-heals it.
  useEffect(() => {
    if (activeSlides.some((i) => i >= slides.length)) setActiveSlides([0]);
  }, [slides, activeSlides]);

  const nextSlide = () => {
    setActiveSlides((prev) => {
      const last = prev[prev.length - 1] ?? 0;
      return [...prev, (last + 1) % slides.length].slice(-2);
    });
  };

  const prevSlide = () => {
    setActiveSlides((prev) => {
      const last = prev[prev.length - 1] ?? 0;
      return [...prev, (last - 1 + slides.length) % slides.length].slice(-2);
    });
  };

  // Auto-play - 6s cycle, matching the reference's setInterval(kenBurns, 6000)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  const currentSlide = activeSlides[activeSlides.length - 1] ?? 0;
  const currentSlideData = slides[currentSlide] || slides[0];

  if (!currentSlideData) return null;

  // Old site computes the slideshow's height as a percentage of its own
  // width, not viewport height - on the home page it spans the full page
  // width (tall), but on every other page it sits inside the boxed content
  // container (~1200px), which comes out noticeably shorter on desktop.
  // Mobile is unaffected since the boxed container is effectively full-
  // width there too, so both variants stay equal below the md breakpoint.
  const heightClasses = variant === 'home'
    ? 'h-[calc(100vh-80px)] min-h-[500px] md:min-h-[600px]'
    : 'h-[calc(100vh-80px)] min-h-[500px] md:h-[75vh] md:min-h-[480px]';

  return (
    <section className={`relative w-full ${heightClasses} flex flex-col items-center justify-center text-center text-white overflow-hidden group`}>

      {/* Background Images - Ken Burns effect ported from the css-101.org
          reference: opacity fades in over 3s while the zoom (scale 1 ->
          1.1) keeps running for 10s (slower than the fade, so it's still
          visibly panning well after the crossfade itself is done), zooming
          toward a per-slide corner via transform-origin rather than the
          center. Exactly two slides carry the "active" state at once
          (activeSlides), matching the reference's own two-slide overlap
          technique instead of a single instantaneous swap. */}
      {slides.map((slide, index) => {
        const rank = activeSlides.indexOf(index); // -1, 0 (older-active) or 1 (newer-active)
        const isActive = rank !== -1;
        const origin = isDynamic ? 'center center' : transformOriginFor(index + 1);
        return (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url("${slide.image}")`,
              backgroundPosition: origin,
              transformOrigin: origin,
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '3000ms, 10000ms',
              transitionTimingFunction: 'ease-out',
              zIndex: rank === 1 ? 2 : rank === 0 ? 1 : 0,
            }}
          >
            {/* Subtle overlay for text readability */}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        );
      })}

      {/* Name Plate Container - Aligned to bottom left of container.
          Old site hides the caption below 630px (.camera_caption_title
          { display: none }) - hidden here below sm (640px) to match. */}
      <div className="absolute inset-0 z-20 hidden sm:flex items-end pb-24 md:pb-32">
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
