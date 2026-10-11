'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import { useLanguage } from '../../context/LanguageContext';
import { logisticsStore, LogisticsDispatchRecord } from '../../lib/store';
import RoleGuard from '../../components/RoleGuard';
import {
  Truck,
  CheckCircle2,
  Compass,
  ChevronRight,
  Leaf,
  Fuel,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

type VehicleType = 'TWO_WHEELER' | 'CAR' | 'VAN' | 'TRUCK';

interface RouteStop {
  id: string;
  name: string;
  quantityKg: number;
  distanceToNextKm?: number;
  cumulativeLoadKg?: number;
}

interface RouteResult {
  origin?: { name: string; lat: number; lng: number };
  orderedStops?: RouteStop[];
  totalDistanceKm: number;
  unoptimizedDistanceKm: number;
  distanceSavedKm: number;
  fuelSavedLiters: number;
  co2SavedKg: number;
  estimatedDurationMinutes: number;
  totalPayloadKg: number;
  capacityLimitKg: number;
  capacityUtilizationPercent: number;
  isOverloaded: boolean;
}

export default function LogisticsPortal() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleType>('VAN');
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);
  const [dispatches, setDispatches] = useState<LogisticsDispatchRecord[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      setDispatches(logisticsStore.getDispatches());
    });
  }, []);

  const calculateRoute = async (selectedVehicle: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/route-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: selectedVehicle }),
      });
      const data = await res.json();
      setRouteResult(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      calculateRoute(vehicle);
    });
  }, [vehicle]);

  const handleDispatch = () => {
    const driver =
      vehicle === 'TRUCK'
        ? 'Gurpreet Singh'
        : vehicle === 'VAN'
        ? 'Mohan Lal Verma'
        : 'Rajesh Kumar';

    const newRecord = logisticsStore.recordDispatch({
      id: `DISP-${vehicle}-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleType: vehicle,
      driverName: driver,
      dispatchedAt: 'Just now',
      totalDistanceKm: routeResult?.totalDistanceKm || 120,
      totalPayloadKg: routeResult?.totalPayloadKg || 1200,
      capacityUtilizationPercent: routeResult?.capacityUtilizationPercent || 85,
      status: 'IN_TRANSIT',
    });

    setDispatches(logisticsStore.getDispatches());
    setDispatchNotice(
      t.logistics.dispatchNotice.replace('{id}', newRecord.id).replace('{vehicle}', vehicle).replace('{driver}', driver)
    );
    setTimeout(() => setDispatchNotice(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <RoleGuard allowedRoles={['admin']} portalName="Logistics Dispatch Engine">
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Link href="/" className="hover:text-zinc-900 dark:text-zinc-100 transition">{t.common.overview}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.logistics.breadcrumb}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.logistics.routes}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {t.logistics.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>{t.logistics.orToolsActiveBadge}</span>
            </span>
          </div>
        </div>

        {dispatchNotice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{dispatchNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls & Vehicle Selector */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-1">{t.logistics.vehicleClassTitle}</h3>
              <p className="text-xs text-zinc-500 mb-4">{t.logistics.vehicleClassSubtitle}</p>

              <div className="space-y-2">
                {[
                  { id: 'TWO_WHEELER', name: t.logistics.twoWheelerName, cap: t.logistics.twoWheelerCap },
                  { id: 'CAR', name: t.logistics.pickupName, cap: t.logistics.pickupCap },
                  { id: 'VAN', name: t.logistics.vanName, cap: t.logistics.vanCap },
                  { id: 'TRUCK', name: t.logistics.truckName, cap: t.logistics.truckCap },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVehicle(v.id as VehicleType)}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      vehicle === v.id
                        ? 'bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{v.name}</div>
                      <span className={`text-[10px] ${vehicle === v.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {t.logistics.maxPayload.replace('{cap}', v.cap)}
                      </span>
                    </div>
                    <Truck className="w-4 h-4 opacity-70" />
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => calculateRoute(vehicle)}
                  disabled={loading}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{t.logistics.recomputeVrp}</span>
                </button>
              </div>
            </div>

            {/* Environmental & Fuel Savings Metrics */}
            {routeResult && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {t.logistics.optimizationImpact}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                      <Fuel className="w-3.5 h-3.5" />
                      <span>{t.logistics.fuelSaved}</span>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-950 font-mono mt-1 block">
                      {routeResult.fuelSavedLiters} {t.common.liters}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                      <Leaf className="w-3.5 h-3.5" />
                      <span>{t.logistics.co2Averted}</span>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-950 font-mono mt-1 block">
                      {routeResult.co2SavedKg} {t.common.kg}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span>{t.logistics.optimizedCircuit}</span>
                    <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{routeResult.totalDistanceKm} {t.common.km}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.logistics.sequentialBaseline}</span>
                    <span className="text-zinc-500 font-mono line-through">{routeResult.unoptimizedDistanceKm} {t.common.km}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>{t.logistics.distanceCut}</span>
                    <span className="font-mono">- {routeResult.distanceSavedKm} {t.common.km}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Route Sequence & Stops Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {routeResult && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                      {t.logistics.optimizedSequenceTitle}
                    </h2>
                    <span className="text-xs text-zinc-500">
                      {t.logistics.depotOrigin.replace('{name}', routeResult.origin?.name || '')}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                      {t.logistics.estTotalTime.replace('{mins}', String(routeResult.estimatedDurationMinutes))}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {t.logistics.payloadUtilization.replace('{current}', String(routeResult.totalPayloadKg)).replace('{limit}', String(routeResult.capacityLimitKg)).replace('{percent}', String(routeResult.capacityUtilizationPercent))}
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>{t.logistics.vehicleUtilizationTitle}</span>
                    <span>{routeResult.capacityUtilizationPercent}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        routeResult.isOverloaded ? 'bg-red-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, routeResult.capacityUtilizationPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Stop by Stop Checklist */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      0
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-zinc-900 dark:text-zinc-100">{routeResult.origin?.name}</strong>
                        <span className="text-[10px] font-mono uppercase bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-2 py-0.5 rounded font-bold">{t.logistics.depotBadge}</span>
                      </div>
                      <span className="text-[11px] text-zinc-500">{t.logistics.depotDesc}</span>
                    </div>
                  </div>

                  {routeResult.orderedStops?.map((stop: RouteStop, index: number) => (
                    <div key={stop.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-zinc-900 dark:text-zinc-100">{stop.name}</strong>
                          <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">+{stop.quantityKg} {t.common.kg}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500">
                          <span>{t.logistics.legDistance.replace('{km}', String(stop.distanceToNextKm))}</span>
                          <span>{t.logistics.cumulativePayload.replace('{kg}', String(stop.cumulativeLoadKg))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    onClick={handleDispatch}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 shadow-xs"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{t.logistics.dispatchManifestBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Persistent Dispatches Ledger */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs mt-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{t.logistics.activeDispatchesTitle}</h3>
                </div>
                <span className="text-[11px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 rounded">
                  {dispatches.length} {t.common.vehicles}
                </span>
              </div>

              <div className="space-y-3">
                {dispatches.map((disp) => (
                  <div
                    key={disp.id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{disp.id}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 dark:text-zinc-200">
                          {disp.vehicleType}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                          {disp.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {t.logistics.driverInfo.replace('{name}', disp.driverName).replace('{phone}', disp.driverPhone).replace('{time}', disp.dispatchedAt)}
                      </div>
                    </div>

                    <div className="text-right sm:self-center font-mono">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{t.logistics.payloadSummary.replace('{payload}', disp.totalPayloadKg.toLocaleString())}</div>
                      <div className="text-[11px] text-zinc-500">{t.logistics.dispatchStats.replace('{distance}', String(disp.totalDistanceKm)).replace('{percent}', String(disp.capacityUtilizationPercent))}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </main>
      </RoleGuard>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
