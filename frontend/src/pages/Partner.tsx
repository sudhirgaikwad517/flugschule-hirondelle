import React, { useState, useEffect } from 'react';

import { Header as Navbar } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';

interface WebLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

interface WebLinkCategory {
  id: string;
  title: string;
  description?: string;
  links: WebLink[];
}

export const Partner: React.FC = () => {
  const [categories, setCategories] = useState<WebLinkCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch('/api/weblinks/public');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch links', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-white">


      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Partner & Links</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empfehlenswerte Webseiten, Wetterdienste und Partner der Flugschule.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#53a8c7]"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Derzeit sind keine Links eingetragen.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12">
              {categories.map((category) => (
                <section key={category.id} className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100">
                  <div className="mb-8 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <LinkIcon className="text-[#53a8c7] w-6 h-6" />
                      {category.title}
                    </h2>
                    {category.description && (
                      <p className="mt-2 text-gray-600">{category.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.links.length === 0 ? (
                      <div className="text-gray-400 italic text-sm">Keine Einträge.</div>
                    ) : (
                      category.links.map((link) => (
                        <a 
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-[#53a8c7] transition-colors line-clamp-1">
                              {link.title}
                            </h3>
                            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#53a8c7] shrink-0 transition-colors" />
                          </div>
                          {link.description ? (
                            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                              {link.description}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 truncate">
                              {link.url}
                            </p>
                          )}
                        </a>
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
