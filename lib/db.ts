import { createClient } from '@supabase/supabase-js';
export * from './types';
import {
  Property,
  Society,
  SocietyBlock,
  Plot,
  Category,
  SubCategory,
  Banner,
  Inquiry,
  SiteSettings,
} from './types';

// 1. Supabase Singleton Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jyfxflqsqlngwpfjleiy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5ZnhmbHFzcWxuZ3dwZmpsZWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NjE0MjUsImV4cCI6MjEwNzEzNzQyNX0.9t43vXbWGrW74FzxJGcu34rGKtzER9euLFHwFxebQlY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Event dispatcher helper for cross-tab and reactive updates
export const dispatchAppEvent = (eventName: string, detail?: any) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
};

// 2. Default Seed Fallback Data (Guarantees zero-crash if remote is slow or offline)
export const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default',
  company_name: 'Property Bank Real Estate',
  company_tagline: 'Authorised Dealer for Citi Housing - پلاٹ سے مکان تک',
  address: '11- AA Main Commercial Market, Citi Housing Samundri Road, Faisalabad',
  phone: '0302-8658450',
  phone_secondary: '0302-9892535',
  whatsapp: '923028658450',
  email: 'info@citisproperty.com',
  google_maps_url: 'https://maps.app.goo.gl/Umc7Ci9kQZN1GwVo6',
  google_reviews_url: 'https://g.page/r/CWPTsi4M7yUMEBE/review',
  facebook_url: 'https://www.facebook.com/share/1EM79fibhT/',
  hero_title: 'Citi Housing Samundri Road, Faisalabad',
  hero_subtitle: 'Premium Lifestyle Living, Residential & Commercial Plots on 2-Year Easy Installment Plans',
  logo_url: '/images/logo.png',
  banner_url: '/images/hero-banner.png',
};

// ==========================================
// 3. ZERO-LOAD SELECTIVE QUERY FUNCTIONS
// ==========================================

export interface PropertyFilterParams {
  categorySlug?: string;
  subCategorySlug?: string;
  societyId?: string;
  blockId?: string;
  purpose?: string;
  propertyType?: string;
  subType?: string;
  city?: string;
  location?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  areaUnit?: string;
  search?: string;
  page?: number;
  limit?: number; // STRICTLY 9 items per page by default (3x3 grid)!
}

/**
 * Fetches properties with lean column projection (NEVER SELECT *)
 * and strict 9-item pagination to preserve egress quota and optimize load.
 */
export async function getProperties(params: PropertyFilterParams = {}): Promise<{
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const {
    categorySlug,
    subCategorySlug,
    societyId,
    blockId,
    purpose,
    propertyType,
    subType,
    city,
    location,
    bedrooms,
    bathrooms,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    areaUnit,
    search,
    page = 1,
    limit = 9, // 9 properties per page rule (3x3 grid)
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    // Lean selective projection (Only necessary card fields)
    let query = supabase
      .from('properties')
      .select(
        'id, title, slug, description, category_id, sub_category_id, society_id, block_id, purpose, property_type, sub_type, price, down_payment, possession_payment, installment_duration, area_value, area_unit, bedrooms, bathrooms, address, city, thumbnail_url, gallery_urls, features, is_featured, is_verified, status, contact_person, contact_phone, contact_whatsapp, created_at',
        { count: 'exact' }
      )
      .eq('status', 'Available')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    // 0. Category & Subcategory Filter
    if (categorySlug && categorySlug !== 'All') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categorySlug);
      if (isUuid) {
        query = query.eq('category_id', categorySlug);
      } else {
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .limit(1);
        if (catData && catData.length > 0) {
          query = query.eq('category_id', catData[0].id);
        } else {
          query = query.or(`property_type.ilike.%${categorySlug}%,sub_type.ilike.%${categorySlug}%,title.ilike.%${categorySlug}%`);
        }
      }
    }

    if (subCategorySlug && subCategorySlug !== 'All') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subCategorySlug);
      if (isUuid) {
        query = query.eq('sub_category_id', subCategorySlug);
      } else {
        const { data: subCatData } = await supabase
          .from('sub_categories')
          .select('id')
          .eq('slug', subCategorySlug)
          .limit(1);
        if (subCatData && subCatData.length > 0) {
          query = query.eq('sub_category_id', subCatData[0].id);
        } else {
          query = query.or(`sub_type.ilike.%${subCategorySlug}%,title.ilike.%${subCategorySlug}%`);
        }
      }
    }

    // 1. Purpose filter (Buy, Rent, 2-Year Installment)
    if (purpose && purpose !== 'All') {
      if (purpose === 'Buy') {
        query = query.in('purpose', ['Buy', 'Sale']);
      } else if (purpose === 'Installment') {
        query = query.in('purpose', ['Installment', '2-Year Installment', '2-Yr Installment']);
      } else if (purpose === 'Rent') {
        query = query.eq('purpose', 'Rent');
      } else {
        query = query.ilike('purpose', `%${purpose}%`);
      }
    }

    // 2. City filter
    if (city && city !== 'All') {
      query = query.ilike('city', `%${city.trim()}%`);
    }

    // 3. Main Property Type filter (Homes, Plots, Commercial)
    if (propertyType && propertyType !== 'All') {
      if (propertyType === 'Homes') {
        query = query.or('property_type.ilike.%House%,property_type.ilike.%Homes%,property_type.ilike.%Villa%,property_type.ilike.%Flat%');
      } else if (propertyType === 'Plots') {
        query = query.or('property_type.ilike.%Plot%,title.ilike.%Plot%');
      } else if (propertyType === 'Commercial') {
        query = query.or('property_type.ilike.%Commercial%,title.ilike.%Commercial%');
      } else {
        query = query.ilike('property_type', `%${propertyType}%`);
      }
    }

    // 4. Sub-Type filter (e.g. House, Flat, Residential Plot, Shop, etc.)
    if (subType && subType !== 'All') {
      query = query.or(`title.ilike.%${subType}%,description.ilike.%${subType}%,property_type.ilike.%${subType}%,sub_type.ilike.%${subType}%`);
    }

    // 5. Bedrooms filter
    if (bedrooms !== undefined && bedrooms !== null && bedrooms !== '' && bedrooms !== 'All') {
      if (bedrooms === 'Studio' || bedrooms === '0') {
        query = query.or('bedrooms.eq.0,bedrooms.is.null');
      } else if (bedrooms === '5+') {
        query = query.gte('bedrooms', 5);
      } else {
        const bNum = parseInt(bedrooms.toString(), 10);
        if (!isNaN(bNum)) {
          query = query.eq('bedrooms', bNum);
        }
      }
    }

    // 6. Society / Block
    if (societyId) {
      query = query.eq('society_id', societyId);
    }
    if (blockId) {
      query = query.eq('block_id', blockId);
    }

    // 7. Price bracket
    if (minPrice && minPrice > 0) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice && maxPrice > 0) {
      query = query.lte('price', maxPrice);
    }

    // 8. Area range & unit
    if (minArea && minArea > 0) {
      query = query.gte('area_value', minArea);
    }
    if (maxArea && maxArea > 0) {
      query = query.lte('area_value', maxArea);
    }
    if (areaUnit && areaUnit !== 'All') {
      query = query.ilike('area_unit', `%${areaUnit}%`);
    }

    // 9. Location text search
    if (location && location.trim()) {
      query = query.or(`title.ilike.%${location.trim()}%,address.ilike.%${location.trim()}%,city.ilike.%${location.trim()}%`);
    }

    // 10. General Keyword search
    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,address.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      console.warn('Properties query error, using empty result:', error.message);
      return { properties: [], total: 0, page, totalPages: 1 };
    }

    const total = count || 0;
    return {
      properties: (data as Property[]) || [],
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.error('getProperties execution error:', err);
    return { properties: [], total: 0, page, totalPages: 1 };
  }
}

/**
 * Fetches a single property by its slug for detail view
 */
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }
    return data as Property;
  } catch (err) {
    console.error('getPropertyBySlug error:', err);
    return null;
  }
}

/**
 * Fetches site settings (Phone, address, logo, WhatsApp, banners)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }
    return data as SiteSettings;
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Fetches active societies (Citi Housing Samundri Road, etc.)
 */
export async function getSocieties(onlyActive = true): Promise<Society[]> {
  try {
    let query = supabase
      .from('societies')
      .select('id, name, slug, city, location, description, image_url, master_plan_pdf_url, master_plan_image_url, is_featured, is_active, latitude, longitude')
      .order('is_featured', { ascending: false });

    if (onlyActive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return [
        {
          id: '1337133e-57e2-4fc2-8a25-527c11514fb3',
          name: 'Citi Housing (Phase II) Samundri Road',
          slug: 'citi-housing-samundri-road',
          city: 'Faisalabad',
          location: 'Samundri Road, Faisalabad',
          description: 'Citi Housing Faisalabad offers a gold standard lifestyle with wide road networks, underground utilities, magnificent themed entrance, Glow Park, central masjid, and gated 24/7 security.',
          image_url: '/images/hero-banner.png',
          master_plan_pdf_url: '/maps/property-bank-master-plan.pdf',
          master_plan_image_url: '/maps/citi-housing-master-plan-hd.webp',
          is_featured: true,
          is_active: true,
          latitude: 31.3325,
          longitude: 72.9856,
        },
      ];
    }
    return data as Society[];
  } catch (err) {
    return [
      {
        id: '1337133e-57e2-4fc2-8a25-527c11514fb3',
        name: 'Citi Housing (Phase II) Samundri Road',
        slug: 'citi-housing-samundri-road',
        city: 'Faisalabad',
        location: 'Samundri Road, Faisalabad',
        description: 'Citi Housing Faisalabad offers a gold standard lifestyle with wide road networks, underground utilities, magnificent themed entrance, Glow Park, central masjid, and gated 24/7 security.',
        image_url: '/images/hero-banner.png',
        master_plan_pdf_url: '/maps/property-bank-master-plan.pdf',
        master_plan_image_url: '/maps/citi-housing-master-plan-hd.webp',
        is_featured: true,
        is_active: true,
        latitude: 31.3325,
        longitude: 72.9856,
      },
    ];
  }
}

/**
 * Fetches blocks for a specific society
 */
export async function getSocietyBlocks(societyId?: string): Promise<SocietyBlock[]> {
  try {
    let query = supabase
      .from('society_blocks')
      .select('id, society_id, name, slug, description')
      .order('name', { ascending: true });

    if (societyId) {
      query = query.eq('society_id', societyId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as SocietyBlock[];
  } catch (err) {
    return [];
  }
}

/**
 * Fetches categories with display order
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon, display_order, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data as Category[];
  } catch (err) {
    return [];
  }
}

/**
 * Fetches sub-categories
 */
export async function getSubCategories(categoryId?: string): Promise<SubCategory[]> {
  try {
    let query = supabase
      .from('sub_categories')
      .select('id, category_id, name, slug, display_order, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as SubCategory[];
  } catch (err) {
    return [];
  }
}

/**
 * Fetches plots for Plot Finder with specific filters
 */
export async function getPlots(params: {
  societyId?: string;
  blockId?: string;
  plotNumber?: string;
  status?: string;
  plotType?: string;
}): Promise<Plot[]> {
  try {
    let query = supabase
      .from('plots')
      .select('id, society_id, block_id, plot_number, plot_type, size_marla, unit, price, status, street, is_corner, is_park_facing, is_main_boulevard, coord_x, coord_y, created_at')
      .order('plot_number', { ascending: true });

    if (params.societyId) {
      query = query.eq('society_id', params.societyId);
    }
    if (params.blockId) {
      query = query.eq('block_id', params.blockId);
    }
    if (params.plotNumber && params.plotNumber.trim()) {
      query = query.ilike('plot_number', `%${params.plotNumber.trim()}%`);
    }
    if (params.status && params.status !== 'All') {
      query = query.eq('status', params.status);
    }
    if (params.plotType && params.plotType !== 'All') {
      query = query.ilike('plot_type', `%${params.plotType.trim()}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    const list = data as Plot[];
    list.sort((a, b) => {
      const numA = parseInt(a.plot_number, 10);
      const numB = parseInt(b.plot_number, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.plot_number.localeCompare(b.plot_number);
    });
    return list;
  } catch (err) {
    return [];
  }
}

/**
 * Fetches hero banners for desktop and mobile
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('id, title, subtitle, cta_label, cta_link, image_desktop_url, image_mobile_url, display_order, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data as Banner[];
  } catch (err) {
    return [];
  }
}

/**
 * Saves customer inquiry
 */
export async function submitInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase.from('inquiries').insert([inquiry]);
    if (error) throw error;
    dispatchAppEvent('pb_inquiry_added');
    return true;
  } catch (err) {
    console.error('Failed to submit inquiry:', err);
    return false;
  }
}

// ==========================================
// 4. ADMIN CRUD & MUTATION OPERATIONS
// ==========================================

export async function adminSaveProperty(property: Partial<Property>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const allowedKeys = [
      'title', 'slug', 'description', 'category_id', 'sub_category_id',
      'society_id', 'block_id', 'plot_id', 'purpose', 'property_type',
      'sub_type', 'price', 'secret_bottom_price', 'down_payment',
      'possession_payment', 'installment_duration', 'area_value', 'area_unit',
      'bedrooms', 'bathrooms', 'address', 'city', 'thumbnail_url',
      'gallery_urls', 'features', 'is_featured', 'is_verified', 'status',
      'contact_person', 'contact_phone', 'contact_whatsapp'
    ];
    
    const payload: any = {};
    for (const key of allowedKeys) {
      if ((property as any)[key] !== undefined) {
        payload[key] = (property as any)[key];
      }
    }

    if (property.id) {
      payload.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', property.id)
        .select();
      if (error) throw error;
      dispatchAppEvent('pb_properties_updated');
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from('properties')
        .insert([payload])
        .select();
      if (error) throw error;
      dispatchAppEvent('pb_properties_updated');
      return { success: true, data };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteProperty(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
    dispatchAppEvent('pb_properties_updated');
    return true;
  } catch (err) {
    console.error('adminDeleteProperty error:', err);
    return false;
  }
}

export async function adminSaveSociety(society: Partial<Society>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const payload: any = {};
    const allowed = ['name', 'slug', 'city', 'location', 'description', 'image_url', 'master_plan_pdf_url', 'master_plan_image_url', 'is_featured', 'is_active', 'latitude', 'longitude'];
    for (const key of allowed) {
      if ((society as any)[key] !== undefined) {
        payload[key] = (society as any)[key];
      }
    }
    if (!payload.slug && payload.name) {
      payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (society.id) {
      const { data, error } = await supabase.from('societies').update(payload).eq('id', society.id).select();
      if (error) throw error;
      dispatchAppEvent('pb_societies_updated');
      return { success: true, data };
    } else {
      const { data, error } = await supabase.from('societies').insert([payload]).select();
      if (error) throw error;
      dispatchAppEvent('pb_societies_updated');
      return { success: true, data };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteSociety(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('societies').delete().eq('id', id);
    if (error) throw error;
    dispatchAppEvent('pb_societies_updated');
    return true;
  } catch (err) {
    console.error('adminDeleteSociety error:', err);
    return false;
  }
}

export async function adminSaveSocietyBlock(block: Partial<SocietyBlock>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const payload: any = {
      society_id: block.society_id,
      name: block.name,
      slug: block.slug || block.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: block.description || '',
    };

    if (block.id) {
      const { data, error } = await supabase.from('society_blocks').update(payload).eq('id', block.id).select();
      if (error) throw error;
      dispatchAppEvent('pb_blocks_updated');
      return { success: true, data };
    } else {
      const { data, error } = await supabase.from('society_blocks').insert([payload]).select();
      if (error) throw error;
      dispatchAppEvent('pb_blocks_updated');
      return { success: true, data };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteSocietyBlock(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('society_blocks').delete().eq('id', id);
    if (error) throw error;
    dispatchAppEvent('pb_blocks_updated');
    return true;
  } catch (err) {
    console.error('adminDeleteSocietyBlock error:', err);
    return false;
  }
}

export async function adminSavePlot(plot: Partial<Plot>): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = {
      society_id: plot.society_id,
      block_id: plot.block_id || null,
      plot_number: plot.plot_number,
      plot_type: plot.plot_type || 'Residential',
      size_marla: plot.size_marla !== undefined ? Number(plot.size_marla) : 5,
      unit: plot.unit || 'Marla',
      price: plot.price !== undefined ? Number(plot.price) : 0,
      status: plot.status || 'Available',
      street: plot.street || null,
      is_corner: Boolean(plot.is_corner),
      is_park_facing: Boolean(plot.is_park_facing),
      is_main_boulevard: Boolean(plot.is_main_boulevard),
      coord_x: plot.coord_x !== undefined && plot.coord_x !== null ? Number(plot.coord_x) : null,
      coord_y: plot.coord_y !== undefined && plot.coord_y !== null ? Number(plot.coord_y) : null,
      updated_at: new Date().toISOString(),
    };

    if (plot.id) {
      const { error } = await supabase.from('plots').update(payload).eq('id', plot.id);
      if (error) throw error;
    } else {
      payload.created_at = new Date().toISOString();
      const { error } = await supabase.from('plots').insert([payload]);
      if (error) throw error;
    }
    dispatchAppEvent('pb_plots_updated');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeletePlot(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('plots').delete().eq('id', id);
    if (error) throw error;
    dispatchAppEvent('pb_plots_updated');
    return true;
  } catch (err) {
    return false;
  }
}

export async function adminSaveBanner(banner: Partial<Banner>): Promise<{ success: boolean; error?: string }> {
  try {
    if (banner.id) {
      const { error } = await supabase.from('banners').update(banner).eq('id', banner.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('banners').insert([banner]);
      if (error) throw error;
    }
    dispatchAppEvent('pb_banners_updated');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteBanner(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
    dispatchAppEvent('pb_banners_updated');
    return true;
  } catch (err) {
    return false;
  }
}

export async function adminSaveCategory(category: Partial<Category>): Promise<{ success: boolean; error?: string }> {
  try {
    if (category.id) {
      const { error } = await supabase.from('categories').update(category).eq('id', category.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('categories').insert([category]);
      if (error) throw error;
    }
    dispatchAppEvent('pb_categories_updated');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    dispatchAppEvent('pb_categories_updated');
    return true;
  } catch (err) {
    return false;
  }
}

export async function adminSaveSubCategory(subCategory: Partial<SubCategory>): Promise<{ success: boolean; error?: string }> {
  try {
    if (subCategory.id) {
      const { error } = await supabase.from('sub_categories').update(subCategory).eq('id', subCategory.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('sub_categories').insert([subCategory]);
      if (error) throw error;
    }
    dispatchAppEvent('pb_categories_updated');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteSubCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('sub_categories').delete().eq('id', id);
    if (error) throw error;
    dispatchAppEvent('pb_categories_updated');
    return true;
  } catch (err) {
    return false;
  }
}

export async function adminSaveSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .update(settings)
      .eq('id', 'default');
    if (error) throw error;
    dispatchAppEvent('pb_settings_updated');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Inquiry[];
  } catch (err) {
    return [];
  }
}

export async function updateInquiryStatus(id: string, status: Inquiry['status']): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    dispatchAppEvent('pb_inquiry_updated');
    return true;
  } catch (err) {
    return false;
  }
}
