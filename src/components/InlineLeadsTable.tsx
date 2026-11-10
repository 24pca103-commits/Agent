import React, { useState } from 'react';
import {
  Building,
  Ship,
  Search,
  Download,
  FileText,
  Printer,
  Table as TableIcon,
  LayoutGrid,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Lead } from '../types';
import { exportLeadsToPdf, openPrintPdfView } from '../utils/exportPdf';

interface InlineLeadsTableProps {
  leads: Lead[];
  mode: 'service_leads' | 'export_buyers';
  industryOrCategory?: string;
  country?: string;
  onPitchLead: (lead: Lead) => void;
  onExportCsv: (leads: Lead[]) => void;
  onPdfDownloaded?: (message: string) => void;
}

export const InlineLeadsTable: React.FC<InlineLeadsTableProps> = ({
  leads,
  mode,
  industryOrCategory,
  country,
  onPitchLead,
  onExportCsv,
  onPdfDownloaded
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const isExport = mode === 'export_buyers';

  const filtered = leads.filter(lead => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (lead.companyName && lead.companyName.toLowerCase().includes(q)) ||
      (lead.contactFullName && lead.contactFullName.toLowerCase().includes(q)) ||
      (lead.businessEmail && lead.businessEmail.toLowerCase().includes(q)) ||
      (lead.country && lead.country.toLowerCase().includes(q)) ||
      (lead.regionCity && lead.regionCity.toLowerCase().includes(q)) ||
      (lead.industry && lead.industry.toLowerCase().includes(q)) ||
      (lead.recommendedService && lead.recommendedService.toLowerCase().includes(q)) ||
      (lead.targetProductCategory && lead.targetProductCategory.toLowerCase().includes(q))
    );
  });

  const effectiveSize = pageSize === 0 ? (filtered.length || 1) : pageSize;
  const totalPages = Math.ceil(filtered.length / effectiveSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginated = pageSize === 0
    ? filtered
    : filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1800);
  };

  const titleLabel = isExport
    ? `Sourced Export Buyers${industryOrCategory ? ` • ${industryOrCategory}` : ''}`
    : `Sourced ${industryOrCategory || 'B2B Clients'}`;

  const pdfTitle = isExport
    ? `International Export Buyer Intelligence Dossier (${country || 'Global'})`
    : `DataGalactic ${country || 'Corporate'} Client Intelligence Dossier`;

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-[#171717] overflow-hidden w-full">
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-[#ececec] shrink-0">
            {isExport ? <Ship className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
            {titleLabel}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] font-semibold border border-[#10a37f]/25 shrink-0">
            {filtered.length} {isExport ? 'Buyers' : 'Leads'}
          </span>
          {country && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4] border border-neutral-200 dark:border-white/10 font-medium shrink-0">
              {country}
            </span>
          )}
        </div>

        {/* Export & Collapse Actions */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <button
            onClick={() => {
              if (filtered.length === 0) return;
              const savedName = exportLeadsToPdf(filtered, {
                title: pdfTitle,
                leadMode: mode
              });
              if (onPdfDownloaded) {
                onPdfDownloaded(`Downloaded ${filtered.length} records to Downloads (${savedName})`);
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-[#10a37f] hover:bg-[#0e906f] text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Download formatted PDF report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => onExportCsv(filtered)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-800 dark:text-[#ececec] border border-neutral-200 dark:border-white/10 text-[11px] font-medium flex items-center gap-1 transition-colors"
            title="Download CSV"
          >
            <FileText className="w-3 h-3" />
            <span>CSV</span>
          </button>

          <button
            onClick={() =>
              openPrintPdfView(filtered, {
                title: pdfTitle,
                leadMode: mode
              })
            }
            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-700 dark:text-[#d4d4d4] border border-neutral-200 dark:border-white/10 transition-colors"
            title="Print preview"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="px-2 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-700 dark:text-[#d4d4d4] border border-neutral-200 dark:border-white/10 text-[11px] font-medium flex items-center gap-1 transition-colors"
            title={isExpanded ? 'Collapse table' : 'Expand table'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'Show'}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Filter & View Controls */}
          <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 bg-neutral-50/50 dark:bg-[#171717]">
            <div className="relative w-full sm:w-auto sm:flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search company, contact, email, city..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-lg text-xs text-neutral-900 dark:text-[#ececec] placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-lg text-xs text-neutral-800 dark:text-[#ececec] focus:outline-none"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                <option value={0}>All ({filtered.length})</option>
              </select>

              <div className="flex items-center bg-white dark:bg-[#212121] p-0.5 rounded-lg border border-neutral-200 dark:border-white/10">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1 rounded-md text-xs transition-colors ${
                    viewMode === 'table'
                      ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white'
                      : 'text-neutral-500 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded-md text-xs transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white'
                      : 'text-neutral-500 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table View (Zero Horizontal Scroll: fixed-layout table on md+, responsive cards on small screens) */}
          {viewMode === 'table' ? (
            <>
              <div className="hidden md:block overflow-y-auto overflow-x-hidden max-h-[440px] bg-white dark:bg-[#171717]">
                <table className="w-full text-left text-xs table-fixed">
                  <thead className="sticky top-0 z-10 bg-neutral-50 dark:bg-[#1e1e1e] border-b border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-[#9e9e9e] text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-2 text-center w-[5%]">#</th>
                      <th className="py-2.5 px-2.5 font-semibold w-[23%]">Company</th>
                      <th className="py-2.5 px-2.5 font-semibold w-[18%]">{isExport ? 'Buyer Lead' : 'Contact'}</th>
                      <th className="py-2.5 px-2.5 font-semibold w-[24%]">Business Email</th>
                      <th className="py-2.5 px-2.5 font-semibold w-[14%]">{isExport ? 'Product / MOQ' : 'Service Fit'}</th>
                      <th className="py-2.5 px-1.5 font-semibold text-center w-[6%]">Score</th>
                      <th className="py-2.5 px-2.5 font-semibold text-right w-[10%]">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                    {paginated.map((lead, idx) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-neutral-50 dark:hover:bg-[#212121] transition-colors"
                      >
                        <td className="py-2.5 px-2 text-center font-mono text-neutral-400 dark:text-[#8e8e8e] text-[11px]">
                          {(safePage - 1) * (pageSize || 1) + idx + 1}
                        </td>
                        <td className="py-2.5 px-2.5 min-w-0">
                          <div className="font-semibold text-neutral-900 dark:text-white text-xs flex items-center gap-1 min-w-0">
                            <span className="truncate">{lead.companyName}</span>
                            {lead.companyWebsite && (
                              <a
                                href={lead.companyWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-500 dark:text-[#9e9e9e] truncate">
                            {lead.regionCity || lead.country}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 min-w-0">
                          <div className="font-medium text-neutral-800 dark:text-[#ececec] text-xs truncate">
                            {lead.contactFullName}
                          </div>
                          <div className="text-[10px] text-neutral-500 dark:text-[#9e9e9e] truncate">
                            {lead.jobTitle}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-mono text-neutral-700 dark:text-[#d4d4d4] text-[11px] truncate">
                              {lead.businessEmail}
                            </span>
                            <span title="Deliverable" className="shrink-0">
                              <ShieldCheck className="w-3 h-3 text-[#10a37f]" />
                            </span>
                            <button
                              onClick={() => handleCopy(lead.businessEmail)}
                              className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white p-0.5 rounded transition-colors shrink-0"
                              title="Copy email"
                            >
                              {copiedEmail === lead.businessEmail ? (
                                <Check className="w-3 h-3 text-[#10a37f]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 min-w-0">
                          {isExport ? (
                            <div className="min-w-0">
                              <div className="text-[11px] font-medium text-neutral-800 dark:text-[#ececec] truncate">
                                {lead.targetProductCategory || 'Agro-Commodities'}
                              </div>
                              <div className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] truncate">
                                MOQ: {lead.minOrderQuantity || '1 FCL'}
                              </div>
                            </div>
                          ) : (
                            <span
                              title={lead.recommendedService || 'Data Cleaning'}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4] border border-neutral-200 dark:border-white/10 font-medium block truncate"
                            >
                              {lead.recommendedService || 'Data Cleaning'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-1.5 text-center">
                          <span className="font-semibold text-[#10a37f] text-[11px]">
                            {lead.leadScore}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <button
                            onClick={() => onPitchLead(lead)}
                            title="Draft & Send Outreach Email (Pitch)"
                            className="px-2 py-1 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] hover:opacity-85 text-[11px] font-semibold transition-opacity"
                          >
                            Write Email
                          </button>
                        </td>
                      </tr>
                    ))}

                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-neutral-500 dark:text-[#9e9e9e]">
                          No results match your table search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Compact Stack (Zero Horizontal Scroll) */}
              <div className="md:hidden p-2.5 max-h-[440px] overflow-y-auto overflow-x-hidden space-y-2 bg-white dark:bg-[#171717]">
                {paginated.map((lead, idx) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 space-y-1.5 min-w-0"
                  >
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-white text-xs truncate">
                          #{(safePage - 1) * (pageSize || 1) + idx + 1} • {lead.companyName}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-[#9e9e9e] truncate">
                          {lead.contactFullName} • {lead.regionCity || lead.country}
                        </div>
                      </div>
                      <span className="font-semibold text-[#10a37f] text-[11px] shrink-0">
                        {lead.leadScore}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 min-w-0">
                      <span className="font-mono text-[11px] text-neutral-700 dark:text-[#d4d4d4] truncate min-w-0">
                        {lead.businessEmail}
                      </span>
                      <button
                        onClick={() => onPitchLead(lead)}
                        className="px-2.5 py-1 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-[11px] font-semibold shrink-0"
                      >
                        Write Email
                      </button>
                    </div>
                  </div>
                ))}

                {paginated.length === 0 && (
                  <div className="py-8 text-center text-xs text-neutral-500 dark:text-[#9e9e9e]">
                    No results match your table search.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Card View */
            <div className="p-3 max-h-[440px] overflow-y-auto overflow-x-hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white dark:bg-[#171717]">
              {paginated.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 flex flex-col justify-between gap-2 min-w-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-neutral-900 dark:text-white text-xs truncate">
                        {lead.companyName}
                      </div>
                      <span className="font-semibold text-[#10a37f] text-[11px] shrink-0">
                        {lead.leadScore}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-[#b4b4b4] mt-0.5 truncate">
                      {lead.contactFullName} • {lead.jobTitle}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 min-w-0">
                      <span className="font-mono text-[11px] text-neutral-700 dark:text-[#d4d4d4] truncate min-w-0">
                        {lead.businessEmail}
                      </span>
                      <button
                        onClick={() => handleCopy(lead.businessEmail)}
                        className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white shrink-0"
                        title="Copy Email"
                      >
                        {copiedEmail === lead.businessEmail ? (
                          <Check className="w-3 h-3 text-[#10a37f]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-white/10 min-w-0">
                    <span className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] truncate min-w-0">
                      {lead.regionCity || lead.country}
                    </span>
                    <button
                      onClick={() => onPitchLead(lead)}
                      className="px-2.5 py-1 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] hover:opacity-85 text-[11px] font-semibold shrink-0"
                    >
                      Write Email
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {filtered.length > 0 && pageSize !== 0 && totalPages > 1 && (
            <div className="px-4 py-2 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-500 dark:text-[#9e9e9e] bg-neutral-50/70 dark:bg-[#1a1a1a]">
              <div>
                Showing <strong className="text-neutral-900 dark:text-white">{(safePage - 1) * pageSize + 1}</strong> –{' '}
                <strong className="text-neutral-900 dark:text-white">{Math.min(safePage * pageSize, filtered.length)}</strong> of{' '}
                <strong className="text-neutral-900 dark:text-white">{filtered.length}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1 rounded-md bg-white dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 disabled:opacity-40 text-neutral-700 dark:text-[#ececec]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-neutral-800 dark:text-white font-medium">
                  {safePage} / {totalPages}
                </span>
                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-md bg-white dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 disabled:opacity-40 text-neutral-700 dark:text-[#ececec]"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
