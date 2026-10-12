'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProduceStore } from '../lib/store/produceStore';
import { useRfqStore } from '../lib/store/rfqStore';
import { playSoftFemaleVoice, stopAiVoice } from '../lib/ai/tts-client';
import { getAdvisorTranslations } from '../lib/ai/multilingual-advisors';
import {
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  Scale,
  Truck,
} from 'lucide-react';

let messageCounter = 0;
function createMsgId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

interface CommodityPriceInfo {
  name: string;
  category: string;
  currentModalPrice: number;
  mspFloor: number;
  mandiBenchmark: number; // APMC traditional rate with broker fee
  avgQuality: string;
  leadDepot: string;
}

const COMMODITIES: Record<string, CommodityPriceInfo> = {
  Wheat: {
    name: 'Wheat',
    category: 'Grains',
    currentModalPrice: 24.8,
    mspFloor: 22.75,
    mandiBenchmark: 28.2, // ~13.7% broker + mandi levy overhead
    avgQuality: 'AGMARK Grade A1 (98.4%)',
    leadDepot: 'Khanna Mandi / Phulera Depot #3',
  },
  Mustard: {
    name: 'Mustard',
    category: 'Oilseeds',
    currentModalPrice: 88.0,
    mspFloor: 56.5,
    mandiBenchmark: 98.5, // ~11.9% broker + moisture penalty
    avgQuality: 'Grade A1 (>40% Oil Content)',
    leadDepot: 'Jaipur WDRA Hub',
  },
  Tomato: {
    name: 'Tomato',
    category: 'Vegetables',
    currentModalPrice: 28.5,
    mspFloor: 21.0,
    mandiBenchmark: 33.5, // ~17.5% middleman commission & transit shrinkage
    avgQuality: 'Hybrid Red (92% Uniformity)',
    leadDepot: 'Phulera Depot #3',
  },
  Soybean: {
    name: 'Soybean',
    category: 'Pulses & Oilseeds',
    currentModalPrice: 51.5,
    mspFloor: 46.0,
    mandiBenchmark: 58.0, // ~12.6% commission & unassayed variance
    avgQuality: 'JS-335 Clean Grade A',
    leadDepot: 'Malwa Sharbati / Ujjain Depot',
  },
};

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isDynamicWelcome?: boolean;
  quoteProposal?: {
    crop: string;
    volumeKg: number;
    frequencyPerWeek: number;
    weeklyVolumeKg: number;
    fasalMatrixPrice: number;
    mandiPrice: number;
    weeklySpend: number;
    weeklySavings: number;
    annualSavings: number;
    destination: string;
  };
}

interface BulkBuyerAiQuoteAdvisorProps {
  onNavigateToRfq?: () => void;
}

export default function BulkBuyerAiQuoteAdvisor({ onNavigateToRfq }: BulkBuyerAiQuoteAdvisorProps = {}) {
  const { language } = useLanguage();
  const t = getAdvisorTranslations(language);
  const { listings } = useProduceStore();
  const { submitRfq, rfqs } = useRfqStore();

  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [volumePerDelivery, setVolumePerDelivery] = useState<number>(5000);
  const [frequencyPerWeek, setFrequencyPerWeek] = useState<number>(3);
  const [destinationHub, setDestinationHub] = useState<string>('Delhi-NCR WDRA Logistics Hub');

  const [step, setStep] = useState<'DISCOVERY' | 'CUSTOMIZE' | 'REVIEW' | 'SUBMITTED'>('DISCOVERY');
  const [quoteNotice, setQuoteNotice] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'buyer-ai-welcome',
      sender: 'ai',
      text: t.buyer.welcome,
      timestamp: 'Just now',
      isDynamicWelcome: true,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  // Pricing calculations
  const cropData = COMMODITIES[selectedCrop] || COMMODITIES.Wheat;
  const weeklyVolume = volumePerDelivery * frequencyPerWeek;
  const weeklySpendFasal = weeklyVolume * cropData.currentModalPrice;
  const weeklySpendMandi = weeklyVolume * cropData.mandiBenchmark;
  const weeklySavings = weeklySpendMandi - weeklySpendFasal;
  const savingsPercent = Math.round((weeklySavings / weeklySpendMandi) * 100);
  const annualSavings = weeklySavings * 52;

  const speakText = async (text: string) => {
    if (isPlayingAudio) {
      await stopAiVoice();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    await playSoftFemaleVoice(
      text,
      language,
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const handleGenerateQuoteProposal = () => {
    const userMsg: ChatMessage = {
      id: createMsgId('buyer-req'),
      sender: 'user',
      text: `Generate recurring procurement quote: ${volumePerDelivery.toLocaleString('en-IN')} kg of ${selectedCrop}, ${frequencyPerWeek} time(s)/week to ${destinationHub}.`,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep('REVIEW');

      const proposal = {
        crop: selectedCrop,
        volumeKg: volumePerDelivery,
        frequencyPerWeek,
        weeklyVolumeKg: weeklyVolume,
        fasalMatrixPrice: cropData.currentModalPrice,
        mandiPrice: cropData.mandiBenchmark,
        weeklySpend: weeklySpendFasal,
        weeklySavings,
        annualSavings,
        destination: destinationHub,
      };

      const aiMsg: ChatMessage = {
        id: createMsgId('ai-quote-response'),
        sender: 'ai',
        text: `Here is your optimized institutional procurement plan for ${selectedCrop}:

• Weekly Volume: ${weeklyVolume.toLocaleString('en-IN')} kg (${volumePerDelivery.toLocaleString('en-IN')} kg × ${frequencyPerWeek} deliveries/wk)
• Fasal Matrix Direct Rate: ₹${cropData.currentModalPrice.toFixed(2)}/kg vs Traditional Mandi: ₹${cropData.mandiBenchmark.toFixed(2)}/kg
• Weekly Cost: ₹${weeklySpendFasal.toLocaleString('en-IN')} (Saves ₹${weeklySavings.toLocaleString('en-IN')} every week  -  ~${savingsPercent}% lower spend)
• Projected Annual Savings: ₹${annualSavings.toLocaleString('en-IN')}

How Fasal Matrix delivers this:
1. Direct farmer contracts eliminate 3 tiers of mandi commissions.
2. Grade assaying at WDRA silos ensures 0% weight manipulation.
3. Node escrows release payment only upon destination dock inspection.`,
        timestamp: 'Just now',
        quoteProposal: proposal,
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const handleSetupQuote = () => {
    const newId = `RFQ-ENT-${8100 + rfqs.length + 1}`;
    const targetLot = listings.find((l) => l.cropName.toLowerCase() === selectedCrop.toLowerCase());

    const createdRfq = submitRfq({
      id: newId,
      crop: selectedCrop,
      sellerCluster: targetLot ? targetLot.cluster : 'Federated FPO Producer Network',
      volumeKg: volumePerDelivery,
      askingRate: cropData.mandiBenchmark,
      bidRate: cropData.currentModalPrice,
      status: 'PENDING',
      escrowLocked: false,
      frequencyPerWeek,
      cadence: `${frequencyPerWeek}x weekly (${weeklyVolume.toLocaleString('en-IN')} kg/wk)`,
      buyerName: 'Enterprise Bulk Procurer',
      notes: `Institutional recurring order: ${volumePerDelivery.toLocaleString('en-IN')} kg per dispatch, ${frequencyPerWeek} days/week delivered to ${destinationHub}. Assayed under WDRA Grade A standards.`,
      createdAt: 'Just now',
    });

    setStep('SUBMITTED');
    setQuoteNotice(
      `Quote #${createdRfq.id} successfully initiated! Your recurring RFQ is pre-registered on the Buyer Desk.`
    );

    const confirmationMsg: ChatMessage = {
      id: createMsgId('ai-quote-confirmed'),
      sender: 'ai',
      text: ` Quote #${createdRfq.id} registered!

Your procurement requirement (${selectedCrop}, ${weeklyVolume.toLocaleString('en-IN')} kg/week) has been logged into the Fasal Matrix settlement ledger. 

You can review bidder farmer clusters in the RFQ Bidding Desk tab, inspect telemetry certificates, and lock escrow for dispatch!`,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, confirmationMsg]);
  };

  const handleCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: createMsgId('buyer-user-q'),
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Send query to unified Fasal Matrix AI API powered by Gemini & domain models
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          role: 'buyer',
          language,
          context: {
            selectedCrop,
            volumePerDelivery,
            frequencyPerWeek,
            destinationHub,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.response || data.replyText || '';
        if (reply.trim()) {
          const aiMsg: ChatMessage = {
            id: createMsgId('ai-q-reply'),
            sender: 'ai',
            text: reply,
            timestamp: 'Just now',
          };
          setMessages((prev) => [...prev, aiMsg]);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Live API request in quote advisor failed, using fallback:', err);
    }

    // Local Domain Fallback
    setTimeout(() => {
      setLoading(false);
      const lower = query.toLowerCase();
      let reply = '';

      if (lower.includes('price') || lower.includes('rate') || lower.includes('cost')) {
        reply = `Current Fasal Matrix live benchmark prices:
• Wheat: ₹${COMMODITIES.Wheat.currentModalPrice}/kg (Mandi: ₹${COMMODITIES.Wheat.mandiBenchmark}/kg)
• Mustard: ₹${COMMODITIES.Mustard.currentModalPrice}/kg (Mandi: ₹${COMMODITIES.Mustard.mandiBenchmark}/kg)
• Tomato: ₹${COMMODITIES.Tomato.currentModalPrice}/kg (Mandi: ₹${COMMODITIES.Tomato.mandiBenchmark}/kg)
• Soybean: ₹${COMMODITIES.Soybean.currentModalPrice}/kg (Mandi: ₹${COMMODITIES.Soybean.mandiBenchmark}/kg)`;
      } else if (lower.includes('quality') || lower.includes('grade') || lower.includes('assay')) {
        reply = `All Fasal Matrix lots are certified under WDRA and AGMARK grading protocols. Each batch is assayed for moisture, defect floor (<1%), and size uniformity with digital certificates attached before gate pass issuance.`;
      } else if (lower.includes('escrow') || lower.includes('payment') || lower.includes('bank')) {
        reply = `Your funds are held in an RBI-compliant nodal escrow account. Sellers are only paid on T+1 terms after your terminal dock verifies weight tickets and grade compliance. You never face advance default risk.`;
      } else if (lower.includes('frequency') || lower.includes('weekly') || lower.includes('schedule')) {
        reply = `Fasal Matrix supports customizable procurement cadences (from 1x weekly to daily dispatches). Our Vehicle Routing Problem (VRP) engine bundles clustered FPO shipments to guarantee on-time dock delivery and minimum freight overhead.`;
      } else {
        reply = `Regarding "${query}": Fasal Matrix connects enterprise procurers directly to verified farmer clusters with complete price transparency, guaranteed MSP floors, and automated delivery scheduling. Use the quote builder below to model your requirements!`;
      }

      const aiMsg: ChatMessage = {
        id: createMsgId('ai-q-reply'),
        sender: 'ai',
        text: reply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <div className="mt-8 border border-blue-200/80 dark:border-blue-900/50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold uppercase mb-1">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Native Bulk Buyer Copilot</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Institutional Pricing & Quote Advisor
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live Mandi Benchmarks • Recurring Volume Planner • Zero Broker Markups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => {
              const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
              if (lastAi) speakText(lastAi.text);
            }}
            title="Narrate response"
            className={`p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 transition ${
              isPlayingAudio ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 animate-pulse' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grid: Live Prices Radar & Fasal Matrix Value Proposition */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(COMMODITIES).map(([cKey, cInfo]) => {
          const isSelected = selectedCrop === cKey;
          const diff = Math.round(
            ((cInfo.mandiBenchmark - cInfo.currentModalPrice) / cInfo.mandiBenchmark) * 100
          );
          return (
            <button
              key={cKey}
              type="button"
              onClick={() => setSelectedCrop(cKey)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/30 shadow-xs'
                  : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{cInfo.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  -{diff}% Broker Fee
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1 font-mono">
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                  ₹{cInfo.currentModalPrice.toFixed(2)}
                </span>
                <span className="text-[11px] text-zinc-500 line-through">
                  ₹{cInfo.mandiBenchmark.toFixed(2)}
                </span>
                <span className="text-[10px] text-zinc-400">/ kg</span>
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 truncate">
                {cInfo.avgQuality}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Requirement Form: Volume, Frequency, Destination */}
      <div className="bg-zinc-50/90 dark:bg-zinc-950/60 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 mb-6">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Setup Recurring Volume & Delivery Cadence</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Volume Per Delivery */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Volume per Delivery:
            </label>
            <div className="flex gap-1.5 mb-1.5">
              {[2500, 5000, 10000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVolumePerDelivery(v)}
                  className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg border transition ${
                    volumePerDelivery === v
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {(v / 1000).toFixed(1)} MT
                </button>
              ))}
            </div>
            <input
              type="number"
              min="500"
              step="500"
              value={volumePerDelivery}
              onChange={(e) => setVolumePerDelivery(Math.max(100, Number(e.target.value)))}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
          </div>

          {/* Weekly Delivery Frequency */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Deliveries per Week:
            </label>
            <div className="grid grid-cols-5 gap-1 mb-1.5">
              {[1, 2, 3, 5, 7].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequencyPerWeek(f)}
                  className={`py-1 text-[11px] font-mono font-bold rounded-lg border transition ${
                    frequencyPerWeek === f
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {f === 7 ? 'Daily' : `${f}x`}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">
              Total: {weeklyVolume.toLocaleString('en-IN')} kg / week
            </p>
          </div>

          {/* Delivery Hub */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Destination Terminal:
            </label>
            <select
              value={destinationHub}
              onChange={(e) => setDestinationHub(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <option value="Delhi-NCR WDRA Logistics Hub">Delhi-NCR WDRA Logistics Hub</option>
              <option value="Jaipur Agrarian Terminal #2">Jaipur Agrarian Terminal #2</option>
              <option value="Mumbai Western Cold Logistics">Mumbai Western Cold Logistics</option>
              <option value="Chandigarh APMC Direct Dock">Chandigarh APMC Direct Dock</option>
            </select>
          </div>
        </div>

        {/* Dynamic Financial Projection Strip */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 block">Weekly Spend (Fasal Matrix):</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                ₹{weeklySpendFasal.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Traditional Mandi Cost:</span>
              <span className="font-medium text-zinc-500 line-through text-sm">
                ₹{weeklySpendMandi.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 block">Net Weekly Savings:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                +₹{weeklySavings.toLocaleString('en-IN')} ({savingsPercent}%)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateQuoteProposal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <span>Analyze Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Conversation & Quote Ledger */}
      <div className="bg-zinc-50/60 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mb-5 max-h-[320px] overflow-y-auto space-y-3 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-xs shadow-xs'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Action Button for Quote Proposal */}
              {msg.quoteProposal && step === 'REVIEW' && (
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleSetupQuote}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Setup Quote & Register on Buyer Desk</span>
                  </button>
                </div>
              )}

              <div className="mt-1 text-[9px] text-zinc-400 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs italic p-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Calculating APMC vs Fasal Matrix margin differentials...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {quoteNotice && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{quoteNotice}</span>
          </div>
          {onNavigateToRfq && (
            <button
              type="button"
              onClick={onNavigateToRfq}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
            >
              <span>View Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Ask Copilot Form */}
      <form onSubmit={handleCustomQuestion} className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about quality assaying, escrow protection, or delivery schedules..."
          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition flex items-center gap-1.5 text-xs font-bold"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>

      {/* Value Pillars: How Fasal Matrix Solves Procurement Pain Points */}
      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
          How Fasal Matrix Solves Enterprise Supply Chain Volatility:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Zero-Broker Arbitrage</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Contracts connect directly to verified FPOs and WDRA accredited silos. No commission skimming or hidden mandi levies.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>RBI Node Escrow</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Funds are locked securely in regulated accounts. Disbursal happens only after terminal dock weight and grade inspection.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              <Truck className="w-3.5 h-3.5 text-purple-600" />
              <span>Guaranteed VRP Cadence</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Automated logistics coordination ensures multi-day delivery slots without depot congestion or transit quality degradation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
