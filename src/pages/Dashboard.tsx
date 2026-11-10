import React, { useState } from 'react';
import {
  Users,
  Send,
  MessageSquare,
  Building,
  Mail,
  ArrowRight,
  Search,
  Copy,
  Check,
  Briefcase,
  Globe2,
  X,
  Inbox,
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
  onSelectLead
}) => {
  const [emailSearch, setEmailSearch] = useState('');
  const [emailModeFilter, setEmailModeFilter] = useState<'all' | 'service_leads' | 'export_buyers'>('all');
  const [viewingDraft, setViewingDraft] = useState<EmailDraft | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [replyFilter, setReplyFilter] = useState<'all' | 'needs_action' | 'in_discussion'>('all');

  const totalLeads = leads.length;
  const modeALeads = leads.filter(l => l.leadMode === 'service_leads').length;
  const modeBLeads = leads.filter(l => l.leadMode === 'export_buyers').length;

  const sentDrafts = drafts.filter(d => d.status === 'Sent');
  const emailsSent = sentDrafts.length;
  const modeASent = sentDrafts.filter(d => d.leadMode === 'service_leads' || !d.leadMode).length;
  const modeBSent = sentDrafts.filter(d => d.leadMode === 'export_buyers').length;

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
      {/* Executive Header */}
      <div className="chatgpt-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#d4d4d4] text-[11px] font-medium mb-2">
            DataGalactic Executive Outreach Center
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Welcome, {DATAGALACTIC_COMPANY.founder}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-1">
            Direct overview of sourced leads, outbound mailed companies, and client responses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigate('service_leads')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold hover:opacity-85 transition-opacity"
          >
            <Briefcase className="w-4 h-4" />
            <span>Open Mode A Agent</span>
          </button>
          <button
            onClick={() => onNavigate('export_buyer_leads')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-900 dark:text-white border border-neutral-200 dark:border-white/10 text-xs font-semibold transition-colors"
          >
            <Globe2 className="w-4 h-4" />
            <span>Open Mode B Agent</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics: Leads Sourced, Companies Emailed, Inbound Replies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="chatgpt-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-[#9e9e9e]">Total Leads Sourced</span>
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-800 dark:text-white border border-neutral-200 dark:border-white/10">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">{totalLeads}</span>
            <span className="text-xs text-neutral-500 dark:text-[#9e9e9e] font-medium">Verified Records</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-500 dark:text-[#9e9e9e]">
            <span>
              Mode A Services: <strong className="text-neutral-900 dark:text-white">{modeALeads}</strong>
            </span>
            <span>•</span>
            <span>
              Mode B Export: <strong className="text-neutral-900 dark:text-white">{modeBLeads}</strong>
            </span>
          </div>
        </div>

        <div className="chatgpt-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-[#9e9e9e]">
              Companies Emailed (Sent)
            </span>
            <div className="p-2 rounded-xl bg-[#10a37f]/15 text-[#10a37f] border border-[#10a37f]/25">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#10a37f]">{emailsSent}</span>
            <span className="text-xs text-neutral-500 dark:text-[#9e9e9e] font-medium">Outbound Mails Delivered</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-500 dark:text-[#9e9e9e]">
            <span>
              Mode A: <strong className="text-neutral-900 dark:text-white">{modeASent}</strong> sent
            </span>
            <span>•</span>
            <span>
              Mode B: <strong className="text-neutral-900 dark:text-white">{modeBSent}</strong> sent
            </span>
          </div>
        </div>

        <div className="chatgpt-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-[#9e9e9e]">
              Client Responses Received
            </span>
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-800 dark:text-white border border-neutral-200 dark:border-white/10">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">{clientReplies.length}</span>
            <span className="text-xs text-neutral-500 dark:text-[#9e9e9e] font-medium">Inbound Replies</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-500 dark:text-[#9e9e9e]">
            <span>
              Response Rate:{' '}
              <strong className="text-neutral-900 dark:text-white">
                {emailsSent > 0 ? Math.round((clientReplies.length / emailsSent) * 100) : 0}%
              </strong>
            </span>
            <span>•</span>
            <span className="text-[#10a37f] font-semibold">Active Inbound</span>
          </div>
        </div>
      </div>

      {/* EMAILED COMPANIES LOG TABLE */}
      <div className="chatgpt-card p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#10a37f]" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Emailed Companies & Sent Outreach Log
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-0.5">
              Complete list of companies that received outbound emails
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <div className="flex items-center flex-wrap gap-1 bg-neutral-100 dark:bg-[#212121] p-1 rounded-xl border border-neutral-200 dark:border-white/10">
              <button
                onClick={() => setEmailModeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  emailModeFilter === 'all'
                    ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white'
                    : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                All ({sentDrafts.length})
              </button>
              <button
                onClick={() => setEmailModeFilter('service_leads')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  emailModeFilter === 'service_leads'
                    ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white'
                    : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Mode A ({modeASent})
              </button>
              <button
                onClick={() => setEmailModeFilter('export_buyers')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  emailModeFilter === 'export_buyers'
                    ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white'
                    : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Mode B ({modeBSent})
              </button>
            </div>

            <div className="relative w-full sm:w-56 min-w-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Search company or email..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden">
          <div className="hidden md:block overflow-x-hidden">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-neutral-50 dark:bg-[#212121] text-neutral-500 dark:text-[#9e9e9e] text-[10px] uppercase tracking-wider border-b border-neutral-200 dark:border-white/10">
                <tr>
                  <th className="py-2.5 px-2 text-center w-[34px]">#</th>
                  <th className="py-2.5 px-2.5 font-semibold">Company Name</th>
                  <th className="py-2.5 px-2.5 font-semibold w-[19%] xl:w-[16%]">Decision Maker</th>
                  <th className="py-2.5 px-2.5 font-semibold w-[23%] xl:w-[19%]">Business Email</th>
                  <th className="py-2.5 px-2.5 font-semibold hidden xl:table-cell w-[20%]">Service / Subject</th>
                  <th className="py-2.5 px-2 font-semibold hidden xl:table-cell w-[96px]">Date Sent</th>
                  <th className="py-2.5 px-2 font-semibold text-center w-[78px]">Status</th>
                  <th className="py-2.5 px-2.5 font-semibold text-right w-[72px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {filteredSentEmails.length > 0 ? (
                  filteredSentEmails.map((draft, idx) => (
                    <tr key={draft.id} className="hover:bg-neutral-50 dark:hover:bg-[#212121] transition-colors">
                      <td className="py-2.5 px-2 text-center font-mono text-neutral-400 text-[10px]">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-2.5 min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-white text-xs flex items-center gap-1.5 min-w-0">
                          <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{draft.companyName}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-600 dark:text-[#d4d4d4] font-medium mt-0.5 inline-block truncate max-w-full">
                          {draft.leadMode === 'export_buyers' ? 'Mode B: Export' : 'Mode A: Service'}
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 min-w-0">
                        <div className="font-medium text-neutral-800 dark:text-[#ececec] text-xs truncate">
                          {draft.recipientName}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-[#9e9e9e] truncate">
                          {draft.jobTitle}
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 min-w-0">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-mono text-neutral-700 dark:text-[#d4d4d4] text-[11px] truncate">
                            {draft.recipientEmail}
                          </span>
                          <button
                            onClick={() => handleCopy(draft.recipientEmail)}
                            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5 rounded transition-colors shrink-0"
                            title="Copy Email"
                          >
                            {copiedEmail === draft.recipientEmail ? (
                              <Check className="w-3 h-3 text-[#10a37f]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 min-w-0 hidden xl:table-cell">
                        <div className="font-medium text-neutral-900 dark:text-white text-xs truncate">
                          {draft.subject}
                        </div>
                        <span className="text-[10px] text-neutral-500 dark:text-[#9e9e9e] truncate block">
                          {draft.recommendedService || 'Direct Outreach'}
                        </span>
                      </td>

                      <td className="py-2.5 px-2 text-neutral-500 dark:text-[#9e9e9e] text-[11px] hidden xl:table-cell whitespace-nowrap">
                        {draft.sentAt
                          ? new Date(draft.sentAt).toLocaleDateString([], {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'Recently Sent'}
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] border border-[#10a37f]/30 text-[10px] font-semibold whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Sent</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 text-right">
                        <button
                          onClick={() => setViewingDraft(draft)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-800 dark:text-white text-[11px] font-semibold border border-neutral-200 dark:border-white/10 transition-colors whitespace-nowrap"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500 dark:text-[#9e9e9e]">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Send className="w-8 h-8 text-neutral-400 mx-auto" />
                        <p className="text-sm font-semibold text-neutral-800 dark:text-white">No Sent Emails Found</p>
                        <p className="text-xs">
                          {emailSearch
                            ? 'No sent emails match your search query.'
                            : 'Compose and approve emails in Mode A or Mode B to see them logged here.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack (Zero Horizontal Scroll) */}
          <div className="md:hidden divide-y divide-neutral-100 dark:divide-white/5">
            {filteredSentEmails.length > 0 ? (
              filteredSentEmails.map((draft) => (
                <div key={draft.id} className="p-3.5 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900 dark:text-white text-xs truncate">
                        {draft.companyName}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-[#9e9e9e] truncate">
                        {draft.recipientName} • {draft.recommendedService || 'Direct Outreach'}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] text-[10px] font-semibold shrink-0">
                      Sent
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="font-mono text-[11px] text-neutral-700 dark:text-[#d4d4d4] truncate min-w-0">
                      {draft.recipientEmail}
                    </span>
                    <button
                      onClick={() => setViewingDraft(draft)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-800 dark:text-white text-[11px] font-semibold border border-neutral-200 dark:border-white/10 shrink-0"
                    >
                      View Email
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 px-4 text-center text-neutral-500 dark:text-[#9e9e9e] text-xs">
                {emailSearch
                  ? 'No sent emails match your search query.'
                  : 'Compose and approve emails in Mode A or Mode B to see them logged here.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INBOUND CLIENT REPLIES */}
      <div className="chatgpt-card p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#10a37f]" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Client Inbound Responses
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-0.5">
              Replies received from contacted companies
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-1 bg-neutral-100 dark:bg-[#212121] p-1 rounded-xl border border-neutral-200 dark:border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setReplyFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                replyFilter === 'all'
                  ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white'
                  : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All ({clientReplies.length})
            </button>
            <button
              onClick={() => setReplyFilter('needs_action')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                replyFilter === 'needs_action'
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Needs Action
            </button>
            <button
              onClick={() => setReplyFilter('in_discussion')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                replyFilter === 'in_discussion'
                  ? 'bg-[#10a37f] text-white'
                  : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
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
              className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-neutral-900 dark:text-white text-xs">{reply.leadName}</span>
                  <span className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">({reply.companyName})</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4] font-semibold">
                    {reply.leadMode === 'service_leads' ? 'Mode A' : 'Mode B'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] font-semibold">
                    {reply.sentiment}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">
                    {reply.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{reply.replySubject}</p>
                <p className="text-[11px] text-neutral-600 dark:text-[#b4b4b4] italic truncate max-w-2xl">
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
                  className="px-3 py-1.5 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold flex items-center gap-1 hover:opacity-85 transition-opacity"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {filteredReplies.length === 0 && (
            <div className="p-6 text-center text-neutral-500 dark:text-[#9e9e9e] text-xs">
              No replies matching this filter.
            </div>
          )}
        </div>
      </div>

      {/* VIEW SENT EMAIL MODAL */}
      {viewingDraft && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-white/15 rounded-2xl max-w-2xl w-full max-h-[88vh] max-h-[88dvh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-white/10 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] uppercase">
                  ✓ Sent Outbound Email
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-1 break-words">
                  {viewingDraft.companyName}
                </h3>
              </div>
              <button
                onClick={() => setViewingDraft(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 sm:p-4 bg-neutral-50 dark:bg-[#171717] border-b border-neutral-200 dark:border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center gap-x-2 gap-y-0.5 flex-wrap min-w-0">
                <span className="text-neutral-500 dark:text-[#9e9e9e] w-14 shrink-0">To:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{viewingDraft.recipientName}</span>
                <span className="text-neutral-500 dark:text-[#9e9e9e]">({viewingDraft.jobTitle})</span>
                <span className="font-mono text-neutral-700 dark:text-[#d4d4d4] sm:ml-auto break-all">
                  {viewingDraft.recipientEmail}
                </span>
              </div>
              <div className="flex items-start gap-2 flex-wrap min-w-0">
                <span className="text-neutral-500 dark:text-[#9e9e9e] w-14 shrink-0">Subject:</span>
                <span className="font-semibold text-neutral-900 dark:text-white min-w-0 break-words flex-1">{viewingDraft.subject}</span>
              </div>
              <div className="flex items-center gap-x-2 gap-y-1 flex-wrap min-w-0">
                <span className="text-neutral-500 dark:text-[#9e9e9e] w-14 shrink-0">Service:</span>
                <span className="text-[#10a37f] font-medium">{viewingDraft.recommendedService || 'Direct Pitch'}</span>
                {viewingDraft.sentAt && (
                  <span className="text-neutral-500 dark:text-[#9e9e9e] sm:ml-auto text-[11px]">
                    Sent: {new Date(viewingDraft.sentAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5 flex-1 overflow-y-auto overflow-x-hidden">
              <div className="whitespace-pre-wrap break-words text-xs text-neutral-800 dark:text-[#ececec] leading-relaxed font-sans bg-neutral-50 dark:bg-[#171717] p-3.5 sm:p-4 rounded-xl border border-neutral-200 dark:border-white/10">
                {viewingDraft.body}
              </div>
            </div>

            <div className="p-3.5 sm:p-4 border-t border-neutral-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(viewingDraft.body)}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-800 dark:text-[#ececec] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedEmail === viewingDraft.body ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10a37f]" />
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
                className="px-4 py-1.5 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold hover:opacity-85 transition-opacity"
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
