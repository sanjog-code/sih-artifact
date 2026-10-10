import { NextRequest, NextResponse } from 'next/server';
import { generateForecast } from '@/lib/ai/forecast';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity') || 'Tomato';
    const state = searchParams.get('state') || undefined;
    const district = searchParams.get('district') || undefined;
    const market = searchParams.get('market') || undefined;
    const storageDays = searchParams.has('storageDays')
      ? Number(searchParams.get('storageDays'))
      : undefined;

    const result = generateForecast({
      commodity,
      state,
      district,
      market,
      storageDays,
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown forecast failure';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
