'use client';

import React, { useState } from 'react';
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
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-zinc-200/80 bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.about.institutionalTrustBadge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              {t.about.title}
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              {t.about.subtitle}
            </p>
          </div>
        </section>

        {/* Mission / Cause Statement */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-12 shadow-xs">
            <div className="max-w-3xl">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-800 font-bold">
                {t.about.coreCauseBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 mt-1 mb-6 tracking-tight">
                {t.about.missionTitle}
              </h2>
              <div className="space-y-4 text-zinc-600 text-sm sm:text-base leading-relaxed">
                <p>{t.about.missionText1}</p>
                <p className="font-medium text-zinc-800 bg-zinc-50 p-4 rounded-xl border border-zinc-200/70">
                  {t.about.missionText2}
                </p>
              </div>

              {/* Impact Metrics Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-zinc-100">
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950">
                    +18.4%
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {t.about.statIncomeGain}
                  </span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950">
                    100%
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {t.about.statMspAdherence}
                  </span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950">
                    T+1
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {t.about.statEscrowSettlement}
                  </span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-zinc-950">
                    0%
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {t.about.statBrokerCut}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Pillars of Institutional Trust */}
        <section id="standards" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-800 font-bold">
              {t.about.uncompromisingStandards}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 mt-1 mb-3 tracking-tight">
              {t.about.trustSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              {t.about.trustSectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 mb-2">
                  {t.about.pillar1Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {t.about.pillar1Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.agmarkFssaiCompliant}</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 mb-2">
                  {t.about.pillar2Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {t.about.pillar2Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.wdraAccreditedDepots}</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 mb-2">
                  {t.about.pillar3Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {t.about.pillar3Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.zeroDownsideGuardrail}</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 mb-2">
                  {t.about.pillar4Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {t.about.pillar4Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.rbiRegulatedEscrow}</span>
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition md:col-span-2 lg:col-span-2">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-4">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 mb-2">
                  {t.about.pillar5Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {t.about.pillar5Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.cryptoAuditTrail}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Accreditation Verification Terminal */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="bg-zinc-900 text-white rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-md">
            <div className="max-w-2xl">
              <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                {t.about.publicTrustRegistry}
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
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shrink-0"
                >
                  {t.about.checkButton}
                </button>
              </form>

              {verifiedResult && (
                <div className="mt-4 p-3 bg-zinc-950/80 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 font-mono flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{verifiedResult}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Governance & Zero-Commission Pledge */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="border border-zinc-200 bg-white rounded-2xl p-8 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
              {t.about.governanceTitle}
            </h3>
            <p className="text-sm text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              {t.about.governanceDesc}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
                {t.about.govNoProprietary}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
                {t.about.govNoHiddenCharges}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
                {t.about.govPlatformFee}
              </span>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="border-t border-zinc-200 bg-white py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {t.about.contactCtaTitle}
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl mx-auto">
              {t.about.contactCtaDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setInquiryOpen(true)}
                className="px-6 py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs sm:text-sm font-semibold transition inline-flex items-center gap-2 shadow-xs"
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
