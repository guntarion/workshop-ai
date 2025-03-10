// src/app/auth/login/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      // Redirect to callback URL or default page
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleSignIn = () => {
  //   signIn('google', { callbackUrl });
  // };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <Image
            src="/images/logo-pln-nps.png"
            alt="PLN NPS Logo"
            width={200}
            height={80}
            className="mx-auto mb-6"
            priority
          />
          <h2 className='text-3xl font-bold'>Sign In</h2>
          <p className='mt-2 text-gray-600'>Welcome back!</p>
        </div>

        {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className='mt-8 space-y-6'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <input id='email' type='email' {...register('email')} className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md' />
            {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <input
              id='password'
              type='password'
              {...register('password')}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md'
            />
            {errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>}
          </div>

          <div className='flex items-center justify-between'>
            <Link href='/auth/forgot-password' className='text-sm text-blue-600 hover:text-blue-500'>
              Forgot password?
            </Link>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            type='button'
            className='mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'
          >
            <svg className='h-5 w-5 mr-2' viewBox='0 0 24 24'>
              <path
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                fill='#4285F4'
              />
              <path
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                fill='#34A853'
              />
              <path
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                fill='#FBBC05'
              />
              <path
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                fill='#EA4335'
              />
            </svg>
            Sign in with Google
          </button>
        </div> */}

        <div className='text-center mt-4'>
          <p className='text-sm text-gray-600'>
            Don&apos;t have an account?{' '}
            <Link href='/auth/register' className='text-blue-600 hover:text-blue-500'>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
