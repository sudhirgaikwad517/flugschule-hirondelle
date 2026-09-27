import DOMPurify from 'dompurify';
import type { MouseEvent } from 'react';
import { useLightbox } from './Lightbox';

// Renders CMS-authored rich text (event/location/organizer descriptions,
// legal pages) safely. These fields are stored as raw HTML and were
// previously rendered via dangerouslySetInnerHTML with no sanitization -
// stored XSS if that content, or the admin session that authored it, is
// ever compromised. Use this instead of dangerouslySetInnerHTML directly.
// Some CMS content (e.g. Gelände location articles) embeds Google Maps via
// <iframe>, which DOMPurify strips by default - allow it plus the specific
// attributes those embeds use, scoped narrowly so this stays safe for the
// other content types rendered through this same component.
export const SafeHtml = ({ html, className }: { html: string; className?: string }) => {
  const { open } = useLightbox();
  const clean = DOMPurify.sanitize(html || '', {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'target', 'rel',
      'src', 'width', 'height', 'frameborder', 'allowfullscreen',
      'style', 'loading', 'referrerpolicy', 'tabindex', 'allow',
    ],
  });

  // Some migrated CMS content (event/location/organizer descriptions) has
  // anchor hrefs saved without a protocol, e.g. "service.dhv.de" instead of
  // "https://service.dhv.de". Rendered as-is, the browser treats that as a
  // path relative to the current SPA route (/events -> /service.dhv.de),
  // and react-router's catch-all ":slug" route (App.tsx) swallows the click
  // into one of the app's own fixed pages instead of the real external
  // site. Give any scheme-less href an https:// prefix, and open all
  // external links in a new tab so a bad/legacy link can never hijack SPA
  // navigation again.
  const withFixedLinks = (() => {
    const container = document.createElement('div');
    container.innerHTML = clean;
    container.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) {
        a.setAttribute('href', `https://${href}`);
      }
      if (/^https?:\/\//i.test(a.getAttribute('href') || '')) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    });
    return container.innerHTML;
  })();

  // Old site's mediabox plugin opened any content image full-size on
  // click - mirrored here via event delegation (one listener for however
  // many images this content happens to contain) instead of per-image.
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      open(img.currentSrc || img.src, img.alt);
    }
  };

  return (
    <div
      className={`${className ?? ''} [&_img]:cursor-zoom-in`}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: withFixedLinks }}
    />
  );
};
