'use client';

import React from 'react';
import { OrderItem, OrderStatus } from '../lib/store/orderStore';
import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { triggerInvoicePrintOrDownload } from '../lib/invoiceGenerator';

interface OrderTrackingTimelineProps {
  order: OrderItem;
  onUpdateStatus?: (status: OrderStatus) => void;
  showAdminControls?: boolean;
}

const STAGES: Array<{
  id: OrderStatus;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'ORDER_PLACED',
    title: 'Order Placed & Escrow Locked',
    description: 'Funds safely held in RBI-compliant nodal escrow account',
    icon: Clock,
  },
  {
    id: 'PICKUP_SCHEDULED',
    title: 'Pickup Scheduled',
    description: 'Fleet assigned for direct farm gate collection',
    icon: Truck,
  },
  {
    id: 'IN_TRANSIT',
    title: 'In Transit',
    description: 'Cold-chain vehicle en route with continuous GPS & sensor telemetry',
    icon: Truck,
  },
  {
    id: 'DELIVERED',
    title: 'Delivered & Gate Assayed',
    description: 'Produce inspected at delivery gate and confirmed by consignee',
    icon: PackageCheck,
  },
  {
    id: 'ESCROW_RELEASED',
    title: 'Escrow Released to Farmer',
    description: 'T+1 bank transfer executed directly to farmer verified account',
    icon: CheckCircle2,
  },
];

export default function OrderTrackingTimeline({
  order,
  onUpdateStatus,
  showAdminControls = false,
}: OrderTrackingTimelineProps) {
  const getStageIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'ORDER_PLACED':
      case 'PENDING':
      case 'ESCROW_LOCKED':
        return 0;
      case 'PICKUP_SCHEDULED':
      case 'CONFIRMED':
        return 1;
      case 'IN_TRANSIT':
      case 'DISPATCHED':
        return 2;
      case 'DELIVERED':
        return 3;
      case 'ESCROW_RELEASED':
        return 4;
      case 'DISPUTED':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(order.status);
  const isDisputed = order.status === 'DISPUTED';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase">
              Order #{order.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isDisputed
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                  : currentIndex === 4
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
              }`}
            >
              {order.status}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
            {order.items || `${order.quantityKg} kg ${order.commodity}`}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Placed: {order.createdAt} • Delivery: {order.deliveryDate || 'Within 24-48 hours'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerInvoicePrintOrDownload(order)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>GST Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Disputed Alert Banner */}
      {isDisputed && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-start gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <span className="font-bold block text-sm">Escrow Hold: Order Under Administrative Arbitration</span>
            A dispute has been logged regarding batch quality or delivery verification. Funds remain securely frozen in nodal escrow until resolution.
          </div>
        </div>
      )}

      {/* 5-Stage Stepper */}
      <div className="relative mb-8">
        <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-5 gap-4">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;

            return (
              <div key={stage.id} className="flex sm:flex-col items-start sm:items-center relative">
                {/* Connecting Line */}
                {idx < STAGES.length - 1 && (
                  <div
                    className={`hidden sm:block absolute top-5 left-1/2 w-full h-0.5 z-0 ${
                      currentIndex > idx ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  />
                )}

                {/* Node Bubble */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                {/* Stage Info */}
                <div className="ml-4 sm:ml-0 sm:mt-3 sm:text-center">
                  <span
                    className={`text-xs font-bold block ${
                      isCurrent
                        ? 'text-blue-600 dark:text-blue-400'
                        : isCompleted
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400'
                    }`}
                  >
                    {stage.title}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5 max-w-[160px] sm:mx-auto">
                    {stage.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escrow Hash & Settlement Details Strip */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-zinc-500 block">Nodal Escrow Reference:</span>
          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {order.escrowTxHash || `ESCROW-${order.id}-SETTLED`}
          </span>
        </div>

        <div className="sm:text-right">
          <span className="text-zinc-500 block">Farmer Net Payout:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ₹{(order.farmerPayoutAmount || order.totalPrice * 0.96).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Admin / Demo Step Simulator */}
      {showAdminControls && onUpdateStatus && (
        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-[11px] font-mono font-bold uppercase text-zinc-400 block mb-2">
            Simulate Milestone Progression (Sandbox Mode):
          </span>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => onUpdateStatus(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  order.status === s.id
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {s.title.split(' ')[0]}
              </button>
            ))}
            <button
              onClick={() => onUpdateStatus('DISPUTED')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            >
              Raise Dispute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
