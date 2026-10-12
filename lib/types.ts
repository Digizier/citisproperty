export interface SiteSettings {
  id: string;
  company_name: string;
  company_tagline: string;
  address: string;
  phone: string;
  phone_secondary: string;
  whatsapp: string;
  email: string;
  google_maps_url: string;
  google_reviews_url: string;
  facebook_url: string;
  hero_title: string;
  hero_subtitle: string;
  logo_url: string;
  banner_url: string;
}

export interface Society {
  id: string;
  name: string;
  slug: string;
  city: string;
  location: string;
  description?: string;
  image_url?: string;
  master_plan_pdf_url?: string;
  master_plan_image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
}

export interface SocietyBlock {
  id: string;
  society_id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Plot {
  id: string;
  society_id: string;
  block_id?: string;
  plot_number: string;
  plot_type: 'Residential' | 'Commercial';
  size_marla: number;
  unit: string;
  price: number;
  status: 'Available' | 'Reserved' | 'Sold';
  street?: string;
  is_corner?: boolean;
  is_park_facing?: boolean;
  is_main_boulevard?: boolean;
  coord_x?: number;
  coord_y?: number;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
}

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id?: string;
  sub_category_id?: string;
  society_id?: string;
  block_id?: string;
  plot_id?: string;
  purpose: 'Buy' | 'Sale' | 'Rent' | 'Installment' | string;
  property_type: 'Plot' | 'House' | 'Commercial' | 'Homes' | 'Plots' | string;
  sub_type?: string;
  price: number;
  secret_bottom_price?: number;
  down_payment?: number;
  possession_payment?: number;
  installment_duration?: string;
  area_value: number;
  area_unit: string;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  thumbnail_url: string;
  gallery_urls: string[];
  features: string[];
  is_featured: boolean;
  is_verified: boolean;
  status: 'Available' | 'Under Token' | 'Sold';
  contact_person: string;
  contact_phone: string;
  contact_whatsapp: string;
  created_at?: string;
  updated_at?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  cta_label: string;
  cta_link: string;
  image_desktop_url: string;
  image_mobile_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  property_id?: string;
  plot_id?: string;
  message: string;
  intent: 'Buy' | 'Rent' | 'Installment';
  status: 'New' | 'Contacted' | 'Follow-up' | 'Closed';
  assigned_to?: string;
  notes?: string;
  created_at?: string;
}
