import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  price: number;
  capacity: number;
}

export const Events = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch('http://localhost:5555/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, []);

  const handleBook = async () => {
    // In a real flow, this would redirect to a checkout/login page.
    // For now, it will hit the booking API with a hardcoded user if not logged in, or ask to login.
    alert('Booking interface will be connected to Auth & Payment next!');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('events.title', 'Upcoming Events & Courses')}</h1>
      
      {events.length === 0 ? (
        <p className="text-center text-gray-500">{t('events.noEvents', 'No upcoming events at the moment.')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{event.description}</p>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="font-semibold text-blue-600">{new Date(event.date).toLocaleDateString()}</span>
                  <span className="font-bold text-lg">€{event.price}</span>
                </div>
                <button
                  onClick={handleBook}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition"
                >
                  {t('events.bookNow', 'Book Now')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
