'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import {
  FARMER_TIER_CONFIGS,
  FarmerPlanTier,
  BUSINESS_TIER_CONFIGS,
  BusinessPlanTier,
  CONSUMER_TIER_CONFIGS,
  ConsumerPlanTier,
  calculateFarmerPayout,
} from '../../lib/server/monetization-domain';
import {
  Sprout,
  Building2,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  HelpCircle,
  Calculator,
} from 'lucide-react';

import InstitutionalPaymentModal from '../../components/InstitutionalPaymentModal';
import { initiateClientPayment } from '../../lib/client/checkout';
import { useAuth } from '../../context/AuthContext';
import { useSubscriptionStore, ConsumerTier, BusinessTier } from '../../lib/store';
import { useLanguage } from '../../context/LanguageContext';

export default function PricingPage() {
  const { t } = useLanguage();
  const { role } = useAuth();
  const { consumerTier, setConsumerPlan, businessTier, setBusinessPlan } = useSubscriptionStore();

  // If user is authenticated as consumer, default and lock/scope to consumer tab, similarly for buyer or farmer
  const initialTab = role === 'consumer' ? 'consumer' : role === 'buyer' ? 'business' : 'farmer';
  const [roleTab, setRoleTab] = useState<'farmer' | 'business' | 'consumer'>(initialTab);

  React.useEffect(() => {
    if (role === 'consumer') setRoleTab('consumer');
    else if (role === 'buyer') setRoleTab('business');
    else if (role === 'farmer') setRoleTab('farmer');
  }, [role]);

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [saleAmount, setSaleAmount] = useState<number>(10000);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // Payment Gateway Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{
    amountInr: number;
    planName?: string;
    billingInterval?: 'monthly' | 'annual';
    title: string;
    onAuthorize?: () => void;
  }>({
    amountInr: 4999,
    title: 'Fasal Matrix Institutional Payment Gateway',
  });

  const calculatedPayouts = {
    basic: calculateFarmerPayout(saleAmount, 'basic'),
    premier: calculateFarmerPayout(saleAmount, 'premier'),
    premier_pro: calculateFarmerPayout(saleAmount, 'premier_pro'),
    premier_elite: calculateFarmerPayout(saleAmount, 'premier_elite'),
  };

  const tp = t.pricing;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{tp?.badge || 'FarmLink Premier - Transparent Monetization'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight max-w-4xl mx-auto">
            {tp?.heroTitle || 'Fair, Transparent Pricing Built for India’s Agrarian Supply Chain'}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {tp?.heroDesc || 'Zero upfront fees for producers, high-performance procurement coordination for businesses, and affordable shopping benefits for consumers.'}
          </p>

          <p className="mt-2 text-xs text-zinc-500 font-mono">
            {tp?.heroDisclaimer || '* Proposed starting prices for market validation. All basic farmer marketplace access remains 100% free.'}
          </p>

          {/* Role Selector Tabs: Scoped to designated plans when logged in, or full view for visitors */}
          <div className="mt-8 flex justify-center w-full px-2">
            <div className="inline-flex p-1.5 bg-zinc-200 dark:bg-zinc-900 rounded-2xl border border-zinc-300 dark:border-zinc-800 gap-1 max-w-full overflow-x-auto scrollbar-none">
              {(!role || role === 'farmer') && (
                <button
                  type="button"
                  onClick={() => setRoleTab('farmer')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer shrink-0 min-h-[44px] ${
                    roleTab === 'farmer'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>{tp?.farmerTab || 'Farmers (2-5% Commission)'}</span>
                </button>
              )}

              {(!role || role === 'buyer') && (
                <button
                  type="button"
                  onClick={() => setRoleTab('business')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer shrink-0 min-h-[44px] ${
                    roleTab === 'business'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>{tp?.businessTab || 'Businesses & B2B Subscriptions'}</span>
                </button>
              )}

              {(!role || role === 'consumer') && (
                <button
                  type="button"
                  onClick={() => setRoleTab('consumer')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer shrink-0 min-h-[44px] ${
                    roleTab === 'consumer'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>{tp?.consumerTab || 'Consumers (₹99-₹199/mo)'}</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 1. FARMER PLANS & CALCULATOR */}
        {roleTab === 'farmer' && (
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                {tp?.commissionModel || 'Commission-Based Model'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">
                {tp?.farmerHeroTitle || 'Zero Monthly Subscription - Pay Only on Completed Sales'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                {tp?.farmerHeroDesc || 'Rather than charging monthly dues, FarmLink earns a small single-digit fee only after your harvest is successfully delivered and escrow released.'}
              </p>
            </div>

            {/* Farmer Tier Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(['basic', 'premier', 'premier_pro', 'premier_elite'] as FarmerPlanTier[]).map((tierKey) => {
                const config = FARMER_TIER_CONFIGS[tierKey];
                const isPopular = tierKey === 'premier';
                const localizedPlanName =
                  tierKey === 'basic' ? (tp?.planBasicFarmer || config.name) :
                  tierKey === 'premier' ? (tp?.planPremierFarmer || config.name) :
                  tierKey === 'premier_pro' ? (tp?.planPremierProFarmer || config.name) :
                  (tp?.planPremierEliteFarmer || config.name);

                const localizedFeatures =
                  tierKey === 'basic' ? [tp?.featBasic1 || config.features[0], tp?.featBasic2 || config.features[1], tp?.featBasic3 || config.features[2], tp?.featBasic4 || config.features[3]] :
                  tierKey === 'premier' ? [tp?.featPremier1 || config.features[0], tp?.featPremier2 || config.features[1], tp?.featPremier3 || config.features[2], tp?.featPremier4 || config.features[3]] :
                  tierKey === 'premier_pro' ? [tp?.featPro1 || config.features[0], tp?.featPro2 || config.features[1], tp?.featPro3 || config.features[2], tp?.featPro4 || config.features[3]] :
                  [tp?.featElite1 || config.features[0], tp?.featElite2 || config.features[1], tp?.featElite3 || config.features[2], tp?.featElite4 || config.features[3]];

                return (
                  <div
                    key={config.id}
                    className={`rounded-2xl border p-6 flex flex-col justify-between transition-all bg-white dark:bg-zinc-900 ${
                      isPopular
                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 shadow-xs'
                    }`}
                  >
                    <div>
                      {isPopular && (
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase mb-3">
                          {tp?.recommendedTier || 'Recommended Starting Tier'}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                        {localizedPlanName}
                      </h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-zinc-950 dark:text-zinc-50 font-mono">
                          {config.commissionRatePct}%
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">{tp?.perCompletedSale || 'per completed sale'}</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        {tp?.monthlyFeeZero || 'Monthly Fee: ₹0 (Always Free)'}
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-[11px] font-mono uppercase text-zinc-500 font-bold block mb-2">
                          {tp?.includedBenefits || 'Included Benefits:'}
                        </span>
                        <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {localizedFeatures.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <Link
                        href="/farmer"
                        className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold text-center block transition shadow-xs"
                      >
                        {tp?.accessFarmerDesk || 'Access Farmer Desk'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Commission & Payout Calculator */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                  {tp?.calculatorTitle || 'Interactive Farmer Payout Calculator'}
                </h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
                {tp?.calculatorDesc || 'Test the commission structure on a simulated sale value to see the exact net amount released to your bank account.'}
              </p>

              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span>{tp?.simulatedSaleValue || 'Simulated Sale Value:'}</span>
                  <span className="text-base text-emerald-700 dark:text-emerald-400">
                    ₹{saleAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="500000"
                  step="1000"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>{tp?.localLot || '₹2,000 (Local lot)'}</span>
                  <span>₹1,00,000</span>
                  <span>{tp?.bulkTruckload || '₹5,00,000 (Bulk truckload)'}</span>
                </div>
              </div>

              {/* Calculator Output Table */}
              {/* Responsive Mobile Cards View for Small Screens (< sm) */}
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {(['basic', 'premier', 'premier_pro', 'premier_elite'] as FarmerPlanTier[]).map((tierKey) => {
                  const res = calculatedPayouts[tierKey];
                  const config = FARMER_TIER_CONFIGS[tierKey];
                  const localizedPlanName =
                    tierKey === 'basic' ? (tp?.planBasicFarmer || config.name) :
                    tierKey === 'premier' ? (tp?.planPremierFarmer || config.name) :
                    tierKey === 'premier_pro' ? (tp?.planPremierProFarmer || config.name) :
                    (tp?.planPremierEliteFarmer || config.name);
                  return (
                    <div
                      key={`card-${tierKey}`}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{localizedPlanName}</span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          {res.commissionRatePct}% {tp?.rateCol || 'Rate'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-zinc-500">{tp?.commissionCol || 'Commission'}:</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300">₹{res.commissionAmountInr.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-400">{tp?.farmerReceivesCol || 'Farmer Receives*'}:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{res.netPayoutInr.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop / Tablet Table View (sm:block) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 uppercase">
                      <th className="py-2.5 px-3">{tp?.planTierCol || 'Plan Tier'}</th>
                      <th className="py-2.5 px-3">{tp?.rateCol || 'Rate'}</th>
                      <th className="py-2.5 px-3 text-right">{tp?.commissionCol || 'FarmLink Commission'}</th>
                      <th className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                        {tp?.farmerReceivesCol || 'Farmer Receives*'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {(['basic', 'premier', 'premier_pro', 'premier_elite'] as FarmerPlanTier[]).map((tierKey) => {
                      const res = calculatedPayouts[tierKey];
                      const config = FARMER_TIER_CONFIGS[tierKey];
                      const localizedPlanName =
                        tierKey === 'basic' ? (tp?.planBasicFarmer || config.name) :
                        tierKey === 'premier' ? (tp?.planPremierFarmer || config.name) :
                        tierKey === 'premier_pro' ? (tp?.planPremierProFarmer || config.name) :
                        (tp?.planPremierEliteFarmer || config.name);
                      return (
                        <tr key={tierKey} className="hover:bg-zinc-50 dark:hover:bg-zinc-850">
                          <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                            {localizedPlanName}
                          </td>
                          <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                            {res.commissionRatePct}%
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                            ₹{res.commissionAmountInr.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{res.netPayoutInr.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[10px] text-zinc-500 italic">
                {tp?.calculatorDisclaimer || '* Before any separately disclosed logistics, payment-processing, tax, or other applicable charges.'}
              </p>
            </div>
          </section>
        )}

        {/* 2. BUSINESS B2B SUBSCRIPTIONS */}
        {roleTab === 'business' && (
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs uppercase font-mono tracking-wider text-blue-700 dark:text-blue-400 font-bold">
                {tp?.businessSuite || 'B2B Procurement Suite'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">
                {tp?.businessHeroTitle || 'Streamline Commercial Procurement & Multi-Farmer Sourcing'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                {tp?.businessHeroDesc || 'Designed for restaurants, hotels, supermarket chains, food processors, and large distributors seeking reliable direct-from-farm supplies.'}
              </p>

              {/* Monthly / Annual Toggle */}
              <div className="mt-6 flex justify-center items-center gap-3">
                <span className={`text-xs font-semibold ${billingPeriod === 'monthly' ? 'text-zinc-950 dark:text-white' : 'text-zinc-500'}`}>
                  {tp?.monthlyBilling || 'Monthly Billing'}
                </span>
                <button
                  type="button"
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                  className="w-12 h-6 rounded-full bg-zinc-300 dark:bg-zinc-700 p-0.5 transition-colors relative cursor-pointer"
                  aria-label="Toggle annual billing"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-blue-600 transition-transform ${
                      billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${billingPeriod === 'annual' ? 'text-zinc-950 dark:text-white' : 'text-zinc-500'}`}>
                    {tp?.annualBilling || 'Annual Billing'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                    {tp?.twoMonthsFree || '~2 Months Free'}
                  </span>
                </div>
              </div>
            </div>

            {/* Business Tier Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(['starter', 'growth', 'pro', 'enterprise'] as BusinessPlanTier[]).map((tierKey) => {
                const config = BUSINESS_TIER_CONFIGS[tierKey];
                const isGrowth = tierKey === 'growth';
                const price = billingPeriod === 'annual' ? config.yearlyFeeInr : config.monthlyFeeInr;
                const periodLabel = billingPeriod === 'annual' ? (tp?.perYear || '/year') : (tp?.perMonth || '/month');

                const localizedPlanName =
                  tierKey === 'starter' ? (tp?.planBusinessStarter || config.name) :
                  tierKey === 'growth' ? (tp?.planBusinessGrowth || config.name) :
                  tierKey === 'pro' ? (tp?.planBusinessPro || config.name) :
                  (tp?.planEnterprise || config.name);

                const localizedDesc =
                  tierKey === 'starter' ? (tp?.descBusinessStarter || config.description) :
                  tierKey === 'growth' ? (tp?.descBusinessGrowth || config.description) :
                  tierKey === 'pro' ? (tp?.descBusinessPro || config.description) :
                  (tp?.descEnterprise || config.description);

                const getLocalizedEntitlement = (ent: string) => {
                  if (ent === 'buyer:basic_search') return tp?.capBasicSearch || 'Basic search';
                  if (ent === 'buyer:order_management') return tp?.capOrderMgmt || 'Order management';
                  if (ent === 'buyer:single_depot') return tp?.capSingleDepot || 'Single depot';
                  if (ent === 'buyer:multi_supplier_sourcing') return tp?.capMultiSupplier || 'Multi-supplier sourcing';
                  if (ent === 'buyer:recurring_orders') return tp?.capRecurringOrders || 'Recurring orders';
                  if (ent === 'buyer:analytics_supplier_perf') return tp?.capAnalytics || 'Supplier performance analytics';
                  if (ent === 'buyer:multi_depot_routing') return tp?.capMultiDepotRouting || 'Multi-depot routing';
                  if (ent === 'buyer:audit_reports_consolidated') return tp?.capAuditReports || 'Consolidated audit reports';
                  if (ent === 'buyer:priority_dispatch') return tp?.capPriorityDispatch || 'Priority dispatch';
                  if (ent === 'buyer:custom_erp_integration') return tp?.capCustomErp || 'Custom ERP integrations';
                  if (ent === 'buyer:dedicated_account_desk') return tp?.capDedicatedAccount || 'Dedicated account desk';
                  return ent.replace('buyer:', '').replace(/_/g, ' ');
                };

                return (
                  <div
                    key={config.id}
                    className={`rounded-2xl border p-6 flex flex-col justify-between transition-all bg-white dark:bg-zinc-900 ${
                      isGrowth
                        ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 shadow-xs'
                    }`}
                  >
                    <div>
                      {isGrowth && (
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold uppercase mb-3">
                          {tp?.mostPopular || 'Most Popular'}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                        {localizedPlanName}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        {localizedDesc}
                      </p>

                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 font-mono">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          {tierKey === 'enterprise' && billingPeriod === 'annual' ? ' custom' : periodLabel}
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-[11px] font-mono uppercase text-zinc-500 font-bold block mb-2">
                          {tp?.capabilitiesIncluded || 'Capabilities Included:'}
                        </span>
                        <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {Array.from(config.entitlements).map((ent, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span className="capitalize">
                                {getLocalizedEntitlement(ent)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      {tierKey === 'enterprise' ? (
                        <button
                          type="button"
                          onClick={() => setInquiryOpen(true)}
                          className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold text-center block transition shadow-xs cursor-pointer"
                        >
                          {tp?.inquireEnterprise || 'Inquire Enterprise Custom SLA'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            initiateClientPayment({
                              type: 'SUBSCRIPTION',
                              planCode: tierKey,
                              billingInterval: billingPeriod,
                              customerName: 'Enterprise Bulk Buyer',
                              openFallbackModal: (modal) => {
                                setPaymentModalData({
                                  amountInr: modal.amountInr,
                                  planName: modal.planName || localizedPlanName,
                                  billingInterval: modal.billingInterval,
                                  title: modal.title,
                                  onAuthorize: () => {
                                    setPaymentNotice(`Successfully activated ${localizedPlanName} (${billingPeriod})! Digital receipt generated.`);
                                    setTimeout(() => setPaymentNotice(null), 5000);
                                  },
                                });
                                setPaymentModalOpen(true);
                              },
                              onSuccess: (res) => {
                                setPaymentNotice(`Payment Verified (${res.paymentId})! Activated ${localizedPlanName}.`);
                                setTimeout(() => setPaymentNotice(null), 5000);
                              },
                            });
                          }}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center block transition shadow-xs cursor-pointer"
                        >
                          {(tp?.subscribeBtn || 'Subscribe {plan}').replace('{plan}', localizedPlanName)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. CONSUMER MEMBERSHIPS */}
        {roleTab === 'consumer' && (
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs uppercase font-mono tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                {tp?.consumerPremier || 'Consumer Premier'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">
                {tp?.consumerHeroTitle || 'Simple, Affordable Memberships with Practical Shopping Benefits'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                {tp?.consumerHeroDesc || 'Enjoy direct-from-farm produce, lower delivery fees, and transparent quality tracking records for your family.'}
              </p>

              {/* Monthly / Annual Toggle */}
              <div className="mt-6 flex justify-center items-center gap-3">
                <span className={`text-xs font-semibold ${billingPeriod === 'monthly' ? 'text-zinc-950 dark:text-white' : 'text-zinc-500'}`}>
                  {tp?.monthly || 'Monthly'}
                </span>
                <button
                  type="button"
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                  className="w-12 h-6 rounded-full bg-zinc-300 dark:bg-zinc-700 p-0.5 transition-colors relative cursor-pointer"
                  aria-label="Toggle annual consumer billing"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-amber-600 transition-transform ${
                      billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${billingPeriod === 'annual' ? 'text-zinc-950 dark:text-white' : 'text-zinc-500'}`}>
                    {tp?.annual || 'Annual'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                    {tp?.save17 || 'Save ~17%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Consumer Tier Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {(['basic', 'premier', 'plus'] as ConsumerPlanTier[]).map((tierKey) => {
                const config = CONSUMER_TIER_CONFIGS[tierKey];
                const isPremier = tierKey === 'premier';
                const price = billingPeriod === 'annual' ? config.yearlyFeeInr : config.monthlyFeeInr;
                const periodLabel = billingPeriod === 'annual' ? (tp?.perYear || '/year') : (tp?.perMonth || '/month');

                const localizedPlanName =
                  tierKey === 'basic' ? (tp?.planConsumerBasic || config.name) :
                  tierKey === 'premier' ? (tp?.planConsumerPremier || config.name) :
                  (tp?.planConsumerPlus || config.name);

                return (
                  <div
                    key={config.id}
                    className={`rounded-2xl border p-6 flex flex-col justify-between transition-all bg-white dark:bg-zinc-900 ${
                      isPremier
                        ? 'border-amber-500 shadow-md ring-1 ring-amber-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 shadow-xs'
                    }`}
                  >
                    <div>
                      {isPremier && (
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold uppercase mb-3">
                          {tp?.bestValue || 'Best Value'}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                        {localizedPlanName}
                      </h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-zinc-950 dark:text-zinc-50 font-mono">
                          ₹{price}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          {price === 0 ? (tp?.freeBadge || ' (Free)') : periodLabel}
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-[11px] font-mono uppercase text-zinc-500 font-bold block mb-2">
                          {tp?.memberBenefits || 'Member Benefits:'}
                        </span>
                        <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{tp?.browseDirectProduce || 'Browse direct agricultural produce'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              {config.deliveryDiscountInr > 0
                                ? (tp?.discountOrders || '₹{amount} discount on all orders').replace('{amount}', String(config.deliveryDiscountInr))
                                : (tp?.standardDelivery || 'Standard delivery rates')}
                            </span>
                          </li>
                          {config.freeDeliveryThresholdInr && (
                            <li className="flex items-start gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>{(tp?.freeDeliveryOver || '100% Free delivery over ₹{amount}').replace('{amount}', String(config.freeDeliveryThresholdInr))}</span>
                            </li>
                          )}
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              {config.hasTraceabilityPassport
                                ? (tp?.fullTraceability || 'Full quality & origin traceability records')
                                : (tp?.basicLotInfo || 'Basic lot information')}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      {price === 0 ? (
                        <Link
                          href="/consumer"
                          className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold text-center block transition shadow-xs"
                        >
                          {consumerTier === 'basic' ? (tp?.currentFreePlan || 'Current Free Plan') : (tp?.startFreeBtn || tp?.selectFreePlan || 'Start Free')}
                        </Link>
                      ) : consumerTier === tierKey ? (
                        <Link
                          href="/consumer"
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center block transition shadow-xs"
                        >
                          {tp?.activePremiumZone || 'Active Plan • Open Premium Zone'}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            initiateClientPayment({
                              type: 'SUBSCRIPTION',
                              planCode: tierKey,
                              billingInterval: billingPeriod,
                              customerName: 'FarmLink Consumer Member',
                              openFallbackModal: (modal) => {
                                setPaymentModalData({
                                  amountInr: modal.amountInr,
                                  planName: modal.planName || localizedPlanName,
                                  billingInterval: modal.billingInterval,
                                  title: modal.title,
                                  onAuthorize: () => {
                                    setConsumerPlan(tierKey as ConsumerTier, billingPeriod);
                                    setPaymentNotice(`Successfully activated ${localizedPlanName} (${billingPeriod})! Your Premium Zone is now unlocked.`);
                                    setTimeout(() => setPaymentNotice(null), 5000);
                                  },
                                });
                                setPaymentModalOpen(true);
                              },
                              onSuccess: (res) => {
                                setConsumerPlan(tierKey as ConsumerTier, billingPeriod);
                                setPaymentNotice(`Payment Verified (${res.paymentId})! Welcome to ${localizedPlanName}.`);
                                setTimeout(() => setPaymentNotice(null), 5000);
                              },
                            });
                          }}
                          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center block transition shadow-xs cursor-pointer"
                        >
                          {(tp?.joinPlan || 'Join {plan} (₹{price}{period})').replace('{plan}', localizedPlanName).replace('{price}', String(price)).replace('{period}', periodLabel)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Operating Principles & Governance Strip */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-zinc-200 dark:border-zinc-800">
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
                {tp?.operatingPrinciplesTitle || 'Important Operating Principles'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>{tp?.freeBasicAccessTitle || 'Free Basic Access:'}</strong> {tp?.freeBasicAccessDesc || 'Basic farmer marketplace access remains 100% free with zero upfront fees.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>{tp?.escrowSettlementTitle || 'Escrow Settlement:'}</strong> {tp?.escrowSettlementDesc || 'Platform fees (2-5%) are deducted transparently only upon completed escrow release.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>{tp?.serverVerificationTitle || 'Server Verification:'}</strong> {tp?.serverVerificationDesc || 'All subscriptions and payments are verified server-side before activating access.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>{tp?.boundedDiscountsTitle || 'Bounded Discounts:'}</strong> {tp?.boundedDiscountsDesc || 'Delivery discounts and promotions have sensible limits to preserve positive contribution margins.'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase">
              <HelpCircle className="w-4 h-4" />
              <span>{tp?.faqSubtitle || 'Questions & Answers'}</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 mt-1">
              {tp?.faqTitle || 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
                {tp?.faq1Q || 'Are there any hidden costs for farmers?'}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {tp?.faq1A || 'No. Farmers pay zero upfront fees and zero monthly dues. The 2-5% commission is only deducted when produce is sold and confirmed by the buyer.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
                {tp?.faq2Q || 'Can businesses cancel or modify their subscription?'}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {tp?.faq2A || 'Yes. Monthly subscriptions can be upgraded, downgraded, or canceled at any time from your Business Desk. Annual plans remain active through the prepaid period.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
                {tp?.faq3Q || 'How do consumer delivery discounts work?'}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {tp?.faq3A || 'Consumer Premier members automatically receive ₹40 off retail delivery. Consumer Plus members receive free delivery on all orders over ₹399.'}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <InstitutionalPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={paymentModalData.title}
        amountInr={paymentModalData.amountInr}
        planName={paymentModalData.planName}
        billingInterval={paymentModalData.billingInterval}
        onSuccess={() => {
          if (paymentModalData.onAuthorize) {
            paymentModalData.onAuthorize();
          }
        }}
      />
      {paymentNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-900 text-white shadow-2xl border border-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>{paymentNotice}</span>
        </div>
      )}
    </div>
  );
}
