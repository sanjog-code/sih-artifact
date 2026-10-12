import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agrarian Logistics & Cold-Chain Fleet Routing',
  description:
    'Vehicle routing optimization and multi-chamber reefer tracking for agricultural transit from mandi terminals to industrial processing facilities.',
  alternates: {
    canonical: '/logistics',
  },
  openGraph: {
    title: 'Agrarian Fleet & Multi-Chamber Reefer Routing | FasalMatrix',
    description:
      'Monitor cold chain telemetry, multi-stop farm pickups, and transit weighbridge checks across regional corridors.',
    url: 'https://fasalmatrix.in/logistics',
  },
};

export default function LogisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
