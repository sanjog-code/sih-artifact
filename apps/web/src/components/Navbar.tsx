'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Languages,
  Menu,
  X,
  Sprout,
  Building2,
  ShoppingCart,
  TrendingUp,
  ShieldCheck,
  Sun,
  Moon,
  Lock,
  Sliders,
  LogOut,
  User,
} from 'lucide-react';

interface NavbarProps {
  onOpenInquiry?: () => void;
}

export default function Navbar({ onOpenInquiry }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { role, userIdentifier, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isAboutPage = pathname === '/about';
  const isFarmerPage = pathname === '/farmer';
  const isBuyerPage = pathname === '/buyer';
  const isConsumerPage = pathname === '/consumer';
  const isAdminPage = pathname === '/admin' || pathname === '/logistics';
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/';

  // Safe translation accessors
  const navConsumer = (t?.nav as Record<string, string>)?.consumer || 'Consumer Hub';
  const navAdvisory = t?.nav?.advisory || 'Price Advisory';
  const navFarmer = t?.nav?.farmer || 'Farmer Hub';
  const navBuyer = t?.nav?.buyer || 'Buyer & Vendor Desk';
  const navAbout = t?.nav?.about || 'About Us';
  const navContact = t?.nav?.contact || 'Inquire';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm tracking-tighter group-hover:bg-emerald-800 dark:group-hover:bg-emerald-500 transition">
              <Sprout className="w-4 h-4 text-emerald-400 dark:text-emerald-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-900 dark:group-hover:text-emerald-400 transition">
                {t?.nav?.brand || 'Fasal Matrix'}
              </span>
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono tracking-wider uppercase -mt-1 hidden sm:block">
                {t?.nav?.tagline || 'Direct Agrarian Network'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation: STRICT ROLE-BASED VISIBILITY */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {/* Universal Links */}
            <Link
              href="/"
              className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1 ${
                isHomePage
                  ? 'text-zinc-900 dark:text-white font-semibold'
                  : ''
              }`}
            >
              <span>{t?.nav?.home || 'Overview'}</span>
            </Link>

            {/* FARMER ONLY TAB: Visible ONLY when role === 'farmer' */}
            {role === 'farmer' && (
              <Link
                href="/farmer"
                className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1.5 ${
                  isFarmerPage
                    ? 'text-emerald-900 dark:text-emerald-400 font-semibold underline underline-offset-4 decoration-emerald-600'
                    : 'text-emerald-800 dark:text-emerald-400'
                }`}
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>{navFarmer}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase font-mono">
                  Producer
                </span>
              </Link>
            )}

            {/* BULK BUYER ONLY TAB: Visible ONLY when role === 'buyer' */}
            {role === 'buyer' && (
              <Link
                href="/buyer"
                className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1.5 ${
                  isBuyerPage
                    ? 'text-blue-900 dark:text-blue-400 font-semibold underline underline-offset-4 decoration-blue-600'
                    : 'text-blue-800 dark:text-blue-400'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{navBuyer}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold uppercase font-mono">
                  Bulk
                </span>
              </Link>
            )}

            {/* CONSUMER ONLY TAB: Visible ONLY when role === 'consumer' */}
            {role === 'consumer' && (
              <Link
                href="/consumer"
                className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1.5 ${
                  isConsumerPage
                    ? 'text-amber-900 dark:text-amber-400 font-semibold underline underline-offset-4 decoration-amber-600'
                    : 'text-amber-800 dark:text-amber-400'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                <span>{navConsumer}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold uppercase font-mono">
                  Direct
                </span>
              </Link>
            )}

            {/* ADMIN ONLY TAB: Visible ONLY when role === 'admin' */}
            {role === 'admin' && (
              <Link
                href="/admin"
                className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1.5 ${
                  isAdminPage
                    ? 'text-purple-900 dark:text-purple-400 font-semibold underline underline-offset-4 decoration-purple-600'
                    : 'text-purple-800 dark:text-purple-400'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin & Fleet Command</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold uppercase font-mono">
                  Console
                </span>
              </Link>
            )}

            {/* Universal Price Advisory Link */}
            <Link
              href="/#advisory"
              className="hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1"
            >
              <span>{navAdvisory}</span>
            </Link>

            {/* Universal About Us Link */}
            <Link
              href="/about"
              className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1.5 ${
                isAboutPage
                  ? 'text-emerald-800 dark:text-emerald-400 font-semibold underline underline-offset-4 decoration-emerald-600'
                  : ''
              }`}
            >
              <span>{navAbout}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 dark:bg-emerald-400" />
            </Link>
          </nav>

          {/* Right Controls: Theme Toggle, Language Selector & Role Identity */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Dark Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 rounded-md transition border border-zinc-200 dark:border-zinc-800"
              aria-label="Toggle Dark / Light Theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {/* Language Selector Dropdown (Scrollable 22 languages) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 rounded-md transition border border-zinc-200 dark:border-zinc-800"
                aria-label="Select Language / भाषा चुनें"
                title="Change Language (22 Official Languages Supported)"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{LANGUAGES.find((l) => l.code === language)?.native || 'English'}</span>
                <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                  अ/A
                </span>
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-48 max-h-72 overflow-y-auto bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 py-1 z-50 text-xs"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  <div className="sticky top-0 bg-white dark:bg-zinc-900 px-3 py-1.5 text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider border-b border-zinc-100 dark:border-zinc-800 z-10">
                    {t.nav.selectLanguage} (22)
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as LanguageCode);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition ${
                        language === lang.code
                          ? 'font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inquire Button */}
            <button
              onClick={onOpenInquiry}
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              {navContact}
            </button>

            {/* Authentication & Role Pill (NO generic access portal dropdown!) */}
            {isAuthenticated && role ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">
                    {userIdentifier || role.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                    {role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out / Switch Identity"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-xs ${
                  isLoginPage
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Header Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1"
              aria-label="Toggle language menu"
              title="Change Language"
            >
              <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">अ</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Language Dropdown */}
        {langDropdownOpen && (
          <div className="lg:hidden py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 rounded-b-lg mb-2 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as LanguageCode);
                    setLangDropdownOpen(false);
                  }}
                  className={`text-xs py-1.5 px-2 rounded border text-center transition ${
                    language === lang.code
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-bold'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Menu Drawer: STRICT ROLE-BASED VISIBILITY */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-white dark:bg-zinc-950">
            {/* Active Identity Pill on Mobile */}
            {isAuthenticated && role && (
              <div className="px-3 py-2 mx-1 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-500" />
                  <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
                    {userIdentifier || role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            <nav className="flex flex-col space-y-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg ${
                  isHomePage ? 'bg-zinc-100 dark:bg-zinc-900 font-bold text-zinc-950 dark:text-white' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                Overview
              </Link>

              {/* FARMER ONLY (Mobile) */}
              {role === 'farmer' && (
                <Link
                  href="/farmer"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                    isFarmerPage ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-300 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sprout className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>{navFarmer}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                    Producer
                  </span>
                </Link>
              )}

              {/* BUYER ONLY (Mobile) */}
              {role === 'buyer' && (
                <Link
                  href="/buyer"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                    isBuyerPage ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-950 dark:text-blue-300 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <span>{navBuyer}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold">
                    Bulk
                  </span>
                </Link>
              )}

              {/* CONSUMER ONLY (Mobile) */}
              {role === 'consumer' && (
                <Link
                  href="/consumer"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                    isConsumerPage ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-300 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>{navConsumer}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold">
                    Direct
                  </span>
                </Link>
              )}

              {/* ADMIN ONLY (Mobile) */}
              {role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                    isAdminPage ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-950 dark:text-purple-300 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                    <span>Admin & Fleet Command</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold">
                    Console
                  </span>
                </Link>
              )}

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              <Link
                href="/#advisory"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2.5"
              >
                <TrendingUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>{navAdvisory}</span>
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2.5 ${
                  isAboutPage ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-semibold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{navAbout}</span>
              </Link>

              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold flex items-center justify-center gap-2 mt-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </nav>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInquiry?.();
                }}
                className="w-full text-center py-2.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {navContact} / Institutional Desk
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
