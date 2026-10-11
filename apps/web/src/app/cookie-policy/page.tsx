'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Cookie, CheckCircle2, Shield, Info } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Cookie className="w-3.5 h-3.5" />
            <span>Transparent Storage Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Effective Date: October 2026 • Fasal Matrix uses only strictly functional and security-essential cookies. We never deploy invasive third-party ad tracking pixels.
          </p>
        </div>

        <div className="pt-8 space-y-10 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>1. What Cookies We Use & Why</span>
            </h2>
            <p>
              Cookies are compact text files stored on your device by your web browser. Fasal Matrix exclusively utilizes first-party cookies necessary for core application functionality, regional language localization, and role-based portal security.
            </p>
          </section>

          {/* Section 2: Table */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Detailed Cookie Registry</span>
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3 font-mono">Cookie Identifier</th>
                    <th className="p-3">Purpose & Classification</th>
                    <th className="p-3">Lifespan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <tr>
                    <td className="p-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">farmlink_lang</td>
                    <td className="p-3">Maintains chosen regional Indian language preference across pages without resets.</td>
                    <td className="p-3 font-mono">1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">farmlink_role</td>
                    <td className="p-3">Preserves authenticated agricultural role (Farmer, Buyer, Consumer, Admin) for routing security.</td>
                    <td className="p-3 font-mono">30 Days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">farmlink_cookies_consent</td>
                    <td className="p-3">Records your explicit cookie consent choice.</td>
                    <td className="p-3 font-mono">1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">theme</td>
                    <td className="p-3">Preserves dark or light UI preference.</td>
                    <td className="p-3 font-mono">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>3. Zero Third-Party Advertising Trackers</span>
            </h2>
            <p>
              We do not integrate Google Ads remarketing pixels, Meta/Facebook tracking SDKs, or commercial advertising brokers. Your browsing, cart, and market exploration habits remain strictly confidential to your session.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
              4. Managing & Clearing Cookies
            </h2>
            <p>
              You can modify or clear cookies at any time via your browser settings. Clearing cookies will reset your language selection and require re-authentication into your respective trading portal.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
