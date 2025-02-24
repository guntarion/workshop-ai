// src/app/(protected)/member/(categories)/latihan/action-role/page.tsx
// This component implements an interactive guide for workshop participants
// to practice creating effective AI prompts with appropriate role assignments.

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getActionHintPrompt, getScenarioHintPrompt, getRoleHintPrompt, generateFinalPrompt } from './utils/prompts';

// Interface for AI hints structure
interface AIHint {
  questions: string[];
  suggestions: string[];
}

const RoleAssignmentPage = () => {
  // State management for form inputs and AI responses
  const [topic, setTopic] = useState('');
  const [scenario, setScenario] = useState('');
  const [action, setAction] = useState('');
  const [role, setRole] = useState('');
  const [isLoadingActionHint, setIsLoadingActionHint] = useState(false);
  const [isLoadingScenarioHint, setIsLoadingScenarioHint] = useState(false);
  const [isLoadingRoleHint, setIsLoadingRoleHint] = useState(false);
  const [actionHints, setActionHints] = useState<AIHint | null>(null);
  const [scenarioHints, setScenarioHints] = useState<AIHint | null>(null);
  const [roleHints, setRoleHints] = useState<AIHint | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompt');

  // Function to handle copying prompt to clipboard
  const handleCopyPrompt = async () => {
    const promptText = generateFinalPrompt(topic, role, action, scenario);
    try {
      await navigator.clipboard.writeText(promptText);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy Prompt');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyButtonText('Failed to copy');
      setTimeout(() => {
        setCopyButtonText('Copy Prompt');
      }, 2000);
    }
  };

  // Function to get AI hints for scenario development
  const getScenarioHints = async () => {
    if (!topic.trim()) return;
    setIsLoadingScenarioHint(true);

    try {
      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: getScenarioHintPrompt(topic),
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get hints');

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

      // Parse the response into questions and suggestions
      const questions: string[] = [];
      const suggestions: string[] = [];
      let isCollectingQuestions = false;
      let isCollectingSuggestions = false;

      fullResponse.split('\n').forEach((line) => {
        if (line.includes('Pertanyaan untuk mengembangkan skenario:')) {
          isCollectingQuestions = true;
          isCollectingSuggestions = false;
        } else if (line.includes('Aspek skenario yang perlu dipertimbangkan:')) {
          isCollectingQuestions = false;
          isCollectingSuggestions = true;
        } else if (line.trim().match(/^\d+\./)) {
          const content = line.replace(/^\d+\./, '').trim();
          if (isCollectingQuestions) questions.push(content);
          if (isCollectingSuggestions) suggestions.push(content);
        }
      });

      setScenarioHints({ questions, suggestions });
    } catch (error) {
      console.error('Error getting scenario hints:', error);
    } finally {
      setIsLoadingScenarioHint(false);
    }
  };

  // Function to get AI hints for action refinement
  const getActionHints = async () => {
    if (!topic.trim()) return;
    setIsLoadingActionHint(true);

    try {
      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: getActionHintPrompt(topic),
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get hints');

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

      // Parse the response into questions and suggestions
      const questions: string[] = [];
      const suggestions: string[] = [];
      let isCollectingQuestions = false;
      let isCollectingSuggestions = false;

      fullResponse.split('\n').forEach((line) => {
        if (line.includes('Pertanyaan untuk dipertimbangkan:')) {
          isCollectingQuestions = true;
          isCollectingSuggestions = false;
        } else if (line.includes('Saran kata kerja:')) {
          isCollectingQuestions = false;
          isCollectingSuggestions = true;
        } else if (line.trim().match(/^\d+\./)) {
          const content = line.replace(/^\d+\./, '').trim();
          if (isCollectingQuestions) questions.push(content);
          if (isCollectingSuggestions) suggestions.push(content);
        }
      });

      setActionHints({ questions, suggestions });
    } catch (error) {
      console.error('Error getting action hints:', error);
    } finally {
      setIsLoadingActionHint(false);
    }
  };

  // Function to get AI hints for role refinement
  const getRoleHints = async () => {
    if (!action.trim()) return;
    setIsLoadingRoleHint(true);

    try {
      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: getRoleHintPrompt(topic, action),
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get hints');

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

      // Parse the response into questions and suggestions
      const questions: string[] = [];
      const suggestions: string[] = [];
      let isCollectingQuestions = false;
      let isCollectingSuggestions = false;

      fullResponse.split('\n').forEach((line) => {
        if (line.includes('Pertanyaan untuk dipertimbangkan:')) {
          isCollectingQuestions = true;
          isCollectingSuggestions = false;
        } else if (line.includes('Karakteristik peran yang disarankan:')) {
          isCollectingQuestions = false;
          isCollectingSuggestions = true;
        } else if (line.trim().match(/^\d+\./)) {
          const content = line.replace(/^\d+\./, '').trim();
          if (isCollectingQuestions) questions.push(content);
          if (isCollectingSuggestions) suggestions.push(content);
        }
      });

      setRoleHints({ questions, suggestions });
    } catch (error) {
      console.error('Error getting role hints:', error);
    } finally {
      setIsLoadingRoleHint(false);
    }
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <h1 className='text-2xl font-bold mb-6'>TRAS Prompting Practice</h1>

      {/* Topic Input Section */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Langkah 1: Definisikan Topik Anda</h2>
        <div className='space-y-4'>
          <Textarea
            placeholder='Masukkan topik atau subjek yang ingin Anda eksplorasi dengan AI...'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className='min-h-[100px]'
          />
          <div className='flex gap-2'>
            <Button onClick={getActionHints} disabled={!topic.trim() || isLoadingActionHint}>
              {isLoadingActionHint ? 'Memuat Saran...' : 'Dapatkan Saran Action'}
            </Button>
            <Button onClick={getScenarioHints} disabled={!topic.trim() || isLoadingScenarioHint} variant='outline'>
              {isLoadingScenarioHint ? 'Memuat Saran...' : 'Dapatkan Saran Skenario'}
            </Button>
          </div>
        </div>

        {/* Display Action Hints */}
        {actionHints && (
          <Alert className='mt-4'>
            <AlertDescription>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold'>Pertanyaan untuk dipertimbangkan:</h3>
                  <ul className='list-disc pl-4 mt-2'>
                    {actionHints.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className='font-semibold'>Saran kata kerja:</h3>
                  <ul className='list-disc pl-4 mt-2'>
                    {actionHints.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Display Scenario Hints */}
        {scenarioHints && (
          <Alert className='mt-4'>
            <AlertDescription>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold'>Pertanyaan untuk mengembangkan skenario:</h3>
                  <ul className='list-disc pl-4 mt-2'>
                    {scenarioHints.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className='font-semibold'>Aspek skenario yang perlu dipertimbangkan:</h3>
                  <ul className='list-disc pl-4 mt-2'>
                    {scenarioHints.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Scenario Input Section */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Langkah 2: Definisikan Skenario</h2>
        <div className='space-y-4'>
          <div className='p-4 bg-gray-50 rounded-md text-sm text-gray-600'>
            <p>Konteks Utama:</p>
            <p className='mt-2'>
              Solusi yang didiskusikan ini diimplementasikan di lingkungan PLN Nusantara Power Services (NP Services), anak Perusahaan PLN Nusantara
              Power, yang bergerak di bidang Operation & Maintenance dengan segala proses bisnis pendukungnya.
            </p>
          </div>
          <Textarea
            placeholder='Berdasarkan saran di atas dan konteks utama, jelaskan skenario spesifik yang relevan dengan topik Anda...'
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className='min-h-[100px]'
          />
        </div>
      </Card>

      {/* Action Input Section */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Langkah 2: Tentukan Action</h2>
        <div className='space-y-4'>
          <Textarea
            placeholder='Berdasarkan saran di atas, tentukan action yang Anda inginkan dari AI...'
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className='min-h-[100px]'
          />
          <Button onClick={getRoleHints} disabled={!action.trim() || isLoadingRoleHint}>
            {isLoadingRoleHint ? 'Memuat Saran...' : 'Dapatkan Saran Role'}
          </Button>
        </div>

        {/* Display Role Hints */}
        {roleHints && (
          <Alert className='mt-4'>
            <AlertDescription>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold'>Pertanyaan untuk dipertimbangkan:</h3>
                  <ul className='list-disc pl-4 mt-2'>
                    {roleHints.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className='font-semibold'>Karakteristik peran yang disarankan:</h3>
                  <ul className='list-disc pl-4 mt-2'>
                    {roleHints.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Role Definition Section */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Langkah 3: Definisikan Role AI</h2>
        <div className='space-y-4'>
          <Textarea
            placeholder='Berdasarkan saran di atas, definisikan peran dan kualifikasi yang harus dimiliki AI...'
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className='min-h-[100px]'
          />
        </div>
      </Card>

      {/* Final Preview Section */}
      {role && (
        <>
          <Card className='p-6 bg-gray-50'>
            <div className='flex justify-between items-start mb-4'>
              <h2 className='text-xl font-semibold'>Komponen RASEC Anda sejauh ini:</h2>
              <Button onClick={handleCopyPrompt} variant='outline' className='ml-4'>
                {copyButtonText}
              </Button>
            </div>
            <div className='space-y-2'>
              <p>
                <strong>Topik:</strong> {topic}
              </p>
              <p>
                <strong>Skenario:</strong> {scenario}
              </p>
              <p>
                <strong>Action:</strong> {action}
              </p>
              <p>
                <strong>Role:</strong> {role}
              </p>
            </div>
          </Card>

          {/* Generated Prompt Preview */}
          <Card className='p-6 mt-4'>
            <h2 className='text-xl font-semibold mb-4'>Generated Prompt:</h2>
            <pre className='bg-gray-100 p-4 rounded-md whitespace-pre-wrap font-mono text-sm'>
              {generateFinalPrompt(topic, role, action, scenario)}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
};

export default RoleAssignmentPage;
