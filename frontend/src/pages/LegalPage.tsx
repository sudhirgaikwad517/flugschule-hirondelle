import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';

// Renders an admin-editable legal text page (AGB / Widerrufsbelehrung),
// matching Matukio's agb_text/revoke_text configuration fields.
export const LegalPage = ({ slug }: { slug: string }) => {
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/legalPages/public/${slug}`)
      .then(res => res.json())
      .then(data => setPage(data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />
      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[900px]">
          <div className="mb-12">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              {loading ? '' : (page?.title || '')}
            </h1>
            <div className="w-full h-px bg-[#53a8c7] opacity-40"></div>
          </div>

          {loading ? (
            <p className="text-gray-500">Lädt...</p>
          ) : page ? (
            <div
              className="prose prose-sm md:prose-base max-w-none text-gray-600 font-light leading-relaxed [&_a]:text-[#53a8c7] [&_a]:font-medium"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <p className="text-gray-500">Diese Seite konnte nicht geladen werden.</p>
          )}
        </div>
      </section>
    </div>
  );
};
