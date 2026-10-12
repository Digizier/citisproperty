'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { PropertyQuickViewProvider } from './PropertyDetailDrawer';

export default function StorefrontLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Pure Admin Layout with ZERO public header & footer!
    return <main className="min-h-screen bg-slate-900">{children}</main>;
  }

  return (
    <PropertyQuickViewProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PropertyQuickViewProvider>
  );
}
