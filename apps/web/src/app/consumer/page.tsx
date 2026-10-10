'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import { useLanguage } from '../../context/LanguageContext';
import { useProduceStore, useOrderStore, ProduceLotItem, ProduceGrade } from '../../lib/store';
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
  const { orders, placeOrder } = useOrderStore();

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'shop' | 'cart' | 'orders'>('shop');

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State (stored in component with localStorage backup)
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

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
      return matchesCat && matchesGrade && matchesSearch && hasStock;
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

  const deliveryFee = cartItems.length > 0 ? 25 : 0;
  const escrowProtectionFee = 0; // Guaranteed zero markup
  const totalPayable = cartSubtotal + deliveryFee + escrowProtectionFee;

  // Cart Actions
  const handleAddToCart = (lotId: string, amount = 1) => {
    setCart((prev) => {
      const current = prev[lotId] || 0;
      const lot = listings.find((l) => l.id === lotId);
      const maxAvailable = lot ? lot.quantityKg : 999;
      const next = Math.min(maxAvailable, current + amount);
      return { ...prev, [lotId]: next };
    });
  };

  const handleUpdateCartQty = (lotId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[lotId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[lotId];
        return copy;
      }
      const lot = listings.find((l) => l.id === lotId);
      const maxAvailable = lot ? lot.quantityKg : 999;
      return { ...prev, [lotId]: Math.min(maxAvailable, next) };
    });
  };

  const handleInstantBuy = (lot: ProduceLotItem) => {
    handleAddToCart(lot.id, 5);
    setActiveTab('cart');
  };

  // Step 1: Pre-order validation and open confirmation dialog
  const handleInitiateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setShowConfirmModal(true);
  };

  // Step 2: Final Order Placement & Escrow Lock
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

  // Filter helper counts
  const totalActiveItems = listings.reduce((acc, l) => acc + (l.quantityKg > 0 ? 1 : 0), 0);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <RoleGuard allowedRoles={['consumer']} portalName="Consumer Hub & Marketplace">
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Link href="/" className="hover:text-zinc-900 transition">
                {t.common.overview}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-zinc-800">{t.nav.consumerRoleTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {t.consumer.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
              {t.consumer.subtitle}
            </p>
          </div>

          {/* Tab Navigation Pill */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-200/80 rounded-xl self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'shop'
                  ? 'bg-white text-zinc-900 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
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
                  ? 'bg-white text-zinc-900 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
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
                  ? 'bg-white text-zinc-900 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t.consumer.ordersTab}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                {orders.length}
              </span>
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

        {/* Trust Badges Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">{t.consumer.badgeCommission}</div>
              <div className="text-[11px] text-zinc-500">{t.consumer.badgeCommissionSub}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">{t.consumer.badgeEscrow}</div>
              <div className="text-[11px] text-zinc-500">{t.consumer.badgeEscrowSub}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">{t.consumer.badgeAgmark}</div>
              <div className="text-[11px] text-zinc-500">{t.consumer.badgeAgmarkSub}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">{t.consumer.badgeDispatch}</div>
              <div className="text-[11px] text-zinc-500">{t.consumer.badgeDispatchSub}</div>
            </div>
          </div>
        </div>

        {/* TAB 1: SHOP / BROWSE PRODUCE */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> {t.consumer.filterCategory}
                </span>
                {['all', 'vegetables', 'grains', 'pulses', 'oilseeds'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg capitalize transition border ${
                      categoryFilter === cat
                        ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
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
                    className="bg-zinc-50 border border-zinc-200 text-xs rounded-lg px-2 py-1.5 text-zinc-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-zinc-900"
                  />
                </div>
              </div>
            </div>

            {/* Produce Grid */}
            {filteredProduce.length === 0 ? (
              <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
                <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-900">{t.consumer.noProduceTitle}</h3>
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
                      className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Lot Meta */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
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
                          <h3 className="text-base font-bold text-zinc-950">{lot.cropName}</h3>
                          <span className="text-lg font-mono font-extrabold text-zinc-950">
                            ₹{lot.price}
                            <span className="text-xs text-zinc-500 font-normal">{t.common.perKg}</span>
                          </span>
                        </div>

                        {/* Cluster & Location details */}
                        <div className="mt-3 pt-2.5 border-t border-zinc-100 space-y-1 text-[11px] text-zinc-600">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">{t.consumer.originCluster}</span>
                            <strong className="text-zinc-800 text-right truncate max-w-[140px]">
                              {lot.cluster}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">{t.consumer.depotHub}</span>
                            <span className="text-zinc-800 text-right truncate max-w-[140px]">
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
                      <div className="mt-4 pt-3 border-t border-zinc-100">
                        {inCartQty > 0 ? (
                          <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(lot.id, -1)}
                              className="w-7 h-7 rounded bg-white text-zinc-800 border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold font-mono text-zinc-900">
                              {t.consumer.inCart.replace('{qty}', String(inCartQty))}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(lot.id, 1)}
                              disabled={inCartQty >= lot.quantityKg}
                              className="w-7 h-7 rounded bg-white text-zinc-800 border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 font-bold disabled:opacity-50"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(lot.id, 5)}
                              className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 shadow-2xs"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>{t.consumer.add5kg}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInstantBuy(lot)}
                              className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold transition"
                            >
                              {t.consumer.buyNow}
                            </button>
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
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                  <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
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
                    <p className="text-sm font-semibold text-zinc-800">{t.consumer.basketEmpty}</p>
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
                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50/70"
                      >
                        <div className="flex-1 mr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900">{item.cropName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700">
                              {t.common.grade.replace('{grade}', item.grade)}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            ₹{item.unitPrice}{t.common.perKg} • Available: {item.availableKg} {t.common.kg}
                          </div>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-zinc-200 bg-white rounded-md">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.lotId, -1)}
                              className="px-2 py-1 text-xs hover:bg-zinc-100 text-zinc-600 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-1 text-xs font-bold font-mono text-zinc-900">
                              {item.quantityKg} {t.common.kg}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.lotId, 1)}
                              disabled={item.quantityKg >= item.availableKg}
                              className="px-2 py-1 text-xs hover:bg-zinc-100 text-zinc-600 font-bold disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-bold font-mono text-zinc-900 w-16 text-right">
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
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs space-y-5 sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span>{t.consumer.escrowSummaryTitle}</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {t.consumer.t1SettlementBadge}
                  </span>
                </div>

                {/* Calculation Rows */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>{t.consumer.produceSubtotal}</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      ₹{cartSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span className="flex items-center gap-1">
                      <span>{t.consumer.deliveryFee}</span>
                    </span>
                    <span className="font-mono font-semibold text-zinc-900">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span className="flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.consumer.zeroCommission}:</span>
                    </span>
                    <span className="font-mono font-bold">₹{escrowProtectionFee}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 flex justify-between text-sm font-extrabold text-zinc-950">
                    <span>{t.consumer.totalEscrowAmount}</span>
                    <span className="font-mono text-base text-emerald-900">
                      ₹{totalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Consumer Delivery Details Form */}
                <form onSubmit={handleInitiateCheckout} className="space-y-3 pt-2 border-t border-zinc-100">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      {t.consumer.recipientName}
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      {t.consumer.mobileNumber}
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      {t.consumer.deliveryAddress}
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      {t.consumer.settlementMethod}
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ESCROW_UPI')}
                        className={`p-2 rounded-lg border text-left font-semibold transition ${
                          paymentMethod === 'ESCROW_UPI'
                            ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700'
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
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        {t.consumer.methodCard}
                      </button>
                    </div>
                  </div>

                  {/* Escrow Disclaimer Box */}
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t.consumer.escrowWorksTitle}</span>
                    </div>
                    <p>
                      {t.consumer.escrowWorksDesc.replace('{amount}', String(totalPayable))}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={cartItems.length === 0 || isSubmitting}
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Review & Confirm Order (₹{totalPayable.toLocaleString('en-IN')})</span>
                  </button>
                </form>

                {/* Step Modal: Confirmation before payment / lock */}
                {showConfirmModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl border border-zinc-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-zinc-950">
                              Confirm Agrarian Escrow Lock
                            </h3>
                            <p className="text-[11px] text-zinc-500">
                              Direct Farm-Gate Procurement Verification
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowConfirmModal(false)}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Delivery Details Overview */}
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                          Delivery Destination
                        </div>
                        <div className="font-bold text-zinc-900 flex items-center justify-between">
                          <span>{buyerName}</span>
                          <span className="font-mono text-zinc-600">{buyerPhone}</span>
                        </div>
                        <div className="text-zinc-600 leading-snug">
                          {shippingAddress}
                        </div>
                      </div>

                      {/* Itemized Cart List */}
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                          Itemized Produce ({cartItems.length} items)
                        </div>
                        {cartItems.map((item) => (
                          <div
                            key={item.lotId}
                            className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs"
                          >
                            <div>
                              <span className="font-bold text-zinc-900 mr-1.5">{item.cropName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700">
                                Grade {item.grade}
                              </span>
                              <span className="text-zinc-500 ml-2">
                                {item.quantityKg} kg × ₹{item.unitPrice}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-zinc-900">
                              ₹{(item.quantityKg * item.unitPrice).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total & Escrow Breakdown */}
                      <div className="pt-2 border-t border-zinc-100 space-y-1 text-xs">
                        <div className="flex justify-between text-zinc-600">
                          <span>Produce Subtotal:</span>
                          <span className="font-mono font-semibold text-zinc-900">
                            ₹{cartSubtotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-600">
                          <span>Cold-Chain Delivery:</span>
                          <span className="font-mono font-semibold text-zinc-900">₹{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between text-emerald-800">
                          <span>Direct-to-Farmer Middleman Markup:</span>
                          <span className="font-mono font-bold">₹0 (Zero Commission)</span>
                        </div>
                        <div className="flex justify-between text-base font-extrabold text-zinc-950 pt-2 border-t border-zinc-200">
                          <span>Total Escrow Amount:</span>
                          <span className="font-mono text-emerald-900">
                            ₹{totalPayable.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowConfirmModal(false)}
                          disabled={isSubmitting}
                          className="flex-1 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition"
                        >
                          Edit Order Details
                        </button>
                        <button
                          type="button"
                          onClick={handleFinalConfirmOrder}
                          disabled={isSubmitting}
                          className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                        >
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isSubmitting ? 'Securing Escrow...' : 'Confirm & Lock Escrow'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS & ESCROW TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                <div>
                  <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-700" />
                    <span>{t.consumer.ordersLedgerTitle}</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {t.consumer.ordersLedgerSubtitle}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg self-start sm:self-auto">
                  {t.consumer.activeRecordsCount.replace('{count}', String(orders.length))}
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-zinc-800">{t.consumer.noOrdersTitle}</p>
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
                <div className="divide-y divide-zinc-100 mt-2">
                  {orders.map((order) => {
                    const isDelivered = order.status === 'DELIVERED';
                    const isDispatched = order.status === 'DISPATCHED';
                    return (
                      <div key={order.id} className="py-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono font-extrabold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded">
                              {order.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isDelivered
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : isDispatched
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {order.status.replace('_', ' ')}
                            </span>
                            {order.escrowLocked && (
                              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" /> {t.consumer.escrowProtected}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-mono font-extrabold text-zinc-900">
                              ₹{order.totalPrice.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-zinc-500">{order.createdAt}</div>
                          </div>
                        </div>

                        {/* Order Description & Delivery Info */}
                        <div className="bg-zinc-50/80 rounded-lg p-3 text-xs text-zinc-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-zinc-900">{order.items}</div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              {t.consumer.deliverTo.replace('{address}', order.shippingAddress || 'Direct Doorstep')}
                            </div>
                          </div>

                          {order.trackingId && (
                            <div className="text-[11px] font-mono text-zinc-600 bg-white border border-zinc-200 px-2.5 py-1 rounded-md self-start md:self-auto">
                              {t.consumer.trackingId.replace('{id}', order.trackingId)}
                            </div>
                          )}
                        </div>

                        {/* Visual Transit Stepper */}
                        <div className="pt-1">
                          <div className="grid grid-cols-4 text-center text-[11px] font-medium text-zinc-500 mb-1">
                            <div className="text-emerald-800 font-bold">{t.consumer.stepHarvest}</div>
                            <div className={isDispatched || isDelivered ? 'text-emerald-800 font-bold' : ''}>
                              {t.consumer.stepIntake}
                            </div>
                            <div className={isDispatched || isDelivered ? 'text-emerald-800 font-bold' : ''}>
                              {t.consumer.stepTransit}
                            </div>
                            <div className={isDelivered ? 'text-emerald-800 font-bold' : ''}>
                              {t.consumer.stepDelivered}
                            </div>
                          </div>
                          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-600 h-full w-1/4" />
                            <div
                              className={`h-full w-1/4 ${
                                isDispatched || isDelivered ? 'bg-emerald-600' : 'bg-transparent'
                              }`}
                            />
                            <div
                              className={`h-full w-1/4 ${
                                isDispatched || isDelivered ? 'bg-emerald-600' : 'bg-transparent'
                              }`}
                            />
                            <div
                              className={`h-full w-1/4 ${
                                isDelivered ? 'bg-emerald-600' : 'bg-transparent'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
