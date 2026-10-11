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
                  Fresh Vegetables & Perishables
                </span>
                <span className="text-xl font-black text-zinc-950 dark:text-zinc-50 block mt-1">
                  Within 2 Hours
                </span>
                <p className="text-xs text-zinc-500 mt-1">
                  Per the <em>Vegetable Quality, Return and Refund Policy</em>, quality claims on fresh produce must be reported within 2 hours of delivery with photographic or video evidence of the batch condition and packaging.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block font-mono">
                  Storable Agri-Commodities & Silos
                </span>
                <span className="text-xl font-black text-zinc-950 dark:text-zinc-50 block mt-1">
                  Within 48 Hours
                </span>
                <p className="text-xs text-zinc-500 mt-1">
                  Grains, pulses, and oilseeds have a 48-hour window from delivery ticket confirmation for moisture analysis, foreign matter, and weighbridge verification.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Statutory Vegetable Quality & Refund Rules */}
          {/* Section 3: Statutory Vegetable Quality, Return & Refund Policy (9-Point Standard) */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>3. Statutory 9-Point Fresh Vegetable Quality, Return & Refund Policy</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              In strict accordance with the <em>Vegetable Quality, Return and Refund Policy</em> standards for fresh perishables, the following 9 statutory rules govern all fresh produce procurement across Fasal Matrix:
            </p>
            <div className="grid grid-cols-1 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">1</span>
                  <span>The 50% Rotten Produce Rule</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7">
                  A buyer can request a full return or refund if more than 50% of the delivered vegetables are found to be rotten, spoiled, or unfit for human consumption upon dock inspection.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">2</span>
                  <span>Full Delivery Cost Coverage</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7">
                  If the claim is verified under the 50% Rotten Produce Rule, the buyer receives a 100% refund for the eligible order, including all delivery, shipping, and freight charges paid for that order.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">3</span>
                  <span>Two-Hour Reporting Window</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7">
                  To qualify for a return or refund, the issue must be reported within 2 hours of delivery receipt. Claims submitted after this 2-hour window cannot be accepted due to rapid natural perishable degradation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">4</span>
                  <span>Mandatory Photographic Evidence</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7">
                  Clear photographic or video evidence showing the full batch condition, package labels, and rotten produce must be submitted alongside the claim ticket for prompt validation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">5</span>
                  <span>Minor Quality Issues & Proportionate Credits (&le;50% Rule)</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7">
                  If 50% or less of the vegetables are defective or bruised, the order does not automatically qualify for a full refund. Our assessment team will review the evidence and issue a proportional partial refund or store credit based on measured defect weight.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">6</span>
                  <span>Wrong Items Delivered</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7">
                  If incorrect vegetables are delivered, report it within 2 hours with photographs. We will arrange a replacement at no additional cost or process a full refund for the affected items.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">7</span>
                  <span>Quantity Shortages</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7">
                  Any weight shortfall or missing packages must be reported within 2 hours with weighbridge or electronic scale photos. A proportional refund or credit will be issued immediately.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">8</span>
                  <span>Refund Processing & Bank Reversal Timeline</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7">
                  Approved refunds are processed within 24 to 48 hours. Funds will be credited back to the original payment method or issued as store credit based on buyer preference.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">9</span>
                  <span>Produce Disposal</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7">
                  Once a claim is approved, you are not required to return rotten vegetables. Please dispose of them responsibly or route them to regional composting facilities.
                </p>
              </div>
            </div>
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
              or email us directly at{' '}
              <a href="mailto:grievance@fasalmatrix.in" className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                grievance@fasalmatrix.in
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
