// src/app/(protected)/member/(categories)/latihan/stepbystep/page.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';

// Define interfaces for type safety
interface WorkflowStep {
  stepNumber: number;
  description: string;
  inputRequirements: string;
  expectedOutput: string;
  prompt: string;
  dependencies: number[]; // Array of step numbers this step depends on
  feedback?: string;
  timestamp: Date;
}

interface Workflow {
  version: number;
  context: string;
  finalGoal: string;
  steps: WorkflowStep[];
  overallFeedback?: string;
  timestamp: Date;
}

interface StepSuggestion {
  description: string;
  inputRequirements: string;
  expectedOutput: string;
  dependencies: number[];
}

const StepByStepPage = () => {
  // State management
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow>({
    version: 1,
    context: '',
    finalGoal: '',
    steps: [],
    timestamp: new Date(),
  });
  const [contextSubmitted, setContextSubmitted] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [streamingFeedback, setStreamingFeedback] = useState('');
  const { data: session } = useSession();
  const [emailStatus, setEmailStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    loading: false,
    success: false,
    error: null
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stepSuggestions, setStepSuggestions] = useState<StepSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsStream, setSuggestionsStream] = useState('');

  // Function to submit initial context and goal
  const submitContext = () => {
    if (!currentWorkflow.context.trim() || !currentWorkflow.finalGoal.trim()) return;
    setContextSubmitted(true);
  };

  // Function to add a new step
  const addStep = () => {
    const newStep: WorkflowStep = {
      stepNumber: currentWorkflow.steps.length + 1,
      description: '',
      inputRequirements: '',
      expectedOutput: '',
      prompt: '',
      dependencies: [],
      timestamp: new Date(),
    };

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: [...currentWorkflow.steps, newStep],
    });
  };

  // Function to update a step
  const updateStep = (index: number, field: keyof WorkflowStep, value: string | number[]) => {
    const updatedSteps = [...currentWorkflow.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value,
    };

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: updatedSteps,
    });
  };

  // Function to remove a step
  const removeStep = (index: number) => {
    const updatedSteps = currentWorkflow.steps.filter((_, i) => i !== index);
    // Renumber remaining steps
    const renumberedSteps = updatedSteps.map((step, i) => ({
      ...step,
      stepNumber: i + 1,
    }));

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: renumberedSteps,
    });
  };

  // Function to save workflow
  const saveWorkflow = () => {
    if (currentWorkflow.steps.length === 0) return;

    setWorkflows([...workflows, { ...currentWorkflow }]);
    setCurrentWorkflow({
      version: currentWorkflow.version + 1,
      context: currentWorkflow.context,
      finalGoal: currentWorkflow.finalGoal,
      steps: [],
      timestamp: new Date(),
    });
  };

  const getSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestionsStream(''); // Reset stream

    try {
      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: `As a workflow optimization expert, suggest a logical breakdown of steps for this goal:

                      Context:
                      "${currentWorkflow.context}"

                      Final Goal:
                      "${currentWorkflow.finalGoal}"

                      Provide between 3-7 logical steps in Bahasa Indonesia. For each step, specify:
                      1. Description of what needs to be done
                      2. Required inputs
                      3. Expected outputs
                      4. Dependencies (which steps must be completed first)

                      Format your response as:
                      TAHAPAN YANG DISARANKAN:

                      Tahap 1:
                      Deskripsi: [deskripsi tahapan]
                      Input: [input yang dibutuhkan]
                      Output: [output yang diharapkan]
                      Dependensi: [nomor tahap yang harus diselesaikan sebelumnya, atau "Tidak ada" jika ini tahap awal]

                      Tahap 2:
                      ...

                      PENJELASAN ALUR:
                      [Jelaskan secara singkat mengapa tahapan disusun dengan urutan seperti ini]`,
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');

      const contentType = response.headers.get('content-type');
      let completeSuggestions = '';

      if (contentType && contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunkText = decoder.decode(value);
            const lines = chunkText.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.error) {
                    const errorMessage = `\nError: ${data.error}`;
                    setSuggestionsStream((prev) => prev + errorMessage);
                    completeSuggestions += errorMessage;
                  } else if (data.content) {
                    setSuggestionsStream((prev) => prev + data.content);
                    completeSuggestions += data.content;
                  }
                } catch (error) {
                  console.error('Error parsing JSON from stream:', error);
                }
              }
            }
          }
        }

        // After streaming is complete, parse and set the suggestions
        setStepSuggestions(parseStepSuggestions(completeSuggestions));
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Helper function to parse AI response into structured suggestions
  const parseStepSuggestions = (text: string): StepSuggestion[] => {
    console.log('Raw text from AI:', text);

    // First, let's extract just the steps section
    const stepsSection = text.split('PENJELASAN ALUR:')[0].split('TAHAPAN YANG DISARANKAN:')[1]?.trim();
    if (!stepsSection) return [];

    // Split into individual steps
    const steps = stepsSection.split(/Tahap \d+:/g).filter((step) => step.trim());
    console.log('Steps split:', steps);

    return steps.map((stepContent, index) => {
      // Helper function to extract content between markers
      const extractSection = (startMarker: string, endMarker: string): string => {
        const startIndex = stepContent.indexOf(startMarker);
        if (startIndex === -1) return '';

        const contentStart = startIndex + startMarker.length;
        const endIndex = endMarker ? stepContent.indexOf(endMarker, contentStart) : stepContent.length;

        return endIndex === -1 ? stepContent.substring(contentStart).trim() : stepContent.substring(contentStart, endIndex).trim();
      };

      // Extract each section
      const description = extractSection('Deskripsi:', 'Input:');
      const input = extractSection('Input:', 'Output:');
      const output = extractSection('Output:', 'Dependensi:');
      const dependenciesText = extractSection('Dependensi:', '\n');

      // Parse dependencies
      const dependencies =
        dependenciesText.toLowerCase() === 'tidak ada'
          ? []
          : dependenciesText
              .split(',')
              .map((d) => parseInt(d.trim()))
              .filter((d) => !isNaN(d));

      // For debugging
      console.log(`Step ${index + 1} parsed content:`);
      console.log('- Description:', description);
      console.log('- Input:', input);
      console.log('- Output:', output);
      console.log('- Dependencies:', dependencies);

      return {
        description,
        inputRequirements: input,
        expectedOutput: output,
        dependencies,
      };
    });
  };

  // Function to get AI feedback
  const getFeedback = async () => {
    if (!workflows.length) return;
    setIsLoadingFeedback(true);
    setStreamingFeedback('');

    try {
      const latestWorkflow = workflows[workflows.length - 1];
      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: `As a workflow optimization expert, analyze this step-by-step approach:

                      Context:
                      "${latestWorkflow.context}"

                      Final Goal:
                      "${latestWorkflow.finalGoal}"

                      Workflow Steps (version ${latestWorkflow.version}):
                      ${latestWorkflow.steps
                        .map(
                          (step) => `
                      Step ${step.stepNumber}:
                      Description: ${step.description}
                      Input Requirements: ${step.inputRequirements}
                      Expected Output: ${step.expectedOutput}
                      Prompt: ${step.prompt}
                      Dependencies: ${step.dependencies.length ? `Steps ${step.dependencies.join(', ')}` : 'None'}
                      `
                        )
                        .join('\n')}

                      Provide feedback in Bahasa Indonesia on:
                      1. Logical Flow Analysis
                      2. Step Granularity (terlalu detail/kurang detail)
                      3. Dependencies Review
                      4. Input/Output Alignment
                      5. Completeness Check
                      
                      Format jawabanmu:
                      ANALISIS ALUR LOGIKA:
                      [analisis]

                      GRANULARITAS TAHAPAN:
                      [analisis]

                      REVIEW DEPENDENSI:
                      [analisis]

                      KESELARASAN INPUT/OUTPUT:
                      [analisis]

                      CEK KELENGKAPAN:
                      [analisis]

                      REKOMENDASI PERBAIKAN:
                      1. [rekomendasi 1]
                      2. [rekomendasi 2]
                      3. [rekomendasi 3]

                      ${
                        latestWorkflow.version > 1
                          ? `
                      EVALUASI IMPROVEMENT:
                      [analisis perbandingan dengan versi sebelumnya]
                      `
                          : ''
                      }`,
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get feedback');

      // Handle streaming response
      const contentType = response.headers.get('content-type');
      let completeFeedback = '';

      if (contentType && contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunkText = decoder.decode(value);
            const lines = chunkText.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.error) {
                    const errorMessage = `\nError: ${data.error}`;
                    setStreamingFeedback((prev) => prev + errorMessage);
                    completeFeedback += errorMessage;
                  } else if (data.content) {
                    setStreamingFeedback((prev) => prev + data.content);
                    completeFeedback += data.content;
                  }
                } catch (error) {
                  console.error('Error parsing JSON from stream:', error, 'Line:', line);
                }
              }
            }
          }
        }

        // Update workflows with feedback
        const updatedWorkflows = [...workflows];
        updatedWorkflows[updatedWorkflows.length - 1].overallFeedback = completeFeedback;
        setWorkflows(updatedWorkflows);
      } else {
        // Handle non-streaming response
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const updatedWorkflows = [...workflows];
        updatedWorkflows[updatedWorkflows.length - 1].overallFeedback = data.content || JSON.stringify(data);
        setWorkflows(updatedWorkflows);
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      setStreamingFeedback(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleSendEmail = async () => {
    if (!workflows.length) {
      setEmailStatus({
        loading: false,
        success: false,
        error: 'Harap buat setidaknya satu workflow terlebih dahulu sebelum mengirim email.'
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
          subject: 'Workshop AI - Latihan Pemecahan Masalah Step-by-Step',
          text: workflows
            .map(
              (workflow) => `
Workflow Versi ${workflow.version}
Timestamp: ${workflow.timestamp}

KONTEKS:
${workflow.context}

HASIL AKHIR:
${workflow.finalGoal}

TAHAPAN:
${workflow.steps
  .map(
    (step) => `
Tahap ${step.stepNumber}:
Deskripsi: ${step.description}
Input: ${step.inputRequirements}
Output: ${step.expectedOutput}
Prompt: ${step.prompt}
Dependensi: ${step.dependencies.length ? step.dependencies.join(', ') : 'Tidak ada'}
`
  )
  .join('\n')}

FEEDBACK:
${workflow.overallFeedback || 'Belum ada feedback'}
-------------------
`
            )
            .join('\n\n'),
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
                  max-width: 800px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                  padding-bottom: 20px;
                  border-bottom: 1px solid #e5e7eb;
                }
                .workflow {
                  margin: 30px 0;
                  padding: 20px;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                }
                .version-header {
                  background-color: #f8f9fa;
                  padding: 15px;
                  border-radius: 6px;
                  margin-bottom: 20px;
                }
                .context-section {
                  background-color: #f8f9fa;
                  padding: 15px;
                  border-radius: 6px;
                  margin: 15px 0;
                }
                .step {
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  padding: 15px;
                  margin: 15px 0;
                }
                .step-header {
                  background-color: #f8f9fa;
                  padding: 10px;
                  border-radius: 4px;
                  margin-bottom: 10px;
                }
                .step-details {
                  margin-left: 15px;
                }
                .feedback-section {
                  background-color: #f8f9fa;
                  padding: 15px;
                  border-radius: 6px;
                  margin-top: 20px;
                }
                .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #e5e7eb;
                  text-align: center;
                  color: #666;
                }
                .timestamp {
                  color: #666;
                  font-size: 14px;
                }
                pre {
                  white-space: pre-wrap;
                  font-family: monospace;
                }
                h1, h2, h3, h4 {
                  color: #2d3748;
                  margin: 10px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Latihan Pemecahan Masalah Step-by-Step</h1>
                </div>

                ${workflows
                  .map(
                    (workflow) => `
                  <div class="workflow">
                    <div class="version-header">
                      <h2>Workflow Versi ${workflow.version}</h2>
                      <div class="timestamp">${workflow.timestamp.toLocaleString()}</div>
                    </div>

                    <div class="context-section">
                      <h3>Konteks dan Tujuan</h3>
                      <div>
                        <strong>Konteks:</strong>
                        <p>${workflow.context}</p>
                      </div>
                      <div>
                        <strong>Hasil Akhir:</strong>
                        <p>${workflow.finalGoal}</p>
                      </div>
                    </div>

                    <div class="steps">
                      <h3>Tahapan</h3>
                      ${workflow.steps
                        .map(
                          (step) => `
                        <div class="step">
                          <div class="step-header">
                            <h4>Tahap ${step.stepNumber}</h4>
                            ${
                              step.dependencies.length
                                ? `<div class="dependencies">Dependensi: Tahap ${step.dependencies.join(', ')}</div>`
                                : '<div class="dependencies">Tidak ada dependensi</div>'
                            }
                          </div>
                          <div class="step-details">
                            <div><strong>Deskripsi:</strong> <p>${step.description}</p></div>
                            <div><strong>Input yang Dibutuhkan:</strong> <p>${step.inputRequirements}</p></div>
                            <div><strong>Output yang Diharapkan:</strong> <p>${step.expectedOutput}</p></div>
                            <div><strong>Prompt:</strong> <pre>${step.prompt}</pre></div>
                          </div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>

                    ${
                      workflow.overallFeedback
                        ? `
                      <div class="feedback-section">
                        <h3>Feedback AI</h3>
                        <pre>${workflow.overallFeedback}</pre>
                      </div>
                    `
                        : ''
                    }
                  </div>
                `
                  )
                  .join('')}
                
                <div class="footer">
                  <p>
                    <strong>Workshop Pengoptimalan AI</strong><br>
                    25-28 Februari 2025<br>
                    Nusantara Power Services
                  </p>
                  <p style="color: #0066cc; font-weight: bold;">
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
    <div className='container mx-auto py-8 space-y-6'>
      <div className="flex justify-between items-center mb-6">
        <h1 className='text-2xl font-bold'>Latihan Pemecahan Masalah Step-by-Step</h1>
        {workflows.length > 0 && (
          <Button
            onClick={handleSendEmail}
            disabled={emailStatus.loading}
            className={`${emailStatus.loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
              ${emailStatus.success ? 'bg-green-600' : ''} text-white px-4 py-2 rounded flex items-center gap-2`}
          >
            <Mail className="h-4 w-4" />
            {emailStatus.loading ? 'Mengirim...' : emailStatus.success ? 'Terkirim!' : 'Kirim ke Email'}
          </Button>
        )}
      </div>

      {emailStatus.error && (
        <Alert className="bg-red-50 text-red-800 mb-4">
          <AlertDescription>{emailStatus.error}</AlertDescription>
        </Alert>
      )}

      {emailStatus.success && (
        <Alert className="bg-green-50 text-green-800 mb-4">
          <AlertDescription>Email berhasil dikirim ke {session?.user?.email}</AlertDescription>
        </Alert>
      )}

      {/* Guidelines Alert */}
      <Alert className='bg-blue-50'>
        <AlertDescription>
          <div className='prose prose-sm max-w-none'>
            <h3 className='text-lg font-semibold mt-0'>Panduan Pemecahan Masalah Step-by-Step:</h3>
            <div className='pl-4'>
              <ul className='list-disc pl-5 space-y-1'>
                <li>Mulai dengan mendefinisikan konteks dan hasil akhir yang diharapkan</li>
                <li>Pecah masalah menjadi tahapan-tahapan yang logis</li>
                <li>Tentukan input yang dibutuhkan dan output yang diharapkan dari setiap tahap</li>
                <li>Identifikasi dependensi antar tahapan</li>
                <li>Pastikan setiap tahap memiliki tujuan yang jelas dan terukur</li>
              </ul>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Context and Goal Input Section */}
      {!contextSubmitted && (
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Langkah 1: Definisikan Konteks dan Tujuan</h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Konteks Situasi</label>
              <Textarea
                placeholder='Jelaskan konteks atau situasi yang ingin Anda selesaikan...'
                value={currentWorkflow.context}
                onChange={(e) => setCurrentWorkflow({ ...currentWorkflow, context: e.target.value })}
                className='min-h-[100px]'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Hasil Akhir yang Diharapkan</label>
              <Textarea
                placeholder='Jelaskan hasil akhir yang ingin Anda capai...'
                value={currentWorkflow.finalGoal}
                onChange={(e) => setCurrentWorkflow({ ...currentWorkflow, finalGoal: e.target.value })}
                className='min-h-[100px]'
              />
            </div>
            <Button onClick={submitContext} disabled={!currentWorkflow.context.trim() || !currentWorkflow.finalGoal.trim()}>
              Lanjut ke Penentuan Tahapan
            </Button>
          </div>
        </Card>
      )}

      {contextSubmitted && !showSuggestions && (
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Ingin Melihat Saran Tahapan?</h2>
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              AI dapat memberikan saran pemecahan tahapan berdasarkan konteks dan tujuan yang Anda definisikan. Anda tetap dapat memodifikasi atau
              membuat tahapan Anda sendiri setelahnya.
            </p>
            <Button
              onClick={async () => {
                setShowSuggestions(true);
                await getSuggestions();
              }}
              disabled={isLoadingSuggestions}
            >
              {isLoadingSuggestions ? 'Memuat Saran...' : 'Lihat Saran Tahapan'}
            </Button>
          </div>
        </Card>
      )}

      {contextSubmitted && showSuggestions && (
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Saran Tahapan dari AI</h2>
          <div className='space-y-6'>
            {/* Show streaming content while loading */}
            {isLoadingSuggestions && (
              <Alert>
                <AlertDescription>
                  <div className='whitespace-pre-wrap font-mono text-sm'>{suggestionsStream || 'Loading...'}</div>
                </AlertDescription>
              </Alert>
            )}

            {/* Show structured suggestions after loading complete */}
            {!isLoadingSuggestions && stepSuggestions.length > 0 && (
              <>
                {stepSuggestions.map((suggestion, index) => (
                  <div key={index} className='border rounded-lg p-4'>
                    <h3 className='text-lg font-medium mb-3'>Tahap {index + 1}</h3>
                    <div className='space-y-3'>
                      <div>
                        <strong className='block text-sm'>Deskripsi:</strong>
                        <p className='mt-1 text-sm'>{suggestion.description}</p>
                      </div>
                      <div>
                        <strong className='block text-sm'>Input yang Dibutuhkan:</strong>
                        <p className='mt-1 text-sm'>{suggestion.inputRequirements}</p>
                      </div>
                      <div>
                        <strong className='block text-sm'>Output yang Diharapkan:</strong>
                        <p className='mt-1 text-sm'>{suggestion.expectedOutput}</p>
                      </div>
                      <div>
                        <strong className='block text-sm'>Dependensi:</strong>
                        <p className='mt-1 text-sm'>
                          {suggestion.dependencies.length > 0 ? `Tahap ${suggestion.dependencies.join(', ')}` : 'Tidak ada dependensi'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className='mt-6'>
              <Button onClick={() => setShowSuggestions(false)}>Lanjut ke Pembuatan Tahapan</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Steps Input Section */}
      {contextSubmitted && (
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Langkah 2: Tentukan Tahapan Workflow (Versi {currentWorkflow.version})</h2>

          {/* Context and Goal Summary */}
          <div className='bg-gray-50 p-4 rounded-md mb-6'>
            <div className='mb-3'>
              <strong>Konteks:</strong>
              <p className='mt-1 text-sm'>{currentWorkflow.context}</p>
            </div>
            <div>
              <strong>Hasil Akhir:</strong>
              <p className='mt-1 text-sm'>{currentWorkflow.finalGoal}</p>
            </div>
          </div>

          {/* Steps */}
          <div className='space-y-6'>
            {currentWorkflow.steps.map((step, index) => (
              <div key={index} className='border rounded-lg p-4 relative'>
                <button onClick={() => removeStep(index)} className='absolute top-2 right-2 text-gray-500 hover:text-red-500'>
                  <X size={16} />
                </button>
                <h3 className='text-lg font-medium mb-3'>Tahap {step.stepNumber}</h3>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Deskripsi Tahapan</label>
                    <Input
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      placeholder='Jelaskan apa yang ingin dicapai pada tahap ini...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Input yang Dibutuhkan</label>
                    <Textarea
                      value={step.inputRequirements}
                      onChange={(e) => updateStep(index, 'inputRequirements', e.target.value)}
                      placeholder='Data/informasi apa yang dibutuhkan untuk tahap ini...'
                      className='min-h-[80px]'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Output yang Diharapkan</label>
                    <Textarea
                      value={step.expectedOutput}
                      onChange={(e) => updateStep(index, 'expectedOutput', e.target.value)}
                      placeholder='Hasil yang diharapkan dari tahap ini...'
                      className='min-h-[80px]'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Prompt untuk AI</label>
                    <Textarea
                      value={step.prompt}
                      onChange={(e) => updateStep(index, 'prompt', e.target.value)}
                      placeholder='Tulis prompt yang akan digunakan untuk tahap ini...'
                      className='min-h-[100px]'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Dependensi (Tahap yang Dibutuhkan)</label>
                    <Input
                      value={step.dependencies.join(', ')}
                      onChange={(e) =>
                        updateStep(
                          index,
                          'dependencies',
                          e.target.value
                            .split(',')
                            .map((num) => parseInt(num.trim()))
                            .filter((num) => !isNaN(num) && num > 0 && num < step.stepNumber)
                        )
                      }
                      placeholder='Contoh: 1, 2 (Kosongkan jika tidak ada)'
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button onClick={addStep} className='w-full' variant='outline'>
              <Plus className='mr-2 h-4 w-4' /> Tambah Tahapan
            </Button>

            <div className='flex gap-2 mt-6'>
              <Button onClick={saveWorkflow} disabled={currentWorkflow.steps.length === 0} className='flex items-center'>
                Simpan Workflow
              </Button>
              {workflows.length > 0 && (
                <Button onClick={getFeedback} variant='outline' disabled={isLoadingFeedback} className='flex items-center'>
                  {isLoadingFeedback ? 'Memuat Masukan...' : 'Minta Masukan'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Workflow History Section */}
      {workflows.map((workflow, index) => (
        <Card key={index} className='p-6'>
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Workflow Versi {workflow.version}</h3>
              <span className='text-sm text-gray-500'>{workflow.timestamp.toLocaleString()}</span>
            </div>

            {/* Context and Goal */}
            <div className='bg-gray-50 p-4 rounded-md space-y-3'>
              <div>
                <strong>Konteks:</strong>
                <p className='mt-1 text-sm'>{workflow.context}</p>
              </div>
              <div>
                <strong>Hasil Akhir:</strong>
                <p className='mt-1 text-sm'>{workflow.finalGoal}</p>
              </div>
            </div>

            {/* Steps Display */}
            <div className='space-y-4'>
              {workflow.steps.map((step, stepIndex) => (
                <div key={stepIndex} className='border rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <h4 className='text-md font-medium'>Tahap {step.stepNumber}</h4>
                    {step.dependencies.length > 0 && (
                      <span className='text-sm text-gray-500'>(Bergantung pada tahap: {step.dependencies.join(', ')})</span>
                    )}
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <strong className='block text-sm'>Deskripsi:</strong>
                      <p className='mt-1 text-sm'>{step.description}</p>
                    </div>
                    <div>
                      <strong className='block text-sm'>Input yang Dibutuhkan:</strong>
                      <p className='mt-1 text-sm'>{step.inputRequirements}</p>
                    </div>
                    <div>
                      <strong className='block text-sm'>Output yang Diharapkan:</strong>
                      <p className='mt-1 text-sm'>{step.expectedOutput}</p>
                    </div>
                    <div>
                      <strong className='block text-sm'>Prompt:</strong>
                      <p className='mt-1 text-sm'>{step.prompt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback Display */}
            {(workflow.overallFeedback || (index === workflows.length - 1 && isLoadingFeedback)) && (
              <Alert>
                <AlertDescription>
                  <div className='whitespace-pre-wrap'>
                    {index === workflows.length - 1 && isLoadingFeedback ? streamingFeedback || 'Loading...' : workflow.overallFeedback}
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

export default StepByStepPage;
