// src/app/(protected)/member/(categories)/latihan/role-assignment/page.tsx
// This component implements an interactive guide for workshop participants
// to practice creating effective AI prompts with appropriate role assignments.

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define the structure for AI hints
interface AIHint {
  questions: string[];
  suggestions: string[];
}

const RoleAssignmentPage = () => {
  // State management for form inputs and AI responses
  const [topic, setTopic] = useState('');
  const [action, setAction] = useState('');
  const [role, setRole] = useState('');
  const [isLoadingActionHint, setIsLoadingActionHint] = useState(false);
  const [isLoadingRoleHint, setIsLoadingRoleHint] = useState(false);
  const [actionHints, setActionHints] = useState<AIHint | null>(null);
  const [roleHints, setRoleHints] = useState<AIHint | null>(null);

  // Function to get AI hints for action refinement
  const getActionHints = async () => {
    if (!topic.trim()) return;
    setIsLoadingActionHint(true);

    try {
      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: `As an AI prompt expert, help guide the user to refine their action for this topic: "${topic}". 
                      Provide, in Bahasa Indonesia:
                      1. Three thought-provoking questions to help them specify their action more clearly
                      2. Three suggestions for possible action verbs they might consider                      `,
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get hints');

      const data = await response.json();
      setActionHints(JSON.parse(data.content));
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
          userPrompt: `As an AI prompt expert, help guide the user to define an appropriate AI role for this action: "${action}" related to topic: "${topic}".
                      Provide:
                      1. Three questions to help them refine the role's expertise and qualifications
                      2. Three suggestions for possible role characteristics to consider
                      Format as JSON: { "questions": [...], "suggestions": [...] }`,
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to get hints');

      const data = await response.json();
      setRoleHints(JSON.parse(data.content));
    } catch (error) {
      console.error('Error getting role hints:', error);
    } finally {
      setIsLoadingRoleHint(false);
    }
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <h1 className='text-2xl font-bold mb-6'>Role Assignment Practice</h1>

      {/* Topic Input Section */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Step 1: Define Your Topic</h2>
        <div className='space-y-4'>
          <Textarea
            placeholder='Enter the topic or subject you want to explore with AI...'
            value={topic}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTopic(e.target.value)}
            className='min-h-[100px]'
          />
          <Button onClick={getActionHints} disabled={!topic.trim() || isLoadingActionHint}>
            {isLoadingActionHint ? 'Getting Hints...' : 'Get Action Hints'}
          </Button>
        </div>

        {/* Display Action Hints */}
        {actionHints && (
          <Alert className='mt-4'>
            <AlertDescription>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold'>Consider these questions:</h3>
                  <ul className='list-disc pl-4 mt-2'>
                    {actionHints.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className='font-semibold'>Suggested action verbs:</h3>
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
      </Card>

      {/* Action Input Section */}
      <Card className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Step 2: Specify Your Action</h2>
        <div className='space-y-4'>
          <Textarea
            placeholder='Based on the hints above, specify what action you want the AI to take...'
            value={action}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAction(e.target.value)}
            className='min-h-[100px]'
          />
          <Button onClick={getRoleHints} disabled={!action.trim() || isLoadingRoleHint}>
            {isLoadingRoleHint ? 'Getting Hints...' : 'Get Role Hints'}
          </Button>
        </div>

        {/* Display Role Hints */}
        {roleHints && (
          <Alert className='mt-4'>
            <AlertDescription>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold'>Consider these questions:</h3>
                  <ul className='list-disc pl-4 mt-2'>
                    {roleHints.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className='font-semibold'>Role characteristics to consider:</h3>
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
        <h2 className='text-xl font-semibold mb-4'>Step 3: Define the AI&apos;s Role</h2>
        <div className='space-y-4'>
          <Textarea
            placeholder='Based on the hints above, define the role and qualifications the AI should assume...'
            value={role}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRole(e.target.value)}
            className='min-h-[100px]'
          />
        </div>
      </Card>

      {/* Final Preview Section */}
      {role && (
        <Card className='p-6 bg-gray-50'>
          <h2 className='text-xl font-semibold mb-4'>Your RASEC Components So Far:</h2>
          <div className='space-y-2'>
            <p>
              <strong>Topic:</strong> {topic}
            </p>
            <p>
              <strong>Action:</strong> {action}
            </p>
            <p>
              <strong>Role:</strong> {role}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RoleAssignmentPage;
