const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.jyfxflqsqlngwpfjleiy:85zWZDE%2F4p9%40W4P@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jyfxflqsqlngwpfjleiy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setupDatabase() {
  console.log('🚀 Starting automated Supabase schema migration for Property Bank Real Estate...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected directly to Supabase PostgreSQL database.');

    // 1. Create Core Tables
    const schemaSql = `
      -- 1. Site Settings Table
      CREATE TABLE IF NOT EXISTS public.site_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        company_name TEXT NOT NULL DEFAULT 'Property Bank Real Estate',
        company_tagline TEXT DEFAULT 'Authorised Dealer for Citi Housing - پلاٹ سے مکان تک',
        address TEXT DEFAULT '11- AA Main Commercial Market, Citi Housing Samundri Road, Faisalabad',
        phone TEXT DEFAULT '0302-8658450',
        phone_secondary TEXT DEFAULT '0302-9892535',
        whatsapp TEXT DEFAULT '923028658450',
        email TEXT DEFAULT 'info@citisproperty.com',
        google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/Umc7Ci9kQZN1GwVo6',
        google_reviews_url TEXT DEFAULT 'https://g.page/r/CWPTsi4M7yUMEBE/review',
        facebook_url TEXT DEFAULT 'https://www.facebook.com/share/1EM79fibhT/',
        hero_title TEXT DEFAULT 'Citi Housing Samundri Road, Faisalabad',
        hero_subtitle TEXT DEFAULT 'Premium Lifestyle Living, Residential & Commercial Plots on 2-Year Easy Installment Plans',
        logo_url TEXT DEFAULT '/images/logo.png',
        banner_url TEXT DEFAULT '/images/hero-banner.png',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 2. Societies Table
      CREATE TABLE IF NOT EXISTS public.societies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        city TEXT NOT NULL DEFAULT 'Faisalabad',
        location TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        master_plan_pdf_url TEXT,
        is_featured BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 3. Society Blocks Table
      CREATE TABLE IF NOT EXISTS public.society_blocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 4. Categories Table
      CREATE TABLE IF NOT EXISTS public.categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT DEFAULT 'Building2',
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 5. Sub-Categories Table
      CREATE TABLE IF NOT EXISTS public.sub_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 6. Tags Table
      CREATE TABLE IF NOT EXISTS public.tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 7. Plots Table
      CREATE TABLE IF NOT EXISTS public.plots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
        block_id UUID REFERENCES public.society_blocks(id) ON DELETE SET NULL,
        plot_number TEXT NOT NULL,
        plot_type TEXT DEFAULT 'Residential',
        size_marla NUMERIC(6, 2) NOT NULL,
        unit TEXT DEFAULT 'Marla',
        price NUMERIC(14, 2) NOT NULL,
        status TEXT DEFAULT 'Available', -- Available, Reserved, Sold
        street TEXT,
        is_corner BOOLEAN DEFAULT false,
        is_park_facing BOOLEAN DEFAULT false,
        is_main_boulevard BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 8. Properties Table
      CREATE TABLE IF NOT EXISTS public.properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
        sub_category_id UUID REFERENCES public.sub_categories(id) ON DELETE SET NULL,
        society_id UUID REFERENCES public.societies(id) ON DELETE SET NULL,
        block_id UUID REFERENCES public.society_blocks(id) ON DELETE SET NULL,
        plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
        purpose TEXT DEFAULT 'Sale', -- Sale, Rent, Installment
        property_type TEXT DEFAULT 'Plot', -- Plot, House, Commercial
        price NUMERIC(14, 2) NOT NULL,
        secret_bottom_price NUMERIC(14, 2), -- Internal dealer bottom margin
        down_payment NUMERIC(14, 2),
        possession_payment NUMERIC(14, 2),
        installment_duration TEXT DEFAULT '2 Years',
        area_value NUMERIC(6, 2) NOT NULL,
        area_unit TEXT DEFAULT 'Marla',
        bedrooms INT DEFAULT 0,
        bathrooms INT DEFAULT 0,
        address TEXT NOT NULL,
        city TEXT DEFAULT 'Faisalabad',
        thumbnail_url TEXT,
        gallery_urls TEXT[] DEFAULT '{}',
        features TEXT[] DEFAULT '{}',
        is_featured BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT true,
        status TEXT DEFAULT 'Available', -- Available, Under Token, Sold
        contact_person TEXT DEFAULT 'Asif Sadiq',
        contact_phone TEXT DEFAULT '0302-8658450',
        contact_whatsapp TEXT DEFAULT '923028658450',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 9. Hero Banners Table
      CREATE TABLE IF NOT EXISTS public.banners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        subtitle TEXT,
        cta_label TEXT DEFAULT 'Explore Properties',
        cta_link TEXT DEFAULT '/properties/',
        image_desktop_url TEXT NOT NULL,
        image_mobile_url TEXT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 10. Inquiries & Leads Table
      CREATE TABLE IF NOT EXISTS public.inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        whatsapp TEXT,
        property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
        plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
        message TEXT,
        intent TEXT DEFAULT 'Buy',
        status TEXT DEFAULT 'New', -- New, Contacted, Follow-up, Closed
        assigned_to TEXT DEFAULT 'Asif Sadiq',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 11. Activity Logs
      CREATE TABLE IF NOT EXISTS public.activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Indexes for Zero-Load selective queries
      CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
      CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category_id);
      CREATE INDEX IF NOT EXISTS idx_properties_society ON public.properties(society_id);
      CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
      CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured);
      CREATE INDEX IF NOT EXISTS idx_plots_number ON public.plots(plot_number);
      CREATE INDEX IF NOT EXISTS idx_plots_block ON public.plots(block_id);
      CREATE INDEX IF NOT EXISTS idx_plots_society ON public.plots(society_id);

      -- Enable Row Level Security (RLS) on all tables
      ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.society_blocks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

      -- Create Permissive Safe Policies for read/write sync
      DO $$ 
      BEGIN
        DROP POLICY IF EXISTS "Public can view settings" ON public.site_settings;
        CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT USING (true);
        DROP POLICY IF EXISTS "All operations on settings" ON public.site_settings;
        CREATE POLICY "All operations on settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can view societies" ON public.societies;
        CREATE POLICY "Public can view societies" ON public.societies FOR SELECT USING (true);
        DROP POLICY IF EXISTS "All operations on societies" ON public.societies;
        CREATE POLICY "All operations on societies" ON public.societies FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can view blocks" ON public.society_blocks;
        CREATE POLICY "Public can view blocks" ON public.society_blocks FOR SELECT USING (true);
        DROP POLICY IF EXISTS "All operations on blocks" ON public.society_blocks;
        CREATE POLICY "All operations on blocks" ON public.society_blocks FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
        CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
        DROP POLICY IF EXISTS "All operations on categories" ON public.categories;
        CREATE POLICY "All operations on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can view sub_categories" ON public.sub_categories;
        CREATE POLICY "Public can view sub_categories" ON public.sub_categories FOR SELECT USING (true);
        DROP POLICY IF EXISTS "All operations on sub_categories" ON public.sub_categories;
        CREATE POLICY "All operations on sub_categories" ON public.sub_categories FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can view tags" ON public.tags;
        CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);
        DROP POLICY IF EXISTS "All operations on tags" ON public.tags;
        CREATE POLICY "All operations on tags" ON public.tags FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can view plots" ON public.plots;
        CREATE POLICY "Public can view plots" ON public.plots FOR SELECT USING (true);
        DROP POLICY IF EXISTS "All operations on plots" ON public.plots;
        CREATE POLICY "All operations on plots" ON public.plots FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can view properties" ON public.properties;
        CREATE POLICY "Public can view properties" ON public.properties FOR SELECT USING (true);
        DROP POLICY IF EXISTS "All operations on properties" ON public.properties;
        CREATE POLICY "All operations on properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can view banners" ON public.banners;
        CREATE POLICY "Public can view banners" ON public.banners FOR SELECT USING (true);
        DROP POLICY IF EXISTS "All operations on banners" ON public.banners;
        CREATE POLICY "All operations on banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "All operations on inquiries" ON public.inquiries;
        CREATE POLICY "All operations on inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "All operations on activity_logs" ON public.activity_logs;
        CREATE POLICY "All operations on activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
      END $$;
    `;

    await client.query(schemaSql);
    console.log('✅ Core tables, indexes, and RLS policies created successfully.');

    // 2. Insert Default Verified Seed Data
    console.log('🌱 Seeding initial verified client data...');

    // Seed Site Settings
    await client.query(`
      INSERT INTO public.site_settings (id, company_name, phone, phone_secondary, whatsapp, address)
      VALUES (
        'default',
        'Property Bank Real Estate',
        '0302-8658450',
        '0302-9892535',
        '923028658450',
        '11- AA Main Commercial Market, Citi Housing Samundri Road, Faisalabad'
      )
      ON CONFLICT (id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        phone = EXCLUDED.phone,
        phone_secondary = EXCLUDED.phone_secondary,
        whatsapp = EXCLUDED.whatsapp,
        address = EXCLUDED.address;
    `);

    // Seed Society: Citi Housing Samundri Road Phase II
    const societyRes = await client.query(`
      INSERT INTO public.societies (name, slug, city, location, description, image_url, master_plan_pdf_url, is_featured)
      VALUES (
        'Citi Housing (Phase II) Samundri Road',
        'citi-housing-samundri-road',
        'Faisalabad',
        'Samundri Road, Faisalabad',
        'Citi Housing Faisalabad offers a gold standard lifestyle with wide road networks, underground utilities, magnificent themed entrance, Glow Park, central masjid, and gated 24/7 security.',
        '/images/hero-banner.png',
        '/maps/citi-housing-phase2-master-plan.pdf',
        true
      )
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const societyId = societyRes.rows[0].id;

    // Seed Blocks
    const blocks = [
      { name: 'Executive A Block', slug: 'executive-a' },
      { name: 'Block B', slug: 'block-b' },
      { name: 'Block C', slug: 'block-c' },
      { name: 'Block D', slug: 'block-d' },
      { name: 'Block E', slug: 'block-e' },
      { name: 'Block F', slug: 'block-f' }
    ];

    const blockMap = {};
    for (const b of blocks) {
      const bRes = await client.query(`
        INSERT INTO public.society_blocks (society_id, name, slug)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [societyId, b.name, b.slug]);
      blockMap[b.slug] = bRes.rows[0].id;
    }

    // Seed Categories & Sub-Categories
    const categories = [
      {
        name: 'Residential Plots',
        slug: 'residential-plots',
        icon: 'MapPin',
        subCategories: ['5 Marla Plot', '7 Marla Plot', '10 Marla Plot', '1 Kanal Plot']
      },
      {
        name: 'Commercial Plots',
        slug: 'commercial-plots',
        icon: 'Building2',
        subCategories: ['Commercial 30x40 FT', 'Commercial 15x60 FT', 'Commercial Plaza Plot']
      },
      {
        name: 'Houses & Villas',
        slug: 'houses-villas',
        icon: 'Home',
        subCategories: ['5 Marla Brand New House', '10 Marla Designer Villa', '1 Kanal Luxury Bungalow']
      },
      {
        name: 'Installment Files',
        slug: 'installment-files',
        icon: 'CreditCard',
        subCategories: ['2-Year Residential Payment Plan', '3-Year Commercial Payment Plan']
      }
    ];

    const catMap = {};
    const subCatMap = {};

    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      const cRes = await client.query(`
        INSERT INTO public.categories (name, slug, icon, display_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `, [c.name, c.slug, c.icon, i + 1]);
      const catId = cRes.rows[0].id;
      catMap[c.slug] = catId;

      for (let j = 0; j < c.subCategories.length; j++) {
        const subName = c.subCategories[j];
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const sRes = await client.query(`
          INSERT INTO public.sub_categories (category_id, name, slug, display_order)
          VALUES ($1, $2, $3, $4)
          RETURNING id;
        `, [catId, subName, subSlug, j + 1]);
        subCatMap[subSlug] = sRes.rows[0].id;
      }
    }

    // Seed Banners
    await client.query(`
      INSERT INTO public.banners (title, subtitle, cta_label, cta_link, image_desktop_url, display_order, is_active)
      VALUES 
      (
        'Citi Housing Samundri Road, Faisalabad',
        'Official Authorised Dealer - Property Bank Real Estate. Residential plots on 2 years easy installment plan with 40% down payment.',
        'View Payment Plan',
        '/properties/residential-plots/',
        '/images/hero-banner.png',
        1,
        true
      ),
      (
        'Residential Plots Payment Plan',
        '5, 7, & 10 Marla residential plots starting at PKR 4,250,000. Book today with 40% booking amount.',
        'Explore Plots',
        '/plot-finder/',
        '/images/samundri-payment-plan.jpg',
        2,
        true
      );
    `);

    // Seed Sample Verified Properties
    const properties = [
      {
        title: '5 Marla Residential Plot - Samundri Road Faisalabad',
        slug: '5-marla-residential-plot-samundri-road',
        description: 'Prime location 5 Marla residential plot in Citi Housing Phase II, Samundri Road Faisalabad. Available on 2-Year Installment Plan with 40% Down Payment. Total price PKR 4,250,000, Booking amount PKR 1,700,000, On Possession PKR 2,550,000.',
        category_slug: 'residential-plots',
        sub_category_slug: '5-marla-plot',
        block_slug: 'block-b',
        purpose: 'Installment',
        property_type: 'Plot',
        price: 4250000,
        secret_bottom_price: 4100000,
        down_payment: 1700000,
        possession_payment: 2550000,
        installment_duration: '2 Years',
        area_value: 5,
        area_unit: 'Marla',
        address: 'Block B, Citi Housing Phase II, Samundri Road, Faisalabad',
        thumbnail_url: '/images/samundri-payment-plan.jpg',
        gallery_urls: ['/images/samundri-payment-plan.jpg', '/images/hero-banner.png'],
        features: ['2-Year Installments', 'Wide Carpeted Roads', 'Gated Community', 'Glow Park Nearby', 'Underground Electricity', 'Water Supply'],
        is_featured: true
      },
      {
        title: '7 Marla Residential Plot - Samundri Road Faisalabad',
        slug: '7-marla-residential-plot-samundri-road',
        description: 'Excellent 7 Marla residential plot with ready booking in Citi Housing Phase II, Samundri Road Faisalabad. Total price PKR 5,650,000, Booking amount PKR 2,260,000, On Possession PKR 3,390,000.',
        category_slug: 'residential-plots',
        sub_category_slug: '7-marla-plot',
        block_slug: 'block-c',
        purpose: 'Installment',
        property_type: 'Plot',
        price: 5650000,
        secret_bottom_price: 5450000,
        down_payment: 2260000,
        possession_payment: 3390000,
        installment_duration: '2 Years',
        area_value: 7,
        area_unit: 'Marla',
        address: 'Block C, Citi Housing Phase II, Samundri Road, Faisalabad',
        thumbnail_url: '/images/samundri-payment-plan.jpg',
        gallery_urls: ['/images/samundri-payment-plan.jpg', '/images/hero-banner.png'],
        features: ['Near Grand Mosque', 'Parks & Green Belts', '24/7 Security', 'Sewerage Ready', 'Sui Gas'],
        is_featured: true
      },
      {
        title: '10 Marla Luxury Residential Plot - Executive A Block',
        slug: '10-marla-luxury-residential-plot-executive-a',
        description: 'Prestigious 10 Marla plot situated in Executive A Block, right next to the grand entrance and main commercial boulevard. Total price PKR 7,350,000, Booking amount PKR 2,940,000, On Possession PKR 4,410,000.',
        category_slug: 'residential-plots',
        sub_category_slug: '10-marla-plot',
        block_slug: 'executive-a',
        purpose: 'Installment',
        property_type: 'Plot',
        price: 7350000,
        secret_bottom_price: 7100000,
        down_payment: 2940000,
        possession_payment: 4410000,
        installment_duration: '2 Years',
        area_value: 10,
        area_unit: 'Marla',
        address: 'Executive A Block, Citi Housing Phase II, Samundri Road, Faisalabad',
        thumbnail_url: '/images/hero-banner.png',
        gallery_urls: ['/images/hero-banner.png', '/images/samundri-payment-plan.jpg'],
        features: ['Executive Block', 'Direct Entrance Access', 'Underground Utilities', 'School Nearby', 'CCTV Surveillance'],
        is_featured: true
      },
      {
        title: '1 Kanal Luxury Estate Plot - Park Facing Block C',
        slug: '1-kanal-luxury-estate-plot-block-c',
        description: 'Magnificent 1 Kanal (50x90 FT) residential plot directly facing the 18-Kanal Glow Park in Block C. Perfect for constructing a luxury dream mansion.',
        category_slug: 'residential-plots',
        sub_category_slug: '1-kanal-plot',
        block_slug: 'block-c',
        purpose: 'Sale',
        property_type: 'Plot',
        price: 15500000,
        secret_bottom_price: 14800000,
        down_payment: 15500000,
        area_value: 20,
        area_unit: 'Marla',
        address: 'Block C, Facing Glow Park, Citi Housing Phase II, Samundri Road, Faisalabad',
        thumbnail_url: '/images/hero-banner.png',
        gallery_urls: ['/images/hero-banner.png', '/images/property-bank-flyer.jpg'],
        features: ['Park Facing', '50x90 FT Dimensions', 'Immediate Possession', 'Sui Gas', 'Underground Electricity'],
        is_featured: true
      },
      {
        title: '30x40 FT Commercial Plot - Main Commercial Market',
        slug: '30x40-commercial-plot-main-market',
        description: 'High-visibility 30x40 commercial plot located in AA Main Commercial Market, right opposite Property Bank office. Ideal for multi-story shopping plaza or corporate offices.',
        category_slug: 'commercial-plots',
        sub_category_slug: 'commercial-30x40-ft',
        block_slug: 'executive-a',
        purpose: 'Sale',
        property_type: 'Commercial',
        price: 18500000,
        secret_bottom_price: 17500000,
        down_payment: 18500000,
        area_value: 5.33,
        area_unit: 'Marla',
        address: '11-AA Main Commercial Market, Citi Housing Samundri Road, Faisalabad',
        thumbnail_url: '/images/property-bank-flyer.jpg',
        gallery_urls: ['/images/property-bank-flyer.jpg', '/images/hero-banner.png'],
        features: ['Main Boulevard Commercial', 'High Rental Yield', 'Huge Footfall', 'Basement + 4 Floor Permission'],
        is_featured: true
      },
      {
        title: '5 Marla Brand New Modern House - Block B',
        slug: '5-marla-brand-new-modern-house-block-b',
        description: 'Newly constructed Spanish-style double-story house featuring 3 master bedrooms with attached washrooms, luxury drawing room, 2 TV lounges, designer kitchen, and car porch.',
        category_slug: 'houses-villas',
        sub_category_slug: '5-marla-brand-new-house',
        block_slug: 'block-b',
        purpose: 'Sale',
        property_type: 'House',
        price: 16500000,
        secret_bottom_price: 15800000,
        down_payment: 16500000,
        area_value: 5,
        area_unit: 'Marla',
        bedrooms: 3,
        bathrooms: 4,
        address: 'Street 4, Block B, Citi Housing Phase II, Samundri Road, Faisalabad',
        thumbnail_url: '/images/property-bank-flyer.jpg',
        gallery_urls: ['/images/property-bank-flyer.jpg', '/images/hero-banner.png'],
        features: ['Double Story', 'Imported Sanitary Fittings', 'Solid Ash Wood Doors', 'Car Porch', 'Drawing & Dining', '2 Kitchens'],
        is_featured: true
      }
    ];

    for (const p of properties) {
      await client.query(`
        INSERT INTO public.properties (
          title, slug, description, category_id, sub_category_id, society_id, block_id,
          purpose, property_type, price, secret_bottom_price, down_payment, possession_payment,
          installment_duration, area_value, area_unit, bedrooms, bathrooms, address, city,
          thumbnail_url, gallery_urls, features, is_featured, is_verified, status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, 'Available'
        )
        ON CONFLICT (slug) DO UPDATE SET
          price = EXCLUDED.price,
          title = EXCLUDED.title;
      `, [
        p.title, p.slug, p.description, catMap[p.category_slug], subCatMap[p.sub_category_slug], societyId, blockMap[p.block_slug],
        p.purpose, p.property_type, p.price, p.secret_bottom_price, p.down_payment, p.possession_payment,
        p.installment_duration, p.area_value, p.area_unit, p.bedrooms || 0, p.bathrooms || 0, p.address, 'Faisalabad',
        p.thumbnail_url, p.gallery_urls, p.features, p.is_featured, true
      ]);
    }

    // Seed Verified Plots for Plot Finder
    const samplePlots = [
      { num: '12', block: 'executive-a', size: 10, price: 7350000, status: 'Available', corner: true },
      { num: '45', block: 'executive-a', size: 10, price: 7350000, status: 'Available', corner: false },
      { num: '88', block: 'block-b', size: 5, price: 4250000, status: 'Available', corner: false },
      { num: '120', block: 'block-b', size: 5, price: 4250000, status: 'Reserved', corner: true },
      { num: '205', block: 'block-c', size: 7, price: 5650000, status: 'Available', corner: false },
      { num: '250', block: 'block-c', size: 20, price: 15500000, status: 'Available', corner: true },
      { num: '310', block: 'block-d', size: 5, price: 4200000, status: 'Available', corner: false },
      { num: '415', block: 'block-e', size: 5, price: 4150000, status: 'Sold', corner: false }
    ];

    for (const sp of samplePlots) {
      await client.query(`
        INSERT INTO public.plots (society_id, block_id, plot_number, plot_type, size_marla, unit, price, status, is_corner)
        VALUES ($1, $2, $3, 'Residential', $4, 'Marla', $5, $6, $7)
        ON CONFLICT DO NOTHING;
      `, [societyId, blockMap[sp.block], sp.num, typeof sp.size === 'number' ? sp.size : 20, sp.price, sp.status, sp.corner]);
    }

    console.log('✅ Default verified client data seeded successfully.');

  } catch (err) {
    console.error('❌ Error executing Supabase migration:', err);
    throw err;
  } finally {
    await client.end();
  }

  // 3. Storage Bucket Creation via Supabase Client
  if (supabaseUrl && supabaseServiceKey) {
    console.log('🪣 Initializing public Supabase storage bucket (property-assets)...');
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const { data: buckets, error: listErr } = await supabaseAdmin.storage.listBuckets();
      if (!listErr) {
        const bucketExists = buckets.some(b => b.name === 'property-assets');
        if (!bucketExists) {
          const { error: createErr } = await supabaseAdmin.storage.createBucket('property-assets', {
            public: true,
            fileSizeLimit: 10485760, // 10MB limit
            allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg', 'application/pdf']
          });
          if (createErr) console.warn('Bucket creation note:', createErr.message);
          else console.log('✅ Created public storage bucket: property-assets');
        } else {
          console.log('✅ Public storage bucket (property-assets) already exists.');
        }
      }
    } catch (sErr) {
      console.warn('Storage bucket setup note:', sErr.message);
    }
  }

  console.log('🎉 Supabase setup complete!');
}

setupDatabase().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
