'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useOrderStore, OrderItem } from '../../lib/store/orderStore';
import {
  buildInvoiceDataFromOrder,
  triggerInvoicePrintOrDownload,
} from '../../lib/invoiceGenerator';
import {
  Printer,
  Download,
  ArrowLeft,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';

export default function InvoicePage() {
  const { orders } = useOrderStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  // Directly derive active order without cascading effect renders
  const effectiveOrderId = selectedOrderId || (orders.length > 0 ? orders[0].id : '');
  const activeOrder: OrderItem =
    orders.find((o) => o.id === effectiveOrderId) ||
    orders[0] || {
      id: 'ORD-INV-849201',
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

  const inv = buildInvoiceDataFromOrder(activeOrder);

  const handlePrint = () => {
    window.print();
  };

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
            <Link
              href="/escrow/voucher"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Escrow Voucher</span>
            </Link>
            <span className="text-xs text-zinc-400">|</span>
            <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase">
              Statutory GST Tax Invoice
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
              <span>Print A4 Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => triggerInvoicePrintOrDownload(activeOrder)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CLEAR-CUT ONE-PAGE STATUTORY GST TAX INVOICE & BILL OF SUPPLY */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-zinc-900 print:bg-white print:text-black border border-zinc-200 dark:border-zinc-800 print:border-zinc-300 rounded-3xl p-6 sm:p-10 shadow-xl print:shadow-none print:p-0 relative overflow-hidden">
          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700"></div>

          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-emerald-600 dark:border-emerald-500 print:border-emerald-700">
            <div>
              <div className="flex items-center gap-3">
                <BrandLogo size="md" showTagline={false} />
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 print:border print:border-emerald-700 text-[10px] font-mono font-bold uppercase">
                  GST Form 500 Standard
                </span>
              </div>
              <p className="text-xs text-zinc-500 print:text-zinc-600 mt-1.5 font-mono">
                Tax Invoice & Bill of Supply • Section 31(3)(c) of CGST Act, 2017 & Rule 46 CGST Rules
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <div className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 print:text-black">
                TAX INVOICE & BILL OF SUPPLY
              </div>
              <div className="text-zinc-600 dark:text-zinc-400 print:text-zinc-600 mt-0.5">
                Invoice #: <strong>{inv.invoiceNumber}</strong>
              </div>
              <div className="text-zinc-500 text-[11px]">
                Date: {inv.invoiceDate} • Place of Supply: {inv.placeOfSupply}
              </div>
            </div>
          </div>

          {/* Regulatory Compliance Declaration Banner */}
          <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 print:bg-emerald-50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 print:text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Nil GST on Fresh Agricultural Produce:</strong> Exempt under Notification No. 2/2017-Central Tax (Rate). Facilitation SAC 998599 taxed at 18%.
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
              RCM: {inv.reverseChargeApplicable ? 'Yes (Bulk Buyer)' : 'No (Consumer)'}
            </span>
          </div>

          {/* Seller (Farmer / FPO) & Buyer Section */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Supplier / Farmer FPO */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 print:bg-transparent border border-zinc-200 dark:border-zinc-700 print:border-zinc-300">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-200 dark:border-zinc-700">
                <span className="font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                  Supplier / Farmer Producer
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                  Certified Cultivator
                </span>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-zinc-950 dark:text-zinc-100 print:text-black">
                  {inv.sellerDetails.legalName}
                </div>
                <div className="text-zinc-600 dark:text-zinc-300">
                  {inv.sellerDetails.tradeName}
                </div>
                <div className="text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">
                  {inv.sellerDetails.address}
                </div>
                <div className="pt-1.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 flex flex-wrap gap-x-3">
                  <span>State: {inv.sellerDetails.stateCode}</span>
                  <span>PAN: {inv.sellerDetails.pan}</span>
                </div>
                <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                  GSTIN / ID: {inv.sellerDetails.gstinOrAadhaar}
                </div>
              </div>
            </div>

            {/* Recipient / Consignee */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 print:bg-transparent border border-zinc-200 dark:border-zinc-700 print:border-zinc-300">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-200 dark:border-zinc-700">
                <span className="font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                  Consignee / Recipient
                </span>
                <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[10px] font-bold">
                  {activeOrder.buyerType === 'BULK_BUYER' ? 'Institutional Buyer' : 'Direct Consumer'}
                </span>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-zinc-950 dark:text-zinc-100 print:text-black">
                  {inv.buyerDetails.legalName}
                </div>
                <div className="text-zinc-600 dark:text-zinc-300">
                  {inv.buyerDetails.tradeName}
                </div>
                <div className="text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">
                  {inv.buyerDetails.shippingAddress} - {inv.buyerDetails.pincode}
                </div>
                <div className="pt-1.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 flex flex-wrap gap-x-3">
                  <span>State: {inv.buyerDetails.stateCode}</span>
                  <span>Contact: {inv.buyerDetails.phone}</span>
                </div>
                {inv.buyerDetails.gstin && (
                  <div className="font-mono text-[11px] text-zinc-900 dark:text-zinc-200 font-bold">
                    GSTIN: {inv.buyerDetails.gstin}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Invoice & Tax Schedule Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800 print:bg-zinc-100 text-zinc-700 dark:text-zinc-300 print:text-zinc-700 font-mono border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description of Goods / Services</th>
                  <th className="py-2.5 px-3">HSN / SAC</th>
                  <th className="py-2.5 px-3 text-right">Qty (kg)</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value</th>
                  <th className="py-2.5 px-3 text-right">GST Rate</th>
                  <th className="py-2.5 px-3 text-right">Tax Amt (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-[11px]">
                {/* Line 1: Primary Agricultural Produce */}
                <tr>
                  <td className="py-3 px-3 font-bold">01</td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-bold text-zinc-950 dark:text-zinc-100 print:text-black">
                      {inv.produceItem.commodity}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {inv.produceItem.grade}
                    </div>
                    <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-sans mt-0.5">
                      {inv.produceItem.exemptionNotification}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-zinc-800 dark:text-zinc-200">{inv.produceItem.hsnCode}</td>
                  <td className="py-3 px-3 text-right">{inv.produceItem.quantityKg.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right">₹{inv.produceItem.unitPriceRs.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold">₹{inv.produceItem.taxableAmountRs.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">0.00% (Nil)</td>
                  <td className="py-3 px-3 text-right text-zinc-500">₹0.00</td>
                  <td className="py-3 px-3 text-right font-extrabold text-zinc-950 dark:text-white print:text-black">
                    ₹{inv.produceItem.taxableAmountRs.toLocaleString('en-IN')}
                  </td>
                </tr>

                {/* Line 2: Platform Facilitation & Quality Assay Service Fee */}
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 print:bg-transparent">
                  <td className="py-3 px-3 font-bold">02</td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-bold text-zinc-950 dark:text-zinc-100 print:text-black">
                      {inv.facilitationService.description}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Cold-Chain Sequenced Route Logistics & Depository Protection
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-zinc-800 dark:text-zinc-200">{inv.facilitationService.sacCode}</td>
                  <td className="py-3 px-3 text-right">1 Unit</td>
                  <td className="py-3 px-3 text-right">₹{inv.facilitationService.taxableValueRs.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold">₹{inv.facilitationService.taxableValueRs.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold">
                    {inv.facilitationService.igstRatePercent > 0
                      ? `IGST 18%`
                      : `CGST 9% + SGST 9%`}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-zinc-800 dark:text-zinc-200">
                    ₹{inv.facilitationService.totalTaxRs.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-zinc-950 dark:text-white print:text-black">
                    ₹{inv.facilitationService.totalServiceFeeRs.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Settlement Summary Split */}
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Left: Escrow Guarantee & Audit Hashes */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 print:bg-transparent border border-zinc-200 dark:border-zinc-700 print:border-zinc-300 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold font-sans">
                  <Building className="w-4 h-4 shrink-0" />
                  <span>Reserve Bank of India Compliant Nodal Escrow</span>
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  Depository A/C: <strong>{inv.escrowDetails.bankNodalAccount}</strong> ({inv.escrowDetails.ifscCode})
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  Inspection Station: <strong>{inv.escrowDetails.inspectionClearance}</strong>
                </div>
                <div className="break-all text-[10px] text-zinc-500 pt-1">
                  Cryptographic Tx: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{inv.escrowDetails.txHash}</span>
                </div>
              </div>

              {/* Mandi Savings Metric */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-emerald-900 dark:text-emerald-200 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Farmer Net Margin Gain vs Traditional Mandi:</span>
                </span>
                <span className="font-mono font-black text-sm">
                  +₹{inv.summary.totalSavingsVsMandiRs.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Right: Financial Totals */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 print:bg-transparent border border-zinc-200 dark:border-zinc-700 print:border-zinc-300 space-y-2 font-mono">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Taxable Agricultural Produce Value:</span>
                <span>₹{inv.produceItem.taxableAmountRs.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Platform Facilitation Service (SAC 998599):</span>
                <span>₹{inv.facilitationService.taxableValueRs.toFixed(2)}</span>
              </div>
              {inv.facilitationService.cgstAmountRs > 0 && (
                <>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Central GST (CGST 9%):</span>
                    <span>₹{inv.facilitationService.cgstAmountRs.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>State GST (SGST 9%):</span>
                    <span>₹{inv.facilitationService.sgstAmountRs.toFixed(2)}</span>
                  </div>
                </>
              )}
              {inv.facilitationService.igstAmountRs > 0 && (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Integrated GST (IGST 18%):</span>
                  <span>₹{inv.facilitationService.igstAmountRs.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                <span>Total Tax Amount (GST):</span>
                <span>₹{inv.summary.totalGstRs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-zinc-950 dark:text-white print:text-black pt-2 border-t-2 border-zinc-300 dark:border-zinc-600">
                <span className="font-sans">Grand Total (Inclusive of Taxes):</span>
                <span className="text-emerald-700 dark:text-emerald-400 print:text-emerald-800">
                  ₹{inv.summary.grandTotalPayableRs.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-sans pt-1">
                Amount in Words: Indian Rupees {inv.summary.grandTotalPayableRs.toLocaleString('en-IN')} Only
              </div>
            </div>
          </div>

          {/* Certification Seals & Authentications */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 print:border print:border-zinc-200">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Farmer Consortium Seal</div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">Kisan FPO Phulera Unit</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                ✓ Authenticated Producer
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 print:border print:border-zinc-200">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">WDRA Quality Assayer</div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">Depot Inspector #3</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                ✓ Moisture & Grade Cleared
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 print:border print:border-zinc-200">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Digital QR Authenticator</div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">FasalMatrix Gateway</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                ✓ Cryptographically Sealed
              </div>
            </div>
          </div>

          {/* Legal Declaration Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 font-mono text-center">
            <strong>Statutory Declaration:</strong> This is a computer-generated Bill of Supply & Tax Invoice issued under Section 31(3)(c) of the CGST Act, 2017 read with Rule 46 of CGST Rules, 2017. Agricultural goods covered under HSN chapters 07, 10, and 12 are wholly exempt from Central Tax under Notification No. 2/2017-Central Tax (Rate). No physical signature required.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
