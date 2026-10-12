import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="text-xs text-slate-400">Last updated: October 2026</p>

      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-slate-200">
        <h2 className="font-bold text-base text-slate-900">1. Information Collection</h2>
        <p>
          We collect your name, phone number, and WhatsApp contact details solely when you submit an inquiry form or contact us regarding a property listing or plot on citisproperty.com.
        </p>

        <h2 className="font-bold text-base text-slate-900">2. Use of Information</h2>
        <p>
          Your information is used strictly by our authorized consultants (Asif Sadiq & Rana Adnan) to answer your inquiries, arrange property site visits, and share requested brochures. We do not sell, rent, or distribute your private contact details to any third-party marketers.
        </p>

        <h2 className="font-bold text-base text-slate-900">3. Contact Us</h2>
        <p>
          If you have questions about your inquiry data, contact us via WhatsApp at +92 302 8658450 or at our head office: 11-AA Main Commercial Market, Citi Housing Samundri Road, Faisalabad.
        </p>
      </div>
    </div>
  );
}
