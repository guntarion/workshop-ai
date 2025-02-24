// src/app/(protected)/member/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MemberDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !['admin', 'member'].includes(session.user.role)) {
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
        <h1 className='text-3xl font-bold mb-6'>Member Dashboard</h1>

        <div className='bg-white shadow rounded-lg p-6'>
          <div className='space-y-6'>
            <div>
              <h2 className='text-xl font-semibold mb-4'>Welcome, {session?.user?.name}</h2>
              <p className='text-gray-600'>You are logged in as a member. You have access to member-only content and features.</p>
            </div>

            <div className='border-t pt-6'>
              <h3 className='text-lg font-medium mb-4'>Your Account</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <h4 className='font-medium'>Profile Information</h4>
                  <div className='mt-2 space-y-2'>
                    <p className='text-sm text-gray-600'>Email: {session?.user?.email}</p>
                    <p className='text-sm text-gray-600'>Role: {session?.user?.role}</p>
                  </div>
                </div>
                <div className='p-4 bg-green-50 rounded-lg'>
                  <h4 className='font-medium'>Account Status</h4>
                  <div className='mt-2'>
                    <span className='px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full'>Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='border-t pt-6'>
              <h3 className='text-lg font-medium mb-4'>Member Features</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='p-4 bg-purple-50 rounded-lg'>
                  <h4 className='font-medium'>My Content</h4>
                  <p className='text-sm text-gray-600'>Access your personal content</p>
                </div>
                <div className='p-4 bg-yellow-50 rounded-lg'>
                  <h4 className='font-medium'>Resources</h4>
                  <p className='text-sm text-gray-600'>Browse member resources</p>
                </div>
                <div className='p-4 bg-indigo-50 rounded-lg'>
                  <h4 className='font-medium'>Support</h4>
                  <p className='text-sm text-gray-600'>Get help and support</p>
                </div>
              </div>
            </div>

            <div className='border-t pt-6'>
              <h3 className='text-lg font-medium mb-4'>Recent Activity</h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <span className='text-sm font-medium'>Last Login</span>
                  <span className='text-sm text-gray-600'>{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
