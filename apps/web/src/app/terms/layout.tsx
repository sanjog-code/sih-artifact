import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service  -  Institutional Agricultural Trading',
  description:
    'Legal framework, platform covenants, MSP floor guidelines, and RBI-regulated nodal escrow terms governing transactions on the FasalMatrix network.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service | FasalMatrix Agrarian Technologies',
    description:
      'Statutory terms for farmers, procurement enterprises, and retail consumers under the Information Technology Act 2000.',
    url: 'https://fasalmatrix.in/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
