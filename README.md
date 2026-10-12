# citisproperty

Official website and digital inventory portal for **Property Bank Real Estate** — Authorized Dealership for Citi Housing Phase II Samundri Road, Faisalabad.

## Overview
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database & Backend**: Supabase
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages / Next.js Static Export

## Key Features
- **Live Inventory & Catalog**: 9 items per page with numbered pagination for optimal egress and performance.
- **Categorized Sections**: 6 items per featured section on the homepage (Buy, Rent, 2-Year Installments) with direct category view-all links.
- **Interactive Plot Finder**: Map and vector blueprint navigation.
- **Transparent Official Branding**: High-resolution transparent seals and badges.
- **Zameen-Style Search Engine**: Real-time filtering by purpose, city, location, size, and price brackets.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create a `.env.local` based on `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```
