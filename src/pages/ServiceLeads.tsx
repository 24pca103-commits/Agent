import React, { useState } from 'react';
import {
  Briefcase,
  Filter,
  Search,
  Sparkles,
  Building,
  Mail,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Lead } from '../types';
import {
  TARGET_COUNTRIES,
  TARGET_CLIENT_INDUSTRIES,
  TARGET_ROLES,
  DATAGALACTIC_SERVICES
} from '../data/catalog';
import { StatusBadge } from '../components/Badge';

interface ServiceLeadsProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAddNewLead: (lead: Lead) => void;
}

export const ServiceLeads: React.FC<ServiceLeadsProps> = ({
  leads,
  onSelectLead,
  onAddNewLead,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [filterRole, setFilterRole] = useState<string>('All');

  // Filter only service_leads
  const serviceLeads = leads.filter(l => l.leadMode === 'service_leads');

  const filteredLeads = serviceLeads.filter(lead => {
    if (selectedCountry !== 'All' && !lead.country.includes(selectedCountry)) return false;
    if (selectedIndustry !== 'All' && lead.industry !== selectedIndustry) return false;
    if (selectedService !== 'All' && lead.recommendedService !== selectedService) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Mode A: DataGalactic Service Leads</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Target international B2B clients in the UK, USA, Canada, Australia who require data management, data entry, CRM cleaning, and business support services.
        </p>
      </div>

      {/* Filter Ribbon */}
      <div className="galaxy-card p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Country Filter */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
          >
            <option value="All">All Countries (UK, US, Canada, AU...)</option>
            {TARGET_COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Industry Filter */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Industry Sector</label>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
          >
            <option value="All">All 25 Target Industries</option>
            {TARGET_CLIENT_INDUSTRIES.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Service Offer Filter */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">DataGalactic Service</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
          >
            <option value="All">All 10 Core Services</option>
            {DATAGALACTIC_SERVICES.map(srv => (
              <option key={srv.name} value={srv.name}>{srv.name}</option>
            ))}
          </select>
        </div>

        {/* Quick Reset */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedCountry('All');
              setSelectedIndustry('All');
              setSelectedService('All');
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="galaxy-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{lead.companyName}</h3>
                    <a
                      href={lead.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-indigo-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-indigo-300 font-medium">{lead.industry} • {lead.country}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">{lead.leadScore}/100</div>
                  <span className="text-xs text-slate-400">Quality Score</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{lead.contactFullName}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                    {lead.department}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{lead.jobTitle}</p>
                
                <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80">
                  <span className="text-slate-300 font-mono text-xs">{lead.businessEmail}</span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {lead.emailVerificationStatus} ({lead.emailConfidenceScore}%)
                  </span>
                </div>
              </div>

              {/* Service Fit & Grounded Reason */}
              <div className="mt-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Recommended Pitch:</span>
                  <span className="font-semibold text-indigo-300">
                    {lead.recommendedService}
                  </span>
                </div>
                <p className="text-xs text-slate-300 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20 leading-relaxed">
                  <strong className="text-indigo-200">Evidence of Fit:</strong> {lead.leadScoreReason}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <StatusBadge status={lead.leadStatus} />
              
              <button
                onClick={() => onSelectLead(lead)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Write AI Cold Email</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="galaxy-card p-12 text-center rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-400">No service leads found matching the selected filters.</p>
        </div>
      )}
    </div>
  );
};
