'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search, Building2 } from 'lucide-react';
import PropertyDetailClient from './properties/[slug]/PropertyDetailClient';

export default function NotFound() {
  const [dynamicSlug, setDynamicSlug] = useState<string | null>(null);
  const [checkingRoute, setCheckingRoute] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      // Check if URL is like /properties/<slug> or /properties/<slug>/
      const match = pathname.match(/^\/properties\/([^\/]+)\/?$/);
      if (match && match[1]) {
        const potentialSlug = decodeURIComponent(match[1]).trim();
        // Ignore static subpaths if any
        if (potentialSlug && potentialSlug !== 'properties') {
          setDynamicSlug(potentialSlug);
          setCheckingRoute(false);
          return;
        }
      }
    }
    setCheckingRoute(false);
  }, []);

  // If this is a dynamic property detail route added to Cloud Database after static export build
  if (dynamicSlug) {
    return <PropertyDetailClient slug={dynamicSlug} />;
  }

  // Brief check while inspecting route on client hydration
  if (checkingRoute) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Standard Branded 404 Page
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-950 text-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Building2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Error 404 &bull; Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Lost Your Way?
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page or property listing you are looking for may have been moved, updated, or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-lg active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/properties/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs transition active:scale-95"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>Browse Properties</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
