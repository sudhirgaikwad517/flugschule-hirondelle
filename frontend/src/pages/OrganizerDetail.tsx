import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { ContactOrganizerModal } from '../components/common/ContactOrganizerModal';

interface OrganizerData {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  upcomingEvents: { id: string; title: string; startDate: string }[];
}

export const OrganizerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState<OrganizerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/organizers/public/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setOrganizer(data))
      .catch(() => setOrganizer(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />
      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1000px]">
          {loading ? (
            <p className="text-gray-500">Lädt...</p>
          ) : !organizer ? (
            <p className="text-gray-500">Dieser Veranstalter konnte nicht gefunden werden.</p>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
                  {organizer.name}
                </h1>
                <div className="w-full h-px bg-[#53a8c7] opacity-40"></div>
              </div>

              <div className="flex flex-col lg:flex-row gap-10">
                <div className="lg:w-2/3">
                  {organizer.imageUrl && (
                    <img src={organizer.imageUrl} alt={organizer.name} className="w-full h-auto rounded-sm object-cover shadow-md mb-8 max-h-[400px]" />
                  )}
                  {organizer.description && (
                    <div className="prose prose-sm md:prose-base max-w-none text-gray-600 font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: organizer.description }} />
                  )}
                </div>

                <div className="lg:w-1/3">
                  <div className="bg-gray-50 border border-gray-200 rounded-sm overflow-hidden shadow-sm mb-8">
                    <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
                      Kontakt
                    </div>
                    <div className="p-5 text-sm text-gray-700 space-y-3">
                      {organizer.phone && <div><span className="font-semibold text-gray-500">Telefon: </span>{organizer.phone}</div>}
                      {organizer.website && <div><span className="font-semibold text-gray-500">Webseite: </span><a href={organizer.website} target="_blank" rel="noopener noreferrer" className="text-[#53a8c7] hover:underline">{organizer.website}</a></div>}
                      {organizer.email && (
                        <button
                          onClick={() => setContactOpen(true)}
                          className="w-full mt-2 px-6 py-2.5 bg-[#5bc0de] text-white hover:bg-[#46b8da] transition-colors rounded-sm shadow-sm"
                        >
                          Kontakt aufnehmen
                        </button>
                      )}
                    </div>
                  </div>

                  {organizer.upcomingEvents.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                      <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
                        Kommende Veranstaltungen
                      </div>
                      <div className="p-5 flex flex-col gap-3">
                        {organizer.upcomingEvents.map(ev => (
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

              {contactOpen && (
                <ContactOrganizerModal
                  organizerId={organizer.id}
                  organizerName={organizer.name}
                  onClose={() => setContactOpen(false)}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};
