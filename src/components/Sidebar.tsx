import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Database,
  MailOpen,
  ShieldCheck,
  CalendarClock,
  ArrowDownUp,
  Cable,
  UserX,
  LogOut,
  User
} from 'lucide-react';
import { DATAGALACTIC_COMPANY } from '../data/catalog';

export type NavPage =
  | 'dashboard'
  | 'ai_lead_finder'
  | 'service_leads'
  | 'export_buyer_leads'
  | 'lead_database'
  | 'email_drafts'
  | 'sending_approval'
  | 'follow_up_manager'
  | 'import_export'
  | 'integrations'
  | 'privacy_controls'
  | 'settings';

interface SidebarProps {
  activePage: NavPage;
  setActivePage: (page: NavPage) => void;
  pendingApprovalsCount: number;
  dueFollowUpsCount: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  pendingApprovalsCount,
  dueFollowUpsCount,
  onLogout
}) => {
interface NavItem {
  id: NavPage;
  label: string;
  icon: any;
  count?: number;
  alert?: boolean;
  badge?: string;
}

  // Navigation list (AI Lead Finder, Service Leads, Export Leads, Import/Export, and Settings are in the top navbar)
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lead_database', label: 'Lead Database / CRM', icon: Database },
    { id: 'email_drafts', label: 'Email Campaign Drafts', icon: MailOpen },
    { 
      id: 'sending_approval', 
      label: 'Email Sending Approval', 
      icon: ShieldCheck, 
      count: pendingApprovalsCount,
      alert: pendingApprovalsCount > 0 
    },
    { 
      id: 'follow_up_manager', 
      label: 'Follow-up Manager', 
      icon: CalendarClock,
      count: dueFollowUpsCount 
    },
    { id: 'integrations', label: 'Integrations & API Settings', icon: Cable },
    { id: 'privacy_controls', label: 'Privacy, Suppression & DNC', icon: UserX },
  ];

  return (
    <aside className="w-64 bg-galaxy-900/95 border-r border-slate-800/80 flex flex-col h-screen fixed left-0 top-0 z-30 select-none backdrop-blur-2xl shadow-2xl">
      {/* Clean Modern SaaS Brand Header */}
      <div className="px-5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          {/* Standalone 3D Cosmic Orb Logo (No Container Box / Pure PNG) */}
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="DataGalactic LeadPilot AI Logo"
              className="w-10 h-10 object-contain drop-shadow-[0_2px_12px_rgba(99,102,241,0.65)] hover:scale-105 transition-transform select-none"
            />
          </div>

          {/* Clean Enterprise Typography */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white font-sans truncate">
                LeadPilot
              </span>
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase shrink-0">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-normal truncate mt-0.5">
              DataGalactic Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Operations & Pipelines
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as NavPage)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 font-semibold border border-indigo-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate flex-1 leading-normal">{item.label}</span>

              {item.badge && (
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-400/20 text-indigo-300 border border-indigo-400/30 font-bold leading-normal">
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold leading-normal ${
                  item.alert ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Card & Quick Sign-out */}
      <div className="p-3 border-t border-slate-800/80 bg-galaxy-950/70">
        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm shadow-indigo-500/30">
              R
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-xs truncate">{DATAGALACTIC_COMPANY.founder}</p>
              <p className="text-[10px] text-slate-400 truncate leading-tight">Founder & Admin</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onLogout) onLogout();
              else alert('Session safely signed out. You can sign in anytime.');
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 px-1 text-center">
          <p className="text-[10px] text-slate-400 italic truncate">"{DATAGALACTIC_COMPANY.tagline}"</p>
        </div>
      </div>
    </aside>
  );
};
