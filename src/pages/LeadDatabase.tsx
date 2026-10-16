import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Mail,
  Edit2,
  AlertTriangle,
  CheckSquare,
  Square,
  MoreVertical,
  Plus,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';

interface LeadDatabaseProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onSelectLeadForPitch: (lead: Lead) => void;
  onExportCsv: (leadsToExport: Lead[]) => void;
}

export const LeadDatabase: React.FC<LeadDatabaseProps> = ({
  leads,
  onUpdateLead,
  onDeleteLead,
  onSelectLeadForPitch,
  onExportCsv
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal States
  const [inspectingLead, setInspectingLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Status List from spec
  const ALL_STATUSES: LeadStatus[] = [
    'New',
    'Qualified',
    'Draft Ready',
    'Awaiting Approval',
    'Approved',
    'Sent',
    'Replied',
    'Follow-up Due',
    'Converted',
    'Not Interested',
    'Bounced',
    'Unsubscribed',
    'Do Not Contact'
  ];

  // Filtering & Sorting
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== 'All' && l.leadStatus !== statusFilter) return false;
      if (countryFilter !== 'All' && !l.country.includes(countryFilter)) return false;
      if (!searchTerm) return true;

      const q = searchTerm.toLowerCase();
      return (
        l.companyName.toLowerCase().includes(q) ||
        l.companyDomain.toLowerCase().includes(q) ||
        l.contactFullName.toLowerCase().includes(q) ||
        l.businessEmail.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q)
      );
    });
  }, [leads, searchTerm, statusFilter, countryFilter]);

  // Duplicate Detection: Check for matching domains or emails
  const duplicateDomainMap = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach(l => {
      const d = l.companyDomain.toLowerCase();
      map.set(d, (map.get(d) || 0) + 1);
    });
    return map;
  }, [leads]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Multi-select handlers
  const handleSelectAll = () => {
    if (selectedLeadIds.length === paginatedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(paginatedLeads.map(l => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (newStatus: LeadStatus) => {
    selectedLeadIds.forEach(id => {
      const target = leads.find(l => l.id === id);
      if (target) {
        onUpdateLead({ ...target, leadStatus: newStatus, updatedAt: new Date().toISOString() });
      }
    });
    setSelectedLeadIds([]);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      onUpdateLead(editingLead);
      setIsEditModalOpen(false);
      setEditingLead(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Lead Database & CRM</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, manage, and monitor all prospect pipelines with duplicate detection and status controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onExportCsv(selectedLeadIds.length > 0 ? leads.filter(l => selectedLeadIds.includes(l.id)) : filteredLeads)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV ({selectedLeadIds.length > 0 ? selectedLeadIds.length : filteredLeads.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="galaxy-card p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies, domains, contacts, or emails..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
          >
            <option value="All">All Statuses ({leads.length})</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedLeadIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-indigo-300 font-semibold">{selectedLeadIds.length} Selected:</span>
            <select
              onChange={(e) => e.target.value && handleBulkStatusChange(e.target.value as LeadStatus)}
              defaultValue=""
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="" disabled>Set Status to...</option>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* CRM Main Table */}
      <div className="galaxy-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedLeadIds.length > 0 && selectedLeadIds.length === paginatedLeads.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold min-w-[180px]">Company & Domain</th>
                <th className="py-3 px-4 font-semibold min-w-[180px]">Primary Contact</th>
                <th className="py-3 px-4 font-semibold min-w-[140px]">Country</th>
                <th className="py-3 px-4 font-semibold min-w-[210px] whitespace-nowrap">Service Fit</th>
                <th className="py-3 px-4 font-semibold min-w-[140px]">Quality Score</th>
                <th className="py-3 px-4 font-semibold min-w-[130px]">Status</th>
                <th className="py-3 px-4 font-semibold text-right min-w-[110px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                const isDuplicate = (duplicateDomainMap.get(lead.companyDomain.toLowerCase()) || 0) > 1;

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-950/25' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <button onClick={() => toggleSelectOne(lead.id)} className="text-slate-400 hover:text-white">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{lead.companyName}</span>
                        {isDuplicate && (
                          <span
                            title="Duplicate domain detected in database"
                            className="p-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                        {lead.isDoNotContact && (
                          <span title="Do Not Contact Flagged" className="text-rose-400">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 font-mono">{lead.companyDomain}</span>
                        <a
                          href={lead.companyWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-slate-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 text-xs">{lead.contactFullName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{lead.jobTitle}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{lead.businessEmail}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-300 text-xs">{lead.country}</span>
                      <div className="text-xs text-slate-500 mt-0.5">{lead.regionCity}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/90 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/35 text-xs font-semibold tracking-normal shadow-sm whitespace-nowrap">
                        {lead.recommendedService || 'Data Cleaning & Formatting'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-emerald-400 text-sm">{lead.leadScore}</span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                      <span className="text-xs text-slate-400 block truncate max-w-[150px] mt-0.5" title={lead.leadScoreReason}>
                        {lead.leadScoreReason}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={lead.leadStatus} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectLeadForPitch(lead)}
                          title="Generate AI Cold Email"
                          className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setInspectingLead(lead)}
                          title="View Full Profile & Notes"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          title="Delete Lead"
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect / Notes Modal */}
      {inspectingLead && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingLead(null)}
          title={inspectingLead.companyName}
          subtitle={`Lead ID: ${inspectingLead.id} • ${inspectingLead.industry}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block">Contact Person:</span>
                <span className="text-white font-semibold">{inspectingLead.contactFullName} ({inspectingLead.jobTitle})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Business Email:</span>
                <span className="text-white font-mono">{inspectingLead.businessEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Country / City:</span>
                <span className="text-white">{inspectingLead.country} • {inspectingLead.regionCity}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Source Provider:</span>
                <span className="text-indigo-300">{inspectingLead.sourceProvider}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-1">Lead Quality Score Explanation:</h4>
              <p className="text-xs text-slate-200 bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-lg leading-relaxed">
                {inspectingLead.leadScoreReason}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-1">Activity Notes:</h4>
              <div className="space-y-1.5">
                {inspectingLead.notes.map((note, idx) => (
                  <div key={idx} className="text-xs text-slate-300 p-2 rounded bg-slate-950 border border-slate-800">
                    • {note}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onUpdateLead({
                    ...inspectingLead,
                    isDoNotContact: !inspectingLead.isDoNotContact,
                    leadStatus: !inspectingLead.isDoNotContact ? 'Do Not Contact' : 'New',
                    updatedAt: new Date().toISOString()
                  });
                  setInspectingLead(null);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                  inspectingLead.isDoNotContact 
                    ? 'bg-slate-800 text-slate-300 border-slate-700' 
                    : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                }`}
              >
                {inspectingLead.isDoNotContact ? 'Remove Do-Not-Contact Flag' : 'Flag as Do Not Contact (DNC)'}
              </button>

              <button
                onClick={() => {
                  onSelectLeadForPitch(inspectingLead);
                  setInspectingLead(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Draft Outreach Email
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
