import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout & Escrow Settlement',
  description:
    'Complete direct agrarian purchase transactions with upfront pricing, itemized logistics, statutory fee disclosures, and encrypted payment processing.',
  alternates: {
    canonical: '/checkout',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
