export const EMAIL_CONFIG = {
  subject: 'Workshop AI - Latihan Kejelasan Instruksi',
  successTimeout: 3000,
  footerText: {
    workshop: 'Workshop Pengoptimalan AI',
    date: '25-28 Februari 2025',
    organization: 'Nusantara Power Services',
    facilitator: 'Akhmad Guntar',
    role: 'Workshop Facilitator'
  }
} as const;

export const AI_CONFIG = {
  model: 'qwen-turbo',
  temperature: 0.7,
  promptTemplate: (role: string, version: number, content: string, isFirstVersion: boolean) => `
    As an instruction clarity expert, analyze this prompt from a user who identifies as: "${role}".
    
    Their prompt (version ${version}):
    "${content}"

    ${isFirstVersion ? 'This is their first version.' : `This is version ${version} of their prompt.`}
    
    Provide in Bahasa Indonesia:
    1. Analisis apakah konteks yang diberikan sudah cukup jelas
    2. Tiga pertanyaan untuk membantu user memperjelas instruksinya
    3. Tiga saran konkret untuk meningkatkan kejelasan prompt
    ${!isFirstVersion ? '4. Evaluasi improvement dari versi sebelumnya dan beri selamat jika sudah bagus' : ''}

    Format jawabanmu:
    ANALISIS KONTEKS:
    [tuliskan analisis]

    PERTANYAAN PENDALAMAN:
    1. [pertanyaan 1]
    2. [pertanyaan 2]
    3. [pertanyaan 3]

    SARAN PERBAIKAN:
    1. [saran 1]
    2. [saran 2]
    3. [saran 3]
    
    ${!isFirstVersion ? `
    EVALUASI IMPROVEMENT:
    [tuliskan evaluasi dan apresiasi jika ada improvement signifikan]
    ` : ''}`
} as const;