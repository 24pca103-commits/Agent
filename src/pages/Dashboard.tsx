import React from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Lead, EmailDraft } from '../types';
import { StatusBadge } from '../components/Badge';

interface DashboardProps {
  leads: Lead[];
  drafts: EmailDraft[];
  onNavigate: (page: any) => void;
  onSelectLead: (lead: Lead) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  leads,
  drafts,
  onNavigate,
  onSelectLead
}) => {
  // Real metrics derived strictly from lead records
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.leadStatus === 'Qualified').length;
  const emailsDrafted = drafts.length;
  const emailsAwaitingApproval = drafts.filter(d => d.status === 'Awaiting Approval').length;
  const emailsSent = drafts.filter(d => d.status === 'Sent').length;
  const followUpsDue = leads.filter(l => l.leadStatus === 'Follow-up Due').length;
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

  const metricCards = [
    { title: 'Total Leads Saved', value: totalLeads, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Qualified Leads', value: qualifiedLeads, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Emails Drafted', value: emailsDrafted, icon: Mail, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { title: 'Awaiting Approval', value: emailsAwaitingApproval, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', alert: emailsAwaitingApproval > 0 },
    { title: 'Emails Sent', value: emailsSent, icon: Send, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { title: 'Converted Clients', value: convertedLeads, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="galaxy-card rounded-2xl p-6 border border-indigo-500/20 bg-gradient-to-r from-galaxy-900 via-indigo-950/40 to-galaxy-900 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DataGalactic LeadPilot AI Engine Online</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, Risona. Ready to find international prospects?
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Target international businesses requiring DataGalactic's data management, cleaning, and back-office support across UK, USA, Canada, Australia and global trade hubs.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('ai_lead_finder')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Lead Finder</span>
            </button>
            <button
              onClick={() => onNavigate('service_leads')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            >
              <span>Explore Service Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
                <span className="text-[11px] font-medium text-slate-400">{card.title}</span>
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

      {/* Grid: Charts & Recents */}
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
              <span>Target Industries</span>
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

        {/* Action Priority Queue */}
        <div className="galaxy-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Priority Action Center</span>
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">
                  {emailsAwaitingApproval} Email Drafts Awaiting Approval
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Inspect recipients and message copy before sending.
                </p>
                <button
                  onClick={() => onNavigate('sending_approval')}
                  className="mt-2 text-xs text-amber-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Review Drafts Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-indigo-300">
                  Target UK Logistics Prospects
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  High service match for Back-Office Data Support & shipping entry.
                </p>
                <button
                  onClick={() => onNavigate('service_leads')}
                  className="mt-2 text-xs text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Lead Sourcing</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Qualified Leads Table Preview */}
      <div className="galaxy-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Recently Sourced Qualified Prospects</h3>
            <p className="text-xs text-slate-400">Prospects with highest DataGalactic service fit scores</p>
          </div>
          <button
            onClick={() => onNavigate('lead_database')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>View All Leads ({leads.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Company</th>
                <th className="pb-3 font-semibold">Contact & Title</th>
                <th className="pb-3 font-semibold">Country</th>
                <th className="pb-3 font-semibold">Recommended Service</th>
                <th className="pb-3 font-semibold">Fit Score</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-medium text-white">
                    <div>{lead.companyName}</div>
                    <div className="text-[10px] text-slate-400">{lead.companyDomain}</div>
                  </td>
                  <td className="py-3">
                    <div className="text-slate-200">{lead.contactFullName}</div>
                    <div className="text-[10px] text-slate-400">{lead.jobTitle}</div>
                  </td>
                  <td className="py-3 text-slate-300">{lead.country}</td>
                  <td className="py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold whitespace-nowrap">
                      {lead.recommendedService || 'Data Cleaning'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-emerald-400">{lead.leadScore}/100</span>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={lead.leadStatus} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-medium transition-colors"
                    >
                      View & Pitch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
