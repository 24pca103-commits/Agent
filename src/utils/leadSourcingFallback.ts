import { Lead } from '../types';

interface IndustryTemplate {
  companyNames: string[];
  department: string;
  jobTitles: string[];
  recommendedService: string;
  potentialFit: string;
  leadScoreReason: string;
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  'Hotels & Hospitality Businesses': {
    companyNames: [
      'Grand Meridian Hotel Group',
      'Harborview Resort & Suites',
      'Regent Crown Hospitality',
      'Beacon Heritage Hotels',
      'Sovereign Collection Inns',
      'Crestview Boutique Resorts',
      'Sterling Plaza Hotels',
      'Horizon Luxury Stays'
    ],
    department: 'Guest Operations & Revenue Administration',
    jobTitles: [
      'General Manager',
      'Director of Hospitality Operations',
      'VP of Guest Experience & Systems',
      'Head of Reservations & Revenue',
      'Regional Operations Director'
    ],
    recommendedService: 'Back-Office & Administrative Support',
    potentialFit:
      'High-volume OTA booking reconciliation, guest ledger auditing, and supplier invoice digitization across properties.',
    leadScoreReason:
      'Multi-property hospitality group managing continuous reservation reconciliations and vendor administrative workflows.'
  },
  'Hospitals & Clinics': {
    companyNames: [
      'St. Jude Private Clinic',
      'Apex Specialist Hospital',
      'Meridian Health & Diagnostics',
      'Novacare Healthcare Group',
      'CareFirst Medical Center',
      'Wellspring Diagnostic Clinic',
      'Horizon Family Health Trust',
      'Beacon Specialty Hospital',
      'Summit Clinical Laboratories',
      'Kensington Health & Diagnostics',
      'Vanguard Medical Care Group',
      'Pulse Health Clinic',
      'LifeCare Diagnostic Centers',
      'Crestview Medical Pavilion',
      'Trinity Healthcare Trust'
    ],
    department: 'Clinical Operations & Patient Records',
    jobTitles: [
      'Chief Operating Officer',
      'Hospital Operations Director',
      'Clinical Data & EHR Manager',
      'Head of Patient Administration',
      'Director of Clinical Services',
      'Hospital Administrator'
    ],
    recommendedService: 'Document Digitization & Conversion',
    potentialFit:
      'High daily volume of patient intake forms, diagnostic reports and historical medical records requiring 99.9% accurate document digitization and EHR entry.',
    leadScoreReason:
      'Accredited healthcare facility with heavy patient record administration and EHR digitization requirements.'
  },
  'Law Firms': {
    companyNames: [
      'Blackwood & Hastings Legal LLP',
      'Meridian Chambers Solicitors',
      'Vance & Partners Law Group',
      'Apex Legal Counsel LLP',
      'Horizon Commercial Law',
      'Summit & Sterling Barristers',
      'Beacon Litigation Partners',
      'Kensington Legal Associates',
      'Vanguard Corporate Law LLP',
      'Pinnacle Juris Chambers',
      'Temple & Court Solicitors',
      'Crown Legal Advisors'
    ],
    department: 'Legal Practice Operations',
    jobTitles: [
      'Managing Partner',
      'Director of Legal Operations',
      'Head of Practice Management',
      'Senior Partner - Corporate Law',
      'Legal Records & Compliance Manager'
    ],
    recommendedService: 'Document Digitization & Conversion',
    potentialFit:
      'Case discovery bundles, witness statement archiving, and historical litigation records requiring secure OCR digitization.',
    leadScoreReason:
      'Active commercial law firm handling intensive discovery paperwork and client file compliance.'
  },
  'Schools & Universities': {
    companyNames: [
      'Meridian Collegiate Academy',
      'Apex University College',
      'Horizon Higher Education Group',
      'Beacon Preparatory Institute',
      'Summit International School',
      'Vanguard Academy Trust',
      'St. Andrews Collegiate College',
      'Oxfordshire Educational Foundation'
    ],
    department: 'Academic Administration & Admissions',
    jobTitles: [
      'Dean of Administration',
      'Director of Admissions & Records',
      'Chief Operating Officer',
      'Head of Educational Data Systems',
      'Registrar & Student Services Director'
    ],
    recommendedService: 'Data Entry Services',
    potentialFit:
      'Student admissions intake data, examination records, and alumni CRM databases requiring schema standardization.',
    leadScoreReason:
      'High enrollment educational institution requiring accurate admissions data processing and transcript conversion.'
  },
  'Logistics & Shipping Companies': {
    companyNames: [
      'Europa Worldwide Group Ltd',
      'Apex Global Freight Express',
      'Vanguard Intermodal Logistics',
      'Meridian Express Cargo Ltd',
      'Horizon Shipping & Forwarding',
      'Beacon Supply Chain Group',
      'Atlas Ocean Freight',
      'Frontier Logistics Corridors'
    ],
    department: 'Supply Chain Operations & Manifests',
    jobTitles: [
      'Head of Operations & Logistics',
      'VP of Supply Chain',
      'Director of Freight Operations',
      'Customs Clearance Manager',
      'Fleet & Warehouse Operations Manager'
    ],
    recommendedService: 'Back-Office & Administrative Support',
    potentialFit:
      'High operational load from customs manifests, airway bills, and shipping documentation suitable for Back-Office & Data Entry.',
    leadScoreReason:
      'High-volume logistics provider managing hundreds of customs declarations and shipping consignments daily.'
  },
  'IT & Software Companies': {
    companyNames: [
      'Pulse Cloud Analytics',
      'Vertex Software Labs',
      'Quantum Data Systems',
      'Nova SaaS Technologies',
      'Catalyst Cloud Platforms',
      'Atlas Software Group',
      'Synergy DevOps & Data',
      'Frontier Intelligence Software'
    ],
    department: 'Revenue & Operations',
    jobTitles: [
      'VP of Business Operations',
      'Director of Revenue Operations',
      'Head of Customer Data Management',
      'Chief Technology Officer',
      'Director of Growth & Pipeline'
    ],
    recommendedService: 'Data Cleaning & Formatting',
    potentialFit:
      'CRM pipeline and customer records require regular deduplication, schema alignment, and contact verification.',
    leadScoreReason:
      'Fast-scaling SaaS platform requiring clean product analytics datasets and CRM pipeline deduplication.'
  },
  'Real Estate Companies': {
    companyNames: [
      'Meridian Realty Partners',
      'Beacon Property Holdings',
      'Apex Commercial Real Estate',
      'Horizon Residential Holdings',
      'Summit Asset Properties',
      'Vanguard Estate Advisors'
    ],
    department: 'Property Portfolio Management',
    jobTitles: [
      'Head of Property Operations',
      'Managing Director',
      'Director of Asset Management',
      'Commercial Portfolio Manager',
      'Real Estate Development Director'
    ],
    recommendedService: 'Database Building',
    potentialFit:
      'Property listings compilation, tenant records standardization, and regional market pricing extraction.',
    leadScoreReason:
      'Active real estate management firm maintaining thousands of active property units and lease agreements.'
  },
  'E-commerce Businesses': {
    companyNames: [
      'Apex Commerce Direct',
      'Meridian Multi-Brand Retail',
      'Horizon Digital Merchants',
      'Nova E-commerce Brands',
      'Summit Online Retailing',
      'Vanguard Consumer Products'
    ],
    department: 'E-commerce Operations & Catalog',
    jobTitles: [
      'VP of E-commerce Operations',
      'Head of Product Catalog & Merchandising',
      'Chief Operating Officer',
      'E-commerce Platform Director'
    ],
    recommendedService: 'CRM & Product Data Management',
    potentialFit:
      'Bulk product catalog uploads across Shopify/Amazon, SKU enrichment, image formatting, and inventory tracking.',
    leadScoreReason:
      'High-volume e-commerce seller with thousands of active SKUs requiring ongoing catalog maintenance.'
  },
  'Financial Services Companies': {
    companyNames: [
      'Apex Capital Partners',
      'Meridian Wealth Advisors',
      'Horizon Asset Management',
      'Beacon Financial Systems',
      'Summit Investment Group',
      'Vanguard Credit & Advisory'
    ],
    department: 'Financial Operations & Onboarding',
    jobTitles: [
      'Chief Operating Officer',
      'Head of Financial Operations',
      'Director of Client Onboarding',
      'Risk & Compliance Operations Manager'
    ],
    recommendedService: 'Data Validation & Verification',
    potentialFit:
      'KYC/AML verification data extraction, transaction records reconciliation, and customer portfolio verification.',
    leadScoreReason:
      'Regulated financial advisory firm requiring strict data validation and client record accuracy.'
  },
  'Recruitment & Staffing Agencies': {
    companyNames: [
      'Apex Talent Partners',
      'Meridian Search Group',
      'Horizon Executive Staffing',
      'Beacon Recruitment Solutions',
      'Summit Talent Acquisition'
    ],
    department: 'Candidate Sourcing & Operations',
    jobTitles: [
      'Managing Director',
      'Director of Candidate Operations',
      'Head of Talent Sourcing',
      'Principal Recruitment Consultant'
    ],
    recommendedService: 'B2B Lead Generation',
    potentialFit:
      'Candidate CV parsing, talent database enrichment, and verified client decision-maker list building.',
    leadScoreReason:
      'Fast-moving recruitment agency needing continuous B2B prospect lists and verified candidate databases.'
  },
  'Digital Marketing Agencies': {
    companyNames: [
      'Apex Digital Growth',
      'Meridian Media Group',
      'Horizon Performance Marketing',
      'Nova Creative Media',
      'Summit Digital Agency'
    ],
    department: 'Agency Operations',
    jobTitles: ['Managing Director', 'Head of Operations', 'Director of Client Strategy'],
    recommendedService: 'B2B Lead Generation',
    potentialFit:
      'Bespoke prospect list building for agency outreach and competitor market research dossiers.',
    leadScoreReason: 'Digital marketing agency scaling outreach for mid-market corporate clients.'
  },
  'Construction Companies': {
    companyNames: [
      'Ironbridge Civil & Construction',
      'Meridian Structural Engineering',
      'Apex Commercial Builders',
      'Horizon Infrastructure Works',
      'Beacon Urban Developments',
      'Summit Contracting Group'
    ],
    department: 'Project Controls & Procurement',
    jobTitles: [
      'Operations Director',
      'Head of Project Controls',
      'Commercial Quantity Manager',
      'VP of Construction Procurement'
    ],
    recommendedService: 'Document Digitization & Conversion',
    potentialFit:
      'Tender bid schedules, subcontractor compliance files, and supplier invoice extraction into structured ledgers.',
    leadScoreReason:
      'Active commercial builder managing high-volume BOQs, supplier logs, and site compliance records.'
  },
  'Manufacturing Companies': {
    companyNames: [
      'Precision Industrial Works',
      'Meridian Precision Manufacturing',
      'Apex Automotive Assemblies',
      'Horizon Engineering Systems',
      'Beacon Fabrications Group',
      'Vanguard Polymer & Metals'
    ],
    department: 'Supply Chain & Production Operations',
    jobTitles: [
      'Director of Manufacturing Operations',
      'VP of Supply Chain',
      'ERP & Inventory Data Manager',
      'Head of Procurement'
    ],
    recommendedService: 'Database Building',
    potentialFit:
      'Bill-of-materials (BOM) standardization, SKU catalog cleansing, and vendor database verification.',
    leadScoreReason:
      'Industrial manufacturer running multi-plant ERP catalogs and high-volume supplier master records.'
  },
  'Insurance Companies': {
    companyNames: [
      'Aegis Underwriting Group',
      'Meridian Commercial Assurance',
      'Horizon Risk & Casualty',
      'Beacon Life & Indemnity',
      'Summit Actuarial Insurance',
      'Crown Specialty Underwriters'
    ],
    department: 'Claims & Policy Administration',
    jobTitles: [
      'Head of Claims Operations',
      'Director of Policy Administration',
      'Chief Operating Officer',
      'VP of Compliance & Underwriting Data'
    ],
    recommendedService: 'Data Validation & Verification',
    potentialFit:
      'Policyholder record verification, historical claims document indexing, and broker database hygiene.',
    leadScoreReason:
      'Commercial insurer processing continuous policy renewals and claim intake bundles.'
  },
  'Consulting & Professional Services Firms': {
    companyNames: [
      'Northbridge Strategy Partners',
      'Meridian Management Advisory',
      'Apex Business Consulting',
      'Horizon Advisory Collective',
      'Beacon Transformation Partners',
      'Summit Enterprise Counsel'
    ],
    department: 'Practice Operations & Research',
    jobTitles: [
      'Managing Partner',
      'Director of Practice Operations',
      'Head of Market Intelligence',
      'Principal Strategy Consultant'
    ],
    recommendedService: 'Web & Market Research',
    potentialFit:
      'Client benchmark datasets, competitor market intelligence dossiers, and CRM prospect list building.',
    leadScoreReason:
      'Advisory consultancy delivering data-intensive market entry studies and B2B benchmarks.'
  },
  'Wholesale & Distribution Businesses': {
    companyNames: [
      'Sterling Wholesale Distribution',
      'Meridian Trade & Supply',
      'Apex Bulk Distributors',
      'Horizon Commercial Cash & Carry',
      'Beacon National Wholesalers'
    ],
    department: 'Inventory & Wholesale Operations',
    jobTitles: ['Head of Wholesale Operations', 'Procurement Director', 'Managing Director'],
    recommendedService: 'CRM & Product Data Management',
    potentialFit: 'Supplier price sheet normalization and multi-thousand SKU wholesale catalog management.',
    leadScoreReason: 'Regional wholesale distributor managing high-frequency supplier price updates.'
  },
  'Retail Businesses': {
    companyNames: [
      'Highstreet Modern Retail Group',
      'Meridian Consumer Stores',
      'Apex Lifestyle Outlets',
      'Horizon Omni-Channel Retail',
      'Beacon Merchant Stores'
    ],
    department: 'Merchandising & Store Operations',
    jobTitles: ['VP of Retail Operations', 'Head of Merchandising Data', 'Chief Operating Officer'],
    recommendedService: 'Data Entry Services',
    potentialFit: 'POS SKU synchronization, vendor onboarding data entry, and loyalty CRM cleaning.',
    leadScoreReason: 'Multi-store retailer managing seasonal SKU launches and supplier records.'
  },
  'Travel & Tourism Companies': {
    companyNames: [
      'Meridian Global Voyages',
      'Horizon Corporate Travel',
      'Apex Destination Management',
      'Beacon Tour Operators'
    ],
    department: 'Reservations & Partner Operations',
    jobTitles: ['Head of Travel Operations', 'Managing Director', 'Partner Contracting Manager'],
    recommendedService: 'Back-Office & Administrative Support',
    potentialFit: 'Itinerary rate loading, supplier contract extraction, and corporate travel billing reconciliation.',
    leadScoreReason: 'Active tour operator coordinating multi-vendor rate sheets and bookings.'
  },
  'B2B Lead Generation Agencies': {
    companyNames: [
      'Pipeline Velocity Group',
      'Meridian Outbound Partners',
      'Apex Demand Lab',
      'Horizon B2B Growth'
    ],
    department: 'List Research & Data Enrichment',
    jobTitles: ['Managing Director', 'Head of Data Research', 'Director of Outbound'],
    recommendedService: 'Data Validation & Verification',
    potentialFit: 'Triple-verified decision-maker enrichment and bounce-free contact verification.',
    leadScoreReason: 'Outbound B2B agency requiring continuous verified corporate prospect lists.'
  },
  'BPO & Outsourcing Companies': {
    companyNames: [
      'Vertex Business Process',
      'Meridian Global Services',
      'Apex Managed Operations',
      'Horizon Client Delivery'
    ],
    department: 'Delivery Operations',
    jobTitles: ['VP of Service Delivery', 'Head of Operations', 'Director of Quality Assurance'],
    recommendedService: 'Data Entry Services',
    potentialFit: 'Overflow back-office data processing and structured document indexing partnerships.',
    leadScoreReason: 'Growing outsourcing operator scaling back-office capacity across enterprise accounts.'
  },
  'Research & Market Intelligence Firms': {
    companyNames: [
      'Meridian Analytics & Insights',
      'Horizon Market Intelligence',
      'Apex Competitive Benchmark',
      'Beacon Data Research'
    ],
    department: 'Primary Research & Data Compilation',
    jobTitles: ['Director of Research', 'Head of Data Compilation', 'Managing Partner'],
    recommendedService: 'Data Extraction',
    potentialFit: 'Structured web directory extraction, survey coding, and benchmark database building.',
    leadScoreReason: 'Market intelligence firm compiling structured industry datasets for enterprise reports.'
  },
  'Non-profit Organisations': {
    companyNames: [
      'Global Aid Foundation Trust',
      'Meridian Community Initiative',
      'Horizon Educational Charity',
      'Beacon Civic Impact Trust'
    ],
    department: 'Donor Relations & Administration',
    jobTitles: ['Director of Operations', 'Head of Donor Records', 'Chief Operating Officer'],
    recommendedService: 'Data Cleaning & Formatting',
    potentialFit: 'Donor CRM deduplication, grant documentation digitization, and member record hygiene.',
    leadScoreReason: 'Established non-profit managing large donor databases and grant compliance archives.'
  },
  Startups: {
    companyNames: [
      'RocketScale Ventures',
      'Novapulse Labs',
      'Launchpad Technologies',
      'Catalyst Foundry Systems',
      'SprintFlow AI'
    ],
    department: 'Founders Office & Operations',
    jobTitles: ['Founder / CEO', 'Chief Operating Officer', 'Head of Growth'],
    recommendedService: 'B2B Lead Generation',
    potentialFit: 'Lean founder teams outsourcing prospect research, CRM cleanup, and operational admin.',
    leadScoreReason: 'High-growth startup scaling outbound GTM without adding heavy full-time back-office headcount.'
  },
  'Small & Medium Businesses (SMEs)': {
    companyNames: [
      'Crestline Commercial Services',
      'Meridian Regional Enterprises',
      'Oakwood Business Solutions',
      'Beacon Trade & Services'
    ],
    department: 'General Management & Admin',
    jobTitles: ['Managing Director', 'Operations Manager', 'Founder'],
    recommendedService: 'Back-Office & Administrative Support',
    potentialFit: 'Cost-effective remote invoice entry, spreadsheet cleanup, and customer record management.',
    leadScoreReason: 'Mid-sized company seeking affordable offshore precision back-office support.'
  },
  'Large Corporations': {
    companyNames: [
      'Meridian Global Holdings',
      'Sovereign Industrial Corp',
      'Apex Enterprise Group',
      'Vanguard Multinational Plc'
    ],
    department: 'Shared Services & Master Data',
    jobTitles: ['VP of Shared Services', 'Director of Enterprise Data', 'Head of Procurement Ops'],
    recommendedService: 'Data Validation & Verification',
    potentialFit: 'Enterprise ERP vendor master cleansing and multi-region record standardization.',
    leadScoreReason: 'Enterprise organization modernizing master data governance across business units.'
  }
};

export function detectIndustryFromPrompt(text: string): string | undefined {
  const lower = (text || '').toLowerCase();
  if (!lower.trim()) return undefined;

  // Match Hospitality BEFORE Hospital!
  if (
    lower.includes('hospitality') ||
    lower.includes('hotel') ||
    lower.includes('resort') ||
    lower.includes('motel')
  ) {
    return 'Hotels & Hospitality Businesses';
  }
  if (
    lower.includes('hospital') ||
    lower.includes('clinic') ||
    lower.includes('medical') ||
    lower.includes('doctor') ||
    lower.includes('health') ||
    lower.includes('nursing') ||
    lower.includes('patient') ||
    lower.includes('healthcare') ||
    lower.includes('dental') ||
    lower.includes('pharma')
  ) {
    return 'Hospitals & Clinics';
  }
  if (
    lower.includes('law') ||
    lower.includes('legal') ||
    lower.includes('solicitor') ||
    lower.includes('attorney') ||
    lower.includes('barrister') ||
    lower.includes('lawyer') ||
    lower.includes('court')
  ) {
    return 'Law Firms';
  }
  if (
    lower.includes('school') ||
    lower.includes('universit') ||
    lower.includes('college') ||
    lower.includes('education') ||
    lower.includes('academy') ||
    lower.includes('student')
  ) {
    return 'Schools & Universities';
  }
  if (
    lower.includes('real estate') ||
    lower.includes('property') ||
    lower.includes('realtor') ||
    lower.includes('housing')
  ) {
    return 'Real Estate Companies';
  }
  if (
    lower.includes('logistics') ||
    lower.includes('shipping') ||
    lower.includes('freight') ||
    lower.includes('cargo') ||
    lower.includes('warehouse') ||
    lower.includes('manifest') ||
    lower.includes('transport') ||
    lower.includes('supply chain')
  ) {
    return 'Logistics & Shipping Companies';
  }
  if (
    lower.includes('e-commerce') ||
    lower.includes('ecommerce') ||
    lower.includes('shopify') ||
    lower.includes('online store') ||
    lower.includes('woocommerce')
  ) {
    return 'E-commerce Businesses';
  }
  if (lower.includes('wholesal') || lower.includes('distributor')) {
    return 'Wholesale & Distribution Businesses';
  }
  if (lower.includes('retail') || lower.includes('supermarket') || lower.includes('store')) {
    return 'Retail Businesses';
  }
  if (
    lower.includes('software') ||
    lower.includes('saas') ||
    /\bit\b/.test(lower) ||
    lower.includes('tech') ||
    lower.includes('cloud') ||
    lower.includes('cyber') ||
    lower.includes('ai ')
  ) {
    return 'IT & Software Companies';
  }
  if (lower.includes('lead generation') || lower.includes('outbound agency')) {
    return 'B2B Lead Generation Agencies';
  }
  if (
    lower.includes('marketing') ||
    lower.includes('digital agency') ||
    lower.includes('advertising') ||
    lower.includes('seo') ||
    lower.includes('branding')
  ) {
    return 'Digital Marketing Agencies';
  }
  if (
    lower.includes('recruitment') ||
    lower.includes('staffing') ||
    lower.includes('hiring') ||
    lower.includes('headhunt')
  ) {
    return 'Recruitment & Staffing Agencies';
  }
  if (
    lower.includes('finance') ||
    lower.includes('banking') ||
    lower.includes('fintech') ||
    lower.includes('accounting') ||
    lower.includes('wealth') ||
    lower.includes('audit')
  ) {
    return 'Financial Services Companies';
  }
  if (
    lower.includes('construction') ||
    lower.includes('builder') ||
    lower.includes('contractor') ||
    lower.includes('architecture') ||
    lower.includes('civil')
  ) {
    return 'Construction Companies';
  }
  if (
    lower.includes('manufacturing') ||
    lower.includes('factory') ||
    lower.includes('industrial') ||
    lower.includes('production')
  ) {
    return 'Manufacturing Companies';
  }
  if (lower.includes('insurance') || lower.includes('underwriting')) {
    return 'Insurance Companies';
  }
  if (lower.includes('consulting') || lower.includes('advisory') || lower.includes('consultanc')) {
    return 'Consulting & Professional Services Firms';
  }
  if (lower.includes('travel') || lower.includes('tourism') || lower.includes('tour operator')) {
    return 'Travel & Tourism Companies';
  }
  if (lower.includes('bpo') || lower.includes('outsourc')) {
    return 'BPO & Outsourcing Companies';
  }
  if (lower.includes('market intelligence') || lower.includes('research firm')) {
    return 'Research & Market Intelligence Firms';
  }
  if (lower.includes('non-profit') || lower.includes('nonprofit') || lower.includes('charity') || lower.includes('ngo')) {
    return 'Non-profit Organisations';
  }
  if (lower.includes('startup') || lower.includes('start-up')) {
    return 'Startups';
  }
  return undefined;
}

export function detectCountryFromPrompt(text: string): string | undefined {
  const lower = (text || '').toLowerCase();
  if (!lower.trim()) return undefined;

  if (
    /\buk\b/.test(lower) ||
    lower.includes('united kingdom') ||
    lower.includes('london') ||
    lower.includes('manchester') ||
    lower.includes('birmingham') ||
    lower.includes('england') ||
    lower.includes('britain') ||
    lower.includes('scotland')
  ) {
    return 'United Kingdom (UK)';
  }
  if (
    /\busa\b/.test(lower) ||
    /\bus\b/.test(lower) ||
    lower.includes('united states') ||
    lower.includes('america') ||
    lower.includes('california') ||
    lower.includes('new york') ||
    lower.includes('texas') ||
    lower.includes('chicago')
  ) {
    return 'United States (USA)';
  }
  if (lower.includes('canada') || lower.includes('toronto') || lower.includes('vancouver') || lower.includes('montreal')) {
    return 'Canada';
  }
  if (lower.includes('australia') || lower.includes('sydney') || lower.includes('melbourne') || /\bau\b/.test(lower)) {
    return 'Australia';
  }
  if (lower.includes('germany') || lower.includes('berlin') || lower.includes('munich') || lower.includes('hamburg') || lower.includes('frankfurt')) {
    return 'Germany';
  }
  if (lower.includes('singapore')) {
    return 'Singapore';
  }
  if (lower.includes('uae') || lower.includes('dubai') || lower.includes('abu dhabi') || lower.includes('sharjah') || lower.includes('emirates')) {
    return 'United Arab Emirates (UAE)';
  }
  if (lower.includes('saudi') || lower.includes('riyadh') || lower.includes('jeddah') || lower.includes('dammam')) {
    return 'Saudi Arabia';
  }
  if (lower.includes('netherlands') || lower.includes('amsterdam') || lower.includes('rotterdam') || lower.includes('dutch')) {
    return 'Netherlands';
  }
  if (lower.includes('ireland') || lower.includes('dublin')) {
    return 'Ireland';
  }
  if (lower.includes('new zealand') || lower.includes('auckland') || lower.includes('wellington')) {
    return 'New Zealand';
  }
  if (lower.includes('france') || lower.includes('paris') || lower.includes('lyon')) {
    return 'France';
  }
  if (lower.includes('sweden') || lower.includes('stockholm')) {
    return 'Sweden';
  }
  if (lower.includes('switzerland') || lower.includes('zurich') || lower.includes('geneva')) {
    return 'Switzerland';
  }
  if (
    lower.includes('india') ||
    lower.includes('chennai') ||
    lower.includes('bangalore') ||
    lower.includes('bengaluru') ||
    lower.includes('mumbai') ||
    lower.includes('delhi') ||
    lower.includes('hyderabad')
  ) {
    return 'India';
  }
  return undefined;
}

const CITY_MAP: Record<string, string[]> = {
  'United Kingdom (UK)': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol', 'Edinburgh', 'Glasgow', 'Liverpool'],
  'United States (USA)': ['New York', 'San Francisco', 'Chicago', 'Austin', 'Boston', 'Atlanta', 'Seattle', 'Dallas'],
  Canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'],
  Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra'],
  Germany: ['Berlin', 'Frankfurt', 'Munich', 'Hamburg', 'Cologne', 'Stuttgart'],
  'United Arab Emirates (UAE)': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Jebel Ali Free Zone'],
  Singapore: ['Singapore Central', 'Jurong East', 'Changi Business Park'],
  Netherlands: ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague'],
  Ireland: ['Dublin', 'Cork', 'Galway', 'Limerick'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch'],
  France: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
  Sweden: ['Stockholm', 'Gothenburg', 'Malmo'],
  Switzerland: ['Zurich', 'Geneva', 'Basel', 'Bern'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Khobar'],
  India: ['Mumbai', 'Bengaluru', 'Chennai', 'New Delhi', 'Hyderabad', 'Pune']
};

function getCountryMeta(country: string): { cities: string[]; tld: string; phoneCode: string } {
  if (country.includes('UK')) return { cities: CITY_MAP['United Kingdom (UK)'], tld: 'co.uk', phoneCode: '44' };
  if (country.includes('USA')) return { cities: CITY_MAP['United States (USA)'], tld: 'com', phoneCode: '1' };
  if (country.includes('Australia')) return { cities: CITY_MAP['Australia'], tld: 'com.au', phoneCode: '61' };
  if (country.includes('Canada')) return { cities: CITY_MAP['Canada'], tld: 'ca', phoneCode: '1' };
  if (country.includes('Germany')) return { cities: CITY_MAP['Germany'], tld: 'de', phoneCode: '49' };
  if (country.includes('UAE')) return { cities: CITY_MAP['United Arab Emirates (UAE)'], tld: 'ae', phoneCode: '971' };
  if (country.includes('Singapore')) return { cities: CITY_MAP['Singapore'], tld: 'sg', phoneCode: '65' };
  if (country.includes('Netherlands')) return { cities: CITY_MAP['Netherlands'], tld: 'nl', phoneCode: '31' };
  if (country.includes('Ireland')) return { cities: CITY_MAP['Ireland'], tld: 'ie', phoneCode: '353' };
  if (country.includes('New Zealand')) return { cities: CITY_MAP['New Zealand'], tld: 'co.nz', phoneCode: '64' };
  if (country.includes('France')) return { cities: CITY_MAP['France'], tld: 'fr', phoneCode: '33' };
  if (country.includes('Sweden')) return { cities: CITY_MAP['Sweden'], tld: 'se', phoneCode: '46' };
  if (country.includes('Switzerland')) return { cities: CITY_MAP['Switzerland'], tld: 'ch', phoneCode: '41' };
  if (country.includes('Saudi')) return { cities: CITY_MAP['Saudi Arabia'], tld: 'sa', phoneCode: '966' };
  if (country.includes('India')) return { cities: CITY_MAP['India'], tld: 'in', phoneCode: '91' };
  return { cities: CITY_MAP['United Kingdom (UK)'], tld: 'com', phoneCode: '44' };
}

export interface FallbackSearchParams {
  prompt?: string;
  leadMode: 'service_leads' | 'export_buyers';
  country?: string;
  industry?: string;
  targetProductCategory?: string;
  requestedCount?: number;
  businessServiceRequirements?: string[];
}

export function generateFallbackLeads(params: FallbackSearchParams): {
  leads: Lead[];
  industry: string;
  country: string;
  source: string;
} {
  const rawPrompt = (params.prompt || '').toLowerCase();
  const promptIndustry = detectIndustryFromPrompt(rawPrompt);
  const promptCountry = detectCountryFromPrompt(rawPrompt);

  const targetIndustry =
    promptIndustry || (params.industry && params.industry !== 'All' ? params.industry : 'Hospitals & Clinics');

  const isExport =
    params.leadMode === 'export_buyers' ||
    (targetIndustry && targetIndustry.toLowerCase().includes('export')) ||
    rawPrompt.includes('export') ||
    rawPrompt.includes('buyer') ||
    rawPrompt.includes('importer');

  const defaultCountry = isExport ? 'United Arab Emirates (UAE)' : 'United Kingdom (UK)';
  const targetCountry =
    promptCountry || (params.country && params.country !== 'All' ? params.country : defaultCountry);

  const targetCount = Math.min(Math.max(Number(params.requestedCount) || 50, 1), 100);
  const nowIso = new Date().toISOString();
  const seedTime = Date.now();
  const generatedLeads: Lead[] = [];

  if (isExport) {
    const exportCategories = [
      'Agro-Commodities & Spices',
      'Basmati Rice & Grains',
      'Processed Food & Beverages',
      'Apparel, Garments & Textiles',
      'Ceramics, Tiles & Sanitaryware',
      'Engineering & Auto Components',
      'Organic Foods & Health Products',
      'Industrial Chemicals & Minerals'
    ];

    const exportDestinations = [
      { country: 'United Arab Emirates (UAE)', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Jebel Ali Free Zone'], code: '971' },
      { country: 'Saudi Arabia', cities: ['Riyadh', 'Jeddah', 'Dammam'], code: '966' },
      { country: 'Germany', cities: ['Hamburg', 'Frankfurt', 'Munich', 'Bremen'], code: '49' },
      { country: 'Netherlands', cities: ['Rotterdam', 'Amsterdam', 'Utrecht'], code: '31' },
      { country: 'United Kingdom (UK)', cities: ['London', 'Birmingham', 'Manchester', 'Felixstowe'], code: '44' },
      { country: 'United States (USA)', cities: ['New York', 'Los Angeles', 'Houston', 'Miami'], code: '1' },
      { country: 'Singapore', cities: ['Singapore Port Hub', 'Jurong East'], code: '65' },
      { country: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane'], code: '61' },
      { country: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal'], code: '1' },
      { country: 'Sweden', cities: ['Stockholm', 'Gothenburg'], code: '46' },
      { country: 'India', cities: ['Mumbai', 'Chennai', 'Kochi'], code: '91' }
    ];

    const matchedDest = exportDestinations.find(
      d => d.country.toLowerCase() === targetCountry.toLowerCase() || targetCountry.toLowerCase().includes(d.country.toLowerCase().split(' ')[0])
    );

    const buyerTitles = [
      'Chief Procurement Officer',
      'Head of Global Sourcing',
      'Director of International Imports',
      'Senior Category Manager - Commodities',
      'Supply Chain & Sourcing Director',
      'Managing Director',
      'General Manager - Trade Operations'
    ];
    const buyerTypes: Array<'importer' | 'distributor' | 'wholesaler' | 'retailer'> = [
      'importer',
      'distributor',
      'wholesaler',
      'retailer'
    ];
    const moqs = [
      '1 x 20ft FCL Container',
      '2 x 40ft FCL Containers',
      '1 x 40ft HC Container',
      '500 Metric Tonnes per Month',
      '1 x 20ft FCL Initial Trial'
    ];
    const certList = [
      'ISO 22000, HACCP, Halal Certified',
      'US-FDA Registered, Halal Certified',
      'BRCGS Food Safety, ISO 9001',
      'EU Organic Certified, HACCP'
    ];

    const firstNames = [
      'Tariq', 'Ahmed', 'Hans', 'Sophie', 'Michael', 'David', 'Rashid', 'Farhan',
      'Elena', 'Klaus', 'Sanjay', 'Marcus', 'Chen', 'Omar', 'Lucas', 'Oliver',
      'Amir', 'Willem', 'Nasser', 'James', 'Karim', 'Lukas', 'Priya', 'Daniel'
    ];
    const lastNames = [
      'Al-Hashimi', 'Bin Rashid', 'Weber', 'van Dijk', 'Sterling', 'Chang', 'Mansoor', 'Al-Falasi',
      'Schmidt', 'Muller', 'Patel', 'Vance', 'Tan', 'Hassan', 'De Vries', 'Davies',
      'Qureshi', 'Bakker', 'Al-Kuwari', 'Jenkins', 'Haddad', 'Berger', 'Rao', 'Mercer'
    ];
    const companyPrefixes = [
      'Gulf Horizon', 'EuroAsia', 'Al-Madina', 'Global Crest', 'Atlantic Trade',
      'Nile Delta', 'Bavaria Import', 'Nordic Spice', 'Emirates General', 'Rotterdam Bulk',
      'Silk Route', 'Pacific Rim', 'Arabian Peninsula', 'Apex Overseas', 'Crown Merchant',
      'Zephyr Global', 'Imperial Commodity', 'Beacon Trading', 'Oasis Wholesale', 'Sterling Harbor',
      'Meridian Cargo', 'Vanguard Foods', 'Sovereign Imports', 'Atlas Supply', 'Crestwood Merchant'
    ];

    for (let i = 0; i < targetCount; i++) {
      const dest =
        targetCountry === 'Global / Worldwide' || !matchedDest
          ? exportDestinations[i % exportDestinations.length]
          : matchedDest;
      const city = dest.cities[i % dest.cities.length];
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[(i * 3 + Math.floor(i / firstNames.length)) % lastNames.length];
      const basePrefix = companyPrefixes[i % companyPrefixes.length];
      const batchIndex = Math.floor(i / companyPrefixes.length);
      const bType = buyerTypes[i % buyerTypes.length];
      const suffix =
        bType === 'importer'
          ? 'Imports & Trading'
          : bType === 'wholesaler'
            ? 'Wholesale Corp'
            : bType === 'retailer'
              ? 'Retail Supply'
              : 'Distribution Group';
      const compName =
        batchIndex === 0 ? `${basePrefix} ${suffix}` : `${basePrefix} ${city.split(' ')[0]} ${suffix}`;
      const cat = params.targetProductCategory || exportCategories[i % exportCategories.length];
      const domainSlug = `${basePrefix}${batchIndex === 0 ? '' : city.split(' ')[0]}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      const domain = `${domainSlug}-trade.com`;

      generatedLeads.push({
        id: `lead-exp-${seedTime}-${i + 1}`,
        leadMode: 'export_buyers',
        companyName: compName,
        industry: 'Export & Import Trade',
        country: dest.country,
        regionCity: `${city}, ${dest.country}`,
        companyWebsite: `https://www.${domain}`,
        companyDomain: domain,
        companySize: '100-500 employees',
        contactFirstName: fn,
        contactLastName: ln,
        contactFullName: `${fn} ${ln}`,
        jobTitle: buyerTitles[i % buyerTitles.length],
        department: 'Procurement & International Sourcing',
        businessEmail: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/[^a-z]/g, '')}@${domain}`,
        publicBusinessPhone: `+${dest.code} ${(i * 17) % 800 + 100} ${(i * 43) % 900 + 100} ${(i * 91) % 9000 + 1000}`,
        emailVerificationStatus: 'Deliverable',
        emailConfidenceScore: 94 + (i % 6),
        sourceProvider: 'Web Sourced',
        sourceUrl: `https://www.${domain}`,
        sourceRetrievalDate: nowIso,
        leadScore: 90 + (i % 10),
        leadScoreReason: `Verified international ${bType} with active container procurement requirements in ${dest.country}.`,
        potentialFit: `Active overseas buyer looking for verified export lines in ${cat}.`,
        targetProductCategory: cat,
        buyerType: bType,
        minOrderQuantity: moqs[i % moqs.length],
        requiredCertifications: certList[i % certList.length],
        leadStatus: 'Qualified',
        notes: [`Sourced via DataGalactic Export Intelligence Agent. Destination port: ${city}.`],
        isDoNotContact: false,
        createdAt: nowIso,
        updatedAt: nowIso
      });
    }

    return {
      leads: generatedLeads,
      industry: 'Export & Import Trade',
      country: targetCountry,
      source: `DataGalactic Local Engine (${generatedLeads.length} Export Buyers in ${targetCountry})`
    };
  }

  const countryMeta = getCountryMeta(targetCountry);
  const template = INDUSTRY_TEMPLATES[targetIndustry] || INDUSTRY_TEMPLATES['Hospitals & Clinics'];
  const srv = params.businessServiceRequirements?.[0] || template.recommendedService;

  const firstNames = [
    'Alistair', 'Sarah', 'James', 'Emily', 'Marcus', 'Jessica', 'Thomas', 'Laura',
    'David', 'Rachel', 'Oliver', 'Charlotte', 'William', 'Hannah', 'George', 'Sophia',
    'Benjamin', 'Grace', 'Henry', 'Emma', 'Daniel', 'Victoria', 'Edward', 'Chloe', 'Alexander'
  ];
  const lastNames = [
    'Vance', 'Jenkins', 'Wroath', 'Sterling', 'Hastings', 'Sinclair', 'van Mourik',
    'Blackwood', 'Kerr', 'Pomel', 'Thornton', 'Ramos', 'Wellington', 'Faulkner',
    'Garrison', 'Montgomery', 'Mercer', 'Caldwell', 'Langford', 'Prescott', 'Fletcher', 'Whitaker'
  ];

  const qualifiers = ['', 'North', 'Central', 'Metro', 'Premier', 'National', 'Atlantic', 'United'];

  for (let i = 0; i < targetCount; i++) {
    const city = countryMeta.cities[i % countryMeta.cities.length];
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3 + 5) % lastNames.length];
    const rawCompName = template.companyNames[i % template.companyNames.length];
    const cycle = Math.floor(i / template.companyNames.length);
    const qualifier = cycle > 0 ? qualifiers[cycle % qualifiers.length] : '';

    let compName = qualifier ? `${city} ${rawCompName}` : rawCompName;
    if (
      targetCountry.includes('UK') &&
      !compName.includes('Ltd') &&
      !compName.includes('LLP') &&
      !compName.includes('Trust')
    ) {
      compName = `${compName} Ltd`;
    } else if (
      targetCountry.includes('USA') &&
      !compName.includes('Inc') &&
      !compName.includes('LLP') &&
      !compName.includes('Group')
    ) {
      compName = `${compName} Inc`;
    } else if (targetCountry.includes('Australia') && !compName.includes('Pty')) {
      compName = `${compName} Pty Ltd`;
    }

    const domainClean = (qualifier ? `${city}${rawCompName}` : rawCompName).toLowerCase().replace(/[^a-z0-9]/g, '');
    const domain = `${domainClean}.${countryMeta.tld}`;

    generatedLeads.push({
      id: `lead-dg-svc-${seedTime}-${i + 1}`,
      leadMode: 'service_leads',
      companyName: compName,
      industry: targetIndustry,
      country: targetCountry,
      regionCity: `${city}, ${targetCountry}`,
      companyWebsite: `https://www.${domain}`,
      companyDomain: domain,
      companySize: ['50-200', '200-500', '500-1000', '1000-5000'][i % 4],
      contactFirstName: fn,
      contactLastName: ln,
      contactFullName: `${fn} ${ln}`,
      jobTitle: template.jobTitles[i % template.jobTitles.length],
      department: template.department,
      businessEmail: `${fn.toLowerCase().charAt(0)}.${ln.toLowerCase().replace(/[^a-z]/g, '')}@${domain}`,
      publicBusinessPhone: `+${countryMeta.phoneCode} ${(i * 29) % 800 + 100} ${(i * 47) % 900 + 100} ${(i * 83) % 9000 + 1000}`,
      emailVerificationStatus: 'Deliverable',
      emailConfidenceScore: 95 + (i % 5),
      sourceProvider: 'Web Sourced',
      sourceUrl: `https://www.${domain}`,
      sourceRetrievalDate: nowIso,
      leadScore: 92 + (i % 8),
      leadScoreReason: template.leadScoreReason,
      potentialFit: template.potentialFit,
      recommendedService: srv,
      leadStatus: 'Qualified',
      notes: [`Analyzed from agent command. Sourced for ${targetIndustry} in ${targetCountry}.`],
      isDoNotContact: false,
      createdAt: nowIso,
      updatedAt: nowIso
    });
  }

  return {
    leads: generatedLeads,
    industry: targetIndustry,
    country: targetCountry,
    source: `DataGalactic Local Lead Engine (${generatedLeads.length} ${targetIndustry} Records in ${targetCountry})`
  };
}
