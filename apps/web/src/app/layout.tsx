import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider, LanguageCode } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import AiAssistant from '../components/AiAssistant';
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
        <ThemeProvider>
          <LanguageProvider initialLanguage={validLang}>
            {children}
            <AiAssistant />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
