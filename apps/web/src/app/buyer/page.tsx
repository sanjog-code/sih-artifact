'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import { useLanguage } from '../../context/LanguageContext';
import { useRfqStore, useProduceStore, useOrderStore, useSubscriptionStore, BusinessTier, ProduceLotItem } from '../../lib/store';
import RoleGuard from '../../components/RoleGuard';
import {
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Send,
  Receipt,
  Lock,
  LayoutDashboard,
  Store,
  FileText,
  Boxes,
  PlusCircle,
  Truck,
  TrendingUp,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { triggerInvoicePrintOrDownload } from '../../lib/invoiceGenerator';

export default function BuyerPortal() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [rfqNotice, setRfqNotice] = useState<string | null>(null);

  // Active Tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'rfqs' | 'orders' | 'tender' | 'subscriptions' | 'recurring'>('overview');

  // Persistence Stores
  const { rfqs, submitRfq, lockEscrow } = useRfqStore();
  const { listings } = useProduceStore();
  const { orders, placeOrder, updateOrderStatus } = useOrderStore();
  const {
    businessTier,
    businessConfig,
    setBusinessPlan,
    recurringSchedules,
    addRecurringSchedule,
  } = useSubscriptionStore();

  const [schedCrop, setSchedCrop] = useState('Tomato');
  const [schedVolume, setSchedVolume] = useState(1000);
  const [schedFrequency, setSchedFrequency] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('WEEKLY');
  const [schedDate, setSchedDate] = useState('Every Monday, 07:00 AM');

  // Search & Filter in Marketplace
  const [marketSearch, setMarketSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // RFQ Form State
  const [selectedLot, setSelectedLot] = useState('LOT-RJ-8401 (Tomato - 4,200kg)');
  const [targetVolume, setTargetVolume] = useState(2000);
  const [offerPrice, setOfferPrice] = useState(26.5);

  // Post Demand Tender Form State
  const [tenderCrop, setTenderCrop] = useState('Tomato');
  const [tenderVolume, setTenderVolume] = useState(5000);
  const [tenderMaxBudget, setTenderMaxBudget] = useState(28);
  const [tenderDeliveryDistrict, setTenderDeliveryDistrict] = useState('Jaipur Hub');

  // Filtered Produce Lots for Sourcing
  const filteredProduce = useMemo(() => {
    return listings.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = marketSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.cropName.toLowerCase().includes(q) ||
        item.cluster.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchCat && matchSearch && item.status === 'ACTIVE';
    });
  }, [listings, selectedCategory, marketSearch]);

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

    setRfqNotice(
      t.buyer.rfqSubmittedNotice
        .replace('{id}', newRfq.id)
        .replace('{price}', String(offerPrice))
        .replace('{cluster}', clusterName)
    );
    setTimeout(() => setRfqNotice(null), 4500);
  };

  const handleQuickSource = (lot: ProduceLotItem) => {
    const qty = Math.min(lot.quantityKg, 1000);
    const newOrder = placeOrder({
      lotId: lot.id,
      items: `${qty.toLocaleString()} kg ${lot.cropName} (Grade ${lot.grade})`,
      commodity: lot.cropName,
      quantityKg: qty,
      unitPrice: lot.price,
      totalPrice: qty * lot.price,
      buyerType: 'BULK_BUYER',
      buyerName: 'Verified Enterprise Buyer #BYR-DL-802',
      shippingAddress: 'Central Agrarian Depot, Terminal Dock 04',
      status: 'ESCROW_LOCKED',
      escrowLocked: true,
      createdAt: 'Just now',
      deliveryDate: 'Tomorrow, 08:00 AM',
    });

    setRfqNotice(`Direct Procurement Order ${newOrder.id} confirmed and locked into RBI Node Escrow at ₹${lot.price}/kg!`);
    setActiveTab('orders');
    setTimeout(() => setRfqNotice(null), 5000);
  };

  const handlePostTender = (e: React.FormEvent) => {
    e.preventDefault();
    const tenderId = `TND-${Math.floor(1000 + Math.random() * 9000)}`;
    setRfqNotice(`Institutional Demand Tender #${tenderId} for ${tenderVolume.toLocaleString()} kg ${tenderCrop} posted to regional FPO cooperatives!`);
    setTimeout(() => setRfqNotice(null), 5000);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <RoleGuard allowedRoles={['buyer']} portalName="Buyer & Vendor Desk">
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Link href="/" className="hover:text-zinc-900 dark:text-zinc-100 transition">{t.common.overview}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.buyer.breadcrumb}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.buyer.dashboard}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
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

        {/* Global Notification Banner */}
        {rfqNotice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{rfqNotice}</span>
          </div>
        )}

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'market'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-50'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Farmer Marketplace</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {filteredProduce.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rfqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'rfqs'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RFQ Bidding Desk</span>
            <span className="px-1.5 py-0.5 rounded-full bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-[10px]">
              {rfqs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-50'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Procurement Orders</span>
            <span className="px-1.5 py-0.5 rounded-full bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-[10px]">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tender')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'tender'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Demand Tender</span>
          </button>

          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'recurring'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Recurring Procurement</span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {recurringSchedules.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'subscriptions'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Business Premier</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold">
              {businessConfig.name.replace('Business ', '')}
            </span>
          </button>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-1">
                  <span>Procurement This Month</span>
                  <Receipt className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono">₹4.82 Lakh</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12.8% vs last month
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-1">
                  <span>Verified FPO Suppliers</span>
                  <Store className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono">38 Clusters</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  +6 accredited this month
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-1">
                  <span>Assayed Inventory Reach</span>
                  <Boxes className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono">18.6 Tonnes</div>
                <div className="text-[11px] text-zinc-500 mt-1">Across 12 WDRA Depots</div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-1">
                  <span>VRP Logistics Savings</span>
                  <Truck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono">₹38,400</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  Optimized multi-depot runs
                </div>
              </div>
            </div>

            {/* AI Intelligence & Recommended FPOs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Intelligence Outlook */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Market Demand Intelligence</h3>
                    <p className="text-xs text-zinc-500">Trained on APMC mandi arrivals & arrival velocity</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    AI Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Tomato (Hybrid Perishable)</div>
                      <div className="text-[11px] text-zinc-500">High procurement velocity • 4 FPO lots in radius</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-800">₹27.50 / kg</div>
                      <span className="text-[10px] text-emerald-700 font-semibold">↑ Rising</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Soybean (Yellow Oilseed)</div>
                      <div className="text-[11px] text-zinc-500">Bulk crushing demand • 12,000 kg available</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-blue-800">₹49.00 / kg</div>
                      <span className="text-[10px] text-blue-700 font-semibold">→ Steady</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Mustard / Rapeseed</div>
                      <div className="text-[11px] text-zinc-500">WDRA cold store deposit • High oil content</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-800">₹88.00 / kg</div>
                      <span className="text-[10px] text-emerald-700 font-semibold">↑ High Demand</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Farmer Clusters */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Accredited Supplier Directory</h3>
                    <p className="text-xs text-zinc-500">Direct FPO cooperatives with verified AGMARK grading</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('market')}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    View All <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Jaitpura Farmer Cooperative', crop: 'Tomato & Vegetables', distance: '18 km away', cap: '4,200 kg' },
                    { name: 'Vidarbha Farmer Collective', crop: 'Soybean & Pulses', distance: '26 km away', cap: '12,000 kg' },
                    { name: 'Malwa Sharbati Cluster', crop: 'Wheat Sharbati', distance: '34 km away', cap: '15,000 kg' },
                    { name: 'Phulera Mustard Producers', crop: 'Mustard / Rapeseed', distance: '41 km away', cap: '10,000 kg' },
                  ].map((sup, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{sup.name}</div>
                        <div className="text-[11px] text-zinc-500">{sup.crop} • {sup.distance} • Available: {sup.cap}</div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('rfqs');
                        }}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold rounded-lg transition"
                      >
                        Source
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Guaranteed Escrow Protocol Banner */}
            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>{t.buyer.guaranteedEscrowTitle}</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.buyer.guaranteedEscrowDesc}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: FARMER MARKETPLACE DIRECT SOURCING */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search produce lots by commodity, cluster, or depot..."
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <Store className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'vegetables', 'grains', 'oilseeds', 'pulses'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                      selectedCategory === cat
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProduce.map((lot) => (
                <div key={lot.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 transition flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{lot.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        AGMARK Grade {lot.grade}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">{lot.cropName}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{lot.cluster}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Available Volume</span>
                        <strong className="text-zinc-950 dark:text-zinc-50 font-mono">{lot.quantityKg.toLocaleString()} kg</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Asking Rate</span>
                        <strong className="text-emerald-800 font-mono text-sm">₹{lot.price} / kg</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleQuickSource(lot)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition text-center shadow-xs"
                    >
                      Instant Purchase
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLot(`${lot.id} (${lot.cropName} - ${lot.quantityKg}kg)`);
                        setOfferPrice(lot.price);
                        setActiveTab('rfqs');
                      }}
                      className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs font-semibold transition"
                    >
                      Bid RFQ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RFQ BIDDING DESK */}
        {activeTab === 'rfqs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{t.buyer.rfq}</h3>
                <p className="text-xs text-zinc-500">{t.buyer.rfqSubtitle}</p>
              </div>

              <form onSubmit={handleSubmitRfq} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t.buyer.targetLot}</label>
                  <select
                    value={selectedLot}
                    onChange={(e) => setSelectedLot(e.target.value)}
                    className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {listings.map((l) => (
                      <option key={l.id} value={`${l.id} (${l.cropName} - ${l.quantityKg}kg)`}>
                        {l.id} ({l.cropName} Grade {l.grade} - {l.quantityKg.toLocaleString('en-IN')} kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t.buyer.targetVolume}</label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={100}
                    value={targetVolume}
                    onChange={(e) => setTargetVolume(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t.buyer.offerRate}</label>
                  <input
                    type="number"
                    required
                    min={10}
                    step={0.25}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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

            {/* Negotiations Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{t.buyer.activeNegotiationsTitle}</h3>
                  <span className="text-[11px] font-mono text-zinc-500">{rfqs.length} {t.common.activeNegotiations}</span>
                </div>

                <div className="space-y-3">
                  {rfqs.map((rfq) => (
                    <div
                      key={rfq.id}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{rfq.crop}</span>
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

                      <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                        <span>{t.buyer.growerCluster} <strong>{rfq.sellerCluster}</strong></span>
                        <span>{t.buyer.volumeLabel} <strong className="font-mono">{rfq.volumeKg.toLocaleString()} {t.common.kg}</strong></span>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-zinc-500">
                          {t.buyer.askingRateLabel.replace('{asking}', String(rfq.askingRate))} <strong className="text-zinc-900 dark:text-zinc-100 font-mono">₹{rfq.bidRate}{t.common.perKg}</strong>
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
            </div>
          </div>
        )}

        {/* TAB 4: PROCUREMENT ORDERS & ESCROW RELEASE */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Procurement Orders & Manifests</h3>
                <p className="text-xs text-zinc-500">End-to-end tracked bulk purchase contracts with RBI node escrow</p>
              </div>
              <span className="text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full">
                {orders.length} Contracts Active
              </span>
            </div>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-zinc-950 dark:text-zinc-50">{ord.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'DISPATCHED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                      {ord.escrowLocked && (
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Escrow Protected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">{ord.items}</div>
                    <div className="text-[11px] text-zinc-500">
                      Destination: {ord.shippingAddress} • Placed: {ord.createdAt}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 text-xs">
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-500 block">Total Consideration</span>
                      <strong className="text-base font-bold text-zinc-950 dark:text-zinc-50 font-mono">₹{ord.totalPrice.toLocaleString()}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerInvoicePrintOrDownload(ord)}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                        title="Download GST Compliant Tax Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>GST Invoice</span>
                      </button>

                      {ord.status === 'ESCROW_LOCKED' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(ord.id, 'DISPATCHED');
                            setRfqNotice(`Order ${ord.id} marked as Dispatched! Logistics carrier notified.`);
                            setTimeout(() => setRfqNotice(null), 4000);
                          }}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Acknowledge Dispatch
                        </button>
                      )}

                      {ord.status === 'DISPATCHED' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(ord.id, 'DELIVERED');
                            setRfqNotice(`Order ${ord.id} verified at gate pass! Escrow payment released to farmer bank account.`);
                            setTimeout(() => setRfqNotice(null), 4000);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Verify & Release Escrow
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: POST DEMAND TENDER */}
        {activeTab === 'tender' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Publish Institutional Demand Tender</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Broadcast your volume requirements to verified farmer producer organizations across regional states.
              </p>
            </div>

            <form onSubmit={handlePostTender} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Target Commodity</label>
                <select
                  value={tenderCrop}
                  onChange={(e) => setTenderCrop(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Tomato">Tomato (Hybrid Perishable)</option>
                  <option value="Wheat">Wheat (Sharbati Storable)</option>
                  <option value="Mustard">Mustard / Rapeseed (High Oil)</option>
                  <option value="Soybean">Soybean (Commercial Grade)</option>
                  <option value="Potato">Potato (Cold Storage Lot)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Required Volume (kg)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={tenderVolume}
                  onChange={(e) => setTenderVolume(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Max Ceiling Rate (₹ / kg)</label>
                <input
                  type="number"
                  required
                  min={10}
                  step={0.5}
                  value={tenderMaxBudget}
                  onChange={(e) => setTenderMaxBudget(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Designated Delivery Hub / Terminal</label>
                <input
                  type="text"
                  required
                  value={tenderDeliveryDistrict}
                  onChange={(e) => setTenderDeliveryDistrict(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Requirement to FPO Network</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: RECURRING PROCUREMENT SCHEDULES */}
        {activeTab === 'recurring' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  Automated Recurring Procurement Schedules
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Pre-scheduled institutional standing orders fulfilled directly by regional FPO cooperatives with guaranteed cold-chain slots.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-700 self-start">
                Plan Level: {businessConfig.name}
              </span>
            </div>

            {/* Active Standing Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recurringSchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                        {sch.frequency} DISPATCH
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {sch.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                      {sch.commodity} • {sch.volumeKg.toLocaleString('en-IN')} kg
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Next Auto-Intake: <strong className="text-zinc-800 dark:text-zinc-200">{sch.nextDispatchDate}</strong>
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-semibold font-mono">FPO Multi-Sourced</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRfqNotice(`Triggered manual advance dispatch for standing schedule ${sch.id}!`);
                        setTimeout(() => setRfqNotice(null), 4000);
                      }}
                      className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 font-semibold transition text-[11px]"
                    >
                      Accelerate Lot
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule Setup Form */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs max-w-2xl">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Create New Automated Standing Procurement Order</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Commodity</label>
                  <input
                    type="text"
                    value={schedCrop}
                    onChange={(e) => setSchedCrop(e.target.value)}
                    className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Weekly Volume (kg)</label>
                  <input
                    type="number"
                    value={schedVolume}
                    onChange={(e) => setSchedVolume(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Cadence</label>
                  <select
                    value={schedFrequency}
                    onChange={(e) => setSchedFrequency(e.target.value as 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY')}
                    className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Dispatch Schedule Window</label>
                <input
                  type="text"
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  addRecurringSchedule({
                    commodity: schedCrop,
                    volumeKg: schedVolume,
                    frequency: schedFrequency,
                    nextDispatchDate: schedDate,
                  });
                  setRfqNotice(`Scheduled recurring procurement for ${schedVolume} kg ${schedCrop} successfully registered!`);
                  setTimeout(() => setRfqNotice(null), 4500);
                }}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Activate Standing Schedule</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: BUSINESS PREMIER SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="text-center max-w-3xl mx-auto space-y-2 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>FarmLink Business Premier — B2B Procurement Subscriptions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                Institutional Sourcing & Supply Chain Ladder
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Designed for restaurants, wholesalers, retail chains, food processors, and multi-location bulk enterprises.
              </p>
            </div>

            {/* B2B Pricing Plans Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: 'starter',
                  name: 'Business Starter',
                  monthly: '₹4,999',
                  annual: '₹49,990',
                  target: 'Small restaurants & retailers',
                  features: [
                    'Bulk procurement dashboard',
                    'Supplier discovery & comparison',
                    'Order management & tracking',
                    'Basic inventory coordination',
                    'Standard business support',
                  ],
                },
                {
                  id: 'growth',
                  name: 'Business Growth',
                  monthly: '₹9,999',
                  annual: '₹99,990',
                  target: 'Growing wholesalers & businesses',
                  popular: true,
                  features: [
                    'Everything in Starter',
                    'Multi-farmer sourcing coordination',
                    'Recurring procurement schedules',
                    'Advanced purchasing analytics',
                    'Enhanced supplier performance reports',
                    'Priority support',
                  ],
                },
                {
                  id: 'pro',
                  name: 'Business Pro',
                  monthly: '₹19,999',
                  annual: '₹1,99,990',
                  target: 'Large buyers & distributors',
                  features: [
                    'Everything in Growth',
                    'Multi-warehouse destination routing',
                    'Consolidated purchasing audit reports',
                    'Enhanced order allocation',
                    'Dedicated account support',
                    'Customizable business workflows',
                  ],
                },
                {
                  id: 'enterprise',
                  name: 'Enterprise',
                  monthly: '₹49,999+',
                  annual: 'Custom SLA',
                  target: 'Multi-location chains & food processors',
                  features: [
                    'Multi-state depot procurement',
                    'Custom ERP / SAP integrations',
                    'Dedicated account management desk',
                    'Contractual SLA commitments',
                    'Cold-chain dedicated fleet reservation',
                  ],
                },
              ].map((tier) => {
                const isActive = businessTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    className={`p-6 rounded-2xl flex flex-col justify-between transition relative ${
                      isActive
                        ? 'bg-white dark:bg-zinc-800 border-2 border-emerald-600 dark:border-emerald-500 shadow-xl ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold tracking-wide uppercase shadow-sm">
                        Recommended
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">{tier.name}</h3>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 mb-4">{tier.target}</p>

                      <div className="mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono">
                          {tier.monthly}
                          <span className="text-xs font-normal text-zinc-500 font-sans"> / month</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                          Annual: {tier.annual} (2 months free)
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 mb-6">
                        {tier.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isActive}
                      onClick={() => {
                        setBusinessPlan(tier.id as BusinessTier, 'monthly');
                        setRfqNotice(`Successfully upgraded to ${tier.name}! Procurement tools and standing schedules unlocked.`);
                        setTimeout(() => setRfqNotice(null), 5000);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 cursor-default'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs'
                      }`}
                    >
                      <span>{isActive ? 'Current Plan' : `Upgrade to ${tier.name}`}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </main>
      </RoleGuard>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
