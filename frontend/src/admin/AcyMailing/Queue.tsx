import { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { Trash2, Play, Pause, RefreshCw } from 'lucide-react';

interface QueueItem {
  id: string;
  campaignId: string;
  subscriberEmail: string;
  status: string;
  scheduledAt: string;
  errorLog: string | null;
}

export const AcyQueue = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newsletterqueue', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessNow = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('auth');
      await fetch('/api/newsletterqueue/process', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchQueue();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Möchten Sie wirklich die gesamte Warteschlange leeren?')) return;
    try {
      const token = localStorage.getItem('auth');
      await fetch('/api/newsletterqueue/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchQueue();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AcyLayout title="AcyMailing > Warteschlange">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium text-slate-800">E-Mail-Warteschlange</h2>
          <p className="text-sm text-slate-500">{items.length} E-Mails in der Warteschlange</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchQueue} className="px-4 py-2 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Aktualisieren
          </button>
          <button onClick={handleClear} className="px-4 py-2 flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition-colors">
            <Trash2 size={18} /> Leeren
          </button>
          <button onClick={handleProcessNow} disabled={processing} className="px-4 py-2 flex items-center gap-2 bg-[#0ea5e9] text-white hover:bg-[#0284c7] rounded font-medium transition-colors disabled:opacity-50">
            {processing ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />} Jetzt verarbeiten
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">E-Mail</th>
              <th className="px-4 py-3 font-medium text-center">Kampagnen-ID</th>
              <th className="px-4 py-3 font-medium text-center">Geplant für</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium">Fehlerlog</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Lade Warteschlange...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Die Warteschlange ist leer.</td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.subscriberEmail}</td>
                  <td className="px-4 py-3 text-center text-xs font-mono">{item.campaignId.substring(0,8)}</td>
                  <td className="px-4 py-3 text-center">{new Date(item.scheduledAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'SENT' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      item.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-red-500">{item.errorLog || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AcyLayout>
  );
};
