import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  SlidersHorizontal,
  ArrowRight,
  RefreshCw,
  Building2,
  MapPin,
  Users2,
  Briefcase,
  Bot,
  Globe2
} from 'lucide-react';
import { ParsedSearchFilters, Lead } from '../types';
import { TARGET_COUNTRIES, TARGET_CLIENT_INDUSTRIES } from '../data/catalog';

interface AiLeadFinderProps {
  onSearchComplete: (leads: Lead[]) => void;
  isDemoMode: boolean;
  onNavigate?: (page: any) => void;
}

export const AiLeadFinder: React.FC<AiLeadFinderProps> = ({
  onSearchComplete,
  isDemoMode,
  onNavigate
}) => {
  const [prompt, setPrompt] = useState(
    'Find 100 UK logistics companies with 50-500 employees. Identify founders, COOs, heads of operations, and procurement managers. Collect company names, domains, websites, professional contact names, job titles, available business emails, LinkedIn profile URLs when provided by an authorized source, company LinkedIn URLs, and source links.'
  );

  const [isParsing, setIsParsing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<ParsedSearchFilters | null>(null);
  const [explanation, setExplanation] = useState<string>('');

  const samplePrompts = [
    'Find 100 UK logistics companies with 50-500 employees. Identify founders, COOs, heads of operations, and procurement managers.',
    'Find 50 US SaaS companies that may need data processing and business support services.',
    'Find 30 Australian e-commerce businesses needing Shopify product catalog data entry and CRM management.',
    'Find international organic food and spices distributors and importers in UAE and Singapore.'
  ];

  const handleParsePrompt = async () => {
    setIsParsing(true);
    try {
      const response = await fetch('/api/parse-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.success) {
        setParsedFilters(data.parsedFilters);
        setExplanation(data.explanation);
      }
    } catch (e) {
      console.error(e);
      // Fallback client parser
      setParsedFilters({
        leadMode: prompt.toLowerCase().includes('export') || prompt.toLowerCase().includes('importer') ? 'export_buyers' : 'service_leads',
        country: prompt.toLowerCase().includes('us') ? 'United States (USA)' : 'United Kingdom (UK)',
        industry: prompt.toLowerCase().includes('saas') ? 'IT & Software Companies' : 'Logistics & Shipping Companies',
        requestedCount: 25,
        employeeRange: '50-200',
        companyKeywords: ['Logistics', 'Operations', 'Freight'],
        targetJobTitles: ['Founder / CEO', 'COO', 'Head of Operations'],
        seniority: ['C-Suite', 'VP / Director'],
        businessServiceRequirements: ['Back-Office Support', 'Data Entry', 'Data Cleaning'],
        availableContactFields: ['Verified Business Email', 'Full Name', 'Domain', 'Job Title'],
        minimumQualityScore: 85
      });
      setExplanation('Parsed using local DataGalactic rule-engine fallback.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteSearch = async () => {
    if (!parsedFilters) return;
    setIsSearching(true);

    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: parsedFilters }),
      });
      const data = await response.json();
      if (data.success && data.leads) {
        onSearchComplete(data.leads);
      }
    } catch (e) {
      console.error('Lead search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode A & Mode B Quick Agent Navigation Banner */}
      <div className="galaxy-card p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-galaxy-900 via-indigo-950/30 to-galaxy-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Dedicated AI Lead Agents</h3>
            <p className="text-[11px] text-slate-400">Launch specialized workspaces with dedicated Agent chat, sourcing, mail, and follow-ups</p>
          </div>
        </div>

        {onNavigate && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('service_leads')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Agent: Mode A (DataGalactic)</span>
            </button>
            <button
              onClick={() => onNavigate('export_buyer_leads')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-600/30 transition-all"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Agent: Mode B (Export Hub)</span>
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">AI Lead Finder (Natural Language Prompt)</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Type instructions in everyday plain English. Google Gemini parses your request into verified target filters before sourcing.
        </p>
      </div>

      {/* Input Card */}
      <div className="galaxy-card p-6 rounded-2xl border border-indigo-500/20">
        <label className="block text-xs font-semibold text-slate-200 mb-2">
          Natural Language Lead Search Instruction:
        </label>
        <div className="relative">
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Find 100 UK logistics companies with 50-500 employees. Identify founders, COOs, heads of operations, and collect verified business emails..."
            className="w-full p-4 bg-slate-950/80 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono leading-relaxed"
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="mt-3">
          <span className="text-[11px] text-slate-400 font-medium mr-2">Try quick examples:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(s)}
                className="text-[11px] px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left truncate max-w-md"
              >
                "{s.substring(0, 60)}..."
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleParsePrompt}
            disabled={isParsing || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
          >
            {isParsing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Parsing Query...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse Instructions with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Parsed Filters Review & Edit Panel */}
      {parsedFilters && (
        <div className="galaxy-card p-6 rounded-2xl border border-emerald-500/30 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Parsed Search Filters (Review & Edit Before Running)</h3>
                <p className="text-xs text-slate-400">{explanation}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isDemoMode ? 'bg-amber-950 text-amber-300 border border-amber-500/30' : 'bg-emerald-950 text-emerald-300'
              }`}>
                {isDemoMode ? 'Protected Demo Mode' : 'Live Provider Active'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {/* Target Country */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                Target Country
              </label>
              <select
                value={parsedFilters.country}
                onChange={(e) => setParsedFilters({ ...parsedFilters, country: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                {TARGET_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Target Industry */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                Target Industry
              </label>
              <select
                value={parsedFilters.industry}
                onChange={(e) => setParsedFilters({ ...parsedFilters, industry: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                {TARGET_CLIENT_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Employee Size Range */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                Employee Size
              </label>
              <select
                value={parsedFilters.employeeRange}
                onChange={(e) => setParsedFilters({ ...parsedFilters, employeeRange: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="10-50">10–50 Employees (Small Business)</option>
                <option value="50-200">50–200 Employees (Mid-Market)</option>
                <option value="200-500">200–500 Employees (Upper Mid-Market)</option>
                <option value="500+">500+ Employees (Enterprise)</option>
              </select>
            </div>

            {/* Requested Lead Count */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                Number of Leads
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={parsedFilters.requestedCount}
                onChange={(e) => setParsedFilters({ ...parsedFilters, requestedCount: parseInt(e.target.value) || 25 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Job Titles Badges */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              Target Decision-Maker Job Titles:
            </label>
            <div className="flex flex-wrap gap-2">
              {parsedFilters.targetJobTitles.map((title, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                >
                  {title}
                </span>
              ))}
            </div>
          </div>

          {/* Minimum Lead Quality Score */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium">Minimum Lead Quality Threshold:</span>
              <span className="text-sm font-bold text-emerald-400">{parsedFilters.minimumQualityScore}/100</span>
            </div>

            <button
              onClick={handleExecuteSearch}
              disabled={isSearching}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sourcing Leads from Providers...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Run Search & Populate CRM</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
