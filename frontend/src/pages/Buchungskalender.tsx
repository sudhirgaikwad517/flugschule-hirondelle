import React, { useState, useEffect, useRef } from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { Banner } from '../components/common/Banner';
import { EventBookingModal } from '../components/events/EventBookingModal';
import { EventDetailsView } from '../components/events/EventDetailsView';
import { useParams, useNavigate } from 'react-router-dom';

type Category = 
  | 'ALLE ANZEIGEN'
  | 'Schnupperkurs'
  | 'Grundkurs'
  | 'Höhenflugschulung (A-Schein)'
  | 'Groundhandlingkurs'
  | 'Reisen'
  | 'Performance Training'
  | 'Refresherkurs'
  | 'Unbeschr. LF-Schein (B-Schein)'
  | 'Windenschulung'
  | 'Thermik- und Streckenseminar'
  | 'Sonstiges'
  | 'Rettungsgerätetraining';

const categoryColors: Record<Category, { bg: string, text: string }> = {
  'ALLE ANZEIGEN': { bg: '#d1d5db', text: '#374151' }, // gray-300
  'Schnupperkurs': { bg: '#8bc34a', text: '#ffffff' },
  'Grundkurs': { bg: '#008000', text: '#ffffff' },
  'Höhenflugschulung (A-Schein)': { bg: '#ffc107', text: '#000000' },
  'Groundhandlingkurs': { bg: '#2980b9', text: '#ffffff' },
  'Reisen': { bg: '#488ac7', text: '#ffffff' }, // Blue matching screenshots
  'Performance Training': { bg: '#d35400', text: '#ffffff' },
  'Refresherkurs': { bg: '#663399', text: '#ffffff' },
  'Unbeschr. LF-Schein (B-Schein)': { bg: '#e67e22', text: '#ffffff' },
  'Windenschulung': { bg: '#ffee00', text: '#000000' },
  'Thermik- und Streckenseminar': { bg: '#28a745', text: '#ffffff' },
  'Sonstiges': { bg: '#bdc3c7', text: '#374151' },
  'Rettungsgerätetraining': { bg: '#5bc0de', text: '#ffffff' },
};

interface Ticket {
  id: string;
  name: string;
  price: number;
  description?: string;
  capacity?: number;
  bookedCount?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  category: Category;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
  location?: string;
  registrationDeadline?: string;
  imageUrl?: string;
  organizer?: string;
  maxParticipants?: number;
  tickets?: Ticket[];
}

// Fetch events hook
const useEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5555/api/events')
      .then(res => res.json())
      .then(data => {
        const parsed = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          category: (e.category || 'Sonstiges') as Category,
          start: new Date(e.startDate),
          end: e.endDate ? new Date(e.endDate) : new Date(e.startDate),
          color: e.color,
          description: e.description,
          location: e.location,
          registrationDeadline: e.registrationDeadline,
          imageUrl: e.imageUrl,
          organizer: e.organizer,
          maxParticipants: e.maxParticipants,
          tickets: e.tickets
        }));
        setEvents(parsed);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return { events, loading };
};


const germanDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const germanMonths = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export const Buchungskalender = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const { events, loading } = useEvents();
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALLE ANZEIGEN');
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<CalendarEvent | null>(null);
  const [selectedTicketQuantities, setSelectedTicketQuantities] = useState<Record<string, number>>({});
  const calendarRef = useRef<HTMLDivElement>(null);

  const selectedEventForDetails = eventId ? events.find(e => e.id === eventId) : null;

  // Initialize tooltips
  useEffect(() => {
    if (!loading && calendarRef.current) {
      tippy('.event-block', {
        theme: 'light',
        allowHTML: true,
        placement: 'right-start', // Match screenshot placement
        interactive: true, // Allow clicking links inside the tooltip
        maxWidth: 450, // Make it wider to fit content like the screenshot
        delay: [200, 0],
        appendTo: document.body,
      });
    }
  }, [loading, events, selectedCategory, activeYear]);

  // Generate calendar months for the active year
  const months = Array.from({ length: 12 }, (_, i) => {
    const daysInMonth = new Date(activeYear, i + 1, 0).getDate();
    const firstDayIndex = new Date(activeYear, i, 1).getDay(); // 0 = Sunday
    return {
      monthIndex: i,
      name: germanMonths[i],
      daysInMonth,
      firstDayIndex
    };
  });

  const getFilteredEvents = () => {
    if (selectedCategory === 'ALLE ANZEIGEN') return events;
    return events.filter(e => e.category === selectedCategory);
  };

  const filteredEvents = getFilteredEvents();

  // Helper to determine layout rows for events in a month
  const getEventRowsForMonth = (monthIndex: number, daysInMonth: number) => {
    const monthStart = new Date(activeYear, monthIndex, 1);
    const monthEnd = new Date(activeYear, monthIndex, daysInMonth);
    
    // Find events that overlap with this month
    const monthEvents = filteredEvents.filter(e => {
      return e.start <= monthEnd && e.end >= monthStart;
    });

    const rows: { event: CalendarEvent, startDay: number, endDay: number }[][] = [];

    // Sort events by start date, then duration
    monthEvents.sort((a, b) => {
      if (a.start.getTime() !== b.start.getTime()) return a.start.getTime() - b.start.getTime();
      return (b.end.getTime() - b.start.getTime()) - (a.end.getTime() - a.start.getTime());
    });

    monthEvents.forEach(e => {
      // Calculate start and end day clamped to this month (1-indexed)
      const startDay = e.start < monthStart ? 1 : e.start.getDate();
      const endDay = e.end > monthEnd ? daysInMonth : e.end.getDate();

      // Find first row where it fits
      let rowIndex = 0;
      let fitted = false;
      while (!fitted) {
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }
        // Check overlap
        const overlaps = rows[rowIndex].some(existing => {
          return !(endDay < existing.startDay || startDay > existing.endDay);
        });
        
        if (!overlaps) {
          rows[rowIndex].push({ event: e, startDay, endDay });
          fitted = true;
        } else {
          rowIndex++;
        }
      }
    });

    return rows;
  };

  return (
    <div className="w-full bg-white pb-20">
      <Banner />

      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        {/* Main Title */}
        <div className="text-center mb-16 mt-8">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide break-words hyphens-auto uppercase">
            TERMINE
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto mb-8"></div>
        </div>

        {selectedEventForDetails ? (
          <div className="mt-8">
            <EventDetailsView 
              event={selectedEventForDetails} 
              onBack={() => navigate('/buchungskalender')}
              onBook={(quantities) => {
                const token = localStorage.getItem('token');
                if (!token) {
                  navigate('/anmeldung?redirect=' + encodeURIComponent(`/buchungskalender/${selectedEventForDetails.id}`));
                  return;
                }
                setSelectedTicketQuantities(quantities);
                setSelectedEventForBooking(selectedEventForDetails);
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-12 mb-16">
              {/* Intro Text */}
              <div className="w-full lg:w-1/2 flex flex-col items-start">
                <p className="text-gray-500 leading-relaxed font-light mb-8 max-w-2xl text-[15px]">
                  Klickt einfach im Kalender auf den entsprechenden Termin für Details und Buchung. Über die Buttons rechts könnt ihr die Termine der Kategorien ein-/ausblenden.
                </p>
                <div className="mb-8 w-full">
                  <span className="text-[14px] mr-4 text-gray-500 italic font-luxury text-lg">Hier geht's zur</span>
                  <button className="px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm">
                    LISTENANSICHT
                  </button>
                </div>
                <p className="text-gray-400 text-[13px] leading-relaxed font-light">
                  Wir empfehlen zur Absicherung für Stornos / Absagen den Abschluss einer Seminarversicherung bzw. für unsere mehrtätigen Kurse / Reisen zusätzlich eine Reiseversicherung. Diese kann auch nach Buchung abgeschlossen werden. Infos dazu findet ihr hier sowie in eurer Buchungsbestätigung, die ihr nach Buchungsabschluss per E-Mail erhaltet.
                </p>
              </div>

          {/* Filters */}
          <div className="w-full lg:w-1/2">
            <div className="w-full">
              <button 
                onClick={() => setSelectedCategory('ALLE ANZEIGEN')}
                className={`w-full py-2.5 text-[10px] font-bold tracking-widest uppercase transition-opacity hover:opacity-90 mb-2 rounded-sm ${selectedCategory === 'ALLE ANZEIGEN' ? 'ring-2 ring-offset-2 ring-luxury-slate' : ''}`}
                style={{ backgroundColor: categoryColors['ALLE ANZEIGEN'].bg, color: categoryColors['ALLE ANZEIGEN'].text }}
              >
                ALLE ANZEIGEN
              </button>
              <div className="grid grid-cols-2 gap-2">
                {/* Column 1 */}
                <div className="flex flex-col gap-2">
                  {['Schnupperkurs', 'Höhenflugschulung (A-Schein)', 'Reisen', 'Refresherkurs', 'Windenschulung', 'Sonstiges'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat as Category)}
                      className={`w-full py-2.5 px-2 text-[10px] font-bold tracking-widest uppercase truncate transition-opacity hover:opacity-90 rounded-sm ${selectedCategory === cat ? 'ring-2 ring-offset-2 ring-luxury-slate' : ''}`}
                      style={{ backgroundColor: categoryColors[cat as Category].bg, color: categoryColors[cat as Category].text }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Column 2 */}
                <div className="flex flex-col gap-2">
                  {['Grundkurs', 'Groundhandlingkurs', 'Performance Training', 'Unbeschr. LF-Schein (B-Schein)', 'Thermik- und Streckenseminar', 'Rettungsgerätetraining'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat as Category)}
                      className={`w-full py-2.5 px-2 text-[10px] font-bold tracking-widest uppercase truncate transition-opacity hover:opacity-90 rounded-sm ${selectedCategory === cat ? 'ring-2 ring-offset-2 ring-luxury-slate' : ''}`}
                      style={{ backgroundColor: categoryColors[cat as Category].bg, color: categoryColors[cat as Category].text }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center justify-center mb-16 mt-8">
          <button 
            onClick={() => setActiveYear(activeYear - 1)} 
            className="px-6 py-2 bg-transparent text-gray-400 hover:text-luxury-gold transition-colors font-luxury text-2xl"
          >
            &lt; {activeYear - 1}
          </button>
          <div className="px-10 py-3 bg-luxury-gold text-white font-luxury text-4xl shadow-md rounded-sm mx-4">
            {activeYear}
          </div>
          <button 
            onClick={() => setActiveYear(activeYear + 1)} 
            className="px-6 py-2 bg-transparent text-gray-400 hover:text-luxury-gold transition-colors font-luxury text-2xl"
          >
            {activeYear + 1} &gt;
          </button>
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="flex justify-center py-20 text-gray-500">Lade Termine...</div>
        ) : (
        <div ref={calendarRef} className="flex flex-col gap-12 pb-4 w-full">
          {months.map(month => {
            const rows = getEventRowsForMonth(month.monthIndex, month.daysInMonth);
            const totalRows = Math.max(rows.length, 3); // Minimum 3 empty event rows for visual consistency
            
            // Generate day headers
            const days = Array.from({ length: month.daysInMonth }, (_, i) => {
              const date = new Date(activeYear, month.monthIndex, i + 1);
              const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              return { num: i + 1, name: germanDays[dayOfWeek], isWeekend };
            });

            return (
              <div key={month.name} className="w-full mb-4">
                <h3 className="text-gray-700 font-bold mb-2">{month.name}</h3>
                <div className="overflow-x-auto pb-4 w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div 
                    className="border-t border-l border-gray-200 relative min-w-full" 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: `repeat(${month.daysInMonth}, minmax(32px, 1fr))`
                    }}
                  >
                    {/* Days Header (Row 1) */}
                    {days.map(d => (
                      <div 
                        key={`header-${d.num}`} 
                        className={`text-center py-1 z-10 border-b border-gray-300 ${d.isWeekend ? 'bg-gray-200' : 'bg-gray-100'}`}
                        style={{ gridColumn: d.num, gridRow: 1 }}
                      >
                        <div className="text-[12px] text-gray-800 font-medium">{d.num}</div>
                        <div className="text-[10px] text-gray-500">{d.name}</div>
                      </div>
                    ))}

                  {/* Grid Cells (Empty Background for all rows) */}
                  {Array.from({ length: totalRows }).map((_, rIdx) => 
                    days.map(d => (
                      <div 
                        key={`cell-${rIdx}-${d.num}`} 
                        className={`border-r border-b border-gray-200 ${d.isWeekend ? 'bg-gray-100' : 'bg-white'}`}
                        style={{ 
                          gridColumn: d.num, 
                          gridRow: rIdx + 2,
                          minHeight: '28px',
                          height: '100%'
                        }}
                      />
                    ))
                  )}

                  {/* Events (Row 2+) */}
                  {rows.map((row, rIdx) => 
                    row.map(item => {
                      const isSingleDay = item.startDay === item.endDay;
                      
                      const getAbbreviation = (title: string) => {
                        const t = title.toLowerCase();
                        if (t.includes('rettungs')) return 'RET';
                        if (t.includes('refresher')) return 'RE';
                        if (t.includes('winde')) return 'Winde';
                        if (t.includes('b-th')) return 'B-TH';
                        return title.length > 6 ? title.substring(0, 3).toUpperCase() : title;
                      };
                      
                      const displayText = isSingleDay ? getAbbreviation(item.event.title) : item.event.title;
                      
                      return (
                      <div 
                        key={item.event.id}
                        onClick={() => navigate(`/buchungskalender/${item.event.id}`)}
                        data-tippy-content={`
                          <div class='p-5 text-left bg-white font-sans'>
                            <h4 class='font-luxury text-2xl text-luxury-dark mb-1'>${item.event.title}</h4>
                            <div class='flex flex-col gap-1 mb-4 pb-4 border-b border-gray-100'>
                              <div class='flex items-center gap-2 text-[12px] text-gray-500 font-semibold'>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
                                ${item.event.category}
                              </div>
                              ${item.event.tickets && item.event.tickets.length > 0 ? `
                              <div class='flex items-center gap-2 text-[12px] text-gray-800 font-bold'>
                                <svg class="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                ab €${Math.min(...item.event.tickets.map(t => t.price))} Euro
                              </div>
                              ` : ''}
                            </div>
                            
                            <div class='text-[13px] text-gray-600 mb-6 leading-relaxed max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'>
                              ${item.event.description ? item.event.description.replace(/\\n/g, '<br/>') : 'Keine Beschreibung verfügbar.'}
                            </div>
                            
                            <a href='/reisen/${item.event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}' class='text-luxury-gold text-[12px] uppercase tracking-widest font-bold hover:text-luxury-dark transition-colors inline-flex items-center gap-2'>
                              Zur Reisebeschreibung
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </a>
                          </div>
                        `}
                        className={`event-block rounded-sm px-1 py-[2px] m-[2px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity z-20 ${isSingleDay ? 'flex items-center whitespace-nowrap overflow-hidden text-ellipsis h-[24px]' : 'block whitespace-normal break-words h-full min-h-[24px]'}`}
                        style={{ 
                          gridColumn: `${item.startDay} / ${item.endDay + 1}`,
                          gridRow: rIdx + 2,
                          backgroundColor: item.event.color || categoryColors[item.event.category]?.bg || '#bdc3c7',
                          color: categoryColors[item.event.category]?.text || '#374151',
                        }}
                      >
                        <span className={`font-semibold leading-tight ${isSingleDay ? 'text-[11px] block text-center w-full' : 'text-[10px] block'}`}>
                          {displayText}
                        </span>
                      </div>
                    );
                  })
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
        </>
        )}

        <EventBookingModal 
          isOpen={!!selectedEventForBooking} 
          onClose={() => setSelectedEventForBooking(null)} 
          event={selectedEventForBooking} 
          initialQuantities={selectedTicketQuantities}
        />

      </div>
    </div>
  );
};
