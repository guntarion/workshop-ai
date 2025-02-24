'use client';
// src/app/(categories)/studi-kasus/rekomendasi-judul/page.tsx

import React, { useState } from 'react';
import styles from './page.module.scss';

const RekomendasiJudulPage = () => {
  const [background, setBackground] = useState('');
  const [innovation, setInnovation] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copyStatus, setCopyStatus] = useState<{ [key: string]: boolean }>({});

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

  return (
    <div className={styles.container}>
      <h1>Panduan Prompt Judul Inovasi</h1>

      <div className={styles.workshopHeader}>
        <p>Workshop Pengoptimalan AI</p>
        <p className={styles.date}>18-21 Februari 2025</p>
        <p className={styles.organizer}>Nusantara Power Services | Akhmad Guntar</p>
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
          <button
            className={`${styles.copyButton} ${copyStatus['generatedPrompt'] ? styles.copied : ''}`}
            onClick={() => copyPrompt('generatedPrompt')}
          >
            {copyStatus['generatedPrompt'] ? 'Copied!' : 'Copy Prompt'}
          </button>
          <pre id='generatedPrompt' className={styles.codeBlock}>
            {generatedPrompt || 'Prompt akan muncul di sini setelah Anda mengisi form dan menekan tombol Generate.'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default RekomendasiJudulPage;
