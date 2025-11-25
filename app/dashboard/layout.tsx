import { SensorStreamProvider } from '@/components';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SensorStreamProvider autoStart={true} interval={1000}>
      {children}
    </SensorStreamProvider>
  );
}
