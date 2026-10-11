import { NextRequest, NextResponse } from 'next/server';
import { FARMER_TIER_CONFIGS, FarmerPlanTier } from '@/lib/server/monetization-domain';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: farmerId } = await params;
    const body = await request.json();
    const { tier, assignedBy = 'admin_super_01', reason } = body;

    if (!tier || !(tier in FARMER_TIER_CONFIGS)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid tier. Must be one of: ${Object.keys(FARMER_TIER_CONFIGS).join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'An auditable reason of at least 5 characters is required for commission tier changes.',
        },
        { status: 400 }
      );
    }

    const tierConfig = FARMER_TIER_CONFIGS[tier as FarmerPlanTier];

    // Create auditable assignment record
    const assignmentRecord = {
      id: `assign_${Date.now()}`,
      farmerId,
      assignedTier: tier,
      tierName: tierConfig.name,
      commissionRatePct: tierConfig.commissionRatePct,
      assignedBy,
      reason: reason.trim(),
      auditNote: 'Assigned via auditable administrative authorization. AI assignment strictly prohibited.',
      effectiveAt: new Date().toISOString(),
    };

    console.log(`[AdminTierAssignment] Farmer ${farmerId} assigned tier ${tier} by ${assignedBy}: ${reason}`);

    return NextResponse.json({
      success: true,
      message: `Farmer successfully upgraded to ${tierConfig.name} (${tierConfig.commissionRatePct}% platform fee).`,
      record: assignmentRecord,
    });
  } catch (error) {
    console.error('[AdminTierAssignment] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
