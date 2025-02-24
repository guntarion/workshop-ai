// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// Input validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Generate random reset token
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.issues }, { status: 400 });
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email: result.data.email });

    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json({ message: 'If an account exists with this email, you will receive password reset instructions.' }, { status: 200 });
    }

    // Generate and store reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // In a real application, you would send an email here with the reset link
    // For demo purposes, we'll just return success
    // The reset link would be something like: /auth/reset-password?token=${resetToken}

    return NextResponse.json({ message: 'If an account exists with this email, you will receive password reset instructions.' }, { status: 200 });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
