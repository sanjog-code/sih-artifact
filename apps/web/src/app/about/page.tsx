'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import JsonLd from '../../components/JsonLd';

const aboutBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://fasalmatrix.in',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'About & Governance',
      item: 'https://fasalmatrix.in/about',
    },
  ],
};

const aboutFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does Fasal Matrix ensure farmers receive MSP protection?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All crop listings are benchmarked in real time against statutory Minimum Support Price (MSP) baselines and APMC modal prices published via Agmarknet and e-NAM. Transactions below statutory MSP floors are algorithmically flagged to protect producer realization.',
      },
    },
    {
      '@type': 'Question',
      name: 'How are farmer payments protected through escrow?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Payments from institutional buyers and consumers are deposited into an RBI-regulated nodal escrow account prior to dispatch. Funds are disbursed to the farmer’s verified bank account on a T+1 schedule immediately upon physical produce acceptance.',
      },
    },
    {
      '@type': 'Question',
      name: 'What quality grading standards are enforced?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Produce is inspected against AGMARK quality grades at regional WDRA-compliant warehousing terminals and mandi depots, checking moisture content, foreign matter percentage, and grain defects.',
      },
    },
  ],
};
import {
  ShieldCheck,
  CheckCircle,
  Building2,
  Lock,
  Scale,
  ArrowRight,
  FileCheck2,
  BadgeCheck,
  Sparkles,
  Layers,
  TrendingUp,
  Activity,
  Award,
  Wallet,
  Coins,
  Send,
  User,
  Phone,
  Mail,
  MessageSquare,
  Building,
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  // Direct Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'buyer',
    organization: '',
    message: '',
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      setContactError('Please provide your full name and a valid 10-digit mobile number.');
      return;
    }
    if (contactForm.phone.trim().replace(/\D/g, '').length < 10) {
      setContactError('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    setContactError(null);
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-emerald-500/20 selection:text-emerald-950 dark:selection:text-emerald-100 transition-colors relative overflow-hidden">
      <JsonLd data={aboutBreadcrumbSchema} />
      <JsonLd data={aboutFaqSchema} />
      {/* Dynamic Photographic Backdrop with Agrarian Landscape & Circuit Blend */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000&q=85"
          alt="Agrarian Golden Harvest Fields"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-25 dark:opacity-20 scale-105 filter blur-[2px]"
        />
        {/* Multilayered Gradient Scrim for crisp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/90 via-zinc-50/80 to-zinc-50/95 dark:from-zinc-950/92 dark:via-zinc-950/85 dark:to-zinc-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] dark:bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:32px_32px] opacity-20"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/15 dark:bg-emerald-600/20 blur-3xl transform-gpu"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-teal-500/15 dark:bg-teal-600/15 blur-3xl transform-gpu"></div>
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl transform-gpu"></div>
      </div>

      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <main className="flex-1 relative z-10">
        {/* =================================================================== */}
        {/* HERO SECTION: Circuit-Board Grid + Live Finance Dashboard Badges  */}
        {/* =================================================================== */}
        <section className="relative border-b border-zinc-200/80 dark:border-zinc-800/80 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            {/* Visual Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
              <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
              <span>/</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">About & Governance</span>
            </nav>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-[1.12]">
              {t.about.title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {t.about.subtitle}
            </p>

            {/* Quick Hero Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#standards"
                className="px-6 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 font-bold text-xs sm:text-sm transition shadow-sm inline-flex items-center gap-2"
              >
                <span>Explore Trust Pillars</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 font-bold text-xs sm:text-sm transition shadow-xs inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Contact Integration Desk</span>
              </a>
            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* SATIN FEATURE PANEL: Core Cause & Mission Statement                */}
        {/* =================================================================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative">
          <div className="relative rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
            {/* Photographic Underlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80"
                alt="Agrarian Logistics and Grain Depots"
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover object-center opacity-20 dark:opacity-15 filter blur-[1px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-zinc-950/95 dark:via-zinc-950/90 dark:to-zinc-950/95" />
            </div>

            <div className="relative z-10 backdrop-blur-md p-6 sm:p-12">
              <div className="max-w-3xl">
                <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.about.coreCauseBadge}</span>
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-2 mb-6 tracking-tight">
                  {t.about.missionTitle}
                </h2>

                <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                  <p>{t.about.missionText1}</p>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
                    {t.about.missionText2}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* PHOTO GALLERY: Ground Realities & Agrarian Network Assets          */}
        {/* =================================================================== */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                Ground Reality & Field Infrastructure
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 tracking-tight">
                Operating Directly Across India’s Agricultural Clusters
              </h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 sm:mt-0 max-w-sm">
              Real farmgate checkpoints, assay testing laboratories, and cold storage silos operational in Rajasthan, Madhya Pradesh, and Punjab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
                  alt="Verified Direct Harvest"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-300 bg-emerald-950/90 backdrop-blur-md border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
                    Kisan Cluster #42
                  </span>
                </div>
                <span className="absolute bottom-3 left-3 text-[11px] font-mono font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                   Sanganer, Jaipur (Rajasthan)
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Direct Smallholder Harvests
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Farmers grading fresh produce lots directly at source with optical moisture & defect scanning, eliminating middleman cartel deductions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                  <span>AGMARK A1 Certified</span>
                  <span>100% Direct Payout</span>
                </div>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
                  alt="WDRA Accredited Warehousing"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-300 bg-blue-950/90 backdrop-blur-md border border-blue-700/60 px-2.5 py-0.5 rounded-full">
                    WDRA Vault FL-RJ-0482
                  </span>
                </div>
                <span className="absolute bottom-3 left-3 text-[11px] font-mono font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                   Phulera Cold Silo Terminal
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Accredited Cold Silos & Vaults
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    State-of-the-art temperature and moisture telemetry protecting storable grain, pulses, and perishables with zero post-harvest spoilage.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-400 font-mono font-semibold">
                  <span>e-NWR Fungible</span>
                  <span>4°C Humidity Controlled</span>
                </div>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
                  alt="Institutional Procurement"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-300 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 px-2.5 py-0.5 rounded-full">
                    Bulk Nodal Clearance
                  </span>
                </div>
                <span className="absolute bottom-3 left-3 text-[11px] font-mono font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                   Muhana Institutional Terminal
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Direct Institutional Clearance
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Automated multi-depot vehicle manifests and delivery to verified bulk processors and consumers with guaranteed T+1 escrow payout.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-700 dark:text-zinc-300 font-mono font-semibold">
                  <span>RBI Escrow Vault</span>
                  <span>T+1 Bank Settlement</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* PHOTO SECTION: High-Fidelity Agrarian Supply Chain in Action      */}
        {/* =================================================================== */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <span>Transparent Market Linkages</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
                  From Farm Gate Soil to Wholesale Processing Plant
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Traditional mandis impose opaque weighing cuts, commission agent margins, and days of holding queue decay. Fasal Matrix deploys cold-chain logistics, algorithmic route dispatch, and digital gate assaying to bridge growers directly with food processing enterprises.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70">
                    <span className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">Cold Chain Dispatch</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">Direct Farm-to-Buyer</span>
                    <span className="text-[11px] text-zinc-500 block">Minimizing transit decay</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70">
                    <span className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">Transit Logistics</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5">Scheduled Dispatch</span>
                    <span className="text-[11px] text-zinc-500 block">Route-monitored vehicles</span>
                  </div>
                </div>
              </div>

              {/* 2x2 Photo Mosaic of Real Operations */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 group">
                  <Image
                    src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80"
                    alt="Onion Sorting and Grading"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                    Automated Lot Sizing
                  </span>
                </div>

                <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 group">
                  <Image
                    src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80"
                    alt="Fresh Harvest Crates"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                    Farmgate Crated Intake
                  </span>
                </div>

                <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 group">
                  <Image
                    src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80"
                    alt="Seed Quality Testing"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                    Chemical & Purity Lab
                  </span>
                </div>

                <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 group">
                  <Image
                    src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80"
                    alt="Field Tractor Dispatch"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                    Direct Fleet Dispatch
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 5 PILLARS OF INSTITUTIONAL TRUST: Grid Cards with Real Photos      */}
        {/* =================================================================== */}
        <section id="standards" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
              {t.about.uncompromisingStandards}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 mb-3 tracking-tight">
              {t.about.trustSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
              {t.about.trustSectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div id="standards-quality" className="group backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-mt-24">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=700&q=80"
                  alt="Standardized Quality Assaying"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span className="absolute bottom-2.5 left-3 text-[10px] font-mono font-bold uppercase text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded">
                  Pillar 01 • AGMARK Testing
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                    {t.about.pillar1Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {t.about.pillar1Desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.about.agmarkFssaiCompliant}</span>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div id="standards-wdra" className="group backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-mt-24">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80"
                  alt="WDRA-Accredited Warehousing"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-blue-500/20 backdrop-blur-md border border-blue-500/40 text-blue-300 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="absolute bottom-2.5 left-3 text-[10px] font-mono font-bold uppercase text-blue-300 bg-blue-950/80 border border-blue-700/50 px-2 py-0.5 rounded">
                  Pillar 02 • e-NWR Silos
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                    {t.about.pillar2Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {t.about.pillar2Desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-blue-700 dark:text-blue-400 font-semibold font-mono">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.about.wdraAccreditedDepots}</span>
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div id="standards-msp" className="group backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-mt-24">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=700&q=80"
                  alt="Statutory MSP Floor Guardrails"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="absolute bottom-2.5 left-3 text-[10px] font-mono font-bold uppercase text-amber-300 bg-amber-950/80 border border-amber-700/50 px-2 py-0.5 rounded">
                  Pillar 03 • Statutory MSP
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                    {t.about.pillar3Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {t.about.pillar3Desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-semibold font-mono">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.about.zeroDownsideGuardrail}</span>
                </div>
              </div>
            </div>

            {/* Pillar 4 */}
            <div id="standards-escrow" className="group backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-mt-24">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=700&q=80"
                  alt="T+1 Regulated Escrow Settlement"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-zinc-800 backdrop-blur-md border border-zinc-700 text-zinc-300 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="absolute bottom-2.5 left-3 text-[10px] font-mono font-bold uppercase text-zinc-300 bg-zinc-900/80 border border-zinc-700 px-2 py-0.5 rounded">
                  Pillar 04 • Nodal Escrow
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                    {t.about.pillar4Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {t.about.pillar4Desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold font-mono">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.about.rbiRegulatedEscrow}</span>
                </div>
              </div>
            </div>

            {/* Pillar 5 */}
            <div id="standards-telemetry" className="group backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between md:col-span-2 lg:col-span-2 scroll-mt-24">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
                  alt="Cryptographic Batch Origin Telemetry"
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-teal-500/20 backdrop-blur-md border border-teal-500/40 text-teal-300 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <span className="absolute bottom-2.5 left-3 text-[10px] font-mono font-bold uppercase text-teal-300 bg-teal-950/80 border border-teal-700/50 px-2 py-0.5 rounded">
                  Pillar 05 • Batch Origin & Farm Traceability
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                    {t.about.pillar5Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {t.about.pillar5Desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-teal-700 dark:text-teal-400 font-semibold font-mono">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.about.cryptoAuditTrail}</span>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* =================================================================== */}
        {/* PLATFORM PLEDGE & ZERO COMMISSION ARCHITECTURE                     */}
        {/* =================================================================== */}
        <section id="governance" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-24">
          <div className="relative rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            {/* Photographic Underlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1600&q=80"
                alt="Golden Agrarian Fields Governance"
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover object-center opacity-15 dark:opacity-10 filter blur-[1px]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-900/95" />
            </div>

            <div className="relative z-10 backdrop-blur-xl p-8 text-center space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                {t.about.governanceTitle}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                {t.about.governanceDesc}
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs">
                  {t.about.govNoProprietary}
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs">
                  {t.about.govNoHiddenCharges}
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs">
                  {t.about.govPlatformFee}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* FIELD NETWORK & COOPERATIVE CLUSTERS (Photo-Driven Visual Proof)    */}
        {/* =================================================================== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
              Field Deployments & Institutional Partners
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 tracking-tight">
              Verified Physical Infrastructure Across Regional Mandis
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Every depot and cooperative hub on Fasal Matrix operates with active optical assaying hardware, calibrated weighbridges, and e-NWR compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl group hover:-translate-y-1 transition duration-300">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80"
                  alt="Grain Weighbridge and Mandi Assay"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded">
                  HUB #01 • KOTA
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-zinc-950 dark:text-white">Kota Grain Terminal</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  12,000 MT capacity with mechanized pneumatic grain intake for soybean and mustard lots.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl group hover:-translate-y-1 transition duration-300">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
                  alt="Vegetable Wholesale Grading"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded">
                  HUB #02 • JAIPUR
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-zinc-950 dark:text-white">Muhana Fresh Depot</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Sub-zero multi-chamber cold vault serving tomato, onion, and potato grower clusters.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl group hover:-translate-y-1 transition duration-300">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80"
                  alt="Agronomist Quality Inspection"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded">
                  HUB #03 • BHOPAL
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-zinc-950 dark:text-white">Bhopal Pulses Silo</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Automated nitrogen purges and moisture meters for chana and pigeon pea preservation.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl group hover:-translate-y-1 transition duration-300">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"
                  alt="Direct Farm Sourcing Punjab"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded">
                  HUB #04 • LUDHIANA
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-zinc-950 dark:text-white">Punjab Wheat Gateway</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Sharbati & durum wheat bulk intake terminal with direct rail freight container linkages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* EDITORIAL CREDENTIALS & AGRONOMIC ADVISORY BOARD                   */}
        {/* =================================================================== */}
        <section id="advisory" className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
              Editorial Governance & Agronomy Board
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 tracking-tight">
              Verified Scientific & Mandi Economic Credentials
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Every commodity standard, grading rule, and price transparency formula on Fasal Matrix is vetted by accredited agricultural scientists and former regulatory nodal officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-300 text-base">
                    RS
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Dr. Rameshwar Sharma, Ph.D.</h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">Principal Agronomist & Mandi Economics Lead</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Former Senior Agronomy Scientist at the Indian Council of Agricultural Research (ICAR). Over 28 years specializing in cereal grain pathology, MSP parity modelling, and post-harvest moisture mitigation in semi-arid cultivation zones.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                Peer Reviewer • Journal of Agricultural Economics & Policy
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 flex items-center justify-center font-bold text-blue-800 dark:text-blue-300 text-base">
                    SD
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Sunita Deshmukh, M.Tech</h3>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 font-mono">WDRA Warehousing & Cold-Chain Advisor</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Pioneered electronic Negotiable Warehouse Receipt (e-NWR) onboarding across 40+ central warehousing facilities. Advises Fasal Matrix on cold-chain thermography and non-destructive optical assay protocols.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                Accredited Assayer • National Warehousing Development Regulatory Authority
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 flex items-center justify-center font-bold text-amber-800 dark:text-amber-300 text-base">
                    AV
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Adv. Anand Verma, LL.M.</h3>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">Agricultural Trade & Escrow Counsel</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Specialist in APMC Model Act statutory compliance, farmer dispute resolution under the Farmers&apos; Agreement Act, and escrow governance under RBI directions on payment aggregators.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                Standing Counsel • Rural Agri-Trade Arbitration Forum
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* ACCREDITED PRESS CITATIONS & RECOGNITION                           */}
        {/* =================================================================== */}
        <section id="press" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
              Press Citations & Independent Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 tracking-tight">
              Featured in National Agrarian Discourse
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-zinc-950 dark:text-white uppercase bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
                  FORBES INDIA
                </span>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Special Agritech Feature</span>
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white mb-2">
                &ldquo;Direct-Trade Innovations: How Transparent Mandi Escrows Protect Smallholders from Price Collapse&rdquo;
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Forbes India highlighted Fasal Matrix&apos;s pioneering integration of live APMC mandi modal rates with non-custodial escrow vouchers, recognizing the platform&apos;s commitment to eliminating unrecorded middleman commissions for marginal farmers across Rajasthan and Madhya Pradesh.
              </p>
              <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                Published & Indexed • National Enterprise & Rural Commerce Edition
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-zinc-950 dark:text-white uppercase bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
                  CACP AGRARIAN BULLETIN
                </span>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Policy Citation</span>
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white mb-2">
                &ldquo;Benchmarking Farmer Price Realization Through Open Disaggregated Logistics & Assayed Grade Parity&rdquo;
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Cited in comparative studies on electronic market transparency as a robust prototype for ensuring that farm-gate realization meets or exceeds statutory Fair and Remunerative Price (FRP) and MSP baselines during peak harvest influx.
              </p>
              <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                Ministry of Agriculture & Farmers Welfare Research Review
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* DEDICATED CONTACT & INTEGRATION DESK (Fintech SaaS Template Style) */}
        {/* =================================================================== */}
        <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm">
            {/* Left Contact Context */}
            <div className="lg:col-span-2 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold uppercase">
                <span>Institutional Onboarding</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
                {t.about.contactCtaTitle}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {t.about.contactCtaDesc}
              </p>

              <div className="pt-4 space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-start gap-3">
                  <Building className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">Agrarian Nodal Hub:</strong>
                    <span>Muhana Terminal, Sanganer, Jaipur, RJ 302029</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">Toll-Free Kisan Desk:</strong>
                    <a href="tel:18008892603" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
                      1800-889-2603
                    </a>
                    <span className="text-zinc-500 text-[11px] ml-1.5">(22 Indian Languages Supported)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">Institutional Escrow Desk:</strong>
                    <a href="mailto:escrow.desk@farmlink-matrix.gov.in" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
                      escrow.desk@farmlink-matrix.gov.in
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryOpen(true)}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                >
                  <span>Open Quick Modal Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-3 bg-zinc-50/80 dark:bg-zinc-950/60 p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
              {contactError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-400">
                  {contactError}
                </div>
              )}

              {contactSubmitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                    Integration Inquiry Dispatched
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                    Our agrarian logistics and escrow officer will contact your organization within 2 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Full Name <span className="text-emerald-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Sanjay Sharma"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Mobile Phone <span className="text-emerald-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="9829012345"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Work Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="procurement@agrocorp.in"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Organization / FPO
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={contactForm.organization}
                          onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                          placeholder="Kisan Producer Org / ITC Foods"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Organization Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'buyer', label: 'Bulk Processor' },
                        { id: 'fpo', label: 'Farmer / FPO' },
                        { id: 'warehouse', label: 'Warehouse / Silo' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setContactForm({ ...contactForm, role: item.id })}
                          className={`py-2 px-2 text-[11px] rounded-xl border text-center font-bold transition ${
                            contactForm.role === item.id
                              ? 'bg-zinc-950 text-white dark:bg-emerald-500 dark:text-zinc-950 border-zinc-950 dark:border-emerald-500 shadow-2xs'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Inquiry / Commodity Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Specify monthly quintal volume, required AGMARK grade, or regional delivery depot requirements..."
                      className="w-full p-3 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        className="mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>
                        I consent to Fasal Matrix contacting me regarding commodity procurement in accordance with the{' '}
                        <Link href="/privacy" className="underline font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
                          Privacy Policy
                        </Link>.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.about.contactCtaBtn}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
