/**
 * PRELIMINARY finance eligibility checks ONLY.
 * These rules never approve credit, never issue e-NWRs, never promise loans,
 * and never claim WDRA compliance. A human finance partner makes every decision.
 */
export interface EligibilityContext {
  farmerSinceDays: number;
  hasConsent: boolean;
  lotConfirmed: boolean; // graded lot exists
  lotValueRs: number;
  requestedAmountRs?: number;
  creditProfile?: 'unknown' | 'clean' | 'adverse';
  recentTransactions: number;
}

export interface PreliminaryEligibility {
  eligibleForPreliminaryStep: boolean;
  reasons: string[];
  actions: string[];
  ltvCapPct?: number;
  maxConsiderationRs?: number;
  disclaimer: string;
}

const DISCLAIMER =
  'Preliminary check only — no credit decision, no loan promise, no e-NWR issuance, no WDRA claim.';

export function preliminaryFinanceEligibility(ctx: EligibilityContext): PreliminaryEligibility {
  const reasons: string[] = [];
  const actions: string[] = [];

  if (!ctx.hasConsent) {
    reasons.push('Farmer consent has not been recorded.');
    actions.push('Collect explicit farmer consent before proceeding.');
  }
  if (ctx.farmerSinceDays < 30) {
    reasons.push('Farmer onboarding is newer than 30 days.');
  }
  if (!ctx.lotConfirmed || ctx.lotValueRs <= 0) {
    reasons.push('No graded, quantifiable lot value is available.');
  }
  if (ctx.requestedAmountRs !== undefined && ctx.requestedAmountRs > 0.9 * ctx.lotValueRs) {
    reasons.push('Requested amount exceeds 90% of eligible collateral value (LTV cap).');
  }
  if (ctx.creditProfile === 'adverse') {
    reasons.push('Adverse credit profile recorded on the farmer profile.');
  }

  const ltvCapPct = 0.8;
  const maxConsiderationRs = Math.round(ctx.lotValueRs * ltvCapPct);

  const eligible =
    reasons.filter((r) => r.startsWith('Farmer consent') === false).length === 0
      ? reasons.length === 0
      : false;

  actions.push('Create a partner case with consent-gated fields only.');
  actions.push('Forward to finance partner for human underwriting.');

  return {
    eligibleForPreliminaryStep: eligible,
    reasons,
    actions,
    ltvCapPct,
    maxConsiderationRs,
    disclaimer: DISCLAIMER,
  };
}