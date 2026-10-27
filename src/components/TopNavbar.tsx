import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bot,
  ChevronDown,
  Briefcase,
  Globe2,
  Settings,
  Sparkles,
  ArrowDownUp,
  Sun,
  Moon,
  Check,
  Menu
} from 'lucide-react';
import { NavPage } from './Sidebar';

interface TopNavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onQuickSearch: () => void;
  onNavigate: (page: NavPage) => void;
  activePage: NavPage;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onQuickSearch,
  onNavigate,
  activePage,
  theme = 'light',
  onToggleTheme,
  onToggleMobileSidebar
}) => {
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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
    <header className="h-16 border-b border-slate-800/80 bg-galaxy-900/80 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 shadow-lg shadow-black/20 w-full min-w-0">
      {/* Global Search Bar & Mobile Menu Button */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-[200px] sm:max-w-xs min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 shrink-0"
            title="Open Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onQuickSearch()}
            placeholder="Search leads, domains..."
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-950/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner truncate"
          />
        </div>
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-3">
        {/* Instagram-Style Multi-Account Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAgentsOpen(prev => !prev)}
            title="Switch Operating Account (Instagram Multi-Account Style)"
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activePage === 'service_leads'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400/50 shadow-md shadow-indigo-600/30'
                : activePage === 'export_buyer_leads'
                ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white border-sky-400/50 shadow-md shadow-sky-600/30'
                : 'bg-galaxy-850/90 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:border-indigo-500/50'
            }`}
          >
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
              activePage === 'export_buyer_leads' ? 'bg-sky-400/20 text-sky-200' : 'bg-indigo-400/20 text-indigo-200'
            }`}>
              {activePage === 'export_buyer_leads' ? <Globe2 className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span>{activePage === 'export_buyer_leads' ? 'Mode B: Export Hub' : 'Mode A: DataGalactic'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAgentsOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {/* Instagram Account Dropdown Menu */}
          {isAgentsOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Account (Instagram Style)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">2 Modes</span>
              </div>

              <div className="space-y-1.5 pt-2">
                {/* Account 1: Mode A */}
                <button
                  onClick={() => {
                    onNavigate('service_leads');
                    setIsAgentsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                    activePage === 'service_leads'
                      ? 'bg-indigo-600/20 border border-indigo-500/50 text-white'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-600/30">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate text-white">Mode A: DataGalactic</div>
                      <div className="text-[10px] text-slate-400 truncate">10 Services • UK/USA Client Leads</div>
                    </div>
                  </div>
                  {activePage === 'service_leads' && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>

                {/* Account 2: Mode B */}
                <button
                  onClick={() => {
                    onNavigate('export_buyer_leads');
                    setIsAgentsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                    activePage === 'export_buyer_leads'
                      ? 'bg-sky-600/20 border border-sky-500/50 text-white'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-sky-600/30">
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate text-white">Mode B: Export Hub</div>
                      <div className="text-[10px] text-slate-400 truncate">Overseas Importers • Halal/ISO</div>
                    </div>
                  </div>
                  {activePage === 'export_buyer_leads' && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Direct Mode A Button */}
        <button
          onClick={() => onNavigate('service_leads')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePage === 'service_leads'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400/50 shadow-md shadow-indigo-600/30'
              : 'bg-galaxy-850/90 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:border-indigo-500/50'
          }`}
        >
          <div className="w-4 h-4 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-300">
            <Briefcase className="w-3 h-3" />
          </div>
          <span>Mode A</span>
        </button>

        {/* Quick Direct Mode B Button */}
        <button
          onClick={() => onNavigate('export_buyer_leads')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePage === 'export_buyer_leads'
              ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white border-sky-400/50 shadow-md shadow-sky-600/30'
              : 'bg-galaxy-850/90 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:border-sky-500/50'
          }`}
        >
          <div className="w-4 h-4 rounded bg-sky-500/20 flex items-center justify-center text-sky-300">
            <Globe2 className="w-3 h-3" />
          </div>
          <span>Mode B</span>
        </button>

        {/* Settings Button: Opens active mode company & sender settings */}
        <button
          onClick={() => onNavigate(activePage === 'export_buyer_leads' ? 'export_buyer_leads' : 'service_leads')}
          title="Company & Sender Profile Settings"
          className="p-2.5 rounded-xl border transition-all bg-galaxy-850/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/70 hover:border-indigo-500/50"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* 5. Theme Switcher (Option 2 Clean Light vs Cosmic Dark) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? "Switch to Cosmic Dark Mode" : "Switch to Enterprise Clean Light Mode"}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-galaxy-850/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm group"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 transition-transform group-hover:rotate-12" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform group-hover:rotate-45" />
                <span>Light</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
