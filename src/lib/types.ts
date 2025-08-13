import { z } from "zod";

// Chat message interface for AI conversations
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
  timestamp: Date;
}

// Tool invocation structure for flashcard generation
export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
}

// Flashcard interface supporting multiple types
export interface Flashcard {
  id: string;
  type: 'basic' | 'multiple-choice';
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
  answered?: boolean;
}

// Learning session interface for persistent study sessions
export interface LearningSession {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  userId: string;
  messages: ChatMessage[];
  flashcards: Flashcard[];
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
}

// Zod schemas for validation
export const CreateLearningSessionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  subject: z.string().min(1, "Subject is required").max(100, "Subject too long"),
  description: z.string().max(1000, "Description too long").optional(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  toolInvocations: z.array(z.object({
    toolCallId: z.string(),
    toolName: z.string(),
    args: z.record(z.string(), z.unknown()),
    result: z.record(z.string(), z.unknown()).optional(),
  })).optional(),
  timestamp: z.date(),
});

export const FlashcardSchema = z.object({
  id: z.string(),
  type: z.enum(['basic', 'multiple-choice']),
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  answered: z.boolean().optional(),
});

// Type inference from schemas
export type CreateLearningSessionInput = z.infer<typeof CreateLearningSessionSchema>;

// Generic API response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}