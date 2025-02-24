'use client';
// src/app/(categories)/studi-kasus/rekomendasi-judul/page.tsx

import React, { useState } from 'react';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const RekomendasiJudulPage = () => {
  const { data: session } = useSession();
  const [background, setBackground] = useState('');
  const [innovation, setInnovation] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
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

  const generatePrompt = () => {
    if (!background.trim() || !innovation.trim()) {
      alert('Mohon isi kedua form input sebelum generate prompt');
      return;
    }

    const template = `<system>
Anda adalah pakar penamaan karya inovasi dengan pengalaman luas dalam kompetisi inovasi sektor ketenagalistrikan. Anda memahami pentingnya judul yang menarik, mudah diingat, dan menggambarkan value proposition dengan tepat.
</system>

<context>
Karya inovasi ini dikembangkan dalam konteks optimasi pembangkit listrik di lingkungan PLN Indonesia. Judul akan digunakan untuk kompetisi internal PLN.
</context>

<input>
<latar_belakang>
${background}
</latar_belakang>

<karya_inovasi>
${innovation}
</karya_inovasi>
</input>

<format>
Judul harus terdiri dari dua bagian:

1. Nama Julukan (Catchphrase):
   - Singkatan atau istilah gabungan yang menarik
   - Dapat menggunakan Bahasa Inggris
   - Mudah diingat dan diucapkan
   - Terkait dengan esensi inovasi

2. Deskripsi Fungsi/Value Proposition:
   - Menggunakan Bahasa Indonesia
   - Menjelaskan manfaat utama/tujuan inovasi
   - Spesifik dan terukur
   - Maksimal 15 kata
</format>

<instructions>
1. Analisis latar belakang dan deskripsi inovasi
2. Identifikasi kata kunci dan manfaat utama
3. Buat 3 alternatif judul yang berbeda
4. Untuk setiap alternatif, berikan:
   - Penjelasan pemilihan nama julukan
   - Alasan pemilihan deskripsi fungsi
   - Kelebihan dan kekurangan judul
5. Rekomendasikan judul terbaik dengan alasannya
</instructions>`;

    setGeneratedPrompt(template);
  };

  const copyPrompt = async (elementId: string) => {
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
          subject: 'Workshop AI - Prompt Rekomendasi Judul Inovasi',
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
                  <h1>Prompt Rekomendasi Judul Inovasi</h1>
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
        <h1>Panduan Prompt Judul Inovasi</h1>
        <div className={styles.workshopHeader}>
          <p>Workshop Pengoptimalan AI</p>
          <p className={styles.date}>25-28 Februari 2025</p>
          <p className={styles.organizer}>Nusantara Power Services | Akhmad Guntar</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Penjelasan Umum</h2>
        <p>
          Prompt ini dirancang untuk menghasilkan judul karya inovasi yang efektif untuk kompetisi di lingkungan PLN Indonesia, khususnya terkait
          optimasi pembangkit listrik. Judul yang dihasilkan akan terdiri dari dua bagian: nama julukan yang catchy dan deskripsi fungsi utama.
        </p>
      </div>

      <div className={styles.inputSection}>
        <h2>Input Generator</h2>
        <p>Masukkan informasi berikut untuk menghasilkan prompt lengkap:</p>
        <div className={styles.inputForm}>
          <label htmlFor='background'>Latar Belakang:</label>
          <textarea
            className={styles.textInput}
            id='background'
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder='Masukkan latar belakang masalah yang mendasari inovasi...'
          ></textarea>

          <label htmlFor='innovation'>Karya Inovasi:</label>
          <textarea
            className={styles.textInput}
            id='innovation'
            value={innovation}
            onChange={(e) => setInnovation(e.target.value)}
            placeholder='Jelaskan solusi inovasi yang dikembangkan...'
          ></textarea>

          <button className={styles.generateButton} onClick={generatePrompt}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon} viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Generate Prompt
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Template Prompt</h2>
        <div className={styles.promptContainer}>
          <button
            className={`${styles.copyButton} ${copyStatus['promptTemplate'] ? styles.copied : ''}`}
            onClick={() => copyPrompt('promptTemplate')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon} viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            {copyStatus['promptTemplate'] ? 'Copied!' : 'Copy Prompt'}
          </button>
          <pre id='promptTemplate' className={styles.codeBlock}>{`<system>
Anda adalah pakar penamaan karya inovasi dengan pengalaman luas dalam kompetisi inovasi sektor ketenagalistrikan. Anda memahami pentingnya judul yang menarik, mudah diingat, dan menggambarkan value proposition dengan tepat.
</system>

<context>
Karya inovasi ini dikembangkan dalam konteks optimasi pembangkit listrik di lingkungan PLN Indonesia. Judul akan digunakan untuk kompetisi internal PLN.
</context>

<input>
<latar_belakang>
{masukkan latar belakang}
</latar_belakang>

<karya_inovasi>
{masukkan deskripsi karya inovasi}
</karya_inovasi>
</input>

<format>
Judul harus terdiri dari dua bagian:

1. Nama Julukan (Catchphrase):
   - Singkatan atau istilah gabungan yang menarik
   - Dapat menggunakan Bahasa Inggris
   - Mudah diingat dan diucapkan
   - Terkait dengan esensi inovasi

2. Deskripsi Fungsi/Value Proposition:
   - Menggunakan Bahasa Indonesia
   - Menjelaskan manfaat utama/tujuan inovasi
   - Spesifik dan terukur
   - Maksimal 15 kata
</format>

<instructions>
1. Analisis latar belakang dan deskripsi inovasi
2. Identifikasi kata kunci dan manfaat utama
3. Buat 3 alternatif judul yang berbeda
4. Untuk setiap alternatif, berikan:
   - Penjelasan pemilihan nama julukan
   - Alasan pemilihan deskripsi fungsi
   - Kelebihan dan kekurangan judul
5. Rekomendasikan judul terbaik dengan alasannya
</instructions>`}</pre>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Hasil Generate</h2>
        <div className={styles.promptContainer}>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.copyButton} ${copyStatus['generatedPrompt'] ? styles.copied : ''}`}
              onClick={() => copyPrompt('generatedPrompt')}
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
          
          <pre id='generatedPrompt' className={styles.codeBlock}>
            {generatedPrompt || 'Prompt akan muncul di sini setelah Anda mengisi form dan menekan tombol Generate.'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default RekomendasiJudulPage;
