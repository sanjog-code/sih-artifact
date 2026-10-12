import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider, LanguageCode } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import AiAssistant from '../components/AiAssistant';
import ConsumerAiShoppingAdvisor from '../components/ConsumerAiShoppingAdvisor';
import FarmerAiListingAdvisor from '../components/FarmerAiListingAdvisor';
import PwaRegister from '../components/PwaRegister';
import CookieConsentBanner from '../components/CookieConsentBanner';
import JsonLd from '../components/JsonLd';
import MobileBottomNav from '../components/MobileBottomNav';
import { cookies } from 'next/headers';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fasal Matrix Agrarian Technologies',
  alternateName: 'Fasal Matrix',
  url: 'https://fasalmatrix.in',
  logo: 'https://fasalmatrix.in/icon-192.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-1800-889-2603',
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi', 'Punjabi', 'Marathi', 'Telugu', 'Tamil'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Muhana Terminal, Sanganer',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    postalCode: '302029',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://twitter.com/fasalmatrix',
    'https://linkedin.com/company/fasal-matrix',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Fasal Matrix',
  url: 'https://fasalmatrix.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://fasalmatrix.in/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fasalmatrix.in'),
  title: {
    default: 'Fasal Matrix  -  Direct Agrarian Marketplace & Mandi MSP Intelligence',
    template: '%s | Fasal Matrix',
  },
  description:
    'Direct farm-to-doorstep trade across India. Real-time mandi price intelligence, verified crop quality grading, and guaranteed T+1 escrow settlement with zero middleman deductions.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/icon.svg',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Fasal Matrix  -  Direct Agrarian Marketplace & Mandi Intelligence',
    description:
      'Direct farm-to-doorstep agricultural commerce in India with real-time APMC/e-NAM price discovery and T+1 bank escrows.',
    url: 'https://fasalmatrix.in',
    siteName: 'Fasal Matrix',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fasal Matrix  -  Direct Agrarian Marketplace',
    description:
      'Direct farm-to-doorstep agricultural commerce in India with real-time APMC/e-NAM price discovery and T+1 bank escrows.',
  },
};

export const viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('farmlink_lang')?.value as LanguageCode | undefined;
  const validLang: LanguageCode =
    cookieLang && ['en', 'hi', 'pa', 'mr', 'te', 'ta', 'bn', 'gu', 'kn', 'ml', 'or', 'as', 'ur', 'sa', 'ne', 'sd', 'ks', 'kok', 'mni', 'brx', 'mai', 'sat', 'doi'].includes(cookieLang)
      ? cookieLang
      : 'en';

  return (
    <html
      lang={validLang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-xl focus:font-bold focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider initialLanguage={validLang}>
              <div className="flex-1 flex flex-col pb-16 md:pb-0">
                {children}
              </div>
              <MobileBottomNav />
              <AiAssistant />
              <ConsumerAiShoppingAdvisor />
              <FarmerAiListingAdvisor />
              <PwaRegister />
              <CookieConsentBanner />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
