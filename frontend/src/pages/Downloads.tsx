import React, { useState, useEffect } from 'react';

import { Header as Navbar } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Download, FileText, FolderOpen } from 'lucide-react';

interface DownloadFile {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
}

interface DownloadCategory {
  id: string;
  title: string;
  description?: string;
  files: DownloadFile[];
}

export const Downloads: React.FC = () => {
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await fetch('/api/downloads/public');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch downloads', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDownloads();
  }, []);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-[#FAF9F7]">


      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Downloads</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hier finden Sie nützliche Dokumente, Formulare und Informationsmaterialien rund um das Fliegen.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#53a8c7]"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Derzeit stehen keine Downloads zur Verfügung.
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map((category) => (
                <section key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <FolderOpen className="text-[#53a8c7] w-6 h-6" />
                    <h2 className="text-xl font-bold text-gray-800 m-0">{category.title}</h2>
                  </div>
                  {category.description && (
                    <div className="px-6 py-3 text-sm text-gray-600 border-b border-gray-50">
                      {category.description}
                    </div>
                  )}
                  <div className="divide-y divide-gray-50">
                    {category.files.length === 0 ? (
                      <div className="px-6 py-8 text-gray-400 text-sm italic">
                        Keine Dateien in dieser Kategorie.
                      </div>
                    ) : (
                      category.files.map((file) => (
                        <div key={file.id} className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="bg-gray-100 p-2.5 rounded-lg shrink-0 mt-1">
                              <FileText className="text-gray-500 w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base">{file.title}</h3>
                              {file.description && (
                                <p className="text-gray-500 text-sm mt-1">{file.description}</p>
                              )}
                              {file.fileSize && (
                                <span className="inline-block mt-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                  {formatSize(file.fileSize)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <a 
                            href={file.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#53a8c7] hover:bg-[#4396b3] text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
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
