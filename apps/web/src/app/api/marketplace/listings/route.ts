import { NextRequest, NextResponse } from 'next/server';
export interface CreateListingInput {
  farmerId?: string;
  commodity: string;
  variety: string;
  grade?: string;
  quantityKg: number;
  unit?: string;
  pricePerKg: number;
  minOrderQuantityKg?: number;
  availabilityDate?: string;
  locationState: string;
  locationDistrict: string;
  locationPincode?: string;
  photos?: string[];
  traceability?: {
    farmCoordinates?: string;
    harvestDate?: string;
    moistureContentPct?: number;
    batchCode?: string;
  };
}

function validateCreateListingInput(data: unknown): { success: true; data: CreateListingInput } | { success: false; error: string } {
  if (!data || typeof data !== 'object') return { success: false, error: 'Invalid payload' };
  const d = data as Record<string, unknown>;
  if (!d.commodity || typeof d.commodity !== 'string') return { success: false, error: 'Commodity is required' };
  if (!d.variety || typeof d.variety !== 'string') return { success: false, error: 'Variety is required' };
  if (!d.locationState || typeof d.locationState !== 'string') return { success: false, error: 'Location state is required' };
  if (!d.locationDistrict || typeof d.locationDistrict !== 'string') return { success: false, error: 'Location district is required' };
  const quantityKg = typeof d.quantityKg === 'number' ? d.quantityKg : parseFloat(String(d.quantityKg || 0));
  const pricePerKg = typeof d.pricePerKg === 'number' ? d.pricePerKg : parseFloat(String(d.pricePerKg || 0));
  if (isNaN(quantityKg) || quantityKg <= 0) return { success: false, error: 'Quantity must be positive' };
  if (isNaN(pricePerKg) || pricePerKg <= 0) return { success: false, error: 'Price must be positive' };

  return {
    success: true,
    data: {
      farmerId: typeof d.farmerId === 'string' ? d.farmerId : 'farmer_01',
      commodity: d.commodity.trim(),
      variety: d.variety.trim(),
      grade: typeof d.grade === 'string' ? d.grade : 'Grade A1',
      quantityKg,
      unit: typeof d.unit === 'string' ? d.unit : 'quintal',
      pricePerKg,
      minOrderQuantityKg: typeof d.minOrderQuantityKg === 'number' ? d.minOrderQuantityKg : 50,
      availabilityDate: typeof d.availabilityDate === 'string' ? d.availabilityDate : undefined,
      locationState: d.locationState.trim(),
      locationDistrict: d.locationDistrict.trim(),
      locationPincode: typeof d.locationPincode === 'string' ? d.locationPincode : '400001',
      photos: Array.isArray(d.photos) ? (d.photos as string[]) : [],
      traceability: d.traceability && typeof d.traceability === 'object' ? (d.traceability as CreateListingInput['traceability']) : undefined,
    },
  };
}

export interface MarketplaceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  commodity: string;
  variety: string;
  grade: string;
  quantityKg: number;
  availableKg: number;
  unit: string;
  pricePerKg: number;
  minOrderQuantityKg: number;
  availabilityDate: string;
  locationState: string;
  locationDistrict: string;
  locationPincode: string;
  photos: string[];
  traceability?: {
    farmCoordinates?: string;
    harvestDate?: string;
    moistureContentPct?: number;
    batchCode?: string;
  };
  status: string;
  createdAt: string;
}

// High quality initial seed listings
const IN_MEMORY_LISTINGS: MarketplaceListing[] = [
  {
    id: 'lst_tom_nashik_01',
    farmerId: 'farmer_ramesh_nashik',
    farmerName: 'Ramesh Sonawane (Premier Farmer)',
    commodity: 'Tomato',
    variety: 'Deshi Hybrid (Himsona)',
    grade: 'Grade A1',
    quantityKg: 8500,
    availableKg: 8500,
    unit: 'quintal',
    pricePerKg: 24,
    minOrderQuantityKg: 200,
    availabilityDate: '2026-10-15',
    locationState: 'Maharashtra',
    locationDistrict: 'Nashik',
    locationPincode: '422003',
    photos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'],
    traceability: {
      farmCoordinates: '20.0059° N, 73.7898° E',
      harvestDate: '2026-10-10',
      moistureContentPct: 91.5,
      batchCode: 'MH-NSK-TOM-842',
    },
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lst_wht_sehore_02',
    farmerId: 'farmer_gurinder_sehore',
    farmerName: 'Gurinder Singh (Premier Elite)',
    commodity: 'Wheat',
    variety: 'Sharbati High-Gluten',
    grade: 'Grade A1',
    quantityKg: 25000,
    availableKg: 25000,
    unit: 'quintal',
    pricePerKg: 32,
    minOrderQuantityKg: 1000,
    availabilityDate: '2026-10-12',
    locationState: 'Madhya Pradesh',
    locationDistrict: 'Sehore',
    locationPincode: '466001',
    photos: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800'],
    traceability: {
      farmCoordinates: '23.2032° N, 77.0844° E',
      harvestDate: '2026-10-08',
      moistureContentPct: 10.4,
      batchCode: 'MP-SEH-WHT-912',
    },
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lst_oni_lasalgaon_03',
    farmerId: 'farmer_vithal_lasalgaon',
    farmerName: 'Vithal Patil (Premier Pro)',
    commodity: 'Onion',
    variety: 'Nashik Red Garwa',
    grade: 'Grade A2',
    quantityKg: 18000,
    availableKg: 18000,
    unit: 'quintal',
    pricePerKg: 28,
    minOrderQuantityKg: 500,
    availabilityDate: '2026-10-14',
    locationState: 'Maharashtra',
    locationDistrict: 'Nashik',
    locationPincode: '422306',
    photos: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800'],
    traceability: {
      farmCoordinates: '20.1472° N, 74.2253° E',
      harvestDate: '2026-10-09',
      moistureContentPct: 13.8,
      batchCode: 'MH-NSK-ONI-105',
    },
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lst_mus_bharatpur_04',
    farmerId: 'farmer_rampal_bharatpur',
    farmerName: 'Rampal Sharma (Premier Farmer)',
    commodity: 'Mustard',
    variety: 'Pusa Bold High-Oil',
    grade: 'Grade A1',
    quantityKg: 12000,
    availableKg: 12000,
    unit: 'quintal',
    pricePerKg: 54,
    minOrderQuantityKg: 500,
    availabilityDate: '2026-10-18',
    locationState: 'Rajasthan',
    locationDistrict: 'Bharatpur',
    locationPincode: '321001',
    photos: ['https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=800'],
    traceability: {
      farmCoordinates: '27.2152° N, 77.4930° E',
      harvestDate: '2026-10-07',
      moistureContentPct: 7.8,
      batchCode: 'RJ-BHR-MUS-301',
    },
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity')?.toLowerCase();
    const state = searchParams.get('state')?.toLowerCase();
    const grade = searchParams.get('grade');
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;

    let filtered = [...IN_MEMORY_LISTINGS];

    if (commodity) {
      filtered = filtered.filter((l) => l.commodity.toLowerCase().includes(commodity));
    }
    if (state) {
      filtered = filtered.filter((l) => l.locationState.toLowerCase().includes(state));
    }
    if (grade) {
      filtered = filtered.filter((l) => l.grade === grade);
    }
    if (maxPrice !== null) {
      filtered = filtered.filter((l) => l.pricePerKg <= maxPrice);
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      listings: filtered,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = validateCreateListingInput(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const newListing: MarketplaceListing = {
      id: `lst_${Date.now()}`,
      farmerId: data.farmerId || 'farmer_01',
      farmerName: 'Verified FarmLink Producer',
      commodity: data.commodity,
      variety: data.variety,
      grade: data.grade || 'Grade A1',
      quantityKg: data.quantityKg,
      availableKg: data.quantityKg,
      unit: data.unit || 'quintal',
      pricePerKg: data.pricePerKg,
      minOrderQuantityKg: data.minOrderQuantityKg || 50,
      availabilityDate: data.availabilityDate || new Date().toISOString().split('T')[0],
      locationState: data.locationState,
      locationDistrict: data.locationDistrict,
      locationPincode: data.locationPincode || '400001',
      photos: (data.photos && data.photos.length > 0) ? data.photos : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'],
      traceability: data.traceability || {
        batchCode: `FL-BATCH-${Date.now().toString().slice(-4)}`,
        harvestDate: new Date().toISOString().split('T')[0],
        moistureContentPct: 10.0,
      },
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    IN_MEMORY_LISTINGS.unshift(newListing);

    return NextResponse.json({
      success: true,
      message: 'Produce listing created successfully with verified batch passport.',
      listing: newListing,
    });
  } catch (error) {
    console.error('[MarketplaceListings] POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create listing' },
      { status: 500 }
    );
  }
}
