'use client';

import React from 'react';
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Award,
  Globe,
  FileText,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Property } from '@/lib/types';
import { formatPricePKR } from './PropertyCard';

interface PropertyBrochurePrintProps {
  property: Property;
  onClose?: () => void;
  isModal?: boolean;
}

export default function PropertyBrochurePrint({
  property,
  onClose,
  isModal = false,
}: PropertyBrochurePrintProps) {
  const formattedPrice = formatPricePKR(property.price);
  const formattedDownPayment = property.down_payment
    ? formatPricePKR(property.down_payment)
    : formatPricePKR(Math.round(property.price * 0.4));

  const balanceAmount =
    property.down_payment && property.price > property.down_payment
      ? property.price - property.down_payment
      : Math.round(property.price * 0.6);

  const quarterlyInstallment =
    balanceAmount && balanceAmount > 0 ? Math.round(balanceAmount / 8) : null;

  // Additional gallery images (excluding duplicate of thumbnail)
  const additionalImages = (property.gallery_urls || []).filter(
    (url) => url !== property.thumbnail_url
  );

  // If no additional gallery photos, use Citi Housing master plan blueprint as second visual
  const galleryImage1 =
    additionalImages[0] || '/maps/citi-housing-master-plan-hd.webp';
  const galleryImage2 =
    additionalImages[1] || '/images/hero-banner.png';

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const refCode = `PB-${(property.slug || property.id || 'CITI')
    .slice(0, 12)
    .toUpperCase()}`;

  const customSpecs = (property.features || [])
    .filter((f) => f.includes(':'))
    .map((f) => {
      const idx = f.indexOf(':');
      return {
        label: f.slice(0, idx).trim(),
        value: f.slice(idx + 1).trim(),
      };
    })
    .filter((s) => s.label && s.value);

  const brochureContent = (
    <div
      id="printable-brochure"
      className="bg-white text-slate-900 p-5 sm:p-6 max-w-4xl mx-auto space-y-2.5 font-sans print:p-0 print:m-0 print:max-w-none print:shadow-none print:border-none shadow-xl rounded-2xl border border-slate-200"
      style={{
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        pageBreakAfter: 'avoid',
        breakAfter: 'avoid',
      }}
    >
      {/* 1. EXECUTIVE CORPORATE MASTHEAD */}
      <div className="flex items-center justify-between border-b-2 border-amber-500 pb-2.5 gap-3 print-avoid-break">
        {/* Left: Brand Identity & Dealership Credentials */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Property Bank Real Estate"
            className="w-12 h-12 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-950 tracking-tight leading-none">
                PROPERTY BANK
              </h1>
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-800 border border-amber-400/50 px-1.5 py-0.5 rounded">
                Authorized Dealer
              </span>
            </div>
            <p className="text-[10.5px] font-bold text-amber-700 tracking-wide mt-0.5">
              CITI HOUSING (PVT) LTD &bull; SAMUNDRI ROAD FAISALABAD
            </p>
            <p className="text-[9px] text-slate-500 font-medium">
              11-AA Main Commercial Market, Citi Housing Phase II, Samundri Road, Faisalabad
            </p>
          </div>
        </div>

        {/* Right: Reference, Date & Direct Dealer Contacts */}
        <div className="text-right shrink-0 space-y-0.5">
          <div className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            <span>REF:</span>
            <span className="text-slate-950">{refCode}</span>
          </div>
          <div className="text-slate-950 font-black text-xs pt-0.5">
            ASIF SADIQ &bull; RANA ADNAN
          </div>
          <div className="text-emerald-700 font-extrabold text-[11px] leading-tight">
            0302-8658450 &bull; 0302-9892535
          </div>
          <div className="text-[9px] text-slate-400">
            Official A4 Brochure &bull; {currentDate}
          </div>
        </div>
      </div>

      {/* 2. HIGH-IMPACT SIDE-BY-SIDE VISUAL SHOWCASE */}
      <div className="grid grid-cols-12 gap-2 print-avoid-break">
        {/* Left: Main Featured Hero Photo (62% width) */}
        <div className="col-span-7 sm:col-span-8 relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xs">
          <img
            src={property.thumbnail_url || '/images/hero-banner.png'}
            alt={property.title}
            className="w-full h-full object-contain p-0.5"
          />
          {/* Floating Verification Badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="bg-red-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
              {property.purpose === 'Installment'
                ? '2-Year Installments'
                : property.purpose === 'Rent'
                ? 'For Rent'
                : 'For Sale'}
            </span>
            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>100% Clear File</span>
            </span>
          </div>

          <div className="absolute bottom-2 right-2 bg-slate-950/85 text-white text-[9px] font-semibold px-2 py-0.5 rounded">
            {property.property_type} &bull; Citi Housing Phase II
          </div>
        </div>

        {/* Right: Stacked Multi-Photo Gallery & Master Plan Blueprint (38% width) */}
        <div className="col-span-5 sm:col-span-4 flex flex-col gap-2">
          {/* Gallery Photo 1 */}
          <div className="relative h-[84px] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xs">
            <img
              src={galleryImage1}
              alt="Property Gallery View 1"
              className="w-full h-full object-contain p-0.5"
            />
            <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
              {additionalImages.length > 0 ? 'Gallery Photo 2' : 'Master Plan Blueprint'}
            </div>
          </div>

          {/* Gallery Photo 2 */}
          <div className="relative h-[84px] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xs">
            <img
              src={galleryImage2}
              alt="Property Gallery View 2"
              className="w-full h-full object-contain p-0.5"
            />
            <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
              {additionalImages.length > 1 ? 'Gallery Photo 3' : 'Citi Housing Layout'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROPERTY TITLE, LOCATION & PROMINENT PRICING BAR */}
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/90 print-avoid-break">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded">
              {property.property_type} Listing
            </span>
            <span className="text-[9px] font-semibold text-slate-500">
              Citi Housing Phase II
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
            {property.title}
          </h2>
          <div className="flex items-center gap-1 text-[10px] text-slate-600 font-semibold">
            <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
            <span className="line-clamp-1">{property.address}</span>
          </div>
        </div>

        <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-xs">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
            Total Demand Price
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-950 leading-none mt-0.5">
            {formattedPrice}
          </div>
          <div className="text-[10px] font-extrabold text-emerald-700 mt-0.5">
            Status: {property.status || 'Available'}
          </div>
        </div>
      </div>

      {/* 4. COMPREHENSIVE VERIFIED SPECIFICATIONS MATRIX */}
      <div className="space-y-1 print-avoid-break">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-amber-600" />
            <span>Verified Property Specifications</span>
          </h3>
          <span className="text-[8.5px] font-bold text-slate-400 uppercase">
            Official Data Matrix
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          {/* Spec 1: Total Area */}
          <div className="p-1.5 bg-white rounded-lg border border-slate-100">
            <div className="text-[8.5px] font-bold uppercase text-slate-400">Total Area</div>
            <div className="text-xs font-black text-slate-900 mt-0.5">
              {property.area_value} {property.area_unit}
            </div>
            <div className="text-[8px] text-slate-500">
              {property.area_unit === 'Marla'
                ? `Approx. ${property.area_value * 225} Sq. Ft.`
                : `${property.area_value} ${property.area_unit}`}
            </div>
          </div>

          {/* Spec 2: Property Type */}
          <div className="p-1.5 bg-white rounded-lg border border-slate-100">
            <div className="text-[8.5px] font-bold uppercase text-slate-400">Property Type</div>
            <div className="text-xs font-black text-slate-900 mt-0.5">
              {property.property_type}
            </div>
            <div className="text-[8px] text-slate-500">{property.sub_type || 'Residential'}</div>
          </div>

          {/* Spec 3: Society & Sector */}
          <div className="p-1.5 bg-white rounded-lg border border-slate-100">
            <div className="text-[8.5px] font-bold uppercase text-slate-400">Location Society</div>
            <div className="text-xs font-black text-slate-900 mt-0.5 truncate">
              Citi Housing Phase II
            </div>
            <div className="text-[8px] text-slate-500 truncate">Samundri Road, Faisalabad</div>
          </div>

          {/* Spec 4: Purpose */}
          <div className="p-1.5 bg-white rounded-lg border border-slate-100">
            <div className="text-[8.5px] font-bold uppercase text-slate-400">Purpose</div>
            <div className="text-xs font-black text-slate-900 mt-0.5">
              {property.purpose === 'Installment'
                ? '2-Yr Installment'
                : property.purpose}
            </div>
            <div className="text-[8px] text-slate-500">
              {property.purpose === 'Installment' ? 'Quarterly Plan' : 'Direct Transfer'}
            </div>
          </div>

          {/* Spec 5: Bedrooms (if any) or Dimension */}
          <div className="p-1.5 bg-white rounded-lg border border-slate-100">
            <div className="text-[8.5px] font-bold uppercase text-slate-400">Bedrooms / Size</div>
            <div className="text-xs font-black text-slate-900 mt-0.5">
              {property.bedrooms && property.bedrooms > 0
                ? `${property.bedrooms} Bed Attached`
                : `${property.area_value} ${property.area_unit} Standard`}
            </div>
            <div className="text-[8px] text-slate-500">
              {property.bathrooms && property.bathrooms > 0
                ? `${property.bathrooms} Bathrooms`
                : 'Prime Location'}
            </div>
          </div>

          {/* Spec 6: Registry & File Verification */}
          <div className="p-1.5 bg-white rounded-lg border border-slate-100">
            <div className="text-[8.5px] font-bold uppercase text-slate-400">Title / Registry</div>
            <div className="text-xs font-black text-emerald-700 mt-0.5">
              100% Clear File
            </div>
            <div className="text-[8px] text-slate-500">Citi Head Office Verified</div>
          </div>

          {/* Spec 7: Possession */}
          <div className="p-1.5 bg-white rounded-lg border border-slate-100">
            <div className="text-[8.5px] font-bold uppercase text-slate-400">Possession</div>
            <div className="text-xs font-black text-slate-900 mt-0.5">
              {property.possession_payment ? 'On Possession' : 'Immediate'}
            </div>
            <div className="text-[8px] text-slate-500">Biometric Handover</div>
          </div>

          {/* Spec 8: Dealership Verification */}
          <div className="p-1.5 bg-white rounded-lg border border-slate-100">
            <div className="text-[8.5px] font-bold uppercase text-slate-400">Dealership Status</div>
            <div className="text-xs font-black text-amber-700 mt-0.5">
              Authorized Agent
            </div>
            <div className="text-[8px] text-slate-500">Property Bank Real Estate</div>
          </div>
        </div>

        {/* Dynamic Additional Custom Specifications in Brochure */}
        {customSpecs.length > 0 && (
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {customSpecs.slice(0, 4).map((spec, idx) => (
              <div key={idx} className="p-1.5 bg-amber-50/60 rounded-lg border border-amber-200/80">
                <div className="text-[8.5px] font-bold uppercase text-amber-800 truncate">{spec.label}</div>
                <div className="text-xs font-black text-slate-900 mt-0.5 truncate">{spec.value}</div>
                <div className="text-[8px] text-slate-500">Verified Specification</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. FINANCIAL PAYMENT SCHEDULE / TERMS */}
      <div className="p-2 rounded-xl bg-slate-900 text-white space-y-1.5 print-avoid-break">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <h3 className="text-[9.5px] font-black uppercase tracking-wider text-amber-300">
              {property.purpose === 'Installment'
                ? 'Official 2-Year Payment Plan (8 Quarterly Installments)'
                : 'Deal Financial & Transfer Terms Summary'}
            </h3>
          </div>
          <span className="text-[8.5px] font-bold text-slate-400">
            {property.purpose === 'Installment' ? '24 Months Schedule' : 'Standard Citi Policy'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-center">
            <div className="text-[8px] font-bold text-slate-400 uppercase">Total Demand</div>
            <div className="text-xs font-black text-white mt-0.5">{formattedPrice}</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-center">
            <div className="text-[8px] font-bold text-amber-400 uppercase">
              {property.purpose === 'Installment' ? '40% Down Payment' : 'Booking Advance'}
            </div>
            <div className="text-xs font-black text-amber-300 mt-0.5">{formattedDownPayment}</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-center">
            <div className="text-[8px] font-bold text-slate-400 uppercase">
              {property.purpose === 'Installment' ? 'Est. Quarterly (x8)' : 'Transfer Fee'}
            </div>
            <div className="text-xs font-black text-emerald-400 mt-0.5">
              {quarterlyInstallment ? formatPricePKR(quarterlyInstallment) : 'Standard Head Office'}
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-center">
            <div className="text-[8px] font-bold text-slate-400 uppercase">On Handover</div>
            <div className="text-xs font-black text-white mt-0.5">
              {property.possession_payment
                ? formatPricePKR(property.possession_payment)
                : 'On Final Possession'}
            </div>
          </div>
        </div>
      </div>

      {/* 6. CITI HOUSING PHASE II AMENITIES & INFRASTRUCTURE */}
      <div className="space-y-1 print-avoid-break">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-600" />
            <span>Citi Housing World-Class Infrastructure &amp; Features</span>
          </h3>
          <span className="text-[8.5px] font-bold text-emerald-700">100% On-Ground Development</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-[9px] text-slate-700">
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded border border-slate-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">24/7 Gated Security</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded border border-slate-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Underground Electricity</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded border border-slate-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Glow Park &amp; Zoo</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded border border-slate-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Central Jamia Masjid</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded border border-slate-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">80ft &amp; 100ft Boulevards</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded border border-slate-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Sui Gas &amp; Sweet Water</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded border border-slate-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Commercial Broadway</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded border border-slate-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">School &amp; Healthcare</span>
          </div>
        </div>
      </div>

      {/* 7. PROPERTY OVERVIEW / INVESTMENT SUMMARY */}
      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[9.5px] text-slate-700 leading-snug print-avoid-break">
        <span className="font-black text-slate-900 uppercase text-[9px] tracking-wide mr-1.5">
          Overview &amp; Investment Summary:
        </span>
        <span className="text-slate-600 line-clamp-2">
          {property.description ||
            `Prime investment opportunity in Citi Housing Phase II Samundri Road, Faisalabad. 100% verified plot/property with swift direct biometric transfer at Citi Housing Head Office. Excellent capital appreciation potential.`}
        </span>
      </div>

      {/* 8. OFFICIAL VERIFICATION SEAL, SIGNATURE & LEGAL FOOTER */}
      <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3 items-center print-avoid-break">
        {/* Left: Online Verification Notice */}
        <div className="space-y-0.5">
          <div className="font-black text-slate-900 flex items-center gap-1 text-[9.5px]">
            <Globe className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Official Web Portal: citisproperty.com</span>
          </div>
          <p className="text-[8.5px] text-slate-500 leading-tight">
            Directly authorized dealer for Citi Housing Phase II Samundri Road Faisalabad. All transfers and biometric verifications executed transparently at Citi Housing Head Office.
          </p>
        </div>

        {/* Right: Dealership Endorsement & Signature Stamp */}
        <div className="p-1.5 rounded-lg border border-dashed border-amber-500 bg-amber-50/50 text-right space-y-0.5">
          <div className="text-[8.5px] font-black text-amber-800 uppercase tracking-wider">
            PROPERTY BANK REAL ESTATE CONSULTANCY
          </div>
          <div className="text-[10px] font-black text-slate-950">
            Verified by: ASIF SADIQ &bull; 0302-8658450
          </div>
          <div className="text-[8px] text-slate-400 italic">
            Authorized Dealer Official Signature &amp; Stamp
          </div>
        </div>
      </div>
    </div>
  );

  // If used as interactive modal preview on web screen:
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl my-8">
          {/* Top Control Bar (Hidden when printed) */}
          <div className="no-print bg-slate-900 text-white px-5 py-3 rounded-t-2xl flex items-center justify-between border-b border-slate-800 shadow-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-xs sm:text-sm">
                Official A4 Property Brochure &bull; {property.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Close
                </button>
              )}
            </div>
          </div>

          {/* Printable Document Body */}
          <div className="max-h-[85vh] overflow-y-auto bg-slate-200 p-2 sm:p-5 rounded-b-2xl">
            {brochureContent}
          </div>
        </div>
      </div>
    );
  }

  // Standalone printable document
  return brochureContent;
}
