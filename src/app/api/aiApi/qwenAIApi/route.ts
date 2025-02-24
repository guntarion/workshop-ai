// src/app/api/aiApi/qwenApi/route.ts
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Initialize OpenAI client with QWEN configuration
const qwenClient = new OpenAI({
  apiKey: process.env.QWEN_API_KEY || '',
  baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
});

// Interface for QWEN response chunk
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface QwenChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
    logprobs: null;
    finish_reason: string | null;
  }[];
  usage: null | {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  system_fingerprint: null;
}

export async function POST(req: Request) {
  try {
    if (!process.env.QWEN_API_KEY) {
      return NextResponse.json({ error: 'QWEN API key is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { systemPrompt, userPrompt = body.prompt, model = 'qwen-plus', temperature = 0.7 } = body;

    if (!userPrompt) {
      return NextResponse.json({ error: 'User prompt is required' }, { status: 400 });
    }

    // Prepare messages array
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
      { role: 'user', content: userPrompt },
    ];

    // Set up streaming
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    try {
      const completion = await qwenClient.chat.completions.create({
        model,
        messages,
        stream: true,
        temperature,
      });

      (async () => {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content || chunk.choices[0]?.finish_reason === 'stop') {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
          await writer.write(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
        } finally {
          await writer.close();
        }
      })();

      return new Response(stream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (apiError) {
      console.error('QWEN API error:', apiError);
      const errorMessage = apiError instanceof Error ? apiError.message : 'QWEN API error';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
