'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InquiryModal from '../components/InquiryModal';
import { useProduceStore, useOrderStore, useRfqStore, ProduceLotItem } from '../lib/store';
import {
  Shield,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Scale,
  Camera,
  ThermometerSnowflake,
  PhoneCall,
  Sprout,
  Building2,
  Truck,
} from 'lucide-react';

const CROP_IMAGE_MAP: Record<string, string> = {
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  mustard: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
  soybean: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
};

function getCropImage(name: string): string {
  const lower = (name || '').toLowerCase();
  for (const [key, url] of Object.entries(CROP_IMAGE_MAP)) {
    if (lower.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80';
}

export default function Home() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  // Persistence Stores
  const { listings, decrementQuantity } = useProduceStore();
  const { placeOrder } = useOrderStore();
  const { submitRfq } = useRfqStore();

  // Advisory State
  const [selectedCrop, setSelectedCrop] = useState<'Tomato' | 'Mustard' | 'Wheat' | 'Soybean'>('Tomato');
  const [holdingDays, setHoldingDays] = useState<number>(1);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Marketplace State
  const [marketFilter, setMarketFilter] = useState<'all' | 'grains' | 'vegetables' | 'oilseeds' | 'pulses'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartSuccessNotice, setCartSuccessNotice] = useState<string | null>(null);

  // Advisory Dynamic Engine
  const advisoryEngine = useMemo(() => {
    switch (selectedCrop) {
      case 'Tomato': {
        const baseMin = 26;
        const baseMax = 29;
        const decay = holdingDays >= 6 ? 0.85 : holdingDays >= 3 ? 0.95 : 1.0;
        return {
          range: `₹${(baseMin * decay).toFixed(0)} - ₹${(baseMax * decay).toFixed(0)} / ${t.market.perKg}`,
          conf: holdingDays === 1 ? '88%' : holdingDays === 3 ? '81%' : '74%',
          fresh: 'Just now (APMC Real-Time)',
          factors: [t.advisory.factorDemand, t.advisory.factorGrade, t.advisory.factorShelf],
          isPerishableNearExpiry: holdingDays >= 6,
        };
      }
      case 'Mustard': {
        return {
          range: `₹84 - ₹96 / ${t.market.perKg}`,
          conf: '91%',
          fresh: 'Verified 09:30 AM',
          factors: [t.advisory.factorMsp, t.advisory.factorPledge, t.advisory.factorStorage],
          isPerishableNearExpiry: false,
        };
      }
      case 'Wheat': {
        return {
          range: `₹24.50 - ₹28 / ${t.market.perKg}`,
          conf: '94%',
          fresh: 'Verified 09:30 AM',
          factors: [t.advisory.factorMsp, t.advisory.factorStorage, t.advisory.factorDemand],
          isPerishableNearExpiry: false,
        };
      }
      case 'Soybean': {
        return {
          range: `₹46 - ₹52 / ${t.market.perKg}`,
          conf: '86%',
          fresh: 'Verified 10:00 AM',
          factors: [t.advisory.factorMsp, t.advisory.factorGrade, t.advisory.factorDemand],
          isPerishableNearExpiry: false,
        };
      }
    }
  }, [selectedCrop, holdingDays, t]);

  const getLotDisplayName = useCallback((lot: ProduceLotItem) => {
    if (t?.advisory && (t.advisory as Record<string, string>)[lot.nameKey]) {
      return (t.advisory as Record<string, string>)[lot.nameKey];
    }
    return lot.cropName || lot.id;
  }, [t]);

  const filteredLots = useMemo(() => {
    return listings.filter((lot) => {
      const matchesCategory = marketFilter === 'all' || lot.category === marketFilter;
      const cropName = getLotDisplayName(lot).toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        cropName.includes(searchQuery.toLowerCase()) ||
        lot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && lot.quantityKg > 0;
    });
  }, [listings, marketFilter, searchQuery, getLotDisplayName]);

  const handleHoldAction = () => {
    setActionNotice(t.advisory.holdSuccess);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleListAction = () => {
    setActionNotice(t.advisory.listSuccess);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleLotOrder = (lotId: string) => {
    const target = listings.find((l) => l.id.toLowerCase() === lotId.toLowerCase());
    if (!target) return;

    const orderAmountKg = Math.min(target.quantityKg, 1000);
    decrementQuantity(target.id, orderAmountKg);

    const order = placeOrder({
      lotId: target.id,
      items: `${orderAmountKg} kg ${target.cropName} (Grade ${target.grade})`,
      commodity: target.cropName,
      quantityKg: orderAmountKg,
      unitPrice: target.price,
      totalPrice: orderAmountKg * target.price,
      buyerType: 'BULK_BUYER',
      buyerName: 'Verified Institutional Buyer',
      status: 'ESCROW_LOCKED',
      escrowLocked: true,
      createdAt: 'Just now',
    });

    submitRfq({
      lotId: target.id,
      crop: target.cropName,
      sellerCluster: target.cluster,
      volumeKg: orderAmountKg,
      askingRate: target.price,
      bidRate: target.price,
      status: 'ACCEPTED',
      escrowLocked: true,
      createdAt: 'Just now',
    });

    setCartSuccessNotice(
      `${t.market.quoteSentMsg} (${target.id}) — Order #${order.id} placed & escrow locked!`
    );
    setTimeout(() => setCartSuccessNotice(null), 4500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200/80">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold tracking-wide uppercase">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              {t.hero.titleLine1} <br />
              <span className="text-zinc-500 font-semibold">{t.hero.titleLine2}</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              {t.hero.description}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#marketplace"
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-xs"
              >
                <span>{t.hero.exploreMarket}</span>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </a>

              <a
                href="#advisory"
                className="px-6 py-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 rounded-xl text-xs sm:text-sm font-semibold transition"
              >
                {t.hero.calculatePrice}
              </a>
            </div>

            {/* Spatial UI Live Command Deck */}
            <div className="pt-8 max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border border-zinc-200/90 shadow-[0_30px_90px_rgba(0,0,0,0.09)] bg-zinc-950">
                {/* Live Atmospheric Background Photograph */}
                <div className="relative h-72 sm:h-96 w-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=80"
                    alt="Automated High-Tech Agrarian Glasshouse"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-cover object-center filter brightness-[0.88] contrast-[1.05] transform scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
                  />
                  {/* Spatial Vignette & Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/35 to-transparent pointer-events-none" />
                </div>

                {/* Floating Spatial Card 1: Optical Quality HUD (Top-Left) */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 max-w-xs backdrop-blur-xl bg-white/85 text-zinc-900 border border-white/70 shadow-2xl rounded-2xl p-3.5 transition-all duration-300 hover:bg-white/95 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-950">
                      Live Optical Telemetry
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-zinc-950 tracking-tight">
                    AGMARK Grade A1 (98.4%)
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug">
                    Phulera Depot #3 • 0.8% defect floor • Assayed
                  </p>
                </div>

                {/* Floating Spatial Card 2: AI Price Radar (Top-Right) */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 max-w-[260px] backdrop-blur-xl bg-white/85 text-zinc-900 border border-white/70 shadow-2xl rounded-2xl p-3.5 transition-all duration-300 hover:bg-white/95 text-right hidden sm:block">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/90 text-emerald-900 text-[10px] font-mono font-bold uppercase mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    MSP Guarded
                  </div>
                  <div className="text-base font-extrabold text-zinc-950 font-mono">
                    ₹24.41 <span className="text-xs font-normal text-zinc-600">/ kg</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Khanna Mandi • Wheat Baseline
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Metrics Ribbon */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-zinc-100">
              <div className="p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono">
                  {t.hero.trustStat1}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {t.hero.trustStat1Sub}
                </span>
              </div>
              <div className="p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono">
                  {t.hero.trustStat2}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {t.hero.trustStat2Sub}
                </span>
              </div>
              <div className="p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono">
                  {t.hero.trustStat3}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {t.hero.trustStat3Sub}
                </span>
              </div>
              <div className="p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono">
                  {t.hero.trustStat4}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {t.hero.trustStat4Sub}
                </span>
              </div>
            </div>

            {/* Operational Portals Grid */}
            <div className="pt-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/farmer"
                className="group p-4 bg-white hover:bg-emerald-50/40 rounded-xl border border-zinc-200 hover:border-emerald-300 transition text-left shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2.5">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-emerald-900 transition flex items-center justify-between">
                    <span>{t.nav.farmer}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-700 transition transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    {t.portal.farmerDeskDesc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-semibold">
                  <span>{t.portal.openFarmerDesk}</span>
                </div>
              </Link>

              <Link
                href="/buyer"
                className="group p-4 bg-white hover:bg-emerald-50/40 rounded-xl border border-zinc-200 hover:border-emerald-300 transition text-left shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center mb-2.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-emerald-900 transition flex items-center justify-between">
                    <span>{t.nav.buyer}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-700 transition transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    {t.portal.buyerDeskDesc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-semibold">
                  <span>{t.portal.openBuyerDesk}</span>
                </div>
              </Link>

              <Link
                href="/logistics"
                className="group p-4 bg-white hover:bg-emerald-50/40 rounded-xl border border-zinc-200 hover:border-emerald-300 transition text-left shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center mb-2.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-emerald-900 transition flex items-center justify-between">
                    <span>{t.nav.logistics}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-700 transition transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    {t.portal.logisticsDeskDesc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-semibold">
                  <span>{t.portal.openLogisticsDesk}</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 1: Interactive Price Advisory */}
        <section id="advisory" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-800 font-bold">
              {t.advisory.sectionBadge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 mt-1 mb-2 tracking-tight">
              {t.advisory.title}
            </h2>
            <p className="text-sm text-zinc-600">
              {t.advisory.subtitle}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            {/* Notification Banner */}
            {actionNotice && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{actionNotice}</span>
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t.advisory.cropLabel}
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value as 'Tomato' | 'Mustard' | 'Wheat' | 'Soybean')}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Tomato">{t.advisory.cropTomato}</option>
                    <option value="Mustard">{t.advisory.cropMustard}</option>
                    <option value="Wheat">{t.advisory.cropWheat}</option>
                    <option value="Soybean">{t.advisory.cropSoybean}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t.advisory.holdingLabel}
                  </label>
                  <select
                    value={holdingDays}
                    onChange={(e) => setHoldingDays(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value={1}>{t.advisory.holdingDay1}</option>
                    <option value={3}>{t.advisory.holdingDay3}</option>
                    <option value={6}>{t.advisory.holdingDay6}</option>
                  </select>
                </div>
              </div>

              {/* Valuation Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6 text-center">
                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide block">
                    {t.advisory.suggestedRange}
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-zinc-950 font-mono mt-0.5 block">
                    {advisoryEngine.range}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide block">
                    {t.advisory.confidence}
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-800 font-mono mt-0.5 block">
                    {advisoryEngine.conf}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide block">
                    {t.advisory.dataFreshness}
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 mt-2 block">
                    {advisoryEngine.fresh}
                  </span>
                </div>
              </div>

              {/* Explainable Reasoning Factors */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                  {t.advisory.factorsTitle}
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-700">
                  {advisoryEngine.factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                  {advisoryEngine.isPerishableNearExpiry && (
                    <li className="flex items-start gap-2 text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{t.advisory.spoilageWarning}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Guardrail Disclaimer */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-600 flex items-center gap-2 mb-6">
                <Scale className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>{t.advisory.guardrailText}</span>
              </div>

              {/* Interactive Decision Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleHoldAction}
                  className="w-full py-3 px-4 border border-zinc-300 hover:bg-zinc-50 rounded-xl text-xs sm:text-sm font-semibold text-zinc-800 transition"
                >
                  {t.advisory.btnHold}
                </button>
                <button
                  type="button"
                  onClick={handleListAction}
                  className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs sm:text-sm font-semibold text-white transition shadow-xs"
                >
                  {t.advisory.btnList}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Live Verified Produce Marketplace */}
        <section id="marketplace" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-800 font-bold">
                {t.market.sectionBadge}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 mt-1 tracking-tight">
                {t.market.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-xl">
                {t.market.subtitle}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'grains', 'vegetables', 'oilseeds', 'pulses'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMarketFilter(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition border ${
                    marketFilter === cat
                      ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {cat === 'all'
                    ? t.market.allCrops
                    : cat === 'grains'
                    ? t.market.grains
                    : cat === 'vegetables'
                    ? t.market.vegetables
                    : cat === 'oilseeds'
                    ? t.market.oilseeds
                    : t.market.pulses}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mb-6 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.market.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-zinc-900"
            />
          </div>

          {/* Quote Success Notice */}
          {cartSuccessNotice && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{cartSuccessNotice}</span>
            </div>
          )}

          {/* Grid of Verified Produce Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLots.map((lot) => (
              <div
                key={lot.id}
                className="group bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs hover:border-zinc-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Spatial Photography Banner */}
                  <div className="relative h-40 w-full overflow-hidden rounded-xl mb-3.5 bg-zinc-100">
                    <Image
                      src={getCropImage(lot.cropName)}
                      alt={lot.cropName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                    
                    {/* Floating Glassmorphic Chips */}
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-mono uppercase backdrop-blur-md bg-zinc-950/75 text-white border border-white/20 px-2 py-0.5 rounded-md font-semibold">
                      {lot.id}
                    </span>
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold backdrop-blur-md bg-white/90 text-emerald-900 border border-white/70 px-2.5 py-0.5 rounded-full shadow-xs">
                      {t.common.grade.replace('{grade}', lot.grade)}
                    </span>
                    
                    <div className="absolute bottom-2.5 left-2.5 text-white font-mono text-xs font-bold drop-shadow-sm flex items-center gap-1">
                      <span>{lot.quantity}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-zinc-950 mt-1">
                    {getLotDisplayName(lot)}
                  </h3>
                  <div className="text-xl font-extrabold text-zinc-950 font-mono mt-1">
                    ₹{lot.price} <span className="text-xs text-zinc-500 font-normal">/ {t.market.perKg}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-[11px] text-zinc-600">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t.market.inStock}:</span>
                      <strong className="text-zinc-900 font-mono">{lot.quantity}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t.market.warehouseLabel}:</span>
                      <span className="text-zinc-900 text-right truncate max-w-[140px]">{lot.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t.market.farmerLabel}:</span>
                      <span className="text-zinc-900 text-right truncate max-w-[140px]">{lot.cluster}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleLotOrder(lot.id)}
                    className="flex-1 py-2 text-center text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition"
                  >
                    {t.market.buyNow}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryOpen(true)}
                    className="px-3 py-2 text-xs font-semibold border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg transition"
                  >
                    {t.portal.rfqBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Verifiable Infrastructure (4 Pillars) */}
        <section id="architecture" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-zinc-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-800 font-bold">
              {t.architecture.sectionBadge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 mt-1 mb-2 tracking-tight">
              {t.architecture.title}
            </h2>
            <p className="text-sm text-zinc-600">
              {t.architecture.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="group bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-zinc-100">
                  <Image
                    src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80"
                    alt={t.architecture.card1Title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg backdrop-blur-md bg-white/90 text-zinc-900 flex items-center justify-center border border-white/80 shadow-xs">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase backdrop-blur-md bg-emerald-950/80 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                    {t.architecture.card1Badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 mb-2">
                  {t.architecture.card1Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {t.architecture.card1Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-zinc-500">
                {t.portal.standardAgmark}
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-zinc-100">
                  <Image
                    src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
                    alt={t.architecture.card2Title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg backdrop-blur-md bg-white/90 text-zinc-900 flex items-center justify-center border border-white/80 shadow-xs">
                    <Scale className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase backdrop-blur-md bg-emerald-950/80 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                    {t.architecture.card2Badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 mb-2">
                  {t.architecture.card2Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {t.architecture.card2Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-zinc-500">
                {t.portal.guaranteedMsp}
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-zinc-100">
                  <Image
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                    alt={t.architecture.card3Title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg backdrop-blur-md bg-white/90 text-zinc-900 flex items-center justify-center border border-white/80 shadow-xs">
                    <ThermometerSnowflake className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase backdrop-blur-md bg-emerald-950/80 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                    {t.architecture.card3Badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 mb-2">
                  {t.architecture.card3Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {t.architecture.card3Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-zinc-500">
                {t.portal.telemetrySensors}
              </div>
            </div>

            {/* Card 4 */}
            <div className="group bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-zinc-100">
                  <Image
                    src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"
                    alt={t.architecture.card4Title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg backdrop-blur-md bg-white/90 text-zinc-900 flex items-center justify-center border border-white/80 shadow-xs">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase backdrop-blur-md bg-emerald-950/80 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                    {t.architecture.card4Badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 mb-2">
                  {t.architecture.card4Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {t.architecture.card4Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] font-mono text-zinc-500">
                {t.portal.accessIvr}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Direct Economic Comparison */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-zinc-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {t.comparison.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              {t.comparison.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Channel */}
            <div className="bg-white rounded-xl border border-red-200/80 p-6 shadow-xs">
              <span className="text-[10px] font-mono uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold">
                {t.portal.legacySupplyChain}
              </span>
              <h3 className="text-base font-bold text-zinc-950 mt-2 mb-4">
                {t.comparison.middlemanTitle}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>{t.comparison.middlemanDeduction}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>{t.comparison.middlemanDelay}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>{t.comparison.middlemanGrading}</span>
                </li>
              </ul>
            </div>

            {/* FarmLink Direct */}
            <div className="bg-white rounded-xl border border-emerald-300 p-6 shadow-xs ring-1 ring-emerald-500/10">
              <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                {t.portal.directTransparentNetwork}
              </span>
              <h3 className="text-base font-bold text-zinc-950 mt-2 mb-4">
                {t.comparison.farmlinkTitle}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{t.comparison.farmlinkDirect}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{t.comparison.farmlinkSettlement}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{t.comparison.farmlinkGrading}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Learn More link to About Us */}
          <div className="mt-8 text-center">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition"
            >
              <span>{t.portal.readMoreCause}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
