'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  ShieldCheck,
  Star,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from '@/lib/db';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getSiteSettings().then(setSettings);
    const handleUpdate = () => getSiteSettings().then(setSettings);
    window.addEventListener('pb_settings_updated', handleUpdate);
    return () => window.removeEventListener('pb_settings_updated', handleUpdate);
  }, []);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* Column 1: Company Profile & Seal */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings.logo_url || '/images/logo.png'}
                alt="City Housing Seal Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="text-white font-extrabold text-base tracking-wide">
                  PROPERTY BANK
                </h3>
                <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  Real Estate Consultancy
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Authorised Dealer for Citi Housing (Pvt) Ltd. Providing transparent property consultancy, residential & commercial plot sales, and 2-year installment plans in Faisalabad.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Authorized Agency
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Properties & Plots
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/properties/?type=Plot"
                  className="hover:text-amber-400 transition"
                >
                  Residential Plots (5, 7, 10 Marla & 1 Kanal)
                </Link>
              </li>
              <li>
                <Link
                  href="/properties/?type=Commercial"
                  className="hover:text-amber-400 transition"
                >
                  Commercial Plots & Plazas
                </Link>
              </li>
              <li>
                <Link
                  href="/properties/?type=House"
                  className="hover:text-amber-400 transition"
                >
                  Brand New Houses & Villas
                </Link>
              </li>
              <li>
                <Link
                  href="/properties/?purpose=Installment"
                  className="hover:text-amber-400 transition"
                >
                  2-Year Installment Payment Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/plot-finder/"
                  className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Interactive Plot Finder</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <a
                  href="/maps/citi-housing-phase2-master-plan.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition flex items-center gap-1"
                >
                  <span>Download Master Plan (PDF)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Authorized Dealers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Office & Contacts
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <a
                    href={`tel:${settings.phone}`}
                    className="hover:text-amber-400 font-medium"
                  >
                    Asif Sadiq: {settings.phone}
                  </a>
                  <br />
                  <a
                    href={`tel:${settings.phone_secondary}`}
                    className="hover:text-amber-400 font-medium text-slate-400"
                  >
                    Rana Adnan: {settings.phone_secondary}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  WhatsApp: +{settings.whatsapp}
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Verified Profiles & Social */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Feedback & Location
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href={settings.google_reviews_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-xs font-medium text-white">
                    Google Review
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </a>

              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition group"
              >
                <span className="text-xs font-medium text-white">
                  Find on Google Maps
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </a>

              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition group"
              >
                <span className="text-xs font-medium text-white">
                  Official Facebook Page
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-5 sm:pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] sm:text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Property Bank Real Estate. All rights reserved. citisproperty.com
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy/" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms-and-conditions/" className="hover:text-slate-300">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link
              href="/admin/"
              prefetch={false}
              className="flex items-center gap-1 hover:text-amber-400 text-slate-400"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
