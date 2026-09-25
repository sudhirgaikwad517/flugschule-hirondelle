import { useEffect, useState } from 'react';

export interface BannerSlide {
  image: string;
  text?: string;
  linkUrl?: string;
}

interface AdBannerResponse {
  imageUrl: string;
  title: string;
  linkUrl?: string | null;
}

/**
 * Loads the admin-managed banner slideshow for a position ("home" or
 * "subpage", see Admin > Werbebanner / Banner.tsx), falling back to
 * `fallbackSlides` (the site's original curated set) whenever no admin
 * rows exist for that position or none of their image URLs actually load.
 *
 * Every candidate URL is preloaded via a real Image() first, same as
 * usePageGallery/useValidatedImageList - Banner.tsx previously fetched this
 * same data with no validation, which meant a single stale/deleted upload
 * silently broke the whole slideshow the moment the fetch resolved. The
 * fix here goes one step further than those hooks: since the caller
 * doesn't just render a static grid but is actively mid-animation by the
 * time this resolves, returning a brand new array reference (as this hook
 * unavoidably does, fallback -> admin-configured) needs the caller to also
 * reset its own slide-index state when the array identity changes -
 * otherwise the old numeric slide index still points into the new array at
 * the wrong photo, or past the end of it. See Banner.tsx's `slides` effect.
 * `text` is only ever populated when `withCaptions` is true (the "home"
 * variant) - subpage banners never show a caption box, no matter what's
 * typed into their "Titel" field in the admin, matching the old site.
 */
export function useBannerSlides(
  position: 'home' | 'subpage',
  fallbackSlides: BannerSlide[],
  withCaptions: boolean
): BannerSlide[] {
  const [resolved, setResolved] = useState<BannerSlide[]>(fallbackSlides);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/banners/public?position=${position}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(async (rows: AdBannerResponse[]) => {
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        const candidates: BannerSlide[] = rows.map((row) => ({
          image: row.imageUrl,
          text: withCaptions && row.title ? row.title : undefined,
          linkUrl: row.linkUrl || undefined,
        }));
        const valid = await Promise.all(
          candidates.map(
            (slide) =>
              new Promise<BannerSlide | null>((resolve) => {
                const img = new Image();
                img.onload = () => resolve(slide);
                img.onerror = () => resolve(null);
                img.src = slide.image;
              })
          )
        );
        if (cancelled) return;
        const usable = valid.filter((s): s is BannerSlide => s !== null);
        if (usable.length > 0) setResolved(usable);
      })
      .catch(() => {
        // Network/API error - silently keep fallbackSlides.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, withCaptions]);

  return resolved;
}
