# 🌌 DataGalactic LeadPilot AI
> **"Precision Beyond Limits"**  
> Founder: **Risona**  
> Company: **DataGalactic** – B2B Data & Business Support Services

A complete, full-stack, secure B2B Lead Generation and CRM platform with specialized AI Agents, human-in-the-loop cold email drafting, follow-up management, and international export buyer sourcing.

---

## 🚀 Quick Start (How to Run in 1 Command)

Open your terminal in `d:\Agent` and run:

```bash
npm start
```

This single command automatically launches both:
- **Backend API Server (Node.js/Express)** at `http://localhost:5000`
- **Frontend Dashboard (React/TypeScript/Tailwind)** at `http://localhost:5173`

Open your web browser and navigate to:
👉 **`http://localhost:5173`**

---

## 🌟 The 12 Fully Functional Modules

| # | Navigation Page | What it Does |
|---|---|---|
| **1** | **Dashboard** | Real-time database metrics: Total Leads, Qualified Leads, Country distribution, Industry distribution, Drafts, Emails Sent, Action Center. |
| **2** | **AI Lead Finder** | Natural Language prompt input (e.g. *"Find 100 UK logistics companies with 50-500 employees..."*). Google Gemini parses your prompt into structured filters for your review before sourcing. |
| **3** | **Mode A: DataGalactic Service Leads** | Specialized prospect sourcing for UK, USA, Canada, Australia. Filter across 25 target industries and match with DataGalactic's 10 Core Services with evidence-based reasoning. |
| **4** | **Mode B: Export Buyer Leads** | Workflow for international product exporters. Find overseas importers, distributors, wholesalers with MOQ, trade categories, and certifications (FDA, ISO, Halal). |
| **5** | **Lead Database / CRM** | Searchable CRM table with multi-select, pagination, duplicate domain detection, 13 lifecycle statuses, inline editing, and CSV export. |
| **6** | **Email Campaign Drafts** | AI-generated hyper-personalized cold outreach emails. Supports 4 tones (*Professional, Friendly, Concise, Formal*), tailored DataGalactic pitch snippets, and zero hallucinations. |
| **7** | **Email Sending Approval** | **Strict Safety Gate:** No email is ever sent without your explicit manual inspection and click on **"Approve & Send"**. Features batch sending and pause controls. |
| **8** | **Follow-up Manager** | Day 3 & Day 7 sales cadences. Tracks *Due Today*, *Overdue*, and *Upcoming* follow-ups with instant follow-up email draft generation and snooze controls. |
| **9** | **Import / Export Centre** | Download leads as CSV safe from spreadsheet formula injection (`=+@-` sanitized). Import external CSV spreadsheets with automatic column mapping. |
| **10** | **Integrations & API Settings** | Connection monitors for Apollo.io, Hunter.io, Gemini AI, and Supabase. Includes live "Test Connection" buttons and clear Demo Mode badges. |
| **11** | **Privacy, Suppression & DNC** | Do-Not-Contact (DNC) registry and real-time compliance checker complying with GDPR, CAN-SPAM, and the UK Data Protection Act. |
| **12** | **Settings** | DataGalactic company credentials, daily sending limits, sender profile, and complete Supabase PostgreSQL schema documentation. |

---

## 🎯 DataGalactic's 10 Core Services (Built-in)
1. **Data Entry Services** – High-speed, 99.9% accurate data entry into Excel, Google Sheets, ERPs & CRMs.
2. **Data Cleaning & Formatting** – Deduplication, schema alignment, telephone & address standardization.
3. **Data Extraction** – Structured data extraction from public directories and business registries.
4. **B2B Lead Generation** – Targeted decision-maker list building with verified corporate emails.
5. **Web & Market Research** – Competitive intelligence, pricing analysis, and supplier evaluations.
6. **Database Building** – Custom relational databases and catalog repositories structured from ground up.
7. **Data Validation & Verification** – Real-time validation of business emails, domain status, and phone numbers.
8. **CRM & Product Data Management** – Ongoing CRM pipeline updates & e-commerce bulk catalog management.
9. **Document Digitization & Conversion** – Converting scanned PDFs, invoices, and physical records into digital data.
10. **Back-Office & Administrative Support** – Spreadsheet updates, records maintenance, and operational task coordination.

---

## 🛡️ Security & Zero-Cost Architecture
- **Zero Cost Starting:** Runs out of the box in high-fidelity **Demo Mode** without paying a single rupee.
- **Activating Live APIs:** When ready, simply add your free API keys in `.env`:
  - `APOLLO_API_KEY` – Free B2B search credits from [Apollo.io](https://www.apollo.io/)
  - `HUNTER_API_KEY` – 25 free monthly verifications from [Hunter.io](https://hunter.io/)
  - `GEMINI_API_KEY` – Free Gemini AI quota from [Google AI Studio](https://aistudio.google.com/)
- **Formula Injection Protection:** All CSV exports neutralize spreadsheet injection vectors.
- **Client Credential Protection:** All API keys stay server-side on the Node.js backend runtime; never leaked to frontend browser bundles or logs.

---

## 🗄️ Supabase PostgreSQL Setup (Optional Cloud DB)
To persist data permanently across all sessions in the cloud:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy and run the provided SQL script from the app's **Settings (Page 12)**.
4. Paste your `SUPABASE_URL` and `SUPABASE_ANON_KEY` into `.env`.
