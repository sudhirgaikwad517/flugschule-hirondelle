import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';
import { PageGalleryBlock } from '../components/common/PageGalleryBlock';
import { PageFormBlock } from '../components/common/PageFormBlock';

interface PageData {
  title: string;
  metaDescription?: string | null;
  headerImageUrl?: string | null;
  body?: string | null; // HTML exported from the Unlayer editor - see Admin > Seiten (Pages.tsx)
}

type BodySegment =
  | { type: 'html'; value: string }
  | { type: 'gallery'; slug: string }
  | { type: 'form'; formId: string };

// A "Galerie einfügen"/"Formular einfügen" block (see Pages.tsx) is saved as
// a plain placeholder div carrying the gallery slug/form id as a data
// attribute - Unlayer itself can only ever produce static markup, never a
// live React component. Splitting the raw html string around that
// placeholder (instead of trying to mount a portal into a DOM node that
// SafeHtml owns via dangerouslySetInnerHTML) avoids fighting React's own
// reconciliation: on every re-render, SafeHtml re-runs DOMPurify and React
// re-applies the sanitized string to that node, silently reverting any DOM
// mutation made to it from outside - a portal mounted there gets its
// manually-cleared placeholder text put right back. Rendering each
// gallery/form as its own sibling React element, alongside ordinary
// SafeHtml-rendered chunks for everything in between, sidesteps that
// entirely.
const PLACEHOLDER_RE =
  /<div class="page-gallery-block" data-gallery-slug="([^"]+)"[^>]*>.*?<\/div>|<div class="page-form-block" data-form-id="([^"]+)"[^>]*>.*?<\/div>/gs;

const splitBodyOnPlaceholders = (html: string): BodySegment[] => {
  const segments: BodySegment[] = [];
  let lastIndex = 0;
  for (const match of html.matchAll(PLACEHOLDER_RE)) {
    const [full, gallerySlug, formId] = match;
    const index = match.index ?? 0;
    if (index > lastIndex) segments.push({ type: 'html', value: html.slice(lastIndex, index) });
    segments.push(gallerySlug ? { type: 'gallery', slug: gallerySlug } : { type: 'form', formId: formId! });
    lastIndex = index + full.length;
  }
  if (lastIndex < html.length) segments.push({ type: 'html', value: html.slice(lastIndex) });
  return segments;
};

// Renders any page created via Admin > Seiten (see backend Page model /
// pages.routes.ts) - the single flow for all dynamic page content,
// including the home page itself. Modeled on LegalPage.tsx's fetch-by-slug
// pattern. Normally reads the slug from the URL (:slug in App.tsx), but
// accepts a fixed `slug` prop too so the index ("/") route can render the
// "home" Page through this exact same component instead of a separate
// hardcoded Home.tsx - one single editing/rendering path for every page.
export const DynamicPage = ({ slug: fixedSlug }: { slug?: string } = {}) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = fixedSlug || paramSlug;
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/pages/public/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPage(data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const bodySegments = useMemo(() => splitBodyOnPlaceholders(page?.body || ''), [page?.body]);

  // Title/container styling deliberately mirrors Service.tsx (and the
  // site's other hardcoded pages) exactly - same max-width, same centered
  // uppercase heading treatment, same gold accent underline - so an admin-
  // created page's header looks identical to every other page's, not like
  // a visually distinct "generic CMS page" bolted on top.
  return (
    <div className="w-full bg-white pb-20">
      <Banner />
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        {loading ? (
          <p className="text-gray-500 text-center">Lädt...</p>
        ) : page ? (
          <>
            <div className="text-center mb-20 mt-8">
              <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide uppercase">
                {page.title}
              </h1>
              <div className="w-24 h-px bg-luxury-gold mx-auto"></div>
            </div>
            {page.headerImageUrl && (
              <img src={page.headerImageUrl} alt={page.title} className="w-full rounded mb-10" />
            )}
            <div className="dynamic-page-content">
              {bodySegments.map((seg, i) =>
                seg.type === 'gallery' ? (
                  <PageGalleryBlock key={i} slug={seg.slug} />
                ) : seg.type === 'form' ? (
                  <PageFormBlock key={i} formId={seg.formId} />
                ) : (
                  <SafeHtml key={i} html={seg.value} />
                )
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center">Diese Seite existiert nicht.</p>
        )}
      </div>
    </div>
  );
};
