'use client';

import React, { useState } from 'react';
import {
  Calculator,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function UnitEconomicsSimulator() {
  const { t } = useLanguage();
  const ta = t.about;
  const [activeModel, setActiveModel] = useState<'TOMATO' | 'POTATO_ONION'>('TOMATO');

  // Tomato Pilot State (Defaults from fresh_tomato_economic_workflow.md & S1S2.md)
  const [tomatoSupplyKg] = useState<number>(42000);
  const [tomatoProcurePrice, setTomatoProcurePrice] = useState<number>(22.0);
  const [tomatoSellingPrice, setTomatoSellingPrice] = useState<number>(28.0);
  const [tomatoBuyersCount] = useState<number>(150);
  const [tomatoDemandPerBuyerKg] = useState<number>(70);

  // Potato & Onion 1,000 kg Batch State (Defaults from S1S2.md)
  const [batchVolumeKg] = useState<number>(1000);
  const [batchProcurePrice] = useState<number>(18.0);
  const [batchLogisticsCost] = useState<number>(1.2);
  const [batchInspectionCost] = useState<number>(0.4);
  const [batchBulkPrice] = useState<number>(23.0);

  // Tomato Arithmetic
  const tomatoTotalProcurementCost = tomatoSupplyKg * tomatoProcurePrice; // 42,000 * ₹22 = ₹9,24,000
  const tomatoTotalRevenue = tomatoSupplyKg * tomatoSellingPrice; // 42,000 * ₹28 = ₹11,76,000
  const tomatoGrossSpread = tomatoTotalRevenue - tomatoTotalProcurementCost; // ₹2,52,000
  const tomatoGrossMarginPct = ((tomatoGrossSpread / tomatoTotalRevenue) * 100).toFixed(1);

  // Potato & Onion Arithmetic (per kg)
  const batchTotalLandedCost = batchProcurePrice + batchLogisticsCost + batchInspectionCost + 0.40; // 18 + 1.20 + 0.40 + 0.40 = ₹20.00/kg
  const batchTargetGrossMarginPerKg = batchBulkPrice - batchTotalLandedCost; // 23 - 20 = ₹3.00/kg
  const batchTargetGrossMarginPct = ((batchTargetGrossMarginPerKg / batchBulkPrice) * 100).toFixed(1); // ~13.0%
  const batchTotalGrossSpread = batchTargetGrossMarginPerKg * batchVolumeKg; // ₹3,000 per 1,000 kg batch

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{ta.simBadge}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            {ta.simTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {ta.simDesc}
          </p>
        </div>

        {/* Model Switcher Tabs */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveModel('TOMATO')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeModel === 'TOMATO'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            {ta.simTabTomato}
          </button>
          <button
            type="button"
            onClick={() => setActiveModel('POTATO_ONION')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeModel === 'POTATO_ONION'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            {ta.simTabPotatoOnion}
          </button>
        </div>
      </div>

      {activeModel === 'TOMATO' ? (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                {ta.simTotalSupply}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white font-mono mt-1 block">
                {tomatoSupplyKg.toLocaleString('en-IN')} kg
              </span>
              <span className="text-[10px] text-zinc-500">{ta.simPerGrower}</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                {ta.simBulkBuyerNetwork}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white font-mono mt-1 block">
                {ta.simBuyersCount.replace('{count}', String(tomatoBuyersCount))}
              </span>
              <span className="text-[10px] text-zinc-500">{ta.simWeekDemand.replace('{amount}', String(tomatoDemandPerBuyerKg))}</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                {ta.simProcureVsSell}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-1 block">
                ₹{(tomatoSellingPrice - tomatoProcurePrice).toFixed(2)} / kg
              </span>
              <span className="text-[10px] text-emerald-600">
                {ta.simBuyArrowSell.replace('{buy}', String(tomatoProcurePrice)).replace('{sell}', String(tomatoSellingPrice))}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] font-mono uppercase text-emerald-800 dark:text-emerald-300 font-bold block">
                {ta.simGrossSpreadRealized}
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-900 dark:text-emerald-200 font-mono mt-1 block">
                ₹{tomatoGrossSpread.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {ta.simGrossMarginPct.replace('{pct}', tomatoGrossMarginPct)}
              </span>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200">
                <span>{ta.simFarmerPurchasePrice}</span>
                <span className="font-mono text-emerald-700">₹{tomatoProcurePrice.toFixed(2)} / kg</span>
              </div>
              <input
                type="range"
                min={18}
                max={26}
                step={0.5}
                value={tomatoProcurePrice}
                onChange={(e) => setTomatoProcurePrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 block">{ta.simFarmerPriceBench}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200">
                <span>{ta.simBulkSellingPrice}</span>
                <span className="font-mono text-blue-700">₹{tomatoSellingPrice.toFixed(2)} / kg</span>
              </div>
              <input
                type="range"
                min={24}
                max={34}
                step={0.5}
                value={tomatoSellingPrice}
                onChange={(e) => setTomatoSellingPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 block">{ta.simBulkPriceBench}</span>
            </div>
          </div>

          {/* Economic Equation Card */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-2">
            <span className="font-mono uppercase font-bold text-[10px] text-zinc-500 block">
              {ta.simEquationProofTitle}
            </span>
            <div className="font-mono text-zinc-800 dark:text-zinc-200 space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p>{ta.simEqLine1}</p>
              <p>{ta.simEqLine2}</p>
              <p>
                {ta.simEqLine3
                  .replace('{sell}', String(tomatoSellingPrice))
                  .replace('{buy}', String(tomatoProcurePrice))
                  .replace('{spread}', tomatoGrossSpread.toLocaleString('en-IN'))}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Potato & Onion 1000 kg KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                {ta.simProcureCost}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white font-mono mt-1 block">
                ₹{batchProcurePrice.toFixed(2)} / kg
              </span>
              <span className="text-[10px] text-zinc-500">
                {ta.simProcureCostSub.replace('{amount}', (batchProcurePrice * batchVolumeKg).toLocaleString('en-IN'))}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                {ta.simTotalLandedCost}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-blue-700 dark:text-blue-400 font-mono mt-1 block">
                ₹{batchTotalLandedCost.toFixed(2)} / kg
              </span>
              <span className="text-[10px] text-blue-600">{ta.simLandedCostSub}</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                {ta.simBulkMarketPrice}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white font-mono mt-1 block">
                ₹{batchBulkPrice.toFixed(2)} / kg
              </span>
              <span className="text-[10px] text-zinc-500">{ta.simCommercialSalePrice}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] font-mono uppercase text-emerald-800 dark:text-emerald-300 font-bold block">
                {ta.simTargetGrossMargin}
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-900 dark:text-emerald-200 font-mono mt-1 block">
                ₹{batchTargetGrossMarginPerKg.toFixed(2)} / kg
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {ta.simTargetMarginSub.replace('{pct}', batchTargetGrossMarginPct)}
              </span>
            </div>
          </div>

          {/* Breakdown Table (S1S2.md) */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 uppercase text-[10px] font-mono text-zinc-500">
                <tr>
                  <th className="py-2.5 px-3">{ta.simCostComponentCol}</th>
                  <th className="py-2.5 px-3 text-right">{ta.simPerKgCostCol}</th>
                  <th className="py-2.5 px-3 text-right">{ta.simPer1000KgBatchCol}</th>
                  <th className="py-2.5 px-3 text-right">{ta.simShareLandedCostCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium">{ta.simRowProcurement}</td>
                  <td className="py-2.5 px-3 text-right">₹{batchProcurePrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">₹{(batchProcurePrice * 1000).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-500">90.0%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium">{ta.simRowLogistics}</td>
                  <td className="py-2.5 px-3 text-right">₹{batchLogisticsCost.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">₹{(batchLogisticsCost * 1000).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-500">6.0%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium">{ta.simRowInspection}</td>
                  <td className="py-2.5 px-3 text-right">₹{batchInspectionCost.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">₹{(batchInspectionCost * 1000).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-500">2.0%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium">{ta.simRowBuffer}</td>
                  <td className="py-2.5 px-3 text-right">₹0.40</td>
                  <td className="py-2.5 px-3 text-right">₹400</td>
                  <td className="py-2.5 px-3 text-right text-zinc-500">2.0%</td>
                </tr>
                <tr className="bg-zinc-50 dark:bg-zinc-800/40 font-bold">
                  <td className="py-2.5 px-3 font-sans text-zinc-950 dark:text-white">{ta.simRowTotalLanded}</td>
                  <td className="py-2.5 px-3 text-right">₹{batchTotalLandedCost.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">₹{(batchTotalLandedCost * 1000).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-950 dark:text-white">100.0%</td>
                </tr>
                <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-300">
                  <td className="py-2.5 px-3 font-sans">{ta.simRowTargetMargin}</td>
                  <td className="py-2.5 px-3 text-right">₹{batchTargetGrossMarginPerKg.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">₹{batchTotalGrossSpread.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right">~{batchTargetGrossMarginPct}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statutory Research Citations (RBI October 2024 & ICAR JISAS 2024) */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>{ta.simCitationsTitle}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <strong className="text-zinc-950 dark:text-zinc-50 block font-semibold">
              {ta.simRbiCitationTitle}
            </strong>
            <p>
              {ta.simRbiCitationText}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <strong className="text-zinc-950 dark:text-zinc-50 block font-semibold">
              {ta.simIcarCitationTitle}
            </strong>
            <p>
              {ta.simIcarCitationText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
