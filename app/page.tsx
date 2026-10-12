'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Compass,
  Download,
  Building2,
  Home,
  ShieldCheck,
  CheckCircle,
  Phone,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Star,
  RotateCcw,
  FileText,
} from 'lucide-react';
import {
  getBanners,
  getProperties,
  getSiteSettings,
  Banner,
  Property,
  SiteSettings,
  DEFAULT_SETTINGS,
} from '@/lib/db';
import PropertyCard from '@/components/PropertyCard';
import { GridSkeleton } from '@/components/ShimmerSkeleton';
import ZameenSearchWidget from '@/components/ZameenSearchWidget';

export default function HomePage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // 1. Fetch site settings
    getSiteSettings().then(setSettings);

    // 2. Fetch banners
    getBanners().then((data) => {
      if (data && data.length > 0) setBanners(data);
    });

    // 3. Fetch properties from Properties Manager
    getProperties({ limit: 50 }).then((res) => {
      setAllProperties(res.properties);
      setLoadingProperties(false);
    });

    // Realtime / Cross-tab update listener
    const handleUpdate = () => {
      getProperties({ limit: 50 }).then((res) => {
        setAllProperties(res.properties);
      });
      getBanners().then((data) => {
        if (data && data.length > 0) setBanners(data);
      });
    };
    window.addEventListener('pb_properties_updated', handleUpdate);
    window.addEventListener('pb_banners_updated', handleUpdate);
    return () => {
      window.removeEventListener('pb_properties_updated', handleUpdate);
      window.removeEventListener('pb_banners_updated', handleUpdate);
    };
  }, []);

  // Categorized latest listings directly from Properties Manager
  const buyProperties = useMemo(() => {
    return allProperties.filter((p) => p.purpose === 'Buy' || p.purpose === 'Sale');
  }, [allProperties]);

  const rentProperties = useMemo(() => {
    return allProperties.filter((p) => p.purpose === 'Rent');
  }, [allProperties]);

  const installmentProperties = useMemo(() => {
    return allProperties.filter(
      (p) =>
        p.purpose === 'Installment' ||
        p.purpose === '2-Year Installment' ||
        p.purpose === '2-Yr Installment'
    );
  }, [allProperties]);

  const activeBanner = banners[activeBannerIndex] || {
    title: settings.hero_title,
    subtitle: settings.hero_subtitle,
    cta_label: 'View Payment Plans',
    cta_link: '/properties/?type=Plot',
    image_desktop_url: settings.banner_url || '/images/hero-banner.png',
  };

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20 pb-20">
      {/* ======================================================== */}
      {/* 1. UNIFIED HIGH-IMPACT HERO & SEARCH ENGINE SECTION      */}
      {/* Background Banner is Sharp & Fully Visible (No Dim Mask)  */}
      {/* ======================================================== */}
      <section className="relative w-full bg-slate-950 text-white pt-6 sm:pt-10 lg:pt-12 pb-14 sm:pb-20 lg:pb-28">
        {/* Ambient Real Estate Graphic Background: Crisp, Vivid & Anchored to show full right side */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={activeBanner.image_desktop_url}
            alt={activeBanner.title || 'Property Bank Citi Housing Faisalabad'}
            className="w-full h-full object-cover object-center sm:object-[88%_center] opacity-90 scale-100 transition-opacity duration-700"
          />
          {/* Subtle balanced gradient overlay keeping banner entrance clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/50 to-slate-950/90 sm:from-slate-950/60 sm:via-slate-950/20 sm:to-slate-950/80" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          {/* Headline & Credibility Header */}
          <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/90 border border-amber-400/30 text-amber-300 text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate sm:overflow-visible">
                Authorized Dealership • Citi Housing Phase II<span className="hidden sm:inline"> Samundri Road</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Find Your Dream Property in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                Pakistan
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed font-semibold drop-shadow-sm px-2">
              Search verified residential plots, commercial spaces, and 2-year easy installment plans
              directly through Property Bank Real Estate.
            </p>

            {/* Quick Credibility Stats Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 pt-0.5 sm:pt-1 text-[10px] sm:text-xs text-slate-100 font-bold">
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/20 backdrop-blur-md shadow-xs">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span>40% Down Payment</span>
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/20 backdrop-blur-md shadow-xs">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                <span>100% Verified Files</span>
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/20 backdrop-blur-md shadow-xs">
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span>Phase II Samundri Road</span>
              </span>
            </div>

            {/* Banner Dots Switcher (if multiple banners active) */}
            {banners.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveBannerIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeBannerIndex === idx
                        ? 'w-6 bg-amber-400'
                        : 'w-2 bg-white/40 hover:bg-white/80'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Unified Nested Zameen Search Widget (Dynamic & Connected Live!) */}
          <div className="pt-1 sm:pt-4">
            <ZameenSearchWidget />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. OFFICIAL CITIS HOUSING & PROPERTY BANK AUTHORIZATION  */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-4 sm:p-8 md:p-10 shadow-2xl border border-amber-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
                  Authorised Agency • Citi Housing Samundri Road
                </span>
              </div>

              <div className="space-y-1">
                <div className="font-urdu text-xl sm:text-3xl text-amber-300 font-bold tracking-normal">
                  پلاٹ سے مکان تک
                </div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Your Trusted Partner In Real Estate Consultancy
                </h2>
              </div>

              <p className="text-[11px] sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Property Bank Real Estate is the premier authorized consultancy operating directly from{' '}
                <strong className="text-white font-semibold">11- AA Main Commercial Market</strong>, Citi Housing Phase II Samundri Road, Faisalabad. 
                Led by <strong className="text-amber-400 font-semibold">Asif Sadiq</strong> and <strong className="text-amber-400 font-semibold">Rana Adnan</strong>, 
                we ensure verified file transfers, registry/inteqal transparency, and flexible 2-year installment options.
              </p>

              {/* Responsive 3-Column Compact Stats Row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-center">
                  <div className="text-amber-400 font-black text-base sm:text-2xl">40%</div>
                  <div className="text-[9px] sm:text-xs text-slate-300 font-medium leading-tight">Down Payment</div>
                </div>
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-center">
                  <div className="text-amber-400 font-black text-base sm:text-2xl">2 Years</div>
                  <div className="text-[9px] sm:text-xs text-slate-300 font-medium leading-tight">Installment Plan</div>
                </div>
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-center">
                  <div className="text-emerald-400 font-black text-base sm:text-2xl">100%</div>
                  <div className="text-[9px] sm:text-xs text-slate-300 font-medium leading-tight">Verified Files</div>
                </div>
              </div>
            </div>

            {/* Action Buttons: 2-Columns on Mobile, Full-Stack on Desktop */}
            <div className="lg:col-span-4 flex flex-col gap-2 sm:gap-3 justify-center w-full">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 w-full">
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 sm:py-3.5 px-3 sm:px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition w-full text-center"
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Call Asif ({settings.phone})</span>
                </a>

                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 sm:py-3.5 px-3 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition w-full text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <a
                href="/maps/citi-housing-phase2-master-plan.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 sm:py-3 px-3 sm:px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-[11px] sm:text-xs transition w-full"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="truncate">Download Master Plan (PDF)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. CATEGORIZED PROPERTY LISTINGS (DIRECT FROM MANAGER)   */}
      {/* ======================================================== */}
      <div id="properties-section" className="space-y-14 sm:space-y-16">
        {/* --- SECTION 3A: PROPERTIES FOR SALE (BUY) --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Exclusive Ownership</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Properties for Sale (Buy)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Verified houses, commercial plots, and residential plots available for immediate purchase.
              </p>
            </div>

            <Link
              href="/properties/?purpose=Buy"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs sm:text-sm font-bold text-amber-800 transition border border-amber-200/80 shrink-0 w-fit"
            >
              <span>View All Buy Properties ({buyProperties.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProperties ? (
            <GridSkeleton count={4} />
          ) : buyProperties.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No properties currently listed for Sale (Buy).</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {buyProperties.slice(0, 6).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  href="/properties/?purpose=Buy"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition group"
                >
                  <span>View All Properties for Sale ({buyProperties.length})</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* --- SECTION 3B: PROPERTIES FOR RENT --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                <Home className="w-3.5 h-3.5" />
                <span>Prime Rental Spaces</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Properties for Rent
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Luxury apartments, modern houses, and commercial units available for monthly lease.
              </p>
            </div>

            <Link
              href="/properties/?purpose=Rent"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs sm:text-sm font-bold text-emerald-800 transition border border-emerald-200/80 shrink-0 w-fit"
            >
              <span>View All Rental Properties ({rentProperties.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProperties ? (
            <GridSkeleton count={3} />
          ) : rentProperties.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
              <Home className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No properties currently listed for Rent.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {rentProperties.slice(0, 6).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  href="/properties/?purpose=Rent"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition group"
                >
                  <span>View All Rental Properties ({rentProperties.length})</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* --- SECTION 3C: 2-YEAR EASY INSTALLMENT PLOTS & PROJECTS --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Flexible 24-Month Payment Plans</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                2-Year Installment Plots &amp; Projects
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Book with 40% down payment and pay convenient quarterly installments in Citi Housing Phase II.
              </p>
            </div>

            <Link
              href="/properties/?purpose=Installment"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs sm:text-sm font-bold text-blue-800 transition border border-blue-200/80 shrink-0 w-fit"
            >
              <span>View All Installment Plans ({installmentProperties.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProperties ? (
            <GridSkeleton count={3} />
          ) : installmentProperties.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No installment plots currently listed.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {installmentProperties.slice(0, 6).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  href="/properties/?purpose=Installment"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition group"
                >
                  <span>View All 2-Year Installment Plans ({installmentProperties.length})</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ======================================================== */}
      {/* 4. OFFICIAL SOCIETY MAPS & BLUEPRINT DOWNLOADS (PDF)      */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-4 sm:p-8 md:p-10 border border-slate-800 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs font-bold">
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Official Blueprint Downloads
              </span>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Official Society Maps &amp; Plot Blueprints (PDF)
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Download verified high-definition master plans, plot maps, and sector blueprints for <strong>Citi Housing Phase II Samundri Road</strong> and leading housing projects. Download printable vector PDFs directly or inspect online before visiting our office.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                <Link
                  href="/plot-finder/"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Browse All PDF Maps</span>
                </Link>

                <a
                  href="/maps/property-bank-master-plan.pdf"
                  download
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Download Master Map (PDF)</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-slate-950 group">
                <img
                  src="/maps/citi-housing-master-plan-hd.webp"
                  alt="Citi Housing Samundri Road Blueprint Plan"
                  className="w-full h-44 sm:h-64 object-cover object-top transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-400 bg-slate-950/80 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    Phase II Samundri Road, Faisalabad
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. WHY CHOOSE PROPERTY BANK REAL ESTATE                  */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Professional Real Estate Consultancy
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Property Bank Real Estate?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dedicated authorized dealership ensuring security, transparency, and top capital appreciation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Authorized Citi Housing Dealer
            </h3>
            <p className="text-xs leading-relaxed text-slate-500">
              Official dealership stamp and physical office right in 11-AA Main Commercial Market. Direct file verification with society management.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Flexible 2-Year Installments
            </h3>
            <p className="text-xs leading-relaxed text-slate-500">
              Book your dream residential or commercial plot with just 40% down payment and pay the balance in manageable 2-year installments.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Transparent Pricing &amp; Zero Hidden Fees
            </h3>
            <p className="text-xs leading-relaxed text-slate-500">
              Direct consultation with Asif Sadiq &amp; Rana Adnan. Instant WhatsApp brochures, clear token/bayana tracking, and verified registry assistance.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. FLOATING WHATSAPP CTA BUTTON                          */}
      {/* ======================================================== */}
      <a
        href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
          'Assalam-o-Alaikum, I am inquiring from citisproperty.com. Please share current plot rates in Citi Housing Samundri Road.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 p-3.5 sm:p-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl flex items-center gap-2 hover:scale-105 transition-all group cursor-pointer"
        aria-label="Direct WhatsApp Contact"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="hidden sm:inline-block font-extrabold text-xs pr-1">
          WhatsApp Inquiry
        </span>
      </a>
    </div>
  );
}
