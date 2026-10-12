'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Eye,
  Phone,
  Flame,
  Camera,
} from 'lucide-react';
import { Property } from '@/lib/types';
import { usePropertyQuickView } from './PropertyDetailDrawer';

export function formatPricePKR(amount: number): string {
  if (!amount || amount <= 0) return 'Price on Request';
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `PKR ${crore % 1 === 0 ? crore : crore.toFixed(2)} Crore`;
  }
  if (amount >= 100000) {
    const lac = amount / 100000;
    return `PKR ${lac % 1 === 0 ? lac : lac.toFixed(2)} Lac`;
  }
  return `PKR ${amount.toLocaleString()}`;
}

export default function PropertyCard({ property }: { property: Property }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { openQuickView } = usePropertyQuickView();

  const formattedPrice = formatPricePKR(property.price);
  const formattedDownPayment = property.down_payment
    ? formatPricePKR(property.down_payment)
    : null;

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I am interested in this property from citisproperty.com:\n\n*${property.title}*\nPrice: ${formattedPrice}\nLocation: ${property.address}\n\nPlease share further details & booking process.`
  );
  const whatsappUrl = `https://wa.me/${property.contact_whatsapp || '923028658450'}?text=${whatsappMessage}`;

  const handleDetailsClick = (e: React.MouseEvent) => {
    // If not a modified click (Ctrl/Cmd/middle click), open split-screen quick view
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      openQuickView(property);
    }
  };

  const imageSrc = property.thumbnail_url || '/images/hero-banner.png';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-amber-400 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-row sm:flex-col justify-between h-full">
      {/* 1. Property Image Container (Horizontal thumbnail on mobile, full-width on desktop) */}
      {/* Dual-layer rendering: blurred ambient backdrop + uncropped crisp foreground (ZERO SPLITTING / ZERO CROPPING) */}
      <div
        onClick={handleDetailsClick}
        className="w-36 xs:w-44 sm:w-full h-36 xs:h-40 sm:h-56 shrink-0 relative overflow-hidden bg-slate-950 cursor-pointer"
      >
        {/* Shimmer placeholder until image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer z-10" />
        )}

        {/* Layer 1: Ambient Blurred Backdrop so letterboxing is seamlessly color-matched */}
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-35 scale-125 pointer-events-none"
        />

        {/* Layer 2: 100% Fully Visible Crisp Image (Never sliced, never cut off) */}
        <img
          src={imageSrc}
          alt={property.title}
          onLoad={() => setImageLoaded(true)}
          className={`relative z-10 w-full h-full object-contain p-1 transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Floating Badges (Top Left) */}
        <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 flex flex-wrap gap-1 sm:gap-1.5 z-20">
          <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[9px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
            HOT
          </span>
          {property.is_verified && (
            <span className="inline-flex items-center gap-1 bg-emerald-600/95 text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden xs:inline">Verified</span>
            </span>
          )}
        </div>

        {/* Photo Count Indicator (Bottom Left) */}
        <div className="absolute bottom-1.5 sm:bottom-2.5 left-1.5 sm:left-2.5 z-20 flex items-center gap-1 bg-slate-950/80 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-xs">
          <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>{property.gallery_urls?.length ? property.gallery_urls.length + 1 : 3}</span>
        </div>

        {/* Property Type Pill (Bottom Right) */}
        <div className="absolute bottom-1.5 sm:bottom-2.5 right-1.5 sm:right-2.5 z-20">
          <span className="bg-slate-950/85 text-white text-[9px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-xs">
            {property.property_type}
          </span>
        </div>

        {/* Quick View Hover Indicator (Desktop) */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center pointer-events-none">
          <span className="bg-slate-950/85 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-xs shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* 2. Card Content (Zameen.com layout on mobile, spacious card on desktop) */}
      <div className="p-2.5 xs:p-3 sm:p-5 flex-1 flex flex-col justify-between min-w-0 space-y-2 sm:space-y-3">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          {/* Top Tag & Down Payment Info */}
          <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1 text-emerald-700 font-extrabold truncate">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 shrink-0 fill-red-500" />
              <span className="truncate">
                {property.purpose === 'Installment' ? '2-Yr Installment' : 'Direct Booking'}
              </span>
            </div>
            {property.purpose === 'Installment' && formattedDownPayment && (
              <span className="text-[9px] sm:text-[10px] text-amber-900 bg-amber-500/15 border border-amber-300/40 px-1.5 sm:px-2 py-0.5 rounded-md font-black shrink-0">
                40% Down
              </span>
            )}
          </div>

          {/* Prominent Price */}
          <div className="text-slate-950 font-black text-base xs:text-lg sm:text-2xl leading-tight tracking-tight">
            {formattedPrice}
          </div>

          {/* Title */}
          <Link
            href={`/properties/${property.slug}/`}
            onClick={handleDetailsClick}
            className="block text-slate-800 hover:text-amber-700 font-extrabold text-xs xs:text-sm sm:text-base line-clamp-1 sm:line-clamp-2 transition leading-snug"
          >
            {property.title}
          </Link>

          {/* Address / Location */}
          <div className="flex items-center gap-1 text-slate-500 text-[11px] sm:text-xs truncate pt-0.5">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>

          {/* Structural Specs Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-1 sm:pt-2 text-slate-600 text-[10px] xs:text-[11px] sm:text-xs font-semibold flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
              <Maximize2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" />
              <span>
                {property.area_value} {property.area_unit}
              </span>
            </div>

            {property.bedrooms && property.bedrooms > 0 ? (
              <div className="flex items-center gap-1 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                <Bed className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" />
                <span>{property.bedrooms} Bed</span>
              </div>
            ) : null}

            {property.bathrooms && property.bathrooms > 0 ? (
              <div className="flex items-center gap-1 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                <Bath className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" />
                <span>{property.bathrooms} Bath</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* 3. Action Buttons Row (Zameen 2-button layout on mobile, 3-button grid on desktop) */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center gap-2 sm:grid sm:grid-cols-3 sm:gap-2">
          {/* WhatsApp Primary Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:w-auto h-8 sm:h-10 px-2 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition"
            title="Chat on WhatsApp"
            aria-label="WhatsApp Inquiry"
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span>WhatsApp</span>
          </a>

          {/* Call Agent Button */}
          <a
            href={`tel:${property.contact_phone || '03028658450'}`}
            className="flex-1 sm:w-auto h-8 sm:h-10 px-2 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95"
            title="Call Agent"
            aria-label="Direct Phone Call"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Call</span>
          </a>

          {/* Details Button (Desktop Full Button, Mobile tap card) */}
          <Link
            href={`/properties/${property.slug}/`}
            onClick={handleDetailsClick}
            className="hidden sm:flex sm:w-auto h-10 px-2 rounded-xl bg-slate-950 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs items-center justify-center gap-1 transition shadow-xs"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
