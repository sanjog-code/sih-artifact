'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  Building2,
  ShoppingCart,
  ShieldAlert,
  ArrowRight,
  Lock,
  Phone,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export type UserRole = 'farmer' | 'buyer' | 'consumer' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [phone, setPhone] = useState('+91 98290 14820');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [ageConsent, setAgeConsent] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roleDetails = React.useMemo(() => ({
    farmer: {
      title: 'Farmer & FPO Producer Portal',
      subtitle: 'PM-KISAN & WDRA Registered Producer Access',
      icon: Sprout,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      destination: '/farmer',
      defaultPhone: '+91 98290 14820',
    },
    buyer: {
      title: 'Bulk Buyer & Institutional Vendor Desk',
      subtitle: 'Enterprise Procurement & Regulated Node Escrow',
      icon: Building2,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      destination: '/buyer',
      defaultPhone: '+91 98110 55432',
    },
    consumer: {
      title: 'Direct Consumer Produce Hub',
      subtitle: 'Zero Middleman Farm-to-Kitchen Direct Sourcing',
      icon: ShoppingCart,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      destination: '/consumer',
      defaultPhone: '+91 98301 22419',
    },
    admin: {
      title: 'Central Agrarian Network Console',
      subtitle: 'Fleet Logistics, Mandi Oracles, Telemetry & Oversight',
      icon: ShieldAlert,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      destination: '/admin',
      defaultPhone: '+91 99000 00001',
    },
  }), []);

  const handleRoleSelect = React.useCallback((role: UserRole) => {
    setSelectedRole(role);
    setPhone(roleDetails[role].defaultPhone);
    setOtpSent(false);
    setOtp('');
    setAdminKey('');
    setErrorMsg(null);
  }, [roleDetails]);

  React.useEffect(() => {
    queueMicrotask(() => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role') as UserRole | null;
        if (roleParam && ['farmer', 'buyer', 'consumer', 'admin'].includes(roleParam)) {
          handleRoleSelect(roleParam);
        }
      }
    });
  }, [handleRoleSelect]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Please enter a valid mobile number');
      return;
    }
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_otp',
          phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to dispatch OTP. Please retry.');
        return;
      }
      setOtpSent(true);
      setOtp(data.otpPreview || '584210');
    } catch {
      setErrorMsg('Network error while requesting OTP.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConsent) {
      setErrorMsg('You must confirm you are 18 years or older and accept the Terms of Service & Privacy Policy.');
      return;
    }

    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          role: selectedRole,
          phone: phone.trim(),
          otp: otp.trim(),
          adminKey: adminKey.trim(),
          ageConsent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Authentication failed. Please check credentials.');
        return;
      }

      setAuthSuccess(true);
      await login(selectedRole, phone.trim());

      setTimeout(() => {
        router.push(roleDetails[selectedRole].destination);
      }, 1000);
    } catch {
      setErrorMsg('Server connection failure during verification.');
    }
  };

  const CurrentRoleIcon = roleDetails[selectedRole].icon;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Role Agrarian Authentication</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Select Your Portal
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Secure, encrypted authentication for farmers, bulk enterprise buyers, consumers, and platform network administrators.
          </p>
        </div>

        {/* Role Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(['farmer', 'buyer', 'consumer', 'admin'] as UserRole[]).map((role) => {
            const info = roleDetails[role];
            const Icon = info.icon;
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-md ring-2 ring-zinc-900 dark:ring-white scale-[1.02]'
                    : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${info.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-950 dark:text-white capitalize">{role} Desk</div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5 truncate">
                    {role === 'farmer' && 'Direct Harvest'}
                    {role === 'buyer' && 'Bulk RFQ'}
                    {role === 'consumer' && 'Kitchen Direct'}
                    {role === 'admin' && 'Fleet & Admin'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Authentication Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm max-w-lg mx-auto">
          <div className="flex items-center gap-3 pb-5 mb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${roleDetails[selectedRole].color}`}>
              <CurrentRoleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                {roleDetails[selectedRole].title}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {roleDetails[selectedRole].subtitle}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-medium text-red-700 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {authSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Identity Verified Successfully!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Opening {roleDetails[selectedRole].title}...
              </p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Registered Mobile / Aadhaar Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {selectedRole === 'admin' ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Administrative Key / Token
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="Enter administrator passkey (e.g. farmlink-admin-2026)"
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>Send 6-Digit OTP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Verification OTP (Auto-Populated Demo)
                          </label>
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline"
                          >
                            Resend
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Enter {roleDetails[selectedRole].title.split(' ')[0]} Hub</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Mandatory Age & Terms Consent */}
              <div className="pt-2 pb-1 border-t border-zinc-100 dark:border-zinc-800">
                <label className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConsent}
                    onChange={(e) => setAgeConsent(e.target.checked)}
                    required
                    className="mt-0.5 rounded border-zinc-300 dark:border-zinc-750 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>
                    I confirm that I am <strong>18 years or older</strong> and agree to FasalMatrix&apos;s{' '}
                    <Link href="/terms" target="_blank" className="underline font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank" className="underline font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
              </div>

              {selectedRole === 'admin' && (
                <button
                  type="submit"
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Administrator Access</span>
                </button>
              )}
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Zero passwords needed. All accounts are tied to verified mobile OTPs and PM-KISAN / GSTIN identifiers.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
