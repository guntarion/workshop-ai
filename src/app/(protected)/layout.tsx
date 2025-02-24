// src/app/(protected)/layout.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Handle authentication loading and redirect
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
  }, [session, status, router, pathname]);

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center text-gray-600'>Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Navigation Header */}
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex'>
              <div className='flex-shrink-0 flex items-center'>
                <Link href='/' className='text-xl font-bold text-gray-800'>
                  Workshop AI
                </Link>
              </div>

              <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                {isAdmin && (
                  <Link
                    href='/admin'
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/admin')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {/* <Link
                  href='/member/studi-kasus/rekomendasi-judul'
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname?.includes('/rekomendasi-judul')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Panduan Prompt Judul
                </Link> */}
              </div>
            </div>

            <div className='flex items-center'>
              <div className='hidden sm:flex sm:items-center sm:ml-6'>
                <div className='relative'>
                  <div className='flex items-center space-x-4'>
                    <div className='text-sm'>
                      <span className='text-gray-700'>{session?.user?.name}</span>
                      <span className='text-gray-500 text-xs ml-2'>({session?.user?.role})</span>
                    </div>
                    <button onClick={handleSignOut} className='text-gray-500 hover:text-gray-700'>
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className='sm:hidden'>
          <div className='pt-2 pb-3 space-y-1'>
            {isAdmin && (
              <Link
                href='/admin'
                className={`block pl-3 pr-4 py-2 text-base font-medium ${
                  pathname?.startsWith('/admin') ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              href='/member/studi-kasus/rekomendasi-judul'
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                pathname?.includes('/rekomendasi-judul') ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Panduan Prompt Judul
            </Link>
            <Link
              href='/member/studi-kasus/manfaat-finansial'
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                pathname?.includes('/manfaat-finansial') ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Analisis Finansial
            </Link>
            <button
              onClick={handleSignOut}
              className='block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>{children}</main>
    </div>
  );
}
