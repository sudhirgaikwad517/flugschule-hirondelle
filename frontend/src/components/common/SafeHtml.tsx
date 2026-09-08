import DOMPurify from 'dompurify';

// Renders CMS-authored rich text (event/location/organizer descriptions,
// legal pages) safely. These fields are stored as raw HTML and were
// previously rendered via dangerouslySetInnerHTML with no sanitization -
// stored XSS if that content, or the admin session that authored it, is
// ever compromised. Use this instead of dangerouslySetInnerHTML directly.
export const SafeHtml = ({ html, className }: { html: string; className?: string }) => {
  const clean = DOMPurify.sanitize(html || '', {
    ADD_ATTR: ['target', 'rel'],
  });
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
};
