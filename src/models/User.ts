// src/models/User.ts
import mongoose from 'mongoose';
import { Schema, model, models } from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password?: string;
  name: string;
  role: 'admin' | 'member';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  accounts?: Array<{
    provider: string;
    providerAccountId: string;
  }>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // This replaces the separate index declaration
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
      required: [true, 'Role is required'],
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
    resetToken: {
      type: String,
      select: false, // Don't include in normal queries
    },
    resetTokenExpiry: {
      type: Date,
      select: false, // Don't include in normal queries
    },
    accounts: [
      {
        provider: String,
        providerAccountId: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create compound index for accounts
userSchema.index({ 'accounts.provider': 1, 'accounts.providerAccountId': 1 });
userSchema.index({ resetToken: 1 }, { sparse: true });

// Don't send password in JSON responses
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetToken;
    delete ret.resetTokenExpiry;
    return ret;
  },
});

// Handle model creation for Next.js hot reloading
const User = models.User || model<IUser>('User', userSchema);

export default User;
