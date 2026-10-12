'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  MessageSquare,
  Phone,
  Printer,
  Share2,
  Sparkles,
  CheckCircle2,
  Download,
  Calendar,
  Building,
  Building2,
  ArrowLeft,
  Check,
  Calculator,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  getPropertyBySlug,
  getProperties,
  submitInquiry,
  getSiteSettings,
  Property,
  SiteSettings,
  DEFAULT_SETTINGS,
} from '@/lib/db';
import { formatPricePKR } from '@/components/PropertyCard';
import PropertyCard from '@/components/PropertyCard';
import PropertyBrochurePrint from '@/components/PropertyBrochurePrint';

export default function PropertyDetailClient({ slug }: { slug: string }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  // Installment Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(40);
  const [objectFitMode, setObjectFitMode] = useState<'cover' | 'contain'>('cover');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Inquiry Form State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  useEffect(() => {
    // Smart category fallback redirects
    if (slug === 'residential-plots') {
      window.location.href = '/properties/?type=Plot';
      return;
    }
    if (slug === 'commercial-plots') {
      window.location.href = '/properties/?type=Commercial';
      return;
    }
    if (slug === 'houses-villas') {
      window.location.href = '/properties/?type=House';
      return;
    }
    if (slug === 'installment-files') {
      window.location.href = '/properties/?purpose=Installment';
      return;
    }

    getSiteSettings().then(setSettings);

    getPropertyBySlug(slug).then((data) => {
      if (data) {
        setProperty(data);
        setActiveImage(data.thumbnail_url || '/images/hero-banner.png');

        // Fetch similar properties
        getProperties({ propertyType: data.property_type, limit: 4 }).then((res) => {
          setSimilarProperties(res.properties.filter((p) => p.id !== data.id));
        });
      }
      setLoading(false);
    });
  }, [slug]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;

    setInquirySubmitting(true);
    const success = await submitInquiry({
      name: leadName,
      phone: leadPhone,
      whatsapp: leadPhone,
      property_id: property?.id,
      intent: property?.purpose === 'Installment' ? 'Installment' : 'Buy',
      message: leadMessage || `Inquiry for ${property?.title}`,
      status: 'New',
    });

    setInquirySubmitting(false);
    if (success) {
      setInquirySubmitted(true);
      setLeadName('');
      setLeadPhone('');
      setLeadMessage('');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-slate-600">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Property Not Found</h2>
        <p className="text-sm text-slate-500">
          The property listing you requested may have been sold or moved.
        </p>
        <Link
          href="/properties/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Available Listings</span>
        </Link>
      </div>
    );
  }

  const formattedPrice = formatPricePKR(property.price);
  const formattedDownPayment = property.down_payment
    ? formatPricePKR(property.down_payment)
    : null;
  const formattedPossession = property.possession_payment
    ? formatPricePKR(property.possession_payment)
    : null;

  // Dynamic Installment Calculation
  const calculatedDownPayment = Math.round((property.price * downPaymentPercent) / 100);
  const calculatedRemaining = property.price - calculatedDownPayment;
  const calculatedQuarterly = Math.round(calculatedRemaining / 8);
  const calculatedMonthly = Math.round(calculatedRemaining / 24);

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I am inquiring about:\n\n*${property.title}*\nPrice: ${formattedPrice}\nLocation: ${property.address}\n\nPlease share booking procedure & installment schedule.`
  );
  const whatsappUrl = `https://wa.me/${property.contact_whatsapp || settings.whatsapp}?text=${whatsappMessage}`;

  const calculatedWhatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum Asif Bhai, I am interested in booking:\n\n*${property.title}*\nTotal Price: ${formattedPrice}\n\n*Customized 2-Year Plan:* \n- Down Payment (${downPaymentPercent}%): ${formatPricePKR(calculatedDownPayment)}\n- 8 Quarterly Installments: ${formatPricePKR(calculatedQuarterly)} / quarter\n- Estimated Monthly: ${formatPricePKR(calculatedMonthly)} / month\n\nPlease confirm availability and booking procedure.`
  );
  const customWhatsappUrl = `https://wa.me/${property.contact_whatsapp || settings.whatsapp}?text=${calculatedWhatsappMessage}`;

  const allImages = Array.from(
    new Set([
      property.thumbnail_url || '/images/hero-banner.png',
      ...(property.gallery_urls || []),
    ])
  ).filter(Boolean);

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
    <>
      <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Lightbox Fullscreen Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="text-xs text-white/70 font-semibold">{property.title}</span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={activeImage}
              alt={property.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
          <div className="mt-4 flex items-center gap-2 overflow-x-auto max-w-md py-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  activeImage === img ? 'border-amber-400 scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Back Link & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <Link
          href="/properties/"
          className="inline-flex items-center gap-1.5 hover:text-amber-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBrochureModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-300/80 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs transition shadow-xs"
            title="Print Official A4 Brochure"
          >
            <Printer className="w-3.5 h-3.5 text-amber-700" />
            <span>Print Brochure</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Details + Contact Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery & Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Gallery Container */}
          <div className="space-y-3">
            <div className="relative w-full h-[320px] sm:h-[460px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md group">
              <img
                src={activeImage}
                alt={property.title}
                className={`w-full h-full transition duration-300 ${
                  objectFitMode === 'cover' ? 'object-cover' : 'object-contain'
                }`}
              />

              {/* View Control Buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setObjectFitMode((m) => (m === 'cover' ? 'contain' : 'cover'))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-bold backdrop-blur-xs border border-white/20 transition shadow-sm"
                  title="Toggle uncropped flyer view"
                >
                  {objectFitMode === 'cover' ? 'Fit Image (Full)' : 'Fill View'}
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs backdrop-blur-xs border border-white/20 transition shadow-sm"
                  title="Zoom Fullscreen"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {property.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Official Listing
                  </span>
                )}
                {property.purpose === 'Installment' && (
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    2-Year Installments Available
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      activeImage === img
                        ? 'border-amber-500 scale-95 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Title & Address */}
          <div className="space-y-2 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <span>{property.property_type}</span>
              <span>•</span>
              <span>{property.purpose}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{property.address}</span>
            </div>
          </div>

          {/* Key Specs Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Area</span>
              <div className="text-base font-extrabold text-slate-900 flex items-center gap-1">
                <Maximize2 className="w-4 h-4 text-amber-600" />
                <span>{property.area_value} {property.area_unit}</span>
              </div>
            </div>

            {property.bedrooms && property.bedrooms > 0 ? (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Bedrooms</span>
                <div className="text-base font-extrabold text-slate-900 flex items-center gap-1">
                  <Bed className="w-4 h-4 text-amber-600" />
                  <span>{property.bedrooms} Beds</span>
                </div>
              </div>
            ) : null}

            {property.bathrooms && property.bathrooms > 0 ? (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Washrooms</span>
                <div className="text-base font-extrabold text-slate-900 flex items-center gap-1">
                  <Bath className="w-4 h-4 text-amber-600" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              </div>
            ) : null}

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Dealership Status</span>
              <div className="text-base font-extrabold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{property.status}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Property Specifications & Highlights Matrix */}
          {customSpecs.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Property Specifications &amp; Highlights</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Verified Specifications
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {customSpecs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100/90 space-y-1 hover:border-amber-300 transition"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      {spec.label}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block truncate">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADVANCED 2-YEAR INSTALLMENT CALCULATOR (ZAMEEN STYLE) */}
          {(property.purpose === 'Installment' || (Boolean(property.down_payment) && property.down_payment! > 0 && property.installment_duration !== 'No Installment')) && (
            <div className="bg-white rounded-3xl p-6 border border-amber-300/80 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      2-Year Flexible Installment Calculator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Customize your down payment percentage to see your exact 8-quarterly schedule.
                    </p>
                  </div>
                </div>

                {/* Quick Percentage Chips */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {[30, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDownPaymentPercent(pct)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        downPaymentPercent === pct
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pct}% Down
                    </button>
                  ))}
                </div>
              </div>

              {/* Down Payment Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Down Payment Proportion:</span>
                  <span className="text-amber-700 font-extrabold">{downPaymentPercent}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>20% (Minimum)</span>
                  <span>40% (Citi Standard)</span>
                  <span>60% (Lower Installments)</span>
                </div>
              </div>

              {/* Calculated Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block">
                    Booking / Down Payment ({downPaymentPercent}%)
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-amber-950 mt-1">
                    {formatPricePKR(calculatedDownPayment)}
                  </div>
                  <span className="text-[10px] text-amber-700">Payable at initial file booking</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    8 Quarterly Installments
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    {formatPricePKR(calculatedQuarterly)}
                  </div>
                  <span className="text-[10px] text-slate-500">Every 3 months for 2 years</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Monthly Equivalent
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    {formatPricePKR(calculatedMonthly)}
                  </div>
                  <span className="text-[10px] text-slate-500">Estimated monthly budgeting</span>
                </div>
              </div>

              {/* WhatsApp CTA with pre-computed calculation */}
              <a
                href={customWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Inquire & Lock This {downPaymentPercent}% Installment Schedule on WhatsApp</span>
              </a>
            </div>
          )}

          {/* Detailed Description */}
          {property.description && property.description.trim() ? (
            <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-base text-slate-900">
                Property Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          ) : null}

          {/* Amenities & Features Checklist */}
          {amenityBadges.length > 0 && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-base text-slate-900">
                Key Features &amp; Amenities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenityBadges.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Contact Action Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          {/* Price & Primary Call-To-Action Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-5">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Asking Price</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {formattedPrice}
              </div>
              {formattedDownPayment && (
                <div className="text-xs text-amber-700 font-bold mt-1">
                  Down Payment: {formattedDownPayment} (40%)
                </div>
              )}
            </div>

            {/* Direct Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Instant WhatsApp Inquiry</span>
              </a>

              <a
                href={`tel:${property.contact_phone || settings.phone}`}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Agent: {property.contact_phone || settings.phone}</span>
              </a>
            </div>

            {/* Agent / Dealer Identification */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-700 font-extrabold flex items-center justify-center text-sm shrink-0 border border-amber-300">
                AS
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  {property.contact_person || 'Asif Sadiq'}
                </div>
                <div className="text-slate-500">Authorized Agent • Property Bank</div>
                <div className="text-amber-700 font-semibold mt-0.5">11-AA Main Commercial Market</div>
              </div>
            </div>
          </div>

          {/* Quick Direct Inquiry Form (Saves directly to Cloud Database) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Send Direct Message
            </h3>

            {inquirySubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Inquiry Received!</span>
                </div>
                <p>Asif Sadiq will call or WhatsApp you regarding this property shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Your Full Name *"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="Phone or WhatsApp Number *"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={leadMessage}
                    onChange={(e) => setLeadMessage(e.target.value)}
                    placeholder="Message (e.g. want to visit plot today)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={inquirySubmitting}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition shadow-sm disabled:opacity-50"
                >
                  {inquirySubmitting ? 'Sending...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <section className="pt-10 border-t border-slate-200 space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Similar Properties in Citi Housing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>

    {/* Interactive On-Screen Brochure Preview Modal */}
    {showBrochureModal && property && (
      <div className="no-print">
        <PropertyBrochurePrint
          property={property}
          isModal={true}
          onClose={() => setShowBrochureModal(false)}
        />
      </div>
    )}

    {/* Pure White Executive Print Document (Hidden on screen, Visible on Print) */}
    {property && (
      <div className="hidden print:block" id="print-root">
        <PropertyBrochurePrint property={property} isModal={false} />
      </div>
    )}
  </>
  );
}
