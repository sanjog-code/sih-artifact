'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Globe,
  Menu,
  X,
  ArrowUpRight,
  Sprout,
  Building2,
  Truck,
  ShoppingCart,
  TrendingUp,
  Store,
  ChevronDown,
  ShieldCheck,
  FileQuestion,
  Sun,
  Moon,
  Lock,
  Sliders,
} from 'lucide-react';

interface NavbarProps {
  onOpenInquiry?: () => void;
}

export default function Navbar({ onOpenInquiry }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const pathname = usePathname();
  const portalDropdownRef = useRef<HTMLDivElement>(null);

  const isAboutPage = pathname === '/about';
  const isFarmerPage = pathname === '/farmer';
  const isBuyerPage = pathname === '/buyer';
  const isLogisticsPage = pathname === '/logistics';
  const isConsumerPage = pathname === '/consumer';
  const isAdminPage = pathname === '/admin';
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/';

  // Close portal dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        portalDropdownRef.current &&
        !portalDropdownRef.current.contains(event.target as Node)
      ) {
        setPortalDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Safe translation accessors
  const navConsumer = (t?.nav as Record<string, string>)?.consumer || 'Consumer Hub';
  const navAdvisory = t?.nav?.advisory || 'Price Advisory';
  const navMarket = t?.nav?.market || 'Live Market';
  const navFarmer = t?.nav?.farmer || 'Farmer Hub';
  const navBuyer = t?.nav?.buyer || 'Buyer & Vendor Desk';
  const navLogistics = t?.nav?.logistics || 'Logistics Command';
  const navAbout = t?.nav?.about || 'About Us';
  const navContact = t?.nav?.contact || 'Inquire';
  const navPortalLogin = t?.nav?.portalLogin || 'Access Portals';

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
                {t?.nav?.brand || 'FarmLink'}
              </span>
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono tracking-wider uppercase -mt-1 hidden sm:block">
                {t?.nav?.tagline || 'Direct Agrarian Network'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-zinc-600 dark:text-zinc-300">
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
            <Link
              href="/farmer"
              className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1 ${
                isFarmerPage
                  ? 'text-emerald-900 dark:text-emerald-400 font-semibold underline underline-offset-4 decoration-emerald-600'
                  : ''
              }`}
            >
              <span>{navFarmer}</span>
            </Link>
            <Link
              href="/buyer"
              className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1 ${
                isBuyerPage
                  ? 'text-emerald-900 dark:text-emerald-400 font-semibold underline underline-offset-4 decoration-emerald-600'
                  : ''
              }`}
            >
              <span>{navBuyer}</span>
            </Link>
            <Link
              href="/consumer"
              className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1 ${
                isConsumerPage
                  ? 'text-emerald-900 dark:text-emerald-400 font-semibold underline underline-offset-4 decoration-emerald-600'
                  : ''
              }`}
            >
              <span>{navConsumer}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase">
                {t?.nav?.badgeNew || 'New'}
              </span>
            </Link>
            <Link
              href="/admin"
              className={`hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1 ${
                isAdminPage
                  ? 'text-emerald-900 dark:text-emerald-400 font-semibold underline underline-offset-4 decoration-emerald-600'
                  : ''
              }`}
            >
              <span>Admin & Fleet</span>
            </Link>
            <Link
              href="/#marketplace"
              className="hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1"
            >
              <span>{navMarket}</span>
            </Link>
            <Link
              href="/#advisory"
              className="hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1"
            >
              <span>{navAdvisory}</span>
            </Link>
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

          {/* Right Controls: Theme Toggle, Language Selector & Portal Actions */}
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
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>{LANGUAGES.find((l) => l.code === language)?.native || 'English'}</span>
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

            {/* Login Direct Link */}
            <Link
              href="/login"
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition flex items-center gap-1 ${
                isLoginPage
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Lock className="w-3 h-3 text-zinc-500" />
              <span>Sign In</span>
            </Link>

            {/* Inquire Button */}
            <button
              onClick={onOpenInquiry}
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              {navContact}
            </button>

            {/* Portal Action Button with Persona Selector Dropdown */}
            <div className="relative" ref={portalDropdownRef}>
              <button
                type="button"
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-3 py-1.5 rounded-md transition flex items-center gap-1.5 shadow-xs"
                aria-haspopup="true"
                aria-expanded={portalDropdownOpen}
              >
                <span>{navPortalLogin}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 transition-transform ${
                    portalDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {portalDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-2 z-50 text-xs">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    {t.nav.selectRole}
                  </div>

                  <Link
                    href="/farmer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition group"
                  >
                    <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 shrink-0 mt-0.5">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        {t.nav.farmerRoleTitle}
                        <ArrowUpRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {t.nav.farmerRoleDesc}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/buyer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition group"
                  >
                    <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        {t.nav.buyerRoleTitle}
                        <ArrowUpRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {t.nav.buyerRoleDesc}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/consumer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-amber-50/70 dark:hover:bg-amber-950/40 transition group"
                  >
                    <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 group-hover:bg-amber-200 dark:group-hover:bg-amber-800 shrink-0 mt-0.5">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        {t.nav.consumerRoleTitle}
                        <ArrowUpRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {t.nav.consumerRoleDesc}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-purple-50/70 dark:hover:bg-purple-950/40 transition group"
                  >
                    <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 shrink-0 mt-0.5">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        Admin & Logistics Command
                        <ArrowUpRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        VRP dispatch routing, RBI escrow audit & FPO ledger
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition group border-t border-zinc-100 dark:border-zinc-800 mt-1"
                  >
                    <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        Dedicated Login Desk
                        <ArrowUpRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Separate login for Bulk Buyer, Farmer, Consumer & Admin
                      </div>
                    </div>
                  </Link>

                  <div className="mt-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onOpenInquiry?.();
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-between text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="flex items-center gap-2">
                        <FileQuestion className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        <span>{t.nav.inquiryTitle}</span>
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu & Language Toggle */}
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
              className="p-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              aria-label="Toggle language menu"
            >
              <Globe className="w-4 h-4" />
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

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-white dark:bg-zinc-950">
            <nav className="flex flex-col space-y-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  {t.nav.badgeDirect}
                </span>
              </Link>

              <Link
                href="/buyer"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  isBuyerPage ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-300 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>{navBuyer}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {t.nav.badgeRfq}
                </span>
              </Link>

              <Link
                href="/consumer"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  isConsumerPage ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-300 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>{navConsumer}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold">
                  {t.nav.badgeShop}
                </span>
              </Link>

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  isAdminPage ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-300 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span>Admin & Fleet Command</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  Command
                </span>
              </Link>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  isLoginPage ? 'bg-zinc-100 dark:bg-zinc-900 font-bold text-zinc-950 dark:text-white' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>Dedicated Login Desk</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  Auth
                </span>
              </Link>

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              <Link
                href="/#marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2.5"
              >
                <Store className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>{navMarket}</span>
              </Link>

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
            </nav>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInquiry?.();
                }}
                className="w-full text-center py-2.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg shadow-xs"
              >
                {navContact} / {t.nav.institutionalDesk}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
