import {
  SensorStreamProvider,
  DashboardNavbar,
  Breadcrumbs,
} from '@/components';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SensorStreamProvider autoStart={true} interval={1000}>
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-8 pt-6">
            <Breadcrumbs />
          </div>
          {children}
        </main>
      </div>
    </SensorStreamProvider>
  );
}
