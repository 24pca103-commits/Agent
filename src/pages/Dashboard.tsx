import React, { useState } from 'react';
import {
  Users,
  Send,
  MessageSquare,
  Building,
  Mail,
  ArrowRight,
  Search,
  ExternalLink,
  Copy,
  Check,
  Briefcase,
  Globe2,
  Sparkles,
  X,
  Inbox,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Lead, EmailDraft, ClientReply, ClientReplyStatus } from '../types';
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
  const [emailSearch, setEmailSearch] = useState('');
  const [emailModeFilter, setEmailModeFilter] = useState<'all' | 'service_leads' | 'export_buyers'>('all');
  const [viewingDraft, setViewingDraft] = useState<EmailDraft | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [replyFilter, setReplyFilter] = useState<'all' | 'needs_action' | 'in_discussion'>('all');

  // Exact metrics required: Leads Sourced & Companies Emailed
  const totalLeads = leads.length;
  const modeALeads = leads.filter(l => l.leadMode === 'service_leads').length;
  const modeBLeads = leads.filter(l => l.leadMode === 'export_buyers').length;

  // Filter only drafts that were actually SENT to companies
  const sentDrafts = drafts.filter(d => d.status === 'Sent');
  const emailsSent = sentDrafts.length;
  const modeASent = sentDrafts.filter(d => d.leadMode === 'service_leads' || !d.leadMode).length;
  const modeBSent = sentDrafts.filter(d => d.leadMode === 'export_buyers').length;

  // Filter sent emails based on user search and mode tabs
  const filteredSentEmails = sentDrafts.filter(d => {
    if (emailModeFilter === 'service_leads' && d.leadMode === 'export_buyers') return false;
    if (emailModeFilter === 'export_buyers' && d.leadMode !== 'export_buyers') return false;
    if (!emailSearch.trim()) return true;
    const q = emailSearch.toLowerCase();
    return (
      (d.companyName && d.companyName.toLowerCase().includes(q)) ||
      (d.recipientName && d.recipientName.toLowerCase().includes(q)) ||
      (d.recipientEmail && d.recipientEmail.toLowerCase().includes(q)) ||
      (d.subject && d.subject.toLowerCase().includes(q)) ||
      (d.recommendedService && d.recommendedService.toLowerCase().includes(q))
    );
  });

  // Filter inbound replies
  const filteredReplies = clientReplies.filter(r => {
    if (replyFilter === 'needs_action') return r.status === 'Needs Action';
    if (replyFilter === 'in_discussion') return r.status === 'In Discussion';
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Navigation Header */}
      <div className="galaxy-card rounded-2xl p-6 border border-indigo-500/20 bg-gradient-to-r from-galaxy-900 via-indigo-950/40 to-galaxy-900 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DataGalactic Executive Outreach Center</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome, {DATAGALACTIC_COMPANY.founder}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Direct tracking of sourced prospects and outbound client emails.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('service_leads')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Briefcase className="w-4 h-4" />
              <span>Open Mode A (Services)</span>
            </button>
            <button
              onClick={() => onNavigate('export_buyer_leads')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
            >
              <Globe2 className="w-4 h-4" />
              <span>Open Mode B (Export)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Key Metrics (Required by User: Leads Sourced & Companies Emailed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Total Leads Sourced */}
        <div className="galaxy-card p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Leads Sourced</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalLeads}</span>
            <span className="text-xs text-indigo-300 font-medium">Verified Records</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Mode A Services: <strong className="text-slate-200">{modeALeads}</strong></span>
            <span>•</span>
            <span>Mode B Export: <strong className="text-slate-200">{modeBLeads}</strong></span>
          </div>
        </div>

        {/* Metric 2: Companies Emailed */}
        <div className="galaxy-card p-5 rounded-2xl border border-emerald-500/30 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Companies Emailed (Sent)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{emailsSent}</span>
            <span className="text-xs text-slate-300 font-medium">Outbound Mails Delivered</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Mode A: <strong className="text-slate-200">{modeASent}</strong> sent</span>
            <span>•</span>
            <span>Mode B: <strong className="text-slate-200">{modeBSent}</strong> sent</span>
          </div>
        </div>

        {/* Metric 3: Inbound Client Replies */}
        <div className="galaxy-card p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Client Responses Received</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-400">{clientReplies.length}</span>
            <span className="text-xs text-slate-300 font-medium">Inbound Client Replies</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Response Rate: <strong className="text-purple-300">{emailsSent > 0 ? Math.round((clientReplies.length / emailsSent) * 100) : 0}%</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Active Inbound</span>
          </div>
        </div>
      </div>

      {/* MAIN SECTION: EMAILED COMPANIES TABLE ("yna yna company mail panirukomnu matum view ana pothum") */}
      <div className="galaxy-card p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                Emailed Companies & Sent Outreach Log
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete list of companies that received outbound cold emails from DataGalactic
            </p>
          </div>

          {/* Mode Filter Tabs & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setEmailModeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  emailModeFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Sent ({sentDrafts.length})
              </button>
              <button
                onClick={() => setEmailModeFilter('service_leads')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  emailModeFilter === 'service_leads'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mode A ({modeASent})
              </button>
              <button
                onClick={() => setEmailModeFilter('export_buyers')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  emailModeFilter === 'export_buyers'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mode B ({modeBSent})
              </button>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Search company or email..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Sent Emails Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3 font-semibold min-w-[150px]">Company Name</th>
                <th className="py-2.5 px-3 font-semibold min-w-[130px]">Decision Maker</th>
                <th className="py-2.5 px-3 font-semibold min-w-[160px]">Business Email</th>
                <th className="py-2.5 px-3 font-semibold min-w-[180px]">Pitched Service / Subject</th>
                <th className="py-2.5 px-3 font-semibold min-w-[110px]">Date Sent</th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSentEmails.length > 0 ? (
                filteredSentEmails.map((draft, idx) => (
                  <tr key={draft.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[10px]">
                      {idx + 1}
                    </td>

                    {/* Company Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{draft.companyName}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold mt-0.5 inline-block ${
                        draft.leadMode === 'export_buyers'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {draft.leadMode === 'export_buyers' ? 'Mode B: Export' : 'Mode A: Service'}
                      </span>
                    </td>

                    {/* Contact Person */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200 text-xs truncate max-w-[130px]">
                        {draft.recipientName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {draft.jobTitle}
                      </div>
                    </td>

                    {/* Business Email */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-slate-300 text-[11px] truncate max-w-[140px]">
                          {draft.recipientEmail}
                        </span>
                        <button
                          onClick={() => handleCopy(draft.recipientEmail)}
                          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                          title="Copy Email"
                        >
                          {copiedEmail === draft.recipientEmail ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Subject / Service */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-200 text-xs truncate max-w-[180px]">
                        {draft.subject}
                      </div>
                      <span className="text-[10px] text-indigo-300/80 truncate block max-w-[180px]">
                        Service: {draft.recommendedService || 'Direct Outreach'}
                      </span>
                    </td>

                    {/* Sent Date */}
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {draft.sentAt
                        ? new Date(draft.sentAt).toLocaleDateString([], {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Recently Sent'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Sent</span>
                      </span>
                    </td>

                    {/* Action: View Sent Email */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setViewingDraft(draft)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[11px] font-semibold border border-indigo-500/40 transition-colors whitespace-nowrap"
                      >
                        View Email
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Send className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">No Sent Emails Found</p>
                      <p className="text-xs text-slate-400">
                        {emailSearch
                          ? 'No sent emails match your search query.'
                          : 'Go to Mode A (Services) or Mode B (Export) to draft and approve emails. Once sent, they appear right here!'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPACT INBOUND CLIENT REPLIES SECTION */}
      <div className="galaxy-card p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                Client Inbound Responses
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live replies and interest received from contacted companies
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setReplyFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                replyFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Replies ({clientReplies.length})
            </button>
            <button
              onClick={() => setReplyFilter('needs_action')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                replyFilter === 'needs_action' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Needs Action
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

        <div className="space-y-2.5">
          {filteredReplies.map((reply) => (
            <div
              key={reply.id}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-xs">{reply.leadName}</span>
                  <span className="text-[11px] text-slate-400">({reply.companyName})</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    reply.leadMode === 'service_leads'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-sky-500/20 text-sky-300'
                  }`}>
                    {reply.leadMode === 'service_leads' ? 'Mode A' : 'Mode B'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-purple-500/20 text-purple-300">
                    {reply.sentiment}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300">
                    Status: {reply.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-white truncate">
                  {reply.replySubject}
                </p>
                <p className="text-[11px] text-slate-300 italic truncate max-w-2xl">
                  "{reply.replySnippet}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const target = leads.find(l => l.id === reply.leadId);
                    if (target) {
                      onSelectLead(target);
                      if (target.leadMode === 'service_leads') onNavigate('service_leads');
                      else onNavigate('export_buyer_leads');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {filteredReplies.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs">
              No replies matching this filter.
            </div>
          )}
        </div>
      </div>

      {/* VIEW SENT EMAIL MODAL */}
      {viewingDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  ✓ Sent Outbound Email
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {viewingDraft.companyName}
                </h3>
              </div>
              <button
                onClick={() => setViewingDraft(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Meta Details */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16">To:</span>
                <span className="font-semibold text-white">{viewingDraft.recipientName}</span>
                <span className="text-slate-400">({viewingDraft.jobTitle})</span>
                <span className="font-mono text-indigo-300 ml-auto">{viewingDraft.recipientEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16">Subject:</span>
                <span className="font-bold text-slate-200">{viewingDraft.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16">Service:</span>
                <span className="text-indigo-300 font-medium">{viewingDraft.recommendedService || 'Direct Pitch'}</span>
                {viewingDraft.sentAt && (
                  <span className="text-slate-400 ml-auto">
                    Sent: {new Date(viewingDraft.sentAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Email Body */}
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="whitespace-pre-wrap text-xs text-slate-200 leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800">
                {viewingDraft.body}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleCopy(viewingDraft.body)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedEmail === viewingDraft.body ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Email Text</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setViewingDraft(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
