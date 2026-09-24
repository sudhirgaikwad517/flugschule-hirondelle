import { useState, useEffect } from 'react';

export type Category = 
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

// Exact hex values from old Matukio's own $categoryColors dictionary
// (components/com_matukio/views/brcalendar/tmpl/default.php) - this is only
// the fallback used when an event has no per-event calendarBgColor of its
// own, same as in the old system.
export const categoryColors: Record<Category, { bg: string, text: string }> = {
  'ALLE ANZEIGEN': { bg: '#d1d5db', text: '#374151' }, // gray-300 (not part of old's dict - UI-only "show all" filter chip)
  'Schnupperkurs': { bg: '#80C533', text: '#ffffff' },
  'Grundkurs': { bg: '#008000', text: '#ffffff' },
  'Höhenflugschulung (A-Schein)': { bg: '#FFCD00', text: '#000000' },
  'Groundhandlingkurs': { bg: '#3274B7', text: '#ffffff' },
  'Reisen': { bg: '#429CBF', text: '#ffffff' },
  'Performance Training': { bg: '#D24F25', text: '#ffffff' },
  'Refresherkurs': { bg: '#4F0C9B', text: '#ffffff' },
  'Unbeschr. LF-Schein (B-Schein)': { bg: '#E58E26', text: '#ffffff' },
  'Windenschulung': { bg: '#FFF000', text: '#000000' },
  'Thermik- und Streckenseminar': { bg: '#34963B', text: '#ffffff' },
  'Sonstiges': { bg: '#C4C5CA', text: '#374151' },
  'Rettungsgerätetraining': { bg: '#59ABDE', text: '#ffffff' },
};

export interface Ticket {
  id: string;
  name: string;
  price: number;
  description?: string;
  capacity?: number;
  bookedCount?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  category: Category;
  start: Date;
  end: Date;
  color?: string;
  calendarTextColor?: string;
  description?: string;
  location?: string;
  locationId?: string;
  registrationDeadline?: string;
  imageUrl?: string;
  detailImageUrl?: string;
  organizer?: string;
  organizerId?: string;
  maxParticipants?: number;
  tickets?: Ticket[];
  tags?: string;
  eventNumber?: string;
  bookingNumber?: string;
  seriesId?: string;
  cancelled?: boolean;
  onExceed?: string; // 'waitlist' | 'stop' - old: stopbooking (0/2 = waitlist, 1 = stop)
  tieredFees?: boolean;
  eventTieredFees?: {
    title?: string;
    value?: number;
    isPercentage?: boolean;
    isDiscount?: boolean;
    bookableFor?: string;
    validFrom?: string;
    validUntil?: string;
  }[];
  extraFeeOptions?: {
    title?: string;
    value?: number;
    perPlace?: boolean;
  }[];
}

export const useEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events?published=true&_end=10000')
      .then(res => res.json())
      .then(data => {
        const parsed = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          category: (e.category || 'Sonstiges') as Category,
          start: new Date(e.startDate),
          end: e.endDate ? new Date(e.endDate) : new Date(e.startDate),
          color: e.color,
          calendarTextColor: e.calendarTextColor,
          description: e.description,
          location: e.location,
          locationId: e.locationId,
          registrationDeadline: e.registrationDeadline,
          imageUrl: e.imageUrl,
          detailImageUrl: e.detailImageUrl,
          organizer: e.organizer,
          organizerId: e.organizerId,
          maxParticipants: e.maxParticipants,
          tickets: e.tickets,
          tags: e.tags,
          eventNumber: e.eventNumber,
          bookingNumber: e.bookingNumber,
          seriesId: e.seriesId,
          cancelled: e.cancelled,
          onExceed: e.onExceed,
          tieredFees: e.tieredFees,
          eventTieredFees: e.eventTieredFees,
          extraFeeOptions: e.extraFeeOptions
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
