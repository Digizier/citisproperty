'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Building2,
  MapPin,
  Check,
} from 'lucide-react';
import {
  getProperties,
  getCategories,
  getSocieties,
  getSocietyBlocks,
  Property,
  Category,
  Society,
  SocietyBlock,
} from '@/lib/db';
import PropertyCard from '@/components/PropertyCard';
import { GridSkeleton } from '@/components/ShimmerSkeleton';

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters from URL
  const currentCategory = searchParams.get('category') || '';
  const currentSubCategory = searchParams.get('sub_category') || '';
  const currentPurpose = searchParams.get('purpose') || 'All';
  const currentType = searchParams.get('type') || 'All';
  const currentSubType = searchParams.get('sub_type') || '';
  const currentCity = searchParams.get('city') || '';
  const currentLocation = searchParams.get('location') || '';
  const currentBeds = searchParams.get('beds') || '';
  const currentMinPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
  const currentMaxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
  const currentMinArea = searchParams.get('min_area') ? parseFloat(searchParams.get('min_area')!) : undefined;
  const currentMaxArea = searchParams.get('max_area') ? parseFloat(searchParams.get('max_area')!) : undefined;
  const currentAreaUnit = searchParams.get('area_unit') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Data states
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [blocks, setBlocks] = useState<SocietyBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states (Strict 9 items per page rule - 3x3 grid)
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Local filter modal state for mobile
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState(currentPurpose);
  const [selectedType, setSelectedType] = useState(currentType);
  const [keyword, setKeyword] = useState(currentSearch || currentLocation);
  const [selectedCity, setSelectedCity] = useState(currentCity);

  // Fetch categories and societies on mount
  useEffect(() => {
    getCategories().then(setCategories);
    getSocieties().then((socs) => {
      setSocieties(socs);
      if (socs.length > 0) {
        getSocietyBlocks(socs[0].id).then(setBlocks);
      }
    });
  }, []);

  // Fetch properties whenever query params change
  useEffect(() => {
    setLoading(true);
    getProperties({
      categorySlug: currentCategory || undefined,
      subCategorySlug: currentSubCategory || undefined,
      purpose: currentPurpose !== 'All' ? currentPurpose : undefined,
      propertyType: currentType !== 'All' ? currentType : undefined,
      subType: currentSubType || undefined,
      city: currentCity || undefined,
      location: currentLocation || undefined,
      bedrooms: currentBeds || undefined,
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      minArea: currentMinArea,
      maxArea: currentMaxArea,
      areaUnit: currentAreaUnit || undefined,
      search: currentSearch || undefined,
      page: currentPage,
      limit: 9, // STRICT 9 items per page rule (3x3 grid)
    }).then((res) => {
      setProperties(res.properties);
      setTotalItems(res.total);
      setTotalPages(res.totalPages);
      setLoading(false);
    });

    const handleUpdate = () => {
      getProperties({
        categorySlug: currentCategory || undefined,
        subCategorySlug: currentSubCategory || undefined,
        purpose: currentPurpose !== 'All' ? currentPurpose : undefined,
        propertyType: currentType !== 'All' ? currentType : undefined,
        subType: currentSubType || undefined,
        city: currentCity || undefined,
        location: currentLocation || undefined,
        bedrooms: currentBeds || undefined,
        minPrice: currentMinPrice,
        maxPrice: currentMaxPrice,
        minArea: currentMinArea,
        maxArea: currentMaxArea,
        areaUnit: currentAreaUnit || undefined,
        search: currentSearch || undefined,
        page: currentPage,
        limit: 9,
      }).then((res) => {
        setProperties(res.properties);
        setTotalItems(res.total);
        setTotalPages(res.totalPages);
      });
    };

    window.addEventListener('pb_properties_updated', handleUpdate);
    return () => window.removeEventListener('pb_properties_updated', handleUpdate);
  }, [
    currentCategory,
    currentSubCategory,
    currentPurpose,
    currentType,
    currentSubType,
    currentCity,
    currentLocation,
    currentBeds,
    currentMinPrice,
    currentMaxPrice,
    currentMinArea,
    currentMaxArea,
    currentAreaUnit,
    currentSearch,
    currentPage,
  ]);

  const applyFilters = (newPage = 1) => {
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (currentSubCategory) params.set('sub_category', currentSubCategory);
    if (selectedPurpose && selectedPurpose !== 'All') params.set('purpose', selectedPurpose);
    if (selectedType && selectedType !== 'All') params.set('type', selectedType);
    if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
    if (keyword.trim()) params.set('search', keyword.trim());
    if (newPage > 1) params.set('page', newPage.toString());

    router.push(`/properties/?${params.toString()}`);
    setFilterDrawerOpen(false);
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    router.push(`/properties/?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const resetFilters = () => {
    setSelectedPurpose('All');
    setSelectedType('All');
    setSelectedCity('');
    setKeyword('');
    router.push('/properties/');
    setFilterDrawerOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Properties & Plots Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified residential, commercial, and installment properties in Citi Housing Faisalabad.
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Filter Properties</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid: Desktop Sidebar Filter (3 cols) + Listings (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sticky Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm sticky top-24 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span className="font-extrabold text-sm text-slate-900">Filters</span>
            </div>
            {(currentPurpose !== 'All' || currentType !== 'All' || currentSearch) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Keyword / Block</label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters(1)}
                placeholder="e.g. 5 Marla, Block B..."
                className="w-full px-3 py-2 pl-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Purpose Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Payment Purpose</label>
            <div className="flex flex-col gap-1">
              {[
                { label: 'All Offerings', val: 'All' },
                { label: 'Buy / Cash Sale', val: 'Buy' },
                { label: '2-Year Installments', val: 'Installment' },
                { label: 'For Rent', val: 'Rent' },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => {
                    setSelectedPurpose(p.val);
                    const params = new URLSearchParams(searchParams.toString());
                    if (p.val === 'All') params.delete('purpose');
                    else params.set('purpose', p.val);
                    params.set('page', '1');
                    router.push(`/properties/?${params.toString()}`);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition flex items-center justify-between ${
                    (currentPurpose || 'All') === p.val
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{p.label}</span>
                  {(currentPurpose || 'All') === p.val && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Property Type</label>
            <div className="flex flex-col gap-1">
              {[
                { label: 'All Property Types', val: 'All' },
                { label: 'Residential Plots', val: 'Plot' },
                { label: 'Commercial Plots', val: 'Commercial' },
                { label: 'Houses & Villas', val: 'House' },
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => {
                    setSelectedType(t.val);
                    const params = new URLSearchParams(searchParams.toString());
                    if (t.val === 'All') params.delete('type');
                    else params.set('type', t.val);
                    params.set('page', '1');
                    router.push(`/properties/?${params.toString()}`);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition flex items-center justify-between ${
                    (currentType || 'All') === t.val
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.label}</span>
                  {(currentType || 'All') === t.val && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Marla Chips */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">Popular Sizes</label>
            <div className="flex flex-wrap gap-1.5">
              {['5 Marla', '7 Marla', '10 Marla', '1 Kanal'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('search', m);
                    params.set('type', 'Plot');
                    params.set('page', '1');
                    router.push(`/properties/?${params.toString()}`);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-semibold transition"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => applyFilters(1)}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition shadow-sm"
          >
            Apply Filters
          </button>
        </div>

        {/* Right Listings Column (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Active Filter Pills Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Active Filter:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedPurpose('All');
                applyFilters(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                currentPurpose === 'All'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Offerings
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPurpose('Installment');
                const params = new URLSearchParams(searchParams.toString());
                params.set('purpose', 'Installment');
                params.set('page', '1');
                router.push(`/properties/?${params.toString()}`);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                currentPurpose === 'Installment'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              2-Year Installments
            </button>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('purpose', 'Sale');
                params.set('page', '1');
                router.push(`/properties/?${params.toString()}`);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                currentPurpose === 'Sale'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Direct Cash Sale
            </button>

            {currentCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                <span>Category: {currentCategory}</span>
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('category');
                    params.set('page', '1');
                    router.push(`/properties/?${params.toString()}`);
                  }}
                  className="hover:text-red-700 font-black ml-1"
                  aria-label="Remove category filter"
                >
                  ✕
                </button>
              </span>
            )}
            {currentSubCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                <span>Sub-Category: {currentSubCategory}</span>
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('sub_category');
                    params.set('page', '1');
                    router.push(`/properties/?${params.toString()}`);
                  }}
                  className="hover:text-red-700 font-black ml-1"
                  aria-label="Remove sub-category filter"
                >
                  ✕
                </button>
              </span>
            )}

            {(currentPurpose !== 'All' || currentType !== 'All' || currentCategory || currentSubCategory || currentSearch) && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Result Count Status */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{properties.length}</span> of{' '}
              <span className="font-bold text-slate-800">{totalItems}</span> properties
            </div>
            <div>
              Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </div>
          </div>

          {/* Property Cards Grid (3 Columns) */}
          {loading ? (
            <GridSkeleton count={9} />
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No properties matched your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search terms or clearing active filters to see all available inventory.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STRICT 9-ITEM PAGINATION CONTROLS (1, 2, 3, 4, 5... Next, Prev) */}
      {totalPages > 1 && (
        <nav aria-label="Pagination Navigation" className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-bold"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Numbered Page Buttons */}
          {getPageNumbers().map((item, idx) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-slate-400 font-bold text-xs select-none"
                >
                  …
                </span>
              );
            }
            const pageNum = Number(item);
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 sm:w-10 h-9 sm:h-10 rounded-xl text-xs font-bold transition ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/50'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Page ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-bold"
            aria-label="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}

      {/* Filter Modal / Drawer for Mobile & Desktop */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Filter Properties
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Keyword or Plot Number
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Plot 45, 5 Marla, Block B"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Payment / Purpose
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'All Offerings', val: 'All' },
                  { label: 'Buy / Cash', val: 'Buy' },
                  { label: '2-Yr Installment', val: 'Installment' },
                  { label: 'For Rent', val: 'Rent' },
                ].map((pur) => (
                  <button
                    key={pur.val}
                    type="button"
                    onClick={() => setSelectedPurpose(pur.val)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      selectedPurpose === pur.val
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Property Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['All', 'Plot', 'House', 'Commercial'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      selectedType === t
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'All' ? 'All Categories' : t === 'Plot' ? 'Plots' : t === 'House' ? 'Houses' : 'Commercial'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => applyFilters(1)}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><GridSkeleton count={9} /></div>}>
      <PropertiesContent />
    </Suspense>
  );
}
