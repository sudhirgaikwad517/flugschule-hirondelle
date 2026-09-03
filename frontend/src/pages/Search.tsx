import React, { useState, useEffect } from 'react';

import { Header as Navbar } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Calendar, FileText, Download } from 'lucide-react';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{ events: any[], news: any[], downloads: any[] }>({
    events: [],
    news: [],
    downloads: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ events: [], news: [], downloads: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/public?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = fd.get('q') as string;
    if (q) setSearchParams({ q });
  };

  const hasResults = results.events.length > 0 || results.news.length > 0 || results.downloads.length > 0;

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-white">


      <Navbar />

      <main className="pt-24 pb-16 min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Suche</h1>
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                name="q"
                defaultValue={query}
                placeholder="Suchbegriff eingeben..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#53a8c7] focus:border-transparent text-lg transition-shadow"
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#53a8c7] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#4396b3] transition-colors"
              >
                Finden
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#53a8c7]"></div>
            </div>
          ) : query.length < 2 ? (
            <div className="text-center text-gray-500 py-12">
              Bitte geben Sie mindestens 2 Zeichen ein.
            </div>
          ) : !hasResults ? (
            <div className="text-center text-gray-500 py-12">
              Keine Ergebnisse für "{query}" gefunden.
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* Events Results */}
              {results.events.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#53a8c7]" />
                    Veranstaltungen & Reisen
                  </h2>
                  <div className="space-y-4">
                    {results.events.map(event => (
                      <Link 
                        key={event.id} 
                        to={`/events?id=${event.id}`} // Could be better routing, but good for now
                        className="block p-4 rounded-xl border border-gray-100 hover:border-[#53a8c7] hover:shadow-sm transition-all"
                      >
                        <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(event.startDate).toLocaleDateString('de-DE')} 
                          {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('de-DE')}`}
                        </p>
                        {event.shortDescription && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.shortDescription}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* News Results */}
              {results.news.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#53a8c7]" />
                    Neuigkeiten
                  </h2>
                  <div className="space-y-4">
                    {results.news.map(news => (
                      <Link 
                        key={news.id} 
                        to={`/news/${news.slug}`}
                        className="block p-4 rounded-xl border border-gray-100 hover:border-[#53a8c7] hover:shadow-sm transition-all"
                      >
                        <h3 className="font-semibold text-lg text-gray-900">{news.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{new Date(news.createdAt).toLocaleDateString('de-DE')}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Downloads Results */}
              {results.downloads.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#53a8c7]" />
                    Downloads
                  </h2>
                  <div className="space-y-4">
                    {results.downloads.map(file => (
                      <a 
                        key={file.id} 
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl border border-gray-100 hover:border-[#53a8c7] hover:shadow-sm transition-all"
                      >
                        <h3 className="font-semibold text-lg text-gray-900">{file.title}</h3>
                        {file.description && (
                          <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                        )}
                      </a>
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
