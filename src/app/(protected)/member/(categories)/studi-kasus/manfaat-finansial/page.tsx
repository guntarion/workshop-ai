'use client';
// src/app/(categories)/studi-kasus/manfaat-finansial/page.tsx

import React, { useState } from 'react';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

// Template text for the prompt
const PROMPT_TEMPLATE = `<system>
Anda adalah Pakar Analisis Finansial untuk Karya Inovasi dengan pengalaman 15 tahun di sektor pembangkit listrik. Anda telah membimbing lebih dari 50 tim inovasi yang berhasil memenangkan kompetisi inovasi tingkat nasional, dengan keunggulan di bidang analisis manfaat finansial. Keahlian Anda mencakup metodologi perhitungan dampak finansial, valuasi penghematan, dan penyusunan justifikasi bisnis untuk proyek inovasi. Tim-tim binaan Anda dikenal selalu mendapatkan nilai tertinggi dalam aspek perhitungan manfaat finansial di berbagai kompetisi inovasi PLN dan sektor ketenagalistrikan.
</system>

<input>
<latar_belakang>
{background}
</latar_belakang>

<karya_inovasi>
{innovation}
</karya_inovasi>
</input>

<format>
# Manfaat Finansial Inovasi

## I. Pendahuluan
   [Penjelasan singkat tentang aspek finansial dari inovasi dan metodologi perhitungan]

## II. Komponen Manfaat Finansial
    A. Penghematan Langsung
       - Perhitungan penghematan sebelum dan sesudah inovasi
       - Opportunity cost yang dapat dihindari
       - Metode perhitungan yang digunakan
       - Contoh perhitungan berdasarkan asumsi

    B. Penghematan Biaya Produksi
       - Analisis komponen biaya yang terpengaruh
       - Perhitungan penghematan per komponen
       - Proyeksi penghematan tahunan

    C. Penghematan Biaya Pemeliharaan
       - Analisis pengurangan frekuensi pemeliharaan
       - Perhitungan pengurangan biaya suku cadang
       - Estimasi penghematan jangka panjang

    D. Potential Savings Lainnya
       - Identifikasi area penghematan tambahan
       - Perhitungan potensi penghematan
       - Analisis dampak tidak langsung

## III. Metodologi Perhitungan
     A. Panduan Perhitungan
        - Langkah-langkah perhitungan detail
        - Formula yang digunakan
        - Asumsi yang dipertimbangkan

     B. Rekomendasi Monitoring
        - Indikator kinerja kunci
        - Periode evaluasi
        - Metode validasi penghematan

## IV. Proyeksi Kumulatif
    A. Perhitungan Tahunan
       - Breakdown penghematan per periode
       - Total potensi penghematan
       - Analisis trend

    B. Faktor Pertimbangan
       - Asumsi yang digunakan
       - Variabel yang mempengaruhi
       - Rekomendasi penyesuaian

## V. Kesimpulan dan Rekomendasi
   [Ringkasan manfaat finansial utama dan rekomendasi untuk optimalisasi]
</format>

<instructions>
1. Berikan contoh perhitungan yang jelas dan dapat diikuti
2. Jelaskan metodologi perhitungan secara detail
3. Sertakan asumsi-asumsi yang digunakan
4. Berikan rekomendasi untuk monitoring dan evaluasi
5. Tunjukkan potensi penghematan kumulatif
6. Pertimbangkan berbagai aspek penghematan
7. Gunakan angka-angka yang realistis namun perlu disesuaikan dengan kondisi aktual
</instructions>`;

const ManfaatFinansialPage = () => {
  const { data: session } = useSession();
  const [background, setBackground] = useState('');
  const [innovation, setInnovation] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('Prompt akan muncul di sini setelah Anda mengisi form dan menekan tombol Generate.');
  const [copyStatus, setCopyStatus] = useState<{ [key: string]: boolean }>({});
  const [emailStatus, setEmailStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    loading: false,
    success: false,
    error: null
  });

  const handleGeneratePrompt = () => {
    if (!background.trim() || !innovation.trim()) {
      alert('Mohon isi kedua form input sebelum generate prompt');
      return;
    }
    const newPrompt = PROMPT_TEMPLATE.replace('{background}', background).replace('{innovation}', innovation);
    setGeneratedPrompt(newPrompt);
  };

  const handleCopyPrompt = async (elementId: string) => {
    const prompt = document.getElementById(elementId)?.textContent || '';
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus({ [elementId]: true });
      setTimeout(() => {
        setCopyStatus({ [elementId]: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Gagal menyalin teks. Silakan coba lagi.');
    }
  };

  const handleSendEmail = async () => {
    if (!generatedPrompt) {
      setEmailStatus({
        loading: false,
        success: false,
        error: 'Harap generate prompt terlebih dahulu sebelum mengirim email.'
      });
      return;
    }

    if (!session?.user?.email) {
      setEmailStatus({
        loading: false,
        success: false,
        error: 'Email pengguna tidak ditemukan. Silakan login ulang.'
      });
      return;
    }

    setEmailStatus({
      loading: true,
      success: false,
      error: null
    });

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: session.user.email,
          subject: 'Workshop AI - Prompt Analisis Manfaat Finansial',
          text: generatedPrompt,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f9fafb;
                }
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .header img {
                  max-width: 200px;
                  height: auto;
                }
                h1 {
                  color: #1a1a1a;
                  font-size: 24px;
                  margin-bottom: 20px;
                }
                .code-block {
                  background-color: #f8f9fa;
                  padding: 20px;
                  border-radius: 6px;
                  border: 1px solid #e9ecef;
                  font-family: Monaco, monospace;
                  white-space: pre-wrap;
                  margin: 20px 0;
                  font-size: 14px;
                  line-height: 1.5;
                }
                .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #e9ecef;
                  text-align: center;
                  color: #666;
                  font-size: 14px;
                }
                .highlight {
                  color: #0066cc;
                  font-weight: bold;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Prompt Analisis Manfaat Finansial</h1>
                </div>
                
                <p>Berikut adalah prompt yang Anda generate dari Workshop Pengoptimalan AI:</p>
                
                <div class="code-block">
                  ${generatedPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
                
                <div class="footer">
                  <p>
                    <strong>Workshop Pengoptimalan AI</strong><br>
                    25-28 Februari 2025<br>
                    Nusantara Power Services
                  </p>
                  <p class="highlight">
                    Akhmad Guntar<br>
                    Workshop Facilitator
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send email');
      }

      setEmailStatus({
        loading: false,
        success: true,
        error: null
      });

      setTimeout(() => {
        setEmailStatus(prev => ({
          ...prev,
          success: false
        }));
      }, 3000);

    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Gagal mengirim email. Silakan coba lagi.'
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <Image
          src="/images/logo-pln-nps.png"
          alt="PLN NPS Logo"
          width={200}
          height={80}
          className={styles.logo}
          priority
        />
        <h1>Panduan Prompt Analisis Manfaat Finansial</h1>
        <div className={styles.workshopHeader}>
          <p>Workshop Pengoptimalan AI</p>
          <p className={styles.date}>25-28 Februari 2025</p>
          <p className={styles.organizer}>Nusantara Power Services | Akhmad Guntar</p>
        </div>

        {/* General Explanation Section */}
        <div className={styles.section}>
          <h2>Penjelasan Umum</h2>
          <p>
            Prompt ini dirancang untuk menghasilkan analisis manfaat finansial yang komprehensif untuk Makalah Karya Inovasi di lingkungan PLN
            Nusantara Power Services. Analisis akan mencakup berbagai aspek penghematan dan metodologi perhitungan yang detail.
          </p>
        </div>

        {/* Input Section */}
        <div className={styles.inputSection}>
          <h2>Input Generator</h2>
          <div className={styles.inputForm}>
            <label htmlFor='background'>Latar Belakang:</label>
            <textarea
              id='background'
              className={styles.textInput}
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder='Masukkan latar belakang masalah yang mendasari inovasi...'
            />

            <label htmlFor='innovation'>Karya Inovasi:</label>
            <textarea
              id='innovation'
              className={styles.textInput}
              value={innovation}
              onChange={(e) => setInnovation(e.target.value)}
              placeholder='Jelaskan solusi inovasi yang dikembangkan...'
            />

            <button className={styles.generateButton} onClick={handleGeneratePrompt}>
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon} viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
              Generate Prompt
            </button>
          </div>
        </div>

        {/* Template Section */}
        <div className={styles.section}>
          <h2>Template Prompt</h2>
          <div className={styles.promptContainer}>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.copyButton} ${copyStatus['promptTemplate'] ? styles.copied : ''}`}
                onClick={() => handleCopyPrompt('promptTemplate')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                {copyStatus['promptTemplate'] ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
            <pre id='promptTemplate' className={styles.codeBlock}>{PROMPT_TEMPLATE}</pre>
          </div>
        </div>

        {/* Generated Result Section */}
        <div className={styles.section}>
          <h2>Hasil Generate</h2>
          <div className={styles.promptContainer}>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.copyButton} ${copyStatus['generatedPrompt'] ? styles.copied : ''}`}
                onClick={() => handleCopyPrompt('generatedPrompt')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                {copyStatus['generatedPrompt'] ? 'Copied!' : 'Copy Prompt'}
              </button>
              <button
                className={`${styles.emailButton} ${emailStatus.loading ? styles.loading : ''} ${
                  emailStatus.success ? styles.success : ''
                }`}
                onClick={handleSendEmail}
                disabled={emailStatus.loading || !generatedPrompt}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {emailStatus.loading
                  ? 'Mengirim...'
                  : emailStatus.success
                  ? 'Terkirim!'
                  : 'Kirim ke Email'}
              </button>
            </div>
            
            {/* Error Message */}
            {emailStatus.error && (
              <div className={styles.errorMessage}>
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {emailStatus.error}
              </div>
            )}
            
            {/* Success Message */}
            {emailStatus.success && (
              <div className={styles.successMessage}>
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Email berhasil dikirim ke {session?.user?.email}
              </div>
            )}
            <pre id='generatedPrompt' className={styles.codeBlock}>{generatedPrompt}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManfaatFinansialPage;
