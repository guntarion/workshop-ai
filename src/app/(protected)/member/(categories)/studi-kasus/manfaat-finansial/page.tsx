'use client';
// src/app/(categories)/studi-kasus/manfaat-finansial/page.tsx

import React, { useState } from 'react';
import styles from './page.module.scss';

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
  // State for form inputs and generated prompt
  const [background, setBackground] = useState('');
  const [innovation, setInnovation] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('Prompt akan muncul di sini setelah Anda mengisi form dan menekan tombol Generate.');
  const [copyStatus, setCopyStatus] = useState<{ [key: string]: boolean }>({});

  // Handle prompt generation
  const handleGeneratePrompt = () => {
    const newPrompt = PROMPT_TEMPLATE.replace('{background}', background).replace('{innovation}', innovation);
    setGeneratedPrompt(newPrompt);
  };

  // Handle copying prompt to clipboard
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
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <h1 className={styles.header}>Panduan Prompt Analisis Manfaat Finansial</h1>

        {/* Workshop Header */}
        <div className={styles.workshopHeader}>
          <p className={styles.workshopTitle}>Workshop Pengoptimalan AI</p>
          <p className={styles.workshopDate}>18-21 Februari 2025</p>
          <p className={styles.workshopOrganizer}>Nusantara Power Services | Akhmad Guntar</p>
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
          <div>
            <label htmlFor='background'>Latar Belakang:</label>
            <textarea
              id='background'
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder='Masukkan latar belakang masalah yang mendasari inovasi...'
            />

            <label htmlFor='innovation'>Karya Inovasi:</label>
            <textarea
              id='innovation'
              value={innovation}
              onChange={(e) => setInnovation(e.target.value)}
              placeholder='Jelaskan solusi inovasi yang dikembangkan...'
            />

            <button className={styles.generateButton} onClick={handleGeneratePrompt}>
              Generate Prompt
            </button>
          </div>
        </div>

        {/* Template Section */}
        <div className={styles.section}>
          <h2>Template Prompt</h2>
          <div className={styles.promptContainer}>
            <button
              className={`${styles.copyButton} ${copyStatus['promptTemplate'] ? styles.copied : ''}`}
              onClick={() => handleCopyPrompt('promptTemplate')}
            >
              {copyStatus['promptTemplate'] ? 'Copied!' : 'Copy Prompt'}
            </button>
            <pre id='promptTemplate'>{PROMPT_TEMPLATE}</pre>
          </div>
        </div>

        {/* Generated Result Section */}
        <div className={styles.section}>
          <h2>Hasil Generate</h2>
          <div className={styles.promptContainer}>
            <button
              className={`${styles.copyButton} ${copyStatus['generatedPrompt'] ? styles.copied : ''}`}
              onClick={() => handleCopyPrompt('generatedPrompt')}
            >
              {copyStatus['generatedPrompt'] ? 'Copied!' : 'Copy Prompt'}
            </button>
            <pre id='generatedPrompt'>{generatedPrompt}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManfaatFinansialPage;
