'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';
import { useKycStore } from '../lib/store/kycStore';

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KycVerificationModal({ isOpen, onClose }: KycVerificationModalProps) {
  const { currentFarmerKyc, submitKyc } = useKycStore();

  const [farmerName, setFarmerName] = useState(currentFarmerKyc?.farmerName || 'Rameshwar Lal Jat');
  const [phone] = useState(currentFarmerKyc?.phone || '+91 98290 44102');
  const [aadhaarLastFour, setAadhaarLastFour] = useState('8912');
  const [pmKisanId, setPmKisanId] = useState('PMK-RJ-992014');
  const [bankAccountNo, setBankAccountNo] = useState('501004128912');
  const [ifscCode, setIfscCode] = useState('SBIN0002410');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountHolderName] = useState('Rameshwar Lal');
  const [showAccountNo, setShowAccountNo] = useState(false);
  const [showSuccessAccount, setShowSuccessAccount] = useState(false);

  const [step, setStep] = useState<'FORM' | 'VERIFYING' | 'SUCCESS'>('FORM');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('VERIFYING');

    setTimeout(() => {
      submitKyc({
        farmerName,
        phone,
        aadhaarLastFour,
        pmKisanBeneficiaryId: pmKisanId,
        bankAccountNo,
        ifscCode,
        bankName,
        accountHolderName,
      });
      setStep('SUCCESS');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'FORM' && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Razorpay / Cashfree Sandbox Protocol</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
              Instant Farmer KYC & Penny-Drop
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
              Connect your verified bank account for instantaneous escrow release payouts and direct farm settlements.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                  Farmer Full Name (as per Bank / Aadhaar)
                </label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Aadhaar Last 4 Digits
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={aadhaarLastFour}
                    onChange={(e) => setAadhaarLastFour(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="8912"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    PM-KISAN ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={pmKisanId}
                    onChange={(e) => setPmKisanId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="PMK-RJ-992014"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase">
                    Bank Account Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAccountNo((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    {showAccountNo ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAccountNo ? 'text' : 'password'}
                    required
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none pr-10"
                    placeholder="e.g. 501004128912"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountNo((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    title={showAccountNo ? 'Hide account number' : 'Show account number'}
                    aria-label={showAccountNo ? 'Hide account number' : 'Show account number'}
                  >
                    {showAccountNo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500">
                Penny-Drop Simulator: A test credit of <strong>₹1.00</strong> will be initiated to verify the account holder name against Aadhaar records.
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Verify Bank Account (₹1 Penny-Drop)
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'VERIFYING' && (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
              Executing Penny-Drop Verification...
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              Validating IFSC {ifscCode} with NPCI & Matching Name with UIDAI
            </p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="py-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white">
              Bank Account Verified
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Penny-drop credit successful. Account{' '}
              <strong className="font-mono text-zinc-900 dark:text-zinc-100">
                {showSuccessAccount ? bankAccountNo : `••••••••${bankAccountNo.slice(-4)}`}
              </strong>{' '}
              <button
                type="button"
                onClick={() => setShowSuccessAccount((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline decoration-dotted ml-1"
              >
                {showSuccessAccount ? 'Hide' : 'Tap to reveal'}
              </button>{' '}
              ({bankName}) is now verified for automated escrow releases.
            </p>

            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
