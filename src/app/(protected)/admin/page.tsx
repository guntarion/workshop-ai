// src/app/(protected)/admin/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>

        <div className='bg-white shadow rounded-lg p-6'>
          <div className='space-y-6'>
            <div>
              <h2 className='text-xl font-semibold mb-4'>Welcome, {session?.user?.name}</h2>
              <p className='text-gray-600'>You are logged in as an administrator. You have access to all administrative functions.</p>
            </div>

            <div className='border-t pt-6'>
              <h3 className='text-lg font-medium mb-4'>Admin Functions</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <h4 className='font-medium'>User Management</h4>
                  <p className='text-sm text-gray-600'>Manage user accounts and roles</p>
                </div>
                <div className='p-4 bg-green-50 rounded-lg'>
                  <h4 className='font-medium'>Content Management</h4>
                  <p className='text-sm text-gray-600'>Manage site content and settings</p>
                </div>
                <div className='p-4 bg-purple-50 rounded-lg'>
                  <h4 className='font-medium'>Analytics</h4>
                  <p className='text-sm text-gray-600'>View site statistics and reports</p>
                </div>
              </div>
            </div>

            <div className='border-t pt-6'>
              <h3 className='text-lg font-medium mb-4'>System Status</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <span className='text-sm font-medium'>System Status</span>
                  <span className='px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full'>Online</span>
                </div>
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <span className='text-sm font-medium'>Last Backup</span>
                  <span className='text-sm text-gray-600'>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
