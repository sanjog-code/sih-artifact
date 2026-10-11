'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useProduceStore, ProduceLotItem } from '../lib/store/produceStore';
import { playSoftFemaleVoice, stopAiVoice } from '../lib/ai/tts-client';
import { getAdvisorTranslations } from '../lib/ai/multilingual-advisors';
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
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Clock,
  MapPin,
  Award,
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
  isDynamicWelcome?: boolean;
  suggestedLot?: ProduceLotItem;
  dealHighlights?: {
    retailPrice: number;
    farmPrice: number;
    savingsPercent: number;
    freshnessHours: string;
    originText: string;
    qualityBadge: string;
    reasonText: string;
  };
}

export default function ConsumerAiShoppingAdvisor() {
  const { role, userIdentifier } = useAuth();
  const { language } = useLanguage();
  const { listings } = useProduceStore();

  // ONLY render when user is authenticated as 'consumer'
  // Or if on consumer/checkout pages when role is consumer
  if (role !== 'consumer') {
    return null;
  }

  return <ConsumerChatWidget listings={listings} language={language} _userIdentifier={userIdentifier} />;
}

function ConsumerChatWidget({
  listings,
  language,
}: {
  listings: ProduceLotItem[];
  language: string;
  _userIdentifier?: string | null;
}) {
  const t = getAdvisorTranslations(language);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [step, setStep] = useState<'SELECT_CROP' | 'SELECT_QTY' | 'COMPLETED'>('SELECT_CROP');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedQty, setSelectedQty] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: t.consumer.welcome,
      timestamp: 'Just now',
      isDynamicWelcome: true,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [cartSuccessNotice, setCartSuccessNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);



  const speakTextWithSarvamTts = async (text: string) => {
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

  const handleAddToCartFromChat = (lot: ProduceLotItem, qty: number) => {
    try {
      const raw = localStorage.getItem('farmlink_cart');
      const cart = raw ? JSON.parse(raw) : {};
      cart[lot.id] = (cart[lot.id] || 0) + qty;
      localStorage.setItem('farmlink_cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('farmlink_cart_updated'));

      setCartSuccessNotice(`Added ${qty} kg ${lot.cropName} to your cart at ₹${lot.price}/kg!`);
      setTimeout(() => setCartSuccessNotice(null), 4000);
    } catch {
      // ignore
    }
  };

  // Helper to find best deal lot for a requested crop
  const findBestDealLot = (cropQuery: string): ProduceLotItem | undefined => {
    const q = cropQuery.toLowerCase();
    const matches = listings.filter((l) => {
      const name = l.cropName.toLowerCase();
      const cat = l.category.toLowerCase();
      return (
        name.includes(q) ||
        q.includes(name) ||
        (q.includes('tomato') && name.includes('tomato')) ||
        (q.includes('potato') && name.includes('potato')) ||
        (q.includes('wheat') && name.includes('wheat')) ||
        (q.includes('soybean') && name.includes('soybean')) ||
        (q.includes('mustard') && name.includes('mustard')) ||
        cat.includes(q)
      );
    });

    if (matches.length === 0) return listings[0];
    // Sort by Grade (A1 first) then price ascending
    return matches.sort((a, b) => {
      if (a.grade === 'A1' && b.grade !== 'A1') return -1;
      if (b.grade === 'A1' && a.grade !== 'A1') return 1;
      return a.price - b.price;
    })[0];
  };

  // Evaluate Deal Analysis
  const evaluateDeal = (lot: ProduceLotItem, requestedQty = 5) => {
    // Standard retail markup in conventional middleman supply chains is 38-50%
    const retailBenchmarkPrice = Math.round(lot.price * 1.45);
    const savingsPercent = Math.round(((retailBenchmarkPrice - lot.price) / retailBenchmarkPrice) * 100);
    const totalSavings = (retailBenchmarkPrice - lot.price) * requestedQty;

    const harvestFreshness = lot.harvestDate.toLowerCase().includes('today')
      ? 'Harvested today morning (<12 hours ago)'
      : `Harvested fresh on ${lot.harvestDate} directly assayed at farm-gate`;

    const origin = `${lot.farmerName || 'Verified FPO Producer'}, ${lot.cluster} (${lot.location})`;

    const reason = `Direct-to-consumer farm-gate rate cuts out 3 intermediate mandi brokers. You save ₹${totalSavings} (approx. ${savingsPercent}% below typical city retail price) while the farmer receives 100% full value locked under RBI T+1 escrow.`;

    return {
      retailPrice: retailBenchmarkPrice,
      farmPrice: lot.price,
      savingsPercent,
      freshnessHours: harvestFreshness,
      originText: origin,
      qualityBadge: `AGMARK Certified Grade ${lot.grade}`,
      reasonText: reason,
    };
  };

  // Process guided recommendation
  const processCropSelection = (crop: string) => {
    setSelectedCrop(crop);
    setStep('SELECT_QTY');

    const userMsg: ChatMessage = {
      id: createMsgId('user'),
      sender: 'user',
      text: `Looking for ${crop}`,
      timestamp: 'Just now',
    };

    const aiMsg: ChatMessage = {
      id: createMsgId('ai'),
      sender: 'ai',
      text: `Excellent choice! Fresh farm ${crop} is available right now directly from our accredited FPO clusters.

How much quantity (kg) would you like to buy?`,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  const processQuantitySelection = (qty: number) => {
    setSelectedQty(qty);
    setStep('COMPLETED');
    setLoading(true);

    const crop = selectedCrop || 'Tomato';
    const userMsg: ChatMessage = {
      id: createMsgId('user'),
      sender: 'user',
      text: `I need ${qty} kg`,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const lot = findBestDealLot(crop);
      if (!lot) {
        setMessages((prev) => [
          ...prev,
          {
            id: createMsgId('ai'),
            sender: 'ai',
            text: `We currently have high demand for ${crop}. Please browse our active catalogue or check back in a few minutes as new farmer lots are verified continuously.`,
            timestamp: 'Just now',
          },
        ]);
        setLoading(false);
        return;
      }

      const deal = evaluateDeal(lot, qty);
      const totalCost = lot.price * qty;

      const aiMsg: ChatMessage = {
        id: createMsgId('ai'),
        sender: 'ai',
        text: `Here is the top-rated direct deal for ${qty} kg ${lot.cropName}!

🌾 **Farmer & Origin**: Grown by **${lot.farmerName || 'Verified Member'}** in **${lot.cluster}** (${lot.location}).
✨ **Quality**: **${deal.qualityBadge}** with optical color uniformity and zero chemical spray residues.
⏱️ **Freshness**: **${deal.freshnessHours}**.
💰 **Fair Pricing**: **₹${lot.price}/kg** (Total: **₹${totalCost}** for ${qty} kg).
🎯 **Why It's a Great Deal**: ${deal.reasonText}`,
        timestamp: 'Just now',
        suggestedLot: lot,
        dealHighlights: deal,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 600);
  };

  // Freeform text query handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText.trim();
    const userMsg: ChatMessage = {
      id: createMsgId('user'),
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      const lower = userText.toLowerCase();

      // Check if user specified quantity in text
      const qtyMatch = lower.match(/(\d+)\s*(?:kg|kilos|kilo)?/);
      const extractedQty = qtyMatch ? parseInt(qtyMatch[1], 10) : 5;

      let detectedCrop = 'Tomato';
      if (lower.includes('potato') || lower.includes('aaloo') || lower.includes('alu')) detectedCrop = 'Potato';
      else if (lower.includes('wheat') || lower.includes('gehu') || lower.includes('atta')) detectedCrop = 'Wheat';
      else if (lower.includes('soybean') || lower.includes('soya')) detectedCrop = 'Soybean';
      else if (lower.includes('mustard') || lower.includes('sarson') || lower.includes('oil')) detectedCrop = 'Mustard';
      else if (lower.includes('tomato') || lower.includes('tamatar')) detectedCrop = 'Tomato';

      const lot = findBestDealLot(detectedCrop);

      if (lot) {
        const deal = evaluateDeal(lot, extractedQty);
        const total = lot.price * extractedQty;

        const aiMsg: ChatMessage = {
          id: createMsgId('ai'),
          sender: 'ai',
          text: `Found a verified direct harvest match for your request:

🌱 **Crop**: ${lot.cropName} (Lot #${lot.id})
👨‍🌾 **Origin & Farm**: Harvested by **${lot.farmerName}** at **${lot.cluster}**.
🏆 **Assayed Grade**: **${deal.qualityBadge}** (${lot.category}).
⚡ **Freshness**: ${deal.freshnessHours}.
🏷️ **Direct Price**: **₹${lot.price}/kg** (Total ₹${total} for ${extractedQty} kg).
💡 **Why this is a premier deal**: ${deal.reasonText}`,
          timestamp: 'Just now',
          suggestedLot: lot,
          dealHighlights: deal,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: createMsgId('ai'),
            sender: 'ai',
            text: `I've checked our live FPO cluster manifests for "${userText}". Our verified farmers are currently loading new harvests into regional depots. What quantity or crop would you like me to reserve for you?`,
            timestamp: 'Just now',
          },
        ]);
      }

      setLoading(false);
    }, 700);
  };

  const resetGuidedShopping = () => {
    setStep('SELECT_CROP');
    setSelectedCrop(null);
    setSelectedQty(null);
    setMessages([
      {
        id: createMsgId('welcome'),
        sender: 'ai',
        text: 'Starting a fresh shopping inquiry! What farm produce would you like to explore next?',
        timestamp: 'Just now',
      },
    ]);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border border-emerald-400/40 ring-4 ring-emerald-500/20"
          aria-label="Open Consumer AI Shopping & Deal Advisor"
        >
          <div className="w-7 h-7 rounded-full bg-white text-emerald-900 flex items-center justify-center font-bold text-xs shadow-xs">
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-left">
            <div className="text-xs font-extrabold tracking-tight flex items-center gap-1.5">
              <span>AI Shopping Advisor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
            </div>
            <div className="text-[10px] text-emerald-100 font-medium">Find Best Farmer Deals</div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[440px] max-w-[calc(100vw-1.5rem)]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold flex items-center gap-1.5">
                <span>Consumer Deal Advisor</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 text-[9px] font-mono border border-emerald-800">
                  Voice: Juniper Active
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">
                Direct Farm-Gate Price & Quality Guide
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetGuidedShopping}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition text-[10px] font-medium"
              title="Restart Shopping Guide"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {cartSuccessNotice && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{cartSuccessNotice}</span>
          </div>
        )}

        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div className="p-4 h-[350px] overflow-y-auto space-y-3.5 bg-[#fafafa] dark:bg-zinc-950 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-zinc-900 dark:bg-emerald-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line text-xs">{m.text}</div>

                    {/* Integrated Product & Deal Card if present */}
                    {m.suggestedLot && m.dealHighlights && (
                      <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                              {m.suggestedLot.id}
                            </span>
                            <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                              {m.suggestedLot.cropName}
                            </h4>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400">
                              ₹{m.suggestedLot.price}/kg
                            </span>
                            <span className="block text-[10px] text-zinc-400 line-through">
                              ₹{m.dealHighlights.retailPrice}/kg retail
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{m.dealHighlights.qualityBadge}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">Fresh Harvest</span>
                          </div>
                          <div className="col-span-2 flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{m.suggestedLot.cluster}</span>
                          </div>
                        </div>

                        {/* Savings Pill */}
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Zero Middleman Savings</span>
                          </span>
                          <span className="font-mono">~{m.dealHighlights.savingsPercent}% OFF</span>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleAddToCartFromChat(m.suggestedLot!, selectedQty || 5)
                            }
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add {selectedQty || 5} kg to Cart</span>
                          </button>
                          <Link
                            href="/checkout"
                            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {m.sender === 'ai' && (
                      <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400">{m.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => speakTextWithSarvamTts(m.text)}
                          className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          {isPlayingAudio ? (
                            <>
                              <VolumeX className="w-3 h-3 text-red-500" />
                              <span>Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Listen (Sarvam TTS)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-center text-zinc-500 italic text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating live farmer listings & direct savings...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Guided Step 1: Crop Selection Chips */}
            {step === 'SELECT_CROP' && (
              <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                  Select what you want to buy:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Tomato', label: '🍅 Fresh Tomatoes' },
                    { name: 'Potato', label: '🥔 Agra Potatoes' },
                    { name: 'Wheat', label: '🌾 Sharbati Wheat' },
                    { name: 'Soybean', label: '🌱 Vidarbha Soybean' },
                    { name: 'Mustard', label: '🌻 Mustard Seed' },
                  ].map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => processCropSelection(c.name)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Guided Step 2: Quantity Selection Chips */}
            {step === 'SELECT_QTY' && (
              <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                  Select required quantity:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[2, 5, 10, 25, 50].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => processQuantitySelection(qty)}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition font-mono"
                    >
                      {qty} kg
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask e.g. 'I want 10 kg wheat with best price'..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition disabled:opacity-40"
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
