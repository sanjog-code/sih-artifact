'use client';

import React, { useState } from 'react';
import { IndianRupee, Calculator } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getFarmerOverviewTranslations } from '@/context/farmerOverviewTranslations';

interface NetIncomeCalculatorProps {
  initialCommodity?: string;
  initialPriceKg?: number;
}

export default function NetIncomeCalculator({
  initialCommodity = 'Wheat',
  initialPriceKg = 26,
}: NetIncomeCalculatorProps) {
  const { language } = useLanguage();
  const fo = getFarmerOverviewTranslations(language);

  const [commodity, setCommodity] = useState(initialCommodity);
  const [quantityKg, setQuantityKg] = useState(5000); // 5 Tonnes
  const [askingPriceKg, setAskingPriceKg] = useState(initialPriceKg);
  const [distanceToMandiKm, setDistanceToMandiKm] = useState(35); // km

  // Calculations
  const grossValue = quantityKg * askingPriceKg;

  // Traditional Mandi Route Deductions
  // 1. Mandi Cess / Market Fee (avg 2.0%)
  const mandiCess = Math.round(grossValue * 0.02);
  // 2. Arhtiya (Commission Agent) Cut (avg 2.5% to 4.0%)
  const arhtiyaCut = Math.round(grossValue * 0.035);
  // 3. Loading, Unloading & Palledari (₹20 / quintal = ₹0.20 / kg)
  const palledariFee = Math.round(quantityKg * 0.2);
  // 4. Weight loss / handling refraction deduction (avg 2.0%)
  const refractionLoss = Math.round(grossValue * 0.02);
  // 5. Local Tractor / Haulage Transport: ₹3.0 per ton-km
  const tons = quantityKg / 1000;
  const mandiTransport = Math.round(tons * distanceToMandiKm * 3.5);

  const totalMandiDeductions = mandiCess + arhtiyaCut + palledariFee + refractionLoss + mandiTransport;
  const netMandiEarnings = Math.max(0, grossValue - totalMandiDeductions);

  // FasalMatrix Premier Route
  // 1. Transparent Platform Commission: 3.5%
  const fasalMatrixFee = Math.round(grossValue * 0.035);
  // 2. Doorstep Farmgate Logistics: Picked up right from farm gate (0 haulage expense for farmer)
  const fasalMatrixLogistics = 0;
  // 3. Weighing deduction: 0% (Assayed at WDRA accredited gate)
  const fasalMatrixRefraction = 0;

  const totalFasalMatrixDeductions = fasalMatrixFee + fasalMatrixLogistics + fasalMatrixRefraction;
  const netFasalMatrixEarnings = grossValue - totalFasalMatrixDeductions;

  // Additional Profit Delta
  const additionalEarnings = netFasalMatrixEarnings - netMandiEarnings;
  const percentageGain = ((additionalEarnings / (netMandiEarnings || 1)) * 100).toFixed(1);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>{fo.calculatorBadge}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
            {fo.calculatorTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {fo.calculatorSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300">
            {tons.toFixed(1)} {fo.tonnesBadge} ({quantityKg.toLocaleString('en-IN')} kg)
          </span>
        </div>
      </div>

      {/* Input Sliders & Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            {fo.commodityPriceLabel}
          </label>
          <div className="flex gap-2">
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-1/2 px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Wheat">Wheat</option>
              <option value="Mustard">Mustard</option>
              <option value="Tomato">Tomato</option>
              <option value="Soybean">Soybean</option>
              <option value="Potato">Potato</option>
              <option value="Chana">Chana</option>
            </select>
            <div className="relative w-1/2">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-400">₹</span>
              <input
                type="number"
                min={5}
                max={250}
                value={askingPriceKg}
                onChange={(e) => setAskingPriceKg(Number(e.target.value) || 0)}
                className="w-full pl-6 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {fo.harvestLotVolumeLabel}
            </label>
            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {quantityKg.toLocaleString('en-IN')} kg
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={25000}
            step={250}
            value={quantityKg}
            onChange={(e) => setQuantityKg(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
            <span>500 kg (0.5T)</span>
            <span>25,000 kg (25T)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {fo.distanceToMandiLabel}
            </label>
            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {distanceToMandiKm} km
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={distanceToMandiKm}
            onChange={(e) => setDistanceToMandiKm(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
            <span>5 km ({fo.localKmLabel})</span>
            <span>120 km ({fo.distantKmLabel})</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Financial Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Traditional Mandi */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-mono uppercase font-bold text-zinc-500">{fo.traditionalMandiTitle}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              {fo.highDeductionsBadge}
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 mb-6">
            <div className="flex justify-between">
              <span>{fo.grossMarketValueLabel}:</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">₹{grossValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>{fo.arhtiyaCutLabel}:</span>
              <span className="font-mono">-₹{arhtiyaCut.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>{fo.mandiCessLabel}:</span>
              <span className="font-mono">-₹{mandiCess.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>{fo.palledariLabel}:</span>
              <span className="font-mono">-₹{palledariFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>{fo.weightLossLabel}:</span>
              <span className="font-mono">-₹{refractionLoss.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>{fo.tractorHaulageLabel} ({distanceToMandiKm} km):</span>
              <span className="font-mono">-₹{mandiTransport.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300">{fo.netTakeHomeLabel}:</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
              ₹{netMandiEarnings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* FasalMatrix Route */}
        <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/60 dark:border-emerald-800/60">
            <span className="text-xs font-mono uppercase font-bold text-emerald-800 dark:text-emerald-300">{fo.fasalMatrixRouteTitle}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-700">
              {fo.directGateBadge}
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 mb-6">
            <div className="flex justify-between">
              <span>{fo.grossTradeValueLabel}:</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">₹{grossValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
              <span>{fo.platformFeeLabel}:</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400">-₹{fasalMatrixFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
              <span>{fo.doorstepLogisticsLabel}:</span>
              <span className="font-mono">{fo.doorstepLogisticsFree}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
              <span>{fo.weighingDeductionsLabel}:</span>
              <span className="font-mono">{fo.weighingDeductionsZero}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
              <span>{fo.paymentCycleLabel}:</span>
              <span className="font-mono">{fo.paymentCycleT1}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-200/60 dark:border-emerald-800/60 flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase text-emerald-900 dark:text-emerald-200">{fo.netTakeHomeLabel}:</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800 dark:text-emerald-300">
              ₹{netFasalMatrixEarnings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Delta Highlight Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 block">
              {fo.incomeRetainedBanner}
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
              +₹{additionalEarnings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-bold">
            +{percentageGain}% Net Gain
          </span>
          <span className="text-xs text-emerald-100">{fo.gainPercentageOverMandi}</span>
        </div>
      </div>
    </div>
  );
}
