import { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { Save, Download, Trash2 } from 'lucide-react';

interface Config {
  id: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
  queueBatchSize: number;
  queuePauseSeconds: number;
  queueMaxRetries: number;
  requireConfirmation: boolean;
  unsubscribeTitle: string;
  unsubscribeColor: string;
  gdprExportEnabled: boolean;
  gdprDeleteEnabled: boolean;
}

const DEFAULT_CONFIG: Config = {
  id: 'default',
  smtpHost: '',
  smtpPort: '',
  smtpUser: '',
  smtpPass: '',
  fromEmail: '',
  fromName: '',
  queueBatchSize: 50,
  queuePauseSeconds: 0,
  queueMaxRetries: 2,
  requireConfirmation: false,
  unsubscribeTitle: '',
  unsubscribeColor: '#00a4ff',
  gdprExportEnabled: true,
  gdprDeleteEnabled: true
};

export const AcyConfiguration = () => {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('mail');
  const [gdprEmail, setGdprEmail] = useState('');
  const [gdprBusy, setGdprBusy] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newsletterconfig/default', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConfig({ ...DEFAULT_CONFIG, ...data });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newsletterconfig/default', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        alert('Konfiguration erfolgreich gespeichert.');
      } else {
        alert('Fehler beim Speichern der Konfiguration.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleGdprExport = async () => {
    if (!gdprEmail) {
      alert('Bitte eine E-Mail-Adresse eingeben.');
      return;
    }
    const token = localStorage.getItem('auth');
    const res = await fetch(`/api/newsletters/gdpr-export?email=${encodeURIComponent(gdprEmail)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      alert('Export fehlgeschlagen.');
      return;
    }
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdpr-export-${gdprEmail}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGdprDelete = async () => {
    if (!gdprEmail) {
      alert('Bitte eine E-Mail-Adresse eingeben.');
      return;
    }
    if (!window.confirm(`Wirklich ALLE Daten für "${gdprEmail}" unwiderruflich löschen?`)) return;

    setGdprBusy(true);
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newsletters/gdpr-delete?email=${encodeURIComponent(gdprEmail)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Gelöscht: ${data.deletedSubscriptions} Abonnement(s), ${data.deletedQueueEntries} Versandeintrag/-einträge.`);
        setGdprEmail('');
      } else {
        alert(data.message || 'Löschung fehlgeschlagen.');
      }
    } finally {
      setGdprBusy(false);
    }
  };

  if (loading) return <AcyLayout><div className="p-8 text-slate-500">Lade Konfiguration...</div></AcyLayout>;

  const tabs = [
    { id: 'mail', label: 'Mail-Konfiguration' },
    { id: 'queue', label: 'Warteschlange' },
    { id: 'subscription', label: 'Abonnement' },
    { id: 'gdpr', label: 'Datenschutz' }
  ];

  return (
    <AcyLayout title="AcyMailing > Konfiguration">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === tab.id ? 'bg-[#0ea5e9] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50">
          <Save size={18} /> {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        {activeTab === 'mail' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-2">SMTP-Einstellungen</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Absender-E-Mail</label>
                <input
                  type="email"
                  name="fromEmail"
                  value={config.fromEmail || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Absender-Name</label>
                <input
                  type="text"
                  name="fromName"
                  value={config.fromName || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-medium text-slate-700">SMTP Server</h4>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Server (Host)</label>
                <input
                  type="text"
                  name="smtpHost"
                  value={config.smtpHost || ''}
                  onChange={handleChange}
                  placeholder="z.B. smtp.strato.de"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
                  <input
                    type="text"
                    name="smtpPort"
                    value={config.smtpPort || ''}
                    onChange={handleChange}
                    placeholder="z.B. 465 oder 587"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Benutzername</label>
                  <input
                    type="text"
                    name="smtpUser"
                    value={config.smtpUser || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
                  <input
                    type="password"
                    name="smtpPass"
                    value={config.smtpPass || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-2">Warteschlange (Versandgeschwindigkeit)</h3>
            <p className="text-sm text-slate-500">
              Steuert, wie schnell Newsletter versendet werden. Wichtig, um die Versandlimits Ihres Mailservers
              (z.B. bei All-Inkl oder anderen Shared-Hosting-Anbietern) nicht zu überschreiten.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-Mails pro Durchlauf (alle 60 Sekunden)
              </label>
              <input
                type="number"
                name="queueBatchSize"
                min={1}
                value={config.queueBatchSize}
                onChange={handleChange}
                className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
              />
              <p className="text-xs text-slate-500 mt-1">Wie viele E-Mails maximal in einem Durchlauf verarbeitet werden.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pause zwischen einzelnen E-Mails (Sekunden)</label>
              <input
                type="number"
                name="queuePauseSeconds"
                min={0}
                value={config.queuePauseSeconds}
                onChange={handleChange}
                className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
              />
              <p className="text-xs text-slate-500 mt-1">Erhöhen Sie diesen Wert, falls Ihr Mailserver Sie sonst blockiert.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maximale Anzahl Wiederholungsversuche</label>
              <input
                type="number"
                name="queueMaxRetries"
                min={0}
                value={config.queueMaxRetries}
                onChange={handleChange}
                className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
              />
              <p className="text-xs text-slate-500 mt-1">Wie oft ein fehlgeschlagener Versand erneut versucht wird, bevor er endgültig als fehlgeschlagen markiert wird.</p>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-2">Abonnement</h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="requireConfirmation"
                checked={config.requireConfirmation}
                onChange={handleChange}
                className="mt-1 rounded text-[#0ea5e9] focus:ring-[#0ea5e9]"
              />
              <span>
                <span className="block font-medium text-slate-800">Double-Opt-In (Bestätigung per E-Mail erforderlich)</span>
                <span className="block text-sm text-slate-500">Neue Abonnenten müssen ihre E-Mail-Adresse über einen Bestätigungslink verifizieren, bevor sie Newsletter erhalten.</span>
              </span>
            </label>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="font-medium text-slate-700">Abmeldeseite anpassen</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titel nach erfolgreicher Abmeldung</label>
                <input
                  type="text"
                  name="unsubscribeTitle"
                  value={config.unsubscribeTitle || ''}
                  onChange={handleChange}
                  placeholder="Erfolgreich abgemeldet"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Farbe</label>
                <input
                  type="color"
                  name="unsubscribeColor"
                  value={config.unsubscribeColor || '#00a4ff'}
                  onChange={handleChange}
                  className="w-16 h-8 p-0 border-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gdpr' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-2">Datenschutz (DSGVO)</h3>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="gdprExportEnabled" checked={config.gdprExportEnabled} onChange={handleChange} className="rounded text-[#0ea5e9] focus:ring-[#0ea5e9]" />
                <span className="text-sm text-slate-700">Datenexport aktivieren</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="gdprDeleteEnabled" checked={config.gdprDeleteEnabled} onChange={handleChange} className="rounded text-[#0ea5e9] focus:ring-[#0ea5e9]" />
                <span className="text-sm text-slate-700">Löschung aktivieren</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-medium text-slate-700">Abonnentendaten exportieren oder löschen</h4>
              <p className="text-sm text-slate-500">Für Auskunfts- oder Löschanfragen nach DSGVO Art. 15/17.</p>
              <div className="flex gap-2 max-w-lg">
                <input
                  type="email"
                  value={gdprEmail}
                  onChange={(e) => setGdprEmail(e.target.value)}
                  placeholder="E-Mail-Adresse des Abonnenten"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                />
                <button
                  onClick={handleGdprExport}
                  disabled={!config.gdprExportEnabled}
                  className="px-4 py-2 border border-[#0ea5e9] text-[#0ea5e9] rounded font-medium hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download size={16} /> Export
                </button>
                <button
                  onClick={handleGdprDelete}
                  disabled={!config.gdprDeleteEnabled || gdprBusy}
                  className="px-4 py-2 border border-red-400 text-red-600 rounded font-medium hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Trash2 size={16} /> Löschen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AcyLayout>
  );
};
