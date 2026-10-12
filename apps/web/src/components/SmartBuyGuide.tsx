'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingDown, Clock, ShieldCheck, ShoppingCart, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface SmartBuyItem {
  crop: string;
  category: string;
  currentPrice: number;
  expectedPriceNextWeek: number;
  recommendation: 'BUY_NOW' | 'WAIT_FEW_DAYS' | 'STOCK_UP';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  savingsPercent: number;
  freshnessScore: number;
  reason: string;
}

const SMART_BUY_INSIGHTS: SmartBuyItem[] = [
  {
    crop: 'Tomato (Hybrid)',
    category: 'Vegetables',
    currentPrice: 28,
    expectedPriceNextWeek: 34,
    recommendation: 'BUY_NOW',
    urgency: 'HIGH',
    savingsPercent: 18,
    freshnessScore: 98,
    reason: 'Heavy wholesale Mandi arrivals tapering off; farmgate spot rates expected to rise 18% over the next 5-7 days.',
  },
  {
    crop: 'Wheat (Sharbati)',
    category: 'Cereals',
    currentPrice: 26.5,
    expectedPriceNextWeek: 26.2,
    recommendation: 'STOCK_UP',
    urgency: 'MEDIUM',
    savingsPercent: 24,
    freshnessScore: 96,
    reason: 'Stable MSP baseline support. Direct farmgate bulk procurement saves up to 24% over retail supermarket packaging.',
  },
  {
    crop: 'Potato (Jyoti)',
    category: 'Vegetables',
    currentPrice: 22,
    expectedPriceNextWeek: 20,
    recommendation: 'WAIT_FEW_DAYS',
    urgency: 'LOW',
    savingsPercent: 9,
    freshnessScore: 94,
    reason: 'Upcoming cold vault stock releases in Agra cluster will increase local retail supply within 72 hours.',
  },
  {
    crop: 'Mustard (High Oil)',
    category: 'Oilseeds',
    currentPrice: 62,
    expectedPriceNextWeek: 68,
    recommendation: 'BUY_NOW',
    urgency: 'HIGH',
    savingsPercent: 12,
    freshnessScore: 97,
    reason: 'High domestic processing demand and tight regional mandis indicate an imminent price surge.',
  },
  {
    crop: 'Chana (Desi Bold)',
    category: 'Pulses',
    currentPrice: 62,
    expectedPriceNextWeek: 67,
    recommendation: 'BUY_NOW',
    urgency: 'HIGH',
    savingsPercent: 15,
    freshnessScore: 97,
    reason: 'Festive buffer stocking in state depots tightening open-market wholesale availability.',
  },
  {
    crop: 'Apple (Royal Delicious)',
    category: 'Fruits',
    currentPrice: 85,
    expectedPriceNextWeek: 92,
    recommendation: 'STOCK_UP',
    urgency: 'MEDIUM',
    savingsPercent: 20,
    freshnessScore: 99,
    reason: 'Direct orchard CA-vault dispatch bypassing Delhi Azadpur mandi terminal margins.',
  },
];

interface SmartBuyGuideProps {
  onClose?: () => void;
}

export default function SmartBuyGuide({ onClose }: SmartBuyGuideProps = {}) {
  const [filterCat, setFilterCat] = useState<string>('all');

  const filtered = SMART_BUY_INSIGHTS.filter(
    (item) => filterCat === 'all' || item.category.toLowerCase() === filterCat.toLowerCase()
  );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xl transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AI Price Intelligence (beta) • Consumer Radar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Smart Way to Buy: Consumer Timing Radar
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Algorithmic buy signals calibrated on live Agmarknet mandi arrivals, harvest peak curves, and farmgate spot discounts. Save up to 25% by timing your weekly kitchen grocery procurement.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'Vegetables', 'Cereals', 'Pulses', 'Oilseeds', 'Fruits'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterCat === cat
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Commodities' : cat}
            </button>
          ))}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition ml-1"
              title="Close Timing Radar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {filtered.map((item) => {
          const isBuy = item.recommendation === 'BUY_NOW' || item.recommendation === 'STOCK_UP';
          return (
            <div
              key={item.crop}
              className="p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mt-1.5">
                      {item.crop}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isBuy
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {isBuy ? <TrendingDown className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{item.recommendation.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-zinc-200/60 dark:border-zinc-800 text-center font-mono">
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Current Direct</span>
                    <span className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                      ₹{item.currentPrice}/kg
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Mandi Forecast</span>
                    <span className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                      ₹{item.expectedPriceNextWeek}/kg
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Direct Savings</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      ~{item.savingsPercent}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {item.reason}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Harvest Freshness: <strong>{item.freshnessScore}%</strong></span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('farmlink_open_ai', {
                            detail: {
                              query: `Compare farmgate savings and 14-day price trend for ${item.crop} for weekly household groceries`,
                              autoSend: true,
                            },
                          })
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition"
                    title="Ask Gemini Deal Copilot about this crop"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Ask Gemini</span>
                  </button>

                  <Link
                    href="/checkout"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Lock Fresh Lot</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
