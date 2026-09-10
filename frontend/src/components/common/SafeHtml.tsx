import DOMPurify from 'dompurify';

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
  const clean = DOMPurify.sanitize(html || '', {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'target', 'rel',
      'src', 'width', 'height', 'frameborder', 'allowfullscreen',
      'style', 'loading', 'referrerpolicy', 'tabindex', 'allow',
    ],
  });
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
};
