import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Copy, Edit, Trash2, Eye, EyeOff, BarChart2, XCircle } from 'lucide-react';
import { AcyLayout } from './AcyLayout';
import { Link, useNavigate } from 'react-router-dom';

interface Campaign {
  id: string;
  subject: string;
  name: string | null;
  status: string;
  sentAt: string | null;
  createdAt: string;
  targetList: string;
  recipientsCount: number;
  opensCount: number;
  clicksCount: number;
  visible: boolean;
}

export const AcyEmails = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Geplant');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [bulkAction, setBulkAction] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newslettercampaigns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!window.confirm('Möchten Sie diese Kampagne wirklich löschen?')) return;
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newslettercampaigns/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCampaigns();
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { id: 'All', label: 'Alle', count: campaigns.length },
    { id: 'Planned', label: 'Geplant', count: campaigns.filter(c => c.status === 'PLANNED').length },
    { id: 'Sent', label: 'Gesendet', count: campaigns.filter(c => c.status === 'SENT').length },
    { id: 'Draft', label: 'Entwurf', count: campaigns.filter(c => c.status === 'DRAFT').length }
  ];

  const handleDuplicate = async (id: string) => {
    try {
      const token = localStorage.getItem('auth');
      await fetch(`/api/newslettercampaigns/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCampaigns();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      const token = localStorage.getItem('auth');
      await fetch(`/api/newslettercampaigns/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCampaigns();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelScheduling = async (id: string) => {
    if (!window.confirm('Planung wirklich abbrechen?')) return;
    try {
      const token = localStorage.getItem('auth');
      await fetch(`/api/newslettercampaigns/${id}/cancel-scheduling`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCampaigns();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    let tabMatch = false;
    if (activeTab === 'Geplant') {
      tabMatch = c.status === 'SCHEDULED' || c.status === 'DRAFT';
    } else if (activeTab === 'Gesendet') {
      tabMatch = c.status === 'SENT';
    } else {
      tabMatch = true;
    }
    
    let searchMatch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      searchMatch = !!(c.name && c.name.toLowerCase().includes(q)) ||
                    !!(c.subject && c.subject.toLowerCase().includes(q));
    }
    
    return tabMatch && searchMatch;
  }).sort((a, b) => {
    if (sortBy === 'subject') return (a.subject || '').localeCompare(b.subject || '');
    if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'id') return a.id.localeCompare(b.id);
    return 0;
  });

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    if (bulkAction === 'delete') {
      if (!window.confirm(`${selectedIds.length} Kampagnen löschen?`)) return;
      try {
        const token = localStorage.getItem('auth');
        await Promise.all(selectedIds.map(id => 
          fetch(`/api/newslettercampaigns/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ));
        setSelectedIds([]);
        setBulkAction('');
        fetchCampaigns();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <AcyLayout title="AcyMailing > E-Mails">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200">
        <div className="flex gap-8">
          <button className="pb-3 text-[#0ea5e9] border-b-2 border-[#0ea5e9] font-medium px-2">Newsletter</button>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 pb-3">
          <span className="font-medium">Sortieren nach:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-none bg-transparent font-medium text-[#0ea5e9] focus:outline-none cursor-pointer"
          >
            <option value="id">ID</option>
            <option value="subject">Betreff</option>
            <option value="date">Erstellungsdatum</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <select 
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="border border-slate-200 rounded-md px-4 py-2 bg-white text-slate-600 focus:outline-none focus:border-[#0ea5e9] min-w-[150px]"
            >
              <option value="">Aktion auswählen</option>
              <option value="delete">Löschen</option>
            </select>
            {bulkAction && selectedIds.length > 0 && (
              <button 
                onClick={handleBulkAction}
                className="px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7]"
              >
                Ausführen
              </button>
            )}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/admin/acymailing/emails/create" className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] text-white rounded-md hover:bg-[#0284c7] transition-colors font-medium shadow-sm">
            <Plus size={18} /> Erstellen
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-[#334155] shadow-sm font-medium border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-200/50 bg-slate-50'
            }`}
          >
            {tab.label}
            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 font-normal">
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filteredCampaigns.map(c => c.id));
                      else setSelectedIds([]);
                    }}
                    className="rounded border-slate-400 bg-transparent" 
                  />
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">Kampagnen</th>
                <th className="px-4 py-3 font-medium text-center">Listen</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Statistiken</th>
                <th className="px-4 py-3 font-medium text-center">Öffnen</th>
                <th className="px-4 py-3 font-medium text-center">Klick</th>
                <th className="px-4 py-3 text-center font-medium">Sichtbar</th>
                <th className="px-4 py-3 text-center font-medium">Aktionen</th>
                <th className="px-4 py-3 font-medium text-right">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">Lade Kampagnen...</td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">Keine Kampagnen in dieser Kategorie gefunden.</td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-slate-100 hover:bg-slate-50 group">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(campaign.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, campaign.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== campaign.id));
                        }}
                        className="rounded border-slate-300 text-[#0ea5e9] focus:ring-[#0ea5e9]" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 flex flex-col gap-1">
                        <span>{campaign.subject}</span>
                        {campaign.status === 'SCHEDULED' && campaign.sentAt && (
                          <span className="text-xs text-slate-500 font-normal">Sendedatum : {new Date(campaign.sentAt).toLocaleString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-1">
                        {campaign.targetList === 'GENERAL' && <div className="w-4 h-4 rounded-full bg-blue-500" title="Allgemeiner Newsletter"></div>}
                        {campaign.targetList === 'TANDEM' && <div className="w-4 h-4 rounded-full bg-yellow-400" title="Tandem Newsletter"></div>}
                        {campaign.targetList === 'ALL' && (
                          <>
                            <div className="w-4 h-4 rounded-full bg-blue-500" title="Allgemeiner Newsletter"></div>
                            <div className="w-4 h-4 rounded-full bg-yellow-400" title="Tandem Newsletter"></div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {campaign.status === 'SENT' ? (
                        <div className="inline-block px-3 py-1 rounded bg-emerald-500 text-white text-xs font-medium">
                          Gesendet : {campaign.recipientsCount} Empfänger
                        </div>
                      ) : campaign.status === 'SCHEDULED' ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="inline-block px-3 py-1 rounded bg-orange-400 text-white text-xs font-medium">
                            Geplant : {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : ''}
                          </div>
                          <button onClick={() => handleCancelScheduling(campaign.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Planung abbrechen">
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-block px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs font-medium">
                          Entwurf
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {campaign.status === 'SENT' && campaign.recipientsCount > 0 
                        ? `${((campaign.opensCount / campaign.recipientsCount) * 100).toFixed(2)}%` 
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {campaign.status === 'SENT' && campaign.recipientsCount > 0 
                        ? `${((campaign.clicksCount / campaign.recipientsCount) * 100).toFixed(2)}%` 
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleVisibility(campaign.id)} className="focus:outline-none" title={campaign.visible ? "Sichtbar" : "Unsichtbar"}>
                        {campaign.visible ? <Eye size={18} className="text-slate-600" /> : <EyeOff size={18} className="text-slate-400" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3 text-slate-400">
                        <button onClick={() => navigate(`/admin/acymailing/emails/edit/${campaign.id}`)} className="hover:text-[#0ea5e9] transition-colors" title="Bearbeiten"><Edit size={16} /></button>
                        <button onClick={() => handleDuplicate(campaign.id)} className="hover:text-amber-500 transition-colors" title="Duplizieren"><Copy size={16} /></button>
                        {campaign.status === 'SENT' && (
                          <button onClick={() => alert(`Statistiken für ${campaign.subject}:\nÖffnungsrate: ${((campaign.opensCount / campaign.recipientsCount) * 100).toFixed(2)}%\nKlickrate: ${((campaign.clicksCount / campaign.recipientsCount) * 100).toFixed(2)}%`)} className="hover:text-emerald-500 transition-colors" title="Statistiken"><BarChart2 size={16} /></button>
                        )}
                        <button onClick={() => handleDeleteOne(campaign.id)} className="hover:text-red-500 transition-colors" title="Löschen"><Trash2 size={16} /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-400 font-mono">
                      {campaign.id.substring(0, 8)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AcyLayout>
  );
};
