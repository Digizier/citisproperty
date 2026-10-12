'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Phone,
  MessageSquare,
  MapPin,
  Maximize2,
  Bed,
  Bath,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Building,
  Calendar,
} from 'lucide-react';
import { Property, SiteSettings, DEFAULT_SETTINGS, getSiteSettings } from '@/lib/db';
import { formatPricePKR } from './PropertyCard';

interface QuickViewContextType {
  activeProperty: Property | null;
  openQuickView: (property: Property) => void;
  closeQuickView: () => void;
  isOpen: boolean;
}

const QuickViewContext = createContext<QuickViewContextType>({
  activeProperty: null,
  openQuickView: () => {},
  closeQuickView: () => {},
  isOpen: false,
});

export const usePropertyQuickView = () => useContext(QuickViewContext);

export function PropertyQuickViewProvider({ children }: { children: React.ReactNode }) {
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickView = (property: Property) => {
    setActiveProperty(property);
    setIsOpen(true);
  };

  const closeQuickView = () => {
    setIsOpen(false);
  };

  return (
    <QuickViewContext.Provider
      value={{ activeProperty, openQuickView, closeQuickView, isOpen }}
    >
      {children}
      <PropertyDetailDrawer
        property={activeProperty}
        isOpen={isOpen}
        onClose={closeQuickView}
      />
    </QuickViewContext.Provider>
  );
}

export function PropertyDetailDrawer({
  property,
  isOpen,
  onClose,
}: {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState<string>('');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(40);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (property) {
      setActiveImage(property.thumbnail_url || '/images/hero-banner.png');
    }
  }, [property]);

  // Lock body scroll and mark modal-open when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const formattedPrice = formatPricePKR(property.price);
  const downPaymentAmount =
    property.down_payment ||
    (property.price > 0 ? Math.round((property.price * downPaymentPct) / 100) : 0);
  const balanceAmount = Math.max(0, property.price - downPaymentAmount);
  const quarterlyInstallment = balanceAmount > 0 ? Math.round(balanceAmount / 8) : 0;

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I am inquiring about this property from citisproperty.com:\n\n*${property.title}*\nPrice: ${formattedPrice}\nLocation: ${property.address}\n\nPlease share booking details and availability.`
  );
  const whatsappUrl = `https://wa.me/${property.contact_whatsapp || settings.whatsapp}?text=${whatsappMessage}`;
  const phoneUrl = `tel:${property.contact_phone || settings.phone}`;

  const allImages = [
    property.thumbnail_url || '/images/hero-banner.png',
    ...(property.gallery_urls || []),
  ].filter(Boolean);

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

  const amenityBadges = (property.features || []).filter((f) => !f.includes(':'));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed & Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container:
          - Desktop (sm+): Right slide-out split panel (width max-w-xl md:max-w-2xl)
          - Mobile (<sm): Modern bottom sheet modal (max-h-[88vh] rounded-t-3xl)
      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative z-10 w-full sm:max-w-xl md:max-w-2xl h-[88vh] sm:h-full mt-auto sm:mt-0 bg-white rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col border-t sm:border-t-0 sm:border-l border-slate-200 overflow-hidden animate-slideUp sm:animate-slideLeft"
      >
        {/* Mobile Swipe / Pull indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 min-w-0 mr-2">
            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-900 text-xs font-extrabold px-2.5 py-1 rounded-full border border-amber-300/60 shrink-0">
              {property.purpose}
            </span>
            <span className="text-xs font-bold text-slate-600 truncate">
              {property.property_type} • Citi Phase II
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/properties/${property.slug}/`}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-amber-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {/* Main Visual Image & Thumbnails */}
          <div className="space-y-3">
            <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-sm group">
              <img
                src={activeImage}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />

              {/* Floating Status Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                {property.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Listing
                  </span>
                )}
                {property.purpose === 'Installment' && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/95 text-slate-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    2-Yr Installment
                  </span>
                )}
              </div>

              {/* Dealership Status Pill */}
              <div className="absolute bottom-3 right-3 z-10">
                <span className="bg-slate-950/80 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                  {property.status}
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails (if > 1) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                      activeImage === img
                        ? 'border-amber-500 scale-95 shadow-xs'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Location */}
          <div className="space-y-1.5">
            <h2
              id="drawer-title"
              className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug"
            >
              {property.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{property.address}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Demand Price
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-0.5">
                {formattedPrice}
              </div>
            </div>

            {property.purpose === 'Installment' && (
              <div className="bg-white px-3 py-2 rounded-xl border border-amber-200 shadow-2xs text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">
                  40% Down Payment
                </span>
                <span className="text-sm font-extrabold text-amber-900">
                  {formatPricePKR(downPaymentAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Area Size</span>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {property.area_value} {property.area_unit}
                </span>
              </div>
            </div>

            {property.bedrooms && property.bedrooms > 0 ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Bedrooms</span>
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Bed className="w-3.5 h-3.5 text-amber-600" />
                  <span>{property.bedrooms} Beds</span>
                </div>
              </div>
            ) : null}

            {property.bathrooms && property.bathrooms > 0 ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Washrooms</span>
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Bath className="w-3.5 h-3.5 text-amber-600" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              </div>
            ) : null}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Transfer Status</span>
              <div className="text-sm font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="truncate">{property.status}</span>
              </div>
            </div>
          </div>

          {/* 2-Year Installment Breakdown (for Installment properties) */}
          {property.purpose === 'Installment' && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-extrabold text-slate-900">
                    2-Year Flexible Installment Plan
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  8 Quarterly Payments
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Down Payment</span>
                  <span className="font-extrabold text-slate-900">
                    {formatPricePKR(downPaymentAmount)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Quarterly (x8)</span>
                  <span className="font-extrabold text-slate-900">
                    {formatPricePKR(quarterlyInstallment)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description Snippet */}
          {property.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Overview & Details
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
                {property.description}
              </p>
            </div>
          )}

          {/* Custom Specifications in Drawer */}
          {customSpecs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Verified Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {customSpecs.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block truncate">{s.label}</span>
                    <span className="text-xs font-extrabold text-slate-900 block truncate">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Pills */}
          {amenityBadges.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Key Highlights
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {amenityBadges.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{f}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Authorized Agency Endorsement */}
          <div className="p-3.5 rounded-2xl bg-slate-950 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
              AS
            </div>
            <div className="text-xs min-w-0 flex-1">
              <div className="font-extrabold text-amber-400 truncate">
                {property.contact_person || 'Asif Sadiq'} • Property Bank
              </div>
              <div className="text-slate-300 text-[11px] truncate">
                11-AA Main Commercial Market, Citi Housing Phase II
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer (Compact, thumb-friendly 2-button horizontal bar) */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5 sticky bottom-0 z-20 shadow-lg">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>WhatsApp Inquiry</span>
          </a>

          <a
            href={phoneUrl}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs sm:text-sm transition shrink-0"
          >
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Call Agent</span>
          </a>
        </div>
      </div>
    </div>
  );
}
