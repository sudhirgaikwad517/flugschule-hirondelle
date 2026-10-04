import { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { Save, RotateCw, CheckCircle2 } from 'lucide-react';

// Old AcyMailing's real IMAP-mailbox-polling bounce handling
// (MailboxHelper.php) - a dedicated inbox that receives bounced-message
// notifications is polled periodically (see bounceChecker.service.ts /
// bounceCheck.job.ts); hard-bounce addresses get suppressed automatically.
// This page holds the mailbox settings and the resulting suppression list.
interface BounceSettings {
  bounceCheckEnabled: boolean;
  bounceImapHost: string;
  bounceImapPort: string;
  bounceImapUser: string;
  bounceImapPass?: string;
  hasBounceImapPass?: boolean;
  bounceImapTls: boolean;
  lastBounceCheckAt?: string | null;
}

interface BouncedSubscriber {
  id: string;
  email: string;
  name: string | null;
  listType: string;
  bounceReason: string | null;
  bouncedAt: string | null;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const AcyBounces = () => {
  const [settings, setSettings] = useState<BounceSettings>({
    bounceCheckEnabled: false, bounceImapHost: '', bounceImapPort: '993',
    bounceImapUser: '', bounceImapTls: true
  });
  const [bounces, setBounces] = useState<BouncedSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const fetchSettings = async () => {
    const res = await fetch('/api/newsletterconfig/default', { headers: authHeaders() });
    if (res.ok) setSettings(await res.json());
  };
  const fetchBounces = async () => {
    const res = await fetch('/api/newsletterbounces?_end=500', { headers: authHeaders() });
    if (res.ok) setBounces(await res.json());
  };

  useEffect(() => {
    Promise.all([fetchSettings(), fetchBounces()]).finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/newsletterconfig/default', {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) setSettings(await res.json());
    } finally {
      setSaving(false);
    }
  };

  const handleCheckNow = async () => {
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch('/api/newsletterbounces/check-now', { method: 'POST', headers: authHeaders() });
      const data = await res.json();
      if (data.skipped) {
        setCheckResult('Bounce-Prüfung ist nicht konfiguriert oder deaktiviert.');
      } else if (data.error) {
        setCheckResult(`Fehler: ${data.error}`);
      } else {
        setCheckResult(`${data.checked} Nachricht(en) geprüft, ${data.suppressed} Abonnent(en) gesperrt.`);
      }
      fetchBounces();
      fetchSettings();
    } finally {
      setChecking(false);
    }
  };

  const reactivate = async (id: string) => {
    await fetch(`/api/newsletterbounces/${id}/reactivate`, { method: 'POST', headers: authHeaders() });
    fetchBounces();
  };

  if (loading) return <AcyLayout><div className="p-8 text-slate-500">Lädt...</div></AcyLayout>;

  return (
    <AcyLayout title="Flugschule Mailing > Bounces">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-slate-800">Bounce-Mailbox</h3>
          <div className="flex gap-3">
            <button onClick={handleCheckNow} disabled={checking} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 disabled:opacity-50">
              <RotateCw size={16} className={checking ? 'animate-spin' : ''} /> {checking ? 'Prüfe...' : 'Jetzt prüfen'}
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-md font-medium disabled:opacity-50">
              <Save size={16} /> {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Ein IMAP-Postfach, das unzustellbare Nachrichten (Bounces) empfängt - meist dieselbe Adresse, die Ihr
          E-Mail-Anbieter als "Return-Path" verwendet. Wird alle 30 Minuten automatisch geprüft; dauerhaft unzustellbare
          Adressen werden automatisch vom Versand ausgeschlossen.
        </p>

        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input type="checkbox" name="bounceCheckEnabled" checked={settings.bounceCheckEnabled} onChange={handleChange} className="rounded text-[#0ea5e9] focus:ring-[#0ea5e9]" />
          <span className="text-sm font-medium text-slate-700">Bounce-Prüfung aktivieren</span>
        </label>

        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">IMAP-Server (Host)</label>
            <input type="text" name="bounceImapHost" value={settings.bounceImapHost || ''} onChange={handleChange} placeholder="z.B. imap.strato.de" className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
            <input type="text" name="bounceImapPort" value={settings.bounceImapPort || '993'} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Benutzername</label>
            <input type="text" name="bounceImapUser" value={settings.bounceImapUser || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
            <input
              type="password" name="bounceImapPass" value={(settings as any).bounceImapPass || ''} onChange={handleChange}
              placeholder={settings.hasBounceImapPass ? '•••••••• (aktuell gesetzt - leer lassen zum Beibehalten)' : 'Passwort eingeben'}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="bounceImapTls" checked={settings.bounceImapTls} onChange={handleChange} className="rounded text-[#0ea5e9] focus:ring-[#0ea5e9]" />
            <span className="text-sm text-slate-700">TLS/SSL verwenden</span>
          </label>
        </div>

        {settings.lastBounceCheckAt && (
          <p className="text-xs text-slate-400 mt-4">Zuletzt geprüft: {new Date(settings.lastBounceCheckAt).toLocaleString('de-DE')}</p>
        )}
        {checkResult && (
          <p className="text-sm text-slate-700 mt-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600" /> {checkResult}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Gesperrte Abonnenten ({bounces.length})</h3>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">E-Mail</th>
              <th className="px-4 py-3 font-medium">Liste</th>
              <th className="px-4 py-3 font-medium">Grund</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bounces.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Keine gesperrten Abonnenten.</td></tr>
            ) : (
              bounces.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{b.email}</td>
                  <td className="px-4 py-3">{b.listType}</td>
                  <td className="px-4 py-3 text-slate-500">{b.bounceReason || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{b.bouncedAt ? new Date(b.bouncedAt).toLocaleDateString('de-DE') : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => reactivate(b.id)} className="text-[#0ea5e9] hover:underline text-sm font-medium">Reaktivieren</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AcyLayout>
  );
};
