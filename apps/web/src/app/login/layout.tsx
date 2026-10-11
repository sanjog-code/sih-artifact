import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Account Access & Mandi Verification',
  description:
    'Sign in to Fasal Matrix to manage farm crop listings, institutional procurement RFQs, cold-chain dispatches, or retail grocery orders.',
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
