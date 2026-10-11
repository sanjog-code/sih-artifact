'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, RotateCcw, Home, Compass, ShieldAlert } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to console for diagnostic traceability
    console.error('Fasal Matrix Platform Error:', error);
  }, [error]);

  return (
    <div className="bg-[#fafafa] dark:bg-zinc-950 flex min-h-screen w-full flex-col overflow-hidden font-sans lg:flex-row transition-colors">
      {/* Visual Side Banner with Agrarian Motif */}
      <div className="relative h-72 sm:h-96 lg:h-screen w-full lg:w-1/2 p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <div className="relative h-full w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80"
            alt="Fasal Matrix Agrarian Field"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center filter brightness-[0.88] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent pointer-events-none" />

          {/* Floating Telemetry Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border border-white/60 dark:border-zinc-700/80 shadow-xl rounded-2xl p-3.5 max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-800 dark:text-amber-400">
                Fasal Matrix Guard
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              State Engine Fault Isolation Active
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Local transactions and cryptographic escrow states remain isolated and protected.
            </p>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[11px] font-mono font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Agrarian Platform Resilience Protocol
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Continuous Operation Architecture
            </h3>
            <p className="text-xs text-zinc-300 max-w-md mt-1 leading-relaxed">
              Every crop lot, escrow transaction, and route waypoint is backed by idempotent store buffers to prevent data loss.
            </p>
          </div>
        </div>
      </div>

      {/* Main Error Details Content Side */}
      <div className="relative flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:p-16 xl:p-24 z-10">
        {/* Subtle Diagonal Grid Background Texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, #16a34a 0, #16a34a 1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(-45deg, #16a34a 0, #16a34a 1px, transparent 1px, transparent 20px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-xl">
          <div className="mb-6">
            <BrandLogo size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-300 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>System Notice • Telemetry Error Guard</span>
          </div>

          <h1 className="text-zinc-950 dark:text-zinc-50 mb-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Something went wrong
          </h1>

          <div className="text-zinc-600 dark:text-zinc-300 mb-6 space-y-2 text-sm sm:text-base leading-relaxed">
            <p>
              A client synchronization anomaly or unexpected interruption was detected while rendering this view.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your session security, farm data, and active orders are safely preserved. You can retry the current operation or return to the main dashboard.
            </p>
          </div>

          {error.digest && (
            <div className="mb-6 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
              <span className="font-semibold text-zinc-500">Fault Digest:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate ml-2">
                {error.digest}
              </span>
            </div>
          )}

          {/* Interactive CTAs styled with FarmLink emerald/dark theme */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Action</span>
            </button>

            <Link
              href="/"
              className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Back Home</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.history.back();
              }}
              className="px-4 py-3 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-semibold text-xs sm:text-sm transition flex items-center gap-2 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Quick Hub Navigation Links */}
          <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
            <span className="font-semibold block mb-2 text-zinc-600 dark:text-zinc-400">
              Quick Portals Navigation:
            </span>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/farmer"
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition"
              >
                Farmer Hub
              </Link>
              <Link
                href="/buyer"
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition"
              >
                Buyer Desk
              </Link>
              <Link
                href="/consumer"
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition"
              >
                Consumer Store
              </Link>
              <Link
                href="/logistics"
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition"
              >
                Logistics Hub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
