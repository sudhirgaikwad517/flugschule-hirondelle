import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const Abmelden: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const list = searchParams.get('list');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [settings, setSettings] = useState<{ unsubscribeTitle: string | null; unsubscribeColor: string }>({ unsubscribeTitle: null, unsubscribeColor: '#00a4ff' });

  useEffect(() => {
    fetch('/api/newsletterconfig/public/newsletter-settings')
      .then(res => res.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setStatus('error');
        return;
      }
      try {
        const res = await fetch('/api/newsletters/public/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, listType: list })
        });
        setStatus(res.ok ? 'success' : 'error');
      } catch {
        setStatus('error');
      }
    };
    unsubscribe();
  }, [email, list]);

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
          {status === 'success' && (settings.unsubscribeTitle || 'Erfolgreich abgemeldet')}
          {status === 'error' && 'Abmeldung fehlgeschlagen'}
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          {status === 'success' && `Sie wurden erfolgreich vom Newsletter abgemeldet${email ? ` (${email})` : ''}. Sie erhalten ab sofort keine weiteren E-Mails mehr von uns.`}
          {status === 'error' && 'Die Abmeldung konnte nicht durchgeführt werden. Bitte kontaktieren Sie uns direkt oder versuchen Sie es später erneut.'}
        </p>

        <Link
          to="/"
          className="block w-full py-3 text-white font-semibold rounded-sm transition-colors hover:opacity-90"
          style={{ backgroundColor: settings.unsubscribeColor }}
        >
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
};
