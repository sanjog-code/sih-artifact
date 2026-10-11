'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import { useLanguage } from '../../context/LanguageContext';
import { useProduceStore, useOrderStore, useRfqStore, useSubscriptionStore, FarmerTier } from '../../lib/store';
import RoleGuard from '../../components/RoleGuard';
import {
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  ChevronRight,
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
  MapPin,
  Navigation,
  Bell,
  Warehouse,
  UserCheck,
  Search,
} from 'lucide-react';
import { geocodeAddress } from '../../lib/ai/geocoding';
import NetIncomeCalculator from '../../components/NetIncomeCalculator';
import WeatherAdvisoryWidget from '../../components/WeatherAdvisoryWidget';
import KycVerificationModal from '../../components/KycVerificationModal';
import WarehouseSlotModal from '../../components/WarehouseSlotModal';
import VoiceListingButton from '../../components/VoiceListingButton';
import OpticalGradingChecklist from '../../components/OpticalGradingChecklist';
import { useAlertStore, useKycStore, useWarehouseStore } from '../../lib/store';
import { getCropMspFloor, getCropCategory, ICAR_CROPS, ALL_CROP_CATEGORIES } from '../../lib/cropTaxonomy';
import SmartListingGuide from '../../components/SmartListingGuide';
import PriceTrajectoryChart, { TrajectoryPoint } from '../../components/PriceTrajectoryChart';

interface AiForecastData {
  currentModalPrice: number;
  predictedNextPrice: number;
  predictedChangePercent?: number;
  demandSignal: string;
  mspFloor?: number;
  market?: string;
  district?: string;
  state?: string;
  fairPriceRange?: { min: number; max: number };
  factors?: string[];
  trajectory?: TrajectoryPoint[];
  horizons?: {
    d1: number;
    d3: number;
    d7: number;
    d14: number;
  };
  factorWeights?: Array<{
    name: string;
    impact: string;
    direction: 'positive' | 'negative' | 'neutral';
    percentage: number;
  }>;
  confidenceScore?: number;
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
  const { orders, updateOrderStatus, advanceOrderStage, advanceAllOrders } = useOrderStore();
  const { submitRfq } = useRfqStore();
  const {
    farmerTier,
    farmerConfig,
    setFarmerTier,
    calculateFarmerCommission,
  } = useSubscriptionStore();
  const { alerts, addAlert, toggleAlert } = useAlertStore();
  const { currentFarmerKyc } = useKycStore();
  const { slots } = useWarehouseStore();

  // Honest Features Modal States
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [newAlertCommodity, setNewAlertCommodity] = useState('Wheat');
  const [newAlertPrice, setNewAlertPrice] = useState(26);
  const [newAlertChannel, setNewAlertChannel] = useState<'WHATSAPP' | 'SMS'>('WHATSAPP');

  // Sell Form State
  const [commodity, setCommodity] = useState('Tomato');
  const [variety, setVariety] = useState('Hybrid Gold');
  const [quantity, setQuantity] = useState(2500);
  const [grade, setGrade] = useState<'A1' | 'A2' | 'B'>('A1');
  const [price, setPrice] = useState(28);
  const [cropCategoryFilter, setCropCategoryFilter] = useState<string>('all');
  const [cropSearchTerm, setCropSearchTerm] = useState<string>('');
  const [farmAddress, setFarmAddress] = useState('Khasra 412, Jaitpura Farm, Phulera Tehsil');
  const [pincode, setPincode] = useState('303338');
  const [farmCoordinates, setFarmCoordinates] = useState<{ lat: number; lng: number }>({ lat: 26.8722, lng: 75.2415 });
  const [detectingGps, setDetectingGps] = useState(false);
  const depot = 'Jaipur WDRA Terminal Hub';
  const deliveryMode = 'platform_logistics';

  const handleDetectGps = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDetectingGps(false);
          const coords = {
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
          };
          setFarmCoordinates(coords);
          setFarmAddress((prev) => prev.includes('GPS') ? prev : `${prev} (GPS: ${coords.lat}, ${coords.lng})`);
          setNotice(`GPS Coordinates acquired: ${coords.lat}, ${coords.lng}! Farm pickup locus updated.`);
          setTimeout(() => setNotice(null), 4000);
        },
        () => {
          setDetectingGps(false);
          // Fallback to geocoder
          const geocoded = geocodeAddress(farmAddress, pincode);
          setFarmCoordinates({ lat: geocoded.lat, lng: geocoded.lng });
          setNotice(`Resolved location via agrarian land registry to ${geocoded.locationName}`);
          setTimeout(() => setNotice(null), 4000);
        },
        { timeout: 6000 }
      );
    } else {
      const geocoded = geocodeAddress(farmAddress, pincode);
      setFarmCoordinates({ lat: geocoded.lat, lng: geocoded.lng });
    }
  };

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

  const [forecastStorageDays, setForecastStorageDays] = useState(0);

  const fetchAiAdvisory = async (cropName: string, daysHeld: number = forecastStorageDays) => {
    setLoadingAi(true);
    try {
      const res = await fetch(`/api/ai/forecast?commodity=${encodeURIComponent(cropName)}&state=RJ&district=Jaipur&storageDays=${daysHeld}`);
      const data = await res.json();
      if (data && data.success) {
        setAiData(data);
      } else {
        throw new Error(data?.error || 'Forecast retrieval error');
      }
    } catch {
      // Fallback
      setAiData({
        currentModalPrice: cropName === 'Mustard' ? 62.8 : cropName === 'Soybean' ? 49.8 : cropName === 'Tomato' ? 27.5 : 24.8,
        predictedNextPrice: cropName === 'Mustard' ? 63.4 : cropName === 'Soybean' ? 50.3 : cropName === 'Tomato' ? 28.2 : 25.1,
        predictedChangePercent: 1.2,
        demandSignal: 'HIGH_DEMAND',
        mspFloor: cropName === 'Wheat' ? 24.25 : cropName === 'Mustard' ? 59.5 : cropName === 'Soybean' ? 48.92 : 0,
        market: 'Jaipur APMC (Muhana Mandi)',
        district: 'Jaipur',
        state: 'Rajasthan',
        fairPriceRange: { min: 24.0, max: 27.0 },
        factors: ['Equilibrium wholesale demand', 'CCEA statutory MSP floor verified', 'APMC clearing trend positive'],
        trajectory: [
          { dayOffset: -14, label: '-14d', price: 23.9, isProjected: false },
          { dayOffset: -7, label: '-7d', price: 24.2, isProjected: false },
          { dayOffset: -3, label: '-3d', price: 24.5, isProjected: false },
          { dayOffset: 0, label: 'Today', price: 24.8, isProjected: false },
          { dayOffset: 1, label: '+1d', price: 25.1, isProjected: true, lowerCi: 24.25, upperCi: 25.9 },
          { dayOffset: 3, label: '+3d', price: 25.4, isProjected: true, lowerCi: 24.25, upperCi: 26.5 },
          { dayOffset: 7, label: '+7d', price: 25.9, isProjected: true, lowerCi: 24.25, upperCi: 27.3 },
          { dayOffset: 14, label: '+14d', price: 26.5, isProjected: true, lowerCi: 24.25, upperCi: 28.2 },
        ],
        horizons: { d1: 25.1, d3: 25.4, d7: 25.9, d14: 26.5 },
        factorWeights: [
          { name: 'Arrival Velocity & Clearing Rates', impact: '+4.8%', direction: 'positive', percentage: 78 },
          { name: 'Statutory CACP MSP Support Floor', impact: '+2.4%', direction: 'positive', percentage: 92 },
          { name: 'Storage Perishability Decay Rate', impact: '0%', direction: 'neutral', percentage: 10 },
          { name: 'Regional Arbitrage Spread', impact: '+1.8%', direction: 'positive', percentage: 64 },
        ],
        confidenceScore: 0.94,
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

    const mspFloor = getCropMspFloor(commodity);
    if (mspFloor && Number(price) < mspFloor) {
      setNotice(`Statutory MSP Guardrail Enforced: CACP minimum baseline for ${commodity} is ₹${mspFloor.toFixed(2)}/kg. Listing below MSP is strictly prohibited.`);
      setTimeout(() => setNotice(null), 6000);
      return;
    }

    const cat = getCropCategory(commodity);

    const coords = farmCoordinates || geocodeAddress(farmAddress, pincode);

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
      farmAddress,
      pincode,
      farmCoordinates: coords,
      status: 'ACTIVE',
      harvestDate: 'Today, Assayed',
      farmerName: 'Rameshwar Jat',
      description: `Grade ${grade} ${commodity} harvest, cleared under WDRA specifications with ${deliveryMode.replace('_', ' ')}. Farm Pickup: ${farmAddress}.`,
    });

    const estimatedComm = calculateFarmerCommission(Number(quantity) * Number(price));
    setNotice(
      `${t.farmer.lotPublishedNotice.replace('{id}', newLot.id).replace('{price}', String(price))} (Net Payout Est: ₹${estimatedComm.farmerReceives.toLocaleString('en-IN')})`
    );
    setActiveTab('listings');
    setTimeout(() => setNotice(null), 4500);
  };

  const handleAcceptOrder = (orderId: string) => {
    if (advanceOrderStage) {
      advanceOrderStage(orderId);
    } else {
      updateOrderStatus(orderId, 'IN_TRANSIT');
    }
    setNotice(`Order #${orderId} accepted & scheduled! Telemetry node updated.`);
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <RoleGuard allowedRoles={['farmer']} portalName="Farmer Hub">
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Breadcrumb & Accreditation Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Link href="/" className="hover:text-zinc-900 dark:text-zinc-100 transition">{t.common.overview}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.farmer.breadcrumb}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.farmer.dashboard}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {t.farmer.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setKycModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-700 shadow-xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>KYC: {currentFarmerKyc?.kycStatus || 'VERIFIED'}</span>
            </button>
            <button
              onClick={() => setWarehouseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold border border-blue-300 dark:border-blue-700 shadow-xs transition-colors"
            >
              <Warehouse className="w-3.5 h-3.5 text-blue-600" />
              <span>Book Depot Slot ({slots.length})</span>
            </button>
            <button
              onClick={() => setAlertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-700 shadow-xs transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Mandi Price Alerts ({alerts.length})</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-medium border border-zinc-200 dark:border-zinc-800">
              <IndianRupee className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none">
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
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:text-zinc-100'
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


            {/* Quick Actions & AI Barometer Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Opportunity Card */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">AI Selling Opportunity</h3>
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

                  <div className="grid grid-cols-3 gap-3 text-center bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Current Modal</span>
                      <span className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 font-mono mt-0.5 block">₹24.27/kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Projected 72h</span>
                      <span className="text-base font-extrabold text-emerald-800 font-mono mt-0.5 block">₹24.41/kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Statutory MSP</span>
                      <span className="text-base font-extrabold text-zinc-700 dark:text-zinc-300 font-mono mt-0.5 block">₹22.75/kg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4 flex flex-wrap gap-2">
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
                    className="px-4 py-2 border border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition"
                  >
                    View Buyer Requirements
                  </button>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    Kisan Quick Controls
                  </h3>
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('sell')}
                      className="w-full text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <PlusCircle className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="text-xs font-bold text-zinc-950 dark:text-zinc-50">Declare Harvest Lot</div>
                          <div className="text-[11px] text-zinc-500">Self-declare crop, volume & grade</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="w-full text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <PackageCheck className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="text-xs font-bold text-zinc-950 dark:text-zinc-50">Manage Orders ({orders.length})</div>
                          <div className="text-[11px] text-zinc-500">Accept and dispatch buyer pickups</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('forecast')}
                      className="w-full text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="text-xs font-bold text-zinc-950 dark:text-zinc-50">Mandi Price Simulator</div>
                          <div className="text-[11px] text-zinc-500">Evaluate holding vs immediate sale</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('payments')}
                      className="w-full text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <IndianRupee className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="text-xs font-bold text-zinc-950 dark:text-zinc-50">T+1 Bank Escrow Payout</div>
                          <div className="text-[11px] text-zinc-500">Withdraw cleared proceeds</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Helpline: <strong>1800-180-1551</strong> (Kisan Toll-Free)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather & Spraying Advisory Widget (Real Open-Meteo Telemetry) */}
            <WeatherAdvisoryWidget crop={commodity} lat={farmCoordinates.lat} lng={farmCoordinates.lng} />

            {/* Smart Harvest Listing Guide: Sell Now vs WDRA Vault Hold */}
            <SmartListingGuide />

            {/* Farmer Net-Income & Mandi Comparison Calculator */}
            <NetIncomeCalculator initialCommodity={commodity} initialPriceKg={price} />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SELL CROP (HARVEST DECLARATION FORM) */}
        {/* ============================================================== */}
        {activeTab === 'sell' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                    {t.farmer.declare}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {t.farmer.declareSubtitle}
                  </p>
                </div>
                <VoiceListingButton
                  onTranscriptParsed={(parsed) => {
                    if (parsed.cropName) setCommodity(parsed.cropName);
                    if (parsed.quantityKg) setQuantity(parsed.quantityKg);
                    if (parsed.price) setPrice(parsed.price);
                    if (parsed.grade) setGrade(parsed.grade.replace('Grade ', '') as 'A1' | 'A2' | 'B');
                    setNotice(`Voice declaration populated: ${parsed.cropName || commodity} • ${parsed.quantityKg || quantity} kg @ ₹${parsed.price || price}/kg`);
                    setTimeout(() => setNotice(null), 4000);
                  }}
                />
              </div>

              <form onSubmit={handleCreateListing} className="space-y-5">
                {/* 1. Quick Crop Selector */}
                {/* 1. Official Government of India Registered Crop Selector */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      1. Select Crop / Commodity (Official ICAR / CCEA Registered)
                    </label>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 font-semibold">
                      Selected: <strong>{commodity}</strong> {getCropMspFloor(commodity) ? `• MSP: ₹${getCropMspFloor(commodity)}/kg` : ''}
                    </span>
                  </div>

                  {/* Category Filter Pills & Search Bar */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={cropSearchTerm}
                          onChange={(e) => setCropSearchTerm(e.target.value)}
                          placeholder="Search any registered crop (e.g. Cotton, Ragi, Turmeric, Ginger, Apple, Chana, Mustard)..."
                          className="w-full text-xs pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                      {cropSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setCropSearchTerm('')}
                          className="text-xs text-zinc-400 hover:text-zinc-700 px-2 py-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'All Crops' },
                        { id: 'cereals', label: 'Grains & Cereals' },
                        { id: 'pulses', label: 'Pulses' },
                        { id: 'oilseeds', label: 'Oilseeds' },
                        { id: 'vegetables', label: 'Vegetables' },
                        { id: 'fruits', label: 'Fruits' },
                        { id: 'spices', label: 'Spices' },
                        { id: 'commercial', label: 'Commercial' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCropCategoryFilter(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                            cropCategoryFilter === tab.id
                              ? 'bg-zinc-900 text-white dark:bg-emerald-500 dark:text-zinc-950 shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable Registered Crops Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1 border border-zinc-100 dark:border-zinc-800/80 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40">
                    {ICAR_CROPS.filter((c) => {
                      const matchesCategory =
                        cropCategoryFilter === 'all' || c.category === cropCategoryFilter;
                      const matchesSearch =
                        cropSearchTerm.trim() === '' ||
                        c.name.toLowerCase().includes(cropSearchTerm.toLowerCase()) ||
                        c.hindiName.toLowerCase().includes(cropSearchTerm.toLowerCase()) ||
                        c.categoryLabel.toLowerCase().includes(cropSearchTerm.toLowerCase());
                      return matchesCategory && matchesSearch;
                    }).map((c) => {
                      const isSelected = commodity.toLowerCase() === c.name.toLowerCase();
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCommodity(c.name);
                            setVariety(`Certified ${c.name} (ICAR / AGMARK Standard)`);
                            if (c.mspFloorKg && price < c.mspFloorKg) {
                              setPrice(c.mspFloorKg);
                            }
                          }}
                          className={`p-2 rounded-xl border text-xs font-bold transition text-left flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                              : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          <span
                            className={`text-[9px] font-normal block truncate mt-0.5 ${
                              isSelected ? 'text-emerald-200' : 'text-zinc-400'
                            }`}
                          >
                            {c.hindiName.split(' ')[0]} • {c.categoryLabel.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Quantity with Quick Increment Pills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      2. Total Harvest Quantity (kg)
                    </label>
                    <div className="flex gap-1.5">
                      {[500, 1000, 2500, 5000].map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => setQuantity(inc)}
                          className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          {inc.toLocaleString('en-IN')} kg
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-sm p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                {/* 3. Visual Quality Tier Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    3. AGMARK Quality Grade
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'A1', title: 'Grade A1', desc: 'Premium Export (≤1% defect)' },
                      { id: 'A2', title: 'Grade A2', desc: 'Standard Wholesale (≤3% defect)' },
                      { id: 'B', title: 'Grade B', desc: 'Processing / Fair Avg (≤6% defect)' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGrade(g.id as 'A1' | 'A2' | 'B')}
                        className={`p-3 rounded-xl border text-left transition ${
                          grade === g.id
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600'
                            : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="font-extrabold text-xs">{g.title}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 leading-snug">{g.desc}</div>
                      </button>
                    ))}
                  </div>
                  {/* Human-Assisted Optical Assay Checklist */}
                  <div className="mt-4">
                    <OpticalGradingChecklist
                      commodity={commodity}
                      onGradeAssayed={(result) => {
                        setGrade(result.grade.replace('Grade ', '') as 'A1' | 'A2' | 'B');
                        setNotice(`AGMARK Inspector Certified: ${result.grade} (Moisture ${result.moisturePercent}%, Defect ${result.defectPercent}%)`);
                        setTimeout(() => setNotice(null), 4000);
                      }}
                    />
                  </div>
                </div>

                {/* 4. Expected Price with Instant AI Mandi Rate */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      4. Asking Price (₹/kg)
                    </label>
                    {aiData && (
                      <button
                        type="button"
                        onClick={() => setPrice(aiData.predictedNextPrice)}
                        className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Use AI Rate: ₹{aiData.predictedNextPrice}/kg
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step={0.5}
                    min={getCropMspFloor(commodity) || 5}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-sm p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                  {getCropMspFloor(commodity) ? (
                    <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center justify-between">
                      <span>CACP Statutory MSP Floor: ₹{getCropMspFloor(commodity)?.toFixed(2)}/kg (Hard Floor)</span>
                      <span className="text-emerald-700 dark:text-emerald-400">Distress-Selling Guardrail Active</span>
                    </div>
                  ) : null}
                  {/* Transparent Single-Digit Commission Breakdown */}
                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-950 dark:text-emerald-200">
                      <span>Estimated Total Harvest Value ({quantity.toLocaleString('en-IN')} kg):</span>
                      <span className="font-mono text-sm">₹{(quantity * price).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 mt-1 text-[11px]">
                      <span>FarmLink Platform Fee ({farmerConfig.name} Plan • {(farmerConfig.commissionRate * 100)}%):</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-200">-₹{Math.round(quantity * price * farmerConfig.commissionRate).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-extrabold pt-1.5 mt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/40">
                      <span>Direct Farmer Escrow Payout (T+1):</span>
                      <span className="font-mono text-sm">₹{Math.round(quantity * price * (1 - farmerConfig.commissionRate)).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">
                      *Zero monthly subscription. Marketplace access is 100% free. Platform fee is deducted only upon verified completed escrow release.
                    </p>
                  </div>
                  {aiData && (
                    <div className="mt-1 text-[11px] text-zinc-500 flex items-center justify-between">
                      <span>Statutory MSP Floor: ₹{aiData.mspFloor || 22.75}/kg</span>
                      <span className="text-emerald-700 font-semibold">100% Escrow Protection</span>
                    </div>
                  )}
                </div>

                {/* 5. Farm Location & Logistics Pickup Locus */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>5. Farm Location & Pickup Address (For Route Optimization)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectGps}
                      disabled={detectingGps}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 transition flex items-center gap-1"
                    >
                      <Navigation className={`w-3 h-3 ${detectingGps ? 'animate-spin' : ''}`} />
                      <span>{detectingGps ? 'Detecting GPS...' : 'Use Farm GPS'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={farmAddress}
                        onChange={(e) => {
                          setFarmAddress(e.target.value);
                          const g = geocodeAddress(e.target.value, pincode);
                          setFarmCoordinates({ lat: g.lat, lng: g.lng });
                        }}
                        placeholder="Village, Khasra/Plot No., Tehsil, District"
                        className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => {
                          setPincode(e.target.value);
                          const g = geocodeAddress(farmAddress, e.target.value);
                          setFarmCoordinates({ lat: g.lat, lng: g.lng });
                        }}
                        placeholder="PIN Code (e.g. 303338)"
                        maxLength={6}
                        className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                    <span>Geocoded Pickup Coordinates:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {farmCoordinates.lat.toFixed(4)}° N, {farmCoordinates.lng.toFixed(4)}° E
                    </span>
                  </div>
                </div>

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
                    className="py-3 px-5 border border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs sm:text-sm font-semibold transition"
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
                <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
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
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500">
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
                      className={`bg-white dark:bg-zinc-900 rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between ${
                        isPaused ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50/20 opacity-80' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded font-bold">
                            {lot.id}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isPaused
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : lot.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}>
                            {lot.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mt-1">
                          {lot.cropName}
                        </h3>
                        <div className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 font-mono mt-0.5">
                          ₹{lot.price} <span className="text-xs text-zinc-500 font-normal">/ kg</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Available:</span>
                            <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{lot.quantity}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Grade:</span>
                            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">AGMARK Grade {lot.grade}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Warehouse:</span>
                            <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">{lot.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Declared:</span>
                            <span className="text-zinc-900 dark:text-zinc-100">{lot.harvestDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
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
                              : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition"
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
              <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
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
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded font-bold">
                        {req.id}
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        Escrow Ready
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mt-1">
                      {req.commodity}
                    </h3>
                    <div className="text-xs text-zinc-500 font-semibold">{req.buyer}</div>

                    <div className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono mt-2">
                      ₹{req.targetPrice} <span className="text-xs text-zinc-500 font-normal">/ kg Target</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Volume Required:</span>
                        <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{req.volume}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Intake Depot:</span>
                        <span className="text-zinc-900 dark:text-zinc-100">{req.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Timeline:</span>
                        <span className="text-zinc-900 dark:text-zinc-100">{req.deliveryDate}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 mt-3 p-2 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <strong>Specs:</strong> {req.specs}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
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
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                      Submit Offer to {selectedReq.buyer}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedReq(null)}
                      className="text-zinc-400 hover:text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Declare volume to fulfill for <strong>{selectedReq.commodity}</strong> at {selectedReq.location}.
                  </p>

                  <form onSubmit={handleSubmitOffer} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                        Supply Quantity (kg)
                      </label>
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={offerVolume}
                        onChange={(e) => setOfferVolume(Number(e.target.value))}
                        className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 font-mono text-zinc-900 dark:text-zinc-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                        Offered Rate (₹/kg)
                      </label>
                      <input
                        type="number"
                        step={0.25}
                        min={10}
                        value={offerRate}
                        onChange={(e) => setOfferRate(Number(e.target.value))}
                        className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 font-mono text-zinc-900 dark:text-zinc-100"
                        required
                      />
                    </div>

                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] text-zinc-600 dark:text-zinc-400 flex justify-between">
                      <span>Total Value:</span>
                      <strong className="text-zinc-950 dark:text-zinc-50 font-mono">
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
                        className="py-2.5 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300"
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
              <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                Harvest Orders & Fulfilment
              </h2>
              <p className="text-xs text-zinc-500">
                Track pending institutional and consumer orders, accept lots for dispatch, and verify escrow clearing.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500">
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
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded font-bold">
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

                        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                          {ord.items}
                        </h3>

                        <div className="text-xs text-zinc-600 dark:text-zinc-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          <span>Buyer: <strong>{ord.buyerName}</strong> ({ord.buyerType})</span>
                          <span>Value: <strong className="font-mono text-zinc-950 dark:text-zinc-50">₹{ord.totalPrice.toLocaleString('en-IN')}</strong></span>
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header with Live Telemetry Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-bold">
                      Live APMC Telemetry • 15m Cache Synchronized
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight mt-1">
                    {t.farmer.aiForecastTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {aiData?.market ? `${aiData.market}, ${aiData.district}, ${aiData.state}` : 'Jaipur APMC (Muhana Mandi), Rajasthan'} • Calibrated multi-lag auto-regressive model trained on 737,392 APMC clearing records.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('farmlink_open_ai', {
                            detail: {
                              query: `Price prediction and trajectory forecast for ${commodity} in the next 3 months`,
                              autoSend: true,
                            },
                          })
                        );
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition text-xs font-bold flex items-center gap-2 shadow-xs active:scale-95"
                    title="Launch real-time Gemini AI Conversational Copilot for this crop"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Talk to Gemini Kisan Copilot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchAiAdvisory(commodity, forecastStorageDays)}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:bg-zinc-900/60 transition text-xs font-semibold flex items-center gap-2 active:scale-95 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin text-emerald-600' : ''}`} />
                    <span>Recalibrate Live Forecast</span>
                  </button>
                </div>
              </div>

              {/* Commodity Selector Bar (Extended to 8 crops) */}
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-zinc-500 block mb-2">
                  Select Crop Commodity for Deep Valuation:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {[
                    'Tomato',
                    'Wheat',
                    'Mustard',
                    'Soybean',
                    'Potato',
                    'Onion',
                    'Chana',
                    'Maize',
                  ].map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => {
                        setCommodity(crop);
                        fetchAiAdvisory(crop, forecastStorageDays);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        commodity === crop
                          ? 'bg-zinc-950 text-white dark:bg-emerald-500 dark:text-zinc-950 border-zinc-950 dark:border-emerald-500 shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Duration Simulation Slider */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                      Warehouse Holding & Perishability Simulation
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      {forecastStorageDays === 0 ? 'Fresh Spot (0 Days)' : `${forecastStorageDays} Days Held`}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Simulate how holding produce in accredited cold-storage or warehouses influences expected valuation vs decay.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-stretch sm:self-auto min-w-[220px]">
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="1"
                    value={forecastStorageDays}
                    onChange={(e) => {
                      const days = Number(e.target.value);
                      setForecastStorageDays(days);
                      fetchAiAdvisory(commodity, days);
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-extrabold text-zinc-950 dark:text-zinc-100 min-w-[36px] text-right">
                    {forecastStorageDays}d
                  </span>
                </div>
              </div>

              {aiData && (
                <div className="space-y-6">
                  {/* Valuation Primary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">{t.farmer.currentModal}</span>
                      <span className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono mt-1 block">
                        ₹{aiData.currentModalPrice.toFixed(2)}/kg
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">Live APMC Spot Rate</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">{t.farmer.aiPredicted}</span>
                      <span className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-400 font-mono mt-1 block">
                        ₹{aiData.predictedNextPrice.toFixed(2)}/kg
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                        {aiData.predictedChangePercent !== undefined
                          ? `${aiData.predictedChangePercent >= 0 ? '+' : ''}${aiData.predictedChangePercent}% predicted shift`
                          : 'Optimal Clearing Target'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">MSP Statutory Floor</span>
                      <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-200 font-mono mt-1 block">
                        {aiData.mspFloor && aiData.mspFloor > 0 ? `₹${aiData.mspFloor.toFixed(2)}/kg` : 'Non-MSP'}
                      </span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                        {aiData.mspFloor && aiData.mspFloor > 0 ? 'CCEA Statutory Floor Guarantee' : 'Open Market Price'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">{t.farmer.demandSignal}</span>
                      <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-mono">
                        {aiData.demandSignal}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-1">High Buyer Inflow</span>
                    </div>
                  </div>

                  {/* Dynamic SVG Price & Demand Horizon Chart */}
                  <PriceTrajectoryChart
                    commodity={commodity}
                    currentModalPrice={aiData.currentModalPrice}
                    predictedPrice={aiData.predictedNextPrice}
                    mspFloor={aiData.mspFloor || 0}
                    trajectory={aiData.trajectory || []}
                    demandSignal={aiData.demandSignal}
                    confidenceScore={aiData.confidenceScore || 0.94}
                  />

                  {/* Factor Weight Decomposition Bars */}
                  {aiData.factorWeights && aiData.factorWeights.length > 0 && (
                    <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          AI Valuation Driver Decomposition & Elasticity Weights
                        </h3>
                        <span className="text-[10px] font-mono text-zinc-500">Normalised Ridge Lag Coefficients</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aiData.factorWeights.map((fw, i) => (
                          <div key={i} className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{fw.name}</span>
                              <span
                                className={`font-mono text-xs font-bold ${
                                  fw.direction === 'positive'
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : fw.direction === 'negative'
                                    ? 'text-rose-700 dark:text-rose-400'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {fw.impact}
                              </span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  fw.direction === 'positive'
                                    ? 'bg-emerald-500'
                                    : fw.direction === 'negative'
                                    ? 'bg-rose-500'
                                    : 'bg-zinc-400'
                                }`}
                                style={{ width: `${fw.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explainability Breakdown Bullet List */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                      AI Explainable Valuation Rationale & Market Evidence
                    </h3>
                    <div className="space-y-2">
                      {aiData.factors?.map((f, i) => (
                        <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Model Accuracy & Verification Badge */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <strong>Model Confidence & Verification:</strong> Out-of-sample Test Mean Absolute Error (MAE):{' '}
                      <span className="font-mono font-bold">
                        ₹{aiData.modelMetrics?.testMaeKg ?? 0.33} / kg
                      </span>{' '}
                      ({commodity}) • {aiData.modelMetrics?.datasetRecords?.toLocaleString() ?? '737,392'} APMC clearing records verified.
                    </div>
                    <span className="text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-900 px-2.5 py-0.5 rounded text-emerald-900 dark:text-emerald-200">
                      Ridge Auto-Regressive Multi-Lag
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
              <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                Logistics & Active Shipment Telemetry
              </h2>
              <p className="text-xs text-zinc-500">
                Live dispatch manifests, cold-chain temperature sensors, and vehicle route milestones.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
              {/* Manifest Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                    ACTIVE SHIPMENT • DISPATCH #MNF-2891
                  </span>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mt-1">
                    Route: Jaitpura Cluster → Jaipur North WDRA Hub
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xs text-zinc-500">Vehicle Assigned</div>
                  <div className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">RJ-14-GA-8921 (3T Refrig)</div>
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
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500">
                  <div className="text-xs font-bold">4. Depot Intake</div>
                  <div className="text-[11px] mt-0.5">Pending Delivery</div>
                </div>
              </div>

              {/* Sensor Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300">
                <div>
                  <span className="text-zinc-500 block">Cold-Chain Temperature:</span>
                  <strong className="text-zinc-950 dark:text-zinc-50 font-mono">5.2°C (Optimal Range 4-8°C)</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Relative Humidity:</span>
                  <strong className="text-zinc-950 dark:text-zinc-50 font-mono">88% (Arrhenius Safe)</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Driver Contact:</span>
                  <strong className="text-zinc-950 dark:text-zinc-50">Gurpreet Singh (+91 98291 04921)</strong>
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-6">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                    Available Escrow Balance
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono mt-1">
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

              {/* FarmLink Farmer Premier Commission Tier Card */}
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-500/20">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>FarmLink Farmer Premier</span>
                    </div>
                    <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">
                      Current Plan: {farmerConfig.name} ({farmerConfig.commissionRate * 100}% Commission)
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Zero monthly subscription. Marketplace access is 100% free. Platform charge applies only upon completed sale.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-700 self-start">
                    Monthly Fee: ₹0 (FREE)
                  </span>
                </div>

                {/* Tier Selector Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
                  {[
                    { id: 'basic', name: 'Basic', fee: '5%', desc: 'Standard Listing & Escrow' },
                    { id: 'premier', name: 'Premier', fee: '4%', desc: 'Demand Telemetry & Priority Aggregation' },
                    { id: 'premier_pro', name: 'Premier Pro', fee: '3%', desc: 'AI Mandi Forecasts & Promoted Placement' },
                    { id: 'premier_elite', name: 'Premier Elite', fee: '2%', desc: 'Institutional Matching & 2% Lowest Rate' },
                  ].map((tier) => {
                    const isSelected = farmerTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => {
                          setFarmerTier(tier.id as FarmerTier);
                          setNotice(`Updated Farmer Premier Tier to ${tier.name} (${tier.fee} commission on completed sales).`);
                          setTimeout(() => setNotice(null), 4000);
                        }}
                        className={`p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-white dark:bg-zinc-800 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/40 shadow-xs'
                            : 'bg-white/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-950 dark:text-zinc-50">{tier.name}</span>
                          <span className="text-xs font-mono font-extrabold text-emerald-700 dark:text-emerald-400">{tier.fee}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">{tier.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Example Calculator */}
                <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                    Transparent Example on a ₹10,000 Completed Sale:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                    <div>Basic (5%): <strong className="text-emerald-700 dark:text-emerald-300">₹9,500 net</strong></div>
                    <div>Premier (4%): <strong className="text-emerald-700 dark:text-emerald-300">₹9,600 net</strong></div>
                    <div>Pro (3%): <strong className="text-emerald-700 dark:text-emerald-300">₹9,700 net</strong></div>
                    <div>Elite (2%): <strong className="text-emerald-700 dark:text-emerald-300">₹9,800 net</strong></div>
                  </div>
                </div>
              </div>

              {/* Linked Bank Account Card */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between mb-6 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center font-bold">
                    SBI
                  </div>
                  <div>
                    <div className="font-bold text-zinc-950 dark:text-zinc-50">State Bank of India (Primary PM-KISAN A/C)</div>
                    <div className="text-[11px] text-zinc-500 font-mono">A/C: **********4819 • IFSC: SBIN0004921</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Transaction Ledger */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
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
                      className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-950 dark:text-zinc-50">{tx.lot}</div>
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
                <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  Kisan Telephony & Agrarian Support
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Frequently Asked Questions
                </h3>

                {[
                  {
                    q: 'How does the Minimum Support Price (MSP) protection work?',
                    a: 'Fasal Matrix strictly verifies government CCEA statutory floors. If bids or market clearing prices drop below the official MSP floor, the platform prohibits sub-floor contracts and offers accredited WDRA storage pledge finance instead.',
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
                  <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50 mb-1">{item.q}</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      </RoleGuard>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <KycVerificationModal isOpen={kycModalOpen} onClose={() => setKycModalOpen(false)} />
      <WarehouseSlotModal
        isOpen={warehouseModalOpen}
        onClose={() => setWarehouseModalOpen(false)}
        defaultCommodity={commodity}
        defaultVolumeKg={quantity}
      />

      {/* Real Price Alert Modal */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">Mandi Price Alert Trigger</h3>
              </div>
              <button
                type="button"
                onClick={() => setAlertModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 mb-4">
              Receive automated SMS or WhatsApp notifications when Agmarknet modal clearing rates cross your threshold.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addAlert({
                  commodity: newAlertCommodity,
                  targetPriceKg: Number(newAlertPrice),
                  condition: 'CROSSES_ABOVE',
                  channel: newAlertChannel,
                  farmerPhone: '+91 98290 44102',
                  active: true,
                });
                setAlertModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Commodity</label>
                <select
                  value={newAlertCommodity}
                  onChange={(e) => setNewAlertCommodity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium outline-none"
                >
                  <option value="Wheat">Wheat (Kanak)</option>
                  <option value="Tomato">Tomato (Tamatar)</option>
                  <option value="Mustard">Mustard (Sarson)</option>
                  <option value="Potato">Potato (Aloo)</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Gram">Gram / Chana</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Target Price (₹/kg)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newAlertPrice}
                  onChange={(e) => setNewAlertPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Dispatch Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAlertChannel('WHATSAPP')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      newAlertChannel === 'WHATSAPP'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    WhatsApp Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAlertChannel('SMS')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      newAlertChannel === 'SMS'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Direct SMS
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAlertModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Activate Alert
                </button>
              </div>
            </form>

            {alerts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-500 uppercase">Active Subscriptions</span>
                <div className="space-y-2 mt-2 max-h-36 overflow-y-auto">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white">{al.commodity}</span> &gt; ₹{al.targetPriceKg}/kg
                        <span className="ml-2 text-[10px] text-zinc-400 font-mono">({al.channel})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAlert(al.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          al.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        {al.active ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
