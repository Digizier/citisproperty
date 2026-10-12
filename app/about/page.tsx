import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle,
  Award,
  Users,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold border border-amber-300">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>AUTHORISED DEALER • CITI HOUSING (PVT) LTD</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Property Bank Real Estate
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          پلاٹ سے مکان تک — Setting the gold standard for property consultancy, plot purchases, and luxury living in Citi Housing Faisalabad.
        </p>
      </div>

      {/* Main Story & Agency Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900">
            About Our Consultancy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Property Bank Real Estate is an officially authorized dealership for Citi Housing (Pvt) Ltd, strategically located at <strong>11- AA Main Commercial Market</strong>, Citi Housing Phase II, Samundri Road, Faisalabad.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Led by seasoned real estate consultants <strong>Asif Sadiq</strong> and <strong>Rana Adnan</strong>, we specialize in residential plots (5, 7, 10 Marla and 1 Kanal), commercial plots, designer houses, and verified 2-year easy installment files.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Direct Society Verification</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-100">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>100% Registry & Inteqal Safe</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-100">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>40% Down Payment Plans</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-100">
              <Users className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Transparent Investor Guidance</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl text-white text-center space-y-4 border border-amber-500/20">
          <img
            src="/images/logo.png"
            alt="City Housing Seal Logo"
            className="w-24 h-24 object-contain"
          />
          <div>
            <h3 className="font-extrabold text-lg text-amber-400">
              CITY HOUSING (PVT) LTD
            </h3>
            <p className="text-xs text-slate-400">Official Dealership Seal</p>
          </div>
          <p className="text-xs text-slate-300">
            Head Office: 11-AA Main Commercial Market, Citi Housing Samundri Road, Faisalabad
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="tel:03028658450"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition"
            >
              Call 0302-8658450
            </a>
            <a
              href="https://wa.me/923028658450"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
