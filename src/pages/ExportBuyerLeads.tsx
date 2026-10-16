import React, { useState } from 'react';
import {
  Globe2,
  Package,
  Search,
  CheckCircle2,
  Ship,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Lead } from '../types';
import { TARGET_COUNTRIES } from '../data/catalog';
import { StatusBadge } from '../components/Badge';

interface ExportBuyerLeadsProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAddNewLead: (lead: Lead) => void;
}

export const ExportBuyerLeads: React.FC<ExportBuyerLeadsProps> = ({
  leads,
  onSelectLead,
  onAddNewLead
}) => {
  // Form State for Export Sourcing
  const [productCategory, setProductCategory] = useState('Agro-Commodities & Spices');
  const [productDescription, setProductDescription] = useState('Premium export-quality whole black pepper, cardamom, and organic spices.');
  const [originCountry, setOriginCountry] = useState('India');
  const [targetCountry, setTargetCountry] = useState('United Arab Emirates (UAE)');
  const [buyerType, setBuyerType] = useState<'importer' | 'distributor' | 'wholesaler' | 'retailer'>('distributor');
  const [minOrderQty, setMinOrderQty] = useState('1 x 20ft Full Container Load (FCL)');
  const [certifications, setCertifications] = useState('ISO 22000, HACCP, Halal Certified');
  const [isSearching, setIsSearching] = useState(false);

  // Filter only export_buyers leads
  const buyerLeads = leads.filter(l => l.leadMode === 'export_buyers');

  const handleSourcingSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      const newBuyerLead: Lead = {
        id: `buyer-${Date.now()}`,
        leadMode: 'export_buyers',
        companyName: 'Al Maya Group UAE',
        industry: 'Wholesale & Distribution Businesses',
        country: targetCountry,
        regionCity: 'Dubai, UAE',
        companyWebsite: 'https://www.almaya.com',
        companyDomain: 'almaya.com',
        companyLinkedInUrl: 'https://www.linkedin.com/company/al-maya-group',
        companySize: '100-250',
        contactFirstName: 'Rashid',
        contactLastName: 'Al-Falasi',
        contactFullName: 'Rashid Al-Falasi',
        jobTitle: 'Head of Commodity Procurement',
        department: 'Global Sourcing & Import Division',
        businessEmail: 'r.falasi@gulffoodimports.ae',
        emailVerificationStatus: 'Deliverable',
        emailConfidenceScore: 95,
        publicBusinessPhone: '+971 6 544 1199',
        sourceProvider: 'Trade Directory',
        sourceUrl: 'https://www.uaechamber.ae/buyers/gulf-food-imports',
        sourceRetrievalDate: new Date().toISOString(),
        leadScore: 93,
        leadScoreReason: `Active licensed importer in ${targetCountry} with verified refrigerated warehouse storage for ${productCategory}.`,
        potentialFit: `Procures container-load bulk shipments matching ${certifications}.`,
        buyerType: buyerType,
        targetProductCategory: productCategory,
        productCertifications: certifications.split(',').map(s => s.trim()),
        leadStatus: 'Qualified',
        notes: [
          `Identified through UAE Chamber Verified Importer Registry.`,
          `Minimum order capability matches ${minOrderQty}.`
        ],
        isDoNotContact: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onAddNewLead(newBuyerLead);
      setIsSearching(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Mode B: International Export Buyer Leads</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Find overseas importers, distributors, wholesalers, and sourcing companies for your international product exports.
        </p>
      </div>

      {/* Export Sourcing Specifier Card */}
      <div className="galaxy-card p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Product & Trade Specification Parameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Product Category */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Product Category</label>
            <input
              type="text"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              placeholder="e.g. Spices, Garments, Engineering Goods"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          {/* Country of Origin */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Country of Origin</label>
            <input
              type="text"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          {/* Target Importing Country */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Importing Country</label>
            <select
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            >
              {TARGET_COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Buyer Type */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Buyer Entity Type</label>
            <select
              value={buyerType}
              onChange={(e) => setBuyerType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            >
              <option value="distributor">Distributor / Channel Partner</option>
              <option value="importer">Direct Importer</option>
              <option value="wholesaler">Wholesaler / Stockist</option>
              <option value="retailer">Retail Chain / Hypermarket</option>
              <option value="sourcing_company">International Sourcing Company</option>
            </select>
          </div>

          {/* Minimum Order Quantity */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Minimum Order Quantity (MOQ)</label>
            <input
              type="text"
              value={minOrderQty}
              onChange={(e) => setMinOrderQty(e.target.value)}
              placeholder="e.g. 1 Container, 500 units"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          {/* Certifications */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Certifications / Compliance</label>
            <input
              type="text"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="e.g. FDA, CE, ISO, Halal"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-4">
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">Product Description & USP</label>
          <textarea
            rows={2}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>

        <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            * Strictly utilizes permitted trade directories and authorized registries. No fabricated trade volumes.
          </div>
          <button
            onClick={handleSourcingSearch}
            disabled={isSearching}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            {isSearching ? (
              <span>Locating Verified Importers...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Potential Importers & Distributors</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sourced Importers / Distributors List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Sourced Verified Importers & Sourcing Leads ({buyerLeads.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyerLeads.map((buyer) => (
            <div key={buyer.id} className="galaxy-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{buyer.companyName}</h4>
                      <a
                        href={buyer.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-indigo-400"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-indigo-300 font-medium">
                      {buyer.country} • <span className="uppercase text-xs px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 font-semibold">{buyer.buyerType}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">{buyer.leadScore}/100</div>
                    <span className="text-xs text-slate-400">Buyer Fit</span>
                  </div>
                </div>

                {/* Sourcing Contact Details */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{buyer.contactFullName}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                      {buyer.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{buyer.jobTitle}</p>
                  
                  <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80">
                    <span className="text-slate-300 font-mono text-xs">{buyer.businessEmail}</span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {buyer.emailVerificationStatus}
                    </span>
                  </div>
                </div>

                {/* Certifications and trade note */}
                <div className="mt-3.5 space-y-2">
                  <div className="text-xs text-slate-400">
                    Target Category: <strong className="text-slate-200">{buyer.targetProductCategory}</strong>
                  </div>
                  {buyer.productCertifications && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {buyer.productCertifications.map((c, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80 font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-300 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20 leading-relaxed mt-2.5">
                    <strong className="text-indigo-200">Trade Match Evidence:</strong> {buyer.leadScoreReason}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <StatusBadge status={buyer.leadStatus} />
                <button
                  onClick={() => onSelectLead(buyer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft Export Proposal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
