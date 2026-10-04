import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AcyLayout } from './AcyLayout';
import { ArrowLeft, XCircle } from 'lucide-react';

interface List {
  id: string;
  code: string;
  name: string;
  description: string | null;
  color: string;
}

interface Subscription {
  id: string;
  listType: string;
  subscribedAt: string;
  unsubscribeReason: string | null;
}

interface HistoryItem {
  id: string;
  campaignId: string;
  subject: string;
  status: string;
  scheduledAt: string;
  sentAt: string | null;
  openedAt: string | null;
  clickCount: number;
  bounced: boolean;
  errorLog: string | null;
}

interface FieldDefinition {
  id: string;
  title: string;
  fieldType: string;
  options: string | null;
  required: boolean;
}

interface ActivityHistoryItem {
  id: string;
  action: string;
  listType: string | null;
  reason: string | null;
  ip: string | null;
  source: string | null;
  createdAt: string;
}

interface SubscriberDetails {
  email: string;
  name: string | null;
  language: string;
  isActive: boolean;
  isConfirmed: boolean;
  trackStatus: boolean;
  creationDate: string;
  source: string | null;
  subscriptions: Subscription[];
  allLists: List[];
  fieldDefinitions: FieldDefinition[];
  history: HistoryItem[];
  activityHistory: ActivityHistoryItem[];
  stats: {
    sentCount: number;
    openRate: number | null;
    clickRate: number | null;
  };
  tags: string | null;
  customFields: Record<string, string> | null;
}

const SOURCE_LABELS: Record<string, string> = {
  frontend: 'Frontend (Anmeldeformular)',
  booking: 'Buchungsformular',
  form: 'Newsletter-Formular',
  backend: 'Backend (Admin)',
};

const ACTION_LABELS: Record<string, string> = {
  subscribe: 'Angemeldet',
  confirm: 'Bestätigt',
  unsubscribe: 'Abgemeldet',
  bounce: 'Bounce',
};

export const AcyEditSubscriber = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SubscriberDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'user'>('email');
  const listenSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [email]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newsletters/email/${email}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        navigate('/admin/acymailing/subscribers');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (data) {
      setData({ ...data, [field]: value });
    }
  };

  const handleToggleList = async (listCode: string) => {
    if (!data) return;
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newsletters/toggle-list', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: data.email, listType: listCode, name: data.name })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Änderung der Listen-Anmeldung fehlgeschlagen.');
      }
    } catch (error) {
      console.error(error);
      alert('Änderung der Listen-Anmeldung fehlgeschlagen.');
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!data) return;
    if (!window.confirm(`"${data.email}" wirklich von allen Listen abmelden?`)) return;
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newsletters/email/${email}/unsubscribe-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (exit: boolean = false) => {
    if (!data) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newsletters/email/${email}/details`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          name: data.name,
          language: data.language,
          isActive: data.isActive,
          isConfirmed: data.isConfirmed,
          trackStatus: data.trackStatus,
          tags: data.tags,
          customFields: data.customFields
        })
      });
      if (exit) {
        navigate('/admin/acymailing/subscribers');
      } else {
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <AcyLayout title="Flugschule Mailing > Subscribers">
        <div className="flex items-center justify-center h-64 text-slate-500">Lade Abonnent...</div>
      </AcyLayout>
    );
  }

  return (
    <AcyLayout title={`Flugschule Mailing > Abonnenten > ${data.email}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/acymailing/subscribers')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-[#1e293b]">Abonnent</h2>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/acymailing/subscribers')} className="px-4 py-2 border border-red-200 text-red-500 rounded font-medium hover:bg-red-50 transition-colors">Abbrechen</button>
          <button
            onClick={() => listenSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 border border-[#0ea5e9] text-[#0ea5e9] rounded font-medium hover:bg-blue-50 transition-colors"
          >
            Abonnement verwalten
          </button>
          <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 border border-[#0ea5e9] text-[#0ea5e9] rounded font-medium hover:bg-blue-50 transition-colors">Speichern</button>
          <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 bg-[#0ea5e9] text-white rounded font-medium hover:bg-[#0284c7] transition-colors shadow-sm">Speichern & Beenden</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Details */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-slate-500 mb-1">Name</label>
              <input
                type="text"
                value={data.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#0ea5e9] text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">E-Mail</label>
              <input
                type="email"
                value={data.email}
                disabled
                className="w-full px-4 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">Sprache</label>
              <select
                value={data.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#0ea5e9] text-slate-700 bg-white"
              >
                <option value="German">Deutsch</option>
                <option value="English">Englisch</option>
                <option value="French">Französisch</option>
              </select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Aktiv</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={data.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e1b4b]"></div>
                </label>
              </div>

              {data.subscriptions.some(s => s.unsubscribeReason) && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-slate-700">
                  <span className="font-medium block mb-1">Abmeldegrund:</span>
                  {data.subscriptions.filter(s => s.unsubscribeReason).map(s => (
                    <p key={s.id} className="text-slate-600">
                      {s.unsubscribeReason}{data.subscriptions.length > 1 ? ` (${s.listType})` : ''}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Bestätigt</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={data.isConfirmed} onChange={(e) => handleChange('isConfirmed', e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e1b4b]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-slate-700">Diesen Abonnenten tracken</span>
                  <div className="w-4 h-4 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[10px] cursor-help" title="Erlaubt das Erfassen von Öffnungen und Klicks für diesen Abonnenten">i</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={data.trackStatus} onChange={(e) => handleChange('trackStatus', e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e1b4b]"></div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">Tags (kommagetrennt)</label>
              <input
                type="text"
                value={data.tags || ''}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="z.B. Stammkunde, Tandemflug-Interessent"
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#0ea5e9] text-slate-700"
              />
            </div>

            {data.fieldDefinitions.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-700 block pt-4">Weitere Angaben</span>
                {data.fieldDefinitions.map((field) => {
                  const value = data.customFields?.[field.id] || '';
                  const setValue = (v: string) => handleChange('customFields', { ...(data.customFields || {}), [field.id]: v });
                  return (
                    <div key={field.id}>
                      <label className="block text-sm text-slate-500 mb-1">{field.title}{field.required && ' *'}</label>
                      {field.fieldType === 'textarea' ? (
                        <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#0ea5e9] text-slate-700" />
                      ) : field.fieldType === 'select' ? (
                        <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#0ea5e9] text-slate-700 bg-white">
                          <option value="">-</option>
                          {(field.options || '').split('\n').map((o) => o.trim()).filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : field.fieldType === 'checkbox' ? (
                        <input type="checkbox" checked={value === 'true'} onChange={(e) => setValue(e.target.checked ? 'true' : 'false')} className="rounded text-[#0ea5e9] focus:ring-[#0ea5e9]" />
                      ) : field.fieldType === 'date' ? (
                        <input type="date" value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#0ea5e9] text-slate-700" />
                      ) : (
                        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#0ea5e9] text-slate-700" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
              Erstellungsdatum: {new Date(data.creationDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}, Quelle: {SOURCE_LABELS[data.source || ''] || 'System (Import)'}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          {/* Stats section - real rates once at least one campaign has been sent to them */}
          <div className="flex p-8 border-b border-slate-100">
            <div className="flex-1 flex flex-col items-center">
              <span className="text-sm text-slate-500 mb-4">Durchschnittliche Öffnungsrate</span>
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center">
                {data.stats.openRate === null ? (
                  <span className="text-sm font-medium text-slate-400 text-center px-2">Keine Daten</span>
                ) : (
                  <span className="text-xl font-medium text-slate-700">{data.stats.openRate}%</span>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-sm text-slate-500 mb-4">Durchschnittliche Klickrate</span>
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center">
                {data.stats.clickRate === null ? (
                  <span className="text-sm font-medium text-slate-400 text-center px-2">Keine Daten</span>
                ) : (
                  <span className="text-xl font-medium text-slate-700">{data.stats.clickRate}%</span>
                )}
              </div>
            </div>
          </div>

          {/* History section */}
          <div className="flex-1 flex flex-col bg-[#f8fafc]">
            <div className="flex text-sm">
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-3 text-center transition-colors ${activeTab === 'email' ? 'bg-white text-[#0ea5e9] font-medium' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                E-Mail-Verlauf
              </button>
              <button
                onClick={() => setActiveTab('user')}
                className={`flex-1 py-3 text-center transition-colors ${activeTab === 'user' ? 'bg-white text-[#0ea5e9] font-medium' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Aktivitätsverlauf
              </button>
            </div>
            <div className="flex-1 p-6 bg-white overflow-x-auto">
              {activeTab === 'email' ? (
                data.history.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 pr-3 font-medium">Datum</th>
                        <th className="py-2 pr-3 font-medium">Betreff</th>
                        <th className="py-2 pr-3 font-medium">Status</th>
                        <th className="py-2 pr-3 font-medium">Geöffnet</th>
                        <th className="py-2 font-medium">Klicks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.history.map(item => (
                        <tr key={item.id} className="text-slate-600">
                          <td className="py-2 pr-3 whitespace-nowrap">{new Date(item.scheduledAt).toLocaleDateString('de-DE')}</td>
                          <td className="py-2 pr-3">{item.subject}</td>
                          <td className="py-2 pr-3">
                            <span className={item.bounced ? 'text-red-600 font-medium' : item.status === 'SENT' ? 'text-green-600 font-medium' : 'text-slate-500'}>
                              {item.bounced ? `Bounce${item.errorLog ? `: ${item.errorLog}` : ''}` : item.status}
                            </span>
                          </td>
                          <td className="py-2 pr-3">{item.openedAt ? new Date(item.openedAt).toLocaleDateString('de-DE') : '-'}</td>
                          <td className="py-2">{item.clickCount || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-700 font-medium text-center py-6">Es wurde noch keine E-Mail an diesen Abonnenten gesendet.</p>
                )
              ) : (
                data.activityHistory.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 pr-3 font-medium">Datum</th>
                        <th className="py-2 pr-3 font-medium">Aktion</th>
                        <th className="py-2 pr-3 font-medium">Liste</th>
                        <th className="py-2 pr-3 font-medium">Quelle</th>
                        <th className="py-2 pr-3 font-medium">Grund</th>
                        <th className="py-2 font-medium">IP-Adresse</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.activityHistory.map(item => (
                        <tr key={item.id} className="text-slate-600">
                          <td className="py-2 pr-3 whitespace-nowrap">{new Date(item.createdAt).toLocaleString('de-DE')}</td>
                          <td className="py-2 pr-3">
                            <span className={item.action === 'bounce' || item.action === 'unsubscribe' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                              {ACTION_LABELS[item.action] || item.action}
                            </span>
                          </td>
                          <td className="py-2 pr-3">{item.listType || '-'}</td>
                          <td className="py-2 pr-3">{SOURCE_LABELS[item.source || ''] || item.source || '-'}</td>
                          <td className="py-2 pr-3">{item.reason || '-'}</td>
                          <td className="py-2">{item.ip || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 text-center py-6">Noch keine Daten verfügbar.</p>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listen Section */}
      <div ref={listenSectionRef} className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 mb-8">
        <h3 className="text-xl font-medium text-[#1e293b] mb-6">Listen</h3>

        <div className="flex justify-between items-center border-b border-slate-100 mb-4">
          <div className="flex gap-8">
            <button className="pb-3 text-[#0ea5e9] border-b-2 border-[#0ea5e9] font-medium text-sm">
              Abonniert ({data.subscriptions.length})
            </button>
          </div>
          <button
            onClick={handleUnsubscribeAll}
            disabled={data.subscriptions.length === 0}
            className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors text-sm font-medium pb-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle size={16} /> Von allen Listen abmelden
          </button>
        </div>

        <div className="space-y-4">
          {data.allLists.map((list) => {
            const isSubscribed = data.subscriptions.some(s => s.listType === list.code);
            const subData = data.subscriptions.find(s => s.listType === list.code);

            return (
              <div key={list.id} className={`flex items-center justify-between p-3 rounded-md ${isSubscribed ? 'hover:bg-slate-50' : 'opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: list.color || '#cbd5e1' }}></div>
                  <span className="font-medium text-slate-700">{list.name}</span>
                </div>

                <div className="flex items-center gap-16">
                  {isSubscribed ? (
                    <span className="text-sm text-slate-500 w-48">
                      {new Date(subData!.subscribedAt).toLocaleString('de-DE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400 w-48">Nicht abonniert</span>
                  )}

                  <div className="flex items-center gap-4 min-w-[120px] justify-end">
                    {isSubscribed ? (
                      <button
                        onClick={() => handleToggleList(list.code)}
                        className="text-red-400 hover:text-red-600 transition-colors text-sm flex items-center gap-1"
                      >
                        <XCircle size={14} className="opacity-70" /> abmelden
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleList(list.code)}
                        className="text-emerald-500 hover:text-emerald-600 transition-colors text-sm flex items-center gap-1 font-medium"
                      >
                        Abonnieren
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {data.allLists.length === 0 && (
            <div className="text-center py-4 text-slate-400">
              Noch keine Listen konfiguriert.
            </div>
          )}
        </div>
      </div>
    </AcyLayout>
  );
};
