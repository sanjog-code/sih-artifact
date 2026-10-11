'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useOrderStore, OrderItem } from '../../../lib/store/orderStore';
import { triggerInvoicePrintOrDownload } from '../../../lib/invoiceGenerator';
import {
  ShieldCheck,
  Lock,
  Printer,
  Download,
  Building,
  ArrowLeft,
  BadgeCheck,
  Copy,
  FileText,
} from 'lucide-react';

export default function EscrowVoucherPage() {
  const { orders } = useOrderStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Directly derive active order without cascading effect renders
  const effectiveOrderId = selectedOrderId || (orders.length > 0 ? orders[0].id : '');
  const activeOrder: OrderItem =
    orders.find((o) => o.id === effectiveOrderId) ||
    orders[0] || {
      id: 'ORD-ESCROW-849201',
      commodity: 'Wheat (Sharbati)',
      quantityKg: 500,
      unitPrice: 26.5,
      totalPrice: 13250,
      items: '500 kg Wheat (Grade A1)',
      buyerType: 'CONSUMER',
      buyerName: 'Ananya Sen',
      buyerPhone: '+91 98301 22419',
      shippingAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
      pincode: '560103',
      status: 'ESCROW_LOCKED',
      escrowLocked: true,
      escrowTxHash: '0x8f2d4e7a1b9c3e6f0a2d5e8b1c4a7f9e2d5b8c1a',
      createdAt: 'Today, 10:45 AM',
      deliveryDate: 'Tomorrow by 11:00 AM',
      farmAddress: 'Khasra 412, Jaitpura Farm, Phulera Tehsil, Rajasthan',
    };

  const handleCopyHash = () => {
    if (activeOrder.escrowTxHash) {
      navigator.clipboard?.writeText(activeOrder.escrowTxHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const farmerEarnings = activeOrder.farmerPayoutAmount || Math.round(activeOrder.totalPrice * 0.96);
  const platformFee = activeOrder.platformCommissionAmount || Math.round(activeOrder.totalPrice * 0.04);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors print:bg-white print:text-black">
      {/* Hide Navbar & controls on Print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Top Controls Toolbar */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Checkout</span>
            </Link>
            <span className="text-xs text-zinc-400">|</span>
            <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase">
              Regulatory Escrow Voucher
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Order Selector if multiple orders exist */}
            {orders.length > 1 && (
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} ({o.commodity})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
            </button>

            <Link
              href="/invoice"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>GST Tax Invoice</span>
            </Link>

            <button
              type="button"
              onClick={() => triggerInvoicePrintOrDownload(activeOrder)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition cursor-pointer"
              title="Download or Print PDF directly"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CLEAR-CUT ONE-PAGE ESCROW VOUCHER CERTIFICATE */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-zinc-900 print:bg-white print:text-black border border-zinc-200 dark:border-zinc-800 print:border-zinc-300 rounded-3xl p-6 sm:p-10 shadow-xl print:shadow-none print:p-0 relative overflow-hidden">
          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700"></div>

          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-emerald-600 dark:border-emerald-500 print:border-emerald-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 print:text-emerald-800 tracking-tight">
                  FASAL MATRIX
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 print:border print:border-emerald-700 text-[10px] font-mono font-bold uppercase">
                  Nodal Escrow Depository
                </span>
              </div>
              <p className="text-xs text-zinc-500 print:text-zinc-600 mt-1 font-mono">
                Reserve Bank of India (RBI) Section 23A Nodal Account Regulatory Clearing
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <div className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 print:text-black">
                TRI-PARTY ESCROW VOUCHER
              </div>
              <div className="text-zinc-600 dark:text-zinc-400 print:text-zinc-600 mt-0.5">
                Voucher #: <strong>VCH-{activeOrder.id.replace('ORD-', '')}-{new Date().getFullYear()}</strong>
              </div>
              <div className="text-zinc-500 text-[11px]">
                Timestamp: {activeOrder.createdAt || 'Current Cycle'}
              </div>
            </div>
          </div>

          {/* Escrow Guarantee Statement Banner */}
          <div className="my-6 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 print:bg-emerald-50 border border-emerald-200 dark:border-emerald-800 print:border-emerald-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 print:text-emerald-800 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 dark:text-emerald-200 print:text-emerald-950 leading-relaxed">
              <strong className="block font-bold mb-0.5">Statutory Agrarian Escrow Guarantee:</strong>
              This electronic voucher certifies that payment for the agricultural consignment below is held in a segregated RBI-compliant Scheduled Commercial Bank Nodal Escrow Account. Funds are strictly frozen and will only be disbursed to the cultivator upon physical gate receipt and AGMARK quality clearance.
            </div>
          </div>

          {/* Core Parties (Consignor & Consignee) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 text-xs">
            {/* Consignor (Farmer Producer) */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 print:bg-zinc-50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>Primary Producer (Consignor)</span>
              </div>
              <div className="text-sm font-bold text-zinc-950 dark:text-white print:text-black">
                Kisan Agrarian Cooperative / Direct Grower
              </div>
              <div className="text-zinc-600 dark:text-zinc-400 print:text-zinc-600 text-[11px] leading-relaxed">
                Origin Farm Gate: {activeOrder.farmAddress || 'Jaitpura Agri-Cluster, Phulera Tehsil, Jaipur Hub'}<br />
                Accreditation: PM-KISAN Verified • Direct DBT Linked<br />
                Statutory Status: Excluded from APMC Cess (Zero Middleman)
              </div>
            </div>

            {/* Consignee (Buyer) */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 print:bg-zinc-50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Depositor / Consignee (Buyer)</span>
              </div>
              <div className="text-sm font-bold text-zinc-950 dark:text-white print:text-black">
                {activeOrder.buyerName || 'Verified Procurement Buyer'}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400 print:text-zinc-600 text-[11px] leading-relaxed">
                Contact: {activeOrder.buyerPhone || '+91 98000 00000'}<br />
                Delivery Gate: {activeOrder.shippingAddress || 'Direct Cold-Chain Doorstep Delivery'}<br />
                Account Tier: {activeOrder.buyerType === 'BULK_BUYER' ? 'Institutional Bulk Desk' : 'Verified Direct Consumer'}
              </div>
            </div>
          </div>

          {/* Consignment Itemization Table */}
          <div className="py-6 border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Consignment & Depository Specification
            </div>
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800/70 print:bg-zinc-100 text-zinc-700 dark:text-zinc-300 print:text-black border-y border-zinc-200 dark:border-zinc-700 print:border-zinc-300">
                  <th className="py-2.5 px-3 font-bold">Consignment Item</th>
                  <th className="py-2.5 px-3 font-bold text-center">Quality Grade</th>
                  <th className="py-2.5 px-3 font-bold text-right">Volume (Kg)</th>
                  <th className="py-2.5 px-3 font-bold text-right">Agreed Rate</th>
                  <th className="py-2.5 px-3 font-bold text-right">Escrow Held</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 print:divide-zinc-200 text-zinc-900 dark:text-zinc-100 print:text-black">
                <tr>
                  <td className="py-3 px-3 font-bold font-sans">
                    {activeOrder.commodity || 'Agricultural Produce'}
                    <span className="block text-[11px] text-zinc-500 font-mono font-normal">
                      Lot ID: {activeOrder.lotId || 'LOT-DIRECT-HARVEST'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 print:border text-[10px] font-bold">
                      AGMARK A1
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold">
                    {activeOrder.quantityKg.toLocaleString('en-IN')} kg
                  </td>
                  <td className="py-3 px-3 text-right">
                    ₹{activeOrder.unitPrice.toFixed(2)} / kg
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400 print:text-black">
                    ₹{activeOrder.totalPrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Disbursal Ledger */}
          <div className="py-6 border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start text-xs font-mono">
            {/* Cryptographic Escrow Verification Strip */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 print:bg-zinc-50 border border-zinc-200 dark:border-zinc-800 print:border-zinc-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>On-Chain Audit Hash</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="print:hidden text-[10px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-2.5 h-2.5" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-800 dark:text-zinc-200 print:text-black break-all bg-white dark:bg-zinc-900 print:bg-white p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {activeOrder.escrowTxHash || '0x8f2d4e7a1b9c3e6f0a2d5e8b1c4a7f9e2d5b8c1a'}
              </div>

              <div className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                Status: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">LOCKED_IN_ESCROW</strong> • Automated release executes via T+1 RTGS / NEFT gateway upon consignee acceptance code validation.
              </div>
            </div>

            {/* Financial Settlement Totals */}
            <div className="space-y-2 text-zinc-600 dark:text-zinc-300 print:text-zinc-700">
              <div className="flex justify-between">
                <span>Direct Commodity Subtotal:</span>
                <span className="font-bold text-zinc-900 dark:text-white print:text-black">
                  ₹{activeOrder.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Middleman APMC Deduction:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  ₹0.00 (Zero Commission)
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Agrarian Platform Escrow Fee (4%):</span>
                <span>₹{platformFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                <span>Direct Net Farmer Payout:</span>
                <span>₹{farmerEarnings.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t-2 border-zinc-900 dark:border-zinc-100 print:border-black flex justify-between text-base font-extrabold text-zinc-950 dark:text-white print:text-black">
                <span>Total Escrow Deposit:</span>
                <span className="text-emerald-700 dark:text-emerald-400 print:text-black">
                  ₹{activeOrder.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Certification Seals */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div className="p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 print:border-zinc-400">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Settlement Bank Node</div>
              <div className="mt-4 font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                ICICI / SBI Regulatory Escrow
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                ✓ Cryptographically Signed
              </div>
            </div>

            <div className="p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 print:border-zinc-400">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Assay Inspectorate</div>
              <div className="mt-4 font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                WDRA Quality Depository Gate
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                ✓ Gate Clearance Mandatory
              </div>
            </div>

            <div className="p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 print:border-zinc-400">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Fasal Matrix Network</div>
              <div className="mt-4 font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                Fair Trade Agrarian Node
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                ✓ Validated Contract
              </div>
            </div>
          </div>

          {/* Regulatory Footer Note */}
          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 print:border-zinc-200 text-center text-[10px] text-zinc-400 print:text-zinc-600 font-mono">
            Generated by Fasal Matrix Nodal Escrow Service. Governed under Section 31 of CGST Act read with RBI circular on Intermediary Escrow Nodal Accounts. Page 1 of 1.
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
