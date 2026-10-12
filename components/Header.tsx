'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Phone,
  MessageSquare,
  Menu,
  X,
  Compass,
  ChevronDown,
  Building2,
  Home as HomeIcon,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from '@/lib/db';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [propertiesDropdownOpen, setPropertiesDropdownOpen] = useState(false);
  const [mobilePropertiesExpanded, setMobilePropertiesExpanded] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);

    const handleSettingsUpdate = () => {
      getSiteSettings().then(setSettings);
    };

    window.addEventListener('pb_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('pb_settings_updated', handleSettingsUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPropertiesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on window scroll
  useEffect(() => {
    const handleScroll = () => {
      if (propertiesDropdownOpen) setPropertiesDropdownOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [propertiesDropdownOpen]);

  // Handle Escape key for both desktop dropdown and mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPropertiesDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll and mark modal-open when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('modal-open');
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = orig;
      };
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [mobileMenuOpen]);

  const whatsappUrl = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    'Assalam-o-Alaikum, I am contacting you from citisproperty.com. Please share available plot listings and rates.'
  )}`;

  const propertySubLinks = [
    { name: 'All Listings', href: '/properties/', desc: 'Browse complete inventory' },
    { name: 'Residential Plots', href: '/properties/?type=Plot', desc: '5, 7, 10 Marla & 1 Kanal' },
    { name: 'Commercial Plots', href: '/properties/?type=Commercial', desc: 'Main Boulevard & Markets' },
    { name: 'Houses & Villas', href: '/properties/?type=House', desc: 'Modern turnkey living' },
    { name: '2-Year Installments', href: '/properties/?purpose=Installment', desc: '40% down payment files' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      {/* 1. TOP UTILITY & ASSURANCE BAR */}
      <div className="bg-slate-950 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-extrabold text-amber-400 shrink-0">Official Dealer:</span>
            <span className="truncate text-slate-300">
              <span className="hidden sm:inline">Citi Housing (Phase II) </span>Samundri Rd, Faisalabad
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-slate-300">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 transition text-[11px] sm:text-xs"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>{settings.phone}</span>
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 hover:text-emerald-400 text-emerald-400 font-bold transition text-[11px] sm:text-xs"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN 3-ZONE NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 xl:gap-4">
          {/* ZONE 1 (LEFT): BRAND IDENTITY & LOGO */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 transition-transform group-hover:scale-105">
              <img
                src={settings.logo_url || '/images/logo.png'}
                alt="Property Bank Real Estate Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg xl:text-xl tracking-tight text-slate-900 leading-none">
                PROPERTY BANK
              </span>
              <span className="text-[9px] sm:text-[10px] xl:text-[11px] font-bold text-amber-700 tracking-wider uppercase mt-0.5">
                Real Estate Consultancy
              </span>
              <span className="text-[10px] text-slate-500 font-semibold hidden md:inline">
                Authorized Dealer • Citi Housing Phase II
              </span>
            </div>
          </Link>

          {/* ZONE 2 (CENTER): CLEAN 4-5 MAIN NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
            {/* 1. Home */}
            <Link
              href="/"
              className={`px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition ${
                pathname === '/'
                  ? 'text-amber-800 bg-amber-50 font-extrabold'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>

            {/* 2. Properties (with Dropdown Menu) */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setPropertiesDropdownOpen(true)}
              onMouseLeave={() => setPropertiesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setPropertiesDropdownOpen(!propertiesDropdownOpen)}
                aria-expanded={propertiesDropdownOpen}
                className={`flex items-center gap-1 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition ${
                  pathname.startsWith('/properties')
                    ? 'text-amber-800 bg-amber-50 font-extrabold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span>Properties</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    propertiesDropdownOpen ? 'rotate-180 text-amber-700' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Desktop Dropdown Popover */}
              {propertiesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 pt-2 z-50 animate-fadeIn">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1">
                    {propertySubLinks.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={() => setPropertiesDropdownOpen(false)}
                        className="flex flex-col px-3 py-2 rounded-xl hover:bg-slate-50 transition group"
                      >
                        <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                          {sub.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {sub.desc}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Plot Maps (PDF Downloads) */}
            <Link
              href="/plot-finder/"
              className={`flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition ${
                pathname === '/plot-finder/' || pathname === '/plot-finder'
                  ? 'bg-amber-500/15 text-amber-900 border border-amber-300 font-extrabold'
                  : 'text-amber-800 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/60'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Plot Maps (PDF)</span>
              <span className="text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full shrink-0">
                PDF
              </span>
            </Link>

            {/* 4. About */}
            <Link
              href="/about/"
              className={`px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition ${
                pathname === '/about/' || pathname === '/about'
                  ? 'text-amber-800 bg-amber-50 font-extrabold'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              About
            </Link>

            {/* 5. Contact */}
            <Link
              href="/contact/"
              className={`px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition ${
                pathname === '/contact/' || pathname === '/contact'
                  ? 'text-amber-800 bg-amber-50 font-extrabold'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* ZONE 3 (RIGHT): HIGH-CONTRAST CALL TO ACTION (DESKTOP >= 1024px) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 px-3 xl:px-3.5 h-10 text-xs font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-2xs whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Call Us</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 xl:px-4 h-10 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-sm hover:shadow-md transition whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* MOBILE / TABLET TOGGLES (< 1024px) - Clean single WhatsApp button with zero duplicates */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Tablet Call pill (640px to 1023px) */}
            <a
              href={`tel:${settings.phone}`}
              className="hidden sm:flex items-center gap-1.5 px-3 h-10 text-xs font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-2xs whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Call</span>
            </a>

            {/* Mobile / Tablet WhatsApp CTA button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 h-10 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition whitespace-nowrap"
              aria-label="Direct WhatsApp Contact"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Universal Hamburger Toggle (<1024px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition border border-slate-200/80"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* 3. MOBILE SLIDE-OUT DRAWER WITH FULL OVERLAY */}
    {mobileMenuOpen && (
      <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div className="relative z-10 w-[88vw] max-w-sm h-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 overflow-y-auto">
            {/* Drawer Top Header */}
            <div>
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src={settings.logo_url || '/images/logo.png'}
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 leading-none">
                      PROPERTY BANK
                    </div>
                    <div className="text-[10px] text-amber-700 font-bold uppercase mt-0.5">
                      Citi Housing Dealer
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-1.5">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 h-12 rounded-xl text-sm font-bold transition ${
                    pathname === '/'
                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Home</span>
                  <ArrowRight className="w-4 h-4 opacity-40" />
                </Link>

                {/* Collapsible Properties Group */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setMobilePropertiesExpanded(!mobilePropertiesExpanded)}
                    className="flex items-center justify-between w-full px-3.5 h-12 text-sm font-bold text-slate-800 hover:bg-slate-100 transition"
                  >
                    <span>Properties</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobilePropertiesExpanded ? 'rotate-180 text-amber-700' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {mobilePropertiesExpanded && (
                    <div className="px-2 pb-2 space-y-1">
                      {propertySubLinks.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                            pathname === sub.href
                              ? 'bg-amber-500/20 text-amber-900'
                              : 'text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate">
                              {sub.desc}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plot Maps (PDF Downloads) */}
                <Link
                  href="/plot-finder/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 h-12 rounded-xl text-sm font-bold transition ${
                    pathname.startsWith('/plot-finder')
                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">Plot Maps (PDF)</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shrink-0">
                    PDF
                  </span>
                </Link>

                <Link
                  href="/about/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 h-12 rounded-xl text-sm font-bold transition ${
                    pathname === '/about/' || pathname === '/about'
                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>About Us</span>
                  <ArrowRight className="w-4 h-4 opacity-40" />
                </Link>

                <Link
                  href="/contact/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 h-12 rounded-xl text-sm font-bold transition ${
                    pathname === '/contact/' || pathname === '/contact'
                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Contact Agency</span>
                  <ArrowRight className="w-4 h-4 opacity-40" />
                </Link>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2.5">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-slate-950 text-white font-extrabold text-xs transition shadow-xs"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call: {settings.phone}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <div className="pt-2 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  11-AA Main Commercial Market, Citi Housing Phase II
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
