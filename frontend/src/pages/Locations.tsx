import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

interface LocationListItem {
  id: string;
  title: string;
  name?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  googleMapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

// Matukio's old "Eventlocator" was a single big interactive map with every
// location plotted as a marker - that needs a paid Google Maps JavaScript API
// key, which isn't configured anywhere in this project. This gives the same
// "browse all event locations" outcome using the same free static-embed maps
// already used on the individual location detail pages, no API key needed.
export const Locations = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/locations/public')
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  const mapUrlFor = (loc: LocationListItem) =>
    loc.latitude && loc.longitude
      ? `https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&z=13&output=embed`
      : loc.googleMapsUrl
      ? `https://maps.google.com/maps?q=${encodeURIComponent(loc.googleMapsUrl)}&z=13&output=embed`
      : null;

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />
      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          <div className="mb-12">
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
              Veranstaltungsorte
            </h1>
            <div className="w-full h-px bg-[#53a8c7] opacity-40"></div>
          </div>

          {loading ? (
            <p className="text-gray-500">Lädt...</p>
          ) : locations.length === 0 ? (
            <p className="text-gray-500">Keine Veranstaltungsorte gefunden.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.map(loc => {
                const mapUrl = mapUrlFor(loc);
                return (
                  <button
                    key={loc.id}
                    onClick={() => navigate(`/veranstaltungsort/${loc.id}`)}
                    className="text-left bg-gray-50 border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-40 bg-gray-100 overflow-hidden pointer-events-none">
                      {mapUrl ? (
                        <iframe title={loc.title} width="100%" height="100%" style={{ border: 0 }} src={mapUrl} loading="lazy" />
                      ) : loc.imageUrl ? (
                        <img src={loc.imageUrl} alt={loc.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-luxury text-xl text-luxury-dark mb-2">{loc.title}</h3>
                      {loc.name && loc.name !== loc.title && (
                        <p className="text-sm text-gray-500 mb-1">{loc.name}</p>
                      )}
                      {loc.description && (
                        <p className="text-sm text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: loc.description }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
