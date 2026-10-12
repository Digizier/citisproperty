import React from 'react';
import PropertyDetailClient from './PropertyDetailClient';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jyfxflqsqlngwpfjleiy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5ZnhmbHFzcWxuZ3dwZmpsZWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NjE0MjUsImV4cCI6MjEwNzEzNzQyNX0.9t43vXbWGrW74FzxJGcu34rGKtzER9euLFHwFxebQlY';

// Core fallback slugs ensuring build succeeds even if network is offline
const CORE_SLUGS = [
  '5-marla-residential-plot-samundri-road',
  '7-marla-residential-plot-samundri-road',
  '10-marla-luxury-residential-plot-executive-a',
  '1-kanal-luxury-estate-plot-block-c',
  '30x40-commercial-plot-main-market',
  '5-marla-brand-new-modern-house-block-b',
  'executive-2-bed-luxury-flat-gulberg-lahore',
  'residential-plots',
  'commercial-plots',
  'houses-villas',
  'installment-files',
];

/**
 * Dynamically queries all property slugs from the Cloud Database at build & dev start
 * Combines with fallback slugs to guarantee complete static page generation for Cloudflare Pages
 */
export async function generateStaticParams() {
  const slugSet = new Set<string>(CORE_SLUGS);

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=slug`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const properties: Array<{ slug: string }> = await res.json();
      if (Array.isArray(properties)) {
        properties.forEach((p) => {
          if (p.slug && typeof p.slug === 'string' && p.slug.trim()) {
            slugSet.add(p.slug.trim());
          }
        });
      }
    }
  } catch (err) {
    console.warn('generateStaticParams: Using core fallback slugs due to DB connection:', err);
  }

  return Array.from(slugSet).map((slug) => ({ slug }));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PropertyDetailClient slug={slug} />;
}
