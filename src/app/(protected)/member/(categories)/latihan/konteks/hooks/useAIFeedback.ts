import { useState } from 'react';
import { AI_CONFIG } from '../constants';
import { AIFeedbackResponse } from '../types';

export function useAIFeedback() {
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [streamingFeedback, setStreamingFeedback] = useState('');

  const getFeedback = async (role: string, version: number, content: string) => {
    if (!content) return;
    
    setIsLoadingFeedback(true);
    setStreamingFeedback('');
    let completeFeedback = '';

    try {
      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: AI_CONFIG.promptTemplate(role, version, content, version === 1),
          model: AI_CONFIG.model,
          temperature: AI_CONFIG.temperature,
        }),
      });

      if (!response.ok) throw new Error('Failed to get feedback');

      const contentType = response.headers.get('content-type');

      if (contentType?.includes('text/event-stream')) {
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
                  const data: AIFeedbackResponse = JSON.parse(line.slice(6));
                  if (data.error) {
                    const errorMessage = `\nError: ${data.error}`;
                    setStreamingFeedback(prev => prev + errorMessage);
                    completeFeedback += errorMessage;
                  } else if (data.content) {
                    setStreamingFeedback(prev => prev + data.content);
                    completeFeedback += data.content;
                  }
                } catch (error) {
                  console.error('Error parsing JSON from stream:', error);
                }
              }
            }
          }
        }
      } else {
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        completeFeedback = data.content || JSON.stringify(data);
        setStreamingFeedback(completeFeedback);
      }

      return completeFeedback;
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setStreamingFeedback(errorMessage);
      throw error;
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  return {
    isLoadingFeedback,
    streamingFeedback,
    getFeedback,
  };
}