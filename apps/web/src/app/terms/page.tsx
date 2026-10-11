'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Scale, ShieldCheck, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Institutional Trading Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Effective Date: October 2026 • Published by Fasal Matrix Agrarian Technologies Pvt. Ltd. pursuant to the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020.
          </p>
        </div>

        <div className="pt-8 space-y-10 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>1. Eligibility & Age Restriction</span>
            </h2>
            <p>
              By accessing or using Fasal Matrix (the "Platform"), you declare and warrant that you are at least <strong>18 years of age</strong> and are legally competent to enter into a binding contract under the Indian Contract Act, 1872. Minor access without adult guardianship is strictly prohibited.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Statutory MSP Floor Compliance</span>
            </h2>
            <p>
              Fasal Matrix operates under a statutory social covenant for agricultural producers. All base procurement transactions for notified commodities are strictly bound to benchmark Minimum Support Price (MSP) floors declared by the Commission for Agricultural Costs and Prices (CACP) and the Cabinet Committee on Economic Affairs (CCEA). Bids or procurement requests below statutory MSP floors are mechanically blocked by platform smart contracts.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>3. Farmer & Producer Warranties</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Factual Lot Declarations:</strong> Cultivators and Farmer Producer Organizations (FPOs) warrant that uploaded lot details (variety, moisture, harvest date, location) represent genuine produce lots physically available for dispatch.
              </li>
              <li>
                <strong>Quality Assaying:</strong> Produce lots are subject to digital optical grading and physical assaying at WDRA accredited warehousing depots before custody handover.
              </li>
              <li>
                <strong>Direct Cultivator Title:</strong> Sellers warrant they hold unencumbered ownership title to the produce lots listed for sale.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>4. Buyer Obligations & Nodal Escrow Settlement</span>
            </h2>
            <p>
              Institutional and consumer buyers agree to deposit total contract dues into the RBI-regulated nodal escrow account upon order confirmation. Buyer settlement release is triggered automatically upon verified terminal dock weighbridge and AGMARK assay receipt on T+1 banking schedules.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>5. Platform Role & Limitation of AI Authority</span>
            </h2>
            <p>
              Fasal Matrix provides assistive algorithmic tools (including price trend forecasting and route optimization) as technical aids for informational purposes only. The platform never acts as an automated financial or legal authority. All final purchase, sale, price negotiation, and physical quality approvals rest exclusively with human market participants.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
              6. Governing Law & Dispute Jurisdiction
            </h2>
            <p>
              These Terms of Service are governed by and construed under the laws of the Republic of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Jaipur, Rajasthan.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
