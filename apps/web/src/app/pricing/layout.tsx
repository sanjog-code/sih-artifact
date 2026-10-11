import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Transparent Plans - FarmLink Premier',
  description:
    'Explore FarmLink Premier pricing models: 2-5% commission for farmers with zero monthly fees, high-value B2B procurement suites, and affordable consumer memberships.',
  alternates: {
    canonical: 'https://fasalmatrix.in/pricing',
  },
  openGraph: {
    title: 'FarmLink Premier - Transparent Monetization & Plans',
    description:
      'Fair, single-digit farmer commissions and transparent B2B & consumer subscriptions for agricultural trade.',
    url: 'https://fasalmatrix.in/pricing',
    type: 'website',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
