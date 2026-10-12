'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Home,
  Building2,
  ChevronDown,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Bed,
  Banknote,
  Maximize2,
} from 'lucide-react';
import { getProperties, Property } from '@/lib/db';

export interface SearchFilterState {
  purpose: 'Buy' | 'Rent' | 'Installment';
  city: string;
  location: string;
  type: string;
  subType: string;
  beds: string;
  minArea: string;
  maxArea: string;
  areaUnit: string;
  minPrice: string;
  maxPrice: string;
}

interface ZameenSearchWidgetProps {
  onFilterChange?: (filters: SearchFilterState) => void;
  onSearchSubmit?: (filters: SearchFilterState) => void;
}

const PRICE_PRESETS = [
  { label: 'Any Price', min: '', max: '' },
  { label: 'Under 50 Lac', min: '', max: '5000000' },
  { label: '50 Lac - 1 Crore', min: '5000000', max: '10000000' },
  { label: '1 Crore - 2 Crore', min: '10000000', max: '20000000' },
  { label: '2 Crore+', min: '20000000', max: '' },
];

export default function ZameenSearchWidget({
  onFilterChange,
  onSearchSubmit,
}: ZameenSearchWidgetProps) {
  const router = useRouter();

  // 1. Raw inventory from Properties Manager in Cloud Database
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Active Tab: STRICTLY Buy, Rent, 2-Year Installment
  const [activePurpose, setActivePurpose] = useState<'Buy' | 'Rent' | 'Installment'>('Buy');

  // 3. User Selected Filters (strictly populated from DB inventory)
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedType, setSelectedType] = useState('All Property Types');
  const [selectedArea, setSelectedArea] = useState('All Sizes');
  const [selectedBeds, setSelectedBeds] = useState('All Bedrooms');
  const [selectedPrice, setSelectedPrice] = useState('Any Price');

  // Load properties on mount and listen for real-time updates from admin panel
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getProperties({ limit: 100 });
        if (isMounted) {
          setAllProperties(res.properties || []);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Could not load inventory for search widget:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    const handleUpdate = () => {
      getProperties({ limit: 100 }).then((res) => {
        if (isMounted) setAllProperties(res.properties || []);
      });
    };

    window.addEventListener('pb_properties_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('pb_properties_updated', handleUpdate);
    };
  }, []);

  // Filter properties matching the active Purpose tab
  const purposeProperties = useMemo(() => {
    return allProperties.filter((p) => {
      if (activePurpose === 'Buy') return p.purpose === 'Buy' || p.purpose === 'Sale';
      if (activePurpose === 'Rent') return p.purpose === 'Rent';
      if (activePurpose === 'Installment') {
        return (
          p.purpose === 'Installment' ||
          p.purpose === '2-Year Installment' ||
          p.purpose === '2-Yr Installment'
        );
      }
      return false;
    });
  }, [allProperties, activePurpose]);

  // Available Cities in DB for this Purpose
  const availableCities = useMemo(() => {
    const citySet = new Set<string>();
    purposeProperties.forEach((p) => {
      if (p.city && p.city.trim()) {
        citySet.add(p.city.trim());
      }
    });
    return ['All Cities', ...Array.from(citySet).sort()];
  }, [purposeProperties]);

  // Auto-reset city if current city not available in this tab
  useEffect(() => {
    if (selectedCity !== 'All Cities' && !availableCities.includes(selectedCity)) {
      setSelectedCity('All Cities');
    }
  }, [availableCities, selectedCity]);

  // Properties matching Purpose + Selected City
  const cityProperties = useMemo(() => {
    if (selectedCity === 'All Cities') return purposeProperties;
    return purposeProperties.filter(
      (p) => p.city?.toLowerCase().trim() === selectedCity.toLowerCase().trim()
    );
  }, [purposeProperties, selectedCity]);

  // Available Locations in DB for this Purpose + City
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();

    cityProperties.forEach((p) => {
      if (p.address) {
        const parts = p.address.split(',').map((s) => s.trim()).filter(Boolean);
        parts.forEach((part) => {
          const lower = part.toLowerCase();
          if (
            lower.includes('block') ||
            lower.includes('citi housing') ||
            lower.includes('commercial market') ||
            lower.includes('samundri') ||
            lower.includes('gulberg') ||
            lower.includes('boulevard')
          ) {
            locSet.add(part);
          }
        });
      }

      if (p.title) {
        if (p.title.includes('Executive A Block')) locSet.add('Executive A Block');
        if (p.title.includes('Block B')) locSet.add('Block B');
        if (p.title.includes('Block C')) locSet.add('Block C');
        if (p.title.includes('Main Commercial Market')) locSet.add('11-AA Main Commercial Market');
        if (p.title.includes('Gulberg')) locSet.add('Gulberg III, Lahore');
      }
    });

    return ['All Locations', ...Array.from(locSet).sort()];
  }, [cityProperties]);

  // Auto-reset location if not available
  useEffect(() => {
    if (selectedLocation !== 'All Locations' && !availableLocations.includes(selectedLocation)) {
      setSelectedLocation('All Locations');
    }
  }, [availableLocations, selectedLocation]);

  // Properties matching Location
  const locationProperties = useMemo(() => {
    if (selectedLocation === 'All Locations') return cityProperties;
    const locLower = selectedLocation.toLowerCase().trim();
    return cityProperties.filter((p) => {
      return (
        (p.address && p.address.toLowerCase().includes(locLower)) ||
        (p.title && p.title.toLowerCase().includes(locLower))
      );
    });
  }, [cityProperties, selectedLocation]);

  // Available Property Types / Sub-types in DB
  const availableTypes = useMemo(() => {
    const typeSet = new Set<string>();
    locationProperties.forEach((p) => {
      if (p.sub_type && p.sub_type.trim()) {
        typeSet.add(p.sub_type.trim());
      } else if (p.property_type && p.property_type.trim()) {
        typeSet.add(p.property_type.trim());
      }
    });
    return ['All Property Types', ...Array.from(typeSet).sort()];
  }, [locationProperties]);

  // Auto-reset property type if not available
  useEffect(() => {
    if (selectedType !== 'All Property Types' && !availableTypes.includes(selectedType)) {
      setSelectedType('All Property Types');
    }
  }, [availableTypes, selectedType]);

  // Available Area Sizes in DB
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    locationProperties.forEach((p) => {
      if (p.area_value) {
        const val = p.area_value;
        const unit = p.area_unit || 'Marla';
        if (val === 20 && unit.toLowerCase() === 'marla') {
          sizeSet.add('1 Kanal (20 Marla)');
        } else {
          sizeSet.add(`${val} ${unit}`);
        }
      }
    });
    const sorted = Array.from(sizeSet).sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB;
    });
    return ['All Sizes', ...sorted];
  }, [locationProperties]);

  // Available Bedrooms in DB
  const availableBeds = useMemo(() => {
    const bedsSet = new Set<number>();
    let hasHomesWithBeds = false;

    locationProperties.forEach((p) => {
      if (p.bedrooms && p.bedrooms > 0) {
        hasHomesWithBeds = true;
        bedsSet.add(p.bedrooms);
      }
    });

    if (!hasHomesWithBeds) return null; // Only plots / commercial exist here
    const sorted = Array.from(bedsSet).sort((a, b) => a - b);
    return ['All Bedrooms', ...sorted.map((b) => `${b} Beds`)];
  }, [locationProperties]);

  // Auto-reset beds if switching to tab with no beds
  useEffect(() => {
    if (availableBeds === null) {
      setSelectedBeds('All Bedrooms');
    }
  }, [availableBeds]);

  // SUBMIT HANDLER: Redirects to /properties/?... page with all active filters
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();

    // 1. Purpose
    if (activePurpose) {
      params.set('purpose', activePurpose);
    }

    // 2. City
    if (selectedCity && selectedCity !== 'All Cities') {
      params.set('city', selectedCity);
    }

    // 3. Location
    if (selectedLocation && selectedLocation !== 'All Locations') {
      params.set('location', selectedLocation);
    }

    // 4. Sub-Type / Property Type
    if (selectedType && selectedType !== 'All Property Types') {
      params.set('sub_type', selectedType);
    }

    // 5. Area
    if (selectedArea && selectedArea !== 'All Sizes') {
      const match = selectedArea.match(/([0-9.]+)/);
      if (match) {
        params.set('min_area', match[1]);
        params.set('max_area', match[1]);
      }
    }

    // 6. Bedrooms
    if (availableBeds && selectedBeds && selectedBeds !== 'All Bedrooms') {
      const match = selectedBeds.match(/([0-9]+)/);
      if (match) {
        params.set('beds', match[1]);
      }
    }

    // 7. Price Bracket
    if (selectedPrice && selectedPrice !== 'Any Price') {
      const bracket = PRICE_PRESETS.find((p) => p.label === selectedPrice);
      if (bracket) {
        if (bracket.min) params.set('min_price', bracket.min);
        if (bracket.max) params.set('max_price', bracket.max);
      }
    }

    // Navigate user directly to properties directory page
    router.push(`/properties/?${params.toString()}`);
  };

  const handleReset = () => {
    setSelectedCity('All Cities');
    setSelectedLocation('All Locations');
    setSelectedType('All Property Types');
    setSelectedArea('All Sizes');
    setSelectedBeds('All Bedrooms');
    setSelectedPrice('Any Price');
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* 1. PURPOSE TABS (Buy, Rent, 2-Year Installment) */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0 px-2 sm:px-6 no-scrollbar relative z-30 -mb-px">
        {(
          [
            { id: 'Buy', label: 'Buy' },
            { id: 'Rent', label: 'Rent' },
            { id: 'Installment', label: '2-Year Installment' },
          ] as const
        ).map((tab) => {
          const isActive = activePurpose === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActivePurpose(tab.id);
                handleReset();
              }}
              className={`px-3.5 sm:px-7 py-2.5 sm:py-3.5 rounded-t-xl sm:rounded-t-2xl text-xs sm:text-sm font-black transition-all duration-150 shrink-0 border-t-2 border-x-2 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-950 border-t-emerald-600 border-x-slate-200/90 shadow-xs relative z-30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-transparent backdrop-blur-md'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. MAIN SEARCH FORM CONTAINER */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 z-20 overflow-hidden">
        <form onSubmit={handleSearch} className="p-3.5 sm:p-6 md:p-7 space-y-3 sm:space-y-4">
          {/* Responsive Form Grid: 2-Cols on Mobile, 12-Cols on Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5 sm:gap-4 items-end">
            {/* 1. CITY (Mobile: 1 Col, Desktop: 3 Cols) */}
            <div className="col-span-1 sm:col-span-3">
              <label className="block text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-slate-500 mb-1 sm:mb-1.5 truncate">
                City
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full h-10 sm:h-12 pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden transition cursor-pointer appearance-none shadow-xs"
                >
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. PROPERTY TYPE (Mobile: 1 Col, Desktop: 4 Cols) */}
            <div className="col-span-1 sm:col-span-4">
              <label className="block text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-slate-500 mb-1 sm:mb-1.5 truncate">
                Property Type
              </label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full h-10 sm:h-12 pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden transition cursor-pointer appearance-none shadow-xs"
                >
                  {availableTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. LOCATION / SOCIETY / BLOCK (Mobile: 2 Cols Full Width, Desktop: 5 Cols) */}
            <div className="col-span-2 sm:col-span-5">
              <label className="block text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-slate-500 mb-1 sm:mb-1.5 truncate">
                Location / Society / Block
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full h-10 sm:h-12 pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden transition cursor-pointer appearance-none shadow-xs"
                >
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 4. AREA RANGE (Mobile: 1 Col, Desktop: 3 Cols) */}
            <div className="col-span-1 sm:col-span-3">
              <label className="block text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-slate-500 mb-1 sm:mb-1.5 truncate">
                Area Range
              </label>
              <div className="relative">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full h-10 sm:h-12 pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden transition cursor-pointer appearance-none shadow-xs"
                >
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 5. PRICE RANGE (Mobile: 1 Col, Desktop: 3 Cols) */}
            <div className="col-span-1 sm:col-span-3">
              <label className="block text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-slate-500 mb-1 sm:mb-1.5 truncate">
                Price Range
              </label>
              <div className="relative">
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full h-10 sm:h-12 pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden transition cursor-pointer appearance-none shadow-xs"
                >
                  {PRICE_PRESETS.map((p) => (
                    <option key={p.label} value={p.label}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 6. BEDROOMS (Mobile: 2 Cols if active, Desktop: 3 Cols) */}
            <div className={`col-span-2 sm:col-span-3 ${availableBeds === null ? 'hidden sm:block' : ''}`}>
              <label className="block text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-slate-500 mb-1 sm:mb-1.5 truncate">
                Bedrooms
              </label>
              <div className="relative">
                <select
                  value={selectedBeds}
                  disabled={availableBeds === null}
                  onChange={(e) => setSelectedBeds(e.target.value)}
                  className={`w-full h-10 sm:h-12 pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 border rounded-xl text-xs sm:text-sm font-bold transition appearance-none shadow-xs ${
                    availableBeds === null
                      ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 focus:border-emerald-600 text-slate-900 cursor-pointer focus:outline-hidden'
                  }`}
                >
                  {availableBeds === null ? (
                    <option value="All Bedrooms">N/A (Plots &amp; Commercial)</option>
                  ) : (
                    availableBeds.map((bed) => (
                      <option key={bed} value={bed}>
                        {bed}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 7. FIND PROPERTY BUTTON (Mobile: 2 Cols Full Width, Desktop: 3 Cols) */}
            <div className={`col-span-2 ${availableBeds === null ? 'sm:col-span-6 lg:col-span-3' : 'sm:col-span-3'}`}>
              <button
                type="submit"
                className="w-full h-11 sm:h-12 px-4 sm:px-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Find Property</span>
              </button>
            </div>
          </div>

          {/* FOOTER STRIP: Dealer Assurance & Reset Button */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-extrabold text-slate-800">Property Bank:</span>
              <span className="truncate">
                Citi Housing Dealer • Properties Manager Sync
              </span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] sm:text-xs text-slate-400 hover:text-slate-800 font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
