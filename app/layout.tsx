import type { Metadata, Viewport } from 'next';
import './globals.css';
import StorefrontLayoutWrapper from '@/components/StorefrontLayoutWrapper';

export const metadata: Metadata = {
  metadataBase: new URL('https://citisproperty.com'),
  title: 'Property Bank Real Estate | Authorized Dealer Citi Housing Faisalabad',
  description:
    'Authorised Dealer for Citi Housing (Pvt) Ltd. Discover 5, 7, 10 Marla and 1 Kanal residential & commercial plots, houses, and 2-year installment plans in Citi Housing Samundri Road, Faisalabad.',
  keywords: [
    'Property Bank Real Estate',
    'Citi Housing Faisalabad',
    'Citi Housing Samundri Road',
    'Plots in Faisalabad',
    'Plot Finder Faisalabad',
    'Asif Sadiq Property Bank',
    'citisproperty.com',
  ],
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '500x500', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Property Bank Real Estate | Citi Housing Faisalabad',
    description:
      'Premier Authorized Real Estate Consultancy for Citi Housing Samundri Road, Faisalabad. 2-Year Installments & Verified Plot Transfers.',
    url: 'https://citisproperty.com',
    siteName: 'Property Bank Real Estate',
    images: [
      {
        url: '/images/hero-banner.png',
        width: 1200,
        height: 630,
        alt: 'Property Bank Real Estate - Citi Housing Samundri Road',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="500x500" href="/icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="antialiased min-h-screen">
        <StorefrontLayoutWrapper>{children}</StorefrontLayoutWrapper>
      </body>
    </html>
  );
}
