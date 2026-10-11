'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InquiryModal from '../components/InquiryModal';
import { useProduceStore, useOrderStore, useRfqStore, ProduceLotItem } from '../lib/store';
import {
  Shield,
  ArrowRight,
  Search,
  CheckCircle2,
  Scale,
  Camera,
  ThermometerSnowflake,
  PhoneCall,
  Sprout,
  Building2,
  Truck,
  AlertCircle,
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
  const { role } = useAuth();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  // Persistence Stores
  const { listings, decrementQuantity } = useProduceStore();
  const { orders, placeOrder } = useOrderStore();
  const { submitRfq } = useRfqStore();



  // Marketplace State
  const [marketFilter, setMarketFilter] = useState<'all' | 'grains' | 'vegetables' | 'oilseeds' | 'pulses'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartSuccessNotice, setCartSuccessNotice] = useState<string | null>(null);

  const getLotDisplayName = useCallback((lot: ProduceLotItem) => {
    return lot.cropName || lot.id;
  }, []);

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

      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 transition-colors">
        {/* Hero Section — landing-01 Inspired Agrarian Techno-Minimalist Canvas */}
        <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0c0d0e] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors overflow-hidden">
          {/* landing-01 Ambient Glow & Technical Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,163,74,0.04)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.06)_1px,transparent_1px)] bg-size-[28px_28px] pointer-events-none" />
          <div className="pointer-events-none absolute top-1/3 left-1/2 h-[380px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-emerald-500/10 dark:from-emerald-500/15 via-emerald-500/3 to-transparent blur-3xl" />

          {/* landing-01 Technical Crosshairs & Corner Borders */}
          <div className="absolute top-10 left-6 hidden lg:block h-4 w-4 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-600/30" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-emerald-600/30" />
          </div>
          <div className="absolute top-10 right-6 hidden lg:block h-4 w-4 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-600/30" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-emerald-600/30" />
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            {/* landing-01 Pill Badge with Tech Monospace Accent */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300 text-xs font-semibold tracking-wide uppercase font-mono shadow-xs">
              <span className="text-emerald-600 dark:text-emerald-400 opacity-70">{'//'}</span>
              <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Headline with dynamic agrarian emphasis */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-[1.08]">
              {t.hero.titleLine1} <br />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold underline decoration-emerald-500/30 underline-offset-8">
                {t.hero.titleLine2}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {t.hero.description}
            </p>

            {/* CTAs with landing-01 corner accent subtle button styling */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="#marketplace"
                className="group relative px-7 py-3.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm active:scale-[0.98]"
              >
                <span>{t.hero.exploreMarket}</span>
                <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-950 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <Link
                href="/about"
                className="px-7 py-3.5 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs active:scale-[0.98] inline-flex items-center justify-center"
              >
                <span>{t.portal.readMoreCause || 'Learn Our Mission'}</span>
              </Link>
            </div>

            {/* landing-01 Strip: Key Pillars of Trust Tags */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <span className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Statutory MSP Floors</span>
              </span>
              <span className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>WDRA Warehouses</span>
              </span>
              <span className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>T+1 Bank Escrow</span>
              </span>
              <span className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>0% Hidden Commission</span>
              </span>
            </div>

            {/* Spatial UI Command Deck with landing-01 Corner Accents */}
            <div className="pt-6 max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800 shadow-[0_30px_90px_rgba(0,0,0,0.09)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)] bg-zinc-950 group">
                {/* Corner Accents from landing-01 design */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400/80 z-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400/80 z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400/80 z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400/80 z-20 pointer-events-none"></div>

                {/* Live Atmospheric Background Photograph */}
                <div className="relative h-72 sm:h-96 w-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=80"
                    alt="Automated High-Tech Agrarian Glasshouse"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-cover object-center filter brightness-[0.88] contrast-[1.05] transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
                  />
                  {/* Spatial Vignette & Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/35 to-transparent pointer-events-none" />
                </div>

                {/* Floating Spatial Card 1: Optical Quality HUD (Top-Left) */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 max-w-xs backdrop-blur-xl bg-white/95 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border border-white/70 dark:border-zinc-700 shadow-2xl rounded-2xl p-3.5 transition-all duration-300 hover:bg-white dark:hover:bg-zinc-900 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-950 dark:text-emerald-300">
                      {t.hero.telemetry.opticalTelemetry}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                    {t.hero.telemetry.opticalGrade}
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5 leading-snug">
                    {t.hero.telemetry.opticalDetails}
                  </p>
                </div>

                {/* Floating Spatial Card 2: AI Price Radar (Top-Right) */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 max-w-[260px] backdrop-blur-xl bg-white/95 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border border-white/70 dark:border-zinc-700 shadow-2xl rounded-2xl p-3.5 transition-all duration-300 hover:bg-white dark:hover:bg-zinc-900 text-right hidden sm:block">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {t.hero.telemetry.mspGuarded}
                  </div>
                  <div className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">
                    ₹24.41 <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400">/ kg</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {t.hero.telemetry.wheatBaseline}
                  </p>
                </div>
              </div>
            </div>



            {/* Operational Portals Grid with landing-01 Corner Accents & Micro-Interactions */}
            <div className="pt-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/farmer"
                className="group relative p-5 bg-white dark:bg-zinc-900/90 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left shadow-xs flex flex-col justify-between overflow-hidden"
              >
                {/* landing-01 Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/60 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/60 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/60 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/60 pointer-events-none"></div>

                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition flex items-center justify-between">
                    <span>{t.nav.farmer}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition transform group-hover:translate-x-1" />
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {t.portal.farmerDeskDesc}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="opacity-70">{'//'}</span>
                  <span>{t.portal.openFarmerDesk}</span>
                </div>
              </Link>

              <Link
                href="/buyer"
                className="group relative p-5 bg-white dark:bg-zinc-900/90 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left shadow-xs flex flex-col justify-between overflow-hidden"
              >
                {/* landing-01 Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/60 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/60 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/60 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/60 pointer-events-none"></div>

                <div>
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition flex items-center justify-between">
                    <span>{t.nav.buyer}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition transform group-hover:translate-x-1" />
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {t.portal.buyerDeskDesc}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="opacity-70">{'//'}</span>
                  <span>{t.portal.openBuyerDesk}</span>
                </div>
              </Link>

              <Link
                href="/logistics"
                className="group relative p-5 bg-white dark:bg-zinc-900/90 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left shadow-xs flex flex-col justify-between overflow-hidden"
              >
                {/* landing-01 Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/60 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/60 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/60 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/60 pointer-events-none"></div>

                <div>
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition flex items-center justify-between">
                    <span>{t.nav.logistics}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition transform group-hover:translate-x-1" />
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {t.portal.logisticsDeskDesc}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="opacity-70">{'//'}</span>
                  <span>{t.portal.openLogisticsDesk}</span>
                </div>
              </Link>
            </div>
          </div>
        </section>



        {/* Section: Live Verified Produce Marketplace */}
        <section id="marketplace" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-emerald-800 dark:text-emerald-400 font-bold">
                  {t.market.sectionBadge}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Synced
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 tracking-tight">
                {t.market.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
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
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
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
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          {/* Quote Success Notice */}
          {cartSuccessNotice && (
            <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>{cartSuccessNotice}</span>
            </div>
          )}

          {/* Grid of Verified Produce Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLots.map((lot) => (
              <div
                key={lot.id}
                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Spatial Photography Banner */}
                  <div className="relative h-40 w-full overflow-hidden rounded-xl mb-3.5 bg-zinc-100 dark:bg-zinc-800">
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
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold backdrop-blur-md bg-white dark:bg-zinc-900/90 text-emerald-900 dark:text-emerald-300 border border-white/70 dark:border-zinc-700 px-2.5 py-0.5 rounded-full shadow-xs">
                      {t.common.grade.replace('{grade}', lot.grade)}
                    </span>
                    
                    <div className="absolute bottom-2.5 left-2.5 text-white font-mono text-xs font-bold drop-shadow-sm flex items-center gap-1">
                      <span>{lot.quantity}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mt-1">
                    {getLotDisplayName(lot)}
                  </h3>
                  <div className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono mt-1">
                    ₹{lot.price} <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">/ {t.market.perKg}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t.market.inStock}:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{lot.quantity}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t.market.warehouseLabel}:</span>
                      <span className="text-zinc-900 dark:text-zinc-100 text-right truncate max-w-[140px]">{lot.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t.market.farmerLabel}:</span>
                      <span className="text-zinc-900 dark:text-zinc-100 text-right truncate max-w-[140px]">{lot.cluster}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                  {role === 'farmer' ? (
                    <Link
                      href="/farmer"
                      className="flex-1 py-2 text-center text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg transition"
                    >
                      Farmer Desk
                    </Link>
                  ) : role === 'admin' ? (
                    <Link
                      href="/admin"
                      className="flex-1 py-2 text-center text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg transition"
                    >
                      Admin Ops
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLotOrder(lot.id)}
                      className="flex-1 py-2 text-center text-xs font-bold bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg transition shadow-xs"
                    >
                      {t.market.buyNow}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setInquiryOpen(true)}
                    className="px-3 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg transition"
                  >
                    {t.portal.rfqBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Verifiable Infrastructure (4 Pillars) */}
        <section id="architecture" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-zinc-200 dark:border-zinc-800">
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
            <div className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80"
                    alt={t.architecture.card1Title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg backdrop-blur-md bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-white/80 dark:border-zinc-700 shadow-xs">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase backdrop-blur-md bg-emerald-950/80 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                    {t.architecture.card1Badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.architecture.card1Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.architecture.card1Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {t.portal.standardAgmark}
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
                    alt={t.architecture.card2Title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg backdrop-blur-md bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-white/80 dark:border-zinc-700 shadow-xs">
                    <Scale className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase backdrop-blur-md bg-emerald-950/80 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                    {t.architecture.card2Badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.architecture.card2Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.architecture.card2Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {t.portal.guaranteedMsp}
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                    alt={t.architecture.card3Title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg backdrop-blur-md bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-white/80 dark:border-zinc-700 shadow-xs">
                    <ThermometerSnowflake className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase backdrop-blur-md bg-emerald-950/80 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                    {t.architecture.card3Badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.architecture.card3Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.architecture.card3Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {t.portal.telemetrySensors}
              </div>
            </div>

            {/* Card 4 */}
            <div className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"
                    alt={t.architecture.card4Title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg backdrop-blur-md bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-white/80 dark:border-zinc-700 shadow-xs">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase backdrop-blur-md bg-emerald-950/80 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                    {t.architecture.card4Badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.architecture.card4Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.architecture.card4Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {t.portal.accessIvr}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Direct Economic Comparison */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-zinc-200 dark:border-zinc-800">
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
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-red-200/80 dark:border-red-900/40 p-6 shadow-xs">
              <span className="text-[10px] font-mono uppercase bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-bold">
                {t.portal.legacySupplyChain}
              </span>
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mt-2 mb-4">
                {t.comparison.middlemanTitle}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
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

            {/* Fasal Matrix Direct */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-emerald-300 dark:border-emerald-700/60 p-6 shadow-xs ring-1 ring-emerald-500/10">
              <span className="text-[10px] font-mono uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                {t.portal.directTransparentNetwork}
              </span>
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mt-2 mb-4">
                {t.comparison.farmlinkTitle}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{t.comparison.farmlinkDirect}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{t.comparison.farmlinkSettlement}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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
