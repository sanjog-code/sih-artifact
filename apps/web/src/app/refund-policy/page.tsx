'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { RefreshCcw, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span>/</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">Refund Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Statutory Agrarian Trade Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Escrow Dispute & Refund Policy
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Effective Date: October 2026 • Governed under the Consumer Protection (E-Commerce) Rules 2020 & RBI Nodal Escrow Clearing Framework.
          </p>
        </div>

        <div className="pt-8 space-y-10 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>1. Zero-Risk Nodal Escrow Model</span>
            </h2>
            <p>
              Fasal Matrix operates a zero-speculation trade network. When a buyer places an order, funds are deposited directly into a designated RBI-regulated nodal escrow account. Funds are never released to the producer or warehousing depot until the produce is physically received, weighed, and verified against statutory AGMARK quality assay standards.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Dispute Windows & Inspection Timelines</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block font-mono">
                  Perishable Commodities
                </span>
                <span className="text-xl font-black text-zinc-950 dark:text-zinc-50 block mt-1">
                  Within 24 Hours
                </span>
                <p className="text-xs text-zinc-500 mt-1">
                  Vegetables, leafy greens, and fresh fruits must be inspected upon delivery dock receipt. Moisture degradation or transit spoilage claims must be filed with photographic proof within 24 hours.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block font-mono">
                  Storable Agri-Commodities
                </span>
                <span className="text-xl font-black text-zinc-950 dark:text-zinc-50 block mt-1">
                  Within 48 Hours
                </span>
                <p className="text-xs text-zinc-500 mt-1">
                  Grains, pulses, oilseeds, and WDRA warehouse-stored produce lots have a 48-hour window from delivery ticket confirmation for moisture analysis, foreign matter, and weighbridge verification.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>3. Eligible Grounds for Refund & Return</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Quality Discrepancy:</strong> Produce grade fails to meet certified AGMARK assay specifications declared in the producer manifest (e.g., foreign matter exceeding statutory limits, high moisture content).
              </li>
              <li>
                <strong>Weight Shortfall:</strong> Certified weighbridge ticket shows a negative net discrepancy exceeding the allowable statutory moisture loss tolerance (0.5%).
              </li>
              <li>
                <strong>Transit Spoilage:</strong> Temperature excursion during cold-chain dispatch exceeding agreed transit preservation standards.
              </li>
              <li>
                <strong>Non-Fulfilment:</strong> Producer or transport carrier fails to dispatch cargo within the committed transit window.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>4. Refund Processing & Bank Settlement SLA</span>
            </h2>
            <p>
              Once a dispute is validated by our independent quality assaying team or terminal supervisor:
            </p>
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>T+1 Bank Settlement: Escrow funds are reversed directly to the buyer's original bank source account within 24 to 48 banking hours.</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Zero Cancellation Surcharge: No platform deductions or penalty fees are applied for verified quality cancellations.</span>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              Need to initiate a return or assay dispute?
            </h3>
            <p className="text-xs text-emerald-900/80 dark:text-emerald-300">
              Submit your lot number and gate weighbridge ticket via our{' '}
              <Link href="/about#contact" className="underline font-semibold hover:text-emerald-700">
                Nodal Grievance Desk
              </Link>{' '}
              or email us directly at <span className="font-mono font-semibold">grievance@fasalmatrix.in</span>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
