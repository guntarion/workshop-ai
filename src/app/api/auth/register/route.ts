// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { registerSchema, hashPassword } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.issues }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: result.data.email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(result.data.password);
    const user = await User.create({
      email: result.data.email,
      name: result.data.name,
      password: hashedPassword,
      role: 'member', // Default role for new registrations
    });

    // Convert to plain object and remove password
    const userObject = user.toObject();
    delete userObject.password;

    return NextResponse.json({ message: 'User registered successfully', user: userObject }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
