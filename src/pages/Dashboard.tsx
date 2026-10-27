import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Mail,
  Send,
  MessageSquare,
  Clock,
  Sparkles,
  TrendingUp,
  Globe,
  Building,
  ArrowRight,
  Briefcase,
  Globe2,
  Check,
  ChevronRight,
  ShieldCheck,
  Package,
  CalendarClock,
  Inbox,
  Filter
} from 'lucide-react';
import { Lead, EmailDraft, ClientReply, ClientReplyStatus } from '../types';
import { StatusBadge } from '../components/Badge';
import { DATAGALACTIC_COMPANY } from '../data/catalog';

interface DashboardProps {
  leads: Lead[];
  drafts: EmailDraft[];
  clientReplies: ClientReply[];
  onNavigate: (page: any) => void;
  onSelectLead: (lead: Lead) => void;
  onUpdateClientReplyStatus?: (replyId: string, status: ClientReplyStatus) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  leads,
  drafts,
  clientReplies,
  onNavigate,
  onSelectLead,
  onUpdateClientReplyStatus
}) => {
  const [replyFilter, setReplyFilter] = useState<'all' | 'service_leads' | 'export_buyers' | 'needs_action' | 'in_discussion'>('all');

  // Real metrics derived strictly from lead records and drafts
  const totalLeads = leads.length;
  const modeALeads = leads.filter(l => l.leadMode === 'service_leads').length;
  const modeBLeads = leads.filter(l => l.leadMode === 'export_buyers').length;
  const emailsDrafted = drafts.length;
  const emailsSent = drafts.filter(d => d.status === 'Sent').length;
  const totalReplies = clientReplies.length;
  const needsActionCount = clientReplies.filter(r => r.status === 'Needs Action').length;
  const inDiscussionCount = clientReplies.filter(r => r.status === 'In Discussion').length;
  const convertedLeads = leads.filter(l => l.leadStatus === 'Converted').length;

  // Breakdown by Country
  const countryCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.country] = (acc[l.country] || 0) + 1;
    return acc;
  }, {});

  // Breakdown by Industry
  const industryCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.industry] = (acc[l.industry] || 0) + 1;
    return acc;
  }, {});

  // Filtered Client Replies
  const filteredReplies = clientReplies.filter(r => {
    if (replyFilter === 'service_leads') return r.leadMode === 'service_leads';
    if (replyFilter === 'export_buyers') return r.leadMode === 'export_buyers';
    if (replyFilter === 'needs_action') return r.status === 'Needs Action';
    if (replyFilter === 'in_discussion') return r.status === 'In Discussion';
    return true;
  });

  const metricCards = [
    { title: 'Total Prospects Saved', value: totalLeads, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Mode A: Service Leads', value: modeALeads, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Mode B: Export Buyers', value: modeBLeads, icon: Globe2, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { title: 'Outbound Mails Sent', value: emailsSent, icon: Send, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { title: 'Client Replies Received', value: totalReplies, icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', alert: needsActionCount > 0 },
    { title: 'Converted / Active Clients', value: convertedLeads + inDiscussionCount, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div className="galaxy-card rounded-2xl p-6 border border-indigo-500/20 bg-gradient-to-r from-galaxy-900 via-indigo-950/40 to-galaxy-900 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DataGalactic LeadPilot AI Engine Online</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {DATAGALACTIC_COMPANY.founder}. Ready for global outreach?
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Your platform is organized into two specialized workspaces: <strong className="text-indigo-300">Mode A</strong> for DataGalactic B2B service outreach (UK, USA, Canada, AU) and <strong className="text-sky-300">Mode B</strong> for International Export Buyer sourcing. Each mode has its own dedicated AI Agent, Mail processing, and follow-up cadences.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('service_leads')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>Open Mode A Workspace</span>
            </button>
            <button
              onClick={() => onNavigate('export_buyer_leads')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all"
            >
              <Globe2 className="w-4 h-4" />
              <span>Open Mode B Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="galaxy-card p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400 truncate">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{card.value}</span>
                {card.alert && (
                  <span className="text-[10px] text-amber-400 font-semibold animate-pulse">Action req.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 1: ORAL / ARCHITECTURAL EXPLANATION OF MODE A AND MODE B */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">System Architecture: Mode A & Mode B Workspaces</h2>
          </div>
          <span className="text-xs text-slate-400">Two dedicated, self-contained operational environments</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Mode A Overview Card */}
          <div className="galaxy-card p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-galaxy-900 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase">
                      Agent: Mode A Workspace
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">DataGalactic AI Agent & Services</h3>
                  </div>
                </div>
              </div>

              {/* Oral explanation summary */}
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>What it is:</strong> Mode A is your dedicated hub for selling DataGalactic's 10 Core Services (High-Speed Data Entry, CRM Data Cleaning, B2B Lead Gen, Document Digitization, and Administrative Support) to corporate clients across the UK, USA, Canada, and Australia.
              </p>

              {/* What lives inside this page */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Self-Contained Inside Mode A Page:
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>Dedicated AI Agent:</strong> Ask questions about DataGalactic services, pricing, and pitching strategies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>Sourced Service Leads:</strong> Filter prospects by UK/US/AU, 25 industries, and 10 core services.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>Outreach Mail Hub:</strong> Compose, approve, and send cold outreach emails directly from the page.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>Follow-up Cadence:</strong> Day 3 & Day 7 sales cadences with instant follow-up drafts.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {modeALeads} Active Prospects • UK, USA, AU, CA
              </span>
              <button
                onClick={() => onNavigate('service_leads')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                <span>Open Agent Mode A</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode B Overview Card */}
          <div className="galaxy-card p-6 rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 to-galaxy-900 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/30 text-sky-200 border border-sky-400/30 uppercase">
                      Agent: Mode B Workspace
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">International Export Sourcing Agent Hub</h3>
                  </div>
                </div>
              </div>

              {/* Oral explanation summary */}
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>What it is:</strong> Mode B is your dedicated hub for physical product exports. It targets international trade buyers, overseas importers, wholesalers, and regional distributors across the UAE, Europe, USA, and Southeast Asia.
              </p>

              {/* What lives inside this page */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider block">
                  Self-Contained Inside Mode B Page:
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>AI Trade Consultant:</strong> Inquire about international trade compliance, container MOQs, and port terms.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>Sourced Overseas Buyers:</strong> Filter by Container Load MOQ (20ft / 40ft FCL) and certificates (Halal, ISO, FDA).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>Export Mail Hub:</strong> Generate formal container trade proposals, CIF price lists, and sample offers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>Trade Cadence:</strong> Follow up on dispatched product catalogs, courier sample kits, and contracts.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {modeBLeads} Active Buyers • UAE, Sweden, EU, USA
              </span>
              <button
                onClick={() => onNavigate('export_buyer_leads')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30 transition-all"
              >
                <span>Open Agent Mode B</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MAIL RECEIVED & CLIENT REPLY STATUS HUB (REQUESTED BY USER) */}
      <div className="space-y-4">
        <div className="galaxy-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  Inbound Communications & Client Reply Tracker
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time tracking of received emails, client responses, sentiment analysis, and deal progression
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
              <button
                onClick={() => setReplyFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  replyFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Replies ({clientReplies.length})
              </button>
              <button
                onClick={() => setReplyFilter('service_leads')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  replyFilter === 'service_leads' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mode A (Services)
              </button>
              <button
                onClick={() => setReplyFilter('export_buyers')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  replyFilter === 'export_buyers' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mode B (Export)
              </button>
              <button
                onClick={() => setReplyFilter('needs_action')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  replyFilter === 'needs_action' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Needs Action ({needsActionCount})
              </button>
              <button
                onClick={() => setReplyFilter('in_discussion')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  replyFilter === 'in_discussion' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                In Discussion
              </button>
            </div>
          </div>

          {/* Client Reply Cards Feed */}
          <div className="space-y-3">
            {filteredReplies.map((reply) => (
              <div
                key={reply.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{reply.leadName}</span>
                    <span className="text-xs text-slate-400 font-medium">({reply.companyName})</span>

                    {/* Mode Tag */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      reply.leadMode === 'service_leads'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {reply.leadMode === 'service_leads' ? 'Mode A: Service Lead' : 'Mode B: Export Buyer'}
                    </span>

                    {/* Sentiment Tag */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      reply.sentiment === 'Meeting Requested'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : reply.sentiment === 'Pricing Inquiry'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : reply.sentiment === 'Sample Request'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {reply.sentiment}
                    </span>

                    {/* Status Badge */}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      reply.status === 'Needs Action'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : reply.status === 'In Discussion'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      Status: {reply.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white truncate">
                    {reply.replySubject}
                  </p>

                  {/* Reply message snippet */}
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed italic">
                    "{reply.replySnippet}"
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                    <span>Received: {reply.replyDate}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{reply.businessEmail}</span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={() => {
                      const target = leads.find(l => l.id === reply.leadId);
                      if (target) {
                        onSelectLead(target);
                        if (target.leadMode === 'service_leads') onNavigate('service_leads');
                        else onNavigate('export_buyer_leads');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>View & Respond</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {reply.status === 'Needs Action' && onUpdateClientReplyStatus && (
                    <button
                      onClick={() => onUpdateClientReplyStatus(reply.id, 'In Discussion')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Mark In Discussion
                    </button>
                  )}

                  {reply.status === 'In Discussion' && onUpdateClientReplyStatus && (
                    <button
                      onClick={() => onUpdateClientReplyStatus(reply.id, 'Converted')}
                      className="px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/40 transition-colors"
                    >
                      Convert Deal
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredReplies.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No client replies matching this filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: MARKET DISTRIBUTION & ACTION QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country Distribution */}
        <div className="galaxy-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Prospects by Country</span>
            </h3>
            <span className="text-xs text-slate-400">{Object.keys(countryCounts).length} markets</span>
          </div>

          <div className="space-y-3">
            {Object.entries(countryCounts).map(([country, count]) => {
              const percentage = Math.round((count / (totalLeads || 1)) * 100);
              return (
                <div key={country} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{country}</span>
                    <span className="text-slate-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Industry Distribution */}
        <div className="galaxy-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-400" />
              <span>Target Sectors & Trade Hubs</span>
            </h3>
            <span className="text-xs text-slate-400">{Object.keys(industryCounts).length} sectors</span>
          </div>

          <div className="space-y-3">
            {Object.entries(industryCounts).slice(0, 5).map(([ind, count]) => {
              const percentage = Math.round((count / (totalLeads || 1)) * 100);
              return (
                <div key={ind} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[200px]">{ind}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Action Center */}
        <div className="galaxy-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Quick Action Center</span>
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">
                  {needsActionCount} Inbound Replies Need Action
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Clients in Europa Worldwide and Biofood asked for pricing & samples.
                </p>
                <button
                  onClick={() => setReplyFilter('needs_action')}
                  className="mt-2 text-xs text-amber-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Filter Replies Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-indigo-300">
                  Mode A: Service Outreach
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Target UK Logistics & US SaaS companies for Data Cleaning.
                </p>
                <button
                  onClick={() => onNavigate('service_leads')}
                  className="mt-2 text-xs text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Mode A Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
