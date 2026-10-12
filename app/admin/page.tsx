'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Building2,
  MapPin,
  Compass,
  FolderTree,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  Printer,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  Eye,
  LogOut,
  Upload,
  RefreshCw,
  Search,
  ExternalLink,
  Phone,
  Sparkles,
  ShieldCheck,
  FileText,
  Download,
  Crosshair,
  Check,
  Layers,
} from 'lucide-react';
import {
  getProperties,
  getPropertyBySlug,
  getSocieties,
  getSocietyBlocks,
  getPlots,
  getCategories,
  getSubCategories,
  getBanners,
  getInquiries,
  getSiteSettings,
  updateInquiryStatus,
  adminSaveProperty,
  adminDeleteProperty,
  adminSavePlot,
  adminDeletePlot,
  adminSaveBanner,
  adminDeleteBanner,
  adminSaveCategory,
  adminDeleteCategory,
  adminSaveSubCategory,
  adminDeleteSubCategory,
  adminSaveSiteSettings,
  adminSaveSociety,
  adminDeleteSociety,
  adminSaveSocietyBlock,
  adminDeleteSocietyBlock,
  Property,
  Society,
  SocietyBlock,
  Plot,
  Category,
  SubCategory,
  Banner,
  Inquiry,
  SiteSettings,
  DEFAULT_SETTINGS,
} from '@/lib/db';
import { uploadImageToStorage, uploadMultipleImagesToStorage, uploadPdfToStorage } from '@/lib/imageCompression';
import { formatPricePKR } from '@/components/PropertyCard';
import AdminConfirmModal from '@/components/AdminConfirmModal';
import PropertyBrochurePrint from '@/components/PropertyBrochurePrint';

type AdminTab =
  | 'dashboard'
  | 'properties'
  | 'plots'
  | 'categories'
  | 'banners'
  | 'inquiries'
  | 'brochure'
  | 'settings';

const ADMIN_CITIES = [
  'Faisalabad',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Karachi',
  'Multan',
  'Peshawar',
  'Gujranwala',
  'Sialkot',
];

const ADMIN_CATEGORIES: Record<string, string[]> = {
  Plots: ['Residential Plot', 'Commercial Plot', 'Plot File', 'Agricultural Land', 'Industrial Land'],
  Homes: ['House', 'Flat', 'Upper Portion', 'Lower Portion', 'Farm House', 'Penthouse', 'Room'],
  Commercial: ['Office', 'Shop', 'Warehouse', 'Factory', 'Building'],
};

const PRESET_SPEC_VARIABLES = [
  'Facing',
  'Floors / Stories',
  'Kitchens',
  'Car Parking / Porch',
  'Road Width',
  'Servant Quarters',
  'Furnishing Status',
  'Construction Year',
  'Plot / House Number',
  'Sector / Block',
  'Development Status',
  'Frontage / Dimensions',
  'Corner / View',
  'Electricity Meter',
  'Gas Supply',
  'Rental Potential',
];

const POPULAR_REAL_ESTATE_FEATURES = [
  'Main Boulevard Commercial',
  'High Rental Yield',
  'Huge Footfall',
  'Basement + 4 Floor Permission',
  'Corner Plot',
  'Park Facing',
  'West Open',
  '100ft Wide Road',
  '80ft Wide Road',
  'Underground Electricity',
  'Sui Gas Available',
  'Water Supply Active',
  '24/7 Gated Security',
  'Possession Ready',
  '100% Clear File',
  'Near Commercial Broadway',
  'Near Jamia Masjid',
  'Near Glow Park & Zoo',
  'Near School & Healthcare',
  'Double Story Constructed',
  'Solid Ash Wood Doors',
  'Imported Sanitary Fittings',
  'Dedicated Car Porch',
  'Designer Kitchen',
  'Roof Top Access',
  'Ready for Immediate Transfer',
];

export default function AdminPage() {
  // 1. PIN Gate Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // 3. Data States
  const [properties, setProperties] = useState<Property[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [blocks, setBlocks] = useState<SocietyBlock[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Confirm Delete
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Property Form State
  const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [customFeatureInput, setCustomFeatureInput] = useState('');
  const [customSpecs, setCustomSpecs] = useState<{ id: string; name: string; value: string }[]>([]);

  // Category & Sub-Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState('');

  // Society & Map PDF Form State
  const [selectedSocietyIdForPlots, setSelectedSocietyIdForPlots] = useState<string>('');
  const [editingSociety, setEditingSociety] = useState<Partial<Society> | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  } | null>(null);

  // Banner Form State
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

  // Brochure Generator State
  const [selectedBrochureProperty, setSelectedBrochureProperty] = useState<Property | null>(null);
  const [showAdminBrochureModal, setShowAdminBrochureModal] = useState(false);

  // Check Session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = sessionStorage.getItem('pb_admin_auth');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch all Admin Data once authenticated
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [pRes, socRes, catRes, banRes, inqRes, setRes] = await Promise.all([
        getProperties({ limit: 50 }),
        getSocieties(false),
        getCategories(),
        getBanners(),
        getInquiries(),
        getSiteSettings(),
      ]);

      setProperties(pRes.properties);
      setSocieties(socRes);
      setCategories(catRes);
      setBanners(banRes);
      setInquiries(inqRes);
      setSettings(setRes);

      if (socRes.length > 0) {
        const curSocId = selectedSocietyIdForPlots || socRes[0].id;
        setSelectedSocietyIdForPlots(curSocId);
      }

      if (catRes.length > 0) {
        setSelectedParentCategoryId(catRes[0].id);
        const subRes = await getSubCategories();
        setSubCategories(subRes);
      }

      if (pRes.properties.length > 0) {
        setSelectedBrochureProperty(pRes.properties[0]);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    setUploadingPdf(true);
    try {
      const publicUrl = await uploadPdfToStorage(file);
      if (editingSociety) {
        setEditingSociety({ ...editingSociety, master_plan_pdf_url: publicUrl });
      }
      showToast('Master Plan PDF uploaded to Cloud Storage!');
    } catch (err: any) {
      alert(`PDF upload error: ${err.message || 'Failed to upload PDF'}`);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSaveSociety = async () => {
    if (!editingSociety || !editingSociety.name) {
      alert('Please enter society / map title.');
      return;
    }
    const res = await adminSaveSociety(editingSociety);
    if (res.success) {
      showToast('Society & Master Plan PDF updated in Cloud Database!');
      const updatedSocs = await getSocieties(false);
      setSocieties(updatedSocs);
      setEditingSociety(null);
    } else {
      alert(`Failed to save society: ${res.error || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('pb_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('pb_admin_auth');
    setPinInput('');
  };

  // Image Upload Handler using WebP canvas compression
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const publicUrl = await uploadImageToStorage(file);
      onUploaded(publicUrl);
      showToast('Image compressed to WebP & uploaded to Cloud Storage!');
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Failed to upload'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Multiple Gallery Images Upload Handler with WebP compression
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      const urls = await uploadMultipleImagesToStorage(files);
      const existing = editingProperty?.gallery_urls || [];
      const combined = Array.from(new Set([...existing, ...urls]));
      setEditingProperty((prev) =>
        prev
          ? {
              ...prev,
              gallery_urls: combined,
              thumbnail_url: prev.thumbnail_url || combined[0],
            }
          : null
      );
      showToast(`${urls.length} gallery photos compressed to WebP & uploaded!`);
    } catch (err: any) {
      alert(`Gallery upload error: ${err.message || 'Failed to upload images'}`);
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    if (!editingProperty) return;
    const existing = editingProperty.gallery_urls || [];
    const updated = existing.filter((_, idx) => idx !== indexToRemove);
    setEditingProperty({ ...editingProperty, gallery_urls: updated });
    showToast('Image removed from gallery.');
  };

  const handleSetMainCover = (url: string) => {
    if (!editingProperty) return;
    setEditingProperty({ ...editingProperty, thumbnail_url: url });
    showToast('Set as main cover image!');
  };

  const handleToggleFeature = (feat: string) => {
    if (!editingProperty) return;
    const current = editingProperty.features || [];
    if (current.includes(feat)) {
      setEditingProperty({
        ...editingProperty,
        features: current.filter((f) => f !== feat),
      });
    } else {
      setEditingProperty({
        ...editingProperty,
        features: [...current, feat],
      });
    }
  };

  const handleAddCustomFeature = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customFeatureInput.trim() || !editingProperty) return;
    const current = editingProperty.features || [];
    if (!current.includes(customFeatureInput.trim())) {
      setEditingProperty({
        ...editingProperty,
        features: [...current, customFeatureInput.trim()],
      });
    }
    setCustomFeatureInput('');
  };

  const insertDescriptionTemplate = (type: 'plot' | 'house' | 'commercial') => {
    if (!editingProperty) return;
    let template = '';
    if (type === 'plot') {
      template = `Prime location residential plot situated in Citi Housing (Phase II) Samundri Road, Faisalabad. 100% verified clear file with direct biometric transfer at Citi Housing Head Office. Ideal for immediate house construction and high capital appreciation. Features 24/7 gated security, underground electrification, sweet water, and wide carpeted roads.`;
    } else if (type === 'house') {
      template = `Newly constructed modern luxury double-story house in Citi Housing Phase II, Samundri Road, Faisalabad. Built with premium materials, solid ash wood doors, imported sanitary fittings, 2 designer kitchens, attached washrooms with all master bedrooms, spacious car porch, and roof-top access. Immediate possession ready for your family.`;
    } else if (type === 'commercial') {
      template = `High-visibility commercial plot/property located in AA Main Commercial Market, Citi Housing Phase II, Samundri Road, Faisalabad. Heavy customer footfall, 80ft-100ft wide commercial boulevard, perfect for multi-story shopping plaza, corporate offices, or retail outlets. High rental yield and guaranteed commercial growth.`;
    }
    setEditingProperty({ ...editingProperty, description: template });
    showToast('Description template inserted!');
  };

  const openNewProperty = () => {
    setCustomSpecs([]);
    setEditingProperty({
      title: '',
      slug: '',
      description:
        'Prime location property situated in Citi Housing (Phase II) Samundri Road, Faisalabad. 100% verified clear file with direct biometric transfer at Citi Housing Head Office. Excellent capital growth potential.',
      purpose: 'Buy',
      property_type: 'Plots',
      sub_type: 'Residential Plot',
      price: 4250000,
      secret_bottom_price: 4100000,
      down_payment: 1700000,
      possession_payment: 2550000,
      installment_duration: '2 Years (8 Quarters)',
      area_value: 5,
      area_unit: 'Marla',
      bedrooms: 0,
      bathrooms: 0,
      address: 'Citi Housing Phase II, Samundri Road, Faisalabad',
      city: 'Faisalabad',
      features: [
        '24/7 Gated Security',
        'Underground Electricity',
        'Sui Gas Available',
        '100% Clear File',
        'Wide Roads',
      ],
      status: 'Available',
      is_verified: true,
      is_featured: false,
      thumbnail_url: '/images/hero-banner.png',
      gallery_urls: ['/images/hero-banner.png'],
      contact_person: 'Asif Sadiq',
      contact_phone: '0302-8658450',
      contact_whatsapp: '923028658450',
    });
  };

  const openEditProperty = (p: Property) => {
    const specs = (p.features || [])
      .filter((f) => f.includes(':'))
      .map((f, i) => {
        const idx = f.indexOf(':');
        return {
          id: `spec-${i}-${Date.now()}`,
          name: f.slice(0, idx).trim(),
          value: f.slice(idx + 1).trim(),
        };
      });
    setCustomSpecs(specs);
    setEditingProperty(p);
  };

  const handleAddSpecField = () => {
    setCustomSpecs((prev) => [
      ...prev,
      { id: `spec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: '', value: '' },
    ]);
  };

  const handleUpdateSpecField = (id: string, field: 'name' | 'value', value: string) => {
    setCustomSpecs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleDeleteSpecField = (id: string) => {
    setCustomSpecs((prev) => prev.filter((s) => s.id !== id));
  };

  // --- PIN GATE AUTH VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-white space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Property Bank Admin
            </h1>
            <p className="text-xs text-slate-400">
              Enter authorized Master Security PIN to manage citisproperty.com
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (Default: admin123)"
                className="w-full text-center tracking-widest text-lg px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-extrabold focus:outline-hidden focus:border-amber-400"
              />
              {pinError && (
                <p className="text-red-400 text-xs font-bold mt-1.5">
                  Invalid PIN. Default is admin123
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-lg transition"
            >
              Access Admin Dashboard
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 font-medium"
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN ADMIN PANEL VIEW (NO PUBLIC HEADER/FOOTER) ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 px-2">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <div className="text-xs font-extrabold text-white tracking-wide">
                PROPERTY BANK
              </div>
              <div className="text-[10px] text-amber-400 font-semibold uppercase">
                Admin Control Hub
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: Building2 },
              { id: 'properties', label: 'Properties Manager', icon: Building2 },
              { id: 'plots', label: 'Plot & Society Maps (PDF)', icon: FileText },
              { id: 'categories', label: 'Categories & Subs', icon: FolderTree },
              { id: 'banners', label: 'Hero Banners', icon: ImageIcon },
              { id: 'inquiries', label: 'Inquiries & Leads', icon: MessageSquare, badge: inquiries.length },
              { id: 'brochure', label: 'A4 Brochure Print', icon: Printer },
              { id: 'settings', label: 'Site Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-extrabold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions in Sidebar */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Website</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold transition border border-red-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Dashboard Overview
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Live sync with Cloud Database project <span className="text-amber-400 font-mono">jyfxflqsqlngwpfjleiy</span>
                </p>
              </div>

              <button
                type="button"
                onClick={loadAdminData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Data</span>
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Properties</span>
                <div className="text-2xl font-extrabold text-white mt-1">{properties.length}</div>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Available Plots</span>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">{plots.length}</div>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Customer Inquiries</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">{inquiries.length}</div>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Active Banners</span>
                <div className="text-2xl font-extrabold text-white mt-1">{banners.length}</div>
              </div>
            </div>

            {/* Recent Inquiries Quick Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-white">Recent Customer Leads</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('inquiries')}
                  className="text-amber-400 text-xs font-bold hover:underline"
                >
                  View All Leads →
                </button>
              </div>

              {inquiries.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No leads received yet.</p>
              ) : (
                <div className="divide-y divide-slate-800 text-xs">
                  {inquiries.slice(0, 5).map((inq) => (
                    <div key={inq.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-white">{inq.name}</div>
                        <div className="text-slate-400">{inq.phone} • {inq.intent}</div>
                      </div>
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Reply WhatsApp</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROPERTIES MANAGER */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Properties & Inventory Manager
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Add, edit, and delete property listings with WebP image compression.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewProperty}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Property</span>
              </button>
            </div>

            {/* Property Edit / Create Modal */}
            {editingProperty && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-black text-lg text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-400" />
                      <span>{editingProperty.id ? 'Edit Property Listing' : 'Create New Property Listing'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customize all public product page sections, description, features, payment plan, and multi-image gallery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>

                {/* 1. LISTING PURPOSE & CATEGORY SELECTOR */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      1. Listing Purpose &amp; Classification
                    </span>
                    <span className="text-[10px] text-slate-400">Controls search filters &amp; product badges</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(['Buy', 'Rent', 'Installment'] as const).map((purp) => (
                      <button
                        key={purp}
                        type="button"
                        onClick={() => {
                          const isInst = purp === 'Installment';
                          const defaultDown = isInst && editingProperty.price
                            ? Math.round(editingProperty.price * 0.4)
                            : editingProperty.down_payment;
                          setEditingProperty({
                            ...editingProperty,
                            purpose: purp,
                            down_payment: defaultDown,
                            installment_duration: isInst ? '2 Years (8 Quarters)' : 'No Installment',
                          });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                          (editingProperty.purpose || 'Buy') === purp
                            ? 'bg-amber-500 text-slate-950 shadow-md scale-102'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {purp === 'Installment' ? '2-Year Installments' : purp === 'Rent' ? 'For Rent' : 'For Sale'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    {/* Category */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Category *</label>
                      <select
                        value={editingProperty.property_type || 'Plots'}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          const defaultSub = (ADMIN_CATEGORIES[newCat] && ADMIN_CATEGORIES[newCat][0]) || '';
                          setEditingProperty({
                            ...editingProperty,
                            property_type: newCat,
                            sub_type: defaultSub,
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                      >
                        <option value="Plots">Plots</option>
                        <option value="Homes">Homes</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>

                    {/* Sub-Category */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Sub-Category *</label>
                      <select
                        value={editingProperty.sub_type || (ADMIN_CATEGORIES[editingProperty.property_type || 'Plots']?.[0] || '')}
                        onChange={(e) => setEditingProperty({ ...editingProperty, sub_type: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                      >
                        {(ADMIN_CATEGORIES[editingProperty.property_type || 'Plots'] || ['Residential Plot']).map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">City *</label>
                      <select
                        value={editingProperty.city || 'Faisalabad'}
                        onChange={(e) => setEditingProperty({ ...editingProperty, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                      >
                        {ADMIN_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. TITLE & PHYSICAL ADDRESS */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      2. Property Title &amp; Address
                    </span>
                    <span className="text-[10px] text-slate-400">Primary display on product page</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Title */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-300">Property Title *</label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Web Address auto-syncs with Title
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={editingProperty.title || ''}
                        onChange={(e) => {
                          const title = e.target.value;
                          const autoSlug = title
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)+/g, '');
                          setEditingProperty({
                            ...editingProperty,
                            title,
                            slug: autoSlug || 'property-listing',
                          });
                        }}
                        placeholder="e.g. 10 Marla Near Road 60 - Wide Executive"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-hidden focus:border-amber-400"
                      />
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-0.5">
                        <span className="text-amber-400 font-bold">🔗 Live Web Address:</span>
                        <span className="text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          /properties/{editingProperty.slug || (editingProperty.title ? editingProperty.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'auto-generated')}
                        </span>
                        <span className="text-[10px] text-slate-500">(Auto-generated from title)</span>
                      </div>
                    </div>

                    {/* Address / Society Location */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Address / Society Location *</label>
                      <input
                        type="text"
                        required
                        value={editingProperty.address || ''}
                        onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        placeholder="e.g. Street 4, Block B, Citi Housing Phase II, Samundri Road, Faisalabad"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. DIMENSIONS, ROOMS & CUSTOM SPECIFICATIONS */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      3. Dimensions, Rooms &amp; Custom Specifications
                    </span>
                    <span className="text-[10px] text-slate-400">Custom numbers &amp; dynamic real estate variables</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {/* Area Value */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Area Value *</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={editingProperty.area_value ?? 5}
                        onChange={(e) => setEditingProperty({ ...editingProperty, area_value: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                      />
                    </div>

                    {/* Area Unit */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Area Unit *</label>
                      <select
                        value={editingProperty.area_unit || 'Marla'}
                        onChange={(e) => setEditingProperty({ ...editingProperty, area_unit: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                      >
                        <option value="Marla">Marla</option>
                        <option value="Kanal">Kanal</option>
                        <option value="Square Feet">Square Feet</option>
                        <option value="Square Yards">Square Yards</option>
                      </select>
                    </div>

                    {/* Bedrooms (Custom Count Number Input) */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Bedrooms (Custom Count)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={editingProperty.bedrooms ?? ''}
                        onChange={(e) =>
                          setEditingProperty({
                            ...editingProperty,
                            bedrooms: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                          })
                        }
                        placeholder="e.g. 0, 1, 2, 3, 4..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                      />
                    </div>

                    {/* Bathrooms (Custom Count Number Input) */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Bathrooms (Custom Count)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={editingProperty.bathrooms ?? ''}
                        onChange={(e) =>
                          setEditingProperty({
                            ...editingProperty,
                            bathrooms: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                          })
                        }
                        placeholder="e.g. 0, 1, 2, 3, 4..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                      />
                    </div>
                  </div>

                  {/* DYNAMIC ADDITIONAL SPECIFICATIONS & CUSTOM FIELDS */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-black text-xs text-amber-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Additional Property Specifications &amp; Variable Fields</span>
                        </label>
                        <p className="text-[10px] text-slate-400">
                          Add any custom real estate variable (Facing, Road Width, Floors, Kitchens, Car Porch, etc.) with custom values.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddSpecField}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-bold transition shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Specification Field</span>
                      </button>
                    </div>

                    {/* Datalist for preset variable names */}
                    <datalist id="preset-variables">
                      {PRESET_SPEC_VARIABLES.map((v) => (
                        <option key={v} value={v} />
                      ))}
                    </datalist>

                    {/* Custom Specs Rows */}
                    {customSpecs.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                        No additional specification fields added. Click <span className="text-amber-400 font-bold">&quot;Add Specification Field&quot;</span> to specify Facing, Road Width, Floors, Kitchens, Car Porch, etc.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {customSpecs.map((spec) => (
                          <div
                            key={spec.id}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800"
                          >
                            <div className="w-full sm:w-1/3">
                              <label className="text-[10px] text-slate-400 font-bold block sm:hidden mb-1">
                                Variable Name (Preset or Custom)
                              </label>
                              <input
                                type="text"
                                list="preset-variables"
                                value={spec.name}
                                onChange={(e) => handleUpdateSpecField(spec.id, 'name', e.target.value)}
                                placeholder="Variable (e.g. Facing, Road Width...)"
                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 text-xs font-bold focus:border-amber-400"
                              />
                            </div>

                            <div className="w-full sm:flex-1">
                              <label className="text-[10px] text-slate-400 font-bold block sm:hidden mb-1">
                                Variable Value
                              </label>
                              <input
                                type="text"
                                value={spec.value}
                                onChange={(e) => handleUpdateSpecField(spec.id, 'value', e.target.value)}
                                placeholder="Value (e.g. Park Facing, 60 Feet, Double Storey, 2 Cars...)"
                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-amber-400"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteSpecField(spec.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 self-end sm:self-center transition"
                              title="Delete Specification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. PRICING & 2-YEAR INSTALLMENTS BREAKDOWN */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      4. Financial Pricing &amp; Installment Schedule
                    </span>
                    <span className="text-[10px] text-slate-400">All prices in PKR</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Total Asking Price */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Total Price (PKR) *</label>
                      <input
                        type="number"
                        required
                        value={editingProperty.price || 0}
                        onChange={(e) => {
                          const newPrice = parseFloat(e.target.value) || 0;
                          const newDown = editingProperty.purpose === 'Installment' ? Math.round(newPrice * 0.4) : editingProperty.down_payment;
                          setEditingProperty({ ...editingProperty, price: newPrice, down_payment: newDown });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                      />
                    </div>

                    {/* Secret Bottom Price */}
                    <div className="space-y-1">
                      <label className="font-bold text-amber-400">Secret Bottom Margin (PKR)</label>
                      <input
                        type="number"
                        value={editingProperty.secret_bottom_price || ''}
                        onChange={(e) => setEditingProperty({ ...editingProperty, secret_bottom_price: parseFloat(e.target.value) })}
                        placeholder="Internal dealer bottom price"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300"
                      />
                    </div>

                    {/* Down Payment */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-300">Down Payment (PKR)</label>
                        {editingProperty.price ? (
                          <button
                            type="button"
                            onClick={() => setEditingProperty({ ...editingProperty, down_payment: Math.round((editingProperty.price || 0) * 0.4) })}
                            className="text-[10px] text-amber-400 hover:underline"
                          >
                            Set 40%
                          </button>
                        ) : null}
                      </div>
                      <input
                        type="number"
                        value={editingProperty.down_payment || ''}
                        onChange={(e) => setEditingProperty({ ...editingProperty, down_payment: parseFloat(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>

                    {/* Possession Payment */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">On Possession (PKR)</label>
                      <input
                        type="number"
                        value={editingProperty.possession_payment || ''}
                        onChange={(e) => setEditingProperty({ ...editingProperty, possession_payment: parseFloat(e.target.value) })}
                        placeholder="On final handover"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  {/* Installment Calculator Toggle */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={editingProperty.purpose === 'Installment' || (Boolean(editingProperty.down_payment) && editingProperty.installment_duration !== 'No Installment')}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditingProperty({
                            ...editingProperty,
                            purpose: checked ? 'Installment' : 'Buy',
                            installment_duration: checked ? '2 Years (8 Quarters)' : 'No Installment',
                            down_payment: checked ? (editingProperty.down_payment || Math.round((editingProperty.price || 0) * 0.4)) : undefined,
                          });
                        }}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                      />
                      <span>Show 2-Year Installment Calculator on Product Page</span>
                    </label>

                    {editingProperty.price && editingProperty.down_payment && editingProperty.price > editingProperty.down_payment ? (
                      <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Est. Quarterly: PKR {Math.round((editingProperty.price - editingProperty.down_payment) / 8).toLocaleString()} (x8)
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* 5. PROPERTY DESCRIPTION (RICH TEXTAREA + 1-CLICK TEMPLATES) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        5. Property Description
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Displayed under "Property Description" on product page and in A4 brochure.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">Fast Templates:</span>
                      <button
                        type="button"
                        onClick={() => insertDescriptionTemplate('plot')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold"
                      >
                        + Plot
                      </button>
                      <button
                        type="button"
                        onClick={() => insertDescriptionTemplate('house')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold"
                      >
                        + House
                      </button>
                      <button
                        type="button"
                        onClick={() => insertDescriptionTemplate('commercial')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold"
                      >
                        + Commercial
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProperty({ ...editingProperty, description: '' })}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-300 text-[10px] font-bold"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={editingProperty.description || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                    placeholder="Enter detailed property description, architectural overview, investment potential, and location perks..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs leading-relaxed focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                {/* 6. KEY FEATURES & AMENITIES (CURATED PILLS + CUSTOM INPUT) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        6. Key Features &amp; Amenities
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Displayed under "Key Features &amp; Amenities" with green checkmarks on product page.
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-amber-400">
                      {(editingProperty.features || []).filter((f) => !f.includes(':')).length} Amenities Selected
                    </span>
                  </div>

                  {/* Selected Features Badges */}
                  <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {(editingProperty.features && editingProperty.features.filter((f) => !f.includes(':')).length > 0) ? (
                      editingProperty.features.filter((f) => !f.includes(':')).map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleFeature(feat)}
                            className="text-amber-400 hover:text-red-400 font-black ml-1"
                            title="Remove feature"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic p-1">
                        No amenity badges added yet. Click curated badges below or add custom features.
                      </span>
                    )}
                  </div>

                  {/* Add Custom Feature Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customFeatureInput}
                      onChange={(e) => setCustomFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomFeature();
                        }
                      }}
                      placeholder="Type custom feature and click Add (e.g. West Open, Tile Flooring)..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomFeature()}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                    >
                      + Add Feature
                    </button>
                  </div>

                  {/* Curated One-Click Feature Badges */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                      Click to Add / Remove Popular Real Estate Badges:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                      {POPULAR_REAL_ESTATE_FEATURES.map((feat) => {
                        const isSelected = editingProperty.features?.includes(feat);
                        return (
                          <button
                            key={feat}
                            type="button"
                            onClick={() => handleToggleFeature(feat)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                            <span>{feat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 7. MULTI-IMAGE PHOTOGRAPHIC SHOWCASE (MAIN + GALLERY) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        7. Photographic Showcase &amp; Multi-Image Gallery
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Auto-compressed into lightweight WebP in KBs for fast loading and low storage footprint.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      {(editingProperty.gallery_urls?.length || 0) + (editingProperty.thumbnail_url ? 1 : 0)} Photos Total
                    </span>
                  </div>

                  {/* Primary Cover Image */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Primary Cover Photo (Thumbnail on Directory &amp; Cards)</span>
                    </span>

                    <div className="flex items-center gap-4">
                      {editingProperty.thumbnail_url ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-amber-400 shrink-0 relative group">
                          <img
                            src={editingProperty.thumbnail_url}
                            alt="Main Cover"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 bg-slate-950/80 text-amber-400 text-[8px] font-bold px-1 rounded">
                            Cover
                          </span>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 text-xs shrink-0">
                          No Cover
                        </div>
                      )}

                      <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold cursor-pointer transition shadow-md">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingImage ? 'Compressing & Uploading...' : 'Upload Main Cover'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={(e) =>
                            handleFileUpload(e, (url) =>
                              setEditingProperty({ ...editingProperty, thumbnail_url: url })
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Multi-Image Gallery Showcase */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Multiple Gallery Photos ({editingProperty.gallery_urls?.length || 0})</span>
                      </span>

                      <label className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition">
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>{uploadingGallery ? 'Uploading Gallery...' : '+ Add Multiple Images'}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={uploadingGallery}
                          onChange={handleGalleryUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Gallery Thumbnails Grid */}
                    {(editingProperty.gallery_urls && editingProperty.gallery_urls.length > 0) ? (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {editingProperty.gallery_urls.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="relative h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group"
                          >
                            <img
                              src={imgUrl}
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 p-1">
                              <button
                                type="button"
                                onClick={() => handleSetMainCover(imgUrl)}
                                className="text-[9px] px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded hover:bg-amber-400 transition"
                                title="Make this image the main thumbnail"
                              >
                                Set Cover
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="text-[9px] px-1.5 py-0.5 bg-red-600 text-white font-bold rounded hover:bg-red-500 transition"
                                title="Remove photo"
                              >
                                Delete
                              </button>
                            </div>
                            <span className="absolute bottom-1 right-1 bg-slate-950/80 text-white text-[8px] px-1 rounded">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        No additional gallery images uploaded yet. Select multiple image files to upload at once.
                      </div>
                    )}
                  </div>
                </div>

                {/* 8. AGENT CONTACT OVERRIDES & BADGES */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      8. Dealership Agent Contacts &amp; Visibility Badges
                    </span>
                    <span className="text-[10px] text-slate-400">Direct client connection</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Contact Person */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Authorized Agent Name</label>
                      <input
                        type="text"
                        value={editingProperty.contact_person || 'Asif Sadiq'}
                        onChange={(e) => setEditingProperty({ ...editingProperty, contact_person: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Contact Phone</label>
                      <input
                        type="text"
                        value={editingProperty.contact_phone || '0302-8658450'}
                        onChange={(e) => setEditingProperty({ ...editingProperty, contact_phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">WhatsApp Number</label>
                      <input
                        type="text"
                        value={editingProperty.contact_whatsapp || '923028658450'}
                        onChange={(e) => setEditingProperty({ ...editingProperty, contact_whatsapp: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  {/* Badges & Status Switches */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 items-center">
                    {/* Status */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 text-xs">Listing Status</label>
                      <select
                        value={editingProperty.status || 'Available'}
                        onChange={(e) => setEditingProperty({ ...editingProperty, status: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs"
                      >
                        <option value="Available">Available</option>
                        <option value="Under Token">Under Token</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </div>

                    {/* Verified Badge */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 font-bold text-xs pt-4 sm:pt-0">
                      <input
                        type="checkbox"
                        checked={editingProperty.is_verified ?? true}
                        onChange={(e) => setEditingProperty({ ...editingProperty, is_verified: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                      />
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Verified 100% File Badge</span>
                      </span>
                    </label>

                    {/* Featured Badge */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 font-bold text-xs pt-4 sm:pt-0">
                      <input
                        type="checkbox"
                        checked={editingProperty.is_featured ?? false}
                        onChange={(e) => setEditingProperty({ ...editingProperty, is_featured: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                      />
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Featured on Homepage</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* MODAL BOTTOM ACTION BUTTONS */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProperty(null);
                      setCustomSpecs([]);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingProperty.title || !editingProperty.price) {
                        alert('Title and Price are required.');
                        return;
                      }

                      const autoSlug = (editingProperty.slug || editingProperty.title)
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '') || 'property-listing';

                      const baseAmenities = (editingProperty.features || []).filter((f) => !f.includes(':'));
                      const validSpecs = customSpecs
                        .filter((s) => s.name.trim() && s.value.trim())
                        .map((s) => `${s.name.trim()}: ${s.value.trim()}`);
                      const mergedFeatures = [...baseAmenities, ...validSpecs];

                      const payload: Partial<Property> = {
                        ...editingProperty,
                        slug: autoSlug,
                        features: mergedFeatures,
                      };

                      const res = await adminSaveProperty(payload);
                      if (res.success) {
                        showToast('Property listing successfully saved in Cloud Database!');
                        setEditingProperty(null);
                        setCustomSpecs([]);
                        loadAdminData();
                      } else {
                        alert(`Error saving property: ${res.error}`);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-lg transition active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Property Listing</span>
                  </button>
                </div>
              </div>
            )}

            {/* Properties List Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Property</th>
                    <th className="p-4">Demand</th>
                    <th className="p-4">Bottom Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.thumbnail_url || '/images/hero-banner.png'}
                          alt={p.title}
                          className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white line-clamp-1">{p.title}</div>
                          <div className="text-[11px] text-slate-400">
                            {p.area_value} {p.area_unit} • {p.purpose === 'Installment' ? '2-Year Installment' : p.purpose}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-white">{formatPricePKR(p.price)}</td>
                      <td className="p-4 font-bold text-amber-400">
                        {p.secret_bottom_price ? formatPricePKR(p.secret_bottom_price) : '—'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Available'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBrochureProperty(p);
                            setShowAdminBrochureModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 transition"
                          title="Print Official A4 Brochure"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditProperty(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                          title="Edit Property"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Delete Property',
                              message: `Are you sure you want to permanently delete "${p.title}" from Cloud Database?`,
                              onConfirm: async () => {
                                await adminDeleteProperty(p.id);
                                showToast('Property deleted successfully.');
                                loadAdminData();
                              },
                            });
                          }}
                          className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white"
                          title="Delete Property"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PLOT & SOCIETY MAP (PDF DOWNLOADS MANAGER) */}
        {activeTab === 'plots' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/30 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Master Plan PDF Downloads &amp; Blueprints</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Plot &amp; Society Map Manager
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload, update, and manage official society master plan PDFs (PDF 1, PDF 2, PDF 3...). Users download these on the public website.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditingSociety({
                      name: '',
                      city: 'Faisalabad',
                      location: 'Samundri Road, Faisalabad',
                      description: 'Official high-definition master plan layout blueprint with residential and commercial sectors.',
                      master_plan_pdf_url: '/maps/property-bank-master-plan.pdf',
                      master_plan_image_url: '/maps/citi-housing-master-plan-hd.webp',
                      is_active: true,
                      is_featured: false,
                    })
                  }
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Upload New PDF Map</span>
                </button>
              </div>
            </div>

            {/* SOCIETY PDF MAPS TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="font-extrabold text-sm text-white">
                    Uploaded Society Map PDFs ({societies.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Synced directly with Cloud Database &amp; Storage
                </span>
              </div>

              {societies.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-400">No Society Map PDFs Uploaded Yet</p>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingSociety({
                        name: 'Citi Housing (Phase II) Samundri Road',
                        city: 'Faisalabad',
                        location: 'Samundri Road, Faisalabad',
                        description: 'Official master plan layout blueprint.',
                        master_plan_pdf_url: '/maps/property-bank-master-plan.pdf',
                        master_plan_image_url: '/maps/citi-housing-master-plan-hd.webp',
                        is_active: true,
                        is_featured: true,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
                  >
                    + Add First Master Plan PDF
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-3.5 sm:p-4">Map #</th>
                        <th className="p-3.5 sm:p-4">Society / Title</th>
                        <th className="p-3.5 sm:p-4">City &amp; Location</th>
                        <th className="p-3.5 sm:p-4">Attached PDF File</th>
                        <th className="p-3.5 sm:p-4">Status</th>
                        <th className="p-3.5 sm:p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {societies.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3.5 sm:p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-extrabold text-[11px] border border-amber-500/30">
                              PDF #{idx + 1}
                            </span>
                          </td>
                          <td className="p-3.5 sm:p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                                <img
                                  src={s.master_plan_image_url || '/maps/citi-housing-master-plan-hd.webp'}
                                  alt={s.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-extrabold text-white text-sm">{s.name}</div>
                                <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                  {s.description || 'Master plan layout blueprint'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 sm:p-4">
                            <div className="font-bold text-slate-200">{s.city}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">
                              {s.location || 'Samundri Road'}
                            </div>
                          </td>
                          <td className="p-3.5 sm:p-4 font-mono text-[11px]">
                            {s.master_plan_pdf_url ? (
                              <div className="flex items-center gap-1.5 max-w-xs truncate text-amber-400">
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{s.master_plan_pdf_url}</span>
                              </div>
                            ) : (
                              <span className="text-red-400">No PDF Attached</span>
                            )}
                          </td>
                          <td className="p-3.5 sm:p-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold w-fit ${
                                  s.is_active
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {s.is_active ? 'Active' : 'Disabled'}
                              </span>
                              {s.is_featured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 w-fit">
                                  ★ Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 sm:p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {s.master_plan_pdf_url && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPdfPreviewModal({
                                        isOpen: true,
                                        url: s.master_plan_pdf_url!,
                                        title: s.name,
                                      })
                                    }
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                                    title="Preview PDF Map"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                                  </button>
                                  <a
                                    href={s.master_plan_pdf_url}
                                    download
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                                    title="Download PDF"
                                  >
                                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                                  </a>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => setEditingSociety(s)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                                title="Edit Society &amp; PDF Details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Delete PDF Map',
                                    message: `Are you sure you want to delete "${s.name}" and remove this master plan PDF from Cloud Database?`,
                                    onConfirm: async () => {
                                      await adminDeleteSociety(s.id);
                                      showToast('Society PDF Map deleted.');
                                      loadAdminData();
                                    },
                                  });
                                }}
                                className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition cursor-pointer"
                                title="Delete Map"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* EDIT / UPLOAD PDF MODAL */}
            {editingSociety && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
                <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <h3 className="font-extrabold text-base text-white">
                        {editingSociety.id ? `Edit PDF Map: ${editingSociety.name}` : 'Upload New Society Master Plan PDF'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingSociety(null)}
                      className="text-slate-400 hover:text-white text-sm p-1.5"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-300 mb-1">
                        Society / Map Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingSociety.name || ''}
                        onChange={(e) => setEditingSociety({ ...editingSociety, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                        placeholder="e.g. Citi Housing (Phase II) Samundri Road or Property Bank Blueprint"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        list="admin-cities-list"
                        value={editingSociety.city || ''}
                        onChange={(e) => setEditingSociety({ ...editingSociety, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                        placeholder="e.g. Faisalabad"
                      />
                      <datalist id="admin-cities-list">
                        {ADMIN_CITIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Location Address</label>
                      <input
                        type="text"
                        value={editingSociety.location || ''}
                        onChange={(e) => setEditingSociety({ ...editingSociety, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                        placeholder="e.g. Samundri Road, Faisalabad"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-300 mb-1">Overview Description</label>
                      <textarea
                        rows={2}
                        value={editingSociety.description || ''}
                        onChange={(e) => setEditingSociety({ ...editingSociety, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed"
                        placeholder="Brief overview of blocks, roads, facilities, and master layout..."
                      />
                    </div>

                    {/* PDF File Upload Section */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-amber-400">
                          Master Plan PDF Document *
                        </label>
                        <span className="text-[10px] text-slate-400">PDF File up to 50MB</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={editingSociety.master_plan_pdf_url || ''}
                          onChange={(e) => setEditingSociety({ ...editingSociety, master_plan_pdf_url: e.target.value })}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono text-[11px]"
                          placeholder="/maps/property-bank-master-plan.pdf or Cloud Storage URL"
                        />

                        <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-amber-500/50 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs cursor-pointer transition shrink-0">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>{uploadingPdf ? 'Uploading...' : 'Upload PDF File'}</span>
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            disabled={uploadingPdf}
                            onChange={handlePdfUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Quick Presets */}
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSociety({
                              ...editingSociety,
                              master_plan_pdf_url: '/maps/property-bank-master-plan.pdf',
                              master_plan_image_url: '/maps/citi-housing-master-plan-hd.webp',
                            });
                            showToast('Attached Property Bank Master Plan PDF (20.9 MB)!');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700 transition"
                        >
                          Property Bank (1) PDF (20.9 MB)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSociety({
                              ...editingSociety,
                              master_plan_pdf_url: '/maps/citi-housing-phase2-master-plan.pdf',
                              master_plan_image_url: '/maps/citi-housing-master-plan-hd.webp',
                            });
                            showToast('Attached Citi Housing Phase II PDF (20.9 MB)!');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700 transition"
                        >
                          Citi Housing Phase II PDF (20.9 MB)
                        </button>
                      </div>
                    </div>

                    {/* Blueprint Preview Thumbnail Image */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-300">
                          Blueprint Thumbnail / Preview Image (Optional)
                        </label>
                        <span className="text-[10px] text-slate-400">WebP / JPG / PNG</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={editingSociety.master_plan_image_url || ''}
                          onChange={(e) => setEditingSociety({ ...editingSociety, master_plan_image_url: e.target.value })}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px]"
                          placeholder="/maps/citi-housing-master-plan-hd.webp"
                        />

                        <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-blue-500/50 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-bold text-xs cursor-pointer transition shrink-0">
                          <Upload className="w-3.5 h-3.5 text-blue-400" />
                          <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingImage}
                            onChange={(e) =>
                              handleFileUpload(e, (url) => {
                                setEditingSociety({ ...editingSociety, master_plan_image_url: url });
                              })
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Visibility Toggles */}
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingSociety.is_active)}
                          onChange={(e) => setEditingSociety({ ...editingSociety, is_active: e.target.checked })}
                          className="w-4 h-4 rounded-md border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <span className="font-bold text-slate-200">Active (Visible for Public Download)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingSociety.is_featured)}
                          onChange={(e) => setEditingSociety({ ...editingSociety, is_featured: e.target.checked })}
                          className="w-4 h-4 rounded-md border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <span className="font-bold text-slate-200">★ Featured Map</span>
                      </label>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingSociety(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!editingSociety.name) {
                          alert('Please enter society / map title.');
                          return;
                        }
                        const res = await adminSaveSociety(editingSociety);
                        if (res.success) {
                          showToast('Society PDF Map saved to Cloud Database!');
                          setEditingSociety(null);
                          loadAdminData();
                        } else {
                          alert(`Error saving society: ${res.error}`);
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
                    >
                      Save PDF Map
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* IN-ADMIN PDF PREVIEW MODAL */}
            {showPdfPreviewModal && showPdfPreviewModal.isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
                <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span className="font-extrabold text-sm text-white truncate">
                        {showPdfPreviewModal.title} — PDF Preview
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={showPdfPreviewModal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Tab</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowPdfPreviewModal(null)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:text-white text-slate-400 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 w-full bg-slate-950">
                    <iframe
                      src={`${showPdfPreviewModal.url}#toolbar=1&navpanes=0`}
                      className="w-full h-full border-0"
                      title={showPdfPreviewModal.title}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* TAB 4: CATEGORIES & NESTED SUB-CATEGORIES MANAGER */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Categories & Nested Sub-Categories
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Add parent categories and attach multiple nested sub-categories to each.
              </p>
            </div>

            {/* Add Parent Category Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-xs uppercase text-slate-400">
                Create Parent Category
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Industrial Properties, Farm Houses"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newCategoryName.trim()) return;
                    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    await adminSaveCategory({ name: newCategoryName.trim(), slug });
                    setNewCategoryName('');
                    showToast('Parent category created!');
                    loadAdminData();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold"
                >
                  Add Category
                </button>
              </div>
            </div>

            {/* Hierarchical Categories & Sub-Categories Tree */}
            <div className="space-y-4">
              {categories.map((cat) => {
                const childSubs = subCategories.filter((s) => s.category_id === cat.id);
                return (
                  <div
                    key={cat.id}
                    className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-5 h-5 text-amber-500" />
                        <h4 className="font-extrabold text-sm text-white">{cat.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">({cat.slug})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Delete Category',
                            message: `Delete parent category "${cat.name}" and all its subcategories?`,
                            onConfirm: async () => {
                              await adminDeleteCategory(cat.id);
                              showToast('Category deleted.');
                              loadAdminData();
                            },
                          });
                        }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Child Sub-Categories Badges */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Nested Sub-Categories ({childSubs.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {childSubs.map((sub) => (
                          <span
                            key={sub.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700"
                          >
                            <span>{sub.name}</span>
                            <button
                              type="button"
                              onClick={async () => {
                                await adminDeleteSubCategory(sub.id);
                                showToast('Sub-category removed.');
                                loadAdminData();
                              }}
                              className="text-slate-400 hover:text-red-400 font-bold"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Add Sub-Category Input to this Category */}
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Add sub-category to ${cat.name}...`}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            const val = input.value.trim();
                            if (!val) return;
                            const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            await adminSaveSubCategory({
                              category_id: cat.id,
                              name: val,
                              slug,
                            });
                            input.value = '';
                            showToast(`Sub-category added to ${cat.name}!`);
                            loadAdminData();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-amber-400"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">
                        Press Enter to add
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: HERO BANNERS & SLIDER */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Hero Banners & Slider Manager
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload desktop and mobile banners with real WebP compression.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingBanner({
                    title: 'Citi Housing Samundri Road',
                    subtitle: '2-Year Installments with 40% Down Payment',
                    cta_label: 'View Listings',
                    cta_link: '/properties/',
                    image_desktop_url: '/images/hero-banner.png',
                    is_active: true,
                    display_order: banners.length + 1,
                  })
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Banner</span>
              </button>
            </div>

            {/* Banner Edit Form */}
            {editingBanner && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-white">
                    {editingBanner.id ? 'Edit Banner' : 'Create New Hero Banner'}
                  </h3>
                  <button type="button" onClick={() => setEditingBanner(null)} className="text-slate-400">
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-300">Banner Headline *</label>
                    <input
                      type="text"
                      required
                      value={editingBanner.title || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-300">Subtitle / Description</label>
                    <input
                      type="text"
                      value={editingBanner.subtitle || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Button Label</label>
                    <input
                      type="text"
                      value={editingBanner.cta_label || 'Explore'}
                      onChange={(e) => setEditingBanner({ ...editingBanner, cta_label: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Button Link</label>
                    <input
                      type="text"
                      value={editingBanner.cta_link || '/properties/'}
                      onChange={(e) => setEditingBanner({ ...editingBanner, cta_link: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  {/* Banner Image Uploader */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-300">
                      Banner Image (Desktop & Mobile)
                    </label>
                    <div className="flex items-center gap-4">
                      {editingBanner.image_desktop_url && (
                        <img
                          src={editingBanner.image_desktop_url}
                          alt="preview"
                          className="w-24 h-14 object-cover rounded-xl border border-slate-700"
                        />
                      )}
                      <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Banner Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={(e) =>
                            handleFileUpload(e, (url) =>
                              setEditingBanner({ ...editingBanner, image_desktop_url: url })
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingBanner(null)}
                    className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingBanner.title) return;
                      await adminSaveBanner(editingBanner);
                      showToast('Hero banner saved!');
                      setEditingBanner(null);
                      loadAdminData();
                    }}
                    className="px-5 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-extrabold shadow-md"
                  >
                    Save Banner
                  </button>
                </div>
              </div>
            )}

            {/* Banners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banners.map((ban) => (
                <div
                  key={ban.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-4"
                >
                  <img
                    src={ban.image_desktop_url}
                    alt={ban.title}
                    className="w-full h-36 object-cover rounded-xl"
                  />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-white">{ban.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{ban.subtitle}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-amber-400 font-bold">{ban.cta_label}</span>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingBanner(ban)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Delete Banner',
                            message: `Delete banner "${ban.title}"?`,
                            onConfirm: async () => {
                              await adminDeleteBanner(ban.id);
                              showToast('Banner deleted.');
                              loadAdminData();
                            },
                          });
                        }}
                        className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: INQUIRIES & LEADS */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Customer Inquiries & Leads CRM
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Leads captured from property listings, Plot Finder, and contact forms.
              </p>
            </div>

            {inquiries.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center text-slate-400 text-xs">
                No inquiries submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="font-extrabold text-base text-white">{inq.name}</div>
                        <div className="text-xs text-slate-400">
                          Phone: <a href={`tel:${inq.phone}`} className="text-amber-400 font-bold">{inq.phone}</a> • Intent: <strong className="text-white">{inq.intent}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Switcher */}
                        <select
                          value={inq.status}
                          onChange={async (e) => {
                            await updateInquiryStatus(inq.id, e.target.value as any);
                            showToast(`Status updated to ${e.target.value}!`);
                            loadAdminData();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Closed">Closed</option>
                        </select>

                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Assalam-o-Alaikum ${inq.name}, I am Asif Sadiq from Property Bank Real Estate (Citi Housing Samundri Road). I received your inquiry.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      &quot;{inq.message || 'No additional message provided.'}&quot;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: A4 BROCHURE GENERATOR & PRINT */}
        {activeTab === 'brochure' && (
          <div className="space-y-6">
            <div className="no-print flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  A4 Printable Property Brochure
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  High-contrast, professional pure-white PDF/Print layout for client presentations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedBrochureProperty?.id || ''}
                  onChange={(e) => {
                    const found = properties.find((p) => p.id === e.target.value);
                    if (found) setSelectedBrochureProperty(found);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print A4 Brochure</span>
                </button>
              </div>
            </div>

            {/* Pristine Pure White Printable Brochure Preview */}
            {selectedBrochureProperty && (
              <PropertyBrochurePrint property={selectedBrochureProperty} />
            )}
          </div>
        )}

        {/* TAB 8: SITE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Global Site Settings
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Centralized company information feeding all headers, footers, and WhatsApp buttons.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Head Office Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Primary Phone (Asif Sadiq)</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Secondary Phone (Rana Adnan)</label>
                  <input
                    type="text"
                    value={settings.phone_secondary}
                    onChange={(e) => setSettings({ ...settings, phone_secondary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-emerald-400">WhatsApp Helpline (Digits only with 92)</label>
                  <input
                    type="text"
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Google Review URL</label>
                  <input
                    type="text"
                    value={settings.google_reviews_url}
                    onChange={(e) => setSettings({ ...settings, google_reviews_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await adminSaveSiteSettings(settings);
                    if (res.success) {
                      showToast('Settings successfully updated!');
                    } else {
                      alert(`Error: ${res.error}`);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md transition"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interactive On-Screen Brochure Preview Modal */}
      {showAdminBrochureModal && selectedBrochureProperty && (
        <div className="no-print">
          <PropertyBrochurePrint
            property={selectedBrochureProperty}
            isModal={true}
            onClose={() => setShowAdminBrochureModal(false)}
          />
        </div>
      )}
    </div>
  );
}
