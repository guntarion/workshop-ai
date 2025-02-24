// src/app/(protected)/admin/ai/qwen/page.tsx
// This file implements the QWEN AI Support Page for administrators.
// It interacts with the QWEN API (via /api/aiApi/qwenAIApi/route.ts) to generate AI responses.
// Detailed inline comments have been added for clarity.

'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

// QwenAiPage component: Displays an input form for the user to get AI generated related content,
// and shows the streaming response from the QWEN API. Also provides navigation links for admin users.
const QwenAiPage: React.FC = () => {
  // State for managing the user prompt, API response, and loading status.
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ref to the response container to enable auto-scrolling.
  const responseRef = useRef<HTMLDivElement>(null);

  // Function to construct the full prompt based on user input.
  const constructPrompt = (input: string) => {
    return `Tell me 10 things related with ${input}`;
  };

  // Handle the form submission and API call.
  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setResponse('');

    try {
      // Construct the full prompt from the user input.
      const fullPrompt = constructPrompt(userInput.trim());
      console.log('Sending prompt:', fullPrompt);

      // Fetch call to the QWEN API endpoint.
      const res = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: fullPrompt,
          model: 'qwen-turbo', // Accepted models: qwen-turbo, qwen-plus, qwen-max.
          temperature: 0.7,
        }),
      });

      // Get the content-type header to determine if response is streaming.
      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('text/event-stream')) {
        // Process streaming responses.
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          // Read streaming chunks.
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunkText = decoder.decode(value);
            // Each line starts with "data: ", so split the stream into lines.
            const lines = chunkText.split('\n');
            lines.forEach((line) => {
              if (line.startsWith('data: ')) {
                try {
                  // Parse the JSON data from the stream.
                  const data = JSON.parse(line.slice(6));
                  if (data.error) {
                    setResponse((prev) => prev + `\nError: ${data.error}`);
                  } else if (data.content) {
                    setResponse((prev) => prev + data.content);
                  }
                } catch (error) {
                  console.error('Error parsing JSON from stream:', error, 'Line:', line);
                }
              }
            });
          }
        }
      } else {
        // Handle non-streaming response.
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setResponse(data.content || JSON.stringify(data));
      }
    } catch (error) {
      const err = error as Error;
      console.error('API Error:', err);
      setResponse(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to auto-scroll the response container when new content is added.
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      {/* Header Section */}
      <header className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>QWEN AI Support Page</h1>
        <p className='text-sm text-gray-600'>Powered by Alibaba Cloud QWEN model</p>
        {/* Navigation links for admins */}
        <nav className='mt-4 space-x-4'>
          <Link href='/admin' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'>
            Admin Dashboard
          </Link>
          <Link href='/admin/ai' className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>
            AI Tools Overview
          </Link>
        </nav>
      </header>

      {/* Main Content Section */}
      <main className='bg-white shadow rounded-lg p-6'>
        {/* Input form for QWEN AI prompt */}
        <div className='mb-4'>
          <label htmlFor='ai-input' className='block text-sm font-medium text-gray-700 mb-1'>
            Enter a topic:
          </label>
          <textarea
            id='ai-input'
            className='w-full border rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-300'
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder='e.g., "artificial intelligence", "space exploration"'
            rows={2}
          />
          <p className='mt-1 text-xs text-gray-500'>The AI will generate 10 items related to your topic.</p>
        </div>

        {/* Submit button */}
        <div className='mb-4'>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !userInput.trim()}
            className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50'
          >
            {isLoading ? (
              <span className='flex items-center'>
                <svg className='animate-spin h-5 w-5 mr-2 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z'></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Get Related Things'
            )}
          </button>
        </div>

        {/* Response display container */}
        {response && (
          <div ref={responseRef} className='p-4 border rounded bg-gray-100 whitespace-pre-wrap max-h-96 overflow-y-auto'>
            {response}
          </div>
        )}
      </main>

      {/* Footer navigation for additional admin links */}
      <footer className='mt-6'>
        <p className='text-sm text-gray-600'>
          <Link href='/admin' className='text-blue-600 hover:underline'>
            Back to Admin Dashboard
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default QwenAiPage;
