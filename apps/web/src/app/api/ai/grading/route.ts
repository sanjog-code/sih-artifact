import { NextRequest, NextResponse } from 'next/server';
import { assessProduceQuality, ProduceGradingParams } from '@/lib/ai/produce-grading';

export async function POST(request: NextRequest) {
  try {
    const body: ProduceGradingParams = await request.json();

    const result = assessProduceQuality(body);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Produce grading failed';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
