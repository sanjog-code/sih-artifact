'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import { useLanguage } from '../../context/LanguageContext';
import { useRfqStore, useProduceStore } from '../../lib/store';
import {
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Send,
  Receipt,
  Lock,
} from 'lucide-react';

export default function BuyerPortal() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [rfqNotice, setRfqNotice] = useState<string | null>(null);

  // Persistence Stores
  const { rfqs, submitRfq, lockEscrow } = useRfqStore();
  const { listings } = useProduceStore();

  // Form State
  const [selectedLot, setSelectedLot] = useState('LOT-RJ-8401 (Tomato - 4,200kg)');
  const [targetVolume, setTargetVolume] = useState(2000);
  const [offerPrice, setOfferPrice] = useState(26.5);

  const handleSubmitRfq = (e: React.FormEvent) => {
    e.preventDefault();
    const targetLotId = selectedLot.split(' ')[0] || '';
    const targetLot = listings.find((l) => l.id.toLowerCase() === targetLotId.toLowerCase());
    const cropName = targetLot ? targetLot.cropName : selectedLot.split(' ')[1]?.replace('(', '') || 'Tomato';
    const clusterName = targetLot ? targetLot.cluster : 'Jaitpura Farmer Cooperative';
    const asking = targetLot ? targetLot.price : 28;

    const newRfq = submitRfq({
      lotId: targetLotId,
      crop: cropName,
      sellerCluster: clusterName,
      volumeKg: Number(targetVolume),
      askingRate: asking,
      bidRate: Number(offerPrice),
      status: 'PENDING',
      createdAt: 'Just now',
    });

    setRfqNotice(t.buyer.rfqSubmittedNotice.replace('{id}', newRfq.id).replace('{price}', String(offerPrice)).replace('{cluster}', clusterName));
    setTimeout(() => setRfqNotice(null), 4500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Link href="/" className="hover:text-zinc-900 transition">{t.common.overview}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-zinc-800">{t.buyer.breadcrumb}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {t.buyer.dashboard}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              {t.buyer.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.buyer.verifiedBuyerBadge}</span>
            </span>
          </div>
        </div>

        {rfqNotice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{rfqNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: RFQ Submission Form */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-950">{t.buyer.rfq}</h3>
              <p className="text-xs text-zinc-500">{t.buyer.rfqSubtitle}</p>
            </div>

            <form onSubmit={handleSubmitRfq} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">{t.buyer.targetLot}</label>
                <select
                  value={selectedLot}
                  onChange={(e) => setSelectedLot(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-zinc-50 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={`${l.id} (${l.cropName} - ${l.quantityKg}kg)`}>
                      {l.id} ({l.cropName} Grade {l.grade} - {l.quantityKg.toLocaleString('en-IN')} kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">{t.buyer.targetVolume}</label>
                <input
                  type="number"
                  required
                  min={500}
                  step={100}
                  value={targetVolume}
                  onChange={(e) => setTargetVolume(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-white font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">{t.buyer.offerRate}</label>
                <input
                  type="number"
                  required
                  min={10}
                  step={0.25}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-white font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.buyer.transmitRfq}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Column 2 & 3: Active RFQs & Settlement Desk */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-950">{t.buyer.activeNegotiationsTitle}</h3>
                <span className="text-[11px] font-mono text-zinc-500">{rfqs.length} {t.common.activeNegotiations}</span>
              </div>

              <div className="space-y-3">
                {rfqs.map((rfq) => (
                  <div
                    key={rfq.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">{rfq.crop}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        rfq.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rfq.status === 'ESCROW_LOCKED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rfq.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-zinc-600">
                      <span>{t.buyer.growerCluster} <strong>{rfq.sellerCluster}</strong></span>
                      <span>{t.buyer.volumeLabel} <strong className="font-mono">{rfq.volumeKg.toLocaleString()} {t.common.kg}</strong></span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-100">
                      <span className="text-zinc-500">
                        {t.buyer.askingRateLabel.replace('{asking}', String(rfq.askingRate))} <strong className="text-zinc-900 font-mono">₹{rfq.bidRate}{t.common.perKg}</strong>
                      </span>
                      {rfq.status === 'ACCEPTED' ? (
                        <button
                          type="button"
                          onClick={() => {
                            lockEscrow(rfq.id);
                            setRfqNotice(t.buyer.escrowReleasedNotice.replace('{id}', rfq.id));
                            setTimeout(() => setRfqNotice(null), 4500);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-semibold transition"
                        >
                          {t.buyer.releaseEscrowBtn}
                        </button>
                      ) : rfq.status === 'ESCROW_LOCKED' ? (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {t.buyer.escrowLocked}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">{t.buyer.awaitingConsensus}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow Protocol Info */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2 text-zinc-900 font-bold text-sm">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>{t.buyer.guaranteedEscrowTitle}</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {t.buyer.guaranteedEscrowDesc}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
