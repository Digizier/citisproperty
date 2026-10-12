# PHASE 0: PROJECT DISCOVERY & AUDIT REPORT
**Client**: Property Bank Real Estate / City Housing (Pvt) Ltd  
**Domain**: citisproperty.com  
**Audit Date**: October 2026  
**Status**: Initial Project Kickoff  

---

## 1. Workspace & Environment Inspection
- **Current Directory**: `D:\APPs\citisproperty.com`
- **Initial State**: Clean workspace containing authoritative `Reference-Data/` directory.
- **Node Environment**: Node.js `v24.13.0`, npm `11.6.2` (Meets Cloudflare Node 22+ engine requirement).
- **Existing Framework**: None prior to kickoff; fresh greenfield setup required adhering to Zero-Load architecture.

---

## 2. Authoritative Client Identity & Verified Assets

Through deep inspection of `Reference-Data/` files, audio notes, and flyers, the verified business credentials are:

| Attribute | Verified Value | Source |
|---|---|---|
| **Business Name** | **Property Bank Real Estate** (Authorized Dealer for Citi Housing) | Official Stamp & Map PDF |
| **Partner Society** | **City Housing (Pvt) Ltd** | High-Res Emblem Seal & Entrance Banner |
| **Primary Project** | **Citi Housing (Phase II) Samundri Road, Faisalabad** | Master Plan PDF & Payment Plan Flyer |
| **Head Office Address**| 11- AA Main Commercial Market, Citi Housing Samundri Road, Faisalabad | Master Plan PDF |
| **Primary Contacts** | **Asif Sadiq**: `0302-8658450` <br> **Rana Adnan**: `0302-9892535` | Official Master Plan & Flyers |
| **WhatsApp Helpline**| `0302-8658450` (`+92 302 8658450`) | Audio & Payment Flyer |
| **Google Maps Pin** | `https://maps.app.goo.gl/Umc7Ci9kQZN1GwVo6` | Client Provided |
| **Google Review URL**| `https://g.page/r/CWPTsi4M7yUMEBE/review` | Client Provided |
| **Facebook Page** | `https://www.facebook.com/share/1EM79fibhT/` | Client Provided |
| **Visual Assets** | - Gold Seal Circular Emblem (`City Housing (Pvt) Ltd`) <br>- High-Res Lion Entrance Landmark Banner <br>- Official Phase II Samundri Road Master Map (PDF) <br>- 5/7/10 Marla Official Payment Plan flyer | `Reference-Data/` |

---

## 3. Core Architectural Framework & Zero-Load Blueprint

1. **Cloudflare Free-Tier Hosting**:
   - Pure Static Site Generation (`output: 'export'`) resulting in zero serverless/worker invocations.
   - Cloudflare Pages / Static Assets delivery with unlimited bandwidth, 0ms CPU time, and zero cost.
   - `images: { unoptimized: true }` to eliminate external image transformation quotas.
2. **Direct Browser-to-Supabase BaaS Bridge**:
   - Remote Supabase project: `jyfxflqsqlngwpfjleiy.supabase.co`.
   - Zero `SELECT *`: Strict column selection (`.select('id, title, slug, price, ...')`) with strict 8-item pagination to preserve the 5 GB/month egress quota.
   - Dual-Tier Resilient Persistence: Active Supabase connection backed by instant local cache and cross-tab/cross-device event hydration (`lib/db.ts`).
   - Browser-side `.webp` compression converting all uploads to lightweight KBs before pushing to Supabase Storage.
3. **Dedicated Admin Panel**:
   - Completely independent layout (No public header or footer in `/admin`).
   - PIN / Auth gate (`admin123`).
   - Modules: Properties, Orders/Inquiries, Nested Categories & Subcategories, Tags, Hero Banners, Society & Plot Finder Manager, and Printable A4 Brochures.
   - 100% custom modals and toast notifications (Zero native `window.alert` / `window.confirm`).
4. **Zameen.com-style Plot Finder & Society Map Hub**:
   - Society & Block selection (Executive A, B, C, D, E, F).
   - Search by Plot Number with interactive map highlight.
   - High-definition Master Plan PDF viewer and direct download button.

---

## 4. Implementation Phases Roadmap

- [x] **Phase 0: Discovery & Audit** (Completed)
- [ ] **Phase 1: Foundation & Scaffold** (Next.js 15, TypeScript, Tailwind CSS, Lucide icons, Cloudflare config, asset integration)
- [ ] **Phase 2: Automated Supabase Setup** (Schema migration script for tables, RLS policies, storage bucket)
- [ ] **Phase 3: Resilient Data & Storage Layer** (`lib/db.ts`, client-side WebP compression utility)
- [ ] **Phase 4: Storefront UI/UX Pro Max** (Header, dynamic banner slider, Zameen-style search, 8-item paginated listings, property details, flash skeleton loaders)
- [ ] **Phase 5: Interactive Plot Finder & Society Map** (Master map view, block/plot search, PDF master plan download)
- [ ] **Phase 6: Advanced Admin Dashboard** (PIN gate, property manager, plot manager, categories/subcategories, banners, inquiries, brochure generator)
- [ ] **Phase 7: Production Build Verification & Audit** (Zero TS errors, static export check, responsive audit)
