import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';

interface RatingInfo {
  eventTitle: string;
  eventEnded: boolean;
  alreadyRated: boolean;
  rating: number | null;
  ratingComment: string | null;
}

// Public post-event rating page, reachable via the emailed link
// /bewertung/:bookingId (the booking's own id doubles as the link token).
export const RatingPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [info, setInfo] = useState<RatingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}/rating-info`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: RatingInfo) => setInfo(data))
      .catch(() => setError('Diese Bewertungsseite konnte nicht gefunden werden.'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleSubmit = async () => {
    if (rating < 1) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/bookings/${bookingId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Fehler beim Speichern der Bewertung');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Bewertung');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white font-luxurysans pb-20 min-h-[70vh]">
      <section className="pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-[700px]">
          <div className="mb-10 text-center">
            <h1 className="font-luxury text-3xl md:text-4xl text-luxury-dark uppercase mb-6 tracking-wide">
              Veranstaltung bewerten
            </h1>
            <div className="w-24 h-px bg-[#53a8c7] opacity-40 mx-auto"></div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Lädt...</p>
          ) : error && !info ? (
            <p className="text-center text-gray-500">{error}</p>
          ) : info ? (
            !info.eventEnded ? (
              <p className="text-center text-gray-600">
                Eine Bewertung für <strong>{info.eventTitle}</strong> ist erst nach der Veranstaltung möglich.
              </p>
            ) : info.alreadyRated || submitted ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Vielen Dank für Ihre Bewertung von <strong>{info.eventTitle}</strong>!
                </p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <Star
                      key={n}
                      className={`w-7 h-7 ${n <= (submitted ? rating : info.rating || 0) ? 'fill-[#53a8c7] text-[#53a8c7]' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-center text-gray-600 mb-8">
                  Wie hat Ihnen <strong>{info.eventTitle}</strong> gefallen?
                </p>
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${n} Sterne`}
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          n <= (hoverRating || rating) ? 'fill-[#53a8c7] text-[#53a8c7]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Ihr Kommentar (optional)"
                  rows={5}
                  className="w-full border border-gray-300 p-4 text-sm text-gray-700 focus:outline-none focus:border-[#53a8c7] mb-4"
                />
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="text-center">
                  <button
                    type="button"
                    disabled={rating < 1 || submitting}
                    onClick={handleSubmit}
                    className="bg-[#53a8c7] text-white uppercase tracking-wide text-sm font-semibold px-10 py-3 disabled:opacity-40 hover:bg-[#458fab] transition-colors"
                  >
                    {submitting ? 'Wird gesendet...' : 'Bewertung absenden'}
                  </button>
                </div>
              </div>
            )
          ) : null}
        </div>
      </section>
    </div>
  );
};
