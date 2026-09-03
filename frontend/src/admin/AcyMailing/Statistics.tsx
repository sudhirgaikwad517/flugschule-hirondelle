import React, { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Mail, MousePointerClick, RefreshCcw, Activity, AlignLeft } from 'lucide-react';

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
  history: {
    date: string;
    sent: number;
  }[];
}

export const AcyStatistics = () => {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <AcyLayout title="AcyMailing > Statistiken">
        <div className="flex items-center justify-center h-64 text-slate-500">
          <RefreshCcw className="animate-spin mr-2" size={20} />
          Lade Statistiken...
        </div>
      </AcyLayout>
    );
  }

  return (
    <AcyLayout title="AcyMailing > Statistiken">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Globale Statistiken</h2>
        <p className="text-slate-500">Ihre AcyMailing Performance Übersicht</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0ea5e9]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Abonnenten Total</p>
            <p className="text-2xl font-bold text-slate-800">{data.overview.totalSubscribers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Aktive Abonnenten</p>
            <p className="text-2xl font-bold text-slate-800">{data.overview.activeSubscribers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
            <AlignLeft size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Listen</p>
            <p className="text-2xl font-bold text-slate-800">{data.overview.totalLists}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Kampagnen</p>
            <p className="text-2xl font-bold text-slate-800">{data.overview.totalCampaigns}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 col-span-2">
          <h3 className="text-lg font-medium text-slate-800 mb-6">Versendete E-Mails (Letzte 30 Tage)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="sent" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" name="Versendet" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col justify-center">
          <h3 className="text-lg font-medium text-slate-800 mb-6 text-center">Interaktionen</h3>
          
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2 flex items-center justify-center gap-2">
                <MousePointerClick size={16} /> Globale Öffnungsrate
              </p>
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-emerald-500 border-opacity-20 text-3xl font-bold text-slate-800 relative">
                {data.overview.globalOpenRate}%
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle 
                    cx="60" cy="60" r="56" 
                    fill="transparent" 
                    stroke="#10b981" 
                    strokeWidth="8" 
                    strokeDasharray={`${data.overview.globalOpenRate * 3.51} 351`} 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2 flex items-center justify-center gap-2">
                <MousePointerClick size={16} /> Globale Klickrate
              </p>
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-[#0ea5e9] border-opacity-20 text-3xl font-bold text-slate-800 relative">
                {data.overview.globalClickRate}%
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle 
                    cx="60" cy="60" r="56" 
                    fill="transparent" 
                    stroke="#0ea5e9" 
                    strokeWidth="8" 
                    strokeDasharray={`${data.overview.globalClickRate * 3.51} 351`} 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AcyLayout>
  );
};
