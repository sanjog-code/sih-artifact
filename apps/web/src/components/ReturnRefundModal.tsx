'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Camera,
  AlertTriangle,
  RefreshCcw,
  X,
  FileCheck2,
  Percent,
} from 'lucide-react';
import { OrderItem } from '../lib/store/orderStore';

interface ReturnRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem;
  onClaimSubmitted?: (claim: {
    orderId: string;
    defectPercentage: number;
    claimType: 'FULL_REFUND' | 'PARTIAL_CREDIT';
    eligibleAmount: number;
    evidenceNote: string;
    reportedWithinWindow: boolean;
  }) => void;
}

export default function ReturnRefundModal({
  isOpen,
  onClose,
  order,
  onClaimSubmitted,
}: ReturnRefundModalProps) {
  const [defectPercent, setDefectPercent] = useState<number>(60);
  const [hoursSinceDelivery, setHoursSinceDelivery] = useState<number>(1.2);
  const [evidenceNote, setEvidenceNote] = useState<string>('Visible transit softening and bacterial rot in 3 of 5 crates upon dock inward inspection.');
  const [hasPhotoEvidence, setHasPhotoEvidence] = useState<boolean>(true);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  // Exact statutory rules:
  // Rule 1: 50% Rotten Produce Rule - >50% rotten = eligible for full refund
  // Rule 2: Full Delivery Cost Coverage - if >50% verified, refund includes delivery charges (100% of order total)
  // Rule 3: 2-Hour Reporting Window - must be reported <= 2.0 hours from delivery
  // Rule 5: Partial Credit for Minor Issues - <=50% defects eligible for proportional partial credit
  const isWithin2Hours = hoursSinceDelivery <= 2.0;
  const isOver50Percent = defectPercent > 50;
  const isFullRefundEligible = isWithin2Hours && isOver50Percent && hasPhotoEvidence;
  const isPartialEligible = isWithin2Hours && !isOver50Percent && defectPercent > 0 && hasPhotoEvidence;

  const eligibleRefundAmount = isFullRefundEligible
    ? order.totalPrice
    : isPartialEligible
    ? Math.round(order.totalPrice * (defectPercent / 100))
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWithin2Hours) return;

    if (onClaimSubmitted) {
      onClaimSubmitted({
        orderId: order.id,
        defectPercentage: defectPercent,
        claimType: isFullRefundEligible ? 'FULL_REFUND' : 'PARTIAL_CREDIT',
        eligibleAmount: eligibleRefundAmount,
        evidenceNote,
        reportedWithinWindow: isWithin2Hours,
      });
    }
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                Vegetable Quality Return & Refund Claim
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Order #{order.id} • {order.items}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              Claim Ticket Registered
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              {isFullRefundEligible
                ? `100% Full Refund of ₹${eligibleRefundAmount.toLocaleString('en-IN')} (including shipping) approved under the 50% Rotten Produce Rule. Escrow reversal initiated via T+1 bank settlement.`
                : `Proportional partial credit of ₹${eligibleRefundAmount.toLocaleString('en-IN')} (${defectPercent}% defect rate) registered for settlement.`}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold transition hover:opacity-90"
              >
                Close Claim Desk
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Statutory Policy Highlights */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-600" />
                  <span>50% Rotten Produce Rule</span>
                </span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                  {isOver50Percent ? '>50% (Full Refund)' : '<=50% (Partial Credit)'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Claims must be submitted within 2 hours of delivery receipt with photographic evidence. Defect rates exceeding 50% trigger 100% order refund including delivery fees.
              </p>
            </div>

            {/* Slider: Measured Defect Percentage */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-zinc-800 dark:text-zinc-200">
                  Measured Rotten / Spoiled Percentage:
                </label>
                <span className="font-mono font-extrabold text-sm px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50">
                  {defectPercent}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={defectPercent}
                onChange={(e) => setDefectPercent(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>5% (Minor bruises)</span>
                <span className="font-bold text-emerald-600">50% Statutory Boundary</span>
                <span>100% (Total spoilage)</span>
              </div>
            </div>

            {/* Slider: Reporting Window Elapsed */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Time Elapsed Since Delivery:</span>
                </label>
                <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                  isWithin2Hours
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {hoursSinceDelivery.toFixed(1)} Hours {isWithin2Hours ? '(Eligible <=2h)' : '(Expired >2h)'}
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={5.0}
                step={0.1}
                value={hoursSinceDelivery}
                onChange={(e) => setHoursSinceDelivery(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Evidence Note */}
            <div>
              <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                Batch Condition Inspection Note:
              </label>
              <textarea
                rows={2}
                required
                value={evidenceNote}
                onChange={(e) => setEvidenceNote(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Photo Evidence Checkbox */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <input
                type="checkbox"
                id="photoProof"
                checked={hasPhotoEvidence}
                onChange={(e) => setHasPhotoEvidence(e.target.checked)}
                className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="photoProof" className="text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-zinc-500" />
                <span>Photographic / video proof of produce condition attached (Required)</span>
              </label>
            </div>

            {/* Settlement Determination Card */}
            <div className="p-3.5 rounded-2xl border bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Eligible Settlement Amount:
                </span>
                <span className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">
                  ₹{eligibleRefundAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  {isFullRefundEligible
                    ? '100% Full Refund + Shipping Covered'
                    : isPartialEligible
                    ? `Proportional Partial Credit (${defectPercent}%)`
                    : 'Not eligible under statutory rules'}
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                isFullRefundEligible
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : isPartialEligible
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {isFullRefundEligible
                  ? 'Full Refund'
                  : isPartialEligible
                  ? 'Partial Credit'
                  : 'Claim Ineligible'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isWithin2Hours || !hasPhotoEvidence || defectPercent <= 0}
                className="flex-1 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Submit Return Claim</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
