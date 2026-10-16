import React, { useState } from 'react';
import {
  ArrowDownUp,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Lead, EmailDraft } from '../types';

interface ImportExportCenterProps {
  leads: Lead[];
  drafts: EmailDraft[];
  onExportCsv: (leadsToExport: Lead[]) => void;
  onImportLeads: (imported: Lead[]) => void;
}

export const ImportExportCenter: React.FC<ImportExportCenterProps> = ({
  leads,
  drafts,
  onExportCsv,
  onImportLeads
}) => {
  const [importStatus, setImportStatus] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          setImportStatus('Error: CSV file appears to be empty or has only headers.');
          return;
        }

        // Parse simple rows
        const newImportedLeads: Lead[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2 && cols[0]) {
            newImportedLeads.push({
              id: `lead-imported-${Date.now()}-${i}`,
              leadMode: 'service_leads',
              companyName: cols[0] || 'Imported Company',
              industry: cols[1] || 'IT & Software Companies',
              country: cols[2] || 'United Kingdom (UK)',
              regionCity: cols[3] || 'London',
              companyWebsite: cols[4] || 'https://example.com',
              companyDomain: cols[4] ? cols[4].replace(/https?:\/\//, '') : 'example.com',
              companySize: '50-200',
              contactFirstName: cols[5]?.split(' ')[0] || 'Contact',
              contactLastName: cols[5]?.split(' ')[1] || '',
              contactFullName: cols[5] || 'Decision Maker',
              jobTitle: cols[6] || 'Operations Lead',
              department: 'Operations',
              businessEmail: cols[7] || `contact@${cols[0].toLowerCase().replace(/\s+/g, '')}.com`,
              emailVerificationStatus: 'Unknown',
              sourceProvider: 'Web Sourced',
              sourceRetrievalDate: new Date().toISOString(),
              leadScore: 82,
              leadScoreReason: 'Imported via CSV file.',
              potentialFit: 'General DataGalactic service candidate.',
              recommendedService: 'Data Cleaning & Formatting',
              leadStatus: 'New',
              notes: ['Imported via CSV Import Centre.'],
              isDoNotContact: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }

        if (newImportedLeads.length > 0) {
          onImportLeads(newImportedLeads);
          setImportStatus(`Success! Imported ${newImportedLeads.length} leads into CRM database.`);
        }
      } catch (err: any) {
        setImportStatus(`Failed to parse CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ArrowDownUp className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Import & Export Centre</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Export verified leads to Microsoft Excel and Google Sheets with formula-injection security, or import prospect spreadsheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="galaxy-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Download className="w-4 h-4" />
            <span>Export Leads & CRM Records</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Download your active prospect lists as a UTF-8 encoded CSV. Guaranteed Excel & Google Sheets compatibility with strict formula injection protection.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Total Available Leads:</span>
              <strong className="text-white">{leads.length} records</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mode A (Service Leads):</span>
              <span className="text-indigo-300">{leads.filter(l => l.leadMode === 'service_leads').length}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mode B (Export Buyers):</span>
              <span className="text-purple-300">{leads.filter(l => l.leadMode === 'export_buyers').length}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onExportCsv(leads)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export All Leads to CSV (Excel / Sheets)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Formulas sanitized: `=+@-` prefixes neutralized</span>
          </div>
        </div>

        {/* Import Card */}
        <div className="galaxy-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <Upload className="w-4 h-4" />
            <span>Import Leads from CSV Spreadsheet</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Upload an existing prospect list. Columns detected: Company, Industry, Country, City, Website, Contact Name, Title, and Email.
          </p>

          <div className="p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-950/40 text-center cursor-pointer transition-colors">
            <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">Click to select or drop CSV file here</p>
            <p className="text-[10px] text-slate-500 mt-1">Accepts standard .csv format</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-3 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          {importStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.startsWith('Success')
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
            }`}>
              {importStatus.startsWith('Success') ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
