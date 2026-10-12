'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Building, Smartphone, CreditCard, X, Loader2 } from 'lucide-react';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  amountInr: number;
  planCode?: string;
  planName?: string;
  billingInterval?: 'monthly' | 'annual';
  onSuccess: (paymentDetails: { paymentId: string; orderId: string; method: string }) => void;
}

export default function InstitutionalPaymentModal({
  isOpen,
  onClose,
  title,
  subtitle = 'Institutional Escrow & Automated Settlement Gateway',
  amountInr,
  planName,
  billingInterval,
  onSuccess,
}: PaymentModalProps) {
  const [method, setMethod] = useState<'UPI' | 'NETBANKING' | 'CARD' | 'NEFT'>('UPI');
  const [upiId, setUpiId] = useState('enterprise@oksbi');
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const gstAmount = Math.round(amountInr * 0.18 * 100) / 100;
  const totalAmount = amountInr; // Inclusive of GST in display

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => {
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const orderId = `order_${Date.now()}`;
        onSuccess({ paymentId, orderId, method });
        setIsDone(false);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="backdrop-blur-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-zinc-900 dark:text-zinc-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800 pr-8">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
        </div>

        {isDone ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              Payment & Escrow Lock Authorized
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Digital receipt generated and statutory mandate updated.
            </p>
          </div>
        ) : (
          <div className="space-y-5 pt-4">
            {/* Amount Breakdown Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  {planName ? `${planName} (${billingInterval || 'Monthly'})` : 'Total Payable'}
                </span>
                <span className="text-xs text-zinc-500">Includes 18% GST (₹{gstAmount.toLocaleString('en-IN')})</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-zinc-950 dark:text-zinc-50">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  RBI Nodal Mandate
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Select Institutional Payment Method:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'UPI', label: 'UPI QR', icon: Smartphone },
                  { id: 'NETBANKING', label: 'NetBanking', icon: Building },
                  { id: 'CARD', label: 'Corporate Card', icon: CreditCard },
                  { id: 'NEFT', label: 'RTGS / NEFT', icon: Lock },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] leading-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Inputs */}
            {method === 'UPI' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono"
                  placeholder="company@bank"
                />
                <span className="text-[10px] text-zinc-500">Supports BHIM, Google Pay, PhonePe, Paytm, and Corporate VPA</span>
              </div>
            )}

            {method === 'NETBANKING' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Choose Partner Financial Institution
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                >
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="HDFC Bank Corporate">HDFC Bank Corporate</option>
                  <option value="ICICI Bank Corporate">ICICI Bank Corporate</option>
                  <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                  <option value="Bank of Baroda (BOB)">Bank of Baroda (BOB)</option>
                  <option value="NABARD Rural Gateway">NABARD Rural Institutional Gateway</option>
                </select>
              </div>
            )}

            {method === 'CARD' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Corporate Credit / Debit Card
                </label>
                <input
                  type="text"
                  disabled
                  value="•••• •••• •••• 8842 (RuPay Enterprise)"
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono"
                />
                <span className="text-[10px] text-zinc-500">256-bit AES PCI-DSS Level 1 Encrypted Terminal</span>
              </div>
            )}

            {method === 'NEFT' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">RBI Nodal Escrow Virtual Account:</div>
                <div className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                  A/C: <span className="font-bold text-zinc-900 dark:text-zinc-100">FASALMATRIX9928192</span><br />
                  IFSC: <span className="font-bold text-zinc-900 dark:text-zinc-100">SBIN0001824</span> (State Bank of India)<br />
                  Beneficiary: <span className="font-bold text-zinc-900 dark:text-zinc-100">Fasal Matrix Institutional Escrow</span>
                </div>
              </div>
            )}

            {/* Authorize Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSimulatePayment}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing with Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize ₹{totalAmount.toLocaleString('en-IN')} Escrow Payment</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-zinc-500 dark:text-zinc-400 font-mono">
              RBI Escrow Nodal Account Mandate No. RBI/2020-21/11 DPSS.CO.PD.No.1810/02.14.008/2019-20
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
