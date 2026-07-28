import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://smart-pipe-x-git-main-vineeth-kundus-projects.vercel.app'
  ),
  title: {
    default: 'SmartPipeX | IoT Pipeline Leak Monitoring',
    template: '%s | SmartPipeX',
  },
  description:
    'A hardware-tested IoT pipeline monitoring system built with ESP32, Next.js, MongoDB, and real-time leak analytics.',
  applicationName: 'SmartPipeX',
  keywords: ['ESP32', 'IoT', 'pipeline monitoring', 'leak detection', 'Next.js', 'MongoDB'],
  authors: [{ name: 'Vineeth Kundu' }],
  creator: 'Vineeth Kundu',
  manifest: '/manifest.json',
  openGraph: {
    title: 'SmartPipeX | IoT Pipeline Leak Monitoring',
    description:
      'ESP32 sensor ingestion, leak classification, MongoDB storage, and a real-time operational dashboard.',
    type: 'website',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
