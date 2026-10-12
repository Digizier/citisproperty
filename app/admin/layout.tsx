import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Control Panel | Property Bank Real Estate',
  description: 'Management portal for Property Bank Real Estate (citisproperty.com)',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
}
