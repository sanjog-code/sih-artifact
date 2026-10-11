'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for diagnostic traceability
    console.error('Fasal Matrix Platform Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
            System Notice • Telemetry Error Guard
          </span>
          <h1 className="text-xl font-extrabold text-zinc-950 tracking-tight">
            Terminal State Interrupted
          </h1>
          <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
            A temporary client synchronization anomaly occurred. The state engine has safely preserved your local transactions.
          </p>
        </div>

        {error.digest && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-[11px] font-mono text-zinc-500 truncate">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Component</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-2.5 px-4 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
