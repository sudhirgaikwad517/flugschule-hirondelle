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

export const categoryColors: Record<Category, { bg: string, text: string }> = {
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
  organizer?: string;
  organizerId?: string;
  maxParticipants?: number;
  tickets?: Ticket[];
  tags?: string;
  eventNumber?: string;
  seriesId?: string;
  cancelled?: boolean;
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
}

export const useEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events?published=true&_end=1000')
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
          organizer: e.organizer,
          organizerId: e.organizerId,
          maxParticipants: e.maxParticipants,
          tickets: e.tickets,
          tags: e.tags,
          eventNumber: e.eventNumber,
          seriesId: e.seriesId,
          cancelled: e.cancelled,
          tieredFees: e.tieredFees,
          eventTieredFees: e.eventTieredFees
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
