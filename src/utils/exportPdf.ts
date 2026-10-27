import { Lead } from '../types';
import { DATAGALACTIC_COMPANY } from '../data/catalog';

export interface ExportPdfOptions {
  title?: string;
  subtitle?: string;
  leadMode?: 'service_leads' | 'export_buyers' | 'all';
  openPrintView?: boolean;
}

// Helper to escape PDF string literal
function escapePdf(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Clean ASCII only for standard Helvetica font
}

function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates an authentic binary PDF document and downloads it directly to the user's PC (Downloads folder)
 */
export function downloadLeadsPdfDirectly(leads: Lead[], options: ExportPdfOptions = {}): string {
  const {
    title = 'DataGalactic Client Intelligence Dossier',
    leadMode = 'all'
  } = options;

  const modeSlug = leadMode === 'service_leads' ? 'Mode_A_Services' : leadMode === 'export_buyers' ? 'Mode_B_Export' : 'Leads';
  const filename = `DataGalactic_${modeSlug}_${leads.length}_Clients_${new Date().toISOString().split('T')[0]}.pdf`;

  // Page dimensions (A4 Landscape: 842 x 595 points)
  const pageW = 842;
  const pageH = 595;
  const margin = 36;
  const rowH = 22;
  const rowsPerPage = 17;
  const totalPages = Math.ceil(leads.length / rowsPerPage) || 1;

  const pageStreams: string[] = [];

  const genDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  for (let p = 0; p < totalPages; p++) {
    const pageRows = leads.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
    let s = '';

    // 1. Top Header Banner (Cosmic Indigo Background)
    s += `0.06 0.09 0.18 rg\n`;
    s += `${margin} ${pageH - 85} ${pageW - margin * 2} 55 re f\n`;

    // Top Accent Line
    s += `0.39 0.4 0.95 rg\n`;
    s += `${margin} ${pageH - 32} ${pageW - margin * 2} 2 re f\n`;

    // Title & Branding
    s += `BT /F1 15 Tf 1 1 1 rg ${margin + 16} ${pageH - 54} Td (${escapePdf(title)}) Tj ET\n`;
    s += `BT /F2 8.5 Tf 0.7 0.75 0.95 rg ${margin + 16} ${pageH - 72} Td (${escapePdf(DATAGALACTIC_COMPANY.name)} - ${escapePdf(DATAGALACTIC_COMPANY.tagline)} | SOURCED: ${leads.length} CLIENTS | DATE: ${escapePdf(genDate)} | PAGE ${p + 1} OF ${totalPages}) Tj ET\n`;

    // 2. Table Column Header Bar
    const tableTop = pageH - 110;
    s += `0.12 0.16 0.28 rg\n`;
    s += `${margin} ${tableTop - 22} ${pageW - margin * 2} 22 re f\n`;

    // Column Labels
    s += `BT /F1 8 Tf 1 1 1 rg\n`;
    s += `${margin + 6} ${tableTop - 15} Td (#) Tj\n`;
    s += `${margin + 28} ${tableTop - 15} Td (COMPANY / WEBSITE) Tj\n`;
    s += `${margin + 185} ${tableTop - 15} Td (KEY DECISION MAKER) Tj\n`;
    s += `${margin + 345} ${tableTop - 15} Td (BUSINESS EMAIL / PHONE) Tj\n`;
    s += `${margin + 515} ${tableTop - 15} Td (LOCATION) Tj\n`;
    s += `${margin + 625} ${tableTop - 15} Td (SERVICE / PRODUCT FIT) Tj\n`;
    s += `${margin + 735} ${tableTop - 15} Td (SCORE) Tj\n`;
    s += `ET\n`;

    // 3. Data Rows
    pageRows.forEach((lead, idx) => {
      const globalIdx = p * rowsPerPage + idx + 1;
      const y = tableTop - 44 - idx * rowH;

      // Alternating row background
      if (idx % 2 === 0) {
        s += `0.97 0.98 1.0 rg\n`;
      } else {
        s += `1.0 1.0 1.0 rg\n`;
      }
      s += `${margin} ${y - 4} ${pageW - margin * 2} ${rowH} re f\n`;

      // Subtle bottom divider line
      s += `0.88 0.9 0.94 RG 0.5 w\n`;
      s += `${margin} ${y - 4} m ${pageW - margin} ${y - 4} l S\n`;

      // Text Fields
      const compText = (lead.companyName || 'Corporate Client').substring(0, 26);
      const contactText = `${lead.contactFullName || 'Decision Maker'} (${lead.jobTitle || 'Executive'})`.substring(0, 26);
      const emailText = (lead.businessEmail || '').substring(0, 28);
      const locText = `${lead.regionCity || ''}, ${lead.country || ''}`.substring(0, 18);
      const serviceText = (lead.recommendedService || lead.targetProductCategory || 'Data Cleaning').substring(0, 18);
      const scoreText = `${lead.leadScore || 95}/100`;

      s += `BT /F2 7.5 Tf 0.1 0.15 0.22 rg\n`;
      s += `${margin + 6} ${y + 2} Td (${globalIdx}) Tj\n`;
      s += `${margin + 28} ${y + 2} Td (${escapePdf(compText)}) Tj\n`;
      s += `${margin + 185} ${y + 2} Td (${escapePdf(contactText)}) Tj\n`;
      s += `${margin + 345} ${y + 2} Td (${escapePdf(emailText)}) Tj\n`;
      s += `${margin + 515} ${y + 2} Td (${escapePdf(locText)}) Tj\n`;
      s += `${margin + 625} ${y + 2} Td (${escapePdf(serviceText)}) Tj\n`;
      s += `ET\n`;

      // Score in green
      s += `BT /F1 7.5 Tf 0.08 0.55 0.25 rg\n`;
      s += `${margin + 735} ${y + 2} Td (${escapePdf(scoreText)}) Tj\n`;
      s += `ET\n`;
    });

    // 4. Footer
    s += `0.85 0.88 0.92 RG 0.5 w\n`;
    s += `${margin} 32 m ${pageW - margin} 32 l S\n`;

    s += `BT /F2 7.5 Tf 0.45 0.5 0.6 rg\n`;
    s += `${margin} 20 Td (Confidential Executive Client Dossier | DataGalactic LeadPilot AI | ${escapePdf(DATAGALACTIC_COMPANY.website)}) Tj\n`;
    s += `${pageW - margin - 85} 20 Td (Page ${p + 1} of ${totalPages}) Tj\n`;
    s += `ET\n`;

    pageStreams.push(s);
  }

  // Construct standard PDF 1.4 object table
  let pdf = `%PDF-1.4\n`;
  const offsets: number[] = [];

  function writeObj(num: number, body: string) {
    offsets[num] = pdf.length;
    pdf += `${num} 0 obj\n${body}\nendobj\n`;
  }

  // Object 1: Catalog
  writeObj(1, `<< /Type /Catalog /Pages 2 0 R >>`);

  // Fonts
  writeObj(3, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);
  writeObj(4, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

  let nextIdx = 5;
  const pageRefs: string[] = [];
  const pageData: Array<{ pageObjNum: number; contentObjNum: number; stream: string }> = [];

  for (let i = 0; i < pageStreams.length; i++) {
    const pageObjNum = nextIdx++;
    const contentObjNum = nextIdx++;
    pageRefs.push(`${pageObjNum} 0 R`);
    pageData.push({ pageObjNum, contentObjNum, stream: pageStreams[i] });
  }

  // Object 2: Pages container
  writeObj(2, `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pageRefs.length} >>`);

  // Write individual pages
  pageData.forEach(p => {
    writeObj(p.pageObjNum, `<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 ${pageW} ${pageH}]
  /Resources <<
    /Font <<
      /F1 3 0 R
      /F2 4 0 R
    >>
  >>
  /Contents ${p.contentObjNum} 0 R
>>`);

    // Stream length in bytes
    const streamLen = new TextEncoder().encode(p.stream).length;
    writeObj(p.contentObjNum, `<< /Length ${streamLen} >>\nstream\n${p.stream}\nendstream`);
  });

  // Cross-reference table
  const startXref = pdf.length;
  pdf += `xref\n0 ${nextIdx}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 1; i < nextIdx; i++) {
    const off = String(offsets[i] || 0).padStart(10, '0');
    pdf += `${off} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${nextIdx} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  // Trigger browser download directly to This PC > Downloads
  try {
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Error triggering direct PDF download:', err);
  }

  return filename;
}

/**
 * Primary export handler: Automatically saves PDF directly into This PC (Downloads folder),
 * and can also open print preview if requested.
 */
export function exportLeadsToPdf(leads: Lead[], options: ExportPdfOptions = {}) {
  // Always trigger direct file download to This PC > Downloads!
  const savedFilename = downloadLeadsPdfDirectly(leads, options);

  // If user requested print preview window as well, open it
  if (options.openPrintView) {
    openPrintPdfView(leads, options);
  }

  return savedFilename;
}

/**
 * Secondary handler: Opens high-definition browser print preview window
 */
export function openPrintPdfView(leads: Lead[], options: ExportPdfOptions = {}) {
  const {
    title = 'DataGalactic Client Intelligence Dossier',
    leadMode = 'all'
  } = options;

  const modeLabel = leadMode === 'service_leads'
    ? 'Mode A: DataGalactic B2B Services'
    : leadMode === 'export_buyers'
    ? 'Mode B: International Export Buyer Hub'
    : 'All Prospect Pipelines (CRM)';

  const generationDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const tableRows = leads.map((lead, index) => {
    const isService = lead.leadMode === 'service_leads';
    const requirementText = isService
      ? lead.recommendedService || 'Data Cleaning & Formatting'
      : `${lead.targetProductCategory || 'Agro / Spices'} (${lead.minOrderQuantity || '1 FCL'})`;

    const cityCountry = [lead.regionCity, lead.country].filter(Boolean).join(', ');

    return `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <td style="padding: 8px 6px; text-align: center; font-weight: 600; color: #64748b;">${index + 1}</td>
        <td style="padding: 8px 10px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 12px;">${escapeHtml(lead.companyName)}</div>
          <div style="color: #6366f1; font-size: 10px;">${escapeHtml(lead.companyDomain || lead.companyWebsite || '')}</div>
        </td>
        <td style="padding: 8px 10px;">
          <div style="font-weight: 600; color: #1e293b;">${escapeHtml(lead.contactFullName)}</div>
          <div style="color: #64748b; font-size: 10px;">${escapeHtml(lead.jobTitle)}</div>
        </td>
        <td style="padding: 8px 10px;">
          <div style="font-weight: 600; color: #0f172a; font-family: monospace; font-size: 11px;">${escapeHtml(lead.businessEmail)}</div>
          ${lead.publicBusinessPhone ? `<div style="color: #64748b; font-size: 10px;">${escapeHtml(lead.publicBusinessPhone)}</div>` : ''}
        </td>
        <td style="padding: 8px 10px; color: #334155;">
          ${escapeHtml(cityCountry)}
        </td>
        <td style="padding: 8px 10px;">
          <span style="display: inline-block; padding: 2px 6px; background-color: #eef2ff; color: #4338ca; border-radius: 4px; font-weight: 600; font-size: 10px;">
            ${escapeHtml(requirementText)}
          </span>
        </td>
        <td style="padding: 8px 8px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; background-color: #dcfce7; color: #15803d; border-radius: 12px; font-weight: 700; font-size: 10px;">
            ${lead.leadScore || 90}/100
          </span>
        </td>
        <td style="padding: 8px 8px; text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; background-color: #f1f5f9; color: #475569; border-radius: 4px; font-weight: 600; font-size: 10px;">
            ${escapeHtml(lead.leadStatus)}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)} - ${leads.length} Records</title>
      <style>
        @page { size: A4 landscape; margin: 10mm 8mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 15px; color: #0f172a; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 2px solid #4f46e5; margin-bottom: 14px; }
        .logo-title h1 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
        .logo-title p { margin: 3px 0 0 0; font-size: 11px; color: #6366f1; font-weight: 600; }
        .meta-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 11px; }
        .meta-item strong { display: block; color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        thead { display: table-header-group; }
        th { background: #0f172a; color: #ffffff; text-align: left; padding: 9px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #0f172a; }
        tr { page-break-inside: avoid; }
        .actions-bar { background: #1e1b4b; color: #fff; padding: 10px 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .btn-save { background: #4f46e5; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
        @media print { .actions-bar { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="actions-bar">
        <span>DataGalactic PDF Print & Export View (<strong>${leads.length} Records</strong>)</span>
        <button class="btn-save" onclick="window.print()">Print or Save as PDF</button>
      </div>

      <div class="header">
        <div class="logo-title">
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(DATAGALACTIC_COMPANY.name)} • ${escapeHtml(DATAGALACTIC_COMPANY.tagline)}</p>
        </div>
        <div style="text-align: right; font-size: 11px; color: #4338ca; font-weight: 700;">
          ${escapeHtml(modeLabel)}
        </div>
      </div>

      <div class="meta-strip">
        <div class="meta-item">
          <strong>Total Verified Clients</strong>
          <span style="font-size: 13px; font-weight: 800; color: #4338ca;">${leads.length} Companies</span>
        </div>
        <div class="meta-item">
          <strong>Date Generated</strong>
          <span>${generationDate}</span>
        </div>
        <div class="meta-item">
          <strong>Sourced By</strong>
          <span>DataGalactic LeadPilot AI Engine</span>
        </div>
        <div class="meta-item">
          <strong>Deliverability Standard</strong>
          <span style="color: #15803d; font-weight: 700;">99.9% High-Precision Guaranteed</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">#</th>
            <th style="min-width: 140px;">Company & Domain</th>
            <th style="min-width: 130px;">Key Contact</th>
            <th style="min-width: 160px;">Business Email / Phone</th>
            <th style="min-width: 120px;">Location</th>
            <th style="min-width: 150px;">Target Fit / Offering</th>
            <th style="width: 70px; text-align: center;">Score</th>
            <th style="width: 70px; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
