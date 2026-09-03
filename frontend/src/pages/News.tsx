import React, { useState, useEffect } from 'react';
import { Header as Navbar } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news/public');
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch (err) {
        console.error('Failed to fetch news', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-white">


      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Aktuelles & Blog</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Bleiben Sie auf dem Laufenden mit den neuesten Nachrichten aus der Flugschule.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#53a8c7]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12">
                  Derzeit gibt es keine Neuigkeiten.
                </div>
              ) : (
                news.map((item) => (
                  <article key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                    {item.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.createdAt).toLocaleDateString('de-DE')}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          Team Hirondelle
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        <Link to={`/news/${item.slug}`} className="hover:text-[#53a8c7] transition-colors">
                          {item.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                        {item.content.substring(0, 150)}...
                      </p>
                      <div className="mt-auto">
                        <Link 
                          to={`/news/${item.slug}`}
                          className="inline-flex items-center justify-center px-4 py-2 bg-gray-50 hover:bg-[#53a8c7] hover:text-white text-gray-700 text-sm font-medium rounded-lg transition-colors w-full"
                        >
                          Weiterlesen
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
