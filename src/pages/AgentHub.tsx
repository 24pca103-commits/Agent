import React, { useState, useEffect } from 'react';
import {
  Bot,
  Briefcase,
  Globe2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Lead, EmailDraft } from '../types';
import { ServiceLeads } from './ServiceLeads';
import { ExportBuyerLeads } from './ExportBuyerLeads';

interface AgentHubProps {
  initialMode?: 'mode_a' | 'mode_b';
  leads: Lead[];
  drafts: EmailDraft[];
  onSelectLead: (lead: Lead) => void;
  onAddNewLead: (lead: Lead) => void;
  onAddMultipleLeads?: (leads: Lead[]) => void;
  onSaveDraftForApproval: (draft: EmailDraft) => void;
  onApproveAndSend: (draftId: string) => Promise<boolean>;
  onUpdateLead?: (lead: Lead) => void;
}

export const AgentHub: React.FC<AgentHubProps> = ({
  initialMode = 'mode_a',
  leads,
  drafts,
  onSelectLead,
  onAddNewLead,
  onAddMultipleLeads,
  onSaveDraftForApproval,
  onApproveAndSend,
  onUpdateLead
}) => {
  const [activeMode, setActiveMode] = useState<'mode_a' | 'mode_b'>(initialMode);

  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  const modeALeadsCount = leads.filter(l => l.leadMode === 'service_leads').length;
  const modeBLeadsCount = leads.filter(l => l.leadMode === 'export_buyers').length;

  return (
    <div className="space-y-6">
      {/* Master Agent Hub Header & Mode Switcher */}
      <div className="galaxy-card p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-galaxy-900 via-indigo-950/40 to-galaxy-900 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">AI Lead Agent Hub</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-bold uppercase">
                  Modes A & B
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Two specialized AI agent environments for DataGalactic service outreach and international export sourcing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Current View:</span>
            <span className={`px-2.5 py-1 rounded-xl font-bold ${
              activeMode === 'mode_a'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
            }`}>
              {activeMode === 'mode_a' ? 'Mode A: DataGalactic B2B Services' : 'Mode B: Export Buyer Sourcing'}
            </span>
          </div>
        </div>

        {/* Large Prominent Mode Switcher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
          {/* Mode A Selector */}
          <button
            onClick={() => setActiveMode('mode_a')}
            className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 relative overflow-hidden group ${
              activeMode === 'mode_a'
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${
              activeMode === 'mode_a' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-indigo-400'
            }`}>
              <Briefcase className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-white">Mode A: DataGalactic Services Agent</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-500/30 text-indigo-200">
                  {modeALeadsCount} Leads
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                UK, USA, Canada, AU clients • 10 Core Services • Dedicated Agent chat, service leads, cold mail & follow-ups
              </p>
            </div>

            {activeMode === 'mode_a' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
            )}
          </button>

          {/* Mode B Selector */}
          <button
            onClick={() => setActiveMode('mode_b')}
            className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 relative overflow-hidden group ${
              activeMode === 'mode_b'
                ? 'bg-sky-600/20 border-sky-500 text-white shadow-lg shadow-sky-600/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${
              activeMode === 'mode_b' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-sky-400'
            }`}>
              <Globe2 className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-white">Mode B: International Export Sourcing Agent</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-sky-500/30 text-sky-200">
                  {modeBLeadsCount} Buyers
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Overseas importers, distributors, wholesalers • Container MOQ & Certifications (Halal, ISO) • Export inquiries
              </p>
            </div>

            {activeMode === 'mode_b' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500" />
            )}
          </button>
        </div>
      </div>

      {/* RENDER THE SELECTED MODE'S DEDICATED PAGE VIEW */}
      <div>
        {activeMode === 'mode_a' && (
          <ServiceLeads
            leads={leads}
            drafts={drafts}
            onSelectLead={onSelectLead}
            onAddNewLead={onAddNewLead}
            onAddMultipleLeads={onAddMultipleLeads}
            onSaveDraftForApproval={onSaveDraftForApproval}
            onApproveAndSend={onApproveAndSend}
            onUpdateLead={onUpdateLead}
          />
        )}

        {activeMode === 'mode_b' && (
          <ExportBuyerLeads
            leads={leads}
            drafts={drafts}
            onSelectLead={onSelectLead}
            onAddNewLead={onAddNewLead}
            onAddMultipleLeads={onAddMultipleLeads}
            onSaveDraftForApproval={onSaveDraftForApproval}
            onApproveAndSend={onApproveAndSend}
            onUpdateLead={onUpdateLead}
          />
        )}
      </div>
    </div>
  );
};
