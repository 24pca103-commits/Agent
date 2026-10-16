export const DATAGALACTIC_COMPANY = {
  name: 'DataGalactic',
  founder: 'Risona',
  tagline: 'Precision Beyond Limits',
  website: 'https://datagalactic.com',
  email: 'contact@datagalactic.com',
  specialization: 'B2B Data Management & High-Precision Business Support Services',
};

export interface ServiceDefinition {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  targetPainPoint: string;
  pitchSnippet: string;
}

export const DATAGALACTIC_SERVICES: ServiceDefinition[] = [
  {
    id: 'data-entry',
    name: 'Data Entry Services',
    shortDesc: 'High-speed, 99.9% accurate data entry into Excel, Google Sheets, ERPs & CRMs.',
    fullDesc: 'Manual and automated business data entry from diverse formats into structured spreadsheets, proprietary databases, and enterprise platforms.',
    targetPainPoint: 'High in-house hourly costs and staff time wasted on repetitive entry.',
    pitchSnippet: 'Our high-precision remote team handles bulk data entry with double-verification, slashing operational overhead by up to 65%.'
  },
  {
    id: 'data-cleaning',
    name: 'Data Cleaning & Formatting',
    shortDesc: 'Eliminate duplicates, resolve typos, standardize schemas, and format disorganized databases.',
    fullDesc: 'Comprehensive CRM and spreadsheet hygiene: deduplication, schema alignment, telephone & address standardization, and syntax fixes.',
    targetPainPoint: 'Messy CRM records leading to high email bounce rates and sales confusion.',
    pitchSnippet: 'We sanitize and reorganize your legacy customer databases to restore 100% CRM accuracy and email deliverability.'
  },
  {
    id: 'data-extraction',
    name: 'Data Extraction',
    shortDesc: 'Ethical extraction of structured data from public websites, business registries, and documents.',
    fullDesc: 'Extracting directories, catalog listings, specifications, and market data into clean structured tabular formats.',
    targetPainPoint: 'Manual copy-pasting from competitor sites or directories is slow and error-prone.',
    pitchSnippet: 'We convert unstructured web and directory records into structured, analytics-ready datasets customized to your exact schema.'
  },
  {
    id: 'b2b-lead-generation',
    name: 'B2B Lead Generation',
    shortDesc: 'Targeted decision-maker list building with verified corporate emails and social profiles.',
    fullDesc: 'Researching niche B2B buyer companies, locating Founders, COOs, and Procurement heads, and confirming verified direct business emails.',
    targetPainPoint: 'Sales teams wasting 40% of their day hunting for contacts instead of closing deals.',
    pitchSnippet: 'We feed your sales pipeline with bespoke, triple-verified prospect lists tailored to your ideal customer profile.'
  },
  {
    id: 'web-market-research',
    name: 'Web & Market Research',
    shortDesc: 'Deep-dive competitive intelligence, pricing analysis, and industry benchmark research.',
    fullDesc: 'Manual web research, competitor feature comparisons, supplier evaluations, and international market opportunity scouting.',
    targetPainPoint: 'Lack of dedicated bandwidth to study international market trends and competitor moves.',
    pitchSnippet: 'Receive actionable intelligence dossiers on competitor pricing, market gaps, and emerging B2B opportunities.'
  },
  {
    id: 'database-building',
    name: 'Database Building',
    shortDesc: 'Custom relational databases and catalog repositories structured from ground up.',
    fullDesc: 'Constructing robust company, supplier, product, and client databases with strict primary keys and relationship integrity.',
    targetPainPoint: 'Fragmented data scattered across multiple legacy files and emails.',
    pitchSnippet: 'We consolidate your scattered business data into a unified, scalable database ready for reporting or CRM import.'
  },
  {
    id: 'data-verification',
    name: 'Data Validation & Verification',
    shortDesc: 'Real-time validation of business emails, domain status, addresses, and phone numbers.',
    fullDesc: 'SMTP handshake validation, MX record verification, physical business verification, and active status checks.',
    targetPainPoint: 'High email bounce rates burning domain reputation and wasted outreach spend.',
    pitchSnippet: 'Every lead and record is tested against our strict verification checks to guarantee genuine, deliverable contacts.'
  },
  {
    id: 'crm-product-management',
    name: 'CRM & Product Data Management',
    shortDesc: 'Ongoing CRM pipeline updates & e-commerce bulk product catalog management.',
    fullDesc: 'Enriching customer records in HubSpot/Salesforce and managing thousands of SKUs, pricing, and images on Shopify, Amazon & WooCommerce.',
    targetPainPoint: 'E-commerce and SaaS teams falling behind on product uploads and pipeline hygiene.',
    pitchSnippet: 'Keep your e-commerce catalogs updated and CRM pipelines organized with dedicated round-the-clock support.'
  },
  {
    id: 'document-digitization',
    name: 'Document Digitization & Conversion',
    shortDesc: 'Convert scanned PDFs, invoices, and physical documentation into searchable digital data.',
    fullDesc: 'OCR post-processing, invoice digitizing, receipts parsing, legal paperwork scanning, and indexing.',
    targetPainPoint: 'Critical business intelligence locked away in static PDFs and scanned documents.',
    pitchSnippet: 'Transform paper forms, historical PDFs, and shipping bills into searchable, editable digital assets.'
  },
  {
    id: 'back-office-support',
    name: 'Back-Office & Administrative Support',
    shortDesc: 'Virtual operations assistance: spreadsheet updates, reporting, and operational task coordination.',
    fullDesc: 'Continuous support for logistics paperwork, appointment schedules, invoice cross-referencing, and record keeping.',
    targetPainPoint: 'Core executive and sales staff bogged down by low-leverage administrative tasks.',
    pitchSnippet: 'Delegate recurring spreadsheet tasks and operational workflows to our reliable support team.'
  }
];

export const TARGET_CLIENT_INDUSTRIES: string[] = [
  'IT & Software Companies',
  'Digital Marketing Agencies',
  'B2B Lead Generation Agencies',
  'E-commerce Businesses',
  'Schools & Universities',
  'Hospitals & Clinics',
  'Real Estate Companies',
  'Manufacturing Companies',
  'Export & Import Companies',
  'Recruitment & Staffing Agencies',
  'Financial Services Companies',
  'Logistics & Shipping Companies',
  'Consulting & Professional Services Firms',
  'Law Firms',
  'Travel & Tourism Companies',
  'Hotels & Hospitality Businesses',
  'Construction Companies',
  'Insurance Companies',
  'Wholesale & Distribution Businesses',
  'Retail Businesses',
  'Startups',
  'Small & Medium Businesses (SMEs)',
  'Large Corporations',
  'BPO & Outsourcing Companies',
  'Research & Market Intelligence Firms',
  'Non-profit Organisations'
];

export const TARGET_COUNTRIES: string[] = [
  'United Kingdom (UK)',
  'United States (USA)',
  'Canada',
  'Australia',
  'Germany',
  'United Arab Emirates (UAE)',
  'Singapore',
  'Netherlands',
  'Ireland',
  'New Zealand',
  'France',
  'Sweden',
  'Switzerland',
  'India',
  'Global / Worldwide'
];

export const TARGET_ROLES: string[] = [
  'Founder / Co-Founder',
  'Chief Executive Officer (CEO)',
  'Chief Operating Officer (COO)',
  'Head of Operations',
  'Operations Manager',
  'Data Operations Manager',
  'Procurement Manager',
  'Business Support Manager',
  'Director of Sales',
  'Marketing Director',
  'IT / Technical Director',
  'Managing Director'
];
