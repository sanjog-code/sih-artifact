import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy  -  Zero Ad Tracking Architecture',
  description:
    'Full registry of functional and security cookies used by FasalMatrix. We do not use third-party behavioral advertising or cross-site tracking pixels.',
  alternates: {
    canonical: '/cookie-policy',
  },
  openGraph: {
    title: 'Cookie Policy | FasalMatrix Agrarian Technologies',
    description:
      'Transparent documentation of the strictly functional cookies deployed to manage sessions, themes, and multi-language preferences.',
    url: 'https://fasalmatrix.in/cookie-policy',
  },
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
