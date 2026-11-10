import React from 'react';
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
  Package,
  X,
  PanelLeftClose,
  SquarePen,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { DATAGALACTIC_COMPANY } from '../data/catalog';
import { ChatSession } from '../types';
import { useCompanySettings } from '../utils/settingsStorage';

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
  isDesktopOpen?: boolean;
  onToggleDesktop?: () => void;
  onNewChat?: (mode?: 'mode_a' | 'mode_b') => void;
  chatSessions?: ChatSession[];
  activeChatSessionId?: string;
  onSelectChatSession?: (session: ChatSession) => void;
  onDeleteChatSession?: (sessionId: string) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  onSelectModeTab,
  activeModeATab = 'agent',
  activeModeBTab = 'agent',
  isMobileOpen = false,
  onCloseMobile,
  isDesktopOpen = true,
  onToggleDesktop,
  onNewChat,
  chatSessions = [],
  activeChatSessionId,
  onSelectChatSession,
  onDeleteChatSession,
  onLogout
}) => {
  const isModeB = activePage === 'export_buyer_leads';
  const activeMode: 'mode_a' | 'mode_b' = isModeB ? 'mode_b' : 'mode_a';
  const { settings } = useCompanySettings(activeMode);

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

  const modeNavItems = activeMode === 'mode_a'
    ? [
        { id: 'agent', label: 'AI Agent Chat', icon: Bot },
        { id: 'leads', label: 'Saved Clients List', icon: Database },
        { id: 'email', label: 'Send AI Cold Emails', icon: Mail },
        { id: 'followup', label: 'Client Follow-ups', icon: CalendarClock },
        { id: 'services', label: 'Our 10 B2B Services', icon: Sparkles },
        { id: 'settings', label: 'Company & Mail Settings', icon: Settings }
      ]
    : [
        { id: 'agent', label: 'Export AI Chat', icon: Bot },
        { id: 'leads', label: 'Saved Buyers List', icon: Database },
        { id: 'email', label: 'Send Export Proposals', icon: Mail },
        { id: 'followup', label: 'Trade Follow-ups', icon: CalendarClock },
        { id: 'products', label: 'Export Products & MOQ', icon: Package },
        { id: 'settings', label: 'Export Mail Settings', icon: Settings }
      ];

  const modeSessions = chatSessions.filter(s => s.mode === activeMode && s.messages.length > 0);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`w-[260px] bg-[#f9f9f9] dark:bg-[#171717] border-r border-neutral-200 dark:border-white/10 flex flex-col h-screen fixed left-0 top-0 z-40 select-none transition-transform duration-200 ease-out ${
          isMobileOpen
            ? 'translate-x-0'
            : isDesktopOpen
            ? '-translate-x-full lg:translate-x-0'
            : '-translate-x-full'
        }`}
      >
        {/* ChatGPT Top Header Bar inside Sidebar */}
        <div className="h-14 px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {onToggleDesktop && (
              <button
                onClick={onToggleDesktop}
                title="Close sidebar"
                className="hidden lg:flex p-2 rounded-lg text-neutral-600 dark:text-[#b4b4b4] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-[#212121] transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                title="Close menu"
                className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-[#b4b4b4] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-[#212121] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2 min-w-0 pl-0.5">
              <img
                src="/logo.png"
                alt="DataGalactic"
                className="w-6 h-6 object-contain shrink-0 rounded-md"
              />
              <span className="font-semibold text-sm text-neutral-900 dark:text-[#ececec] truncate">
                LeadPilot AI
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onNewChat) onNewChat(activeMode);
              if (onCloseMobile) onCloseMobile();
            }}
            title="New chat"
            className="p-2 rounded-lg text-neutral-600 dark:text-[#b4b4b4] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-[#212121] transition-colors shrink-0"
          >
            <SquarePen className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Primary Action */}
        <div className="px-2.5 pb-2 space-y-2 shrink-0">
          <button
            onClick={() => {
              if (onNewChat) onNewChat(activeMode);
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-800 dark:text-[#ececec] bg-white dark:bg-[#212121] hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 transition-colors shadow-sm dark:shadow-none"
          >
            <SquarePen className="w-4 h-4 text-neutral-700 dark:text-[#ececec] shrink-0" />
            <span>New chat</span>
          </button>

          {/* Compact Mode Switcher (Mode A Services / Mode B Export) */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-200/70 dark:bg-[#212121] border border-neutral-200/80 dark:border-white/5">
            <button
              onClick={() => handleModeAClick('agent')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                !isModeB
                  ? 'bg-white dark:bg-[#2f2f2f] text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3 h-3 shrink-0" />
              <span className="truncate">Mode A</span>
            </button>
            <button
              onClick={() => handleModeBClick('agent')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                isModeB
                  ? 'bg-white dark:bg-[#2f2f2f] text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Globe2 className="w-3 h-3 shrink-0" />
              <span className="truncate">Mode B</span>
            </button>
          </div>
        </div>

        {/* Scrollable Navigation + Chat History */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-1.5 space-y-4">
          {/* Workspace Section */}
          <div>
            <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#8e8e8e]">
              {activeMode === 'mode_a' ? 'B2B Services Workspace' : 'Export Trade Workspace'}
            </div>
            <div className="space-y-0.5">
              {modeNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  (activeMode === 'mode_a' && activePage === 'service_leads' && activeModeATab === item.id) ||
                  (activeMode === 'mode_b' && activePage === 'export_buyer_leads' && activeModeBTab === item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (activeMode === 'mode_a') handleModeAClick(item.id);
                      else handleModeBClick(item.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-neutral-200/80 dark:bg-[#2f2f2f] text-neutral-950 dark:text-white font-semibold'
                        : 'text-neutral-700 dark:text-[#d4d4d4] hover:bg-neutral-200/50 dark:hover:bg-[#212121] font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-[#9e9e9e]'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overview / Sent Mails */}
          <div>
            <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#8e8e8e]">
              Reporting
            </div>
            <button
              onClick={() => {
                setActivePage('dashboard');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                activePage === 'dashboard'
                  ? 'bg-neutral-200/80 dark:bg-[#2f2f2f] text-neutral-950 dark:text-white font-semibold'
                  : 'text-neutral-700 dark:text-[#d4d4d4] hover:bg-neutral-200/50 dark:hover:bg-[#212121] font-medium'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activePage === 'dashboard' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-[#9e9e9e]'}`} />
              <span className="truncate">Dashboard & Sent Mails</span>
            </button>
          </div>

          {/* Recent Chats History (ChatGPT Style) */}
          {modeSessions.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#8e8e8e]">
                Recent Chats
              </div>
              <div className="space-y-0.5">
                {modeSessions.map((session) => {
                  const isCurrentSession =
                    session.id === activeChatSessionId &&
                    ((activeMode === 'mode_a' && activePage === 'service_leads' && activeModeATab === 'agent') ||
                      (activeMode === 'mode_b' && activePage === 'export_buyer_leads' && activeModeBTab === 'agent'));

                  return (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        isCurrentSession
                          ? 'bg-neutral-200/80 dark:bg-[#2f2f2f] text-neutral-950 dark:text-white font-medium'
                          : 'text-neutral-600 dark:text-[#b4b4b4] hover:bg-neutral-200/50 dark:hover:bg-[#212121]'
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (onSelectChatSession) onSelectChatSession(session);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        title={session.title}
                      >
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-neutral-400 dark:text-[#8e8e8e]" />
                        <span className="truncate">{session.title}</span>
                      </button>

                      {onDeleteChatSession && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChatSession(session.id);
                          }}
                          title="Delete chat"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-rose-500 transition-opacity shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Founder / Account Section */}
        <div className="p-2.5 border-t border-neutral-200 dark:border-white/10 shrink-0">
          <div className="p-2 rounded-xl hover:bg-neutral-200/60 dark:hover:bg-[#212121] flex items-center justify-between gap-2 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {(settings.founder || DATAGALACTIC_COMPANY.founder || 'R').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-neutral-900 dark:text-[#ececec] text-xs truncate">
                  {settings.founder || DATAGALACTIC_COMPANY.founder}
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] truncate">
                  {settings.companyEmail}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onLogout) onLogout();
                else alert('Session safely signed out. You can sign in anytime.');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-neutral-500 dark:text-[#9e9e9e] hover:text-rose-500 hover:bg-neutral-200/70 dark:hover:bg-[#2f2f2f] transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
