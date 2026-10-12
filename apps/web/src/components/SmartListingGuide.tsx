'use client';

import React, { useState } from 'react';
import { Warehouse, Sparkles } from 'lucide-react';
import { getCropMspFloor } from '../lib/cropTaxonomy';
import { useLanguage } from '../context/LanguageContext';
import { getFarmerOverviewTranslations } from '../context/farmerOverviewTranslations';

export default function SmartListingGuide() {
  const { language } = useLanguage();
  const fo = getFarmerOverviewTranslations(language);
  const [commodity, setCommodity] = useState<string>('Wheat');
  const [declaredVolume, setDeclaredVolume] = useState<number>(10000); // 10,000 kg default
  const [holdingDays, setHoldingDays] = useState<number>(15);

  const mspFloor = getCropMspFloor(commodity) || 24.25;
  const currentSpotRate = commodity === 'Wheat' ? 26.5 : commodity === 'Mustard' ? 62.0 : commodity === 'Chana' ? 60.0 : 25.0;

  // Simulator calculation
  // Monthly expected price growth: 3-5% for non-perishables during post-harvest stabilization
  // Daily cold storage / WDRA warehouse cost: ~₹0.15/quintal/day = ₹0.0015/kg/day
  // Arrhenius shelf-life decay / moisture loss: 0.8% per month for grains
  const dailyPriceAppreciation = currentSpotRate * (0.04 / 30);
  const projectedPrice = Number((currentSpotRate + dailyPriceAppreciation * holdingDays).toFixed(2));

  const immediateGross = declaredVolume * currentSpotRate;
  const immediateNet = immediateGross; // No warehouse fees

  const storageCost = declaredVolume * (0.0015 * holdingDays);
  const moistureLossKg = declaredVolume * (0.008 * (holdingDays / 30));
  const finalVolumeAfterLoss = declaredVolume - moistureLossKg;
  const heldGross = finalVolumeAfterLoss * projectedPrice;
  const heldNet = Number((heldGross - storageCost).toFixed(0));

  const netGainOrLoss = heldNet - immediateNet;
  const isHoldingProfitable = netGainOrLoss > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xl transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{fo.smartGuideBadge}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            {fo.smartGuideTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {fo.smartGuideSubtitle}
          </p>
        </div>

        {/* Commodity Selector */}
        <div className="flex items-center gap-2">
          {['Wheat', 'Mustard', 'Chana', 'Soybean'].map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => setCommodity(crop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                commodity === crop
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              {crop === 'Wheat' ? fo.wheatName.split(' ')[0] : crop === 'Mustard' ? fo.mustardName.split(' ')[0] : crop === 'Soybean' ? fo.soybeanName.split(' ')[0] : crop}
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Interactive Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80">
          <label className="block text-[11px] font-mono uppercase text-zinc-500 font-bold mb-1">
            {fo.lotVolumeLabel}
          </label>
          <input
            type="number"
            min={500}
            step={500}
            value={declaredVolume}
            onChange={(e) => setDeclaredVolume(Math.max(100, Number(e.target.value)))}
            className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-[10px] text-zinc-400 mt-1 block">MSP Protected: ₹{mspFloor.toFixed(2)}/kg</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-mono uppercase text-zinc-500 font-bold">
              {fo.holdingDurationLabel}
            </label>
            <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {fo.holdingDaysValue.replace('{days}', holdingDays.toString())}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={holdingDays}
            onChange={(e) => setHoldingDays(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer my-2"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>{fo.spotDayLabel}</span>
            <span>{fo.days30Label}</span>
            <span>{fo.days60Label}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80">
          <span className="text-[10px] font-mono uppercase text-emerald-800 dark:text-emerald-300 font-bold block">
            {fo.simulatedEconomicImpact}
          </span>
          <div className="text-xl font-extrabold font-mono mt-1 text-emerald-900 dark:text-emerald-200">
            {isHoldingProfitable ? `+₹${netGainOrLoss.toLocaleString('en-IN')}` : `-₹${Math.abs(netGainOrLoss).toLocaleString('en-IN')}`}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            {isHoldingProfitable
              ? fo.holdingProfitableSummary.replace('{days}', holdingDays.toString()).replace('{percent}', ((netGainOrLoss / immediateNet) * 100).toFixed(1))
              : fo.holdingUnprofitableSummary}
          </span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strategy A: Immediate Spot Sale */}
        <div className="p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
              {fo.strategyATitle}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 font-mono">
              {fo.strategyABadge}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex justify-between">
              <span>{fo.currentSpotPriceLabel}</span>
              <strong className="font-mono text-zinc-900 dark:text-white">₹{currentSpotRate.toFixed(2)}/kg</strong>
            </div>
            <div className="flex justify-between">
              <span>{fo.storageFeesLabel}</span>
              <strong className="font-mono text-emerald-700 dark:text-emerald-400">{fo.storageFeesZero}</strong>
            </div>
            <div className="flex justify-between">
              <span>{fo.moistureLossLabel}</span>
              <strong className="font-mono text-emerald-700 dark:text-emerald-400">{fo.moistureLossZero}</strong>
            </div>
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex justify-between font-bold text-sm text-zinc-950 dark:text-white">
              <span>{fo.netImmediatePayoutLabel}</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400">₹{immediateNet.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Strategy B: WDRA Warehouse Deposit & Hold */}
        <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5" />
              <span>{fo.strategyBTitle} ({holdingDays}d)</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 font-mono">
              {fo.strategyBBadge}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex justify-between">
              <span>{fo.projectedClearingRateLabel}</span>
              <strong className="font-mono text-emerald-800 dark:text-emerald-300">₹{projectedPrice.toFixed(2)}/kg</strong>
            </div>
            <div className="flex justify-between">
              <span>{fo.vaultRentalLabel.replace('{days}', holdingDays.toString())}</span>
              <strong className="font-mono text-rose-600 dark:text-rose-400">-₹{Math.round(storageCost).toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between">
              <span>{fo.moistureVarianceLabel}</span>
              <strong className="font-mono text-zinc-700 dark:text-zinc-300">-{moistureLossKg.toFixed(1)} kg ({((moistureLossKg / declaredVolume) * 100).toFixed(2)}%)</strong>
            </div>
            <div className="pt-2 border-t border-emerald-300/60 dark:border-emerald-800/80 flex justify-between font-bold text-sm text-zinc-950 dark:text-white">
              <span>{fo.netProjectedRealizationLabel}</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300">₹{heldNet.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
