import { Breadcrumbs, DashboardNavbar, SensorStreamProvider } from '@/components';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SensorStreamProvider>
      <div className="min-h-screen bg-slate-50">
        <DashboardNavbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </SensorStreamProvider>
  );
}
