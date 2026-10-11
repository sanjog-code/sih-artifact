'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Lock, Shield, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span>/</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">Privacy Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Digital Personal Data Protection (DPDP) Act 2023 Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Effective Date: October 2026 • Published by Fasal Matrix Agrarian Technologies Pvt. Ltd. pursuant to the Digital Personal Data Protection Act, 2023.
          </p>
        </div>

        <div className="pt-8 space-y-10 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>1. Strict Data Minimization Policy</span>
            </h2>
            <p>
              We practice principled data minimization. We collect only data strictly necessary to facilitate verified agricultural trade, cold-chain logistics routing, and statutory payment settlements:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Cultivators & Sellers:</strong> Name, mobile phone number for SMS authentication, farm location (Pincode & Mandi district), bank account details for T+1 nodal settlement, and WDRA deposit receipts.
              </li>
              <li>
                <strong>Buyers:</strong> Recipient name, dispatch delivery address, phone number, and GSTIN (for institutional business invoices).
              </li>
              <li>
                <strong>We Do Not Collect:</strong> We never track invasive behavioral telemetry, browser fingerprinting, cross-app tracking, or unmandated biometric identifiers.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Purpose Limitation & Zero Data Selling</span>
            </h2>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Commercial Sale of Personal Data</span>
              </div>
              <p className="text-xs text-emerald-900/90 dark:text-emerald-300">
                Fasal Matrix never sells, rents, monetizes, or shares user contact or trading data with third-party advertisers, credit brokers, or marketing networks. Information is processed solely to fulfill confirmed agricultural consignment contracts.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>3. Statutory Indian Data Rights</span>
            </h2>
            <p>
              Under the Digital Personal Data Protection Act 2023, you enjoy statutory rights:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Right to Access:</strong> View all lot listings, invoices, and transaction records tied to your registered identity.</li>
              <li><strong>Right to Correction & Erasure:</strong> Update outdated profile records or request permanent deletion of non-statutory account data.</li>
              <li><strong>Right of Grievance Redressal:</strong> Submit privacy concerns directly to our Nodal Grievance Officer with an assured 48-hour response turnaround.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
              4. Data Retention & Security Architecture
            </h2>
            <p>
              Financial invoices and weighbridge consignment receipts are retained for 8 years as required by the Indian Goods and Services Tax (GST) Act and WDRA regulations. All data in transit is protected via TLS 1.3 encryption, and data at rest is stored in certified sovereign Indian cloud datacenters (Mumbai / Hyderabad regions).
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
              5. Statutory Grievance Redressal Officer
            </h2>
            <p>
              In accordance with the Information Technology Act 2000 and DPDP Act 2023, the contact details of our Data Protection & Grievance Officer are:
            </p>
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono space-y-1">
              <div><strong>Name:</strong> Officer Rajesh V. Meena</div>
              <div><strong>Designation:</strong> Statutory Grievance Redressal Officer</div>
              <div><strong>Address:</strong> Fasal Matrix Agrarian Technologies Pvt. Ltd., Muhana Mandi Terminal, Jaipur, RJ 302029</div>
              <div>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@fasalmatrix.in" className="text-emerald-700 dark:text-emerald-400 hover:underline">
                  privacy@fasalmatrix.in
                </a>{' '}
                /{' '}
                <a href="mailto:grievance@fasalmatrix.in" className="text-emerald-700 dark:text-emerald-400 hover:underline">
                  grievance@fasalmatrix.in
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
