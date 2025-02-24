// src/app/(protected)/layout.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div>
      {/* Navigation Header */}
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex'>
              <div className='flex-shrink-0 flex items-center'>
                <Link href='/' className='text-xl font-bold text-gray-800'>
                  Dashboard
                </Link>
              </div>
              <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                {session?.user.role === 'admin' && (
                  <Link href='/admin' className='inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600'>
                    Admin
                  </Link>
                )}
                <Link href='/member' className='inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600'>
                  Member Area
                </Link>
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
                    <button onClick={handleSignOut} className='text-gray-600 hover:text-gray-900'>
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
            {session?.user.role === 'admin' && (
              <Link href='/admin' className='block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
                Admin
              </Link>
            )}
            <Link href='/member' className='block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
              Member Area
            </Link>
            <button
              onClick={handleSignOut}
              className='block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
