import React from 'react';
import { AcyLayout } from './AcyLayout';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Clock, Beaker, RotateCcw, Lock } from 'lucide-react';

export const AcyChooseCampaignType = () => {
  const navigate = useNavigate();

  return (
    <AcyLayout title="Neue Kampagne">
      <div className="bg-white min-h-[800px] flex flex-col pt-16">
        
        <h1 className="text-[#093d7c] text-4xl text-center font-semibold mb-12">
          Welche Art von Aussendung möchten Sie erstellen?
        </h1>

        <div className="flex justify-center mb-16">
          <div className="bg-[#e0f2fe] text-[#0ea5e9] px-6 py-2 rounded-l text-sm font-medium cursor-pointer">
            Newsletter
          </div>
          <div className="text-slate-500 px-6 py-2 rounded-r text-sm cursor-pointer hover:bg-slate-50">
            Einmalige E-Mail
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto px-4">
          
          {/* Card 1: Klassischer Newsletter */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-100 p-8 w-[280px] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
            <div className="mb-6 mt-4">
              <Megaphone size={48} strokeWidth={1} className="text-slate-700" />
            </div>
            <h3 className="text-slate-700 font-medium text-lg mb-4 h-12 flex items-center justify-center">
              Klassischer<br/>Newsletter
            </h3>
            <p className="text-slate-500 text-sm mb-8 flex-1">
              Wählen Sie Ihre Vorlage, fügen Sie Ihren Inhalt ein, senden Sie ihn an Ihre Benutzer. So einfach ist das
            </p>
            <button 
              onClick={() => navigate('/admin/acymailing/emails/create/template')}
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-2.5 rounded font-medium transition-colors"
            >
              Erstellen
            </button>
          </div>

          {/* Card 2: Geplanter Newsletter */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-100 p-8 w-[280px] flex flex-col items-center text-center relative opacity-80">
            <div className="absolute top-4 right-4 bg-slate-100 p-2 rounded-md">
              <Lock size={16} className="text-slate-500" />
            </div>
            <div className="mb-6 mt-4">
              <Clock size={48} strokeWidth={1} className="text-slate-700" />
            </div>
            <h3 className="text-slate-700 font-medium text-lg mb-2">
              Geplanter<br/>Newsletter
            </h3>
            <p className="text-[#0ea5e9] text-xs mb-4">
              Bereiten Sie Ihre Newsletter im Voraus vor, um Zeit zu sparen
            </p>
            <p className="text-slate-500 text-sm mb-8 flex-1">
              Erstellen Sie Ihren Newsletter, planen Sie ihn in der Zukunft ein, schalten Sie Ihren Computer ab und entspannen Sie sich
            </p>
            <button className="w-full bg-slate-100 text-white py-2.5 rounded font-medium cursor-not-allowed">
              Erstellen
            </button>
          </div>

          {/* Card 3: A/B Testnewsletter */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-100 p-8 w-[280px] flex flex-col items-center text-center relative opacity-80">
            <div className="absolute top-4 right-4 bg-slate-100 p-2 rounded-md">
              <Lock size={16} className="text-slate-500" />
            </div>
            <div className="mb-6 mt-4">
              <Beaker size={48} strokeWidth={1} className="text-slate-700" />
            </div>
            <h3 className="text-slate-700 font-medium text-lg mb-4 h-12 flex items-center justify-center">
              A/B Testnewsletter
            </h3>
            <p className="text-slate-500 text-sm mb-8 flex-1">
              Verbessern Sie Ihre Newsletter, indem Sie verschiedene Designs und Optionen testen. Testen Sie ihn mit einer Stichprobe und versenden Sie den Newsletter mit der besten Leistung
            </p>
            <button className="w-full bg-slate-100 text-white py-2.5 rounded font-medium cursor-not-allowed">
              Erstellen
            </button>
          </div>

          {/* Card 4: Automatische Newsletter */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-100 p-8 w-[280px] flex flex-col items-center text-center relative opacity-80">
            <div className="absolute top-4 right-4 bg-slate-100 p-2 rounded-md">
              <Lock size={16} className="text-slate-500" />
            </div>
            <div className="mb-6 mt-4">
              <RotateCcw size={48} strokeWidth={1} className="text-slate-700" />
            </div>
            <h3 className="text-slate-700 font-medium text-lg mb-2">
              Automatische<br/>Newsletter
            </h3>
            <p className="text-[#0ea5e9] text-xs mb-4">
              Sparen Sie bis zu 10 Stunden pro Woche
            </p>
            <p className="text-slate-500 text-sm mb-8 flex-1">
              Newsletter jede(n) Tag/Woche/Monat mit wechselndem Inhalt senden
            </p>
            <button className="w-full bg-slate-100 text-white py-2.5 rounded font-medium cursor-not-allowed">
              Erstellen
            </button>
          </div>

        </div>
      </div>
    </AcyLayout>
  );
};
