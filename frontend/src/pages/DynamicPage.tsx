import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

interface PageData {
  title: string;
  metaDescription?: string | null;
  headerImageUrl?: string | null;
  body?: string | null; // HTML exported from the Unlayer editor - see Admin > Seiten (Pages.tsx)
}

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
            <SafeHtml html={page.body || ''} className="dynamic-page-content" />
          </>
        ) : (
          <p className="text-gray-500 text-center">Diese Seite existiert nicht.</p>
        )}
      </div>
    </div>
  );
};
