// src/app/api/email/route.ts
/**
 * API route for sending emails using Next.js App Router
 * Provides POST endpoint for sending emails using the email service
 */

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

/**
 * Handles POST requests for sending emails
 */
export async function POST(req: Request) {
  try {
    // Extract email data from request body
    const { to, subject, text, html } = await req.json();

    // Validate required fields
    if (!to || !subject || !text) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['to', 'subject', 'text'],
        },
        { status: 400 }
      );
    }

    // Send the email
    const info = await sendEmail({ to, subject, text, html });

    // Return success response
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('API route error:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to send email',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
