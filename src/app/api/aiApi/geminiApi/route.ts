// src\app\api\aiApi\geminiApi\route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Validate environment variable
if (!process.env.GEMINI_KEY) {
  throw new Error('GEMINI_KEY environment variable is not set');
}

// Initialize Gemini AI with configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const defaultModel = 'gemini-1.5-pro';
const defaultSystemInstruction = 'You are a helpful AI assistant that provides clear and accurate information.';

export async function POST(req: Request) {
  try {
    // Validate request body
    if (!req.body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const { userPrompt, systemInstruction = defaultSystemInstruction } = await req.json();

    if (!userPrompt) {
      return NextResponse.json(
        {
          error: 'User prompt is required',
        },
        { status: 400 }
      );
    }

    // Initialize model with system instruction
    const model = genAI.getGenerativeModel({
      model: defaultModel,
      systemInstruction: systemInstruction,
    });

    // Create streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start content generation with timeout
    const timeoutMs = 30000; // 30 second timeout
    const contentPromise = model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Content generation timed out')), timeoutMs);
    });

    try {
      // Race between content generation and timeout
      const result = (await Promise.race([contentPromise, timeoutPromise])) as Awaited<typeof contentPromise>;

      // Process stream
      (async () => {
        try {
          let hasContent = false;
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              hasContent = true;
              await writer.write(encoder.encode(`data: ${JSON.stringify({ content: chunkText })}\n\n`));
            }
          }

          // If no content was generated, throw error
          if (!hasContent) {
            throw new Error('No content generated');
          }

          await writer.close();
        } catch (error) {
          console.error('Streaming error:', error);
          // Send error message through stream before closing
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown streaming error',
              })}\n\n`
            )
          );
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
    } catch (error) {
      console.error('Content generation error:', error);
      return NextResponse.json(
        {
          error: 'Content generation failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
