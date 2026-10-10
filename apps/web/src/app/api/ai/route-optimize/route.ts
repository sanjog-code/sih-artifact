import { NextRequest, NextResponse } from 'next/server';
import { solveCapacitatedVrp, VrpSolverParams } from '@/lib/ai/vrp-solver';

export async function POST(request: NextRequest) {
  try {
    const body: VrpSolverParams = await request.json();

    const result = solveCapacitatedVrp(body);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to optimize route';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
