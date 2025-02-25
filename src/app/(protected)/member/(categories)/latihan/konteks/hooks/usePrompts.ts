import { useState } from 'react';
import { Prompt } from '../types';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const addPromptVersion = (content: string) => {
    if (!content.trim()) return;

    const newPrompt: Prompt = {
      version: prompts.length + 1,
      content: content.trim(),
      timestamp: new Date(),
    };

    setPrompts([...prompts, newPrompt]);
    setCurrentPrompt('');
  };

  const updatePromptFeedback = (version: number, feedback: string) => {
    setPrompts(currentPrompts => 
      currentPrompts.map(prompt => 
        prompt.version === version 
          ? { ...prompt, feedback } 
          : prompt
      )
    );
  };

  return {
    prompts,
    currentPrompt,
    setCurrentPrompt,
    addPromptVersion,
    updatePromptFeedback,
    latestPrompt: prompts[prompts.length - 1]
  };
}