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
  Moon
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
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onQuickSearch,
  onNavigate,
  activePage,
  theme = 'light',
  onToggleTheme
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
    <header className="h-16 border-b border-slate-800/80 bg-galaxy-900/80 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-6 shadow-lg shadow-black/20">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 w-72 max-w-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onQuickSearch()}
            placeholder="Search leads, domains, contacts..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-3">
        {/* 1. AI Lead Finder in Navbar */}
        <button
          onClick={() => onNavigate('ai_lead_finder')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePage === 'ai_lead_finder'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400/50 shadow-md shadow-indigo-600/30'
              : 'bg-galaxy-850/90 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:border-indigo-500/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI Lead Finder</span>
        </button>

        {/* 2. AI Lead Agents Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAgentsOpen(!isAgentsOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activePage === 'service_leads' || activePage === 'export_buyer_leads'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400/50 shadow-md shadow-indigo-600/30'
                : 'bg-galaxy-850/90 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:border-indigo-500/50'
            }`}
          >
            <div className="w-5 h-5 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>AI Lead Agents</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isAgentsOpen ? 'rotate-180 text-white' : ''}`} />
          </button>

          {/* Dropdown Popover (100% Solid Opaque Background) */}
          {isAgentsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0b1021] border border-slate-700/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Select Active Agent
              </div>

              {/* Option 1: DataGalactic Service Leads */}
              <button
                onClick={() => {
                  onNavigate('service_leads');
                  setIsAgentsOpen(false);
                }}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all mt-1 ${
                  activePage === 'service_leads'
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                    : 'hover:bg-slate-800/70 text-slate-300 hover:text-white'
                }`}
              >
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>DataGalactic Service Leads</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-semibold leading-normal">Mode A</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Target UK, US, Canada & AU clients needing B2B data & business support services.
                  </p>
                </div>
              </button>

              {/* Option 2: Export Buyer Leads */}
              <button
                onClick={() => {
                  onNavigate('export_buyer_leads');
                  setIsAgentsOpen(false);
                }}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all mt-1 ${
                  activePage === 'export_buyer_leads'
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                    : 'hover:bg-slate-800/70 text-slate-300 hover:text-white'
                }`}
              >
                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300 shrink-0 mt-0.5">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Export Buyer Leads</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/30 text-sky-200 font-semibold leading-normal">Mode B</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Find international importers, distributors & wholesalers for physical product exports.
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 3. Import & Export in Navbar */}
        <button
          onClick={() => onNavigate('import_export')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activePage === 'import_export'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400/50 shadow-md shadow-indigo-600/30'
              : 'bg-galaxy-850/90 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:border-indigo-500/50'
          }`}
        >
          <ArrowDownUp className="w-3.5 h-3.5 text-sky-400" />
          <span>Import / Export</span>
        </button>

        {/* 4. Settings Button */}
        <button
          onClick={() => onNavigate('settings')}
          title="System Settings & Database"
          className={`p-2.5 rounded-xl border transition-all ${
            activePage === 'settings'
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
              : 'bg-white dark:bg-galaxy-850/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/70'
          }`}
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
