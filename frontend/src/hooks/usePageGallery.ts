import { useEffect, useState } from 'react';
import { useValidatedImageList } from './useValidatedImage';

// Added to make per-page "Impressionen" galleries editable from a single
// place (Admin > Galerie, a standalone feature/table separate from
// Seitenmedien / PageMedia) instead of galleries hardcoded separately in
// each page component. Backed by the PageGallery model and
// backend/src/routes/pagegallery.routes.ts.
//
// To revert a single page: stop calling usePageGallery() there and restore
// that page's original hardcoded image-filename array + render block. This
// file itself can be deleted once no page imports it anymore.

interface PageGalleryResponse {
  error?: string;
  images?: string | string[] | null;
}

// The API's `images` column is stored as a JSON string, but may already be
// parsed depending on how it was written - handle both defensively.
function parseImages(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Loads the admin-managed gallery for a page, identified by `slug` (the same
 * slug selected in Admin > Galerie). Falls back to `fallbackImages`
 * (typically the page's original hardcoded image list) whenever:
 *  - no PageGallery row exists yet for this slug,
 *  - the admin hasn't added any images yet, or
 *  - a configured image URL no longer actually loads (e.g. a deleted
 *    upload) - see useValidatedImageList for that load-then-promote check.
 *
 * This means a page's appearance never changes until an admin explicitly
 * configures a gallery for it, and other pages/features are unaffected.
 */
export function usePageGallery(slug: string, fallbackImages: string[]): string[] {
  const [rawImages, setRawImages] = useState<string | string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/pagegallery/public/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PageGalleryResponse | null) => {
        if (!cancelled && data && !data.error) {
          setRawImages(data.images ?? null);
        }
      })
      .catch(() => {
        // Network/API error - silently keep fallbackImages.
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return useValidatedImageList(parseImages(rawImages), fallbackImages);
}
