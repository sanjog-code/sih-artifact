'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
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
  Users,
  Target,
  Zap,
  Globe,
  Award,
  Clock,
  MapPin,
  Wallet,
  Wifi,
  Leaf,
  Home,
  Factory,
  ShoppingBag,
  TrendingUp,
  FileText,
  Lock,
  Smartphone,
  BarChart2,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';

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

  const problems = [
    {
      icon: FileText,
      title: 'Paper Records',
      desc: 'Physical registers create opacity, leading to disputes, inventory leakage, and zero audit trail.',
      stat: '67%',
      statLabel: 'of storages still use paper',
    },
    {
      icon: Clock,
      title: 'Manual Approvals',
      desc: 'Every stock release requires physical presence, causing massive delays and spoilage risk.',
      stat: '4-6 hrs',
      statLabel: 'avg. wait per transaction',
    },
    {
      icon: MapPin,
      title: 'Travel Tax',
      desc: 'Farmers travel 50km+ just to sign papers — time and money lost from actual farming.',
      stat: '₹2,400',
      statLabel: 'avg. cost per trip',
    },
  ];

  const solutions = [
    {
      icon: Smartphone,
      title: 'Digital Records',
      desc: 'All warehouse receipts, stock lists, and transactions in one secure cloud platform.',
      features: ['Instant receipts', 'Audit trail', 'Multi-party access'],
      href: '/farmer',
      label: 'Farmer Dashboard',
    },
    {
      icon: Zap,
      title: 'OTP Approvals',
      desc: 'Farmers authorize stock release remotely via OTP — no travel, no waiting, instant.',
      features: ['Remote sign-off', 'Real-time', 'Secure'],
      href: '/buyer',
      label: 'Buyer Portal',
    },
    {
      icon: BarChart2,
      title: 'Live Intelligence',
      desc: 'Real-time market rates, inventory visibility, and procurement insights for all parties.',
      features: ['Live pricing', 'Stock visibility', 'Market trends'],
      href: '/logistics',
      label: 'Logistics Hub',
    },
  ];

  const stats = [
    { value: '50+', label: 'Cold Storages Onboarded' },
    { value: '12K+', label: 'Farmers Digitized' },
    { value: '98%', label: 'Reduction in Disputes' },
    { value: '₹45Cr', label: 'Value Transacted' },
  ];

  const team = [
    {
      name: 'Aman Sharma',
      role: 'CEO & Founder',
      bio: 'Second-generation farmer from Punjab. Built FarmLink after seeing his father lose 15% crop value to middlemen.',
      icon: Sprout,
    },
    {
      name: 'Priya Patel',
      role: 'CTO & Co-Founder',
      bio: 'Ex-Google Maps infra lead. Brings scalable systems expertise to agricultural supply chain.',
      icon: BarChart2,
    },
    {
      name: 'Rajesh Kumar',
      role: 'Head of Operations',
      bio: '20 years managing APMC mandis across North India. Ensures ground-level adoption.',
      icon: Users,
    },
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      badge: 'AGMARK Certified',
      title: 'Standardized Grading',
      desc: 'Computer vision + human verification ensures every lot meets AGMARK standards with full audit trail.',
      link: 'AGMARK Standards',
    },
    {
      icon: Lock,
      badge: 'Govt-Backed',
      title: 'MSP Guaranteed',
      desc: 'Pricing engine enforces statutory MSP floors. Farmers never sell below government support price.',
      link: 'MSP Policy',
    },
    {
      icon: Wifi,
      badge: 'IoT Enabled',
      title: 'Live Telemetry',
      desc: 'Temperature, humidity, and ethylene sensors on every lot. Spoilage alerts before it happens.',
      link: 'Sensor Network',
    },
    {
      icon: Smartphone,
      badge: 'Voice-First',
      title: 'IVR Access',
      desc: 'Multilingual voice interface for farmers without smartphones. Dial, listen, transact in Hindi/Punjabi.',
      link: 'IVR System',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text font-sans flex flex-col selection:bg-primary-light selection:text-primary-text">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <main className="flex-1">
        {/* Hero Section - Annsetu Style */}
        <section className="section bg-background border-b border-border">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary-text text-xs font-semibold tracking-wide uppercase animate-in">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>{t.hero.badge || 'Built for the Harvest Economy'}</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary tracking-tight leading-tight animate-in stagger-1">
                {t.hero.titleLine1 || 'Eliminate the Travel Tax.'} <br />
                <span className="text-text-muted font-semibold">{t.hero.titleLine2 || 'Digitize Your Agricultural Supply Chain in Minutes.'}</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg sm:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed animate-in stagger-2">
                {t.hero.description || 'The operating system for India\'s agricultural supply chain. Replace paper with transparency. Replace travel with trust.'}
              </p>

              {/* CTAs */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4 animate-in stagger-3">
                <Link
                  href="/farmer"
                  className="btn-primary group"
                >
                  <span>{t.hero.exploreMarket || 'Launch Farmer Dashboard'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/buyer"
                  className="btn-secondary"
                >
                  {t.hero.calculatePrice || 'Explore Buyer Portal'}
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto border-t border-border animate-in stagger-4">
                {stats.map((stat, i) => (
                  <div key={i} className="p-4 text-center">
                    <span className="block text-3xl sm:text-4xl font-extrabold text-secondary font-mono">
                      {stat.value}
                    </span>
                    <span className="text-sm text-text-muted font-medium">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why FarmLink Exists - Problem Section */}
        <section id="problems" className="section bg-background-alt border-y border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs uppercase font-mono tracking-wider text-primary font-bold badge-primary">
                {t.advisory?.sectionBadge || 'The Problem'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mt-2 mb-4 tracking-tight">
                {t.advisory?.title || 'Why FarmLink Exists'}
              </h2>
              <p className="text-lg text-text-muted">
                {t.advisory?.subtitle || 'Three structural bottlenecks cost Indian farmers billions every harvest.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {problems.map((problem, i) => (
                <div
                  key={i}
                  className="card p-8 text-center group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-t before:from-primary/5 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity"
                >
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <problem.icon className="w-7 h-7" />
                    </div>

                    <span className="text-[10px] font-mono uppercase bg-primary-light text-primary-text px-2 py-0.5 rounded font-bold mb-3 inline-block">
                      {['01', '02', '03'][i]}
                    </span>

                    <h3 className="text-xl font-bold text-secondary mb-3">
                      {problem.title}
                    </h3>

                    <p className="text-text-muted leading-relaxed mb-6">
                      {problem.desc}
                    </p>

                    <div className="bg-background border border-border rounded-xl p-4">
                      <span className="block text-2xl font-extrabold text-secondary font-mono">
                        {problem.stat}
                      </span>
                      <span className="text-xs text-text-muted">
                        {problem.statLabel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* A Unified Solution - Role-based sections */}
        <section id="solutions" className="section bg-background border-b border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs uppercase font-mono tracking-wider text-primary font-bold badge-primary">
                Solution
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mt-2 mb-4 tracking-tight">
                A Unified Platform for Every Stakeholder
              </h2>
              <p className="text-lg text-text-muted">
                Digitizing every touchpoint of the agricultural supply chain — from farm gate to fork.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {solutions.map((solution, i) => (
                <Link
                  key={i}
                  href={solution.href}
                  className="card-hover p-8 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                    <solution.icon className="w-7 h-7" />
                  </div>

                  <span className="text-[10px] font-mono uppercase bg-primary-light text-primary-text px-2 py-0.5 rounded font-bold mb-3 inline-block">
                    For {['Farmers', 'Buyers', 'Logistics'][i]}
                  </span>

                  <h3 className="text-xl font-bold text-secondary mb-3">
                    {solution.title}
                  </h3>

                  <p className="text-text-muted leading-relaxed mb-6">
                    {solution.desc}
                  </p>

                  <ul className="space-y-2 mb-8">
                    {solution.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-text-muted">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary group-hover:underline">
                      {solution.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Core Innovation Section */}
        <section id="innovation" className="section bg-background-alt border-b border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs uppercase font-mono tracking-wider text-primary font-bold badge-primary">
                Core Innovation
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mt-2 mb-4 tracking-tight">
                The End of the Travel Tax
              </h2>
              <p className="text-lg text-text-muted">
                Our proprietary OTP approval system replaces physical signatures with secure, digital authentication.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {pillars.map((pillar, i) => (
                <div
                  key={i}
                  className="card p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-t before:from-primary/5 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity"
                >
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4">
                      <pillar.icon className="w-6 h-6" />
                    </div>

                    <span className="badge-primary mb-3">
                      {pillar.badge}
                    </span>

                    <h3 className="text-lg font-bold text-secondary mb-2">
                      {pillar.title}
                    </h3>

                    <p className="text-text-muted leading-relaxed mb-4">
                      {pillar.desc}
                    </p>

                    <Link
                      href="#"
                      className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{pillar.link}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Price Advisory */}
        <section id="advisory" className="section bg-background border-b border-border">
          <div className="container max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs uppercase font-mono tracking-wider text-primary font-bold badge-primary">
                {t.advisory?.sectionBadge || 'Price Advisory'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mt-2 mb-2 tracking-tight">
                {t.advisory?.title || 'Interactive Price Intelligence'}
              </h2>
              <p className="text-lg text-text-muted">
                {t.advisory?.subtitle || 'Explainable, rule-based price guidance — not opaque ML.'}
              </p>
            </div>

            <div className="card p-6 sm:p-8">
              {/* Notification Banner */}
              {actionNotice && (
                <div className="mb-6 p-4 bg-primary-light border border-primary/20 rounded-xl text-sm font-semibold text-primary-text flex items-center gap-2 animate-in">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="label">
                    {t.advisory?.cropLabel || 'Crop Commodity'}
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value as 'Tomato' | 'Mustard' | 'Wheat' | 'Soybean')}
                    className="input"
                  >
                    <option value="Tomato">{t.advisory?.cropTomato || 'Tomato'}</option>
                    <option value="Mustard">{t.advisory?.cropMustard || 'Mustard'}</option>
                    <option value="Wheat">{t.advisory?.cropWheat || 'Wheat'}</option>
                    <option value="Soybean">{t.advisory?.cropSoybean || 'Soybean'}</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    {t.advisory?.holdingLabel || 'Holding Period'}
                  </label>
                  <select
                    value={holdingDays}
                    onChange={(e) => setHoldingDays(Number(e.target.value))}
                    className="input"
                  >
                    <option value={1}>{t.advisory?.holdingDay1 || '1 Day (Fresh)'}</option>
                    <option value={3}>{t.advisory?.holdingDay3 || '3 Days'}</option>
                    <option value={6}>{t.advisory?.holdingDay6 || '6 Days (Near Expiry)'}</option>
                  </select>
                </div>
              </div>

              {/* Valuation Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-background-alt border border-border rounded-xl p-4 mb-8 text-center">
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide block">
                    {t.advisory?.suggestedRange || 'Suggested Range'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-secondary font-mono mt-1 block">
                    {advisoryEngine.range}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide block">
                    {t.advisory?.confidence || 'Confidence'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono mt-1 block">
                    {advisoryEngine.conf}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide block">
                    {t.advisory?.dataFreshness || 'Data Freshness'}
                  </span>
                  <span className="text-sm font-semibold text-text mt-2 block">
                    {advisoryEngine.fresh}
                  </span>
                </div>
              </div>

              {/* Explainable Reasoning Factors */}
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
                  {t.advisory?.factorsTitle || 'Explainable Factors'}
                </h4>
                <ul className="space-y-3 text-sm text-text">
                  {advisoryEngine.factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-background-alt rounded-lg border border-border">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                  {advisoryEngine.isPerishableNearExpiry && (
                    <li className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-amber-900 font-medium">{t.advisory?.spoilageWarning || 'Stock nearing spoilage — consider immediate sale'}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Guardrail Disclaimer */}
              <div className="bg-background-alt border border-border rounded-xl p-4 text-sm text-text-muted flex items-start gap-3 mb-8">
                <Scale className="w-5 h-5 text-text-light shrink-0 mt-0.5" />
                <span>{t.advisory?.guardrailText || 'Advisory only. Not financial advice. MSP floor enforced where applicable.'}</span>
              </div>

              {/* Interactive Decision Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleHoldAction}
                  className="btn-secondary w-full py-3"
                >
                  {t.advisory?.btnHold || 'Hold & Monitor'}
                </button>
                <button
                  type="button"
                  onClick={handleListAction}
                  className="btn-primary w-full py-3"
                >
                  {t.advisory?.btnList || 'List for Buyers'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Live Verified Produce Marketplace */}
        <section id="marketplace" className="section bg-background-alt border-b border-border">
          <div className="container max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-primary font-bold badge-primary">
                  {t.market?.sectionBadge || 'Live Marketplace'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mt-1 tracking-tight">
                  {t.market?.title || 'Verified Produce Marketplace'}
                </h2>
                <p className="text-sm text-text-muted mt-1 max-w-xl">
                  {t.market?.subtitle || 'Real lots, real farmers, real-time prices. No speculation.'}
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'grains', 'vegetables', 'oilseeds', 'pulses'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMarketFilter(cat)}
                    className={`text-xs px-4 py-1.5 rounded-full font-medium transition border ${
                      marketFilter === cat
                        ? 'bg-primary text-white border-primary font-semibold shadow-sm'
                        : 'bg-white text-text border-border hover:bg-background-alt hover:border-primary/50'
                    }`}
                  >
                    {cat === 'all'
                      ? t.market?.allCrops || 'All Crops'
                      : cat === 'grains'
                      ? t.market?.grains || 'Grains'
                      : cat === 'vegetables'
                      ? t.market?.vegetables || 'Vegetables'
                      : cat === 'oilseeds'
                      ? t.market?.oilseeds || 'Oilseeds'
                      : t.market?.pulses || 'Pulses'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div className="relative mb-8 max-w-md">
              <Search className="w-4 h-4 text-text-light absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.market?.searchPlaceholder || 'Search by crop, location, lot ID...'}
                className="input pl-10"
              />
            </div>

            {/* Quote Success Notice */}
            {cartSuccessNotice && (
              <div className="mb-8 p-4 bg-primary-light border border-primary/20 rounded-xl text-sm text-primary-text font-medium flex items-center gap-2 animate-in">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{cartSuccessNotice}</span>
              </div>
            )}

            {/* Grid of Verified Produce Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredLots.map((lot) => (
                <div
                  key={lot.id}
                  className="card-hover p-5 flex flex-col"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase bg-background-alt text-text-muted px-2 py-0.5 rounded font-semibold">
                        {lot.id}
                      </span>
                      <span className="badge-success">
                        {t.common?.grade?.replace('{grade}', lot.grade) || `Grade ${lot.grade}`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-secondary">
                      {getLotDisplayName(lot)}
                    </h3>
                    <div className="text-2xl font-extrabold text-secondary font-mono mt-2">
                      ₹{lot.price} <span className="text-sm text-text-muted font-normal">/ {t.market?.perKg || 'kg'}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border space-y-2 text-sm text-text-muted">
                      <div className="flex justify-between">
                        <span>{t.market?.inStock || 'In Stock'}:</span>
                        <strong className="text-text font-mono">{lot.quantity}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.market?.warehouseLabel || 'Warehouse'}:</span>
                        <span className="text-text text-right truncate max-w-[140px]">{lot.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.market?.farmerLabel || 'Farmer Cluster'}:</span>
                        <span className="text-text text-right truncate max-w-[140px]">{lot.cluster}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleLotOrder(lot.id)}
                      className="btn-primary flex-1 py-2 text-sm"
                    >
                      {t.market?.buyNow || 'Buy Now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInquiryOpen(true)}
                      className="btn-outline px-4 py-2 text-sm"
                    >
                      {t.portal?.rfqBtn || 'RFQ'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats/Impact Section */}
        <section id="impact" className="section bg-primary text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs uppercase font-mono tracking-wider text-primary-light font-bold inline-block bg-white/10 px-3 py-1 rounded-full mb-4">
                Impact
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-4 tracking-tight">
                Measurable Impact Across the Harvest Economy
              </h2>
              <p className="text-lg text-primary-light/80">
                Real outcomes from digitizing India's agricultural supply chain.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <span className="block text-4xl sm:text-5xl font-extrabold font-mono">
                    {stat.value}
                  </span>
                  <span className="text-sm text-primary-light/80 font-medium mt-1 block">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team/Founders Section */}
        <section id="team" className="section bg-background border-b border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs uppercase font-mono tracking-wider text-primary font-bold badge-primary">
                Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mt-2 mb-4 tracking-tight">
                Founded in the Field
              </h2>
              <p className="text-lg text-text-muted">
                Built by people who understand the soil, the mandi, and the code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {team.map((member, i) => (
                <div key={i} className="card p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-4">
                    <member.icon className="w-8 h-8" />
                  </div>

                  <span className="text-[10px] font-mono uppercase bg-primary-light text-primary-text px-2 py-0.5 rounded font-bold mb-3 inline-block">
                    {['CEO', 'CTO', 'Operations'][i]}
                  </span>

                  <h3 className="text-xl font-bold text-secondary mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="text-text-muted leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section bg-background-alt border-t border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-primary text-white rounded-3xl p-8 sm:p-12 lg:p-16">
                <span className="text-xs uppercase font-mono tracking-wider text-primary-light font-bold inline-block bg-white/10 px-3 py-1 rounded-full mb-4">
                  Ready to Start
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
                  India's Agricultural Supply Chain is Live.
                </h2>
                <p className="text-lg text-primary-light/90 mb-8 max-w-xl mx-auto">
                  Join thousands of farmers, buyers, and logistics partners already on FarmLink.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/farmer" className="btn bg-white text-primary hover:bg-primary-light/20">
                    <span>Launch Farmer Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/buyer" className="btn border-2 border-white text-white hover:bg-white/10">
                    Explore Buyer Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}