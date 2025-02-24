// src/app/(protected)/member/(categories)/latihan/stepbystep/page.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X } from 'lucide-react'; // Import icons for UI elements

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

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <h1 className='text-2xl font-bold mb-6'>Latihan Pemecahan Masalah Step-by-Step</h1>

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
