import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';
import { GELAENDE_ARTICLES, getGelaendeArticleBySlug, type GelaendeArticle } from '../data/gelaendeArticles';

// Content comes from the `gelaende` kind's `articles` array (Admin > Seiten
// > Fluggelände - see GelaendeContentEditor.tsx), falling back to the
// original hardcoded transcription in data/gelaendeArticles.ts if the fetch
// fails or a row doesn't exist yet. Only the page shell (title, back link,
// typography) is ours - the className below only styles generic tags
// (p/strong/a/img/iframe/ul) so the article content stays untouched.
export const GelaendeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<GelaendeArticle[]>(GELAENDE_ARTICLES);

  useEffect(() => {
    fetch('/api/sitepagecontent/public/gelaende')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.articles?.length) setArticles(data.articles); })
      .catch((err) => console.error('Error fetching Gelände content:', err));
  }, []);

  const article = slug ? (articles.find((a) => a.slug === slug) ?? getGelaendeArticleBySlug(slug)) : undefined;

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <Link
            to="/infos/gelaende"
            className="inline-block text-sm text-[#428bca] hover:text-[#2a6496] hover:underline mb-8 font-semibold tracking-wide uppercase"
          >
            ← Zurück zur Geländeübersicht
          </Link>

          {!article ? (
            <p className="text-gray-500">Dieses Fluggelände konnte nicht gefunden werden.</p>
          ) : (
            <>
              <div className="mb-10">
                <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
                  {article.title}
                </h1>
                <div className="w-24 h-px bg-luxury-gold mx-auto"></div>
              </div>

              <SafeHtml
                className="text-[15px] text-gray-600 font-light leading-relaxed
                  [&_h2]:font-luxury [&_h2]:text-2xl [&_h2]:text-luxury-dark [&_h2]:mb-4 [&_h2]:mt-2
                  [&_p]:mb-4 [&_strong]:text-gray-800 [&_strong]:font-semibold
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-2
                  [&_a]:text-[#428bca] [&_a]:underline [&_a]:font-bold hover:[&_a]:text-[#2a6496]
                  [&_a.boxblau]:inline-block [&_a.boxblau]:bg-luxury-gold [&_a.boxblau]:text-white
                  [&_a.boxblau]:no-underline [&_a.boxblau]:px-5 [&_a.boxblau]:py-2.5
                  [&_a.boxblau]:rounded-sm [&_a.boxblau]:font-semibold [&_a.boxblau]:my-2
                  hover:[&_a.boxblau]:opacity-90
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-sm [&_img]:my-4 [&_img.voll]:w-full
                  [&_iframe]:w-full [&_iframe]:aspect-[4/3] [&_iframe]:max-w-full [&_iframe]:rounded-sm [&_iframe]:shadow-md [&_iframe]:my-6
                  [&_.col-md-5]:block [&_.col-md-6]:block [&_.col-md-7]:block"
                html={article.html}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
};
