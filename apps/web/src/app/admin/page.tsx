'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LogisticsPortal from '../logistics/page';
import RoleGuard from '../../components/RoleGuard';
import { useProduceStore, useOrderStore, useRfqStore, useSubscriptionStore, useKycStore, useWarehouseStore } from '../../lib/store';
import {
  ShieldAlert,
  Truck,
  Users,
  Coins,
  TrendingUp,
  Sparkles,
  Receipt,
  BarChart3,
  UserCheck,
  Warehouse,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Scale,
  Send,
  Store,
  Layers,
} from 'lucide-react';

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<
    | 'grading_queue'
    | 'logistics'
    | 'mandi'
    | 'escrow'
    | 'clusters'
    | 'monetization'
    | 'kyc_approvals'
    | 'depot_slots'
    | 'ai_operations'
  >('grading_queue');

  const {
    listings,
    dispatchGradingVehicle,
    confirmGradingAndProcure,
    intakeIntoWarehouse,
    allocateChannel,
  } = useProduceStore();
  const { orders } = useOrderStore();
  const { rfqs } = useRfqStore();
  const { businessConfig, consumerConfig } = useSubscriptionStore();
  const { kycList, updateKycStatus } = useKycStore();
  const { slots, updateSlotStatus, recordIntake } = useWarehouseStore();

  const [queueNotice, setQueueNotice] = useState<string | null>(null);

  // Modal / Form state for Dispatch
  const [dispatchModalLot, setDispatchModalLot] = useState<string | null>(null);
  const [vehicleNo, setVehicleNo] = useState('RJ-14-GA-8821');
  const [inspectorName, setInspectorName] = useState('Rajesh Kumar (AGMARK Grader #04)');
  const [inspectorPhone, setInspectorPhone] = useState('+91 98290 88219');
  const [etaHours, setEtaHours] = useState('2 hours');

  // Modal / Form state for Grading Confirmation
  const [gradeModalLot, setGradeModalLot] = useState<string | null>(null);
  const [confirmedGrade, setConfirmedGrade] = useState<'A1' | 'A2' | 'B'>('A1');
  const [moisturePercent, setMoisturePercent] = useState(8.5);
  const [netWeighedKg, setNetWeighedKg] = useState(2500);
  const [unitRate, setUnitRate] = useState(28);

  // Modal / Form state for Warehouse Intake
  const [intakeModalLot, setIntakeModalLot] = useState<string | null>(null);
  const [depotName, setDepotName] = useState('Phulera Depot #3 Cold Silo');
  const [bayLocation, setBayLocation] = useState('Chamber 02 - Silo B');

  const totalValueSettled = orders.reduce((acc, o) => acc + o.totalPrice, 0);

  // Platform Commission calculated across orders
  const totalPlatformCommission = orders.reduce((acc, o) => {
    return acc + (o.platformCommissionAmount || Math.round(o.totalPrice * (o.platformCommissionRate || 0.04)));
  }, 0);

  // Active Recurring Revenue from B2B & Consumer tiers
  // Baseline simulated volume: 50 B2B active customers + 1,000 active consumers
  const estimatedB2bMrr = 50 * businessConfig.monthlyPrice;
  const estimatedConsumerMrr = 1000 * (consumerConfig.monthlyPrice > 0 ? consumerConfig.monthlyPrice : 99);
  const totalMrr = estimatedB2bMrr + estimatedConsumerMrr + totalPlatformCommission;
  const annualizedRunRate = totalMrr * 12;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col transition-colors duration-200">
      <Navbar />

      <RoleGuard allowedRoles={['admin']} portalName="Admin Command & Fleet Console">
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800 dark:text-zinc-200 text-zinc-800 dark:text-zinc-200 dark:text-zinc-400 text-xs font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Network Operations & Administrator Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Administrative Command Console
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Capacitated fleet routing, mandi price intelligence oracles, RBI node escrow ledger, and cluster auditing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-mono">
              Network Status: ONLINE
            </span>
          </div>
        </div>

        {/* Global Admin KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold block">Total Active Lots</span>
            <span className="text-2xl font-black text-zinc-950 dark:text-white font-mono mt-1 block">{listings.length} Lots</span>
            <span className="text-[11px] text-emerald-600 font-medium">Assayed AGMARK stock</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold block">Settled Volume</span>
            <span className="text-2xl font-black text-zinc-950 dark:text-white font-mono mt-1 block">₹{(totalValueSettled / 100000).toFixed(2)} Lakh</span>
            <span className="text-[11px] text-emerald-600 font-medium">{orders.length} Contracts Processed</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold block">Active RFQs</span>
            <span className="text-2xl font-black text-zinc-950 dark:text-white font-mono mt-1 block">{rfqs.length} Bids</span>
            <span className="text-[11px] text-blue-600 font-medium">Under consensus</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold block">Accredited Nodes</span>
            <span className="text-2xl font-black text-zinc-950 dark:text-white font-mono mt-1 block">12 Depots</span>
            <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">WDRA verified</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('grading_queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'grading_queue'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Harvest Grading & Procurement Queue</span>
            {listings.filter((l) => ['GRADING_REQUESTED', 'INSPECTION_DISPATCHED', 'PROCURED', 'IN_WAREHOUSE'].includes(l.status)).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-mono text-[10px]">
                {listings.filter((l) => ['GRADING_REQUESTED', 'INSPECTION_DISPATCHED', 'PROCURED', 'IN_WAREHOUSE'].includes(l.status)).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'monetization'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>FarmLink Premier Monetization</span>
          </button>

          <button
            onClick={() => setActiveTab('logistics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'logistics'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fleet Logistics & VRP Routing</span>
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'escrow'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Escrow Settlement Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'clusters'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>FPO Cooperatives & Audits</span>
          </button>

          <button
            onClick={() => setActiveTab('kyc_approvals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'kyc_approvals'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>KYC Approvals Desk ({kycList.filter((k) => k.kycStatus === 'PENNY_DROP_PENDING').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('depot_slots')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'depot_slots'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
            <span>Depot Capacity Intake ({slots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_operations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ai_operations'
                ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 dark:text-zinc-300 shadow-xs border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
            <span>AI Operations Copilot (beta)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 dark:text-zinc-400 text-[10px] font-bold">
              Gemini
            </span>
          </button>
        </div>

        {queueNotice && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{queueNotice}</span>
          </div>
        )}

        {/* Tab 0: Harvest Grading & Procurement Queue */}
        {activeTab === 'grading_queue' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Physical Farmgate Procurement Pipeline</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                    Harvest Grading, Collection & Warehouse Routing Queue
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    When farmers declare harvests, they undergo physical inspection & collection before procurement settlement, WDRA vault intake, and commercial distribution.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-full border border-zinc-200 dark:border-zinc-700">
                    Active Pipeline: {listings.filter((l) => ['GRADING_REQUESTED', 'INSPECTION_DISPATCHED', 'PROCURED', 'IN_WAREHOUSE'].includes(l.status)).length} Lots
                  </span>
                </div>
              </div>

              {listings.filter((l) =>
                ['GRADING_REQUESTED', 'INSPECTION_DISPATCHED', 'PROCURED', 'IN_WAREHOUSE'].includes(l.status)
              ).length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <ClipboardCheck className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs">No pending harvest grading requests currently in queue.</p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    When farmers submit harvest declarations, they will appear here for vehicle dispatch and grading.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {listings
                    .filter((l) =>
                      ['GRADING_REQUESTED', 'INSPECTION_DISPATCHED', 'PROCURED', 'IN_WAREHOUSE'].includes(l.status)
                    )
                    .map((lot) => (
                      <div
                        key={lot.id}
                        className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-sm text-zinc-950 dark:text-white">
                              {lot.id}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                              {lot.cropName} ({lot.grade})
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                lot.status === 'GRADING_REQUESTED'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                                  : lot.status === 'INSPECTION_DISPATCHED'
                                  ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                                  : lot.status === 'PROCURED'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                              }`}
                            >
                              {lot.status === 'GRADING_REQUESTED'
                                ? '1. Grading Requested'
                                : lot.status === 'INSPECTION_DISPATCHED'
                                ? '2. Vehicle Dispatched'
                                : lot.status === 'PROCURED'
                                ? '3. Procured & Paid'
                                : '4. Stored in Warehouse'}
                            </span>
                          </div>

                          <div className="text-xs text-zinc-600 dark:text-zinc-300">
                            Grower: <strong>{lot.farmerName}</strong> ({lot.farmerPhone || '+91 98290 41029'}) • Declared Volume: <strong className="font-mono">{lot.quantity}</strong> @ ₹{lot.price}/kg
                          </div>

                          <div className="text-[11px] text-zinc-500">
                            Farm Pickup Address: <strong>{lot.farmAddress || 'Rural Farm Locus'}</strong> (Pincode: {lot.pincode || '303338'})
                          </div>

                          {/* Telemetry info based on state */}
                          {lot.dispatchInfo && (
                            <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200">
                              Vehicle: <strong>{lot.dispatchInfo.vehicleNo}</strong> • Inspector: <strong>{lot.dispatchInfo.inspectorName}</strong> • ETA: <strong>{lot.dispatchInfo.eta}</strong> (Dispatched: {lot.dispatchInfo.dispatchedAt})
                            </div>
                          )}

                          {lot.gradingReport && (
                            <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-900 dark:text-emerald-200">
                              Assayed: Grade <strong>{lot.gradingReport.confirmedGrade}</strong> • Moisture: <strong>{lot.gradingReport.moisturePercent}%</strong> • Net Weight: <strong>{lot.gradingReport.assayedNetWeightKg.toLocaleString()} kg</strong>
                              {lot.procurementDetails && (
                                <span className="block mt-0.5 font-mono font-bold text-emerald-800 dark:text-emerald-300">
                                  Escrow Settled: ₹{lot.procurementDetails.totalFarmerPayout.toLocaleString('en-IN')} (Ref: {lot.procurementDetails.escrowTxId})
                                </span>
                              )}
                            </div>
                          )}

                          {lot.warehouseStorage && (
                            <div className="p-2.5 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900 text-[11px] text-purple-900 dark:text-purple-200">
                              Depot: <strong>{lot.warehouseStorage.depotName}</strong> ({lot.warehouseStorage.bayLocation}) • Receipt: <strong className="font-mono">{lot.warehouseStorage.receiptId}</strong>
                            </div>
                          )}
                        </div>

                        {/* Workflow Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                          {lot.status === 'GRADING_REQUESTED' && (
                            <button
                              type="button"
                              onClick={() => setDispatchModalLot(lot.id)}
                              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch Grading Vehicle</span>
                            </button>
                          )}

                          {lot.status === 'INSPECTION_DISPATCHED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setGradeModalLot(lot.id);
                                setNetWeighedKg(lot.quantityKg);
                                setUnitRate(lot.price);
                              }}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Scale className="w-3.5 h-3.5" />
                              <span>Confirm Grade & Procure</span>
                            </button>
                          )}

                          {lot.status === 'PROCURED' && (
                            <button
                              type="button"
                              onClick={() => setIntakeModalLot(lot.id)}
                              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Warehouse className="w-3.5 h-3.5" />
                              <span>Intake into Warehouse</span>
                            </button>
                          )}

                          {lot.status === 'IN_WAREHOUSE' && (
                            <div className="flex flex-col gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  allocateChannel(lot.id, 'CONSUMER_MARKETPLACE');
                                  setQueueNotice(`Lot ${lot.id} successfully listed on the consumer marketplace!`);
                                  setTimeout(() => setQueueNotice(null), 4000);
                                }}
                                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Store className="w-3.5 h-3.5" />
                                <span>List for Consumers</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  allocateChannel(lot.id, 'BULK_B2B');
                                  setQueueNotice(`Lot ${lot.id} allocated to Bulk B2B Enterprise buyers!`);
                                  setTimeout(() => setQueueNotice(null), 4000);
                                }}
                                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Sell to Bulk Buyers</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Modal: Dispatch Collection Vehicle */}
            {dispatchModalLot && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Dispatch Field Grader Vehicle</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setDispatchModalLot(null)}
                      className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Assign a mobile optical testing van and certified AGMARK inspector for on-site farmgate collection.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Vehicle Registration
                      </label>
                      <input
                        type="text"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Certified Inspector Name
                      </label>
                      <input
                        type="text"
                        value={inspectorName}
                        onChange={(e) => setInspectorName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Inspector Phone
                        </label>
                        <input
                          type="text"
                          value={inspectorPhone}
                          onChange={(e) => setInspectorPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Arrival ETA
                        </label>
                        <input
                          type="text"
                          value={etaHours}
                          onChange={(e) => setEtaHours(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        dispatchGradingVehicle(dispatchModalLot, {
                          vehicleNo,
                          inspectorName,
                          inspectorPhone,
                          eta: etaHours,
                        });
                        setQueueNotice(`Collection vehicle ${vehicleNo} dispatched to farm address!`);
                        setDispatchModalLot(null);
                        setTimeout(() => setQueueNotice(null), 4000);
                      }}
                      className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Confirm Dispatch
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchModalLot(null)}
                      className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Confirm Physical Grade & Authorize Procurement */}
            {gradeModalLot && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-600" />
                      <span>On-Site Grade & Procurement Confirmation</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setGradeModalLot(null)}
                      className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Entering assayed grading parameters will lock procurement and immediately release T+1 escrow settlement to the farmer.
                  </p>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Confirmed AGMARK Grade
                        </label>
                        <select
                          value={confirmedGrade}
                          onChange={(e) => setConfirmedGrade(e.target.value as 'A1' | 'A2' | 'B')}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-bold text-emerald-700"
                        >
                          <option value="A1">Grade A1 (Export / High-Spec)</option>
                          <option value="A2">Grade A2 (Standard Wholesale)</option>
                          <option value="B">Grade B (Commercial Processing)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Assayed Moisture %
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={moisturePercent}
                          onChange={(e) => setMoisturePercent(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Net Weighed Quantity (kg)
                        </label>
                        <input
                          type="number"
                          value={netWeighedKg}
                          onChange={(e) => setNetWeighedKg(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Procurement Rate (₹/kg)
                        </label>
                        <input
                          type="number"
                          value={unitRate}
                          onChange={(e) => setUnitRate(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-xs">
                      <span className="text-emerald-900 dark:text-emerald-200 font-semibold">Total Farmer Payout:</span>
                      <strong className="font-mono text-sm text-emerald-800 dark:text-emerald-300">
                        ₹{(netWeighedKg * unitRate).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const result = confirmGradingAndProcure(gradeModalLot, {
                          confirmedGrade,
                          moisturePercent,
                          assayedNetWeightKg: netWeighedKg,
                          unitPrice: unitRate,
                        });
                        if (result.success) {
                          setQueueNotice(
                            `Procurement confirmed! Farmer received ₹${result.farmerPayout.toLocaleString('en-IN')} T+1 escrow settlement.`
                          );
                        }
                        setGradeModalLot(null);
                        setTimeout(() => setQueueNotice(null), 5000);
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Authorize Escrow & Procure
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradeModalLot(null)}
                      className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Warehouse Intake */}
            {intakeModalLot && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-purple-600" />
                      <span>WDRA Vault & Cold Silo Intake</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIntakeModalLot(null)}
                      className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Store procured produce in a WDRA-accredited storage silo or cold terminal and issue an electronic warehouse receipt (e-NWR).
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Depot Terminal Hub
                      </label>
                      <select
                        value={depotName}
                        onChange={(e) => setDepotName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-medium"
                      >
                        <option value="Phulera Depot #3 Cold Silo">Phulera Depot #3 Cold Silo (Jaipur Rural)</option>
                        <option value="Jaipur North WDRA Hub">Jaipur North WDRA Hub (Chomu Road)</option>
                        <option value="Kota Central Grain Silo">Kota Central Grain Silo (Hadoti Region)</option>
                        <option value="Nashik Agro Cold Terminal">Nashik Agro Cold Terminal (Maharashtra)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Bay / Chamber Allocation
                      </label>
                      <input
                        type="text"
                        value={bayLocation}
                        onChange={(e) => setBayLocation(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const targetLot = listings.find((l) => l.id === intakeModalLot);
                        intakeIntoWarehouse(intakeModalLot, {
                          depotName,
                          bayLocation,
                        });
                        recordIntake({
                          lotId: intakeModalLot,
                          commodity: targetLot?.cropName || 'Produce Lot',
                          quantityKg: targetLot?.quantityKg || 2500,
                          grade: `Grade ${targetLot?.grade || 'A1'}`,
                          warehouseName: depotName,
                          storageLocation: bayLocation,
                        });
                        setQueueNotice(`Lot ${intakeModalLot} checked into ${depotName}! e-NWR receipt issued.`);
                        setIntakeModalLot(null);
                        setTimeout(() => setQueueNotice(null), 4000);
                      }}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Generate e-NWR & Complete Intake
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntakeModalLot(null)}
                      className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Embedded Logistics & VRP Fleet Control */}
        {activeTab === 'logistics' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <Truck className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>
                <strong>Administrator Logistics Profile View:</strong> Real-time OR-Tools Capacitated VRP engine, fleet asset allocation, and multi-depot waypoint sequences.
              </span>
            </div>
            {/* Embedded native logistics hub */}
            <div className="overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <LogisticsPortal />
            </div>
          </div>
        )}

        {/* Tab 2: Escrow Settlement Ledger */}
        {activeTab === 'escrow' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                  RBI Nodal Escrow Audit Ledger
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Every trade consideration is protected under automated gate-pass release protocols.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
                T+1 Guaranteed
              </span>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-zinc-950 dark:text-white">{ord.id}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono">
                        {ord.buyerType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400 font-medium">{ord.items}</div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Hash: {ord.escrowTxHash || 'TX-NODE-ESCROW-CONFIRMED'} • {ord.createdAt}
                    </div>
                  </div>

                  <div className="text-right sm:self-center font-mono">
                    <div className="font-extrabold text-sm text-zinc-950 dark:text-white">
                      ₹{ord.totalPrice.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Direct Bank Credit (T+1)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: FPO Cooperatives & Audits */}
        {activeTab === 'clusters' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Accredited FPO Producer Cooperatives
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Verified regional cluster licenses, WDRA cold store linkages, and quality compliance scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Jaitpura Farmer Cooperative', state: 'Rajasthan', members: 420, capacityMt: '2,400 MT', depot: 'Phulera Depot #3' },
                { name: 'Vidarbha Farmer Collective', state: 'Maharashtra', members: 1250, capacityMt: '6,800 MT', depot: 'Nagpur East Agro Hub' },
                { name: 'Malwa Sharbati Cluster', state: 'Madhya Pradesh', members: 890, capacityMt: '4,100 MT', depot: 'Ujjain Central Silo' },
                { name: 'Phulera Mustard Producers', state: 'Rajasthan', members: 630, capacityMt: '3,250 MT', depot: 'Jaipur North WDRA Hub' },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-zinc-950 dark:text-white">{c.name}</strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                      Capacity: {c.capacityMt}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {c.state} • {c.members} Smallholder Members • Linked: {c.depot}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: FarmLink Premier Monetization & Financial Telemetry Hub */}
        {activeTab === 'monetization' && (
          <div className="space-y-6">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Executive Financial Telemetry & Monetization Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                FarmLink Premier  -  Operating Revenue & Unit Economics
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Real-time tracking of single-digit farmer commissions (2–5%), B2B enterprise procurement subscriptions, and consumer memberships.
              </p>
            </div>

            {/* Financial Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-1">
                  <span>Gross Merchandise Value (GMV)</span>
                  <Receipt className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-zinc-950 dark:text-white font-mono">
                  ₹{(totalValueSettled / 100000).toFixed(2)} Lakh
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Total completed trade considerations
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-1">
                  <span>Platform Commission Earned</span>
                  <Coins className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  ₹{totalPlatformCommission.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  Transparent 2–5% completed sales fee
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-1">
                  <span>Monthly Recurring Revenue (MRR)</span>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-zinc-950 dark:text-white font-mono">
                  ₹{(totalMrr / 100000).toFixed(2)} Lakh
                </div>
                <div className="text-[11px] text-blue-600 font-medium mt-1">
                  B2B SaaS + Consumer memberships
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-1">
                  <span>Annualized Run-Rate (ARR)</span>
                  <BarChart3 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                </div>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 dark:text-zinc-300 font-mono">
                  ₹{(annualizedRunRate / 100000).toFixed(2)} Lakh
                </div>
                <div className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium mt-1">
                  Projected 12-month recurring trajectory
                </div>
              </div>
            </div>

            {/* Illustrative Monthly Revenue Model Scenario Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    Validated Monthly Revenue Projection Model
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Illustrative baseline scenario model grounded in tripartite monetization principles.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
                  Target: ₹7.98 Lakh / month
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Revenue Source</th>
                      <th className="py-2.5 px-3">Operational Assumption</th>
                      <th className="py-2.5 px-3 text-right">Monthly Revenue</th>
                      <th className="py-2.5 px-3 text-right">Contribution %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">Farmer Platform Fee</td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400 font-sans">₹50 Lakh completed GMV × 4% effective fee</td>
                      <td className="py-3 px-3 text-right font-bold text-zinc-950 dark:text-zinc-50">₹2,00,000</td>
                      <td className="py-3 px-3 text-right text-emerald-600">25.0%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">B2B Business Subscriptions</td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400 font-sans">50 businesses × ₹9,999 (Business Growth)</td>
                      <td className="py-3 px-3 text-right font-bold text-zinc-950 dark:text-zinc-50">₹4,99,950</td>
                      <td className="py-3 px-3 text-right text-blue-600">62.6%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">Consumer Premier Memberships</td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400 font-sans">1,000 consumers × ₹99 / month</td>
                      <td className="py-3 px-3 text-right font-bold text-zinc-950 dark:text-zinc-50">₹99,000</td>
                      <td className="py-3 px-3 text-right text-zinc-700 dark:text-zinc-300">12.4%</td>
                    </tr>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 font-bold">
                      <td className="py-3 px-3 font-sans text-zinc-950 dark:text-white">Total Blended Monthly Revenue</td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300 font-sans">Tripartite model run-rate</td>
                      <td className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400 text-sm">₹7,98,950 / mo</td>
                      <td className="py-3 px-3 text-right text-zinc-950 dark:text-white">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <strong className="text-zinc-950 dark:text-white font-sans block">Annualized Run-Rate Benchmark:</strong>
                  <span>Maintained over 12 months, this yields ~₹95.9 Lakh annualized gross software and transaction revenue.</span>
                </div>
                <div className="shrink-0 font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  ~₹95.9 Lakh / year
                </div>
              </div>
            </div>

            {/* Operating Principles & Governance Compliance Strip */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-emerald-500/20 text-xs space-y-2">
              <span className="font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider text-[10px]">
                Transparent Operating Principles
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Basic farmer marketplace access remains 100% free with zero upfront fees.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Platform fee (2–5%) is deducted transparently only upon completed escrow release.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>All payments and subscriptions are verified server-side before activating access.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Delivery discounts are bounded to ensure positive contribution margin.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab: KYC Onboarding & Bank Approvals Desk */}
        {activeTab === 'kyc_approvals' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Grower & FPO KYC Verification Desk</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Review sandbox penny-drop bank verifications, PM-KISAN beneficiary numbers, and Aadhaar identity matches.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full">
                {kycList.length} Registered Growers
              </span>
            </div>

            <div className="space-y-4">
              {kycList.map((kyc) => (
                <div
                  key={kyc.id}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{kyc.farmerName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          kyc.kycStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : kyc.kycStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {kyc.kycStatus}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">ID: {kyc.id}</span>
                    </div>

                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Bank: <strong>{kyc.bankName}</strong> ({kyc.bankAccountNo}) • IFSC: <strong className="font-mono">{kyc.ifscCode}</strong>
                    </div>

                    <div className="text-[11px] text-zinc-500">
                      Phone: {kyc.phone} • Aadhaar Last 4: ••••{kyc.aadhaarLastFour} • Ref: {kyc.pennyDropRef || 'PENDING'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {kyc.kycStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => updateKycStatus(kyc.id, 'VERIFIED')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve KYC</span>
                      </button>
                    )}

                    {kyc.kycStatus !== 'REJECTED' && (
                      <button
                        onClick={() => updateKycStatus(kyc.id, 'REJECTED', 'Aadhaar name mismatch')}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Depot Capacity Intake & Warehouse Slot Management */}
        {activeTab === 'depot_slots' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>Depot Unloading Slots & Vault Storage</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Scheduled tractor/truck dock appointments across WDRA accredited hubs.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-zinc-200 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 dark:text-zinc-400 rounded-full">
                {slots.length} Reserved Appointments
              </span>
            </div>

            <div className="space-y-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{slot.depotName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-300">
                        {slot.dockNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {slot.status}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Grower: <strong>{slot.farmerName}</strong> ({slot.farmerPhone}) • Commodity: <strong>{slot.commodity}</strong> ({slot.estimatedVolumeKg.toLocaleString('en-IN')} kg)
                    </div>

                    <div className="text-[11px] text-zinc-500">
                      Scheduled: <strong>{slot.scheduledDate}</strong> @ <strong>{slot.timeSlot}</strong> • Slot ID: <span className="font-mono">{slot.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {slot.status === 'CONFIRMED' && (
                      <button
                        onClick={() => updateSlotStatus(slot.id, 'UNLOADING')}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        Gate Intake Check-in
                      </button>
                    )}

                    {slot.status === 'UNLOADING' && (
                      <button
                        onClick={() => updateSlotStatus(slot.id, 'COMPLETED')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        Complete Intake & Store Lot
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: AI Network & Operations Advisor powered by Gemini */}
        {activeTab === 'ai_operations' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800 dark:text-zinc-200 text-zinc-800 dark:text-zinc-200 dark:text-zinc-400 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                    <span>Gemini 3.8 Flash • Operational Reasoning Oracle</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                    Network Intelligence & Operations Copilot
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Automated system diagnostics, risk heuristics across FPO clusters, fleet bottleneck resolution, and escrow audit reporting.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('farmlink_open_ai', {
                          detail: {
                            query: 'Run administrative audit across active escrow orders and fleet VRP routing bottlenecks',
                            autoSend: true,
                          },
                        })
                      );
                    }
                  }}
                  className="px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white hover:from-zinc-900 dark:text-zinc-100 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs self-start"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Launch Gemini Admin Copilot</span>
                </button>
              </div>

              {/* Quick Operational Telemetry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Capacitated VRP Load</span>
                  <span className="text-xl font-extrabold text-zinc-950 dark:text-white font-mono mt-1 block">84.2%</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Optimal vehicle utilization</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Escrow Lock Integrity</span>
                  <span className="text-xl font-extrabold text-zinc-950 dark:text-white font-mono mt-1 block">100%</span>
                  <span className="text-[10px] text-emerald-600 font-medium">0 reconciliation anomalies</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Cluster Assay Passing</span>
                  <span className="text-xl font-extrabold text-zinc-950 dark:text-white font-mono mt-1 block">99.1%</span>
                  <span className="text-[10px] text-blue-600 font-medium">WDRA verified lots</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Penny-Drop KYC Velocity</span>
                  <span className="text-xl font-extrabold text-zinc-950 dark:text-white font-mono mt-1 block">&lt; 4.2 min</span>
                  <span className="text-[10px] text-zinc-700 dark:text-zinc-300 font-medium">NPCI instant verification</span>
                </div>
              </div>

              {/* Actionable Diagnostics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('farmlink_open_ai', {
                          detail: {
                            query: 'Analyze fleet routing efficiency and VRP multi-depot waypoint sequences for today',
                            autoSend: true,
                          },
                        })
                      );
                    }
                  }}
                  className="p-4 text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition group"
                >
                  <div className="text-xs font-bold text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:text-zinc-300 transition">
                     Fleet VRP Capacity Optimization
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Review simulated payloads, fuel minimization, and depot dispatch sequences.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('farmlink_open_ai', {
                          detail: {
                            query: 'Check escrow settlement ledger health and T+1 disbursement verification',
                            autoSend: true,
                          },
                        })
                      );
                    }
                  }}
                  className="p-4 text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition group"
                >
                  <div className="text-xs font-bold text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:text-zinc-300 transition">
                     Escrow Ledger Audit & Settlement
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Audit gate-pass releases, bank confirmations, and platform fee splits.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('farmlink_open_ai', {
                          detail: {
                            query: 'Evaluate active FPO cluster compliance, AGMARK grade distributions, and storage intakes',
                            autoSend: true,
                          },
                        })
                      );
                    }
                  }}
                  className="p-4 text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition group"
                >
                  <div className="text-xs font-bold text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:text-zinc-300 transition">
                     Cluster Compliance & Silo Health
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Assess WDRA grain intake slots, quality grading distributions, and member KYC.
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </RoleGuard>

      <Footer />
    </div>
  );
}
