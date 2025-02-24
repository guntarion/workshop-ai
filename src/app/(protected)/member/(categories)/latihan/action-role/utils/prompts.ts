// src/app/(protected)/member/(categories)/latihan/action-role/utils/prompts.ts

// Base context for all prompts
export const BASE_CONTEXT = `Solusi yang didiskusikan ini diimplementasikan di lingkungan PLN Nusantara Power Services (NP Services), anak Perusahaan PLN Nusantara Power, yang bergerak di bidang Operation & Maintenance dengan segala proses bisnis pendukungnya.`;

export const getActionHintPrompt = (
  topic: string
) => `You are an AI prompt expert. Help guide the user to refine their action for this topic: "${topic}". 
  
  Berikan dalam Bahasa Indonesia:
  1. Tiga pertanyaan yang membantu user memperinci action-nya dengan lebih jelas
  2. Tiga saran kata kerja (action verb) yang bisa dipertimbangkan

  Format jawabanmu:
  Pertanyaan untuk dipertimbangkan:
  1. [pertanyaan 1]
  2. [pertanyaan 2]
  3. [pertanyaan 3]

  Saran kata kerja:
  1. [saran 1]
  2. [saran 2]
  3. [saran 3]`;

export const getScenarioHintPrompt = (
  topic: string
) => `You are an AI prompt expert. Help guide the user to develop a relevant scenario for this topic: "${topic}" in the context of PLN Nusantara Power Services.
  
  Konteks Utama:
  ${BASE_CONTEXT}

  Berikan dalam Bahasa Indonesia:
  1. Tiga pertanyaan yang membantu user mengembangkan skenario yang relevan dengan konteks PLN NP Services
  2. Tiga aspek penting yang perlu dipertimbangkan dalam menentukan skenario

  Format jawabanmu:
  Pertanyaan untuk mengembangkan skenario:
  1. [pertanyaan 1]
  2. [pertanyaan 2]
  3. [pertanyaan 3]

  Aspek skenario yang perlu dipertimbangkan:
  1. [aspek 1]
  2. [aspek 2]
  3. [aspek 3]`;

export const getRoleHintPrompt = (
  topic: string,
  action: string
) => `You are an AI prompt expert. Help guide the user to define an appropriate AI role for this action: "${action}" related to topic: "${topic}".
  
  Berikan dalam Bahasa Indonesia:
  1. Tiga pertanyaan yang membantu user memperinci peran dan kualifikasi yang dibutuhkan
  2. Tiga saran karakteristik peran yang bisa dipertimbangkan

  Format jawabanmu:
  Pertanyaan untuk dipertimbangkan:
  1. [pertanyaan 1]
  2. [pertanyaan 2]
  3. [pertanyaan 3]

  Karakteristik peran yang disarankan:
  1. [saran 1]
  2. [saran 2]
  3. [saran 3]`;

export const generateFinalPrompt = (topic: string, role: string, action: string, scenario: string) => {
  return `
<topic>
${topic}
</topic>

<role>
${role}
</role>

<action>
${action}
</action>

<scenario>
${scenario}
</scenario>`;
};
