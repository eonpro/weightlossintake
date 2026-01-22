'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

// Check if Clerk is configured (client-side check)
const isClerkConfigured = typeof window !== 'undefined' 
  ? !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  : true; // Assume configured during SSR, will hydrate correctly

function UserMenu() {
  if (!isClerkConfigured) {
    return (
      <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
        <span className="text-slate-600 text-sm font-medium">?</span>
      </div>
    );
  }

  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: 'w-9 h-9',
        },
      }}
    />
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-3">
                <img
                  src="https://static.wixstatic.com/media/c49a9b_f1c55bbf207b4082bdef7d23fd95f39e~mv2.png"
                  alt="EONMeds"
                  className="h-8 w-8 object-contain"
                />
                <span className="font-semibold text-slate-800">Admin</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/admin"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/submissions"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Submissions
                </Link>
                <Link
                  href="/admin/sync-status"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sync Status
                </Link>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
