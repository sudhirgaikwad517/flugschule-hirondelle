import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

interface LocationData {
  id: string;
  title: string;
  name?: string | null;
  googleMapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  upcomingEvents: { id: string; title: string; startDate: string; imageUrl?: string | null }[];
}

export const LocationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/locations/public/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setLocation(data))
      .catch(() => setLocation(null))
      .finally(() => setLoading(false));
  }, [id]);

  const mapUrl = location?.latitude && location?.longitude
    ? `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=14&output=embed`
    : location?.googleMapsUrl
    ? `https://maps.google.com/maps?q=${encodeURIComponent(location.googleMapsUrl)}&z=14&output=embed`
    : null;

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />
      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1000px]">
          {loading ? (
            <p className="text-gray-500">Lädt...</p>
          ) : !location ? (
            <p className="text-gray-500">Dieser Veranstaltungsort konnte nicht gefunden werden.</p>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-2 tracking-wide">
                  {location.title}
                </h1>
                {location.name && <p className="text-gray-500 text-lg">{location.name}</p>}
                <div className="w-full h-px bg-[#53a8c7] opacity-40 mt-6"></div>
              </div>

              <div className="flex flex-col lg:flex-row gap-10">
                <div className="lg:w-2/3">
                  {location.imageUrl && (
                    <img src={location.imageUrl} alt={location.title} className="w-full h-auto rounded-sm object-cover shadow-md mb-8" />
                  )}
                  {location.description && (
                    <div className="prose prose-sm md:prose-base max-w-none text-gray-600 font-light leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: location.description }} />
                  )}
                  {mapUrl && (
                    <div className="w-full h-[350px] border border-gray-200 rounded-sm overflow-hidden mb-8">
                      <iframe title="Karte" width="100%" height="100%" style={{ border: 0 }} src={mapUrl} allowFullScreen />
                    </div>
                  )}
                </div>

                <div className="lg:w-1/3">
                  <div className="bg-gray-50 border border-gray-200 rounded-sm overflow-hidden shadow-sm mb-8">
                    <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
                      Informationen
                    </div>
                    <div className="p-5 text-sm text-gray-700 space-y-3">
                      {location.phone && <div><span className="font-semibold text-gray-500">Telefon: </span>{location.phone}</div>}
                      {location.email && <div><span className="font-semibold text-gray-500">E-Mail: </span><a href={`mailto:${location.email}`} className="text-[#53a8c7] hover:underline">{location.email}</a></div>}
                      {location.website && <div><span className="font-semibold text-gray-500">Webseite: </span><a href={location.website} target="_blank" rel="noopener noreferrer" className="text-[#53a8c7] hover:underline">{location.website}</a></div>}
                    </div>
                  </div>

                  {location.upcomingEvents.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                      <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
                        Kommende Veranstaltungen
                      </div>
                      <div className="p-5 flex flex-col gap-3">
                        {location.upcomingEvents.map(ev => (
                          <button
                            key={ev.id}
                            onClick={() => navigate(`/buchungskalender/${ev.id}`)}
                            className="text-left text-sm border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0"
                          >
                            <div className="text-[#53a8c7] hover:underline font-medium">{ev.title}</div>
                            <div className="text-gray-500 text-xs">{new Date(ev.startDate).toLocaleDateString('de-DE')}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
