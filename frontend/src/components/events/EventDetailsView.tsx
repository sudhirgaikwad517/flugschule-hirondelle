import React from 'react';
import { Link } from 'react-router-dom';
import { EventComments } from '../common/EventComments';

interface Ticket {
  id: string;
  name: string;
  price: number;
  capacity?: number;
  bookedCount?: number;
}

interface EventDetailsViewProps {
  event: any;
  additionalDates?: { id: string; start: Date }[];
  onSelectAdditionalDate?: (id: string) => void;
  onBack: () => void;
  onBook: (quantities: Record<string, number>) => void;
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({ event, additionalDates = [], onSelectAdditionalDate, onBack, onBook }) => {
  const [ticketQuantities, setTicketQuantities] = React.useState<Record<string, number>>({});
  const [participants, setParticipants] = React.useState<{ name: string }[] | null>(null);

  // Only visible to a logged-in user who is themselves booked on this event -
  // the backend enforces this too, this fetch just silently does nothing if
  // the visitor isn't eligible (403) instead of showing an error.
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !event?.id) { setParticipants(null); return; }
    fetch(`/api/bookings/event/${event.id}/participants`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => setParticipants(data))
      .catch(() => setParticipants(null));
  }, [event?.id]);

  const isPastDeadline = event.registrationDeadline && new Date() > new Date(event.registrationDeadline);
  const paidPrices = event.tickets?.map((t: Ticket) => t.price).filter((p: number) => p > 0) || [];
  const minPrice = paidPrices.length > 0 ? Math.min(...paidPrices) : 0;
  const maxPrice = event.tickets?.length > 0 ? Math.max(...event.tickets.map((t: Ticket) => t.price)) : 0;
  const hasMultiplePrices = event.tickets?.length > 1 && minPrice !== maxPrice;

  const isWaitlistBooking = React.useMemo(() => {
    if (!event.tickets) return false;
    for (const ticket of event.tickets) {
      const qty = ticketQuantities[ticket.id] || 0;
      if (qty > 0 && ((ticket.bookedCount || 0) + qty > (ticket.capacity || 0))) {
        return true;
      }
    }
    return false;
  }, [ticketQuantities, event.tickets]);

  // Initialize first ticket with quantity 1 if available
  React.useEffect(() => {
    if (event.tickets && event.tickets.length > 0 && !isPastDeadline) {
      setTicketQuantities({ [event.tickets[0].id]: 1 });
    }
  }, [event, isPastDeadline]);

  const handleQuantityChange = (ticketId: string, qty: number) => {
    setTicketQuantities(prev => ({ ...prev, [ticketId]: qty }));
  };

  const handleBookClick = () => {
    onBook(ticketQuantities);
  };

  return (
    <div className="w-full bg-white animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-luxury-gold transition-colors text-sm uppercase tracking-widest font-semibold print:hidden"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Zurück zum Kalender
      </button>

      {/* Main Title & Action Bar */}
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase tracking-wide mb-4">
            {event.title}
            {event.cancelled && (
              <span className="ml-4 align-middle text-sm font-sans font-bold uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-sm">
                Storniert
              </span>
            )}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>
                {new Date(event.start || event.startDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {event.end && event.end !== event.start ? ` bis ${new Date(event.end || event.endDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
              </span>
            </div>
            
            {event.location && (
              <>
                <div className="hidden sm:block text-gray-300">|</div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {event.locationId ? (
                    <Link to={`/veranstaltungsort/${event.locationId}`} className="hover:text-luxury-gold hover:underline transition-colors">{event.location}</Link>
                  ) : (
                    <span>{event.location}</span>
                  )}
                </div>
              </>
            )}

            <div className="hidden sm:block text-gray-300">|</div>

            <div className="flex items-center gap-2 text-luxury-gold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              <span className="font-semibold">{event.category}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 print:hidden">
          {/* Add to Calendar Button */}
          <a
            href={`/api/events/${event.id}/ics`}
            className="text-gray-400 hover:text-luxury-dark transition-colors p-2"
            title="Zum Kalender hinzufügen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v4m-2-2h4"></path></svg>
          </a>
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="text-gray-400 hover:text-luxury-dark transition-colors p-2"
            title="Drucken"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column - Main Details */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          
          {/* Booking Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-sm overflow-hidden print:hidden">
            <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
              Buchen Sie jetzt!
            </div>
            <div className="p-6">
              {event.cancelled ? (
                <div className="flex items-start gap-3 text-red-700">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span className="font-semibold">Dieser Termin wurde storniert. Eine Buchung ist nicht mehr möglich.</span>
                </div>
              ) : isPastDeadline ? (
                <div className="flex items-start gap-3 text-red-700">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span className="font-semibold">Die Anmeldefrist ist überschritten.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {event.tickets && event.tickets.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {event.tickets.map((ticket: Ticket) => (
                        <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-dashed border-gray-300 gap-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            <div className="flex flex-col">
                              <span className="text-gray-700">{ticket.name}: € {ticket.price.toFixed(2)} pro Person</span>
                              <span className="text-xs text-gray-500">
                                {ticket.bookedCount || 0} / {ticket.capacity || 0} gebucht
                                {((ticket.bookedCount || 0) >= (ticket.capacity || 0)) && <span className="ml-2 text-orange-500 font-semibold">(Ausgebucht - Warteliste)</span>}
                              </span>
                            </div>
                          </div>
                          <select 
                            value={ticketQuantities[ticket.id] || 0}
                            onChange={(e) => handleQuantityChange(ticket.id, parseInt(e.target.value))}
                            className="w-20 p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-white"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 text-green-700 mb-4">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <span className="font-semibold">Plätze verfügbar. Anmeldung möglich.</span>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={handleBookClick}
                      className={`px-8 py-2.5 text-white transition-colors text-[14px] rounded-sm shadow-sm ${isWaitlistBooking ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#5bc0de] hover:bg-[#46b8da]'}`}
                    >
                      {isWaitlistBooking ? 'Auf Warteliste eintragen' : 'Jetzt buchen'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Details Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-sm overflow-hidden mb-12">
            <div className="bg-luxury-slate text-white py-3 px-5 font-luxury text-xl tracking-wide">
              Veranstaltungs-Details
            </div>
            <div className="p-6">
              <div className="prose prose-sm md:prose-base prose-luxury max-w-none text-gray-600 mb-8 whitespace-pre-wrap">
                {event.description ? event.description.replace(/\\n/g, '\n') : 'Keine Beschreibung verfügbar.'}
              </div>
              
              {event.imageUrl && (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-auto rounded-sm object-cover shadow-md mb-8"
                  style={{ maxHeight: '500px' }}
                />
              )}
              
              <a href={`/reisen/${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="text-luxury-gold text-sm uppercase tracking-widest font-bold hover:text-luxury-dark transition-colors inline-flex items-center gap-2">
                Zur Reisebeschreibung
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </a>

              {/* Social Share */}
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200 print:hidden">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Teilen:</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-luxury-gold hover:text-white transition-colors"
                  title="Auf Facebook teilen"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${event.title} - ${window.location.href}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-luxury-gold hover:text-white transition-colors"
                  title="Über WhatsApp teilen"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.1a8.2 8.2 0 01-4.18-1.14l-.3-.18-3.12.82.83-3.04-.19-.31a8.18 8.18 0 01-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.82c0 4.54-3.7 8.21-8.25 8.21zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.12-.17.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.64 4.19 3.7.58.25 1.04.4 1.4.51.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`Schau dir das an: ${window.location.href}`)}`}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-luxury-gold hover:text-white transition-colors"
                  title="Per E-Mail teilen"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="print:hidden">
            <EventComments eventId={event.id} />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          
          {/* Information Sidebar */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
            <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
              Informationen
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-5 font-semibold text-gray-500 w-1/3">Status</td>
                    <td className="py-3 px-5 text-gray-700">
                      {event.cancelled ? <span className="text-red-700 font-semibold">Storniert</span> : isPastDeadline ? 'Anmeldeschluss vorbei' : 'Anmeldung offen'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-5 font-semibold text-gray-500">Info</td>
                    <td className="py-3 px-5 text-gray-700">
                      Beachten Sie die Verfügbarkeit pro Ticketkategorie.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-5 font-semibold text-gray-500">Anmelde-schluss</td>
                    <td className="py-3 px-5 text-gray-700">
                      {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-semibold text-gray-500">Gebühren</td>
                    <td className="py-3 px-5 font-bold text-luxury-gold">
                      {hasMultiplePrices && minPrice > 0 ? 'ab ' : ''}€ {minPrice.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="p-4 bg-gray-50 text-[10px] text-gray-400 italic">
                * Die finale Buchung wird geprüft.
              </div>
            </div>
          </div>

          {/* Organizer Sidebar */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
            <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
              Veranstalter
            </div>
            <div className="p-5">
              {event.organizerId ? (
                <Link to={`/veranstalter/${event.organizerId}`} className="text-luxury-gold hover:underline font-semibold">
                  {event.organizer || 'Flugschule Hirondelle'}
                </Link>
              ) : (
                <span className="text-gray-700 font-semibold">{event.organizer || 'Flugschule Hirondelle'}</span>
              )}
            </div>
          </div>

          {/* Additional Dates Sidebar - other upcoming occurrences of the same course */}
          {additionalDates.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
              <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
                Zusätzliche Termine
              </div>
              <div className="p-5 flex flex-col gap-2">
                {additionalDates.map(d => (
                  <button
                    key={d.id}
                    onClick={() => onSelectAdditionalDate?.(d.id)}
                    className="text-left text-luxury-gold hover:underline text-sm"
                  >
                    {new Date(d.start).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })}, {new Date(d.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Participants Sidebar - only shown if the backend confirms this
              visitor themselves has a booking on this event */}
          {participants && participants.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
              <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
                Teilnehmerliste
              </div>
              <div className="p-5 flex flex-col gap-1.5 text-sm text-gray-600">
                {participants.map((p, i) => (
                  <div key={i}>{p.name}</div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
