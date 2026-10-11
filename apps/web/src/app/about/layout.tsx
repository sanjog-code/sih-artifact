import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us & Agronomic Governance',
  description:
    'Fasal Matrix connects Indian farmers directly with bulk buyers and consumers with verified AGMARK grading, RBI nodal escrows, and CACP MSP price transparency.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Fasal Matrix — Agrarian Transparency & Mandi Economics',
    description:
      'Learn about our field infrastructure across Kota, Jaipur, Bhopal, and Ludhiana, our scientific advisory board, and our zero middleman mission.',
    url: 'https://fasalmatrix.in/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
