import { preliminaryFinanceEligibility, type EligibilityContext } from '../src/rules/finance';

const base: EligibilityContext = {
  farmerSinceDays: 400,
  hasConsent: true,
  lotConfirmed: true,
  lotValueRs: 100_000,
  requestedAmountRs: 50_000,
  recentTransactions: 12,
};

describe('preliminary finance eligibility', () => {
  it('requires explicit farmer consent before anything', () => {
    const r = preliminaryFinanceEligibility({ ...base, hasConsent: false });
    expect(r.reasons.some((x) => /consent/i.test(x))).toBe(true);
    expect(r.eligibleForPreliminaryStep).toBe(false);
  });

  it('never promises loans and carries a disclaimer', () => {
    const r = preliminaryFinanceEligibility(base);
    expect(r.disclaimer).toContain('no loan promise');
    expect(r.disclaimer).toContain('no e-NWR issuance');
  });

  it('caps consideration at 80% LTV', () => {
    const r = preliminaryFinanceEligibility({ ...base, requestedAmountRs: 95_000 });
    expect(r.maxConsiderationRs).toBe(80_000);
    expect(r.reasons.some((x) => /90%|LTV|exceeds/i.test(x))).toBe(true);
  });

  it('flags ungraded/no-value lots', () => {
    const r = preliminaryFinanceEligibility({ ...base, lotConfirmed: false });
    expect(r.eligibleForPreliminaryStep).toBe(false);
  });
});