import { useState } from 'react';

interface Props {
  organizerId: string;
  organizerName: string;
  onClose: () => void;
}

export const ContactOrganizerModal = ({ organizerId, organizerName, onClose }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(`/api/organizers/${organizerId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: 'success', text: 'Ihre Nachricht wurde erfolgreich gesendet.' });
        setName(''); setEmail(''); setMessage('');
      } else {
        setResult({ type: 'error', text: data.message || 'Fehler beim Senden der Nachricht.' });
      }
    } catch {
      setResult({ type: 'error', text: 'Fehler beim Senden der Nachricht.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-luxury text-2xl text-luxury-dark">Kontakt zu {organizerName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text" placeholder="Ihr Name" required value={name} onChange={e => setName(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
          />
          <input
            type="email" placeholder="Ihre E-Mail" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
          />
          <textarea
            placeholder="Ihre Nachricht" required rows={5} value={message} onChange={e => setMessage(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold resize-none"
          />
          {result && (
            <p className={`text-sm font-semibold ${result.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{result.text}</p>
          )}
          <button
            type="submit" disabled={sending}
            className="px-8 py-2.5 bg-[#5bc0de] text-white hover:bg-[#46b8da] transition-colors rounded-sm shadow-sm disabled:opacity-50"
          >
            {sending ? 'Sende...' : 'Nachricht senden'}
          </button>
        </form>
      </div>
    </div>
  );
};
