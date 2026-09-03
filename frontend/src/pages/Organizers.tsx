import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

interface OrganizerListItem {
  id: string;
  name: string;
  imageUrl?: string | null;
  description?: string | null;
}

export const Organizers = () => {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState<OrganizerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/organizers/public')
      .then(res => res.json())
      .then(data => setOrganizers(data))
      .catch(() => setOrganizers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />
      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          <div className="mb-12">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              Veranstalter
            </h1>
            <div className="w-full h-px bg-[#53a8c7] opacity-40"></div>
          </div>

          {loading ? (
            <p className="text-gray-500">Lädt...</p>
          ) : organizers.length === 0 ? (
            <p className="text-gray-500">Keine Veranstalter gefunden.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {organizers.map(org => (
                <button
                  key={org.id}
                  onClick={() => navigate(`/veranstalter/${org.id}`)}
                  className="text-left bg-gray-50 border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {org.imageUrl ? (
                      <img src={org.imageUrl} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-luxury text-xl text-luxury-dark mb-2">{org.name}</h3>
                    {org.description && (
                      <p className="text-sm text-gray-500 line-clamp-3" dangerouslySetInnerHTML={{ __html: org.description }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
