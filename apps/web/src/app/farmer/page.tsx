'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import { useLanguage } from '../../context/LanguageContext';
import { useProduceStore } from '../../lib/store';
import {
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface AiForecastData {
  currentModalPrice: number;
  predictedNextPrice: number;
  demandSignal: string;
  factors?: string[];
}

interface FarmerListing {
  id: string;
  crop: string;
  grade: string;
  quantityKg: number;
  expectedPrice: number;
  status: 'ACTIVE' | 'IN_WAREHOUSE' | 'SOLD';
  date: string;
}

export default function FarmerPortal() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);

  // Persistence Store
  const { listings: produceListings, addListing } = useProduceStore();

  // Form State
  const [commodity, setCommodity] = useState('Tomato');
  const [quantity, setQuantity] = useState(1500);
  const [grade, setGrade] = useState('A1');
  const [price, setPrice] = useState(28);

  // AI Prediction State
  const [aiData, setAiData] = useState<AiForecastData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Mapped Listings from persistent ProduceStore
  const listings: FarmerListing[] = useMemo(() => {
    return produceListings.map((l) => ({
      id: l.id,
      crop: l.cropName,
      grade: l.grade.startsWith('Grade') ? l.grade : `Grade ${l.grade}`,
      quantityKg: l.quantityKg,
      expectedPrice: l.price,
      status: (l.status === 'IN_WAREHOUSE' || l.status === 'SOLD' ? l.status : 'ACTIVE') as
        | 'ACTIVE'
        | 'IN_WAREHOUSE'
        | 'SOLD',
      date: l.harvestDate,
    }));
  }, [produceListings]);

  const fetchAiAdvisory = async (cropName: string) => {
    setLoadingAi(true);
    try {
      const res = await fetch(`/api/ai/forecast?commodity=${cropName}&state=RJ&district=Jaipur&storageDays=1`);
      const data = await res.json();
      setAiData(data);
    } catch {
      // fallback
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchAiAdvisory(commodity);
    });
  }, [commodity]);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const cat: 'vegetables' | 'oilseeds' | 'grains' | 'pulses' =
      commodity === 'Tomato' ? 'vegetables' :
      commodity === 'Mustard' ? 'oilseeds' :
      commodity === 'Wheat' ? 'grains' :
      commodity === 'Soybean' ? 'pulses' : 'vegetables';

    const newLot = addListing({
      id: `LST-${8900 + produceListings.length + 1}`,
      cropName: commodity,
      nameKey: `crop${commodity}`,
      category: cat,
      grade: (grade as 'A1' | 'A2' | 'B') || 'A1',
      quantityKg: Number(quantity),
      quantity: `${Number(quantity).toLocaleString('en-IN')} kg`,
      price: Number(price),
      location: 'Jaipur WDRA Terminal Hub',
      cluster: 'Direct Farmer Lot (Self-Declared)',
      status: 'ACTIVE',
      harvestDate: 'Just now',
    });

    setNotice(t.farmer.lotPublishedNotice.replace('{id}', newLot.id).replace('{price}', String(price)));
    setTimeout(() => setNotice(null), 4000);
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
              <span className="font-semibold text-zinc-800">{t.farmer.breadcrumb}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {t.farmer.dashboard}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              {t.farmer.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.farmer.verifiedProfile}</span>
            </span>
          </div>
        </div>

        {notice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Declare Produce & AI Advisory */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live AI Market Forecast Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">
                      {t.farmer.aiForecastTitle}
                    </h3>
                    <span className="text-[11px] text-zinc-500">
                      {t.farmer.aiForecastSubtitle}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => fetchAiAdvisory(commodity)}
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition"
                  title={t.farmer.refreshForecast}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {aiData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-500 block">{t.farmer.currentModal}</span>
                      <strong className="text-lg font-extrabold text-zinc-950 font-mono">₹{aiData.currentModalPrice}{t.common.perKg}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-500 block">{t.farmer.aiPredicted}</span>
                      <strong className="text-lg font-extrabold text-emerald-800 font-mono">₹{aiData.predictedNextPrice}{t.common.perKg}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-500 block">{t.farmer.demandSignal}</span>
                      <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        aiData.demandSignal === 'HIGH_DEMAND' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {aiData.demandSignal}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-600 space-y-1 pl-1">
                    {aiData.factors?.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Produce Declaration Form */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
              <div className="border-b border-zinc-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-zinc-950">
                  {t.farmer.declare}
                </h3>
                <p className="text-xs text-zinc-500">
                  {t.farmer.declareSubtitle}
                </p>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">{t.farmer.cropCommodity}</label>
                    <select
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value)}
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-zinc-50 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Tomato">{t.farmer.cropTomatoOption}</option>
                      <option value="Mustard">{t.farmer.cropMustardOption}</option>
                      <option value="Wheat">{t.farmer.cropWheatOption}</option>
                      <option value="Soybean">{t.farmer.cropSoybeanOption}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">{t.farmer.qualityTier}</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-zinc-50 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="A1">{t.farmer.gradeA1Option}</option>
                      <option value="A2">{t.farmer.gradeA2Option}</option>
                      <option value="B">{t.farmer.gradeBOption}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">{t.farmer.quantityLabel}</label>
                    <input
                      type="number"
                      required
                      min={100}
                      step={50}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-white font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">{t.farmer.expectedPriceLabel}</label>
                    <input
                      type="number"
                      required
                      min={5}
                      step={0.5}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-white font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t.farmer.publishBtn}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Column 3: Active Listings & Warehouse Liquidity */}
          <div className="space-y-6">
            {/* My Active Listings Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-950">{t.farmer.lots}</h3>
                <span className="text-[11px] font-mono text-zinc-500">{listings.length} {t.common.lots}</span>
              </div>

              <div className="space-y-3">
                {listings.map((lot) => (
                  <div
                    key={lot.id}
                    className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">{lot.crop}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        lot.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-200 text-zinc-800'
                      }`}>
                        {lot.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>{lot.grade} · {lot.quantityKg.toLocaleString()} {t.common.kg}</span>
                      <strong className="text-zinc-900 font-mono">₹{lot.expectedPrice}{t.common.perKg}</strong>
                    </div>
                    <div className="text-[10px] text-zinc-600 font-mono pt-1">
                      {t.farmer.idLabel.replace('{id}', lot.id).replace('{date}', lot.date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* e-NWR Instant Pledge Card */}
            <div className="bg-zinc-900 text-white rounded-2xl p-6 border border-zinc-800 shadow-md">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold block mb-1">
                {t.farmer.wdraGridBadge}
              </span>
              <h4 className="text-base font-bold tracking-tight mb-2">
                {t.farmer.enwrPledgeTitle}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                {t.farmer.enwrPledgeDesc}
              </p>
              <button
                onClick={() => setInquiryOpen(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
              >
                {t.farmer.applyEnwrBtn}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
