'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  Clock,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { submitInquiry } from '@/lib/db';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [intent, setIntent] = useState<'Buy' | 'Rent' | 'Installment'>('Buy');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    const success = await submitInquiry({
      name,
      phone,
      whatsapp: phone,
      intent,
      message,
      status: 'New',
    });

    setSubmitting(false);
    if (success) {
      setSubmitted(true);
      setName('');
      setPhone('');
      setMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Property Bank Real Estate
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have questions about plot availability, booking prices, or site visits in Citi Housing Samundri Road? Our authorized consultants are ready to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information & Channels (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Office & Dealer Contacts
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Head Office Location</div>
                  <div className="text-slate-600">
                    11- AA Main Commercial Market, Citi Housing (Phase II) Samundri Road, Faisalabad
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Direct Phone Numbers</div>
                  <div className="text-slate-600">
                    Asif Sadiq:{' '}
                    <a href="tel:03028658450" className="text-amber-700 font-bold hover:underline">
                      0302-8658450
                    </a>
                  </div>
                  <div className="text-slate-600">
                    Rana Adnan:{' '}
                    <a href="tel:03029892535" className="text-amber-700 font-bold hover:underline">
                      0302-9892535
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">WhatsApp Helpline</div>
                  <a
                    href="https://wa.me/923028658450"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    +92 302 8658450
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Consultancy Hours</div>
                  <div className="text-slate-600">
                    Monday to Sunday: 9:00 AM – 9:00 PM
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Map & Review Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="https://maps.app.goo.gl/Umc7Ci9kQZN1GwVo6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
              >
                <span>Navigate on Google Maps</span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>

              <a
                href="https://g.page/r/CWPTsi4M7yUMEBE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
              >
                <span>Post a Google Review</span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Send Us an Inquiry
          </h2>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-extrabold text-base">Message Sent Successfully!</h3>
              <p className="text-xs text-emerald-700">
                Thank you for contacting Property Bank Real Estate. Asif Sadiq will get in touch with you shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone or WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">I am interested in</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Buy', 'Installment', 'Rent'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIntent(opt)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition ${
                        intent === opt
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {opt === 'Installment' ? '2-Yr Installment' : opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Your Message or Query</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what size plot (5, 7, 10 Marla, 1 Kanal) or commercial requirement you have..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Submitting Message...' : 'Submit Contact Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
