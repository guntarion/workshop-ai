// src/app/(protected)/member/(categories)/latihan/peran/page.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIRole {
  version: number;
  context: string; // User's situation/problem
  roleDefinition: string; // AI role definition
  feedback?: string;
  timestamp: Date;
}

const RoleAssignmentPage = () => {
  // State management
  const [context, setContext] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [roles, setRoles] = useState<AIRole[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [contextSubmitted, setContextSubmitted] = useState(false);
  const [streamingFeedback, setStreamingFeedback] = useState('');

  // Function to submit context
  const submitContext = () => {
    if (!context.trim()) return;
    setContextSubmitted(true);
  };

  // Function to add a new role version
  const addRoleVersion = () => {
    if (!currentRole.trim() || !context.trim()) return;

    const newRole: AIRole = {
      version: roles.length + 1,
      context: context,
      roleDefinition: currentRole.trim(),
      timestamp: new Date(),
    };

    setRoles([...roles, newRole]);
    setCurrentRole('');
  };

  // Function to get AI feedback
  const getFeedback = async () => {
    if (!roles.length) return;
    setIsLoadingFeedback(true);
    // Reset streaming feedback
    setStreamingFeedback('');

    try {
      const latestRole = roles[roles.length - 1];
      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: `As a role prompting expert, analyze this AI role assignment for the following context:

                      User's Context/Problem:
                      "${latestRole.context}"

                      Assigned AI Role (version ${latestRole.version}):
                      "${latestRole.roleDefinition}"

                      ${latestRole.version > 1 ? `This is version ${latestRole.version} of their role assignment.` : 'This is their first version.'}
                      
                      Provide feedback in Bahasa Indonesia based on these criteria:
                      1. Kejelasan Definisi Peran (jabatan, tanggung jawab, senioritas)
                      2. Relevansi Keahlian (spesialisasi, pengalaman, tools)
                      3. Kredibilitas Pencapaian
                      4. Gaya Komunikasi

                      Format your response as:
                      ANALISIS PER KRIETRIA:
                      1. Kejelasan Definisi Peran:
                         [analisis]
                      2. Relevansi Keahlian:
                         [analisis]
                      3. Kredibilitas Pencapaian:
                         [analisis]
                      4. Gaya Komunikasi:
                         [analisis]

                      PERTANYAAN PENDALAMAN:
                      1. [pertanyaan 1]
                      2. [pertanyaan 2]
                      3. [pertanyaan 3]

                      SARAN PERBAIKAN:
                      1. [saran 1]
                      2. [saran 2]
                      3. [saran 3]
                      
                      ${
                        latestRole.version > 1
                          ? `
                      EVALUASI IMPROVEMENT:
                      [analisis perbandingan dengan versi sebelumnya dan apresiasi jika ada improvement signifikan]
                      `
                          : ''
                      }`,
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get feedback');

      // Get the content-type header to determine if response is streaming
      const contentType = response.headers.get('content-type');

      let completeFeedback = ''; // Add this at the start of streaming section

      if (contentType && contentType.includes('text/event-stream')) {
        // Process streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunkText = decoder.decode(value);
            // Split the chunk into lines
            const lines = chunkText.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  // Parse the JSON data from the stream
                  const data = JSON.parse(line.slice(6));
                  if (data.error) {
                    const errorMessage = `\nError: ${data.error}`;
                    setStreamingFeedback((prev) => prev + errorMessage);
                    completeFeedback += errorMessage; // Add to complete feedback
                  } else if (data.content) {
                    setStreamingFeedback((prev) => prev + data.content);
                    completeFeedback += data.content; // Add to complete feedback
                  }
                } catch (error) {
                  console.error('Error parsing JSON from stream:', error, 'Line:', line);
                }
              }
            }
          }
        }

        // After streaming is complete, update the roles array with the complete feedback
        const updatedRoles = [...roles];
        updatedRoles[updatedRoles.length - 1].feedback = completeFeedback; // Use completeFeedback instead
        setRoles(updatedRoles);
      } else {
        // Handle non-streaming response (fallback)
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const updatedRoles = [...roles];
        updatedRoles[updatedRoles.length - 1].feedback = data.content || JSON.stringify(data);
        setRoles(updatedRoles);
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      setStreamingFeedback(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <h1 className='text-2xl font-bold mb-6'>Latihan Menanamkan Peran ke AI</h1>

      {/* Context Guidelines */}
      <Alert className='bg-blue-50'>
        <AlertDescription>
          <div className='prose prose-sm max-w-none'>
            <h3 className='text-lg font-semibold mt-0'>Kriteria Role Prompting yang Efektif:</h3>
            <div className='pl-4'>
              {' '}
              {/* Added padding-left here */}
              <div className='mb-4'>
                <h4 className='font-semibold mb-2'>Peran yang Terdefinisi Jelas</h4>
                <ul className='list-disc pl-5 space-y-1'>
                  {' '}
                  {/* Adjusted padding-left */}
                  <li>Menyebutkan profesi/jabatan secara spesifik</li>
                  <li>Menjelaskan tanggung jawab utama</li>
                  <li>Mengindikasikan tingkat senioritas</li>
                </ul>
              </div>
              <div className='mb-4'>
                <h4 className='font-semibold mb-2'>Keahlian Relevan</h4>
                <ul className='list-disc pl-5 space-y-1'>
                  <li>Bidang spesialisasi yang sesuai konteks</li>
                  <li>Pengalaman industri yang relevan</li>
                  <li>Framework/tools yang dikuasai</li>
                </ul>
              </div>
              <div className='mb-4'>
                <h4 className='font-semibold mb-2'>Pencapaian yang Kredibel</h4>
                <ul className='list-disc pl-5 space-y-1'>
                  <li>Prestasi yang terukur</li>
                  <li>Kontribusi pada proyek penting</li>
                  <li>Pengakuan industri</li>
                </ul>
              </div>
              <div className='mb-4'>
                <h4 className='font-semibold mb-2'>Gaya Komunikasi Profesional</h4>
                <ul className='list-disc pl-5 space-y-1'>
                  <li>Level formalitas yang sesuai</li>
                  <li>Pendekatan berbasis data</li>
                  <li>Fokus pada solusi praktis</li>
                </ul>
              </div>
              <div className='mb-4'>
                <h4 className='font-semibold mb-2'>Batasan yang Realistis</h4>
                <ul className='list-disc pl-5 space-y-1'>
                  <li>Mengakui keterbatasan peran</li>
                  <li>Fokus pada area keahlian</li>
                  <li>Tahu kapan merujuk ke ahli lain</li>
                </ul>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Context Input Section */}
      {!contextSubmitted && (
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Langkah 1: Definisikan Konteks</h2>
          <div className='space-y-4'>
            <div className='text-sm text-gray-600'>
              <p>Jelaskan konteks situasi atau permasalahan yang ingin Anda diskusikan dengan AI.</p>
              <p className='mt-1'>Ini akan membantu dalam menentukan peran yang tepat untuk AI.</p>
            </div>
            <Textarea
              placeholder='Contoh: Saya perlu bantuan untuk mengoptimalkan kinerja sistem pembangkit dengan kapasitas 100MW yang mengalami penurunan efisiensi...'
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className='min-h-[150px]'
            />
            <Button onClick={submitContext} disabled={!context.trim()}>
              Lanjut ke Penentuan Peran
            </Button>
          </div>
        </Card>
      )}

      {/* Role Input Section */}
      {contextSubmitted && (
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>
            {roles.length === 0 ? 'Langkah 2: Tentukan Peran AI (Versi 1)' : `Tentukan Peran AI (Versi ${roles.length + 1})`}
          </h2>
          <div className='space-y-4'>
            <div className='bg-gray-50 p-4 rounded-md text-sm'>
              <strong>Konteks Anda:</strong>
              <p className='mt-1'>{context}</p>
            </div>
            <Textarea
              placeholder='Tentukan peran yang akan diberikan kepada AI...'
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className='min-h-[150px]'
            />
            <div className='flex gap-2'>
              <Button onClick={addRoleVersion} disabled={!currentRole.trim()}>
                Simpan Peran
              </Button>
              {roles.length > 0 && (
                <Button onClick={getFeedback} variant='outline' disabled={isLoadingFeedback}>
                  {isLoadingFeedback ? 'Memuat Masukan...' : 'Minta Masukan'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Role History Section */}
      {/* Role History Section */}
      {roles.map((role, index) => (
        <Card key={index} className='p-6'>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Peran AI Versi {role.version}</h3>
              <span className='text-sm text-gray-500'>{role.timestamp.toLocaleString()}</span>
            </div>

            <div className='bg-gray-50 p-4 rounded-md'>
              <pre className='whitespace-pre-wrap font-mono text-sm'>{role.roleDefinition}</pre>
            </div>

            {/* Modified feedback display logic */}
            {(role.feedback || (index === roles.length - 1 && isLoadingFeedback)) && (
              <Alert>
                <AlertDescription>
                  <div className='whitespace-pre-wrap'>
                    {index === roles.length - 1 && isLoadingFeedback ? streamingFeedback || 'Loading...' : role.feedback}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RoleAssignmentPage;
