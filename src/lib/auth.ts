// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb';
import dbConnect from './db';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { loginSchema } from './validations/auth';

// List of admin email addresses
const ADMIN_EMAILS = ['guntarion@gmail.com'];

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          // Validate input
          const validatedFields = loginSchema.safeParse(credentials);
          if (!validatedFields.success) return null;

          await dbConnect();

          // Find user
          const user = await User.findOne({ email: credentials.email });
          if (!user || !user.password) return null;

          // Check password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          await dbConnect();
          // Check if user exists and has a role
          const dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            // Create new user with appropriate role
            await User.create({
              email: user.email,
              name: user.name || '',
              image: user.image || undefined,
              role: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'member',
            });
          } else if (!dbUser.role) {
            // Update existing user with role if missing
            await User.updateOne({ _id: dbUser._id }, { $set: { role: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'member' } });
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;

        // For Google sign-in, fetch fresh user data to get the role
        if (account?.provider === 'google') {
          try {
            await dbConnect();
            const dbUser = await User.findOne({ email: user.email });
            if (dbUser) {
              token.role = dbUser.role;
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        } else {
          token.role = user.role || 'member';
        }
      }
      // Handle user updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative URLs
      if (url.startsWith('/')) {
        // If coming from login, redirect to home first to ensure session is initialized
        if (url.startsWith('/auth/login')) {
          return baseUrl;
        }
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },
};

// Helper functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
