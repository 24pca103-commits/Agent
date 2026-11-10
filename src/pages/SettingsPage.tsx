import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Sliders,
  Database,
  Save,
  CheckCircle2,
  Copy,
  Check,
  Mail,
  Globe2
} from 'lucide-react';
import { useCompanySettings } from '../utils/settingsStorage';

interface SettingsPageProps {
  mode?: 'mode_a' | 'mode_b';
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ mode = 'mode_a' }) => {
  const isModeB = mode === 'mode_b';
  const { settings, updateSettings } = useCompanySettings(mode);

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyEmail, setCompanyEmail] = useState(settings.companyEmail);
  const [founder, setFounder] = useState(settings.founder);
  const [tagline, setTagline] = useState(settings.tagline);
  const [dailySendLimit, setDailySendLimit] = useState(settings.dailySendLimit);
  const [delayBetweenSends, setDelayBetweenSends] = useState(settings.delayBetweenSends);
  const [saved, setSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  React.useEffect(() => {
    setCompanyName(settings.companyName);
    setCompanyEmail(settings.companyEmail);
    setFounder(settings.founder);
    setTagline(settings.tagline);
    setDailySendLimit(settings.dailySendLimit);
    setDelayBetweenSends(settings.delayBetweenSends);
  }, [settings]);

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
    entry_value TEXT UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    updateSettings({
      companyName,
      companyEmail,
      founder,
      tagline,
      dailySendLimit,
      delayBetweenSends
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-neutral-700 dark:text-[#ececec]" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Application Settings & Mail Profile
          </h2>
        </div>
        <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-1">
          Configure sender identity, company email ID, daily send thresholds, and PostgreSQL storage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSave} className="chatgpt-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-neutral-900 dark:text-white">
            {isModeB ? <Globe2 className="w-4 h-4 text-[#10a37f]" /> : <Building className="w-4 h-4 text-[#10a37f]" />}
            <span>
              {isModeB ? 'Mode B: Export Trade & Sender Profile' : 'Mode A: DataGalactic Company & Sender Profile'}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-600 dark:text-[#b4b4b4] block mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-600 dark:text-[#b4b4b4] mb-1 flex items-center justify-between">
              <span>{isModeB ? 'Export Company Mail ID *' : 'Official Company Mail ID *'}</span>
              <span className="text-[10px] text-[#10a37f] font-medium">Primary Sender Email</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder={isModeB ? 'export@datagalactic.com' : 'contact@datagalactic.com'}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] mt-1">
              All approved cold emails and follow-ups are sent using this sender address.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-600 dark:text-[#b4b4b4] block mb-1">
              Founder / Sign-Off Name
            </label>
            <input
              type="text"
              value={founder}
              onChange={(e) => setFounder(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-600 dark:text-[#b4b4b4] block mb-1">
              Company Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white"
            />
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-xs mb-3">
              <Sliders className="w-3.5 h-3.5" />
              <span>Safety & Sending Limits</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-500 dark:text-[#9e9e9e] block mb-1">Max Daily Emails</label>
                <input
                  type="number"
                  value={dailySendLimit}
                  onChange={(e) => setDailySendLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-lg text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-500 dark:text-[#9e9e9e] block mb-1">
                  Delay Between Sends (sec)
                </label>
                <input
                  type="number"
                  value={delayBetweenSends}
                  onChange={(e) => setDelayBetweenSends(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-lg text-xs text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-2 flex-wrap">
            {saved && (
              <span className="text-xs text-[#10a37f] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Saved! Sending from <strong className="underline">{companyEmail}</strong> ({founder})
                </span>
              </span>
            )}
            <button
              type="submit"
              className="ml-auto flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#10a37f] hover:bg-[#0e906f] text-white text-xs font-semibold transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>

        <div className="chatgpt-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#10a37f] font-semibold text-sm">
              <Database className="w-4 h-4" />
              <span>Persistent Database Setup (Supabase PostgreSQL)</span>
            </div>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-700 dark:text-[#ececec] text-xs font-medium border border-neutral-200 dark:border-white/10 transition-colors"
            >
              {copiedSql ? <Check className="w-3 h-3 text-[#10a37f]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy Schema SQL'}</span>
            </button>
          </div>

          <p className="text-xs text-neutral-600 dark:text-[#b4b4b4] leading-relaxed">
            For persistent cloud storage across sessions, paste this SQL into your free{' '}
            <strong>Supabase SQL Editor</strong> and configure <code className="font-mono">SUPABASE_URL</code> in{' '}
            <code className="font-mono">.env</code>.
          </p>

          <pre className="p-3 bg-neutral-50 dark:bg-[#212121] rounded-xl border border-neutral-200 dark:border-white/10 font-mono text-[10px] text-neutral-700 dark:text-[#d4d4d4] max-h-64 overflow-y-auto overflow-x-auto min-w-0 max-w-full leading-relaxed whitespace-pre-wrap break-all">
            {supabaseSqlSchema}
          </pre>
        </div>
      </div>
    </div>
  );
};
