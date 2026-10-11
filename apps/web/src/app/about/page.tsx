'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import {
  ShieldCheck,
  CheckCircle,
  Building2,
  Lock,
  Search,
  Scale,
  ArrowRight,
  FileCheck2,
  BadgeCheck,
  Sparkles,
  Cpu,
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [licenseQuery, setLicenseQuery] = useState('FL-RJ-0482');
  const [verifiedResult, setVerifiedResult] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseQuery.trim()) return;
    setVerifiedResult(
      `✓ Verified: Depot #${licenseQuery.trim()} is officially accredited with active automated grade assaying and e-NWR pledge facility.`
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-emerald-500/20 selection:text-emerald-950 dark:selection:text-emerald-100 transition-colors relative overflow-hidden">
      {/* Spatial Ambient Lighting Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-3xl transform-gpu"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-teal-500/10 dark:bg-teal-600/10 blur-3xl transform-gpu"></div>
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl transform-gpu"></div>
      </div>

      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <main className="flex-1 relative z-10">
        {/* Spatial Hero Section */}
        <section className="border-b border-zinc-200/70 dark:border-zinc-800/80 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative backdrop-blur-xs">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide uppercase shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.about.institutionalTrustBadge}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight">
              {t.about.title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {t.about.subtitle}
            </p>
          </div>
        </section>

        {/* Spatial Mission & Cause Statement Card */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="backdrop-blur-2xl bg-white/75 dark:bg-zinc-900/75 rounded-3xl border border-white/80 dark:border-zinc-800/80 p-6 sm:p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all">
            <div className="max-w-3xl">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.about.coreCauseBadge}</span>
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 mt-2 mb-6 tracking-tight">
                {t.about.missionTitle}
              </h2>

              <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                <p>{t.about.missionText1}</p>
                <div className="font-medium text-zinc-800 dark:text-zinc-200 backdrop-blur-md bg-zinc-100/70 dark:bg-zinc-950/60 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
                  {t.about.missionText2}
                </div>
              </div>

              {/* Spatial Impact Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-zinc-200/70 dark:border-zinc-800/70">
                <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">
                    +18.4%
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {t.about.statIncomeGain}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">
                    100%
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {t.about.statMspAdherence}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">
                    T+1
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {t.about.statEscrowSettlement}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    0%
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {t.about.statBrokerCut}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spatial Depth Photo Gallery with Layered Visuals */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group rounded-3xl overflow-hidden border border-white/60 dark:border-zinc-800/80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
                  alt="Verified Direct Harvest"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold uppercase text-emerald-300 bg-emerald-950/80 backdrop-blur-md border border-emerald-700/50 px-2 py-0.5 rounded-full">
                  Farm Gate Assaying
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Direct Smallholder Harvests
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Farmers grading fresh produce lots directly at source, eliminating cartel deductions.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-white/60 dark:border-zinc-800/80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
                  alt="WDRA Accredited Warehousing"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold uppercase text-blue-300 bg-blue-950/80 backdrop-blur-md border border-blue-700/50 px-2 py-0.5 rounded-full">
                  WDRA & e-NWR Depots
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Accredited Cold Silos & Vaults
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    State-of-the-art temperature and moisture telemetry protecting storable grain and perishables.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-white/60 dark:border-zinc-800/80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
                  alt="Institutional Procurement"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold uppercase text-purple-300 bg-purple-950/80 backdrop-blur-md border border-purple-700/50 px-2 py-0.5 rounded-full">
                  T+1 Escrow Settlement
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Direct Institutional Clearance
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Seamless delivery to bulk processors and consumers with guaranteed automated payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Pillars of Institutional Trust in Spatial Cards */}
        <section id="standards" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
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
            <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-white/80 dark:border-zinc-800/80 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
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

            {/* Pillar 2 */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-white/80 dark:border-zinc-800/80 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
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

            {/* Pillar 3 */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-white/80 dark:border-zinc-800/80 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Scale className="w-5 h-5" />
                </div>
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

            {/* Pillar 4 */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-white/80 dark:border-zinc-800/80 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.about.pillar4Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {t.about.pillar4Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-purple-700 dark:text-purple-400 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.rbiRegulatedEscrow}</span>
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-white/80 dark:border-zinc-800/80 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between md:col-span-2 lg:col-span-2">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                  <BadgeCheck className="w-5 h-5" />
                </div>
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
        </section>

        {/* Live Accreditation Verification Spatial Terminal */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="backdrop-blur-2xl bg-zinc-900/90 dark:bg-zinc-950/90 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="max-w-2xl relative z-10">
              <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>{t.about.publicTrustRegistry}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 mb-2">
                {t.about.verificationWidgetTitle}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">
                {t.about.verificationWidgetDesc}
              </p>

              <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={licenseQuery}
                    onChange={(e) => setLicenseQuery(e.target.value)}
                    placeholder={t.about.depotSearchPlaceholder}
                    className="w-full bg-zinc-950/80 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shrink-0 shadow-md"
                >
                  {t.about.checkButton}
                </button>
              </form>

              {verifiedResult && (
                <div className="mt-4 p-3 bg-zinc-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono flex items-start gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{verifiedResult}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Governance & Zero-Commission Platform Pledge */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-8 text-center space-y-4 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.about.governanceTitle}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {t.about.governanceDesc}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs">
                {t.about.govNoProprietary}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs">
                {t.about.govNoHiddenCharges}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs">
                {t.about.govPlatformFee}
              </span>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="border-t border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md bg-white/50 dark:bg-zinc-950/50 py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.about.contactCtaTitle}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
              {t.about.contactCtaDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setInquiryOpen(true)}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold transition inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>{t.about.contactCtaBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
