import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bulk Buyer & Institutional Procurement Portal',
  description:
    'Direct B2B agrarian sourcing platform for mills, food processors, and FMCG brands. Source certified AGMARK grain lots and vegetables with cold-chain provenance.',
  alternates: {
    canonical: '/buyer',
  },
  openGraph: {
    title: 'Institutional Agri-Procurement — Fasal Matrix',
    description:
      'Procure quintal and metric ton produce directly from verified FPOs and mandi depots across northern India with automated RFQs and escrow settlement.',
    url: 'https://fasalmatrix.in/buyer',
  },
};

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
