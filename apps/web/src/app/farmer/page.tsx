'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import { useLanguage } from '../../context/LanguageContext';
import { useProduceStore, useOrderStore, useRfqStore } from '../../lib/store';
import {
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  LayoutDashboard,
  Sprout,
  ListFilter,
  ShoppingBag,
  Truck,
  IndianRupee,
  PhoneCall,
  PauseCircle,
  PlayCircle,
  Trash2,
  Sparkles,
  ArrowUpRight,
  PackageCheck,
} from 'lucide-react';

interface AiForecastData {
  currentModalPrice: number;
  predictedNextPrice: number;
  predictedChangePercent?: number;
  demandSignal: string;
  mspFloor?: number;
  fairPriceRange?: { min: number; max: number };
  factors?: string[];
  modelMetrics?: {
    testMaeKg: number;
    datasetRecords: number;
  };
}

// Sample verified buyer demand opportunities from regional markets
const BUYER_REQUIREMENTS = [
  {
    id: 'BR-ITC-104',
    buyer: 'ITC Agro Foods Ltd.',
    commodity: 'Wheat (Sharbati)',
    volume: '25,000 kg',
    targetPrice: 27.5,
    location: 'Jaipur WDRA Hub',
    deliveryDate: 'Within 48 hours',
    specs: 'Max moisture 10%, zero foreign matter, Grade A1 mandatory.',
  },
  {
    id: 'BR-BB-209',
    buyer: 'BigBasket Fresh Hub',
    commodity: 'Tomato (Hybrid)',
    volume: '8,000 kg',
    targetPrice: 28.0,
    location: 'Phulera Depot #3',
    deliveryDate: 'Immediate intake',
    specs: 'Uniform ripening 85%+, firm texture, crate packaged.',
  },
  {
    id: 'BR-ADANI-312',
    buyer: 'Adani Wilmar Procurement',
    commodity: 'Mustard (High Oil)',
    volume: '15,000 kg',
    targetPrice: 89.0,
    location: 'Alwar Terminal',
    deliveryDate: 'Oct 15, 2026',
    specs: 'Oil content > 40%, cleaned and graded.',
  },
  {
    id: 'BR-MD-401',
    buyer: 'Mother Dairy Fruit & Veg',
    commodity: 'Potato (Processing Grade)',
    volume: '20,000 kg',
    targetPrice: 22.0,
    location: 'Agra Cold Vault #2',
    deliveryDate: 'Oct 18, 2026',
    specs: 'Size 45mm+, low sugar content for processing.',
  },
];

export default function FarmerPortal() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sell' | 'listings' | 'marketplace' | 'orders' | 'forecast' | 'logistics' | 'payments' | 'support'
  >('overview');

  // Persistence Stores
  const { listings: produceListings, addListing, deleteListing, togglePauseListing } = useProduceStore();
  const { orders, updateOrderStatus } = useOrderStore();
  const { submitRfq } = useRfqStore();

  // Sell Form State
  const [commodity, setCommodity] = useState('Tomato');
  const [variety, setVariety] = useState('Hybrid Gold');
  const [quantity, setQuantity] = useState(2500);
  const [grade, setGrade] = useState<'A1' | 'A2' | 'B'>('A1');
  const [price, setPrice] = useState(28);
  const [depot, setDepot] = useState('Jaipur WDRA Terminal Hub');
  const [deliveryMode, setDeliveryMode] = useState<'buyer_pickup' | 'platform_logistics' | 'self_delivery'>('platform_logistics');

  // AI Prediction State
  const [aiData, setAiData] = useState<AiForecastData | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Escrow & Payment State
  const [walletBalance, setWalletBalance] = useState(482500);
  const [withdrawing, setWithdrawing] = useState(false);

  // Connect Offer Modal State
  const [selectedReq, setSelectedReq] = useState<typeof BUYER_REQUIREMENTS[0] | null>(null);
  const [offerVolume, setOfferVolume] = useState(2000);
  const [offerRate, setOfferRate] = useState(27.5);

  const fetchAiAdvisory = async (cropName: string) => {
    setLoadingAi(true);
    try {
      const res = await fetch(`/api/ai/forecast?commodity=${cropName}&state=RJ&district=Jaipur&storageDays=1`);
      const data = await res.json();
      setAiData(data);
    } catch {
      // Fallback
      setAiData({
        currentModalPrice: 24.27,
        predictedNextPrice: 24.41,
        predictedChangePercent: 0.58,
        demandSignal: 'HIGH_DEMAND',
        mspFloor: 22.75,
        fairPriceRange: { min: 23.0, max: 26.0 },
        factors: ['Equilibrium wholesale demand', 'CCEA statutory MSP floor verified', 'APMC clearing trend positive'],
        modelMetrics: { testMaeKg: 0.33, datasetRecords: 737392 },
      });
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
      grade,
      quantityKg: Number(quantity),
      quantity: `${Number(quantity).toLocaleString('en-IN')} kg`,
      price: Number(price),
      location: depot,
      cluster: `Direct Farmer Lot (${variety})`,
      status: 'ACTIVE',
      harvestDate: 'Today, Assayed',
      farmerName: 'Rameshwar Jat',
      description: `Grade ${grade} ${commodity} harvest, cleared under WDRA specifications with ${deliveryMode.replace('_', ' ')}.`,
    });

    setNotice(t.farmer.lotPublishedNotice.replace('{id}', newLot.id).replace('{price}', String(price)));
    setActiveTab('listings');
    setTimeout(() => setNotice(null), 4500);
  };

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'IN_TRANSIT');
    setNotice(`Order #${orderId} accepted and assigned to regional fleet manifest. Tracking active!`);
    setTimeout(() => setNotice(null), 4500);
  };

  const handleWithdrawal = () => {
    setWithdrawing(true);
    setTimeout(() => {
      const amount = walletBalance;
      setWalletBalance(0);
      setWithdrawing(false);
      setNotice(`Successfully initiated T+1 escrow payout of ₹${amount.toLocaleString('en-IN')} to verified bank account (SBI A/C ***4819). Ref: TXN-${Date.now().toString().slice(-6)}.`);
      setTimeout(() => setNotice(null), 5000);
    }, 1200);
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    submitRfq({
      lotId: selectedReq.id,
      crop: selectedReq.commodity.split(' ')[0],
      sellerCluster: 'Direct Farmer Cooperative',
      volumeKg: Number(offerVolume),
      askingRate: Number(offerRate),
      bidRate: Number(selectedReq.targetPrice),
      status: 'PENDING',
      createdAt: 'Just now',
    });
    setNotice(`Offer submitted directly to ${selectedReq.buyer} for ${offerVolume.toLocaleString('en-IN')} kg at ₹${offerRate}/kg!`);
    setSelectedReq(null);
    setTimeout(() => setNotice(null), 4500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Breadcrumb & Accreditation Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200">
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>WDRA & PM-KISAN Verified</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-800 text-xs font-mono font-medium border border-zinc-200">
              <IndianRupee className="w-3.5 h-3.5 text-zinc-600" />
              <span>Escrow: ₹{walletBalance.toLocaleString('en-IN')}</span>
            </span>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-zinc-200 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'sell', label: 'List Harvest', icon: PlusCircle },
            { id: 'listings', label: `My Listings (${produceListings.length})`, icon: ListFilter },
            { id: 'marketplace', label: 'Buyer Requirements', icon: ShoppingBag, badge: '4 Active' },
            { id: 'orders', label: `Orders (${orders.length})`, icon: PackageCheck },
            { id: 'forecast', label: 'AI Demand Forecast', icon: TrendingUp },
            { id: 'logistics', label: 'Shipment Tracker', icon: Truck },
            { id: 'payments', label: 'Payments & Escrow', icon: IndianRupee },
            { id: 'support', label: 'Kisan Helpline', icon: PhoneCall },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & COMMAND BAROMETER */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Impact & Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                  Direct Sales Settled
                </span>
                <span className="text-2xl font-extrabold text-zinc-950 font-mono mt-1 block">
                  ₹3,42,800
                </span>
                <span className="text-xs text-emerald-700 font-medium mt-1 inline-flex items-center gap-1">
                  <span>+18.4% vs APMC mandi avg</span>
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                  Active Buyer Demands
                </span>
                <span className="text-2xl font-extrabold text-zinc-950 font-mono mt-1 block">
                  38 Institutional
                </span>
                <span className="text-xs text-zinc-500 font-medium mt-1 inline-flex items-center gap-1">
                  <span>4 direct matches for your lots</span>
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                  Intermediary Savings
                </span>
                <span className="text-2xl font-extrabold text-emerald-800 font-mono mt-1 block">
                  24.8% Retained
                </span>
                <span className="text-xs text-zinc-500 font-medium mt-1">
                  Zero commission infrastructure
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                  Escrow Lock State
                </span>
                <span className="text-2xl font-extrabold text-zinc-950 font-mono mt-1 block">
                  100% Protected
                </span>
                <span className="text-xs text-emerald-700 font-medium mt-1 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>T+1 Direct bank clearing</span>
                </span>
              </div>
            </div>

            {/* Quick Actions & AI Barometer Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Opportunity Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-950">AI Selling Opportunity</h3>
                        <p className="text-xs text-zinc-500">Based on historical mandi price regression & demand telemetry</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                      91% Confidence
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl mb-4">
                    <h4 className="text-sm font-bold text-emerald-950">
                      High Wholesale Demand Projected in Jaipur & Phulera
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Modal clearing rates for Grade A1 Tomato and Mustard are trending above baseline. Selling over the next 2-4 days offers optimal value retention before regional arrival surge.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Current Modal</span>
                      <span className="text-base font-extrabold text-zinc-950 font-mono mt-0.5 block">₹24.27/kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Projected 72h</span>
                      <span className="text-base font-extrabold text-emerald-800 font-mono mt-0.5 block">₹24.41/kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Statutory MSP</span>
                      <span className="text-base font-extrabold text-zinc-700 font-mono mt-0.5 block">₹22.75/kg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('sell')}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>List New Harvest Lot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('marketplace')}
                    className="px-4 py-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-semibold transition"
                  >
                    View Buyer Requirements
                  </button>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 mb-3 pb-2 border-b border-zinc-100">
                    Kisan Quick Controls
                  </h3>
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('sell')}
                      className="w-full text-left p-3 rounded-xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <PlusCircle className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="text-xs font-bold text-zinc-950">Declare Harvest Lot</div>
                          <div className="text-[11px] text-zinc-500">Self-declare crop, volume & grade</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="w-full text-left p-3 rounded-xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <PackageCheck className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="text-xs font-bold text-zinc-950">Manage Orders ({orders.length})</div>
                          <div className="text-[11px] text-zinc-500">Accept and dispatch buyer pickups</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('forecast')}
                      className="w-full text-left p-3 rounded-xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="text-xs font-bold text-zinc-950">Mandi Price Simulator</div>
                          <div className="text-[11px] text-zinc-500">Evaluate holding vs immediate sale</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('payments')}
                      className="w-full text-left p-3 rounded-xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <IndianRupee className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="text-xs font-bold text-zinc-950">T+1 Bank Escrow Payout</div>
                          <div className="text-[11px] text-zinc-500">Withdraw cleared proceeds</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 mt-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Helpline: <strong>1800-180-1551</strong> (Kisan Toll-Free)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SELL CROP (HARVEST DECLARATION FORM) */}
        {/* ============================================================== */}
        {activeTab === 'sell' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
              <div className="border-b border-zinc-100 pb-4 mb-6">
                <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                  {t.farmer.declare}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  {t.farmer.declareSubtitle}
                </p>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      {t.farmer.cropCommodity}
                    </label>
                    <select
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value)}
                      className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Tomato">{t.farmer.cropTomatoOption}</option>
                      <option value="Mustard">{t.farmer.cropMustardOption}</option>
                      <option value="Wheat">{t.farmer.cropWheatOption}</option>
                      <option value="Soybean">{t.farmer.cropSoybeanOption}</option>
                      <option value="Potato">Potato (आलू / ਬਟਾਟਾ)</option>
                      <option value="Onion">Onion (प्याज़ / ਪਿਆਜ਼)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Variety / Strain
                    </label>
                    <input
                      type="text"
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      placeholder="e.g. Hybrid Gold, Sharbati 306, Pusa Bold"
                      className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      {t.farmer.quantityLabel}
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      {t.farmer.qualityTier}
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as 'A1' | 'A2' | 'B')}
                      className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="A1">{t.farmer.gradeA1Option}</option>
                      <option value="A2">{t.farmer.gradeA2Option}</option>
                      <option value="B">{t.farmer.gradeBOption}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      {t.farmer.expectedPriceLabel}
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={10}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Designated WDRA Depot / Warehouse
                    </label>
                    <select
                      value={depot}
                      onChange={(e) => setDepot(e.target.value)}
                      className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Jaipur WDRA Terminal Hub">Jaipur North WDRA Hub</option>
                      <option value="Phulera Depot #3">Phulera Agro Cold-Depot #3</option>
                      <option value="Ujjain Central Silo">Ujjain Central e-NWR Silo</option>
                      <option value="Nagpur East Agro Hub">Nagpur East Agro Terminal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Delivery Mode
                    </label>
                    <select
                      value={deliveryMode}
                      onChange={(e) => setDeliveryMode(e.target.value as typeof deliveryMode)}
                      className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="platform_logistics">Platform Optimized Logistics (Recommended)</option>
                      <option value="buyer_pickup">Buyer Depot Pickup</option>
                      <option value="self_delivery">Self-Delivery to Terminal</option>
                    </select>
                  </div>
                </div>

                {/* AI Guidance Box inside form */}
                {aiData && (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        AI recommended asking rate for {commodity}: <strong>₹{aiData.predictedNextPrice}/kg</strong> (CCEA statutory floor: ₹{aiData.mspFloor || 22.75}/kg).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrice(aiData.predictedNextPrice)}
                      className="text-[11px] font-bold text-emerald-900 underline hover:text-emerald-700 shrink-0 ml-2"
                    >
                      Apply Rate
                    </button>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>{t.farmer.publishBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="py-3 px-5 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs sm:text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: MY LISTINGS (FULL CRUD) */}
        {/* ============================================================== */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                  {t.farmer.lots}
                </h2>
                <p className="text-xs text-zinc-500">
                  Manage live harvest declarations, toggle lot availability, or remove completed lots.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('sell')}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Declare New Lot</span>
              </button>
            </div>

            {produceListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-500">
                <Sprout className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                <p className="text-xs">{t.farmer.declareSubtitle}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {produceListings.map((lot) => {
                  const isPaused = lot.status === 'PAUSED';
                  return (
                    <div
                      key={lot.id}
                      className={`bg-white rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between ${
                        isPaused ? 'border-amber-200 bg-amber-50/20 opacity-80' : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold">
                            {lot.id}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isPaused
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : lot.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {lot.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-zinc-950 mt-1">
                          {lot.cropName}
                        </h3>
                        <div className="text-lg font-extrabold text-zinc-950 font-mono mt-0.5">
                          ₹{lot.price} <span className="text-xs text-zinc-500 font-normal">/ kg</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Available:</span>
                            <strong className="text-zinc-900 font-mono">{lot.quantity}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Grade:</span>
                            <span className="text-zinc-900 font-semibold">AGMARK Grade {lot.grade}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Warehouse:</span>
                            <span className="text-zinc-900 truncate max-w-[150px]">{lot.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Declared:</span>
                            <span className="text-zinc-900">{lot.harvestDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            togglePauseListing(lot.id);
                            setNotice(`Listing ${lot.id} status updated to ${isPaused ? 'ACTIVE' : 'PAUSED'}.`);
                            setTimeout(() => setNotice(null), 3000);
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
                            isPaused
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {isPaused ? <PlayCircle className="w-3.5 h-3.5 text-emerald-700" /> : <PauseCircle className="w-3.5 h-3.5 text-amber-700" />}
                          <span>{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            deleteListing(lot.id);
                            setNotice(`Listing ${lot.id} removed from active marketplace.`);
                            setTimeout(() => setNotice(null), 3000);
                          }}
                          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition"
                          title="Delete lot declaration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: BUYER MARKETPLACE (DIRECT DEMANDS) */}
        {/* ============================================================== */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                Verified Institutional Demands
              </h2>
              <p className="text-xs text-zinc-500">
                Bulk corporate buyers and retail aggregators actively seeking verified farmer harvests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BUYER_REQUIREMENTS.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs hover:border-zinc-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold">
                        {req.id}
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        Escrow Ready
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-950 mt-1">
                      {req.commodity}
                    </h3>
                    <div className="text-xs text-zinc-500 font-semibold">{req.buyer}</div>

                    <div className="text-xl font-extrabold text-zinc-950 font-mono mt-2">
                      ₹{req.targetPrice} <span className="text-xs text-zinc-500 font-normal">/ kg Target</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Volume Required:</span>
                        <strong className="text-zinc-900 font-mono">{req.volume}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Intake Depot:</span>
                        <span className="text-zinc-900">{req.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Timeline:</span>
                        <span className="text-zinc-900">{req.deliveryDate}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 mt-3 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                      <strong>Specs:</strong> {req.specs}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReq(req);
                        setOfferRate(req.targetPrice);
                      }}
                      className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Submit Direct Offer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Offer Modal */}
            {selectedReq && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 max-w-md w-full shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                    <h3 className="text-sm font-bold text-zinc-950">
                      Submit Offer to {selectedReq.buyer}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedReq(null)}
                      className="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600">
                    Declare volume to fulfill for <strong>{selectedReq.commodity}</strong> at {selectedReq.location}.
                  </p>

                  <form onSubmit={handleSubmitOffer} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                        Supply Quantity (kg)
                      </label>
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={offerVolume}
                        onChange={(e) => setOfferVolume(Number(e.target.value))}
                        className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-zinc-50 font-mono text-zinc-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                        Offered Rate (₹/kg)
                      </label>
                      <input
                        type="number"
                        step={0.25}
                        min={10}
                        value={offerRate}
                        onChange={(e) => setOfferRate(Number(e.target.value))}
                        className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-zinc-50 font-mono text-zinc-900"
                        required
                      />
                    </div>

                    <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-600 flex justify-between">
                      <span>Total Value:</span>
                      <strong className="text-zinc-950 font-mono">
                        ₹{(offerVolume * offerRate).toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition"
                      >
                        Submit Proposal
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedReq(null)}
                        className="py-2.5 px-4 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: ORDERS MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                Harvest Orders & Fulfilment
              </h2>
              <p className="text-xs text-zinc-500">
                Track pending institutional and consumer orders, accept lots for dispatch, and verify escrow clearing.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-500">
                <PackageCheck className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                <p className="text-xs">No active orders placed yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => {
                  const isPendingAction = ord.status === 'ESCROW_LOCKED' || ord.status === 'PENDING';
                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs hover:border-zinc-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-bold">
                            {ord.id}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-900'
                              : ord.status === 'IN_TRANSIT'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {ord.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-zinc-500">• {ord.createdAt}</span>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-950">
                          {ord.items}
                        </h3>

                        <div className="text-xs text-zinc-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          <span>Buyer: <strong>{ord.buyerName}</strong> ({ord.buyerType})</span>
                          <span>Value: <strong className="font-mono text-zinc-950">₹{ord.totalPrice.toLocaleString('en-IN')}</strong></span>
                          <span>Tracking: <strong className="font-mono">{ord.trackingId}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-center">
                        {isPendingAction ? (
                          <button
                            type="button"
                            onClick={() => handleAcceptOrder(ord.id)}
                            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Accept & Dispatch</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-medium px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Transit / Dispatched</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: DEEP AI PRICE & DEMAND FORECAST */}
        {/* ============================================================== */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                    {t.farmer.aiForecastTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                    Calibrated multi-lag auto-regressive model trained on 737,392 APMC clearing records.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchAiAdvisory(commodity)}
                  className="px-3.5 py-1.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition text-xs font-semibold flex items-center gap-1.5 self-start"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                  <span>Recalibrate Forecast</span>
                </button>
              </div>

              {/* Commodity Selector Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {['Tomato', 'Wheat', 'Mustard', 'Soybean'].map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setCommodity(crop)}
                    className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                      commodity === crop
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>

              {aiData && (
                <div className="space-y-6">
                  {/* Valuation Dashboard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">{t.farmer.currentModal}</span>
                      <span className="text-2xl font-extrabold text-zinc-950 font-mono mt-1 block">
                        ₹{aiData.currentModalPrice}/kg
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">{t.farmer.aiPredicted}</span>
                      <span className="text-2xl font-extrabold text-emerald-800 font-mono mt-1 block">
                        ₹{aiData.predictedNextPrice}/kg
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">MSP Statutory Floor</span>
                      <span className="text-2xl font-extrabold text-zinc-800 font-mono mt-1 block">
                        ₹{aiData.mspFloor || 22.75}/kg
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">{t.farmer.demandSignal}</span>
                      <span className="inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
                        {aiData.demandSignal}
                      </span>
                    </div>
                  </div>

                  {/* Explainability Breakdown */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3">
                      AI Explainable Valuation Rationale
                    </h3>
                    <div className="space-y-2">
                      {aiData.factors?.map((f, i) => (
                        <div key={i} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Model Accuracy Card */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <strong>Model Confidence & Verification:</strong> Test Mean Absolute Error (MAE):{' '}
                      <span className="font-mono font-bold">₹0.33 / kg</span> (Wheat) • 737,392 APMC clearing records verified.
                    </div>
                    <span className="text-[11px] font-mono font-semibold bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">
                      Ridge Auto-Regressive
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: LOGISTICS & SHIPMENT TRACKER */}
        {/* ============================================================== */}
        {activeTab === 'logistics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                Logistics & Active Shipment Telemetry
              </h2>
              <p className="text-xs text-zinc-500">
                Live dispatch manifests, cold-chain temperature sensors, and vehicle route milestones.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
              {/* Manifest Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                    ACTIVE SHIPMENT • DISPATCH #MNF-2891
                  </span>
                  <h3 className="text-base font-bold text-zinc-950 mt-1">
                    Route: Jaitpura Cluster → Jaipur North WDRA Hub
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xs text-zinc-500">Vehicle Assigned</div>
                  <div className="text-sm font-extrabold text-zinc-950 font-mono">RJ-14-GA-8921 (3T Refrig)</div>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                  <div className="text-xs font-bold">1. Farm Gate</div>
                  <div className="text-[11px] mt-0.5 text-emerald-700">Picked up 08:30 AM</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                  <div className="text-xs font-bold">2. Quality Check</div>
                  <div className="text-[11px] mt-0.5 text-emerald-700">Assayed Grade A1</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 animate-pulse">
                  <div className="text-xs font-bold">3. In Transit</div>
                  <div className="text-[11px] mt-0.5 text-blue-700">ETA: 45 Minutes</div>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-500">
                  <div className="text-xs font-bold">4. Depot Intake</div>
                  <div className="text-[11px] mt-0.5">Pending Delivery</div>
                </div>
              </div>

              {/* Sensor Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700">
                <div>
                  <span className="text-zinc-500 block">Cold-Chain Temperature:</span>
                  <strong className="text-zinc-950 font-mono">5.2°C (Optimal Range 4-8°C)</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Relative Humidity:</span>
                  <strong className="text-zinc-950 font-mono">88% (Arrhenius Safe)</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Driver Contact:</span>
                  <strong className="text-zinc-950">Gurpreet Singh (+91 98291 04921)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: PAYMENTS & ESCROW WALLET */}
        {/* ============================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6 mb-6">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                    Available Escrow Balance
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-mono mt-1">
                    ₹{walletBalance.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guaranteed T+1 escrow settlement backing all cleared orders</span>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={walletBalance === 0 || withdrawing}
                  onClick={handleWithdrawal}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 self-start shadow-xs"
                >
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                  <span>{withdrawing ? 'Processing Clearing...' : 'Withdraw to Bank Account'}</span>
                </button>
              </div>

              {/* Linked Bank Account Card */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between mb-6 text-xs text-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center font-bold">
                    SBI
                  </div>
                  <div>
                    <div className="font-bold text-zinc-950">State Bank of India (Primary PM-KISAN A/C)</div>
                    <div className="text-[11px] text-zinc-500 font-mono">A/C: **********4819 • IFSC: SBIN0004921</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Transaction Ledger */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3">
                  Recent Settlement Ledger & Cryptographic Proofs
                </h3>
                <div className="space-y-2">
                  {[
                    { id: 'TX-9921', lot: 'LOT-RJ-8401 (Tomato 4.2T)', buyer: 'Reliance Retail', amount: 117600, date: 'Oct 08, 2026', hash: '0x8f2a...c891' },
                    { id: 'TX-9918', lot: 'LOT-MP-9302 (Wheat 12T)', buyer: 'ITC Agro Foods', amount: 312000, date: 'Oct 04, 2026', hash: '0x3d11...4a29' },
                    { id: 'TX-9905', lot: 'LOT-PB-7703 (Mustard 5T)', buyer: 'Adani Wilmar', amount: 440000, date: 'Sep 29, 2026', hash: '0x17c9...88fe' },
                  ].map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 bg-white border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-950">{tx.lot}</div>
                        <div className="text-[11px] text-zinc-500">
                          {tx.buyer} • {tx.date} • Audit Hash: <span className="font-mono">{tx.hash}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <strong className="text-emerald-800 font-mono block text-sm">
                          +₹{tx.amount.toLocaleString('en-IN')}
                        </strong>
                        <span className="text-[10px] text-zinc-500 font-mono">T+1 CLEARED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: KISAN ADVISORY & HELPLINE */}
        {/* ============================================================== */}
        {activeTab === 'support' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
              <div className="border-b border-zinc-100 pb-4 mb-6">
                <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                  Kisan Telephony & Agrarian Support
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Accessible toll-free assistance in Hindi, Punjabi, Marathi, Telugu, Tamil, and English.
                </p>
              </div>

              {/* Call-In Banner */}
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-950">National Kisan Advisory Hotline</div>
                    <div className="text-xs text-emerald-800 font-mono font-extrabold">1800-180-1551 (Toll-Free)</div>
                  </div>
                </div>

                <a
                  href="tel:18001801551"
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition"
                >
                  Dial Now
                </a>
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Frequently Asked Questions
                </h3>

                {[
                  {
                    q: 'How does the Minimum Support Price (MSP) protection work?',
                    a: 'FarmLink strictly verifies government CCEA statutory floors. If bids or market clearing prices drop below the official MSP floor, the platform prohibits sub-floor contracts and offers accredited WDRA storage pledge finance instead.',
                  },
                  {
                    q: 'When do I receive payment for dispatched produce?',
                    a: 'All transactions use bank escrow locks. When the designated WDRA depot or buyer verifies arrival and AGMARK grade, funds release to your registered account within T+1 working days without intermediary deduction.',
                  },
                  {
                    q: 'Can I access the platform without continuous internet?',
                    a: 'Yes. Our IVR voice telephony line allows you to declare harvest lots and check mandi rates via any basic mobile telephone in your native regional language.',
                  },
                  {
                    q: 'Who pays for transport and vehicle routing?',
                    a: 'Platform-optimized logistics are grouped via our Capacitated VRP solver across farm clusters, reducing transport expenditure by up to 38.2% compared to individual haulage.',
                  },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <h4 className="text-xs font-bold text-zinc-950 mb-1">{item.q}</h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
