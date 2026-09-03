import React, { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { Users, Mail, AlignLeft, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatsData {
  overview: {
    totalSubscribers: number;
    activeSubscribers: number;
    totalLists: number;
    totalCampaigns: number;
    globalOpenRate: number;
    globalClickRate: number;
    bounceRate: number;
  };
}

export const AcyDashboard = () => {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/stats/acymailing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AcyLayout title="AcyMailing > Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Willkommen bei AcyMailing</h2>
        <p className="text-slate-500">Ihre E-Mail-Marketing-Zentrale.</p>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0ea5e9]">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Abonnenten Total</p>
                <p className="text-2xl font-bold text-slate-800">{data.overview.totalSubscribers}</p>
              </div>
            </div>
            <Link to="/admin/acymailing/subscribers" className="text-sm text-[#0ea5e9] hover:underline flex items-center gap-1">Abonnenten verwalten <ArrowRight size={14} /></Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Aktive Abonnenten</p>
                <p className="text-2xl font-bold text-slate-800">{data.overview.activeSubscribers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                <AlignLeft size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Listen</p>
                <p className="text-2xl font-bold text-slate-800">{data.overview.totalLists}</p>
              </div>
            </div>
            <Link to="/admin/acymailing/lists" className="text-sm text-[#0ea5e9] hover:underline flex items-center gap-1">Listen verwalten <ArrowRight size={14} /></Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Kampagnen</p>
                <p className="text-2xl font-bold text-slate-800">{data.overview.totalCampaigns}</p>
              </div>
            </div>
            <Link to="/admin/acymailing/emails" className="text-sm text-[#0ea5e9] hover:underline flex items-center gap-1">Zu E-Mails <ArrowRight size={14} /></Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Schnellaktionen</h3>
          <div className="space-y-4">
            <Link to="/admin/acymailing/emails/create" className="block w-full text-center px-4 py-3 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors shadow-sm">
              Neue Kampagne erstellen
            </Link>
            <Link to="/admin/acymailing/subscribers" className="block w-full text-center px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-md font-medium hover:bg-slate-50 transition-colors shadow-sm">
              Neuen Abonnent hinzufügen
            </Link>
            <Link to="/admin/acymailing/lists" className="block w-full text-center px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-md font-medium hover:bg-slate-50 transition-colors shadow-sm">
              Neue Liste erstellen
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tipps</h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Erstellen Sie verschiedene Listen für verschiedene Zielgruppen.</li>
            <li>Nutzen Sie die detaillierten Statistiken, um Ihre Öffnungsraten zu verbessern.</li>
            <li>Verwalten Sie Ihre Vorlagen, um einen konsistenten Markenauftritt zu gewährleisten.</li>
          </ul>
        </div>
      </div>
    </AcyLayout>
  );
};
