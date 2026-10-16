import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  User,
  Sliders,
  Database,
  Save,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { DATAGALACTIC_COMPANY } from '../data/catalog';

export const SettingsPage: React.FC = () => {
  const [companyName, setCompanyName] = useState(DATAGALACTIC_COMPANY.name);
  const [founder, setFounder] = useState(DATAGALACTIC_COMPANY.founder);
  const [tagline, setTagline] = useState(DATAGALACTIC_COMPANY.tagline);
  const [dailySendLimit, setDailySendLimit] = useState(50);
  const [delayBetweenSends, setDelayBetweenSends] = useState(15);
  const [saved, setSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const supabaseSqlSchema = `-- DataGalactic LeadPilot AI - Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor to enable persistent cloud multi-session CRM!

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_mode TEXT NOT NULL DEFAULT 'service_leads',
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    country TEXT NOT NULL,
    region_city TEXT,
    company_website TEXT,
    company_domain TEXT NOT NULL,
    company_linkedin_url TEXT,
    company_size TEXT,
    contact_first_name TEXT,
    contact_last_name TEXT,
    contact_full_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    department TEXT,
    professional_linkedin_url TEXT,
    business_email TEXT NOT NULL,
    email_verification_status TEXT DEFAULT 'Unknown',
    email_confidence_score INT DEFAULT 90,
    public_business_phone TEXT,
    source_provider TEXT NOT NULL,
    source_url TEXT,
    source_retrieval_date TIMESTAMPTZ DEFAULT NOW(),
    lead_score INT DEFAULT 85,
    lead_score_reason TEXT,
    recommended_service TEXT,
    lead_status TEXT NOT NULL DEFAULT 'New',
    last_contact_date TIMESTAMPTZ,
    next_follow_up_date DATE,
    is_do_not_contact BOOLEAN DEFAULT FALSE,
    notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'Professional',
    status TEXT NOT NULL DEFAULT 'Awaiting Approval',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    message_id TEXT
);

CREATE TABLE IF NOT EXISTS public.suppression_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_value TEXT UNIQUE NOT NULL, -- email or domain
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_records ENABLE ROW LEVEL SECURITY;
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Application Settings & Database Setup</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure DataGalactic company credentials, daily email sending thresholds, and view persistent Supabase PostgreSQL SQL setup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <form onSubmit={handleSave} className="galaxy-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Building className="w-4 h-4" />
            <span>Company & Sender Profile</span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Founder / Sign-Off Name</label>
            <input
              type="text"
              value={founder}
              onChange={(e) => setFounder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Company Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-3">
              <Sliders className="w-3.5 h-3.5" />
              <span>Safety & Sending Limits</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Max Daily Emails</label>
                <input
                  type="number"
                  value={dailySendLimit}
                  onChange={(e) => setDailySendLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Delay Between Sends (sec)</label>
                <input
                  type="number"
                  value={delayBetweenSends}
                  onChange={(e) => setDelayBetweenSends(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Settings Saved Successfully!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>

        {/* Supabase SQL Documentation & Guide */}
        <div className="galaxy-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Database className="w-4 h-4" />
              <span>Persistent Database Setup (Supabase PostgreSQL)</span>
            </div>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy Schema SQL'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            For persistent cloud storage across multiple sessions, paste this SQL into your free <strong>Supabase SQL Editor</strong> (at supabase.com), then add your <code className="text-indigo-300 font-mono">SUPABASE_URL</code> to <code className="text-indigo-300 font-mono">.env</code>.
          </p>

          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
            {supabaseSqlSchema}
          </pre>
        </div>
      </div>
    </div>
  );
};
