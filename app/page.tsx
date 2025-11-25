import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="mx-auto max-w-4xl px-8 py-16 text-center">
        <div className="mb-8">
          <Image
            className="mx-auto mb-8 dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={150}
            height={30}
            priority
          />
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Leak Detection System
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            A modern Next.js 14 application with App Router, TypeScript, and
            Tailwind CSS. Built with clean architecture and best practices.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-3xl">⚡</div>
            <h3 className="mb-2 text-lg font-semibold">Fast Performance</h3>
            <p className="text-gray-600">
              Built with Next.js 14 App Router for optimal performance and SEO.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-3xl">🎨</div>
            <h3 className="mb-2 text-lg font-semibold">Beautiful UI</h3>
            <p className="text-gray-600">
              Styled with Tailwind CSS for rapid and consistent design.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-3xl">🔧</div>
            <h3 className="mb-2 text-lg font-semibold">Type Safe</h3>
            <p className="text-gray-600">
              Full TypeScript support with ESLint and Prettier configuration.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              View Dashboard
            </Button>
          </Link>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Documentation
            </Button>
          </a>
        </div>

        <div className="mt-16 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            Project Structure
          </h2>
          <div className="grid gap-4 text-left md:grid-cols-2">
            <div>
              <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                /app/dashboard
              </code>
              <p className="mt-1 text-sm text-gray-600">Dashboard pages</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                /app/api
              </code>
              <p className="mt-1 text-sm text-gray-600">API routes</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                /components
              </code>
              <p className="mt-1 text-sm text-gray-600">Reusable components</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                /lib
              </code>
              <p className="mt-1 text-sm text-gray-600">Utility libraries</p>
            </div>
            <div>
              <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                /utils
              </code>
              <p className="mt-1 text-sm text-gray-600">Helper functions</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
