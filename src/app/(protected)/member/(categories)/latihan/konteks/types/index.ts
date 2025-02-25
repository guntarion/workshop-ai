export interface Prompt {
  version: number;
  content: string;
  feedback?: string;
  timestamp: Date;
}

export interface EmailStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
}

export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface AIFeedbackResponse {
  content?: string;
  error?: string;
}