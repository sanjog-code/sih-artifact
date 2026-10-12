import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Farmer Portal  -  List Produce & Guaranteed Mandi Payments',
  description:
    'Empowering Indian farmers to list wheat, mustard, tomato, and soybean crops with instant AGMARK grade assays, live APMC price baselines, and T+1 escrow payouts.',
  alternates: {
    canonical: '/farmer',
  },
  openGraph: {
    title: 'Farmer Portal  -  Direct Mandi Realization | FasalMatrix',
    description:
      'Sell crops directly to verified institutional buyers with 0% hidden commissions and guaranteed MSP floor protection.',
    url: 'https://fasalmatrix.in/farmer',
  },
};

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
