// src/app/auth/reset-password/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Redirect if no token is present
  if (!token) {
    router.push('/auth/forgot-password');
    return null;
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to reset password');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login?reset=true');
      }, 2000);
    } catch {
      setError('An error occurred while resetting your password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>Reset Password</h2>
          <p className='mt-2 text-gray-600'>Enter your new password</p>
        </div>

        {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>{error}</div>}

        {success ? (
          <div className='text-center space-y-4'>
            <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
              Password reset successful! Redirecting to login...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className='mt-8 space-y-6'>
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                New Password
              </label>
              <input
                id='password'
                type='password'
                {...register('password')}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md'
              />
              {errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                Confirm New Password
              </label>
              <input
                id='confirmPassword'
                type='password'
                {...register('confirmPassword')}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md'
              />
              {errors.confirmPassword && <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword.message}</p>}
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className='text-center'>
              <Link href='/auth/login' className='text-sm text-blue-600 hover:text-blue-500'>
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
