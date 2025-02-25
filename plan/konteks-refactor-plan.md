# Konteks Page Refactoring Plan

## 1. Component Structure

Break down the large KonteksPage component into smaller, focused components:

```
src/app/(protected)/member/(categories)/latihan/konteks/
├── page.tsx                    # Main page component
├── components/                 # Component directory
│   ├── RoleInput.tsx          # Role input section
│   ├── PromptInput.tsx        # Prompt input section
│   ├── PromptHistory.tsx      # History display
│   ├── FeedbackDisplay.tsx    # Feedback display
│   └── EmailButton.tsx        # Email functionality
```

## 2. Custom Hooks

Extract complex logic into custom hooks:

```typescript
// hooks/useAIFeedback.ts
- Handle AI feedback fetching and streaming
- Manage feedback-related state

// hooks/useEmailSender.ts
- Handle email sending functionality
- Manage email status state

// hooks/usePrompts.ts
- Manage prompts state and operations
```

## 3. Types and Constants

Create separate files for types and constants:

```typescript
// types/
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

// constants/
export const EMAIL_CONFIG = {
  subject: 'Workshop AI - Latihan Kejelasan Instruksi',
  successTimeout: 3000
}

export const AI_CONFIG = {
  model: 'qwen-turbo',
  temperature: 0.7
}
```

## 4. API Utilities

Create utility functions for API calls:

```typescript
// utils/api.ts
export const fetchAIFeedback = async (prompt: string, role: string) => {
  // AI feedback fetching logic
}

export const sendEmail = async (data: EmailData) => {
  // Email sending logic
}
```

## Benefits

1. Improved code organization and readability
2. Better separation of concerns
3. Easier testing and maintenance
4. Reusable components and hooks
5. Type safety improvements
6. Reduced component complexity

## Implementation Steps

1. Create necessary directories and files
2. Extract types and constants
3. Create custom hooks
4. Build smaller components
5. Update main page component
6. Add proper error handling
7. Improve TypeScript types
8. Add loading states and error boundaries

Let me know if you'd like to proceed with this refactoring plan, and we can switch to Code mode to implement these changes.