'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LogisticsPortal from '../logistics/page';
import { useLanguage } from '../../context/LanguageContext';
import { useProduceStore, useOrderStore, useRfqStore } from '../../lib/store';
import {
  ShieldAlert,
  Truck,
  Users,
  Coins,
  Cpu,
  BarChart3,
  Server,
  Layers,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function AdminConsolePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'logistics' | 'mandi' | 'escrow' | 'clusters'>('logistics');

  const { listings } = useProduceStore();
  const { orders } = useOrderStore();
  const { rfqs } = useRfqStore();

  const totalValueSettled = orders.reduce((acc, o) => acc + o.totalPrice, 0);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-semibold mb-2">
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
            <span className="text-[11px] text-purple-600 font-medium">WDRA verified</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-fit">
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
        </div>

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
                { name: 'Jaitpura Farmer Cooperative', state: 'Rajasthan', members: 420, rating: '99.2%', depot: 'Phulera Depot #3' },
                { name: 'Vidarbha Farmer Collective', state: 'Maharashtra', members: 1250, rating: '98.7%', depot: 'Nagpur East Agro Hub' },
                { name: 'Malwa Sharbati Cluster', state: 'Madhya Pradesh', members: 890, rating: '99.5%', depot: 'Ujjain Central Silo' },
                { name: 'Phulera Mustard Producers', state: 'Rajasthan', members: 630, rating: '99.1%', depot: 'Jaipur North WDRA Hub' },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-zinc-950 dark:text-white">{c.name}</strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Score {c.rating}
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
      </main>

      <Footer />
    </div>
  );
}
