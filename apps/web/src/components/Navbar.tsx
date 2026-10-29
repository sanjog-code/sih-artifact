'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
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
} from 'lucide-react';

interface NavbarProps {
  onOpenInquiry?: () => void;
}

export default function Navbar({ onOpenInquiry }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
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
  const isHomePage = pathname === '/';

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm tracking-tighter group-hover:bg-primary-hover transition">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-secondary group-hover:text-primary transition">
                {t?.nav?.brand || 'FarmLink'}
              </span>
              <span className="text-[10px] text-text-muted font-mono tracking-wider uppercase -mt-1 hidden sm:block">
                {t?.nav?.tagline || 'Direct Agrarian Network'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-text-muted">
            <Link
              href="/"
              className={`hover:text-secondary transition flex items-center gap-1 ${
                isHomePage
                  ? 'text-secondary font-semibold'
                  : ''
              }`}
            >
              <span>{t?.nav?.home || 'Overview'}</span>
            </Link>
            <Link
              href="/farmer"
              className={`hover:text-secondary transition flex items-center gap-1 ${
                isFarmerPage
                  ? 'text-primary font-semibold underline underline-offset-4 decoration-primary'
                  : ''
              }`}
            >
              <span>{navFarmer}</span>
            </Link>
            <Link
              href="/buyer"
              className={`hover:text-secondary transition flex items-center gap-1 ${
                isBuyerPage
                  ? 'text-primary font-semibold underline underline-offset-4 decoration-primary'
                  : ''
              }`}
            >
              <span>{navBuyer}</span>
            </Link>
            <Link
              href="/consumer"
              className={`hover:text-secondary transition flex items-center gap-1 ${
                isConsumerPage
                  ? 'text-primary font-semibold underline underline-offset-4 decoration-primary'
                  : ''
              }`}
            >
              <span>{navConsumer}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary-light text-primary-text font-bold uppercase">
                {t?.nav?.badgeNew || 'New'}
              </span>
            </Link>
            <Link
              href="/logistics"
              className={`hover:text-secondary transition flex items-center gap-1 ${
                isLogisticsPage
                  ? 'text-primary font-semibold underline underline-offset-4 decoration-primary'
                  : ''
              }`}
            >
              <span>{navLogistics}</span>
            </Link>
            <Link
              href="/#marketplace"
              className="hover:text-secondary transition flex items-center gap-1"
            >
              <span>{navMarket}</span>
            </Link>
            <Link
              href="/#advisory"
              className="hover:text-secondary transition flex items-center gap-1"
            >
              <span>{navAdvisory}</span>
            </Link>
            <Link
              href="/about"
              className={`hover:text-secondary transition flex items-center gap-1.5 ${
                isAboutPage
                  ? 'text-primary font-semibold underline underline-offset-4 decoration-primary'
                  : ''
              }`}
            >
              <span>{navAbout}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            </Link>
          </nav>

          {/* Right Controls: Language Selector & Portal Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text bg-background border border-border rounded-lg hover:bg-background-alt transition"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-text-muted" />
                <span>{LANGUAGES.find((l) => l.code === language)?.native}</span>
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-lg border border-border py-1 z-50 text-xs"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-text-muted tracking-wider border-b border-border">
                    {t.nav.selectLanguage}
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as LanguageCode);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-background-alt transition ${
                        language === lang.code
                          ? 'font-bold text-primary bg-primary-light/50'
                          : 'text-text'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-text-muted">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inquire Button */}
            <button
              onClick={onOpenInquiry}
              className="text-xs font-semibold text-text-muted hover:text-secondary px-2.5 py-1.5 rounded-lg hover:bg-background-alt transition"
            >
              {navContact}
            </button>

            {/* Portal Action Button with Persona Selector Dropdown */}
            <div className="relative" ref={portalDropdownRef}>
              <button
                type="button"
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="text-xs font-semibold bg-primary text-white hover:bg-primary-hover px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                aria-haspopup="true"
                aria-expanded={portalDropdownOpen}
              >
                <span>{navPortalLogin}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-text-light transition-transform ${
                    portalDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {portalDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-border p-2 z-50 text-xs">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border mb-1">
                    {t.nav.selectRole}
                  </div>

                  <Link
                    href="/farmer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-primary-light/50 transition group"
                  >
                    <div className="p-1.5 rounded-md bg-primary-light text-primary group-hover:bg-primary group-hover:text-white shrink-0 mt-0.5">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-secondary flex items-center gap-1">
                        {t.nav.farmerRoleTitle}
                        <ArrowUpRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {t.nav.farmerRoleDesc}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/buyer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-blue-50/70 transition group"
                  >
                    <div className="p-1.5 rounded-md bg-blue-100 text-blue-800 group-hover:bg-blue-200 shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-secondary flex items-center gap-1">
                        {t.nav.buyerRoleTitle}
                        <ArrowUpRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {t.nav.buyerRoleDesc}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/consumer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-amber-50/70 transition group"
                  >
                    <div className="p-1.5 rounded-md bg-amber-100 text-amber-800 group-hover:bg-amber-200 shrink-0 mt-0.5">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-secondary flex items-center gap-1">
                        {t.nav.consumerRoleTitle}
                        <ArrowUpRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {t.nav.consumerRoleDesc}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/logistics"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-purple-50/70 transition group"
                  >
                    <div className="p-1.5 rounded-md bg-purple-100 text-purple-800 group-hover:bg-purple-200 shrink-0 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-secondary flex items-center gap-1">
                        {t.nav.logisticsRoleTitle}
                        <ArrowUpRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {t.nav.logisticsRoleDesc}
                      </div>
                    </div>
                  </Link>

                  <div className="mt-1 pt-1.5 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onOpenInquiry?.();
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-background-alt transition flex items-center justify-between text-text"
                    >
                      <span className="flex items-center gap-2">
                        <FileQuestion className="w-3.5 h-3.5 text-text-muted" />
                        <span>{t.nav.inquiryTitle}</span>
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-text-muted" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-1.5 rounded-lg text-text-muted hover:bg-background-alt border border-border"
              aria-label="Toggle language menu"
            >
              <Globe className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-text-muted hover:bg-background-alt border border-border"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Language Dropdown */}
        {langDropdownOpen && (
          <div className="lg:hidden py-2 border-t border-border bg-background-alt px-2 rounded-b-lg mb-2">
            <div className="grid grid-cols-3 gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as LanguageCode);
                    setLangDropdownOpen(false);
                  }}
                  className={`text-xs py-1.5 px-2 rounded border text-center ${
                    language === lang.code
                      ? 'bg-primary text-white border-primary font-bold'
                      : 'bg-white text-text border-border'
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
          <div className="lg:hidden py-4 border-t border-border space-y-3 bg-white">
            <nav className="flex flex-col space-y-1.5 text-sm font-medium text-text">
              <Link
                href="/farmer"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  isFarmerPage ? 'bg-primary-light text-primary font-bold' : 'hover:bg-background-alt'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sprout className="w-4 h-4 text-primary" />
                  <span>{navFarmer}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary-light text-primary">
                  {t.nav.badgeDirect}
                </span>
              </Link>

              <Link
                href="/buyer"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  isBuyerPage ? 'bg-primary-light text-primary font-bold' : 'hover:bg-background-alt'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>{navBuyer}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  {t.nav.badgeRfq}
                </span>
              </Link>

              <Link
                href="/consumer"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  isConsumerPage ? 'bg-primary-light text-primary font-bold' : 'hover:bg-background-alt'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-amber-700" />
                  <span>{navConsumer}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                  {t.nav.badgeShop}
                </span>
              </Link>

              <Link
                href="/logistics"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  isLogisticsPage ? 'bg-primary-light text-primary font-bold' : 'hover:bg-background-alt'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-purple-700" />
                  <span>{navLogistics}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                  {t.nav.badgeFleet}
                </span>
              </Link>

              <div className="my-1 border-t border-border" />

              <Link
                href="/#marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-background-alt flex items-center gap-2.5"
              >
                <Store className="w-4 h-4 text-text-muted" />
                <span>{navMarket}</span>
              </Link>

              <Link
                href="/#advisory"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-background-alt flex items-center gap-2.5"
              >
                <TrendingUp className="w-4 h-4 text-text-muted" />
                <span>{navAdvisory}</span>
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2.5 ${
                  isAboutPage ? 'bg-primary-light text-primary font-semibold' : 'hover:bg-background-alt'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>{navAbout}</span>
              </Link>
            </nav>

            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInquiry?.();
                }}
                className="w-full text-center py-2.5 text-xs font-semibold bg-primary text-white rounded-lg shadow-sm"
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