'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useProduceStore } from '../lib/store/produceStore';
import {
  X,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Sprout,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

let messageCounter = 0;
function createMsgId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  listingSuggestion?: {
    cropName: string;
    variety: string;
    harvestTiming: string;
    quantityKg: number;
    recommendedPrice: number;
    mspBenchmark: number;
    practices: string[];
    implements: string[];
    urgencyReason: string;
  };
}

// Knowledge base for crops, recommended agronomy practices, implements, and Fasal Matrix dynamic pricing
const CROP_ADVISORY_DATA: Record<
  string,
  {
    name: string;
    variety: string;
    category: 'vegetables' | 'grains' | 'oilseeds' | 'pulses';
    defaultPrice: number;
    mspFloor: number;
    practices: string[];
    implements: string[];
    urgencyReason: string;
  }
> = {
  Wheat: {
    name: 'Wheat',
    variety: 'Sharbati Premium',
    category: 'grains',
    defaultPrice: 24.8,
    mspFloor: 22.75,
    practices: [
      'Moisture conditioning (< 11.5% moisture prevents Aspergillus fungal growth)',
      'Aspiration cleaning to eliminate dust and immature chaff grains',
      'Hermetic packaging in multilayer polypropylene bags for 180-day storage',
    ],
    implements: [
      'Digital grain moisture tester (calibrated to CCEA standards)',
      'Rotary drum aspirator & grain cleaner',
      'Hermetic grain storage bags (WDRA accredited)',
    ],
    urgencyReason:
      'Flour mills and institutional buyers are actively booking wheat lots right now with a +9.2% demand premium over mandi rates. By listing today on Fasal Matrix, you retain 100% value with guaranteed T+1 escrow payout and 0% brokerage!',
  },
  Tomato: {
    name: 'Tomato',
    variety: 'Hybrid Perishable Grade A',
    category: 'vegetables',
    defaultPrice: 28.5,
    mspFloor: 21.0,
    practices: [
      'Pre-cooling within 3 hours of harvest to reduce field heat',
      'Automated optical color sorting to 90%+ red uniformity',
      'Cushioned corrugated ventilating crates to prevent transit bruising',
    ],
    implements: [
      'Field temperature probe & infrared thermal scanner',
      'Calibrated optical sorting gauge',
      'Heavy-duty vented harvesting crates',
    ],
    urgencyReason:
      'Local mandi supplies are volatile and perishable commodities drop 12% in value every 48 hours without cold chains. Listing now on Fasal Matrix connects your harvest instantly with verified buyers offering zero deduction on gate weights!',
  },
  Mustard: {
    name: 'Mustard',
    variety: 'Pusa Bold / Rapeseed',
    category: 'oilseeds',
    defaultPrice: 88.0,
    mspFloor: 56.5,
    practices: [
      'Sun-drying to maintain optimal seed moisture between 7.5% - 8.5%',
      'Sieving to separate sand, stones, and foreign seeds',
      'Stored in cool, rodent-proof elevated pallets under WDRA specifications',
    ],
    implements: [
      'Rotary seed sieving and grading screen',
      'Capacitive oilseed moisture meter',
      'Elevated wooden storage pallets',
    ],
    urgencyReason:
      'Oil extraction mills are paying a top premium for high-oil (>40%) seed batches. Mandi brokers often dock 4% for "moisture variance"; Fasal Matrix guarantees transparent assaying and 100% price retention!',
  },
  Soybean: {
    name: 'Soybean',
    variety: 'JS-335 Commercial Pulse',
    category: 'pulses',
    defaultPrice: 51.5,
    mspFloor: 46.0,
    practices: [
      'Careful mechanical threshing at low cylinder speed to prevent seed-coat split',
      'Grading for uniform bean size and zero split kernels',
      'Moisture balancing under 10% for e-NWR warehouse certification',
    ],
    implements: [
      'Rubber-roller low-impact thresher',
      'Vibratory sizing screen',
      'Calibrated seed moisture meter',
    ],
    urgencyReason:
      'Institutional feed and oil processors have active buy orders on the platform today. By listing right now on Fasal Matrix, your lot is locked with T+1 bank-backed escrow before harvest gluts depress spot prices!',
  },
};

export default function FarmerAiListingAdvisor() {
  const { role } = useAuth();
  const { language } = useLanguage();
  const { addListing, listings } = useProduceStore();

  // ONLY render when user is authenticated as 'farmer'
  if (role !== 'farmer') {
    return null;
  }

  return <FarmerAiListingAdvisorContent language={language} addListing={addListing} listingsCount={listings.length} />;
}

function FarmerAiListingAdvisorContent({
  language,
  addListing,
  listingsCount,
}: {
  language: string;
  addListing: ReturnType<typeof useProduceStore>['addListing'];
  listingsCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Guided conversation state
  const [stage, setStage] = useState<'CROP' | 'HARVEST_TIME' | 'QUANTITY' | 'RECOMMENDATION' | 'DONE'>('CROP');
  const [crop, setCrop] = useState<string>('Wheat');
  const [harvestTiming, setHarvestTiming] = useState<string>('Harvested Today (Fresh)');
  const [quantityKg, setQuantityKg] = useState<number>(2500);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'farmer-welcome',
      sender: 'ai',
      text: `Namaste Kisan Bhai! I am your Fasal Matrix Farming & Listing Advisor. 

I will help you pick the best crop, recommend ideal post-harvest practices and equipment, calculate your benchmark platform price, and list your lot for verified buyers with 0% middleman brokerage.

Which crop are you harvesting or planning to list today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [publishedLotId, setPublishedLotId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stage]);

  const speakTextWithSarvamTts = async (text: string) => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 300),
          languageCode:
            language === 'hi'
              ? 'hi-IN'
              : language === 'pa'
              ? 'pa-IN'
              : language === 'ta'
              ? 'ta-IN'
              : language === 'te'
              ? 'te-IN'
              : 'en-IN',
        }),
      });

      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        await audio.play();
        return;
      }

      // Web Speech fallback
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang =
          language === 'hi'
            ? 'hi-IN'
            : language === 'pa'
            ? 'pa-IN'
            : language === 'ta'
            ? 'ta-IN'
            : language === 'te'
            ? 'te-IN'
            : 'en-IN';
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleSelectCrop = (cropName: string) => {
    setCrop(cropName);
    const userMsg: ChatMessage = {
      id: createMsgId('user-crop'),
      sender: 'user',
      text: `I want to list ${cropName}.`,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStage('HARVEST_TIME');
      const aiMsg: ChatMessage = {
        id: createMsgId('ai-timing'),
        sender: 'ai',
        text: `Excellent selection! ${cropName} is in high demand on Fasal Matrix right now. 

When was this crop harvested or when is your expected harvest date?`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const handleSelectTiming = (timing: string) => {
    setHarvestTiming(timing);
    const userMsg: ChatMessage = {
      id: createMsgId('user-timing'),
      sender: 'user',
      text: `Harvest timing: ${timing}.`,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStage('QUANTITY');
      const aiMsg: ChatMessage = {
        id: createMsgId('ai-qty'),
        sender: 'ai',
        text: `Got it. How much quantity (in kilograms or quintals) do you want to list for direct buyer purchase?`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const handleConfirmQuantity = (qty: number) => {
    setQuantityKg(qty);
    const userMsg: ChatMessage = {
      id: createMsgId('user-qty'),
      sender: 'user',
      text: `I want to list ${qty.toLocaleString('en-IN')} kg of ${crop}.`,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStage('RECOMMENDATION');

      const cropData = CROP_ADVISORY_DATA[crop] || CROP_ADVISORY_DATA.Wheat;

      const aiMsg: ChatMessage = {
        id: createMsgId('ai-rec'),
        sender: 'ai',
        text: `Here is your customized Agronomy & Listing Plan for ${qty.toLocaleString('en-IN')} kg of ${crop}:

1. Recommended Fasal Matrix Price: ₹${cropData.defaultPrice.toFixed(2)}/kg (Statutory MSP Floor: ₹${cropData.mspFloor.toFixed(2)}/kg).
2. Why you should list right now: ${cropData.urgencyReason}
3. Recommended Farming Practices:
${cropData.practices.map((p) => `• ${p}`).join('\n')}
4. Recommended Equipment & Implements:
${cropData.implements.map((i) => `• ${i}`).join('\n')}

Would you like to publish this lot directly to the verified marketplace now?`,
        timestamp: 'Just now',
        listingSuggestion: {
          cropName: crop,
          variety: cropData.variety,
          harvestTiming,
          quantityKg: qty,
          recommendedPrice: cropData.defaultPrice,
          mspBenchmark: cropData.mspFloor,
          practices: cropData.practices,
          implements: cropData.implements,
          urgencyReason: cropData.urgencyReason,
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 700);
  };

  const handlePublishLot = () => {
    const cropData = CROP_ADVISORY_DATA[crop] || CROP_ADVISORY_DATA.Wheat;
    const newId = `LST-${8900 + listingsCount + 1}`;

    addListing({
      id: newId,
      cropName: crop,
      nameKey: `crop${crop}`,
      category: cropData.category,
      grade: 'A1',
      quantityKg,
      quantity: `${quantityKg.toLocaleString('en-IN')} kg`,
      price: cropData.defaultPrice,
      location: 'Phulera WDRA Depot #3',
      cluster: `Direct Farmer Lot (${cropData.variety})`,
      status: 'ACTIVE',
      harvestDate: harvestTiming,
      farmerName: 'Rameshwar Jat',
      description: `Grade A certified ${crop} lot (${cropData.variety}). Post-harvest conditioned with ${cropData.practices[0]}. Cleared for zero-broker direct trading.`,
    });

    setPublishedLotId(newId);
    setStage('DONE');

    const doneMsg: ChatMessage = {
      id: createMsgId('ai-done'),
      sender: 'ai',
      text: `🎉 Congratulations! Your lot #${newId} (${quantityKg.toLocaleString('en-IN')} kg of ${crop} at ₹${cropData.defaultPrice}/kg) has been published successfully to the Fasal Matrix marketplace! 

Verified buyers can now place purchase orders or bid with guaranteed T+1 escrow settlement.`,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, doneMsg]);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: createMsgId('user-custom'),
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const lower = userText.toLowerCase();

      // Check if user mentioned crop or quantity
      let matchedCrop = 'Wheat';
      if (lower.includes('tomato')) matchedCrop = 'Tomato';
      else if (lower.includes('mustard') || lower.includes('sarson')) matchedCrop = 'Mustard';
      else if (lower.includes('soybean')) matchedCrop = 'Soybean';

      const cropData = CROP_ADVISORY_DATA[matchedCrop];

      let reply = `Regarding "${userText}": On Fasal Matrix, your ${cropData.name} produces trade at ₹${cropData.defaultPrice.toFixed(2)}/kg against the MSP floor of ₹${cropData.mspFloor.toFixed(2)}/kg. You retain 100% of this price with zero broker commission and guaranteed T+1 payment.`;

      if (lower.includes('practice') || lower.includes('method') || lower.includes('care')) {
        reply = `Recommended practices for ${cropData.name}:\n` + cropData.practices.map((p) => `• ${p}`).join('\n');
      } else if (lower.includes('implement') || lower.includes('machine') || lower.includes('tool')) {
        reply = `Recommended implements for ${cropData.name}:\n` + cropData.implements.map((i) => `• ${i}`).join('\n');
      } else if (lower.includes('why') || lower.includes('list') || lower.includes('now')) {
        reply = cropData.urgencyReason;
      }

      const aiMsg: ChatMessage = {
        id: createMsgId('ai-custom-reply'),
        sender: 'ai',
        text: reply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border border-emerald-400/40"
          aria-label="Open Farmer AI Listing Advisor"
        >
          <div className="w-6 h-6 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-xs shadow-xs">
            <Sprout className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-extrabold tracking-tight">Kisan AI Advisor</span>
            <span className="block text-[9px] text-emerald-100 font-mono">List Produce & Practices</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[440px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold flex items-center gap-1.5">
                <span>Fasal Matrix Kisan Advisor</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-900 text-emerald-300 text-[9px] font-mono border border-emerald-700">
                  Sarvam Voice Active
                </span>
              </div>
              <div className="text-[10px] text-emerald-300">
                Crop Selection • Practices • Implements • T+1 Pricing
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
                if (lastAi) speakTextWithSarvamTts(lastAi.text);
              }}
              title="Voice narration"
              className={`p-1.5 rounded-lg transition ${
                isPlayingAudio ? 'bg-emerald-800 text-emerald-200 animate-pulse' : 'hover:bg-emerald-900 text-zinc-300'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-emerald-900 rounded-lg text-zinc-300 transition"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-emerald-900 rounded-lg text-zinc-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <>
            <div className="h-[360px] overflow-y-auto p-4 space-y-3.5 bg-zinc-50/60 dark:bg-zinc-950/60 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sprout className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Listing Suggestion Summary Card */}
                    {msg.listingSuggestion && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                            <span className="text-emerald-700 dark:text-emerald-400 block text-[10px]">
                              Fasal Matrix Benchmark
                            </span>
                            <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                              ₹{msg.listingSuggestion.recommendedPrice.toFixed(2)}/kg
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            <span className="text-zinc-600 dark:text-zinc-400 block text-[10px]">
                              Statutory MSP Floor
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-200 text-sm">
                              ₹{msg.listingSuggestion.mspBenchmark.toFixed(2)}/kg
                            </span>
                          </div>
                        </div>

                        {stage === 'RECOMMENDATION' && (
                          <button
                            type="button"
                            onClick={handlePublishLot}
                            className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>1-Click Publish Lot to Marketplace</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-1 text-[9px] text-zinc-400 text-right">{msg.timestamp}</div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs italic p-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Fasal Matrix AI is calculating agrarian benchmarks...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Guided Step Controllers */}
            {stage === 'CROP' && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border-t border-emerald-100 dark:border-emerald-900/50">
                <span className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-2">
                  Select crop commodity:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {Object.keys(CROP_ADVISORY_DATA).map((cName) => (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => handleSelectCrop(cName)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 border border-zinc-200 dark:border-zinc-700 transition shadow-xs text-center"
                    >
                      {cName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stage === 'HARVEST_TIME' && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border-t border-emerald-100 dark:border-emerald-900/50">
                <span className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-2">
                  Select harvest timing:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {['Harvested Today (Fresh)', '1–2 Days Ago (Cured)', 'Harvest in 24–48 Hours'].map((tVal) => (
                    <button
                      key={tVal}
                      type="button"
                      onClick={() => handleSelectTiming(tVal)}
                      className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 border border-zinc-200 dark:border-zinc-700 transition shadow-xs text-center"
                    >
                      {tVal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stage === 'QUANTITY' && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border-t border-emerald-100 dark:border-emerald-900/50">
                <span className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-2">
                  Select quantity to list:
                </span>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {[1000, 2500, 5000].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleConfirmQuantity(q)}
                      className="px-2 py-1.5 rounded-lg text-xs font-mono font-bold bg-white dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 border border-zinc-200 dark:border-zinc-700 transition shadow-xs text-center"
                    >
                      {q.toLocaleString('en-IN')} kg
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    defaultValue={quantityKg}
                    id="custom-qty-input"
                    placeholder="Custom kg"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('custom-qty-input') as HTMLInputElement;
                      if (el && Number(el.value) > 0) handleConfirmQuantity(Number(el.value));
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Set Qty
                  </button>
                </div>
              </div>
            )}

            {stage === 'DONE' && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-900 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Lot #{publishedLotId} Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStage('CROP');
                    setPublishedLotId(null);
                  }}
                  className="text-xs text-emerald-700 dark:text-emerald-400 underline font-semibold hover:text-emerald-900"
                >
                  List Another Crop →
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleCustomSend}
              className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about practices, implements, MSP, or pricing..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
