import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fresh Consumer Marketplace — Farm-to-Doorstep Groceries',
  description:
    'Order fresh harvest directly from rural farms: Sharbati wheat, cold-pressed mustard oil, tomatoes, and organic potatoes with 100% farm-gate origin traceability.',
  alternates: {
    canonical: '/consumer',
  },
  openGraph: {
    title: 'Fresh Produce Direct from Indian Farms — Fasal Matrix',
    description:
      'Support Indian farmers directly. Zero middlemen markups, authentic origin verification, and certified fresh doorstep delivery.',
    url: 'https://fasalmatrix.in/consumer',
  },
};

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
