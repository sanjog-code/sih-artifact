'use client';

import React, { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'advisory' | 'architecture' | 'pilot'>('advisory');
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [holdingDays, setHoldingDays] = useState(1);

  const advisoryData: Record<string, { range: string; conf: string; fresh: string; factors: string[]; msp?: number; rec: string }> = {
    Tomato: {
      range: '₹26 - ₹29/kg',
      conf: '78%',
      fresh: 'Today, 9:00 AM',
      factors: [
        'Nearby regional demand is up 8% this week.',
        'Grade A availability in Jaipur North is moderate.',
        'Your lot is 1 day old; shelf-life risk is low.'
      ],
      rec: 'SELL_THIS_WEEK'
    },
    'Rapeseed & mustard': {
      range: '₹82 - ₹98.40/kg',
      conf: '84%',
      fresh: 'Today, 9:00 AM',
      msp: 56.50,
      factors: [
        'Official MSP floor secured at ₹56.50/kg.',
        'Jaitpura/Phulera regional pilot: ₹82/kg purchase, ₹98.40/kg selling price.',
        'Non-perishable commodity; eligible for 50% working capital pledge advance.'
      ],
      rec: 'HOLD_OR_PLEDGE'
    },
    Wheat: {
      range: '₹24 - ₹28.50/kg',
      conf: '82%',
      fresh: 'Today, 9:00 AM',
      msp: 22.75,
      factors: [
        'Official MSP floor is ₹22.75/kg (guaranteed minimum).',
        'Stable market arrival volumes across Rajasthan APMCs.',
        'Low storage depreciation in accredited warehouse facilities.'
      ],
      rec: 'HOLD_OR_SELL'
    }
  };

  const currentAdvisory = advisoryData[selectedCrop] || advisoryData.Tomato;

  return (
    <div className="min-h-screen bg-emerald-50/40 text-zinc-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1f5c37] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight">FarmLink 🌱</span>
            <span className="text-xs bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-full font-medium">
              SIH 2026 · PS 26033
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://farmlinkk.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
            >
              Open Live Web Demo ↗
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="text-center py-6">
          <p className="text-emerald-700 font-bold tracking-wide uppercase text-xs">
            Smart India Hackathon 2026 · Team False 6
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1f5c37] mt-2 mb-3">
            Connecting Farmers, Warehouses & Consumers Directly
          </h1>
          <p className="text-zinc-600 max-w-2xl mx-auto text-base">
            Eliminating intermediate trader markups to deliver <strong className="text-emerald-800">+₹5/kg more for farmers</strong> while saving <strong className="text-emerald-800">₹5–8/kg for consumers</strong> with explainable AI pricing and e-NWR pledge liquidity.
          </p>
        </section>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('advisory')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'advisory' ? 'bg-[#1f5c37] text-white' : 'bg-white text-zinc-700 hover:bg-emerald-100'
            }`}
          >
            Explainable AI Advisory (Slide 7)
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'architecture' ? 'bg-[#1f5c37] text-white' : 'bg-white text-zinc-700 hover:bg-emerald-100'
            }`}
          >
            4 AI Services & Architecture
          </button>
          <button
            onClick={() => setActiveTab('pilot')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'pilot' ? 'bg-[#1f5c37] text-white' : 'bg-white text-zinc-700 hover:bg-emerald-100'
            }`}
          >
            Phulera Financial Pilot (Slide 8)
          </button>
        </div>

        {/* Tab 1: Explainable AI Advisory (Slide 7) */}
        {activeTab === 'advisory' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-emerald-200/80 p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Explainable Farm Advisory
                </span>
                <h2 className="text-xl font-bold text-[#1f5c37] mt-0.5">
                  {selectedCrop}: consider selling this week
                </h2>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
                Live Guidance
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">Select Crop:</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg p-2 text-sm font-medium text-zinc-800"
                >
                  <option value="Tomato">Tomato (Perishable)</option>
                  <option value="Rapeseed & mustard">Rapeseed & Mustard (Oilseed)</option>
                  <option value="Wheat">Wheat (MSP Storable Grain)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">Holding Age:</label>
                <select
                  value={holdingDays}
                  onChange={(e) => setHoldingDays(Number(e.target.value))}
                  className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg p-2 text-sm font-medium text-zinc-800"
                >
                  <option value={1}>1 Day Fresh</option>
                  <option value={3}>3 Days in Storage</option>
                  <option value={6}>6 Days (Near Spoilage Limit)</option>
                </select>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-3 bg-[#eef7f2] border border-emerald-200 rounded-xl p-3 mb-4 text-center">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Suggested Range</span>
                <span className="text-lg font-extrabold text-[#1f5c37]">{currentAdvisory.range}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Confidence</span>
                <span className="text-lg font-extrabold text-[#1f5c37]">{currentAdvisory.conf}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Data Freshness</span>
                <span className="text-sm font-bold text-[#1f5c37] mt-1 block">{currentAdvisory.fresh}</span>
              </div>
            </div>

            {/* Why This Guidance */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-[#1f5c37] mb-2">Why this guidance?</h3>
              <ul className="space-y-1.5 text-sm text-zinc-700 pl-4 list-disc">
                {currentAdvisory.factors.map((factor, i) => (
                  <li key={i}>{factor}</li>
                ))}
                {holdingDays >= 6 && selectedCrop === 'Tomato' && (
                  <li className="text-amber-700 font-medium">
                    Batch has reached 6 days in storage. Consider 10% markdown to redistribute before spoilage.
                  </li>
                )}
              </ul>
            </div>

            {/* Guardrail Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-center gap-2 mb-4">
              <span>🛡️</span>
              <span>This is an explainable recommendation, not a guaranteed price. You remain in control of your sale decision.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 border-2 border-[#1f5c37] text-[#1f5c37] hover:bg-emerald-50 py-2.5 rounded-lg text-sm font-bold transition">
                I’ll hold
              </button>
              <button className="flex-1 bg-[#1f5c37] text-white hover:bg-[#16472a] py-2.5 rounded-lg text-sm font-bold transition">
                List for buyers
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: 4 AI Services & Architecture */}
        {activeTab === 'architecture' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-emerald-200">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Service 1</span>
              <h3 className="font-bold text-[#1f5c37] text-base mt-2 mb-1">Camera-Assisted Produce Grading</h3>
              <p className="text-sm text-zinc-600 mb-3">
                Computer vision analyzing produce color hue (ripeness), surface uniformity, and defect contour density to classify lots into Grade A1, A2, B, or C with human override.
              </p>
              <div className="text-xs font-mono bg-emerald-50 p-2 rounded text-emerald-900">
                Endpoint: POST /api/ai/grade
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-200">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Service 2</span>
              <h3 className="font-bold text-[#1f5c37] text-base mt-2 mb-1">Explainable Price & Demand Intelligence</h3>
              <p className="text-sm text-zinc-600 mb-3">
                Multi-factor pricing engine enforcing official government MSP floors while adjusting for quality tier, seasonal trends, nearby demand spikes, and holding depreciation.
              </p>
              <div className="text-xs font-mono bg-emerald-50 p-2 rounded text-emerald-900">
                Rule: @farmlink/shared/rules/pricing.ts
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-200">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Service 3</span>
              <h3 className="font-bold text-[#1f5c37] text-base mt-2 mb-1">Stock-Age & Spoilage Prevention Engine</h3>
              <p className="text-sm text-zinc-600 mb-3">
                Monitors warehouse batch age against crop perishability curves (leafy greens: 3d, tomatoes: 8d, grains: 180d) and triggers automated markdown alerts before spoilage.
              </p>
              <div className="text-xs font-mono bg-emerald-50 p-2 rounded text-emerald-900">
                Logic: freshnessForListing() in src/main.jsx
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-200">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Service 4</span>
              <h3 className="font-bold text-[#1f5c37] text-base mt-2 mb-1">Multilingual Toll-Free Voice AI</h3>
              <p className="text-sm text-zinc-600 mb-3">
                Natural speech processing in Hindi and English with text-to-speech audio playback for low-literacy farmers to check mandi rates, stock balance, and vehicle pickups.
              </p>
              <div className="text-xs font-mono bg-emerald-50 p-2 rounded text-emerald-900">
                Module: apps/api/src/modules/ivr
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Phulera Financial Pilot (Slide 8) */}
        {activeTab === 'pilot' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
            <h2 className="text-xl font-bold text-[#1f5c37] mb-1">
              FarmLink 1-Month Financial Pilot: Jaitpura, Phulera
            </h2>
            <p className="text-xs text-zinc-500 mb-4">
              Parameters: 50 participating farmers · ~5 bigha average holding · 40% land under mustard
            </p>

            <div className="grid grid-cols-4 gap-2 text-center mb-6">
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">Produce</span>
                <b className="text-base text-[#1f5c37]">29.6 T</b>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">Purchase</span>
                <b className="text-base text-[#1f5c37]">₹82/kg</b>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">Selling</span>
                <b className="text-base text-[#1f5c37]">₹98.40/kg</b>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">Gross Margin</span>
                <b className="text-base text-[#1f5c37]">₹4.86 L</b>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Produce value sold:</span>
                <strong className="text-zinc-800">₹29.15 L</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Less: farmer purchase:</span>
                <span className="text-red-700 font-semibold">- ₹24.29 L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Logistics & delivery cost:</span>
                <span className="text-red-700 font-semibold">- ₹0.44 L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Salary + warehouse + utilities:</span>
                <span className="text-red-700 font-semibold">- ₹0.43 L</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold text-emerald-900 bg-emerald-100/60 p-2 rounded-lg">
                <span>Estimated Operating Surplus:</span>
                <span className="text-[#1f5c37]">₹3.99 L / month</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-zinc-500 border-t bg-white mt-12">
        <p>FarmLink · Smart India Hackathon 2026 (Problem Statement 26033) · Team False 6</p>
      </footer>
    </div>
  );
}
