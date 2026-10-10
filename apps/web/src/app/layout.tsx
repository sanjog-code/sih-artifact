import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider, LanguageCode } from '../context/LanguageContext';
import { cookies } from 'next/headers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FarmLink — Direct Agrarian Marketplace & Demand Intelligence',
  description:
    'Institutional produce trading infrastructure connecting verified farmers, WDRA-accredited warehouses, and bulk buyers with explainable AI pricing and T+1 escrow settlement.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('farmlink_lang')?.value as LanguageCode | undefined;
  const validLang: LanguageCode =
    cookieLang && ['en', 'hi', 'pa', 'mr', 'te', 'ta'].includes(cookieLang)
      ? cookieLang
      : 'en';

  return (
    <html
      lang={validLang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fafafa] text-zinc-900 font-sans">
        <LanguageProvider initialLanguage={validLang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
