import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Maximize, Grid3x3, Share2, Download } from 'lucide-react';

export interface LightboxImage {
  src: string;
  alt?: string;
}

// Old site's plg_system_jcemediabox ran site-wide with expand_on_click:true -
// clicking basically any content image opened it enlarged in an overlay.
// Gallery grids (Simple Image Gallery + fancybox) went further: a full
// toolbar (play/pause slideshow, fullscreen, thumbnails strip, share,
// download) plus next/previous arrows. `open` covers the single-image case
// (an `images` array of one - toolbar still shows minus play/thumbnails),
// `openGallery` covers the slider case.
interface LightboxContextValue {
  open: (src: string, alt?: string) => void;
  openGallery: (images: LightboxImage[], startIndex: number) => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export const useLightbox = () => {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error('useLightbox must be used within a LightboxProvider');
  return ctx;
};

const SLIDESHOW_INTERVAL = 1500;

export const LightboxProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{ images: LightboxImage[]; index: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const open = useCallback((src: string, alt: string = '') => {
    setState({ images: [{ src, alt }], index: 0 });
  }, []);

  const openGallery = useCallback((images: LightboxImage[], startIndex: number) => {
    setState({ images, index: startIndex });
  }, []);

  const close = useCallback(() => {
    setState(null);
    setIsPlaying(false);
    setShowThumbnails(false);
    setShowShare(false);
  }, []);

  const showPrev = useCallback(() => {
    setState((prev) => (prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : prev));
  }, []);

  const showNext = useCallback(() => {
    setState((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev));
  }, []);

  const goTo = useCallback((index: number) => {
    setState((prev) => (prev ? { ...prev, index } : prev));
  }, []);

  // Escape/arrow keys and the page-scroll lock while any lightbox is open.
  useEffect(() => {
    if (!state) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [state, close, showPrev, showNext]);

  // Slideshow (the toolbar's play/pause) - auto-advances until paused or closed.
  useEffect(() => {
    if (!isPlaying || !state || state.images.length < 2) return;
    const timer = setInterval(showNext, SLIDESHOW_INTERVAL);
    return () => clearInterval(timer);
  }, [isPlaying, state, showNext]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleDownload = () => {
    if (!current) return;
    const a = document.createElement('a');
    a.href = current.src;
    a.download = current.src.split('/').pop() || 'image.jpg';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const current = state?.images[state.index];
  const hasMultiple = !!state && state.images.length > 1;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <LightboxContext.Provider value={{ open, openGallery }}>
      {children}
      {current && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-[999] bg-black/90 flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Slideshow progress bar - shows how long until the next
              auto-advance. Keyed on the index so the fill animation
              restarts from 0 every time a new slide comes in. */}
          {isPlaying && hasMultiple && (
            <div className="absolute top-0 left-0 right-0 h-[3px] z-20 bg-white/10">
              <div
                key={state!.index}
                className="h-full bg-red-500"
                style={{ animation: `lightbox-progress ${SLIDESHOW_INTERVAL}ms linear` }}
              />
            </div>
          )}

          {/* Toolbar - same set of actions as the old site's fancybox skin. */}
          <div className="flex items-center justify-end gap-4 px-4 md:px-6 py-3 text-white/80 shrink-0">
            {hasMultiple && (
              <button onClick={() => setIsPlaying((p) => !p)} aria-label={isPlaying ? 'Pause' : 'Diashow starten'} className="hover:text-white transition-colors">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            )}
            <button onClick={toggleFullscreen} aria-label="Vollbild" className="hover:text-white transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
            {hasMultiple && (
              <button onClick={() => setShowThumbnails((s) => !s)} aria-label="Vorschaubilder" className={`hover:text-white transition-colors ${showThumbnails ? 'text-white' : ''}`}>
                <Grid3x3 className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setShowShare(true)} aria-label="Teilen" className="hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} aria-label="Herunterladen" className="hover:text-white transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={close} aria-label="Schließen" className="hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main stage + optional thumbnails rail, side by side. */}
          <div className="relative flex-1 min-h-0 flex">
            <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 pb-4 cursor-zoom-out" onClick={close}>
              {hasMultiple && (
                <button
                  onClick={(e) => { e.stopPropagation(); showPrev(); }}
                  aria-label="Vorheriges Bild"
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
              )}

              <img
                src={current.src}
                alt={current.alt}
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-full object-contain cursor-default shadow-2xl"
              />

              {hasMultiple && (
                <button
                  onClick={(e) => { e.stopPropagation(); showNext(); }}
                  aria-label="Nächstes Bild"
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              )}

              {hasMultiple && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full">
                  {state!.index + 1} / {state!.images.length}
                </div>
              )}
            </div>

            {/* Thumbnails rail - clicking a thumb jumps straight to it, panel
                stays open so you can keep browsing, matching the old site. */}
            {hasMultiple && showThumbnails && (
              <div className="w-40 md:w-48 shrink-0 bg-black/40 overflow-y-auto p-2 grid grid-cols-2 gap-2 content-start">
                {state!.images.map((img, i) => (
                  <button
                    key={img.src + i}
                    onClick={() => goTo(i)}
                    className={`aspect-square overflow-hidden rounded-sm ${i === state!.index ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'} transition-opacity`}
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showShare && current && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
          <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowShare(false)} aria-label="Schließen" className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-center border-b border-gray-200 pb-4 mb-6">SHARE</h3>
            <div className="flex gap-3 mb-6">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#3b5998] hover:opacity-90 text-white text-sm font-semibold py-2.5 rounded-sm transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396z"/></svg>
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#1da1f2] hover:opacity-90 text-white text-sm font-semibold py-2.5 rounded-sm transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M23 4.6c-.8.4-1.7.6-2.6.8 1-.6 1.7-1.5 2-2.6-.9.5-1.9.9-3 1.1-.9-.9-2.1-1.5-3.4-1.5-2.6 0-4.7 2.1-4.7 4.7 0 .4 0 .7.1 1C7.7 8 4.1 6 1.7 3c-.4.7-.6 1.5-.6 2.4 0 1.6.8 3 2.1 3.9-.7 0-1.5-.2-2.1-.6v.1c0 2.3 1.6 4.2 3.8 4.6-.4.1-.8.2-1.2.2-.3 0-.6 0-.9-.1.6 1.9 2.3 3.2 4.4 3.3-1.6 1.3-3.7 2-5.9 2-.4 0-.8 0-1.1-.1 2.1 1.4 4.6 2.1 7.3 2.1 8.7 0 13.5-7.2 13.5-13.5v-.6c.9-.7 1.7-1.5 2.3-2.5z"/></svg>
                Twitter
              </a>
              <a
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(current.src)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#bd081c] hover:opacity-90 text-white text-sm font-semibold py-2.5 rounded-sm transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.32-.09-.79-.16-2.01.03-2.87.18-.79 1.17-5.03 1.17-5.03s-.3-.6-.3-1.48c0-1.39.81-2.43 1.81-2.43.86 0 1.27.64 1.27 1.41 0 .86-.55 2.14-.83 3.33-.24.99.5 1.8 1.47 1.8 1.77 0 2.99-2.27 2.99-4.96 0-2.04-1.38-3.57-3.88-3.57-2.83 0-4.59 2.11-4.59 4.47 0 .81.24 1.38.62 1.83.17.2.2.29.13.52-.04.17-.15.6-.19.76-.06.25-.25.34-.46.24-1.28-.52-1.88-1.92-1.88-3.49 0-2.6 2.19-5.71 6.53-5.71 3.49 0 5.79 2.53 5.79 5.24 0 3.59-1.98 6.27-4.9 6.27-.98 0-1.9-.53-2.22-1.14 0 0-.53 2.1-.64 2.51-.19.72-.58 1.44-.93 2.01.83.25 1.71.38 2.62.38 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
                Pinterest
              </a>
            </div>
            <input
              readOnly
              value={pageUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full border border-gray-200 bg-gray-50 text-gray-500 text-xs px-3 py-2 rounded-sm"
            />
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
};
