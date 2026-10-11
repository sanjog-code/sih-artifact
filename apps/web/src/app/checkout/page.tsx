'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import { useProduceStore, ProduceLotItem } from '../../lib/store/produceStore';
import { useOrderStore } from '../../lib/store/orderStore';
import { useSubscriptionStore } from '../../lib/store/subscriptionStore';
import {
  ShieldCheck,
  Lock,
  Truck,
  CheckCircle2,
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Building,
  QrCode,
  FileText,
  BadgeCheck,
  Sparkles,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { geocodeAddress } from '../../lib/ai/geocoding';

export default function CheckoutPage() {
  const { listings, decrementQuantity } = useProduceStore();
  const { placeOrder } = useOrderStore();
  const { consumerConfig, calculateConsumerDeliveryFee } = useSubscriptionStore();

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [cartState, setCartState] = useState<Record<string, number>>({});

  // Delivery Form State
  const [fullName, setFullName] = useState('Ananya Sen');
  const [phone, setPhone] = useState('+91 98301 22419');
  const [address, setAddress] = useState('Flat 402, Green Glen Layout, Bellandur, Bengaluru');
  const [pincode, setPincode] = useState('560103');
  const [deliveryNotes, setDeliveryNotes] = useState('Gate 3 delivery. Please coordinate with cold-chain dispatcher.');
  const [paymentMethod, setPaymentMethod] = useState<'ESCROW_UPI' | 'ESCROW_NETBANKING' | 'ESCROW_CARD'>('ESCROW_UPI');

  // Confirmation & Receipt State
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [confirmedHash, setConfirmedHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load cart from localStorage or populate default for seamless testing
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem('farmlink_cart');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            setCartState(parsed);
            return;
          }
        }
      } catch {
        // ignore
      }

      // Default sample item if cart was empty so the user can experience the checkout flow directly
      if (listings.length > 0) {
        const initialItem = listings[0];
        setCartState({ [initialItem.id]: 10 });
      }
    });
  }, [listings]);

  // Save cart changes to localStorage
  const updateCartStorage = (newCart: Record<string, number>) => {
    setCartState(newCart);
    try {
      localStorage.setItem('farmlink_cart', JSON.stringify(newCart));
      window.dispatchEvent(new CustomEvent('farmlink_cart_updated'));
    } catch {
      // ignore
    }
  };

  const handleUpdateQty = (lotId: string, delta: number) => {
    const current = cartState[lotId] || 0;
    const lot = listings.find((l) => l.id === lotId);
    const maxAvailable = lot ? lot.quantityKg : 999;
    const next = current + delta;

    if (next <= 0) {
      const copy = { ...cartState };
      delete copy[lotId];
      updateCartStorage(copy);
    } else {
      updateCartStorage({
        ...cartState,
        [lotId]: Math.min(maxAvailable, next),
      });
    }
  };

  const handleRemoveItem = (lotId: string) => {
    const copy = { ...cartState };
    delete copy[lotId];
    updateCartStorage(copy);
  };

  const handleAddSampleItem = (lot: ProduceLotItem) => {
    updateCartStorage({
      ...cartState,
      [lot.id]: 10,
    });
  };

  // Cart Calculations
  const cartItems = useMemo(() => {
    return Object.entries(cartState)
      .map(([lotId, qty]) => {
        const lot = listings.find((l) => l.id === lotId);
        if (!lot || qty <= 0) return null;
        return {
          lot,
          qty,
          subtotal: lot.price * qty,
        };
      })
      .filter((item): item is { lot: ProduceLotItem; qty: number; subtotal: number } => item !== null);
  }, [cartState, listings]);

  const rawSubtotal = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  }, [cartItems]);

  const deliveryCalc = useMemo(() => {
    if (cartItems.length === 0) return { finalFee: 0, discountApplied: 0, isFree: false };
    return calculateConsumerDeliveryFee(rawSubtotal, 35);
  }, [cartItems.length, calculateConsumerDeliveryFee, rawSubtotal]);

  const deliveryFee = deliveryCalc.finalFee;
  const totalPayable = rawSubtotal + deliveryFee;

  // Handle final escrow lock
  const handleLockEscrow = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Deduct stock for each item in produceStore
      cartItems.forEach(({ lot, qty }) => {
        decrementQuantity(lot.id, qty);
      });

      const orderId = `ORD-ESCROW-${Date.now().toString().slice(-6)}`;
      const cryptoHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      // Geocode consumer delivery address for route optimizer
      const consumerGeo = geocodeAddress(address, pincode);
      const primaryLot = cartItems[0]?.lot;
      const farmPickupAddr = primaryLot?.farmAddress || primaryLot?.location || 'Phulera Farm Depot';
      const farmPickupCoords = primaryLot?.farmCoordinates || geocodeAddress(farmPickupAddr, primaryLot?.pincode);

      // Register order in orderStore with full geospatial route waypoints
      placeOrder({
        lotId: primaryLot?.id || 'MULTI-LOT',
        items: cartItems.map((c) => `${c.qty}kg ${c.lot.cropName} (Gr.${c.lot.grade})`).join(', '),
        commodity: primaryLot?.cropName || 'Mixed Agrarian Lot',
        quantityKg: cartItems.reduce((acc, c) => acc + c.qty, 0),
        unitPrice: primaryLot?.price || 0,
        totalPrice: totalPayable,
        buyerType: 'CONSUMER',
        buyerName: fullName,
        buyerPhone: phone,
        shippingAddress: address,
        pincode,
        deliveryCoordinates: { lat: consumerGeo.lat, lng: consumerGeo.lng },
        farmAddress: farmPickupAddr,
        farmCoordinates: farmPickupCoords,
        status: 'ESCROW_LOCKED',
        escrowLocked: true,
        createdAt: 'Just now',
      });

      // Clear cart
      updateCartStorage({});

      setConfirmedOrderId(orderId);
      setConfirmedHash(cryptoHash);
      setIsProcessing(false);
      setIsConfirming(false);
      setOrderConfirmed(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-emerald-500/30">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      {/* Spatial Background Mesh Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-400/10 dark:bg-emerald-600/10 blur-3xl transform-gpu"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-teal-400/10 dark:bg-teal-600/10 blur-3xl transform-gpu"></div>
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl transform-gpu"></div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-6 font-mono">
          <Link
            href="/consumer"
            className="hover:text-emerald-700 dark:hover:text-emerald-400 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-200 font-bold">Escrow Settlement Checkout</span>
        </div>

        {/* Header with Flowing Typography */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 backdrop-blur-md mb-3">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>RBI-Compliant Tri-Party Escrow Lock</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Transparent Agrarian Checkout
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 max-w-2xl font-normal leading-relaxed">
            Zero-intermediary purchase directly settled with verified farming clusters. Your payment is held in escrow until dispatch inspection passes AGMARK certification.
          </p>
        </div>

        {/* ORDER CONFIRMED VIEW */}
        {orderConfirmed ? (
          <div className="max-w-2xl mx-auto backdrop-blur-2xl bg-white dark:bg-zinc-900/80 border border-emerald-500/30 dark:border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              Escrow Lock Confirmed
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Funds are securely locked in nodal escrow. Producer payout releases upon verified gate receipt.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Order Reference</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{confirmedOrderId}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Escrow Batch Telemetry</span>
                <span className="text-[10px] text-zinc-700 dark:text-zinc-300 truncate max-w-[200px] sm:max-w-xs">{confirmedHash}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Delivery Address</span>
                <span className="text-zinc-800 dark:text-zinc-200 text-right truncate max-w-xs">{address}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-900 dark:text-zinc-100 font-bold">
                <span>Total Escrow Amount</span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/consumer"
                className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Back to Marketplace</span>
              </Link>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print Escrow Voucher</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Cart Breakdown & Delivery Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Glass Item Breakdown Card */}
              <div className="backdrop-blur-xl bg-white dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-100">
                        Procured Produce Lots
                      </h2>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {cartItems.length} active lot{cartItems.length === 1 ? '' : 's'} assigned to your escrow basket
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    Zero Brokerage
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Your escrow basket is empty.</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Select certified produce below to proceed with zero-middleman checkout:
                    </p>
                    {/* Fast add buttons */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {listings.slice(0, 3).map((lot) => (
                        <button
                          key={lot.id}
                          onClick={() => handleAddSampleItem(lot)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+10kg {lot.cropName} (₹{lot.price}/kg)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 mt-2">
                    {cartItems.map(({ lot, qty, subtotal }) => (
                      <div key={lot.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {lot.cropName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                              Grade {lot.grade}
                            </span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate hidden sm:inline">
                              • {lot.cluster}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
                            <span className="font-mono font-medium">₹{lot.price}/kg</span>
                            <span>•</span>
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                              100% to grower ({lot.farmerName})
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/80 backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(lot.id, -1)}
                              className="px-2 py-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                              {qty} kg
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(lot.id, 1)}
                              disabled={qty >= lot.quantityKg}
                              className="px-2 py-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-bold font-mono text-zinc-950 dark:text-zinc-100 w-16 text-right">
                            ₹{subtotal.toLocaleString('en-IN')}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(lot.id)}
                            className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Address & Contact Glass Form */}
              <div className="backdrop-blur-xl bg-white dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-100">
                      Cold-Chain Dispatch & Transit Address
                    </h2>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Direct farm-gate pickup sequenced via algorithmic vehicle routing
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Contact Mobile (+91)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Street Address & Apartment
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Special Cold-Chain Instructions
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Real-time Delivery Geocoding Telemetry */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Delivery Waypoint:</span>
                  </span>
                  <span>
                    {geocodeAddress(address, pincode).lat.toFixed(4)}° N, {geocodeAddress(address, pincode).lng.toFixed(4)}° E
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="backdrop-blur-xl bg-white dark:bg-zinc-900/70 border border-white/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Select Nodal Escrow Payment Channel
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ESCROW_UPI')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'ESCROW_UPI'
                        ? 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded font-bold">
                        Zero Fee
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-semibold">UPI Direct</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">GPay, PhonePe, BHIM</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ESCROW_NETBANKING')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'ESCROW_NETBANKING'
                        ? 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded">
                        T+1
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-semibold">Net Banking</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">All Scheduled Banks</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ESCROW_CARD')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      paymentMethod === 'ESCROW_CARD'
                        ? 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded">
                        Instant
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-semibold">Corporate Card</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">RuPay, Visa, Master</div>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Escrow Financial Summary (Sticky Glass Card) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="backdrop-blur-2xl bg-white dark:bg-zinc-900/80 border border-white/90 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/70 dark:border-zinc-800/70">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                      Escrow Settlement Statement
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    RBI Locked
                  </span>
                </div>

                {/* Mathematical Transparency Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Direct Produce Subtotal</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      ₹{rawSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span>Consolidated Cold Transit</span>
                    </span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {deliveryCalc.discountApplied > 0 ? (
                        <>
                          <span className="line-through text-zinc-400 mr-1.5">₹35</span>
                          <span>₹{deliveryFee}</span>
                        </>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  {deliveryCalc.discountApplied > 0 && (
                    <div className="flex justify-between text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{consumerConfig.name} Benefit</span>
                      </span>
                      <span className="font-mono font-bold">-₹{deliveryCalc.discountApplied} Saved</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Middleman Commission Fee</span>
                    </span>
                    <span className="font-mono font-bold">₹0.00 (Zero)</span>
                  </div>

                  <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex justify-between items-baseline">
                    <div>
                      <div className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Total Escrow Depository</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Released to cultivator upon gate clearance</div>
                    </div>
                    <div className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                      ₹{totalPayable.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>100% of commodity price transfers directly to grower</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Dispute protection: Funds held until physical grading</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Statutory MSP floor enforcement on all lots</span>
                  </div>
                </div>

                {/* Initiate Lock Button */}
                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={() => setIsConfirming(true)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Proceed to Escrow Lock</span>
                </button>

                <p className="text-[10px] text-center text-zinc-500 dark:text-zinc-400 font-mono">
                  Guaranteed T+1 direct bank transfer to grower upon AGMARK receipt
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION STEP MODAL */}
        {isConfirming && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="backdrop-blur-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Confirm Escrow Commitment</span>
                </h3>
                <button
                  onClick={() => setIsConfirming(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-mono"
                >
                  ✕ Close
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <p>
                  You are locking <strong className="text-zinc-950 dark:text-zinc-100 font-mono">₹{totalPayable.toLocaleString('en-IN')}</strong> in the Fasal Matrix regulatory node escrow.
                </p>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Recipient:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Destination:</span>
                    <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-xs">{address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Items:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{cartItems.length} certified lot(s)</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                  Note: Payout to the cultivator will be disbursed within 24 hours of gate arrival. You retain inspection rejection rights under AGMARK assay standards.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLockEscrow}
                  disabled={isProcessing}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Locking Escrow Deposit...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirm & Deposit ₹{totalPayable.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
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
