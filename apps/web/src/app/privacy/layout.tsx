import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — DPDP Act 2023 Compliance',
  description:
    'Comprehensive data protection policy explaining purpose-limited processing of farmer KYC, bank details, geolocation, and order histories pursuant to the DPDP Act 2023.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Fasal Matrix Agrarian Technologies',
    description:
      'Learn how Fasal Matrix safeguards user data with end-to-end encryption, data minimization, and zero advertising broker sharing.',
    url: 'https://fasalmatrix.in/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
