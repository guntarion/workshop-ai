// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './HomePage.module.css';

/**
 * Main landing page component for the Workshop Pengoptimalan AI.
 * This component displays the title, date, and a brief explanation about the importance of optimizing AI for productivity.
 * It also handles authentication state and redirects to the appropriate pages.
 */
const HomePage: React.FC = () => {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className={styles.container}>
      {session && (
        <div className='fixed top-0 right-0 m-4 flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-md'>
          <div className='flex flex-col items-end'>
            <span className='text-sm font-medium text-gray-900'>{session.user?.name}</span>
            <span className='text-xs text-gray-500'>{session.user?.email}</span>
            {/* Display role for debugging */}
            <span className='text-xs text-blue-500'>Role: {session.user?.role || 'none'}</span>
          </div>
          <button onClick={handleSignOut} className='text-sm text-red-600 hover:text-red-700'>
            Sign out
          </button>
        </div>
      )}
      <div className={styles.content}>
        <p className={styles.title}>Workshop Pengoptimalan AI</p>
        <p className={styles.date}>18-21 Februari 2025</p>
        {session?.user?.role === 'admin' && (
          // Admin link only shows if role is exactly 'admin'
          <div className='mt-4 mb-4'>
            <Link href='/admin' className='inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
              Admin Dashboard
              <span className='ml-2 text-sm bg-white/20 px-2 py-0.5 rounded'>Admin Only</span>
            </Link>
          </div>
        )}
        <div className={styles.divider}></div>
        <p className={styles.info}>Nusantara Power Services | Akhmad Guntar</p>
        <p className={styles.description}>
          Mengoptimalkan AI sangat penting untuk meningkatkan produktivitas. Dengan AI yang dioptimalkan, kita dapat mengotomatisasi tugas-tugas
          rutin, meningkatkan efisiensi, dan menghasilkan hasil yang lebih akurat dan cepat.
        </p>
        <nav className={styles.navigation}>
          {session ? (
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link href='/member/studi-kasus/rekomendasi-judul' className={styles.navLink}>
                  Panduan Prompt Judul Inovasi
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href='/member/studi-kasus/manfaat-finansial' className={styles.navLink}>
                  Panduan Prompt Analisis Manfaat Finansial
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href='/member/latihan/action-role' className={styles.navLink}>
                  Latihan Role Assignment
                </Link>
              </li>
            </ul>
          ) : (
            <div className={styles.authButtons}>
              <Link href='/auth/login' className={styles.navLink}>
                Login untuk Mengakses Materi
              </Link>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default HomePage;
