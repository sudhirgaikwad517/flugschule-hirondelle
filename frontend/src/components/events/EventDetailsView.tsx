import React from 'react';

interface Ticket {
  id: string;
  name: string;
  price: number;
  capacity?: number;
  bookedCount?: number;
}

interface EventDetailsViewProps {
  event: any;
  onBack: () => void;
  onBook: (quantities: Record<string, number>) => void;
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({ event, onBack, onBook }) => {
  const [ticketQuantities, setTicketQuantities] = React.useState<Record<string, number>>({});
  
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
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-luxury-gold transition-colors text-sm uppercase tracking-widest font-semibold"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Zurück zum Kalender
      </button>

      {/* Main Title & Action Bar */}
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase tracking-wide mb-4">
            {event.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>
                {new Date(event.start || event.startDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {event.end && event.end !== event.start ? ` bis ${new Date(event.end || event.endDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
              </span>
            </div>
            
            <div className="hidden sm:block text-gray-300">|</div>
            
            <div className="flex items-center gap-2 text-luxury-gold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              <span className="font-semibold">{event.category}</span>
            </div>
          </div>
        </div>
        
        {/* Print Button */}
        <button 
          onClick={() => window.print()}
          className="text-gray-400 hover:text-luxury-dark transition-colors p-2"
          title="Drucken"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column - Main Details */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          
          {/* Booking Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-sm overflow-hidden">
            <div className="bg-luxury-slate/10 border-b border-gray-200 text-luxury-dark py-3 px-5 font-luxury text-xl tracking-wide">
              Buchen Sie jetzt!
            </div>
            <div className="p-6">
              {isPastDeadline ? (
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
            </div>
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
                      {isPastDeadline ? 'Anmeldeschluss vorbei' : 'Anmeldung offen'}
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
              <a href="#" className="text-luxury-gold hover:underline font-semibold">
                {event.organizer || 'Flugschule Hirondelle'}
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
