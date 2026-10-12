import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Escrow Dispute & Refund Policy',
  description:
    'Statutory refund policy and dispute resolution procedures for perishable and non-perishable agricultural produce trades under the Consumer Protection Act and RBI guidelines.',
  alternates: {
    canonical: '/refund-policy',
  },
  openGraph: {
    title: 'Refund Policy & Escrow Dispute Resolution | FasalMatrix',
    description:
      'Clear, auditable timelines for quality disputes, assay non-conformance, and 100% money-back escrow safeguards.',
    url: 'https://fasalmatrix.in/refund-policy',
  },
};

export default function RefundPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
