import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  List,
  LayoutTemplate, 
  Mail, 
  AlignLeft,
  BarChart2,
  Settings 
} from 'lucide-react';

interface AcyLayoutProps {
  children: ReactNode;
  title?: string;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/acymailing/dashboard' },
  { id: 'subscribers', label: 'Abonnenten', icon: Users, path: '/admin/acymailing/subscribers' },
  { id: 'lists', label: 'Listen', icon: List, path: '/admin/acymailing/lists' },
  { id: 'templates', label: 'Vorlagen', icon: LayoutTemplate, path: '/admin/acymailing/templates' },
  { id: 'emails', label: 'E-Mails', icon: Mail, path: '/admin/acymailing/emails' },
  { id: 'queue', label: 'Warteschlange', icon: AlignLeft, path: '/admin/acymailing/queue' },
  { id: 'statistics', label: 'Statistiken', icon: BarChart2, path: '/admin/acymailing/statistics' },
  { id: 'configuration', label: 'Konfiguration', icon: Settings, path: '/admin/acymailing/configuration' },
];

export const AcyLayout = ({ children, title }: AcyLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#f4f6f8] text-[#334155] font-sans">
      {/* Left Sidebar (Dark Blue/Gray) */}
      <aside className="w-64 bg-[#1e293b] flex-shrink-0 flex flex-col shadow-xl z-10 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <span className="text-[#0ea5e9]">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </span>
            AcyMailing
          </h2>
        </div>
        
        <nav className="flex-1 px-4 pb-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-[#0ea5e9] text-white font-medium shadow-md' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f6f8]">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-2xl font-semibold text-slate-800">
            {title || NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.label || 'AcyMailing'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>AcyMailing Starter 11.0.4 Clone</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
