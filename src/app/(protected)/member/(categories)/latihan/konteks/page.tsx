// src/app/(protected)/member/(categories)/latihan/konteks/page.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Prompt {
  version: number;
  content: string;
  feedback?: string;
  timestamp: Date;
}

const KonteksPage = () => {
  // State management
  const [role, setRole] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // Function to add a new prompt version
  const addPromptVersion = () => {
    if (!currentPrompt.trim()) return;

    const newPrompt: Prompt = {
      version: prompts.length + 1,
      content: currentPrompt.trim(),
      timestamp: new Date(),
    };

    setPrompts([...prompts, newPrompt]);
    setCurrentPrompt('');
  };

  // Function to get AI feedback
  const getFeedback = async () => {
    if (!prompts.length) return;
    setIsLoadingFeedback(true);

    try {
      const latestPrompt = prompts[prompts.length - 1];
      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: `As an instruction clarity expert, analyze this prompt from a user who identifies as: "${role}".
                      
                      Their prompt (version ${latestPrompt.version}):
                      "${latestPrompt.content}"

                      ${latestPrompt.version > 1 ? `This is version ${latestPrompt.version} of their prompt.` : 'This is their first version.'}
                      
                      Provide in Bahasa Indonesia:
                      1. Analisis apakah konteks yang diberikan sudah cukup jelas
                      2. Tiga pertanyaan untuk membantu user memperjelas instruksinya
                      3. Tiga saran konkret untuk meningkatkan kejelasan prompt
                      ${latestPrompt.version > 1 ? '4. Evaluasi improvement dari versi sebelumnya dan beri selamat jika sudah bagus' : ''}

                      Format jawabanmu:
                      Analisis Konteks:
                      [tuliskan analisis]

                      Pertanyaan Pendalaman:
                      1. [pertanyaan 1]
                      2. [pertanyaan 2]
                      3. [pertanyaan 3]

                      Saran Perbaikan:
                      1. [saran 1]
                      2. [saran 2]
                      3. [saran 3]
                      
                      ${
                        latestPrompt.version > 1
                          ? `
                      Evaluasi Improvement:
                      [tuliskan evaluasi dan apresiasi jika ada improvement signifikan]
                      `
                          : ''
                      }`,
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get feedback');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let fullResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              fullResponse += data.content || '';
            } catch (error) {
              console.error('Error parsing chunk:', error);
            }
          }
        }
      }

      // Update the prompts array with the feedback
      const updatedPrompts = [...prompts];
      updatedPrompts[updatedPrompts.length - 1].feedback = fullResponse;
      setPrompts(updatedPrompts);
    } catch (error) {
      console.error('Error getting feedback:', error);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <h1 className='text-2xl font-bold mb-6'>Latihan Kejelasan Instruksi</h1>

      {/* Role Input Section */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Identifikasi Peran Anda</h2>
        <div className='space-y-2'>
          <p className='text-sm text-gray-600'>Tentukan peran atau posisi Anda untuk memberikan konteks pada instruksi yang akan dibuat</p>
          <Input
            placeholder='Contoh: Supervisor Pemeliharaan, Operator Pembangkit, dsb.'
            value={role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)}
            className='w-full'
          />
        </div>
      </Card>

      {/* Prompt Input Section */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>{prompts.length === 0 ? 'Buat Prompt Versi 1' : `Buat Prompt Versi ${prompts.length + 1}`}</h2>
        <div className='space-y-4'>
          <Textarea
            placeholder='Tuliskan instruksi Anda di sini...'
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            className='min-h-[200px]'
          />
          <div className='flex gap-2'>
            <Button onClick={addPromptVersion} disabled={!currentPrompt.trim() || !role.trim()}>
              Simpan Prompt
            </Button>
            {prompts.length > 0 && (
              <Button onClick={getFeedback} variant='outline' disabled={isLoadingFeedback}>
                {isLoadingFeedback ? 'Memuat Masukan...' : 'Minta Masukan'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Prompt History Section */}
      {prompts.map((prompt, index) => (
        <Card key={index} className='p-6'>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Prompt Versi {prompt.version}</h3>
              <span className='text-sm text-gray-500'>{prompt.timestamp.toLocaleString()}</span>
            </div>

            <div className='bg-gray-50 p-4 rounded-md'>
              <pre className='whitespace-pre-wrap font-mono text-sm'>{prompt.content}</pre>
            </div>

            {prompt.feedback && (
              <Alert>
                <AlertDescription>
                  <div className='whitespace-pre-wrap'>{prompt.feedback}</div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default KonteksPage;
