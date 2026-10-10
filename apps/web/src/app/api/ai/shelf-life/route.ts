import { NextRequest, NextResponse } from 'next/server';
import { calculateShelfLifeDecay, ShelfLifeParams } from '@/lib/ai/shelf-life';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity') || 'Tomato';
    const currentQualityScore = searchParams.has('currentQualityScore')
      ? Number(searchParams.get('currentQualityScore'))
      : undefined;
    const storageDays = searchParams.has('storageDays')
      ? Number(searchParams.get('storageDays'))
      : undefined;
    const ambientTemperatureC = searchParams.has('ambientTemperatureC')
      ? Number(searchParams.get('ambientTemperatureC'))
      : undefined;
    const relativeHumidityPct = searchParams.has('relativeHumidityPct')
      ? Number(searchParams.get('relativeHumidityPct'))
      : undefined;
    const isColdStorage = searchParams.get('isColdStorage') === 'true';

    const result = calculateShelfLifeDecay({
      commodity,
      currentQualityScore,
      storageDays,
      ambientTemperatureC,
      relativeHumidityPct,
      isColdStorage,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Shelf-life calculation failed';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ShelfLifeParams = await request.json();

    const result = calculateShelfLifeDecay(body);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Shelf-life calculation failed';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
