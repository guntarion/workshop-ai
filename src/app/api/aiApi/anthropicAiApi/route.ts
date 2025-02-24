// src/app/api/aiApi/anthropicAiApi/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API,
});

export async function POST(req: Request) {
  console.log('Starting Anthropic API request');
  try {
    const body = await req.json();
    // console.log('Request body keys:', Object.keys(body));

    const { prompt, model = 'claude-3-5-sonnet-20241022', maxTokens = 8192 } = body;
    // const { prompt, model = 'claude-3-5-haiku-latest', maxTokens = 4096 } = body;

    // console.log('Parsed request parameters:', {
    //   hasPrompt: !!prompt,
    //   model,
    //   maxTokens,
    // });

    if (!prompt) {
      console.log('No prompt provided');
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Creating TransformStream');
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    console.log('Starting Anthropic stream');
    (async () => {
      try {
        // console.log('Making request to Anthropic');
        const stream = await client.messages.stream({
          messages: [{ role: 'user', content: prompt }],
          model,
          max_tokens: maxTokens,
        });

        console.log('Setting up stream event handlers');
        stream.on('text', async (text) => {
          // console.log('Received text chunk:', text.slice(0, 50) + '...');
          await writer.write(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
        });

        stream.on('end', async () => {
          // console.log('Stream ended');
          await writer.close();
        });

        stream.on('error', async (error) => {
          console.error('Stream error:', error);
          await writer.abort(error);
        });
      } catch (error) {
        console.error('Streaming error:', error);
        await writer.abort(error);
      }
    })();

    console.log('Returning stream response');
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
