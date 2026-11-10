import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Briefcase,
  Globe2,
  Settings,
  Sun,
  Moon,
  Check,
  Menu,
  PanelLeft,
  SquarePen,
  LayoutDashboard
} from 'lucide-react';
import { NavPage } from './Sidebar';

interface TopNavbarProps {
  onNavigate: (page: NavPage) => void;
  activePage: NavPage;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onToggleMobileSidebar?: () => void;
  isDesktopSidebarOpen?: boolean;
  onToggleDesktopSidebar?: () => void;
  onNewChat?: (mode?: 'mode_a' | 'mode_b') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onNavigate,
  activePage,
  theme = 'dark',
  onToggleTheme,
  onToggleMobileSidebar,
  isDesktopSidebarOpen = true,
  onToggleDesktopSidebar,
  onNewChat
}) => {
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isModeB = activePage === 'export_buyer_leads';
  const activeMode: 'mode_a' | 'mode_b' = isModeB ? 'mode_b' : 'mode_a';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAgentsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white/90 dark:bg-[#212121]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-3 sm:px-5 w-full min-w-0 border-b border-neutral-200/70 dark:border-white/5">
      {/* Left: Sidebar Toggle + New Chat + ChatGPT Model/Mode Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-[#b4b4b4] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors shrink-0"
            title="Open navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {onToggleDesktopSidebar && !isDesktopSidebarOpen && (
          <button
            onClick={onToggleDesktopSidebar}
            className="hidden lg:flex p-2 rounded-lg text-neutral-600 dark:text-[#b4b4b4] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors shrink-0"
            title="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {onNewChat && (!isDesktopSidebarOpen || typeof window !== 'undefined') && (
          <button
            onClick={() => onNewChat(activeMode)}
            className={`${!isDesktopSidebarOpen ? 'flex' : 'flex lg:hidden'} p-2 rounded-lg text-neutral-600 dark:text-[#b4b4b4] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors shrink-0`}
            title="New chat"
          >
            <SquarePen className="w-4 h-4" />
          </button>
        )}

        {/* ChatGPT Model/Agent Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAgentsOpen(prev => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-neutral-900 dark:text-[#ececec] hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors"
          >
            <span className="truncate">
              {isModeB ? 'Export Hub' : 'DataGalactic'}
            </span>
            <span className="text-xs font-medium text-neutral-500 dark:text-[#9e9e9e]">
              {isModeB ? 'Mode B' : 'Mode A'}
            </span>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isAgentsOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAgentsOpen && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-2xl bg-white dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 shadow-xl p-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#9e9e9e]">
                Select AI Agent Mode
              </div>

              <button
                onClick={() => {
                  onNavigate('service_leads');
                  setIsAgentsOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors ${
                  activePage === 'service_leads'
                    ? 'bg-neutral-100 dark:bg-[#383838] text-neutral-900 dark:text-white'
                    : 'hover:bg-neutral-50 dark:hover:bg-[#383838]/60 text-neutral-700 dark:text-[#ececec]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200/80 dark:bg-[#212121] flex items-center justify-center text-neutral-800 dark:text-[#ececec] shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs truncate">DataGalactic • Mode A</div>
                    <div className="text-[11px] text-neutral-500 dark:text-[#9e9e9e] truncate">
                      10 B2B Services • UK, USA, CA & AU
                    </div>
                  </div>
                </div>
                {activePage === 'service_leads' && <Check className="w-4 h-4 text-[#10a37f] shrink-0" />}
              </button>

              <button
                onClick={() => {
                  onNavigate('export_buyer_leads');
                  setIsAgentsOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors mt-0.5 ${
                  activePage === 'export_buyer_leads'
                    ? 'bg-neutral-100 dark:bg-[#383838] text-neutral-900 dark:text-white'
                    : 'hover:bg-neutral-50 dark:hover:bg-[#383838]/60 text-neutral-700 dark:text-[#ececec]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200/80 dark:bg-[#212121] flex items-center justify-center text-neutral-800 dark:text-[#ececec] shrink-0">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs truncate">Export Hub • Mode B</div>
                    <div className="text-[11px] text-neutral-500 dark:text-[#9e9e9e] truncate">
                      Overseas Importers • Halal/ISO/MOQ
                    </div>
                  </div>
                </div>
                {activePage === 'export_buyer_leads' && <Check className="w-4 h-4 text-[#10a37f] shrink-0" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onNewChat && (
          <button
            onClick={() => onNewChat(activeMode)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-[#ececec] hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 transition-colors"
            title="Start fresh chat"
          >
            <SquarePen className="w-3.5 h-3.5" />
            <span>New chat</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activePage === 'dashboard'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-[#212121]'
              : 'text-neutral-700 dark:text-[#d4d4d4] hover:bg-neutral-100 dark:hover:bg-[#2f2f2f]'
          }`}
          title="Dashboard & Sent Mails"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          title="Company & Mail Settings"
          className="p-2 rounded-lg text-neutral-600 dark:text-[#b4b4b4] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-[#d4d4d4] hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
