import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Database,
  Mail,
  CalendarClock,
  LogOut,
  Briefcase,
  Globe2,
  Bot,
  Settings,
  Layers,
  ChevronDown,
  ChevronRight,
  Check,
  Package,
  X
} from 'lucide-react';
import { DATAGALACTIC_COMPANY } from '../data/catalog';

export type NavPage =
  | 'dashboard'
  | 'agent'
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
  onSelectModeTab?: (mode: 'mode_a' | 'mode_b', tab: string) => void;
  activeModeATab?: string;
  activeModeBTab?: string;
  pendingApprovalsCount: number;
  dueFollowUpsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  onSelectModeTab,
  activeModeATab = 'agent',
  activeModeBTab = 'agent',
  pendingApprovalsCount,
  dueFollowUpsCount,
  isMobileOpen = false,
  onCloseMobile,
  onLogout
}) => {
  const [isModeAOpen, setIsModeAOpen] = useState(true);
  const [isModeBOpen, setIsModeBOpen] = useState(true);

  // Active Mode Detection (Instagram-style 2-account universe)
  const isModeA = activePage === 'service_leads';
  const isModeB = activePage === 'export_buyer_leads';

  const handleModeAClick = (tab: string = 'agent') => {
    if (onSelectModeTab) {
      onSelectModeTab('mode_a', tab);
    } else {
      setActivePage('service_leads');
    }
    if (onCloseMobile) onCloseMobile();
  };

  const handleModeBClick = (tab: string = 'agent') => {
    if (onSelectModeTab) {
      onSelectModeTab('mode_b', tab);
    } else {
      setActivePage('export_buyer_leads');
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside className={`w-64 bg-galaxy-900/95 border-r border-slate-800/80 flex flex-col h-screen fixed left-0 top-0 z-40 select-none backdrop-blur-2xl shadow-2xl transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Clean Modern SaaS Brand Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="DataGalactic LeadPilot AI Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_2px_12px_rgba(99,102,241,0.65)] hover:scale-105 transition-transform select-none"
              />
            </div>

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

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-2"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      {/* INSTAGRAM-STYLE 2-ACCOUNT SWITCHER WIDGET */}
      <div className="p-3 border-b border-slate-800/80 bg-galaxy-950/70">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Account</span>
          </span>
          <span className="text-[9px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded border border-indigo-500/30 font-semibold">
            Instagram Style
          </span>
        </div>

        {/* Account Selector Pill (Dual Account View) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800/90">
          {/* Account 1: Mode A */}
          <button
            onClick={() => handleModeAClick('agent')}
            title="Switch to Mode A Account (DataGalactic Services)"
            className={`p-2 rounded-lg text-left transition-all relative ${
              isModeA
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 truncate">
                <Briefcase className={`w-3 h-3 shrink-0 ${isModeA ? 'text-white' : 'text-indigo-400'}`} />
                <span className="text-[11px] font-bold truncate">Mode A</span>
              </div>
              {isModeA && <Check className="w-3 h-3 text-white shrink-0" />}
            </div>
            <p className={`text-[9px] truncate mt-0.5 ${isModeA ? 'text-indigo-200' : 'text-slate-400'}`}>
              Services
            </p>
          </button>

          {/* Account 2: Mode B */}
          <button
            onClick={() => handleModeBClick('agent')}
            title="Switch to Mode B Account (Export Buyer Leads)"
            className={`p-2 rounded-lg text-left transition-all relative ${
              isModeB
                ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-md shadow-sky-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 truncate">
                <Globe2 className={`w-3 h-3 shrink-0 ${isModeB ? 'text-white' : 'text-sky-400'}`} />
                <span className="text-[11px] font-bold truncate">Mode B</span>
              </div>
              {isModeB && <Check className="w-3 h-3 text-white shrink-0" />}
            </div>
            <p className={`text-[9px] truncate mt-0.5 ${isModeB ? 'text-sky-200' : 'text-slate-400'}`}>
              Exports
            </p>
          </button>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-3">
        {/* 1. Dashboard (Overview & Inbound Replies) */}
        <div>
          <button
            onClick={() => {
              setActivePage('dashboard');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left group ${
              activePage === 'dashboard'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 font-semibold border border-indigo-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activePage === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate flex-1 leading-normal text-xs font-semibold">
              Dashboard (Overview & Replies)
            </span>
          </button>
        </div>

        {/* 2. MODE A DEDICATED MENU WITH SEPARATE SUB-ITEMS */}
        <div className="p-2 rounded-xl bg-slate-950/60 border border-indigo-500/30 space-y-1.5">
          <button
            onClick={() => {
              handleModeAClick('agent');
              setIsModeAOpen(prev => !prev);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
              isModeA
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-indigo-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Briefcase className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold truncate block">Mode A: DataGalactic</span>
                <span className={`text-[9px] block truncate ${isModeA ? 'text-indigo-100' : 'text-slate-400'}`}>
                  B2B Services & Client Outreach
                </span>
              </div>
            </div>
            {isModeAOpen ? (
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-80" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
            )}
          </button>

          {isModeAOpen && (
            <div className="space-y-1 pl-0.5 pt-1 border-t border-slate-800/80">
              {[
                {
                  id: 'agent',
                  step: '1',
                  label: 'AI Client Finder & PDF',
                  desc: 'Search 50/100 Leads + Save PDF',
                  icon: Bot
                },
                {
                  id: 'leads',
                  step: '2',
                  label: 'Saved Clients Database',
                  desc: 'All sourced B2B client list',
                  icon: Database
                },
                {
                  id: 'email',
                  step: '3',
                  label: 'Send AI Cold Emails',
                  desc: 'Personalized pitch generator',
                  icon: Mail
                },
                {
                  id: 'followup',
                  step: '4',
                  label: 'Client Follow-ups',
                  desc: 'Day 3 & Day 7 reply reminders',
                  icon: CalendarClock
                },
                {
                  id: 'services',
                  step: '5',
                  label: 'Our 10 B2B Services',
                  desc: 'Data Entry, Cleaning, Scraping',
                  icon: Sparkles
                },
                {
                  id: 'settings',
                  step: '6',
                  label: 'Company & Mail Profile',
                  desc: 'Sender name & contact email ID',
                  icon: Settings
                }
              ].map(sub => {
                const SubIcon = sub.icon;
                const isSubActive = isModeA && activeModeATab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleModeAClick(sub.id)}
                    className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                      isSubActive
                        ? 'bg-indigo-600/20 text-white font-semibold border border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
                      isSubActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {sub.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold truncate block">{sub.label}</span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 leading-tight ${isSubActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {sub.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. MODE B DEDICATED MENU WITH SEPARATE SUB-ITEMS */}
        <div className="p-2 rounded-xl bg-slate-950/60 border border-sky-500/30 space-y-1.5">
          <button
            onClick={() => {
              handleModeBClick('agent');
              setIsModeBOpen(prev => !prev);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
              isModeB
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
                : 'text-sky-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe2 className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold truncate block">Mode B: Export Hub</span>
                <span className={`text-[9px] block truncate ${isModeB ? 'text-sky-100' : 'text-slate-400'}`}>
                  International Trade & Buyers
                </span>
              </div>
            </div>
            {isModeBOpen ? (
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-80" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
            )}
          </button>

          {isModeBOpen && (
            <div className="space-y-1 pl-0.5 pt-1 border-t border-slate-800/80">
              {[
                {
                  id: 'agent',
                  step: '1',
                  label: 'Export Buyer Finder & PDF',
                  desc: '50/100 Overseas Importers + PDF',
                  icon: Bot
                },
                {
                  id: 'leads',
                  step: '2',
                  label: 'Saved Overseas Buyers',
                  desc: 'Foreign Importers & Wholesale list',
                  icon: Database
                },
                {
                  id: 'email',
                  step: '3',
                  label: 'Send Export Proposals',
                  desc: 'Container MOQ & CIF Price pitch',
                  icon: Mail
                },
                {
                  id: 'followup',
                  step: '4',
                  label: 'Export Follow-ups',
                  desc: 'Sample kit & contract reminders',
                  icon: CalendarClock
                },
                {
                  id: 'products',
                  step: '5',
                  label: 'Export Products & MOQ',
                  desc: 'Agro Spices, 20ft FCL & ISO/Halal',
                  icon: Package
                },
                {
                  id: 'settings',
                  step: '6',
                  label: 'Export Company Profile',
                  desc: 'Trade sender & export email ID',
                  icon: Settings
                }
              ].map(sub => {
                const SubIcon = sub.icon;
                const isSubActive = isModeB && activeModeBTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleModeBClick(sub.id)}
                    className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                      isSubActive
                        ? 'bg-sky-500/20 text-white font-semibold border border-sky-500/50 shadow-sm shadow-sky-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
                      isSubActive
                        ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {sub.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-sky-300' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold truncate block">{sub.label}</span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 leading-tight ${isSubActive ? 'text-sky-200' : 'text-slate-400'}`}>
                        {sub.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
    </>
  );
};
