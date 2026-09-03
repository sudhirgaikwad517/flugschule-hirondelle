import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const TrackingStoppen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const stopTracking = async () => {
      if (!email) {
        setStatus('error');
        return;
      }
      try {
        const res = await fetch('/api/newsletters/public/stop-tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        setStatus(res.ok ? 'success' : 'error');
      } catch {
        setStatus('error');
      }
    };
    stopTracking();
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-sm shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          {status === 'loading' && <Loader2 className="w-20 h-20 text-luxury-gold animate-spin" />}
          {status === 'success' && <CheckCircle className="w-20 h-20 text-green-500" />}
          {status === 'error' && <XCircle className="w-20 h-20 text-red-500" />}
        </div>

        <h1 className="font-luxury text-3xl text-luxury-dark mb-4">
          {status === 'loading' && 'Wird verarbeitet...'}
          {status === 'success' && 'Tracking gestoppt'}
          {status === 'error' && 'Vorgang fehlgeschlagen'}
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          {status === 'success' && 'Wir verfolgen Ihr Öffnungs- und Klickverhalten in unseren Newslettern nicht mehr. Sie erhalten den Newsletter weiterhin.'}
          {status === 'error' && 'Der Vorgang konnte nicht durchgeführt werden. Bitte versuchen Sie es später erneut.'}
        </p>

        <Link
          to="/"
          className="block w-full py-3 bg-luxury-gold text-white font-semibold rounded-sm hover:bg-[#aa883e] transition-colors"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
};
