// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './HomePage.module.css';

/**
 * Main landing page component for the Workshop Pengoptimalan AI.
 * This component displays the title, date, and a brief explanation about the importance of optimizing AI for productivity.
 * It also handles authentication state and redirects to the appropriate pages.
 */
const HomePage: React.FC = () => {
  const { data: session } = useSession();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.title}>Workshop Pengoptimalan AI</p>
        <p className={styles.date}>18-21 Februari 2025</p>
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
