'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import { useLanguage } from '../../context/LanguageContext';
import { useProduceStore, useOrderStore, useSubscriptionStore, ConsumerTier, ProduceLotItem, ProduceGrade } from '../../lib/store';
import RoleGuard from '../../components/RoleGuard';
import {
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Sparkles,
  Search,
  Filter,
  Plus,
  Minus,
  Lock,
  Package,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import OrderTrackingTimeline from '../../components/OrderTrackingTimeline';
import SmartBuyGuide from '../../components/SmartBuyGuide';
import { getOrderTelemetry } from '../../lib/services/orderTelemetry';
import InstitutionalPaymentModal from '../../components/InstitutionalPaymentModal';
import { initiateClientPayment } from '../../lib/client/checkout';

interface CartItem {
  lotId: string;
  cropName: string;
  grade: ProduceGrade;
  unitPrice: number;
  quantityKg: number;
  availableKg: number;
}

export default function ConsumerPortal() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  // Persistence Stores
  const { listings, decrementQuantity } = useProduceStore();
  const { orders, placeOrder, updateOrderStatus, advanceOrderStage, advanceAllOrders } = useOrderStore();
  const {
    consumerTier,
    consumerConfig,
    setConsumerPlan,
    calculateConsumerDeliveryFee,
  } = useSubscriptionStore();

  // Payment Gateway Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{
    amountInr: number;
    planName?: string;
    billingInterval?: 'monthly' | 'annual';
    title: string;
    targetTier?: ConsumerTier;
    onAuthorize?: () => void;
  }>({
    amountInr: 99,
    title: 'Consumer Premier Payment Gateway',
  });

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'shop' | 'cart' | 'orders' | 'membership'>('shop');
  const [showAiRadar, setShowAiRadar] = useState(false);

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State (stored in component with localStorage backup)
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [customQtyInputs, setCustomQtyInputs] = useState<Record<string, string>>({});

  React.useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem('farmlink_cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setCart(parsed);
          }
        }
      } catch {
        // ignore
      }
    });
  }, []);

  const syncCartToStorage = (updatedCart: Record<string, number>) => {
    try {
      localStorage.setItem('farmlink_cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new CustomEvent('farmlink_cart_updated'));
    } catch {
      // ignore
    }
  };

  // Checkout Form State
  const [buyerName, setBuyerName] = useState('Ananya Sen');
  const [buyerPhone, setBuyerPhone] = useState('+91 98301 22419');
  const [shippingAddress, setShippingAddress] = useState('Flat 402, Green Glen Layout, Bellandur, Bengaluru');
  const [paymentMethod, setPaymentMethod] = useState<'ESCROW_UPI' | 'ESCROW_CARD' | 'NET_BANKING'>('ESCROW_UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filtered Produce Listings
  const filteredProduce = useMemo(() => {
    return listings.filter((item) => {
      const isPubliclyActive = item.status === 'ACTIVE';
      const matchesCat =
        categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesGrade =
        gradeFilter === 'all' || item.grade.toLowerCase() === gradeFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.cropName.toLowerCase().includes(q) ||
        item.cluster.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      const hasStock = item.quantityKg > 0;
      return isPubliclyActive && matchesCat && matchesGrade && matchesSearch && hasStock;
    });
  }, [listings, categoryFilter, gradeFilter, searchQuery]);

  // Cart Calculations
  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(cart)
      .map(([lotId, qty]): CartItem | null => {
        const lot = listings.find((l) => l.id === lotId);
        if (!lot || qty <= 0) return null;
        return {
          lotId,
          cropName: lot.cropName,
          grade: lot.grade,
          unitPrice: lot.price,
          quantityKg: qty,
          availableKg: lot.quantityKg,
        };
      })
      .filter((item): item is CartItem => item !== null);
  }, [cart, listings]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantityKg, 0);
  }, [cartItems]);

  const deliveryCalc = useMemo(() => {
    if (cartItems.length === 0) return { finalFee: 0, discountApplied: 0, isFree: false };
    return calculateConsumerDeliveryFee(cartSubtotal, 25);
  }, [cartItems.length, calculateConsumerDeliveryFee, cartSubtotal]);

  const deliveryFee = deliveryCalc.finalFee;
  const escrowProtectionFee = 0; // Guaranteed zero markup
  const totalPayable = cartSubtotal + deliveryFee + escrowProtectionFee;

  // Cart Actions
  const handleAddToCart = (lotId: string, amount = 1) => {
    setCart((prev) => {
      const current = prev[lotId] || 0;
      const lot = listings.find((l) => l.id === lotId);
      const maxAvailable = lot ? lot.quantityKg : 999;
      const next = Math.min(maxAvailable, current + amount);
      const updated = { ...prev, [lotId]: next };
      syncCartToStorage(updated);
      return updated;
    });
  };

  const handleSetCartQty = (lotId: string, qty: number) => {
    setCart((prev) => {
      const lot = listings.find((l) => l.id === lotId);
      const maxAvailable = lot ? lot.quantityKg : 999;
      const clamped = Math.max(0, Math.min(maxAvailable, Math.floor(qty)));
      if (clamped <= 0) {
        const copy = { ...prev };
        delete copy[lotId];
        syncCartToStorage(copy);
        return copy;
      }
      const updated = { ...prev, [lotId]: clamped };
      syncCartToStorage(updated);
      return updated;
    });
  };

  const handleUpdateCartQty = (lotId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[lotId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[lotId];
        syncCartToStorage(copy);
        return copy;
      }
      const lot = listings.find((l) => l.id === lotId);
      const maxAvailable = lot ? lot.quantityKg : 999;
      const updated = { ...prev, [lotId]: Math.min(maxAvailable, next) };
      syncCartToStorage(updated);
      return updated;
    });
  };

  const handleInstantBuy = (lot: ProduceLotItem, customQty?: number) => {
    const qtyToBuy = customQty && customQty > 0 ? customQty : 5;
    handleAddToCart(lot.id, qtyToBuy);
    setActiveTab('cart');
  };

  // Final Order Placement & Escrow Lock
  const handleFinalConfirmOrder = () => {
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // 1. Decrement inventory from persistent produce store
      cartItems.forEach((item) => {
        decrementQuantity(item.lotId, item.quantityKg);
      });

      // 2. Create persistent orders in OrderStore
      const summaryItems = cartItems
        .map((i) => `${i.quantityKg} kg ${i.cropName} (Grade ${i.grade})`)
        .join(', ');

      const mainLot = cartItems[0];
      const newOrder = placeOrder({
        lotId: mainLot.lotId,
        items: summaryItems,
        commodity: mainLot.cropName,
        quantityKg: cartItems.reduce((acc, i) => acc + i.quantityKg, 0),
        unitPrice: mainLot.unitPrice,
        totalPrice: totalPayable,
        buyerType: 'CONSUMER',
        buyerName: buyerName.trim() || 'Verified Consumer',
        buyerPhone: buyerPhone.trim() || '+91 98000 00000',
        shippingAddress: shippingAddress.trim() || 'Direct Doorstep Delivery',
        status: 'ESCROW_LOCKED',
        escrowLocked: true,
        escrowTxHash: `ESCROW-ETX-${Date.now().toString().slice(-6)}`,
        createdAt: 'Just now',
        deliveryDate: 'Tomorrow by 11:00 AM',
      });

      // 3. Clear cart and switch to orders tab
      setCart({});
      syncCartToStorage({});
      setShowConfirmModal(false);
      setOrderNotice(
        t.consumer.orderConfirmedNotice.replace('{id}', newOrder.id).replace('{amount}', String(totalPayable))
      );
      setActiveTab('orders');
    } catch {
      setOrderNotice(t.consumer.orderFailedNotice);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setOrderNotice(null), 8000);
    }
  };

  const handleInitiateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    handleFinalConfirmOrder();
  };

  // Filter helper counts
  const totalActiveItems = listings.reduce((acc, l) => acc + (l.quantityKg > 0 ? 1 : 0), 0);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <RoleGuard allowedRoles={['consumer']} portalName="Consumer Hub & Marketplace">
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Link href="/" className="hover:text-zinc-900 dark:text-zinc-100 transition">
                {t.common.overview}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.nav.consumerRoleTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.consumer.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
              {t.consumer.subtitle}
            </p>
          </div>

          {/* Tab Navigation Pill with Mobile Horizontal Scroll */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-200/80 dark:bg-zinc-850 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-none text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'shop'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.consumer.browseTab}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                {totalActiveItems}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'cart'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{t.consumer.cartTab}</span>
              {cartItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white text-[10px]">
                  {cartItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t.consumer.ordersTab}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('membership')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'membership'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Consumer Premier</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold">
                {consumerConfig.name.replace('Consumer ', '')}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('shop');
                setShowAiRadar((prev) => !prev);
              }}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                showAiRadar && activeTab === 'shop'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI Timing Radar (beta)</span>
              {showAiRadar && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-emerald-900 text-[10px] font-bold">
                  Active
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Global Order Notification Banner */}
        {orderNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 font-medium flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">{t.common.success}:</span> {orderNotice}
            </div>
            <button
              onClick={() => setOrderNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              {t.common.dismiss}
            </button>
          </div>
        )}

        {/* TAB 1: SHOP / BROWSE PRODUCE */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {/* Interactive AI Shopping Advisor Feature Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Consumer Exclusive
                  </span>
                  <span className="text-zinc-400 text-xs">• 0% Middleman Margin</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Meet Your AI Farm-Gate Shopping & Deal Advisor (beta)
                </h3>
                <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                  Tell our interactive AI advisor what crop and quantity you need. It analyzes real farmer listings, AGMARK grades, harvest timestamps, and proves why you get the best deal.
                </p>
              </div>

              <div className="z-10 shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiRadar((prev) => !prev)}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-emerald-900/40"
                >
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>{showAiRadar ? 'Hide AI Timing Radar (beta)' : 'Explore AI Timing Radar (beta)'}</span>
                </button>
              </div>

              <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Price Intelligence: Smart Way to Buy for Consumers - only shown when user clicks on AI */}
            {showAiRadar && (
              <div className="transition-all duration-300 animate-in fade-in slide-in-from-top-4">
                <SmartBuyGuide onClose={() => setShowAiRadar(false)} />
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> {t.consumer.filterCategory}
                </span>
                {['all', 'vegetables', 'grains', 'pulses', 'oilseeds', 'fruits'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg capitalize transition border ${
                      categoryFilter === cat
                        ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grade Filter & Search */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-zinc-500 font-medium">{t.consumer.filterGrade}</span>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-2 py-1.5 text-zinc-800 dark:text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="all">{t.consumer.allGrades}</option>
                    <option value="a1">{t.common.grade.replace('{grade}', 'A1')}</option>
                    <option value="a2">{t.common.grade.replace('{grade}', 'A2')}</option>
                    <option value="b">{t.common.grade.replace('{grade}', 'B')}</option>
                  </select>
                </div>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.consumer.searchPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Produce Grid */}
            {filteredProduce.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{t.consumer.noProduceTitle}</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  {t.consumer.noProduceDesc}
                </p>
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setGradeFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg"
                >
                  {t.consumer.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProduce.map((lot) => {
                  const inCartQty = cart[lot.id] || 0;
                  return (
                    <div
                      key={lot.id}
                      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Lot Meta */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">
                            {lot.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              lot.grade === 'A1'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                                : 'bg-blue-50 text-blue-800 border-blue-200/60'
                            }`}
                          >
                            {t.common.grade.replace('{grade}', lot.grade)}
                          </span>
                        </div>

                        {/* Title & Price */}
                        <div className="flex items-baseline justify-between mt-1">
                          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">{lot.cropName}</h3>
                          <span className="text-lg font-mono font-extrabold text-zinc-950 dark:text-zinc-50">
                            ₹{lot.price}
                            <span className="text-xs text-zinc-500 font-normal">{t.common.perKg}</span>
                          </span>
                        </div>

                        {/* Cluster & Location details */}
                        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">{t.consumer.originCluster}</span>
                            <strong className="text-zinc-800 dark:text-zinc-200 text-right truncate max-w-[140px]">
                              {lot.cluster}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">{t.consumer.depotHub}</span>
                            <span className="text-zinc-800 dark:text-zinc-200 text-right truncate max-w-[140px]">
                              {lot.location}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">{t.consumer.availableStock}</span>
                            <span className="text-emerald-700 font-mono font-bold">
                              {lot.quantityKg.toLocaleString('en-IN')} {t.common.kg}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                        {inCartQty > 0 ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(lot.id, -1)}
                                aria-label="Decrease quantity"
                                className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 font-bold transition active:scale-95"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  max={lot.quantityKg}
                                  value={inCartQty}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val)) {
                                      handleSetCartQty(lot.id, val);
                                    }
                                  }}
                                  aria-label="Item quantity in kg"
                                  className="w-16 py-1 px-1.5 text-center text-xs sm:text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                />
                                <span className="text-xs text-zinc-500 font-medium">{t.common.kg}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(lot.id, 1)}
                                disabled={inCartQty >= lot.quantityKg}
                                aria-label="Increase quantity"
                                className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 font-bold disabled:opacity-50 transition active:scale-95"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                              <span>Total: ₹{(lot.price * inCartQty).toLocaleString('en-IN')}</span>
                              <button
                                type="button"
                                onClick={() => setActiveTab('cart')}
                                className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                              >
                                Go to Cart →
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Custom quantity input field */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-zinc-500 font-medium shrink-0">Qty:</span>
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="1"
                                  max={lot.quantityKg}
                                  placeholder="5"
                                  value={customQtyInputs[lot.id] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCustomQtyInputs((prev) => ({ ...prev, [lot.id]: val }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const num = parseInt(customQtyInputs[lot.id] || '5', 10);
                                      if (!isNaN(num) && num > 0) {
                                        handleAddToCart(lot.id, num);
                                      }
                                    }
                                  }}
                                  aria-label="Custom quantity in kg"
                                  className="w-full py-1.5 pl-2.5 pr-8 text-xs font-mono font-semibold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                />
                                <span className="absolute right-2 top-2 text-[10px] text-zinc-400 font-mono">
                                  {t.common.kg}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                                ≈ ₹{((lot.price * (parseInt(customQtyInputs[lot.id] || '5', 10) || 5))).toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const customVal = parseInt(customQtyInputs[lot.id] || '', 10);
                                  const qty = !isNaN(customVal) && customVal > 0 ? customVal : 5;
                                  handleAddToCart(lot.id, qty);
                                }}
                                className="flex-1 min-h-[42px] py-2 px-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>
                                  {customQtyInputs[lot.id] && parseInt(customQtyInputs[lot.id], 10) > 0
                                    ? `Add ${parseInt(customQtyInputs[lot.id], 10)} kg`
                                    : t.consumer.add5kg}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const customVal = parseInt(customQtyInputs[lot.id] || '', 10);
                                  const qty = !isNaN(customVal) && customVal > 0 ? customVal : 5;
                                  handleInstantBuy(lot, qty);
                                }}
                                className="min-h-[42px] px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-98"
                              >
                                {t.consumer.buyNow}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CART & ESCROW CHECKOUT */}
        {activeTab === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-emerald-700" />
                    <span>{t.consumer.basketTitle}</span>
                  </h2>
                  <span className="text-xs font-mono font-semibold text-zinc-500">
                    {t.consumer.basketCount.replace('{count}', String(cartItems.length)).replace('{s}', cartItems.length === 1 ? '' : 's')}
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <ShoppingCart className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t.consumer.basketEmpty}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {t.consumer.basketEmptyDesc}
                    </p>
                    <button
                      onClick={() => setActiveTab('shop')}
                      className="mt-4 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg"
                    >
                      {t.consumer.startShopping}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.lotId}
                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60"
                      >
                        <div className="flex-1 mr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.cropName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
                              {t.common.grade.replace('{grade}', item.grade)}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            ₹{item.unitPrice}{t.common.perKg} • Available: {item.availableKg} {t.common.kg}
                          </div>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.lotId, -1)}
                              aria-label="Decrease quantity"
                              className="px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold"
                            >
                              -
                            </button>
                            <div className="flex items-center px-1">
                              <input
                                type="number"
                                min="1"
                                max={item.availableKg}
                                value={item.quantityKg}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val)) {
                                    handleSetCartQty(item.lotId, val);
                                  }
                                }}
                                aria-label="Cart item quantity"
                                className="w-14 py-0.5 text-center text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-emerald-600 rounded"
                              />
                              <span className="text-[11px] text-zinc-400 font-mono pr-1">{t.common.kg}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.lotId, 1)}
                              disabled={item.quantityKg >= item.availableKg}
                              aria-label="Increase quantity"
                              className="px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 w-16 text-right">
                            ₹{(item.unitPrice * item.quantityKg).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Escrow Checkout Form */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs space-y-5 sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span>{t.consumer.escrowSummaryTitle}</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {t.consumer.t1SettlementBadge}
                  </span>
                </div>

                {/* Calculation Rows */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>{t.consumer.produceSubtotal}</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      ₹{cartSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span>{t.consumer.deliveryFee}</span>
                    </span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span className="flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.consumer.zeroCommission}:</span>
                    </span>
                    <span className="font-mono font-bold">₹{escrowProtectionFee}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
                    <span>{t.consumer.totalEscrowAmount}</span>
                    <span className="font-mono text-base text-emerald-900">
                      ₹{totalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Consumer Delivery Details Form */}
                <form onSubmit={handleInitiateCheckout} className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      {t.consumer.recipientName}
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full text-xs p-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      {t.consumer.mobileNumber}
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full text-xs p-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      {t.consumer.deliveryAddress}
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full text-xs p-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      {t.consumer.settlementMethod}
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ESCROW_UPI')}
                        className={`p-2 rounded-lg border text-left font-semibold transition ${
                          paymentMethod === 'ESCROW_UPI'
                            ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950'
                            : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {t.consumer.methodUpi}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ESCROW_CARD')}
                        className={`p-2 rounded-lg border text-left font-semibold transition ${
                          paymentMethod === 'ESCROW_CARD'
                            ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950'
                            : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {t.consumer.methodCard}
                      </button>
                    </div>
                  </div>

                  {/* Escrow Disclaimer Box */}
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t.consumer.escrowWorksTitle}</span>
                    </div>
                    <p>
                      {t.consumer.escrowWorksDesc.replace('{amount}', String(totalPayable))}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={cartItems.length === 0 || isSubmitting}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isSubmitting ? 'Securing Escrow...' : `Lock Escrow & Place Order (₹${totalPayable.toLocaleString('en-IN')})`}</span>
                    </button>

                    <Link
                      href="/checkout"
                      className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Open Dedicated Spatial Checkout</span>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS & ESCROW TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6">

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-700" />
                    <span>{t.consumer.ordersLedgerTitle}</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {t.consumer.ordersLedgerSubtitle}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg self-start sm:self-auto">
                  {t.consumer.activeRecordsCount.replace('{count}', String(orders.length))}
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t.consumer.noOrdersTitle}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {t.consumer.noOrdersDesc}
                  </p>
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="mt-4 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg"
                  >
                    {t.consumer.browseCatalogue}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 mt-4">
                  {orders.map((order) => (
                    <OrderTrackingTimeline
                      key={order.id}
                      order={order}
                      onUpdateStatus={(newStatus) => {
                        if (advanceOrderStage) {
                          advanceOrderStage(order.id);
                        } else {
                          updateOrderStatus(order.id, newStatus);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CONSUMER PREMIER MEMBERSHIPS & PREMIUM ZONE */}
        {activeTab === 'membership' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>FarmLink Consumer Premier  -  Simple & Affordable Memberships</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                Farm-to-Fork Freshness Privileges & Premium Zone
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Support regional smallholders directly while enjoying guaranteed delivery savings and AGMARK batch traceability.
              </p>
            </div>

            {/* UNLOCKED PREMIUM ZONE: Rendered when consumer has an active paid plan (Premier or Plus) */}
            {consumerTier !== 'basic' && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 text-white border border-emerald-500/30 shadow-2xl relative overflow-hidden mb-8">
                <div className="relative z-10 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          Premium Zone Active
                        </span>
                        <span className="text-xs font-bold text-zinc-300">
                          Enrolled: {consumerConfig.name}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight">
                        Your Consumer Freshness Privileges Are Live
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-xl">
                        All savings, early harvest drop access, and zero-broker delivery subsidies are automatically applied to your account.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-right shrink-0">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Active Delivery Subsidy
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-400">
                        {consumerConfig.freeDeliveryThresholdInr
                          ? `Free > ₹${consumerConfig.freeDeliveryThresholdInr}`
                          : `₹${consumerConfig.deliveryDiscountInr} Off / Order`}
                      </span>
                    </div>
                  </div>

                  {/* Active Perks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Truck className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Subsidized Delivery</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {consumerTier === 'plus'
                          ? '100% Free doorstep delivery on orders over ₹399 automatically locked at checkout.'
                          : 'Flat ₹40 instant discount deducted directly from cold-transit charges on every order.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Traceability Passport</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Inspect farm origin, farmer Aadhaar accreditation, harvest moisture assay, and optical grading certificates on all lots.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Early Harvest Priority</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Early reservation access to incoming FPO morning harvests before general open-market allocation.
                      </p>
                    </div>
                  </div>

                  {/* CTA back to shop */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-zinc-400">
                      Your membership status is verified with statutory digital receipt and active nodal protection.
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('shop')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
                    >
                      <ShoppingBag className="w-4 h-4 text-zinc-950" />
                      <span>Shop with Active Member Privileges</span>
                    </button>
                  </div>
                </div>

                <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            )}

            {/* Consumer Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  id: 'basic',
                  name: 'Consumer Basic',
                  monthly: '₹0',
                  annual: 'Free Forever',
                  target: 'Standard retail shopping',
                  features: [
                    'Browse farm-fresh catalog from certified growers',
                    'Direct zero-middleman produce orders',
                    'Standard GPS dispatch and route tracking',
                    'Transparent farm origin & harvest date details',
                  ],
                },
                {
                  id: 'premier',
                  name: 'Consumer Premier',
                  monthly: '₹99',
                  annual: '₹999 / year',
                  feeInr: 99,
                  target: 'Regular fresh grocery buyers',
                  popular: true,
                  features: [
                    'Flat ₹40 delivery discount on eligible orders',
                    'Personalized harvest arrival alerts & recommendations',
                    'Access to lot quality & traceability passport',
                    'Convenient repeat ordering & premier offers',
                    'Priority morning delivery slots (6 AM - 8 AM)',
                  ],
                },
                {
                  id: 'plus',
                  name: 'Consumer Plus',
                  monthly: '₹199',
                  annual: '₹1,999 / year',
                  feeInr: 199,
                  target: 'Healthy families & farm-to-table enthusiasts',
                  features: [
                    'Everything in Premier',
                    '100% free delivery on all orders over ₹399',
                    'Early-access harvest drops (reserve lots early)',
                    'Priority customer care & dedicated concierge',
                    'Enhanced promotional offers & seasonal harvest boxes',
                  ],
                },
              ].map((tier) => {
                const isActive = consumerTier === tier.id;
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
                        Most Popular
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">{tier.name}</h3>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            ACTIVE IN ZONE
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
                          {tier.annual}
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
                        if (tier.id === 'basic') {
                          setConsumerPlan('basic', 'monthly');
                          setOrderNotice('Switched to Consumer Basic free plan.');
                          setTimeout(() => setOrderNotice(null), 4000);
                          return;
                        }

                        const fee = tier.feeInr || (tier.id === 'plus' ? 199 : 99);
                        initiateClientPayment({
                          type: 'SUBSCRIPTION',
                          planCode: tier.id,
                          billingInterval: 'monthly',
                          customerName: buyerName || 'Consumer Member',
                          openFallbackModal: (modal) => {
                            setPaymentModalData({
                              amountInr: modal.amountInr || fee,
                              planName: modal.planName || tier.name,
                              billingInterval: modal.billingInterval || 'monthly',
                              title: modal.title,
                              targetTier: tier.id as ConsumerTier,
                              onAuthorize: () => {
                                setConsumerPlan(tier.id as ConsumerTier, 'monthly');
                                setOrderNotice(`Payment Authorized! Upgraded to ${tier.name}. Welcome to your Premium Zone!`);
                                setTimeout(() => setOrderNotice(null), 5000);
                              },
                            });
                            setPaymentModalOpen(true);
                          },
                          onSuccess: (paymentRes) => {
                            setConsumerPlan(tier.id as ConsumerTier, 'monthly');
                            setOrderNotice(`Payment Verified (${paymentRes.paymentId})! Welcome to ${tier.name} Premium Zone.`);
                            setTimeout(() => setOrderNotice(null), 5000);
                          },
                        });
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 cursor-default'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs cursor-pointer'
                      }`}
                    >
                      <span>{isActive ? 'Current Active Plan' : `Unlock ${tier.name}`}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </main>
      </RoleGuard>

      {/* Floating Sticky Mobile Checkout Bar (Visible on mobile when cart has items & in shop tab) */}
      {cartItems.length > 0 && activeTab === 'shop' && (
        <aside
          aria-label="Floating Mobile Basket Bar"
          className="fixed bottom-16 left-0 right-0 z-30 md:hidden p-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-xl animate-in slide-in-from-bottom"
        >
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div>
              <div className="text-[11px] text-zinc-500 font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in basket
              </div>
              <div className="text-sm font-extrabold font-mono text-zinc-950 dark:text-zinc-50">
                ₹{cartSubtotal.toLocaleString('en-IN')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className="min-h-[44px] px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t.consumer.cartTab || 'View Basket'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <InstitutionalPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={paymentModalData.title}
        amountInr={paymentModalData.amountInr}
        planName={paymentModalData.planName}
        billingInterval={paymentModalData.billingInterval}
        onSuccess={() => {
          if (paymentModalData.onAuthorize) {
            paymentModalData.onAuthorize();
          }
        }}
      />
    </div>
  );
}
