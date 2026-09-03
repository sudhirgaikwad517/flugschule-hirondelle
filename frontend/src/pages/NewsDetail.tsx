import React, { useState, useEffect } from 'react';
import { Header as Navbar } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { EventComments } from '../components/common/EventComments';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news/public/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setNewsItem(data);
        }
      } catch (err) {
        console.error('Failed to fetch news', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchNews();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#53a8c7]"></div>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Beitrag nicht gefunden</h1>
          <Link to="/news" className="text-[#53a8c7] hover:underline">Zurück zur Übersicht</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-white">
      <Navbar />

      <main className="pt-24 pb-16">
        <article className="max-w-4xl mx-auto px-4 md:px-8">
          <Link to="/news" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#53a8c7] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Übersicht
          </Link>

          <header className="mb-10 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(newsItem.createdAt).toLocaleDateString('de-DE')}
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Team Hirondelle
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
              {newsItem.title}
            </h1>
          </header>

          {newsItem.imageUrl && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-sm">
              <img src={newsItem.imageUrl} alt={newsItem.title} className="w-full h-auto object-cover max-h-[500px]" />
            </div>
          )}

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-16">
            {newsItem.content.split('\n').map((paragraph, idx) => (
              paragraph.trim() ? <p key={idx} className="mb-6">{paragraph}</p> : null
            ))}
          </div>

          <hr className="border-gray-100 my-12" />

          {/* Comments Section */}
          <div>
            <h3 className="text-2xl font-bold mb-8">Kommentare</h3>
            <EventComments pageSlug={`news-${newsItem.slug}`} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};
