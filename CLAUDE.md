# AI Tutor Demo - Progressive Implementation Guide

## Project overview

This is an AI-powered tutoring application that generates interactive flash cards for any subject. The demo showcases Claude's educational content generation capabilities through a modern web interface using generative UI patterns.

**Starting point**: We begin with the [better-auth-mongodb](https://github.com/codeSTACKr/better-auth-mongodb) repository, which provides a complete todo app with authentication. We'll progressively transform this into our AI tutor application.

**Key innovation**: Interactive flash cards are generated as UI components within the chat interface, not just text responses. This demonstrates Claude's ability to create structured, interactive educational content.

**IMPORTANT** The code examples in this file are suggestions and should be double-checked before implementing. They may not be fully functional or optimized for our specific needs.

## Progressive Implementation Strategy

This guide is structured in **3 phases** to build the AI tutor incrementally:

### 🚀 Phase 1: Proof of Concept (POC)
- **Goal**: Get basic AI chat working with simple flashcard generation
- **Time**: 2-4 hours
- **Features**: Basic chat interface, simple Q&A flashcards, minimal UI

### 📈 Phase 2: Minimum Viable Product (MVP) 
- **Goal**: Add essential tutoring features and user persistence
- **Time**: 2-4 hours  
- **Features**: Learning sessions, progress tracking, multiple card types

### 🎯 Phase 3: Advanced Features
- **Goal**: Add sophisticated adaptive learning and analytics
- **Time**: 2-4 hours
- **Features**: Scoring system, difficulty progression, comprehensive analytics

---

## Tech stack

- **Framework**: Next.js 15 with App Router (from base repo)
- **Authentication**: better-auth with MongoDB adapter (from base repo)
- **Database**: MongoDB (from base repo)
- **AI**: Vercel AI SDK with Claude integration (new addition)
- **UI**: Vercel AI Elements → shadcn/ui → custom Tailwind (in that priority order)
- **Styling**: Tailwind CSS (from base repo)
- **Deployment**: Vercel

## Starting file structure (from base repo)

```
src/
├── app/
│   ├── api/auth/ # Better Auth API routes (keep as-is)
│   ├── auth/ # Authentication pages (keep as-is)
│   ├── todos/ # Todo management page (convert to study/)
│   └── page.tsx # Landing page (modify messaging)
├── components/
│   ├── auth/ # Authentication components (keep as-is)
│   └── ui/ # shadcn/ui components (keep as-is)
├── hooks/ # Custom React hooks (keep as-is)
├── lib/
│   ├── auth.ts # Better Auth configuration (keep as-is)
│   ├── auth-client.ts # Client-side auth hooks (keep as-is)
│   ├── auth-server.ts # Server-side auth utilities (keep as-is)
│   ├── actions.ts # Server actions (modify for flashcards)
│   ├── mongodb.ts # MongoDB client setup (keep as-is)
│   ├── env.ts # Environment variable validation (add AI keys)
│   ├── types.ts # TypeScript definitions (remove todo types and add flashcard types)
│   └── utils.ts # Utility functions (keep as-is)
└── middleware.ts # Route protection middleware (slightly modify for new routes)
```

## Modified project structure (our target)

```
src/
├── app/
│   ├── api/
│   │   ├── auth/ # Better Auth API routes (unchanged)
│   │   └── chat/ # New: AI streaming route
│   ├── auth/ # Authentication pages (unchanged)
│   ├── tutor/ # Modified from todos/ - main tutor interface
│   │   ├── page.tsx # Sessions list and create new session
│   │   ├── [sessionId]/ # Individual learning session
│   │   │   └── page.tsx # Chat interface with session persistence
│   │   └── new/ # Create new learning session
│   │       └── page.tsx
│   ├── dashboard/ # New: user dashboard with session analytics
│   │   └── page.tsx
│   └── page.tsx # Landing page (update messaging)
├── components/
│   ├── auth/ # Authentication components (unchanged)
│   ├── ui/ # shadcn/ui components (unchanged)
│   ├── flashcards/ # New: flashcard components
│   │   ├── basic-flashcard.tsx
│   │   ├── multiple-choice-card.tsx
│   │   ├── fill-blank-card.tsx
│   │   └── flashcard-set.tsx
│   ├── chat/ # New: AI chat components
│   │   └── ai-tutor-chat.tsx
│   └── sessions/ # New: session management components
│       ├── session-list.tsx
│       ├── session-card.tsx
│       └── create-session-form.tsx
├── hooks/ # Custom React hooks (keep existing, add new)
├── lib/
│   ├── auth.ts # Better Auth configuration (unchanged)
│   ├── auth-client.ts # Client-side auth hooks (unchanged)
│   ├── auth-server.ts # Server-side auth utilities (unchanged)
│   ├── actions.ts # Server actions (modify for sessions & flashcards)
│   ├── mongodb.ts # MongoDB client setup (unchanged)
│   ├── env.ts # Environment validation (add AI keys)
│   ├── types.ts # TypeScript definitions (add session & flashcard types)
│   ├── ai.ts # New: Vercel AI SDK setup
│   └── utils.ts # Utility functions (unchanged)
├── models/ # New: MongoDB schemas
│   ├── learning-session.ts
│   └── flashcard-set.ts
└── middleware.ts # Route protection middleware (unchanged)
```

## Migration steps from todo app to AI tutor

# 🚀 PHASE 1: PROOF OF CONCEPT (2-4 hours)

## Goal: Basic AI Chat with Simple Flashcards

The POC focuses on getting the core AI interaction working with minimal complexity. We'll transform the existing todo app into a basic AI tutor that can generate simple flashcards.

### Prerequisites Check ✅

The repository already has most dependencies installed:
- ✅ `@ai-sdk/anthropic` and `@ai-sdk/react` 
- ✅ `ai` SDK
- ✅ AI Elements components
- ✅ `zod` for validation
- ✅ Better Auth system
- ✅ MongoDB integration

### Phase 1 Setup Steps

#### 1. Add Environment Variables
Add to your `.env.local`: Done ✅ 
```env
# Existing variables (already configured)
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_auth_secret
# Optional: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

# New for Phase 1: AI integration
ANTHROPIC_API_KEY=your_anthropic_key_here
```

#### 2. Update Environment Validation
Update `src/lib/env.ts` to include AI key validation:
```typescript
const requiredEnvVars = [
  'MONGODB_URI',
  'BETTER_AUTH_SECRET',
  'ANTHROPIC_API_KEY', // Add this line
] as const;
```

#### 3. Create Basic AI Configuration
Create `src/lib/ai.ts`:
```typescript
import { anthropic } from '@ai-sdk/anthropic';

export const model = anthropic('claude-3-5-sonnet-20241022');
```

#### 4. Create Basic AI Chat API Route
Create `src/app/api/chat/route.ts`:
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages,
    tools: {
      generateFlashcard: tool({
        description: 'Generate a simple flashcard for learning',
        parameters: z.object({
          question: z.string(),
          answer: z.string(),
          explanation: z.string().optional(),
        }),
      }),
    },
    system: `You are a helpful AI tutor. When users ask about learning topics, use the generateFlashcard tool to create simple question and answer cards. Keep explanations brief and educational.`,
  });

  return result.toDataStreamResponse();
}
```

#### 5. Create Simple Flashcard Component  
Create `src/components/flashcards/simple-flashcard.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SimpleFlashcardProps {
  question: string;
  answer: string;
  explanation?: string;
}

export function SimpleFlashcard({ question, answer, explanation }: SimpleFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <h3 className="text-lg font-semibold">
          {!isFlipped ? 'Question' : 'Answer'}
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="min-h-[100px] flex items-center justify-center text-center">
          {!isFlipped ? (
            <p className="text-lg">{question}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-green-600">{answer}</p>
              {explanation && (
                <p className="text-sm text-gray-600 italic">{explanation}</p>
              )}
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => setIsFlipped(!isFlipped)} 
          className="w-full"
        >
          {!isFlipped ? 'Show Answer' : 'Show Question'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### 6. Transform Todos Page to Basic Tutor
Update `src/app/todos/page.tsx` to `src/app/tutor/page.tsx`:
```typescript
import { TutorChat } from "./tutor-chat";
import { getServerSession } from "@/lib/auth-server";

export default async function TutorPage() {
  const session = await getServerSession();
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Tutor</h1>
        <p className="text-gray-600">Ask me to create flashcards on any topic!</p>
      </div>
      
      <TutorChat session={session} />
    </div>
  );
}
```

#### 7. Create Basic Chat Interface
Create `src/app/tutor/tutor-chat.tsx`:
```typescript
'use client';

import { useChat } from '@ai-sdk/react';
import { Message } from '@/components/ai-elements/message';
import { PromptInput } from '@/components/ai-elements/prompt-input';
import { SimpleFlashcard } from '@/components/flashcards/simple-flashcard';

interface TutorChatProps {
  session: any;
}

export function TutorChat({ session }: TutorChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [{
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI tutor. What subject would you like to study today? I can create flashcards for any topic!'
    }]
  });

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            {message.content}
          </Message>
        ))}
        
        {/* Render flashcards */}
        {messages.map((message) => {
          if (message.role === 'assistant' && message.toolInvocations) {
            return message.toolInvocations.map((toolInvocation, index) => {
              if (toolInvocation.toolName === 'generateFlashcard') {
                const { question, answer, explanation } = toolInvocation.result;
                return (
                  <div key={`${message.id}-${index}`} className="flex justify-center py-4">
                    <SimpleFlashcard
                      question={question}
                      answer={answer}
                      explanation={explanation}
                    />
                  </div>
                );
              }
              return null;
            });
          }
          return null;
        })}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t">
        <PromptInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="Ask for flashcards on any topic..."
        />
      </div>
    </div>
  );
}
```

#### 8. Update Navigation
Update `src/app/layout.tsx` to change navigation from "Todos" to "Tutor":
```typescript
// Find the navigation link and update it
<Link href="/tutor">Tutor</Link>
```

### Phase 1 Testing
1. Start the app: `npm run dev`
2. Login with your account
3. Navigate to `/tutor`
4. Ask: "Create flashcards for basic algebra"
5. Verify flashcards appear and can flip between question/answer

**Success criteria**: Users can chat with AI and get simple interactive flashcards.

# 📈 PHASE 2: MINIMUM VIABLE PRODUCT (2-4 hours)

## Goal: Essential Tutoring Features & User Persistence

Phase 2 builds on the POC to add essential tutoring functionality: learning sessions, progress tracking, and multiple flashcard types.

### Phase 2 Features
- ✅ **Learning Sessions**: Users can create and resume study sessions
- ✅ **Session Persistence**: Chat history and progress saved to database
- ✅ **Multiple Card Types**: Basic Q&A, Multiple Choice
- ✅ **Simple Progress Tracking**: Track answered questions
- ✅ **Session Management**: List, create, delete sessions

### Phase 2 Implementation Steps

#### 1. Add Session Types
Update `src/lib/types.ts`:
```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: any[];
  timestamp: Date;
}

export interface Flashcard {
  id: string;
  type: 'basic' | 'multiple-choice';
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
  answered?: boolean;
}

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
```

#### 2. Add Session Management Actions
Update `src/lib/actions.ts`:
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/auth-server';
import { connectToDatabase } from '@/lib/mongodb';

export async function createLearningSession(formData: FormData) {
  const session = await getSessionFromHeaders(headers());
  
  if (!session) {
    redirect('/auth/login');
  }

  const title = formData.get('title') as string;
  const subject = formData.get('subject') as string;
  const description = formData.get('description') as string;

  const { database } = await connectToDatabase();

  const learningSession = {
    title,
    subject,
    description,
    userId: session.userId,
    messages: [],
    flashcards: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastAccessedAt: new Date()
  };

  const result = await database.collection('learningSessions').insertOne(learningSession);
  
  revalidatePath('/tutor');
  return { success: true, sessionId: result.insertedId.toString() };
}

export async function getUserLearningSessions() {
  const session = await getSessionFromHeaders(headers());
  
  if (!session) {
    return [];
  }

  const { database } = await connectToDatabase();
  
  const sessions = await database
    .collection('learningSessions')
    .find({ userId: session.userId })
    .sort({ lastAccessedAt: -1 })
    .toArray();

  return sessions.map(session => ({
    ...session,
    _id: session._id.toString()
  }));
}

export async function getLearningSession(sessionId: string) {
  const session = await getSessionFromHeaders(headers());
  
  if (!session) {
    redirect('/auth/login');
  }

  const { database } = await connectToDatabase();
  const { ObjectId } = await import('mongodb');
  
  const learningSession = await database
    .collection('learningSessions')
    .findOne({ 
      _id: new ObjectId(sessionId),
      userId: session.userId 
    });

  if (!learningSession) {
    redirect('/tutor');
  }

  // Update last accessed
  await database.collection('learningSessions').updateOne(
    { _id: new ObjectId(sessionId) },
    { $set: { lastAccessedAt: new Date() } }
  );

  return {
    ...learningSession,
    _id: learningSession._id.toString()
  };
}

export async function updateSessionMessages(sessionId: string, messages: ChatMessage[]) {
  const session = await getSessionFromHeaders(headers());
  
  if (!session) return { error: 'Unauthorized' };

  const { database } = await connectToDatabase();
  const { ObjectId } = await import('mongodb');
  
  await database.collection('learningSessions').updateOne(
    { _id: new ObjectId(sessionId), userId: session.userId },
    { 
      $set: { 
        messages,
        updatedAt: new Date(),
        lastAccessedAt: new Date()
      }
    }
  );

  return { success: true };
}
```

#### 3. Create Multiple Choice Component
Create `src/components/flashcards/multiple-choice-card.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MultipleChoiceCardProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  onAnswer?: (correct: boolean) => void;
}

export function MultipleChoiceCard({ 
  question, 
  options, 
  correctAnswer, 
  explanation,
  onAnswer 
}: MultipleChoiceCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    
    setSelectedOption(option);
    setShowResult(true);
    
    const isCorrect = option === correctAnswer;
    onAnswer?.(isCorrect);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <h3 className="text-lg font-semibold">Multiple Choice</h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg mb-4">{question}</p>
        </div>
        
        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === correctAnswer;
            
            let buttonClass = '';
            if (showResult && isSelected) {
              buttonClass = isCorrect 
                ? 'bg-green-100 border-green-500 text-green-700'
                : 'bg-red-100 border-red-500 text-red-700';
            } else if (showResult && isCorrect) {
              buttonClass = 'bg-green-100 border-green-500 text-green-700';
            }

            return (
              <Button
                key={index}
                variant="outline"
                className={`w-full text-left justify-start h-auto p-3 ${buttonClass}`}
                onClick={() => handleOptionSelect(option)}
                disabled={showResult}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            );
          })}
        </div>

        {showResult && explanation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Explanation:</strong> {explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 4. Update Chat API for Multiple Card Types
Update `src/app/api/chat/route.ts`:
```typescript
export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages,
    tools: {
      generateFlashcard: tool({
        description: 'Generate a flashcard for learning',
        parameters: z.object({
          type: z.enum(['basic', 'multiple-choice']),
          question: z.string(),
          answer: z.string(),
          options: z.array(z.string()).optional(),
          explanation: z.string().optional(),
        }),
      }),
    },
    system: `You are an AI tutor. Create flashcards using the generateFlashcard tool.
    
- For basic cards: use type "basic" with question and answer
- For multiple choice: use type "multiple-choice" with question, correct answer, and 4 options array
- Always include helpful explanations
- Vary the card types to keep learning engaging`,
  });

  return result.toDataStreamResponse();
}
```

#### 5. Create Session List Page
Update `src/app/tutor/page.tsx`:
```typescript
import { getUserLearningSessions } from '@/lib/actions';
import { SessionList } from './session-list';
import { CreateSessionForm } from './create-session-form';
import { getServerSession } from '@/lib/auth-server';

export default async function TutorPage() {
  const session = await getServerSession();
  const sessions = await getUserLearningSessions();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Tutor</h1>
        <p className="text-gray-600">Create learning sessions and study with AI-generated flashcards</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SessionList sessions={sessions} />
        </div>
        <div>
          <CreateSessionForm />
        </div>
      </div>
    </div>
  );
}
```

#### 6. Create Session Components
Create `src/app/tutor/session-list.tsx`, `create-session-form.tsx`, and individual session page.

### Phase 2 Testing
1. Create a new learning session
2. Chat with AI and generate both basic and multiple choice cards
3. Leave and return to session - verify chat history persists
4. Create multiple sessions and switch between them

**Success criteria**: Users can create persistent learning sessions with mixed flashcard types.

---

# 🎯 PHASE 3: ADVANCED FEATURES (2-4 hours)

## Goal: Sophisticated Adaptive Learning & Analytics

Phase 3 transforms the MVP into a comprehensive adaptive learning platform with scoring, difficulty progression, and detailed analytics.

### Phase 3 Features
- 🧠 **Adaptive Difficulty**: AI adjusts question difficulty based on performance
- 📊 **Comprehensive Scoring**: Points, streaks, accuracy tracking
- 💡 **Hint System**: Progressive hints with penalty scoring
- 📈 **Learning Analytics**: Performance insights and progress visualization
- 🎯 **Mastery Tracking**: Topic-based progress and skill levels
- 🔄 **Follow-up Learning**: Encourage deeper exploration

### Key Advanced Components

This phase implements all the sophisticated features from the original CLAUDE.md:
- Enhanced flashcard components with timing and hints
- Comprehensive scoring system with multiple factors
- Adaptive difficulty progression algorithms
- Rich analytics dashboard
- Advanced session metrics
- Performance prediction and recommendations

### Implementation Priority
1. **Week 1**: Scoring system, adaptive difficulty, enhanced flashcards
2. **Week 2**: Analytics dashboard, mastery tracking, performance insights

### Detailed Implementation
Refer to the comprehensive implementation details in the sections below for:
- Enhanced flashcard components with scoring
- Adaptive AI system with difficulty progression  
- Complete analytics dashboard
- Advanced session management
- Performance tracking and insights

---

# QUICK START GUIDE

## Ready to Begin? Start with Phase 1!

Your repository is already well-prepared with the necessary dependencies. Here's how to get started:

### 🚀 Phase 1 Quick Start (2-4 hours)
1. Add `ANTHROPIC_API_KEY` to your `.env.local`
2. Update `src/lib/env.ts` to validate the new key
3. Follow the 8 implementation steps above
4. Test: Create flashcards through chat interface

### 📈 Phase 2 Next Steps (2-4 hours)  
1. Implement learning session persistence
2. Add multiple flashcard types
3. Create session management UI
4. Test: Create and resume learning sessions

### 🎯 Phase 3 Advanced (2-4 hours)
1. Implement comprehensive scoring system
2. Add adaptive difficulty and hints
3. Build analytics dashboard
4. Add mastery tracking and performance insights

## Current Repository Assets ✅

You already have:
- ✅ Next.js 15 with App Router setup
- ✅ Better Auth authentication system
- ✅ MongoDB integration configured  
- ✅ AI SDK and Anthropic dependencies
- ✅ shadcn/ui components library
- ✅ AI Elements for chat interface
- ✅ Working todo app structure to transform

## Next Step: Start Phase 1!

Begin with the environment setup and basic AI chat implementation. The progressive approach ensures you can have a working demo quickly, then enhance it incrementally.

---

# ORIGINAL IMPLEMENTATION REFERENCE

The sections below contain the complete implementation details for Phase 3 advanced features:

```ts
export const model = anthropic('claude-3-5-sonnet-20241022');

export const FlashcardSchema = z.object({
  type: z.enum(['basic', 'multiple-choice', 'fill-blank']),
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(5),
  explanation: z.string().optional(),
  tags: z.array(z.string())
});

export const FlashcardSetSchema = z.object({
  title: z.string(),
  subject: z.string(),
  description: z.string(),
  flashcards: z.array(FlashcardSchema),
  difficulty: z.number().min(1).max(5)
});
```

### 5. Add session and flashcard types to lib/types.ts
```typescript
// Add to existing types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: any[];
  timestamp: Date;
}

export interface QuestionAttempt {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  difficulty: number;
  hintsUsed: number;
  timeSpent: number; // in seconds
  timestamp: Date;
  followUpQuestions: number; // count of follow-up questions asked
}

export interface Flashcard {
  id: string;
  type: 'basic' | 'multiple-choice' | 'fill-blank';
  question: string;
  answer: string;
  options?: string[];
  difficulty: number;
  explanation?: string;
  tags: string[];
  hints?: string[]; // progressive hints
}

export interface TopicProgress {
  topic: string;
  currentDifficulty: number;
  questionsAttempted: number;
  questionsCorrect: number;
  averageAccuracy: number;
  recentPerformance: boolean[]; // last 10 attempts
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface LearningMetrics {
  totalScore: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  averageDifficulty: number;
  hintsUsedTotal: number;
  followUpEngagement: number; // percentage of times user asks follow-ups
  timeStudied: number; // total time in minutes
  questionsAnswered: number;
  topicsStudied: string[];
}

export interface LearningSession {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  userId: string; // Better Auth user ID
  messages: ChatMessage[];
  flashcards: Flashcard[];
  questionHistory: QuestionAttempt[];
  topicProgress: TopicProgress[];
  metrics: LearningMetrics;
  currentDifficulty: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
}

export interface FlashcardSet {
  _id: string;
  title: string;
  subject: string;
  description: string;
  flashcards: Flashcard[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
}

// Scoring system constants
export const SCORING_CONFIG = {
  BASE_POINTS: {
    1: 10,   // Beginner
    2: 20,   // Easy  
    3: 35,   // Medium
    4: 55,   // Hard
    5: 80    // Expert
  },
  STREAK_MULTIPLIER: 0.1, // 10% bonus per consecutive correct
  HINT_PENALTY: 0.2, // 20% reduction per hint used
  FOLLOW_UP_BONUS: 5, // 5 points for asking follow-up questions
  TIME_BONUS_THRESHOLD: 30, // seconds - faster answers get bonus
  TIME_BONUS_POINTS: 5,
  MASTERY_THRESHOLDS: {
    beginner: 0.5,      // 50% accuracy
    intermediate: 0.7,   // 70% accuracy  
    advanced: 0.85,     // 85% accuracy
    expert: 0.95        // 95% accuracy
  }
};
```

### 6. Create learning session Zod schemas (lib/schemas.ts)
```typescript
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  toolInvocations: z.array(z.any()).optional(),
  timestamp: z.date().default(() => new Date())
});

export const QuestionAttemptSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
  difficulty: z.number().min(1).max(5),
  hintsUsed: z.number().default(0),
  timeSpent: z.number().default(0), // seconds
  timestamp: z.date().default(() => new Date()),
  followUpQuestions: z.number().default(0)
});

export const TopicProgressSchema = z.object({
  topic: z.string(),
  currentDifficulty: z.number().min(1).max(5).default(1),
  questionsAttempted: z.number().default(0),
  questionsCorrect: z.number().default(0),
  averageAccuracy: z.number().default(0),
  recentPerformance: z.array(z.boolean()).default([]), // last 10 attempts
  masteryLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner')
});

export const LearningMetricsSchema = z.object({
  totalScore: z.number().default(0),
  accuracy: z.number().default(0),
  currentStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  averageDifficulty: z.number().default(1),
  hintsUsedTotal: z.number().default(0),
  followUpEngagement: z.number().default(0),
  timeStudied: z.number().default(0), // minutes
  questionsAnswered: z.number().default(0),
  topicsStudied: z.array(z.string()).default([])
});

export const FlashcardSchema = z.object({
  id: z.string(),
  type: z.enum(['basic', 'multiple-choice', 'fill-blank']),
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(5).default(1),
  explanation: z.string().optional(),
  tags: z.array(z.string()).default([]),
  hints: z.array(z.string()).default([]) // progressive hints from easy to harder
});

export const LearningSessionSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId as string
  title: z.string(),
  subject: z.string(),
  description: z.string().optional(),
  userId: z.string(), // Better Auth user ID
  messages: z.array(ChatMessageSchema).default([]),
  flashcards: z.array(FlashcardSchema).default([]),
  questionHistory: z.array(QuestionAttemptSchema).default([]),
  topicProgress: z.array(TopicProgressSchema).default([]),
  metrics: LearningMetricsSchema.default({}),
  currentDifficulty: z.number().min(1).max(5).default(1),
  status: z.enum(['active', 'completed', 'paused']).default('active'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  lastAccessedAt: z.date().default(() => new Date())
});

export type LearningSession = z.infer<typeof LearningSessionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type QuestionAttempt = z.infer<typeof QuestionAttemptSchema>;
export type TopicProgress = z.infer<typeof TopicProgressSchema>;
export type LearningMetrics = z.infer<typeof LearningMetricsSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
```

### 7. Add flashcard set schemas to lib/schemas.ts
```typescript
// Add to existing lib/schemas.ts file

export const FlashcardSetSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId as string
  title: z.string(),
  subject: z.string(),
  description: z.string().optional(),
  flashcards: z.array(FlashcardSchema).default([]),
  createdBy: z.string(), // Better Auth user ID
  isPublic: z.boolean().default(false),
  createdAt: z.date().default(() => new Date())
});

export type FlashcardSet = z.infer<typeof FlashcardSetSchema>;
```

### 8. Modify lib/actions.ts (replace todo actions)
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/auth-server';
import { connectToDatabase } from '@/lib/mongodb';
import { FlashcardSetSchema, LearningSessionSchema } from '@/lib/schemas';
import { z } from 'zod';

// Replace todo-related actions with flashcard actions
const CreateSetSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().optional(),
  flashcards: z.array(z.object({
    type: z.enum(['basic', 'multiple-choice', 'fill-blank']),
    question: z.string(),
    answer: z.string(),
    options: z.array(z.string()).optional(),
    difficulty: z.number().min(1).max(5),
  }))
});

export async function createFlashcardSet(formData: FormData) {
  const session = await getSessionFromHeaders(headers());
  
  if (!session) {
    redirect('/auth/login');
  }

  const validatedFields = CreateSetSchema.safeParse({
    title: formData.get('title'),
    subject: formData.get('subject'),
    description: formData.get('description'),
    flashcards: JSON.parse(formData.get('flashcards') as string)
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { database } = await connectToDatabase();

  try {
    // Validate with Zod schema before inserting
    const flashcardSet = FlashcardSetSchema.parse({
      ...validatedFields.data,
      createdBy: session.userId,
      isPublic: false,
      createdAt: new Date()
    });

    const result = await database.collection('flashcardSets').insertOne(flashcardSet);
    
    revalidatePath('/dashboard');
    return { success: true, setId: result.insertedId.toString() };
  } catch (error) {
    return { error: 'Failed to create flashcard set' };
  }
}

export async function getUserFlashcardSets() {
  const session = await getSessionFromHeaders(headers());
  
  if (!session) {
    return [];
  }

  const { database } = await connectToDatabase();
  
  const sets = await database
    .collection('flashcardSets')
    .find({ createdBy: session.userId })
    .sort({ createdAt: -1 })
    .toArray();

  // Validate and transform MongoDB documents to match our Zod schema
  return sets.map(set => ({
    ...set,
    _id: set._id.toString()
  }));
}

export async function deleteFlashcardSet(setId: string) {
  const session = await getSessionFromHeaders(headers());
  
  if (!session) {
    redirect('/auth/login');
  }

  const { database } = await connectToDatabase();

  try {
    const { ObjectId } = await import('mongodb');
    await database.collection('flashcardSets').deleteOne({
      _id: new ObjectId(setId),
      createdBy: session.userId
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete set' };
  }
}
```

### 14. Update session management with scoring

**Enhanced session card component** (`components/sessions/session-card.tsx`):
```typescript
'use client';

import { LearningSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { deleteLearningSession } from '@/lib/actions';
import Link from 'next/link';
import { 
  Trash2, 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  Zap,
  Brain 
} from 'lucide-react';

interface SessionCardProps {
  session: LearningSession;
}

// Native JavaScript relative time utility (no dependencies needed)
function getRelativeTime(date: string | Date) {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return `${days} day${days === 1 ? '' : 's'}`;
}

export function SessionCard({ session }: SessionCardProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this learning session? All progress will be lost.')) {
      await deleteLearningSession(session._id);
    }
  };

  const getMasteryColor = (level: string) => {
    const colors = {
      beginner: 'bg-gray-100 text-gray-800',
      intermediate: 'bg-blue-100 text-blue-800', 
      advanced: 'bg-green-100 text-green-800',
      expert: 'bg-purple-100 text-purple-800'
    };
    return colors[level] || colors.beginner;
  };

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors[1];
  };

  const primaryTopic = session.topicProgress?.[0];
  const hasProgress = session.metrics?.questionsAnswered > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{session.title}</CardTitle>
              <Badge className={getDifficultyColor(session.currentDifficulty)}>
                L{session.currentDifficulty}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{session.subject}</p>
            {primaryTopic && (
              <Badge className={getMasteryColor(primaryTopic.masteryLevel)} variant="outline">
                {primaryTopic.topic}: {primaryTopic.masteryLevel}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {session.description && (
          <p className="text-sm text-gray-700 line-clamp-2">{session.description}</p>
        )}
        
        {/* Progress Metrics */}
        {hasProgress && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>{session.metrics.totalScore.toLocaleString()} pts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-500" />
              <span>{Math.round(session.metrics.accuracy * 100)}% acc</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>{session.metrics.currentStreak} streak</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>{session.metrics.questionsAnswered} questions</span>
            </div>
          </div>
        )}

        {/* Overall Progress Bar */}
        {hasProgress && primaryTopic && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mastery Progress</span>
              <span>{Math.round(primaryTopic.averageAccuracy * 100)}%</span>
            </div>
            <Progress value={primaryTopic.averageAccuracy * 100} className="h-2" />
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{session.flashcards?.length || 0} cards</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{getRelativeTime(session.lastAccessedAt)} ago</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/tutor/${session._id}`} className="flex-1">
            <Button className="w-full">
              {hasProgress ? 'Continue Learning' : 'Start Session'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Updated individual session page** (`app/tutor/[sessionId]/page.tsx`):
```typescript
import { getLearningSession } from '@/lib/actions';
import { AITutorChat } from '@/components/chat/ai-tutor-chat';
import { Badge } from '@/components/ui/badge';

interface SessionPageProps {
  params: {
    sessionId: string;
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const session = await getLearningSession(params.sessionId);

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800', 
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors[1];
  };

  const getDifficultyLabel = (level: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Medium',
      4: 'Hard', 
      5: 'Expert'
    };
    return labels[level] || 'Unknown';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <Badge className={getDifficultyColor(session.currentDifficulty)}>
            {getDifficultyLabel(session.currentDifficulty)}
          </Badge>
        </div>
        <p className="text-gray-600">{session.subject}</p>
        {session.description && (
          <p className="text-sm text-gray-500 mt-2">{session.description}</p>
        )}
        
        {/* Quick Stats */}
        {session.metrics?.questionsAnswered > 0 && (
          <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
            <span>Score: {session.metrics.totalScore.toLocaleString()}</span>
            <span>Accuracy: {Math.round(session.metrics.accuracy * 100)}%</span>
            <span>Questions: {session.metrics.questionsAnswered}</span>
            <span>Streak: {session.metrics.currentStreak}</span>
          </div>
        )}
      </div>
      
      <AITutorChat 
        sessionId={params.sessionId}
        initialMessages={session.messages || []}
        initialFlashcards={session.flashcards || []}
        questionHistory={session.questionHistory || []}
        topicProgress={session.topicProgress || []}
        metrics={session.metrics || {
          totalScore: 0,
          accuracy: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageDifficulty: 1,
          hintsUsedTotal: 0,
          followUpEngagement: 0,
          timeStudied: 0,
          questionsAnswered: 0,
          topicsStudied: []
        }}
        currentDifficulty={session.currentDifficulty || 1}
      />
    </div>
  );
}
```

**Create session form** (`components/sessions/create-session-form.tsx`):
```typescript
'use client';

import { useFormStatus } from 'react-dom';
import { createLearningSession } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Creating Session...' : 'Start Learning Session'}
    </Button>
  );
}

export function CreateSessionForm() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await createLearningSession(formData);
    
    if (result.success) {
      router.push(`/tutor/${result.sessionId}`);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Session Title</Label>
        <Input 
          id="title"
          name="title" 
          placeholder="e.g., JavaScript Fundamentals" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input 
          id="subject"
          name="subject" 
          placeholder="e.g., Programming, Math, Science" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea 
          id="description"
          name="description" 
          placeholder="What specific topics do you want to focus on?" 
          rows={3}
        />
      </div>
      
      <SubmitButton />
    </form>
  );
}
```

**Session list component** (`components/sessions/session-list.tsx`):
```typescript
import { LearningSession } from '@/lib/types';
import { SessionCard } from './session-card';

interface SessionListProps {
  sessions: LearningSession[];
}

export function SessionList({ sessions }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No learning sessions yet</h3>
        <p className="text-gray-500">Start your first learning session to begin studying with AI!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard key={session._id} session={session} />
      ))}
    </div>
  );
}
```

**Session card component** (`components/sessions/session-card.tsx`):
```typescript
'use client';

import { LearningSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteLearningSession } from '@/lib/actions';
import Link from 'next/link';
import { Trash2, BookOpen, Clock } from 'lucide-react';

interface SessionCardProps {
  session: LearningSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this learning session?')) {
      await deleteLearningSession(session._id);
    }
  };

  const progressPercentage = session.flashcards.length > 0 
    ? Math.round((session.progress.filter(p => p.mastered).length / session.flashcards.length) * 100)
    : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <p className="text-sm text-gray-600">{session.subject}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {session.description && (
          <p className="text-sm text-gray-700 line-clamp-2">{session.description}</p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{session.flashcards.length} cards</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{getRelativeTime(session.lastAccessedAt)} ago</span>
          </div>
        </div>

        {session.flashcards.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Link href={`/tutor/${session._id}`} className="flex-1">
            <Button className="w-full">
              {session.flashcards.length > 0 ? 'Continue Session' : 'Start Session'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 12. Create enhanced flashcard components with scoring

**Enhanced basic flashcard component** (`components/flashcards/basic-flashcard.tsx`):
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Clock, Lightbulb } from 'lucide-react';

interface BasicFlashcardProps {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty: number;
  hints?: string[];
  topic: string;
  onAnswer: (data: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    difficulty: number;
    hintsUsed: number;
    timeSpent: number;
    topic: string;
  }) => void;
  onHintRequest?: (questionId: string, hintLevel: number) => void;
  onFollowUpQuestion?: (questionId: string, question: string) => void;
}

export function BasicFlashcard({ 
  id,
  question, 
  answer, 
  explanation, 
  difficulty,
  hints = [],
  topic,
  onAnswer,
  onHintRequest,
  onFollowUpQuestion
}: BasicFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [showFollowUp, setShowFollowUp] = useState(false);

  const handleAnswer = (correct: boolean) => {
    if (answered) return;
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    setAnswered(true);
    setShowFollowUp(true);
    
    onAnswer({
      questionId: id,
      question,
      userAnswer: correct ? answer : 'incorrect',
      correctAnswer: answer,
      isCorrect: correct,
      difficulty,
      hintsUsed,
      timeSpent,
      topic
    });
  };

  const handleHintRequest = () => {
    if (hintsUsed < hints.length && hintsUsed < 3) {
      const newHintsUsed = hintsUsed + 1;
      setHintsUsed(newHintsUsed);
      if (onHintRequest) {
        onHintRequest(id, newHintsUsed);
      }
    }
  };

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors[1];
  };

  const getDifficultyLabel = (level: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Medium', 
      4: 'Hard',
      5: 'Expert'
    };
    return labels[level] || 'Unknown';
  };

  return (
    <Card className="w-full max-w-md mx-auto min-h-[350px]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <Badge className={getDifficultyColor(difficulty)}>
            {getDifficultyLabel(difficulty)}
          </Badge>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{Math.round((Date.now() - startTime) / 1000)}s</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-center">
          {!isFlipped ? 'Question' : 'Answer'}
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="min-h-[120px] flex items-center justify-center text-center">
          {!isFlipped ? (
            <p className="text-lg">{question}</p>
          ) : (
            <div className="space-y-3">
              <p className="text-lg font-medium text-green-600">{answer}</p>
              {explanation && (
                <p className="text-sm text-gray-600 italic">{explanation}</p>
              )}
            </div>
          )}
        </div>

        {/* Show hints if any were used */}
        {hintsUsed > 0 && !isFlipped && (
          <div className="space-y-2">
            {hints.slice(0, hintsUsed).map((hint, index) => (
              <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                <div className="flex items-center space-x-1">
                  <Lightbulb className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">Hint {index + 1}:</span>
                </div>
                <p className="text-blue-700">{hint}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          {!isFlipped ? (
            <>
              <Button 
                onClick={() => setIsFlipped(true)} 
                className="flex-1"
              >
                Show Answer
              </Button>
              {hints.length > 0 && hintsUsed < hints.length && hintsUsed < 3 && (
                <Button 
                  onClick={handleHintRequest}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : !answered ? (
            <>
              <Button 
                onClick={() => handleAnswer(false)} 
                variant="outline" 
                className="flex-1"
              >
                Need Practice
              </Button>
              <Button 
                onClick={() => handleAnswer(true)} 
                className="flex-1"
              >
                Got It!
              </Button>
            </>
          ) : (
            <div className="w-full space-y-2">
              {showFollowUp && (
                <Button 
                  onClick={() => {
                    if (onFollowUpQuestion) {
                      onFollowUpQuestion(id, `Can you explain more about: ${answer}`);
                    }
                  }}
                  variant="outline" 
                  className="w-full"
                  size="sm"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Ask Follow-up Question
                </Button>
              )}
              <Button 
                onClick={() => {
                  setIsFlipped(false);
                  setAnswered(false);
                  setShowFollowUp(false);
                }} 
                variant="outline" 
                className="w-full"
              >
                Try Another Card
              </Button>
            </div>
          )}
        </div>

        {/* Score preview */}
        {answered && (
          <div className="text-center text-sm text-gray-600">
            <p>Hints used: {hintsUsed} | Time: {Math.round((Date.now() - startTime) / 1000)}s</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Progress and scoring display** (`components/sessions/session-metrics.tsx`):
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap, Clock } from 'lucide-react';
import { LearningMetrics, TopicProgress } from '@/lib/types';

interface SessionMetricsProps {
  metrics: LearningMetrics;
  topicProgress: TopicProgress[];
  currentStreak: number;
}

export function SessionMetrics({ metrics, topicProgress, currentStreak }: SessionMetricsProps) {
  const getMasteryColor = (level: string) => {
    const colors = {
      beginner: 'bg-gray-100 text-gray-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-green-100 text-green-800',
      expert: 'bg-purple-100 text-purple-800'
    };
    return colors[level] || colors.beginner;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
            Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalScore.toLocaleString()}</div>
          <p className="text-xs text-gray-500">
            {metrics.questionsAnswered} questions answered
          </p>
        </CardContent>
      </Card>

      {/* Accuracy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-2 text-green-500" />
            Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(metrics.accuracy * 100)}%</div>
          <Progress value={metrics.accuracy * 100} className="h-2 mt-2" />
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Zap className="h-4 w-4 mr-2 text-orange-500" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStreak}</div>
          <p className="text-xs text-gray-500">
            Best: {metrics.longestStreak}
          </p>
        </CardContent>
      </Card>

      {/* Study Time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            Study Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(metrics.timeStudied)}m</div>
          <p className="text-xs text-gray-500">
            Avg difficulty: {metrics.averageDifficulty.toFixed(1)}
          </p>
        </CardContent>
      </Card>

      {/* Topic Progress */}
      {topicProgress.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Topic Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topicProgress.map((topic) => (
                <div key={topic.topic} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{topic.topic}</span>
                    <Badge className={getMasteryColor(topic.masteryLevel)}>
                      {topic.masteryLevel}
                    </Badge>
                  </div>
                  <Progress 
                    value={topic.averageAccuracy * 100} 
                    className="h-2" 
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{topic.questionsCorrect}/{topic.questionsAttempted} correct</span>
                    <span>Level {topic.currentDifficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Basic flashcard component** (`components/flashcards/basic-flashcard.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BasicFlashcardProps {
  question: string;
  answer: string;
  explanation?: string;
  onAnswer: (correct: boolean) => void;
}

export function BasicFlashcard({ question, answer, explanation, onAnswer }: BasicFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (correct: boolean) => {
    setAnswered(true);
    onAnswer(correct);
  };

  return (
    <Card className="w-full max-w-md mx-auto min-h-[300px]">
      <CardHeader className="text-center">
        <h3 className="text-lg font-semibold">
          {!isFlipped ? 'Question' : 'Answer'}
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="min-h-[120px] flex items-center justify-center text-center">
          {!isFlipped ? (
            <p className="text-lg">{question}</p>
          ) : (
            <div className="space-y-3">
              <p className="text-lg font-medium text-green-600">{answer}</p>
              {explanation && (
                <p className="text-sm text-gray-600 italic">{explanation}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {!isFlipped ? (
            <Button 
              onClick={() => setIsFlipped(true)} 
              className="w-full"
            >
              Show Answer
            </Button>
          ) : !answered ? (
            <>
              <Button 
                onClick={() => handleAnswer(false)} 
                variant="outline" 
                className="flex-1"
              >
                Need Practice
              </Button>
              <Button 
                onClick={() => handleAnswer(true)} 
                className="flex-1"
              >
                Got It!
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => {
                setIsFlipped(false);
                setAnswered(false);
              }} 
              variant="outline" 
              className="w-full"
            >
              Reset Card
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Multiple choice card component** (`components/flashcards/multiple-choice-card.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MultipleChoiceCardProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  onAnswer: (correct: boolean) => void;
}

export function MultipleChoiceCard({ 
  question, 
  options, 
  correctAnswer, 
  explanation, 
  onAnswer 
}: MultipleChoiceCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    
    setSelectedOption(option);
    setShowResult(true);
    
    const isCorrect = option === correctAnswer;
    onAnswer(isCorrect);
  };

  const reset = () => {
    setSelectedOption(null);
    setShowResult(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <h3 className="text-lg font-semibold">Multiple Choice</h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg mb-4">{question}</p>
        </div>
        
        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === correctAnswer;
            
            let buttonVariant = 'outline';
            let buttonClass = '';
            
            if (showResult && isSelected) {
              if (isCorrect) {
                buttonClass = 'bg-green-100 border-green-500 text-green-700';
              } else {
                buttonClass = 'bg-red-100 border-red-500 text-red-700';
              }
            } else if (showResult && isCorrect) {
              buttonClass = 'bg-green-100 border-green-500 text-green-700';
            }

            return (
              <Button
                key={index}
                variant={buttonVariant as any}
                className={`w-full text-left justify-start h-auto p-3 ${buttonClass}`}
                onClick={() => handleOptionSelect(option)}
                disabled={showResult}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            );
          })}
        </div>

        {showResult && explanation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Explanation:</strong> {explanation}
            </p>
          </div>
        )}

        {showResult && (
          <Button 
            onClick={reset} 
            variant="outline" 
            className="w-full mt-4"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

### 15. Complete multiple choice component with scoring

**Enhanced multiple choice card component** (`components/flashcards/multiple-choice-card.tsx`):
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Clock, Lightbulb } from 'lucide-react';

interface MultipleChoiceCardProps {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: number;
  hints?: string[];
  topic: string;
  onAnswer: (data: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    difficulty: number;
    hintsUsed: number;
    timeSpent: number;
    topic: string;
  }) => void;
  onHintRequest?: (questionId: string, hintLevel: number) => void;
  onFollowUpQuestion?: (questionId: string, question: string) => void;
}

export function MultipleChoiceCard({ 
  id,
  question, 
  options, 
  correctAnswer, 
  explanation,
  difficulty,
  hints = [],
  topic,
  onAnswer,
  onHintRequest,
  onFollowUpQuestion
}: MultipleChoiceCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [showFollowUp, setShowFollowUp] = useState(false);

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const isCorrect = option === correctAnswer;
    
    setSelectedOption(option);
    setShowResult(true);
    setShowFollowUp(true);
    
    onAnswer({
      questionId: id,
      question,
      userAnswer: option,
      correctAnswer,
      isCorrect,
      difficulty,
      hintsUsed,
      timeSpent,
      topic
    });
  };

  const handleHintRequest = () => {
    if (hintsUsed < hints.length && hintsUsed < 3) {
      const newHintsUsed = hintsUsed + 1;
      setHintsUsed(newHintsUsed);
      if (onHintRequest) {
        onHintRequest(id, newHintsUsed);
      }
    }
  };

  const reset = () => {
    setSelectedOption(null);
    setShowResult(false);
    setShowFollowUp(false);
  };

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors[1];
  };

  const getDifficultyLabel = (level: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Medium',
      4: 'Hard',
      5: 'Expert'
    };
    return labels[level] || 'Unknown';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <Badge className={getDifficultyColor(difficulty)}>
            {getDifficultyLabel(difficulty)}
          </Badge>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{Math.round((Date.now() - startTime) / 1000)}s</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-center">Multiple Choice</h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg mb-4">{question}</p>
        </div>

        {/* Show hints if any were used */}
        {hintsUsed > 0 && !showResult && (
          <div className="space-y-2 mb-4">
            {hints.slice(0, hintsUsed).map((hint, index) => (
              <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                <div className="flex items-center space-x-1">
                  <Lightbulb className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">Hint {index + 1}:</span>
                </div>
                <p className="text-blue-700">{hint}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === correctAnswer;
            
            let buttonClass = '';
            
            if (showResult && isSelected) {
              if (isCorrect) {
                buttonClass = 'bg-green-100 border-green-500 text-green-700';
              } else {
                buttonClass = 'bg-red-100 border-red-500 text-red-700';
              }
            } else if (showResult && isCorrect) {
              buttonClass = 'bg-green-100 border-green-500 text-green-700';
            }

            return (
              <Button
                key={index}
                variant="outline"
                className={`w-full text-left justify-start h-auto p-3 ${buttonClass}`}
                onClick={() => handleOptionSelect(option)}
                disabled={showResult}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            );
          })}
        </div>

        {/* Hint request button */}
        {!showResult && hints.length > 0 && hintsUsed < hints.length && hintsUsed < 3 && (
          <Button 
            onClick={handleHintRequest}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Need a hint?
          </Button>
        )}

        {showResult && explanation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Explanation:</strong> {explanation}
            </p>
          </div>
        )}

        {showResult && (
          <div className="space-y-2">
            {showFollowUp && (
              <Button 
                onClick={() => {
                  if (onFollowUpQuestion) {
                    onFollowUpQuestion(id, `Can you explain more about: ${correctAnswer}`);
                  }
                }}
                variant="outline" 
                className="w-full"
                size="sm"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Ask Follow-up Question
              </Button>
            )}
            <Button 
              onClick={reset} 
              variant="outline" 
              className="w-full"
            >
              Try Another Card
            </Button>
          </div>
        )}

        {/* Score preview */}
        {showResult && (
          <div className="text-center text-sm text-gray-600">
            <p>
              {selectedOption === correctAnswer ? '✅ Correct!' : '❌ Incorrect'} | 
              Hints used: {hintsUsed} | 
              Time: {Math.round((Date.now() - startTime) / 1000)}s
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 16. Create dashboard with user analytics

**Enhanced dashboard page** (`app/dashboard/page.tsx`):
```typescript
import { getUserLearningAnalytics, getUserLearningSessions } from '@/lib/actions';
import { SessionList } from '@/components/sessions/session-list';
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const [analytics, sessions] = await Promise.all([
    getUserLearningAnalytics(),
    getUserLearningSessions()
  ]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Learning Dashboard</h1>
        <Link href="/tutor/new">
          <Button>Start New Session</Button>
        </Link>
      </div>
      
      {analytics && (
        <div className="mb-8">
          <AnalyticsDashboard analytics={analytics} />
        </div>
      )}
      
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Your Learning Sessions</h2>
        <SessionList sessions={sessions} />
      </div>
    </div>
  );
}
```

**Analytics dashboard component** (`components/dashboard/analytics-dashboard.tsx`):
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Award
} from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: {
    totalSessions: number;
    totalScore: number;
    totalQuestions: number;
    totalTimeStudied: number;
    overallAccuracy: number;
    topicsStudied: number;
    activeSessions: number;
    completedSessions: number;
  };
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    return `${Math.round(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  };

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 0.9) return { level: 'Expert', color: 'text-purple-600' };
    if (accuracy >= 0.8) return { level: 'Advanced', color: 'text-green-600' };
    if (accuracy >= 0.7) return { level: 'Intermediate', color: 'text-blue-600' };
    return { level: 'Beginner', color: 'text-gray-600' };
  };

  const performance = getPerformanceLevel(analytics.overallAccuracy);

  return (
    <div className="space-y-6">
      {/* Overall Performance Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-purple-600" />
            <span>Overall Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.totalScore.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${performance.color}`}>
                {Math.round(analytics.overallAccuracy * 100)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {performance.level}
              </div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={analytics.overallAccuracy * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Study Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(analytics.totalTimeStudied)}
            </div>
            <p className="text-xs text-gray-500">
              Total learning time
            </p>
          </CardContent>
        </Card>

        {/* Topics Studied */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-green-500" />
              Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topicsStudied}</div>
            <p className="text-xs text-gray-500">
              Subjects covered
            </p>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeSessions}</div>
            <p className="text-xs text-gray-500">
              Ongoing sessions
            </p>
          </CardContent>
        </Card>

        {/* Completed Sessions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedSessions}</div>
            <p className="text-xs text-gray-500">
              Finished sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Questions per session</span>
              <span className="font-medium">
                {analytics.totalSessions > 0 
                  ? Math.round(analytics.totalQuestions / analytics.totalSessions)
                  : 0
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Average study time per session</span>
              <span className="font-medium">
                {analytics.totalSessions > 0 
                  ? formatTime(analytics.totalTimeStudied / analytics.totalSessions)
                  : '0m'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Learning consistency</span>
              <span className="font-medium">
                {analytics.activeSessions > 0 ? 'Regular' : 'Start a new session!'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Update landing page** (`app/page.tsx`):
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI-Powered Learning Tutor
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create interactive flashcards, track your progress, and learn any subject 
          with the help of Claude AI. Start a learning session and pick up where you left off.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/tutor">
            <Button size="lg" className="px-8 py-3 text-lg">
              Start Learning
            </Button>
          </Link>
          
          <Link href="/auth/register">
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Create Account
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Generated Content</h3>
            <p className="text-gray-600">
              Get personalized flashcards and explanations for any subject
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600">
              Track your learning progress and identify areas for improvement
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Session Continuity</h3>
            <p className="text-gray-600">
              Leave and return to your learning sessions anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**AI tutor chat component** (`components/chat/ai-tutor-chat.tsx`):
```typescript
'use client';

import { useChat } from '@ai-sdk/react';
import { Message } from '@/components/ai-elements/message';
import { MessageContent } from '@/components/ai-elements/message';  
import { PromptInput } from '@/components/ai-elements/prompt-input';
import { useState, useEffect } from 'react';
import { updateLearningSessionMessages, updateLearningSessionProgress } from '@/lib/actions';
import { BasicFlashcard } from '../flashcards/basic-flashcard';
import { MultipleChoiceCard } from '../flashcards/multiple-choice-card';
import { Card, CardContent } from '@/components/ui/card';

interface AITutorChatProps {
  sessionId: string;
  initialMessages: any[];
  initialFlashcards: any[];
  progress: any[];
}

export function AITutorChat({ 
  sessionId, 
  initialMessages, 
  initialFlashcards, 
  progress 
}: AITutorChatProps) {
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    initialMessages: initialMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      toolInvocations: msg.toolInvocations || []
    })),
    body: {
      sessionId: sessionId
    },
    onFinish: async (message) => {
      // Save updated messages to database
      const updatedMessages = [...messages, message];
      await updateLearningSessionMessages(sessionId, updatedMessages);
      
      // Extract any new flashcards from tool invocations
      if (message.toolInvocations) {
        const newFlashcards = message.toolInvocations
          .filter(invocation => invocation.toolName === 'generateFlashcard')
          .map(invocation => invocation.result);
        
        if (newFlashcards.length > 0) {
          setFlashcards(prev => [...prev, ...newFlashcards]);
        }
      }
    }
  });

  const handleCardAnswer = async (cardIndex: number, correct: boolean) => {
    await updateLearningSessionProgress(sessionId, cardIndex, correct);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save user message before sending
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    await updateLearningSessionMessages(sessionId, updatedMessages);
    
    // Submit to AI
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-4xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-t-lg bg-gray-50">
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent>
              {message.content}
            </MessageContent>
          </Message>
        ))}
        
        {/* Render generated flashcards */}
        {messages.map((message) => {
          if (message.role === 'assistant' && message.toolInvocations) {
            return message.toolInvocations.map((toolInvocation, index) => {
              if (toolInvocation.toolName === 'generateFlashcard') {
                const { type, question, answer, options, explanation } = toolInvocation.result;
                const cardIndex = flashcards.findIndex(card => 
                  card.question === question && card.answer === answer
                );
                
                if (type === 'basic') {
                  return (
                    <div key={`${message.id}-${index}`} className="flex justify-center">
                      <BasicFlashcard
                        question={question}
                        answer={answer}
                        explanation={explanation}
                        onAnswer={(correct) => handleCardAnswer(cardIndex, correct)}
                      />
                    </div>
                  );
                } else if (type === 'multiple-choice') {
                  return (
                    <div key={`${message.id}-${index}`} className="flex justify-center">
                      <MultipleChoiceCard
                        question={question}
                        options={options}
                        correctAnswer={answer}
                        explanation={explanation}
                        onAnswer={(correct) => handleCardAnswer(cardIndex, correct)}
                      />
                    </div>
                  );
                }
              }
              return null;
            });
          }
          return null;
        })}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Input Form */}
      <div className="p-4 border border-t-0 rounded-b-lg bg-white">
        <PromptInput
          input={input}  
          handleInputChange={handleInputChange}
          handleSubmit={handleFormSubmit}
          isLoading={isLoading}
          placeholder="Ask for flashcards, explain a concept, or test your knowledge..."
        />
      </div>
    </div>
  );
}
```

### 11. Update AI chat API route with hints and progression

**Enhanced API route** (`app/api/chat/route.ts`):
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages,
    tools: {
      generateFlashcard: tool({
        description: 'Generate an interactive flashcard for learning with adaptive difficulty',
        parameters: z.object({
          type: z.enum(['basic', 'multiple-choice', 'fill-blank']),
          question: z.string(),
          answer: z.string(),
          options: z.array(z.string()).optional(),
          difficulty: z.number().min(1).max(5),
          explanation: z.string().optional(),
          hints: z.array(z.string()).optional(),
          topic: z.string(),
          tags: z.array(z.string()).optional(),
        }),
      }),
      
      generateFlashcardSet: tool({
        description: 'Generate a set of flashcards with progressive difficulty',
        parameters: z.object({
          topic: z.string(),
          count: z.number().min(1).max(10),
          startingDifficulty: z.number().min(1).max(5),
          cardTypes: z.array(z.enum(['basic', 'multiple-choice', 'fill-blank'])),
          includeHints: z.boolean().optional(),
        }),
      }),

      provideHint: tool({
        description: 'Provide a progressive hint for a specific question',
        parameters: z.object({
          questionId: z.string(),
          question: z.string(),
          hintLevel: z.number().min(1).max(3), // 1 = gentle, 2 = moderate, 3 = strong
          previousHints: z.array(z.string()).optional(),
        }),
      }),

      explainAnswer: tool({
        description: 'Provide detailed explanation of an answer for follow-up learning',
        parameters: z.object({
          questionId: z.string(),
          question: z.string(),
          answer: z.string(),
          userQuestion: z.string(), // What the user wants to know
          difficulty: z.number().min(1).max(5),
        }),
      }),

      adjustDifficulty: tool({
        description: 'Recommend difficulty adjustment based on performance',
        parameters: z.object({
          currentDifficulty: z.number().min(1).max(5),
          recentAccuracy: z.number().min(0).max(1),
          recommendedDifficulty: z.number().min(1).max(5),
          reason: z.string(),
        }),
      }),
    },
    
    system: `You are an AI tutor that creates adaptive, interactive learning experiences. 

CORE BEHAVIORS:
1. Generate questions that match the user's current difficulty level
2. Track and adapt to the user's learning progress
3. Provide progressive hints when requested (gentle → moderate → strong)
4. Encourage follow-up questions to deepen understanding
5. Celebrate achievements and provide constructive feedback

DIFFICULTY SCALING:
- Level 1: Basic recall and simple concepts
- Level 2: Understanding and application  
- Level 3: Analysis and connection-making
- Level 4: Synthesis and evaluation
- Level 5: Creation and expert-level application

HINT SYSTEM:
- Level 1 hints: Gentle nudges, eliminate obviously wrong options
- Level 2 hints: Point toward relevant concepts or knowledge areas
- Level 3 hints: More direct guidance while still requiring thought

ADAPTIVE BEHAVIOR:
- Monitor user performance across topics
- Increase difficulty after consistent success (80%+ accuracy)
- Decrease difficulty after struggle (40% or less accuracy)
- Adjust questioning style based on user preferences
- Provide encouraging feedback and progress updates

SESSION CONTEXT:
This is learning session ${sessionId}. The user's progress, scores, and question history persist across the session. Use their performance data to create an optimal learning experience.

Always maintain an encouraging, patient tone while challenging the user appropriately.`,
  });

  return result.toDataStreamResponse();
}
```

## Architecture decisions

### Component hierarchy priority
1. **Vercel AI Elements** - Use for chat interface, message handling, and core AI interactions (Message, MessageContent, PromptInput)
2. **shadcn/ui** - Use for standard UI components (buttons, cards, forms, etc.)
3. **Custom Tailwind** - Only when the above don't meet requirements

### AI Elements Components
- **Message/MessageContent** - For rendering chat messages with proper role-based styling
- **PromptInput** - For user input with built-in submit handling
- **Response** - For rendering assistant responses with proper formatting

### Next.js App Router patterns
- **Server Components** - Use for data fetching, static content, and initial page loads
- **Server Actions** - Use for form submissions, database mutations, and user actions
- **API Routes** - Use for AI streaming, webhooks, and external API integrations
- **Client Components** - Use for interactivity, state management, and real-time features

### When to use each pattern
- **Server Actions**: Save flashcard sets, update user progress, delete cards, authentication
- **Server Components**: Dashboard data, user stats, saved flashcard lists, profile info
- **API Routes**: AI chat streaming, Claude tool calls, webhook endpoints
- **Client Components**: Interactive flashcards, chat interface, real-time animations

### Generative UI approach
- Flash cards are generated as React components using Vercel AI SDK's generative UI
- Each flash card type has a pre-defined component template
- Claude generates the content and structure data for these templates
- UI components are streamed directly into the chat interface

## Core features

### Flash card generation
- Generate flash cards for any subject (math, science, languages, history, etc.)
- Multiple card types: basic Q&A, multiple choice, fill-in-the-blank, image-based
- Progressive difficulty levels
- Batch generation (create sets of 5, 10, or 20 cards)

### Interactive learning
- Flip cards to reveal answers
- Track correct/incorrect responses
- Progress tracking per subject
- Spaced repetition suggestions

### User management
- Authentication with better-auth
- Save card sets to user accounts
- Progress tracking and analytics
- Share card sets with others

## Project structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx (server component)
│   │   │   └── login-form.tsx (client component)
│   │   └── register/
│   │       ├── page.tsx (server component)
│   │       └── register-form.tsx (client component)
│   ├── api/
│   │   ├── auth/ (better-auth routes)
│   │   └── chat/ (AI streaming route)
│   ├── dashboard/
│   │   ├── page.tsx (server component - loads user data)
│   │   ├── saved-sets.tsx (server component - displays sets)
│   │   └── progress-stats.tsx (server component - shows analytics)
│   ├── study/
│   │   ├── page.tsx (server component - chat interface)
│   │   └── [setId]/page.tsx (server component - specific set)
│   ├── actions.ts (server actions for all mutations)
│   └── layout.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── flashcards/
│   │   ├── basic-flashcard.tsx (client - interactive)
│   │   ├── multiple-choice-card.tsx (client - interactive)
│   │   ├── fill-blank-card.tsx (client - interactive)
│   │   └── flashcard-set.tsx (client - manages state)
│   ├── chat/
│   │   └── ai-tutor-chat.tsx (client - real-time chat)
│   ├── dashboard/
│   │   ├── set-list.tsx (server - displays data)
│   │   └── create-set-form.tsx (client - uses server actions)
│   └── auth/
│       ├── login-form.tsx (client - form handling)
│       └── register-form.tsx (client - form handling)
├── lib/
│   ├── auth.ts (better-auth config)
│   ├── mongodb.ts (MongoDB connection)
│   ├── ai.ts (Vercel AI SDK setup)
│   ├── schemas.ts (Zod schemas and TypeScript types)
│   ├── queries.ts (server-side data fetching)
│   └── utils.ts
```

## Implementation steps

### 1. Environment setup
```bash
npx create-next-app@latest ai-tutor-demo --typescript --tailwind --eslint --app
cd ai-tutor-demo
npm install @vercel/ai @ai-sdk/anthropic
npm install @better-auth/mongodb better-auth
npm install mongodb zod
npx ai-elements@latest  # Interactive setup for AI Elements
npx shadcn@latest init
```

### 2. Environment variables
Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Database operations with native MongoDB driver

All data validation and type safety is handled through Zod schemas in `lib/schemas.ts`. The native MongoDB driver provides direct database operations without ORM overhead:

```typescript
// Example: Creating a learning session
const session = LearningSessionSchema.parse({
  title: "JavaScript Basics",
  subject: "Programming",
  userId: "user123",
  // ... other fields with defaults applied
});

await database.collection('learningSessions').insertOne(session);
```

### 4. Authentication setup

**Auth config** (`lib/auth.ts`):
```typescript
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongodb"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)

export const auth = betterAuth({
  database: mongodbAdapter(client),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
})
```

### 5. Server actions setup

**Server actions** (`app/actions.ts`):
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { FlashcardSetSchema, LearningSessionSchema } from '@/lib/schemas';
import { z } from 'zod';

const CreateSetSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().optional(),
  flashcards: z.array(z.object({
    type: z.enum(['basic', 'multiple-choice', 'fill-blank']),
    question: z.string(),
    answer: z.string(),
    options: z.array(z.string()).optional(),
    difficulty: z.number().min(1).max(5),
  }))
});

export async function createFlashcardSet(formData: FormData) {
  const session = await auth.api.getSession({
    headers: headers()
  });
  
  if (!session) {
    redirect('/login');
  }

  const validatedFields = CreateSetSchema.safeParse({
    title: formData.get('title'),
    subject: formData.get('subject'),
    description: formData.get('description'),
    flashcards: JSON.parse(formData.get('flashcards') as string)
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { database } = await connectToDatabase();

  try {
    const flashcardSet = FlashcardSetSchema.parse({
      ...validatedFields.data,
      createdBy: session.user.id,
      isPublic: false,
      createdAt: new Date()
    });

    const result = await database.collection('flashcardSets').insertOne(flashcardSet);
    
    revalidatePath('/dashboard');
    return { success: true, setId: result.insertedId.toString() };
  } catch (error) {
    return { error: 'Failed to create flashcard set' };
  }
}

export async function updateProgress(setId: string, cardIndex: number, correct: boolean) {
  const session = await auth.api.getSession({
    headers: headers()
  });
  
  if (!session) return { error: 'Unauthorized' };

  const { database } = await connectToDatabase();
  
  // Update user progress in database using native MongoDB operations
  const { ObjectId } = await import('mongodb');
  await database.collection('learningSessions').updateOne(
    { _id: new ObjectId(setId), userId: session.user.id },
    { 
      $set: { 
        updatedAt: new Date(),
        lastAccessedAt: new Date()
      }
      // Add specific progress updates here
    }
  );
  
  revalidatePath(`/study/${setId}`);
  return { success: true };
}

export async function deleteFlashcardSet(setId: string) {
  const session = await auth.api.getSession({
    headers: headers()
  });
  
  if (!session) {
    redirect('/login');
  }

  const { database } = await connectToDatabase();

  try {
    const { ObjectId } = await import('mongodb');
    await database.collection('flashcardSets').deleteOne({
      _id: new ObjectId(setId),
      createdBy: session.user.id
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete set' };
  }
}
```

### 6. Server components for data fetching

**Dashboard page** (`app/dashboard/page.tsx`):
```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserFlashcardSets } from '@/lib/queries';
import { SavedSets } from '@/components/dashboard/saved-sets';
import { ProgressStats } from '@/components/dashboard/progress-stats';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: headers()
  });

  if (!session) {
    redirect('/login');
  }

  // Fetch data in server component
  const flashcardSets = await getUserFlashcardSets(session.user.id);
  const stats = await getUserProgressStats(session.user.id);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Learning Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SavedSets sets={flashcardSets} />
        </div>
        <div>
          <ProgressStats stats={stats} />
        </div>
      </div>
    </div>
  );
}
```

**Data queries** (`lib/queries.ts`):
```typescript
import { connectToDatabase } from './mongodb';
import { FlashcardSetSchema, LearningSessionSchema } from '@/lib/schemas';
import { cache } from 'react';

// Cache queries for performance
export const getUserFlashcardSets = cache(async (userId: string) => {
  const { database } = await connectToDatabase();
  
  const sets = await database
    .collection('flashcardSets')
    .find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .toArray();

  // Transform ObjectId to string for client compatibility
  return sets.map(set => ({
    ...set,
    _id: set._id.toString()
  }));
});

export const getFlashcardSet = cache(async (setId: string) => {
  const { database } = await connectToDatabase();
  const { ObjectId } = await import('mongodb');
  
  const set = await database
    .collection('flashcardSets')
    .findOne({ _id: new ObjectId(setId) });

  if (!set) return null;

  return {
    ...set,
    _id: set._id.toString()
  };
});

export const getUserProgressStats = cache(async (userId: string) => {
  const { database } = await connectToDatabase();
  
  // Aggregate user progress data using MongoDB aggregation pipeline
  const stats = await database
    .collection('flashcardSets')
    .aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalSets: { $sum: 1 },
          totalCards: { $sum: { $size: '$flashcards' } },
          subjects: { $addToSet: '$subject' }
        }
      }
    ])
    .toArray();

  return stats[0] || { totalSets: 0, totalCards: 0, subjects: [] };
});
```

### 7. Client components with server action integration

**Create set form** (`components/dashboard/create-set-form.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createFlashcardSet } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Set'}
    </Button>
  );
}

export function CreateSetForm() {
  const [flashcards, setFlashcards] = useState([]);

  return (
    <form action={createFlashcardSet} className="space-y-4">
      <Input 
        name="title" 
        placeholder="Set Title" 
        required 
      />
      
      <Input 
        name="subject" 
        placeholder="Subject" 
        required 
      />
      
      <Textarea 
        name="description" 
        placeholder="Description (optional)" 
      />
      
      {/* Hidden input for flashcards data */}
      <input 
        type="hidden" 
        name="flashcards" 
        value={JSON.stringify(flashcards)} 
      />
      
      <SubmitButton />
    </form>
  );
}
```

### 8. AI SDK setup

**AI configuration** (`lib/ai.ts`):
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

export const model = anthropic('claude-3-5-sonnet-20241022');

export const FlashcardSchema = z.object({
  type: z.enum(['basic', 'multiple-choice', 'fill-blank']),
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(5),
  explanation: z.string().optional(),
  tags: z.array(z.string())
});

export const FlashcardSetSchema = z.object({
  title: z.string(),
  subject: z.string(),
  description: z.string(),
  flashcards: z.array(FlashcardSchema),
  difficulty: z.number().min(1).max(5)
});
```

### 6. Flash card components

**Basic flashcard** (`components/flashcards/basic-flashcard.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BasicFlashcardProps {
  question: string;
  answer: string;
  explanation?: string;
  onAnswer: (correct: boolean) => void;
}

export function BasicFlashcard({ question, answer, explanation, onAnswer }: BasicFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (correct: boolean) => {
    setAnswered(true);
    onAnswer(correct);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="min-h-[200px] flex flex-col justify-center">
          {!isFlipped ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Question</h3>
              <p className="text-gray-700">{question}</p>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Answer</h3>
              <p className="text-gray-700 mb-4">{answer}</p>
              {explanation && (
                <p className="text-sm text-gray-500 italic">{explanation}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-6">
          {!isFlipped ? (
            <Button 
              onClick={() => setIsFlipped(true)} 
              className="w-full"
            >
              Show Answer
            </Button>
          ) : !answered ? (
            <>
              <Button 
                onClick={() => handleAnswer(false)} 
                variant="outline" 
                className="flex-1"
              >
                Need Practice
              </Button>
              <Button 
                onClick={() => handleAnswer(true)} 
                className="flex-1"
              >
                Got It!
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => {
                setIsFlipped(false);
                setAnswered(false);
              }} 
              variant="outline" 
              className="w-full"
            >
              Reset Card
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 7. Generative UI chat integration

**AI tutor chat** (`components/chat/ai-tutor-chat.tsx`):
```typescript
'use client';

import { useChat } from '@ai-sdk/react';
import { Message } from '@ai-sdk/ui-utils';
import { BasicFlashcard } from '../flashcards/basic-flashcard';
import { MultipleChoiceCard } from '../flashcards/multiple-choice-card';

export function AITutorChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [{
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI tutor. What subject would you like to study today? I can create interactive flash cards for any topic!'
    }]
  });

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Render generated UI components */}
        {messages.map((message) => {
          if (message.role === 'assistant' && message.toolInvocations) {
            return message.toolInvocations.map((toolInvocation) => {
              if (toolInvocation.toolName === 'generateFlashcard') {
                const { type, question, answer, options } = toolInvocation.result;
                
                if (type === 'basic') {
                  return (
                    <BasicFlashcard
                      key={toolInvocation.toolCallId}
                      question={question}
                      answer={answer}
                      onAnswer={(correct) => {
                        // Track progress
                        console.log('Answer recorded:', correct);
                      }}
                    />
                  );
                } else if (type === 'multiple-choice') {
                  return (
                    <MultipleChoiceCard
                      key={toolInvocation.toolCallId}
                      question={question}
                      options={options}
                      correctAnswer={answer}
                      onAnswer={(correct) => {
                        console.log('Answer recorded:', correct);
                      }}
                    />
                  );
                }
              }
              return null;
            });
          }
          return null;
        })}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask for flash cards on any topic..."
            className="flex-1 p-2 border rounded-md"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 10. Chat API route (for AI streaming)

**API route** (`app/api/chat/route.ts`):
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// API routes are used for streaming AI responses and real-time interactions
export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages,
    tools: {
      generateFlashcard: tool({
        description: 'Generate an interactive flashcard for learning',
        parameters: z.object({
          type: z.enum(['basic', 'multiple-choice', 'fill-blank']),
          question: z.string(),
          answer: z.string(),
          options: z.array(z.string()).optional(),
          difficulty: z.number().min(1).max(5),
          explanation: z.string().optional(),
        }),
      }),
      generateFlashcardSet: tool({
        description: 'Generate a set of flashcards on a topic',
        parameters: z.object({
          topic: z.string(),
          count: z.number().min(1).max(20),
          difficulty: z.number().min(1).max(5),
          cardTypes: z.array(z.enum(['basic', 'multiple-choice', 'fill-blank'])),
        }),
      }),
    },
    system: `You are an AI tutor that creates interactive flashcards for learning any subject. 

When a user asks about studying a topic or wants flashcards:
1. Use the generateFlashcard tool to create individual cards
2. Use generateFlashcardSet tool for multiple cards on a topic
3. Make questions clear and educational
4. Provide helpful explanations when appropriate
5. Vary difficulty based on the user's level

Focus on creating high-quality educational content that helps users learn effectively.`,
  });

  return result.toDataStreamResponse();
}
```

## Key implementation notes

### Session persistence architecture
- **Learning sessions** are the main entity - users create sessions to study specific topics
- **Chat history** persists across browser sessions - users can leave and return
- **Progress tracking** saves individual flashcard performance and mastery status
- **User isolation** ensures users only see their own sessions through authentication
- **Real-time updates** save progress immediately as users interact with flashcards

### Modern Next.js patterns
- **Server Actions** for database mutations (create, update, delete sessions)
- **Server Components** for initial data loading and session lists
- **API Routes** only for streaming AI responses and real-time chat
- **Client Components** for interactivity and real-time state management

### Server vs client boundaries
- Keep session management and data mutations in server actions
- Use server components to fetch and display session lists and details
- Reserve client components for chat interface and flashcard interactions
- Stream AI responses through API routes due to real-time nature

### Session state management
- **Database persistence** stores all session data, messages, and progress
- **Optimistic updates** provide immediate UI feedback before database confirmation
- **Session resumption** loads complete chat history and flashcard state
- **Progress synchronization** updates mastery status as users interact with cards

### Generative UI with persistence
- Tools return structured data that maps to React components
- Components are rendered inline with chat messages and persist across sessions
- Each flashcard maintains progress state tied to the database
- Progress tracking happens through server actions called from component callbacks

### Authentication flow
- better-auth handles user sessions
- Protected routes check authentication status in server components
- Server actions validate sessions before database operations
- User sessions and progress are completely isolated by user ID

### Database strategy
- MongoDB stores learning sessions with embedded chat history and flashcards
- Progress tracking embedded within session documents for performance
- Server-side queries use user ID filtering for security
- Session updates use atomic operations to prevent data loss

### Performance optimizations
- Server components reduce client-side JavaScript for session lists
- Session data cached during page load with Next.js built-in caching
- Server actions provide progressive enhancement for session management
- Streaming UI keeps interface responsive during AI generation
- Optimistic updates provide immediate feedback while persisting to database

### Deployment considerations
- Environment variables for API keys and database
- Vercel deployment with serverless functions
- MongoDB Atlas for managed database hosting

## Testing the demo

### Manual testing flow for adaptive learning system
1. Register/login with better-auth
2. Create a new learning session for a specific subject
3. Ask for flashcards and answer them correctly/incorrectly
4. Observe difficulty progression based on performance
5. Test hint system during difficult questions
6. Ask follow-up questions about answers to test engagement tracking
7. Check scoring system and streak mechanics
8. Navigate away and return to verify all progress persists
9. Test multiple topics within same session
10. Delete sessions and verify proper cleanup

### Scoring system testing
- Answer questions correctly to build streaks and earn points
- Use hints and verify point deductions
- Test follow-up question bonuses
- Check difficulty progression after consistent performance
- Verify mastery level updates based on accuracy
- Test time bonuses for quick responses

### Progressive difficulty testing
- Start with basic questions and build accuracy
- Verify difficulty increases after 80%+ performance
- Test difficulty decrease after poor performance (40% or less)
- Check per-topic difficulty tracking
- Verify session-wide difficulty adjustments

### Hint and engagement testing
- Request hints during questions and verify progressive disclosure
- Test follow-up questions after answers
- Verify hint usage tracking in scoring
- Check engagement metrics in session analytics
- Test conversation flow for follow-up learning

### Server action testing for advanced features
- Test question attempt recording with all metrics
- Verify hint usage tracking
- Check follow-up question recording
- Test analytics data aggregation
- Verify user isolation for all scoring data

### Example testing scenarios
**Beginner progression:**
- "I want to learn basic algebra"
- Answer first few questions correctly
- Watch difficulty increase from level 1 to 2
- Check score accumulation and streak building

**Struggling learner:**
- "Help me with calculus derivatives" 
- Answer questions incorrectly
- Use hints frequently
- Verify difficulty decreases and hint penalties apply

**Engaged learner:**
- Answer questions correctly
- Ask follow-up questions like "Why does this work?"
- Check engagement bonus points
- Verify comprehensive topic mastery tracking

**Session persistence:**
- Start session, answer questions, build score
- Close browser and reopen
- Verify complete state restoration including scores, streaks, and progress
- Continue learning and verify seamless progression

## Future enhancements

If given more time, add:

### Advanced Learning Features
- **Spaced repetition algorithm** - Schedule review of previously studied cards based on forgetting curves
- **Adaptive learning paths** - AI-generated learning sequences that adjust based on user strengths/weaknesses
- **Performance prediction** - ML models to predict optimal study timing and difficulty progression
- **Collaborative learning** - Share sessions and compete with friends through leaderboards

### Enhanced AI Capabilities  
- **Voice interaction** - Speech-to-text for hands-free learning and audio pronunciation for language learning
- **Image-based flashcards** - Generate questions about diagrams, charts, and visual content
- **Real-time feedback** - AI analyzes learning patterns and provides personalized study recommendations
- **Domain-specific tutoring** - Specialized AI prompts for subjects like math (with LaTeX), coding, or science

### Platform Expansions
- **Mobile app** - Native iOS/Android app with offline support and push notifications for study reminders
- **Analytics dashboard** - Deep insights into learning patterns, time spent per topic, and progress trends
- **Export capabilities** - Export to Anki, Quizlet, PDF study guides, or print-ready flashcard formats
- **Integration ecosystem** - Connect with Canvas, Blackboard, Google Classroom, and other educational platforms

### Social and Gamification
- **Achievement system** - Badges for study streaks, accuracy milestones, and topic mastery
- **Study groups** - Create shared sessions where multiple users can contribute and learn together
- **Teacher portal** - Allow educators to create assignments and track student progress
- **Community marketplace** - Share and discover high-quality flashcard sets created by other users

### Technical Improvements
- **Advanced caching** - Redis for session state and real-time collaboration features
- **Real-time sync** - WebSocket connections for live collaboration and instant progress updates
- **Improved search** - Full-text search across all user flashcards and learning history
- **A/B testing platform** - Experiment with different difficulty progression algorithms and UI patterns

### Accessibility and Internationalization
- **Screen reader support** - Full ARIA compliance and keyboard navigation
- **Multiple languages** - Support for creating and studying content in various languages
- **Learning disabilities support** - Features for dyslexia, ADHD, and other learning differences
- **Customizable UI** - Adjustable text size, color schemes, and interaction patterns

## Deployment considerations

### Database optimization
- **Indexing strategy** - Compound indexes on userId + sessionId for fast user data retrieval
- **Data archiving** - Move completed sessions older than 1 year to cold storage
- **Backup strategy** - Daily incremental backups with point-in-time recovery for user data
- **Sharding preparation** - Design schema to support horizontal scaling as user base grows

### Performance monitoring
- **Analytics tracking** - Monitor question generation speed, user engagement metrics, and session completion rates
- **Error logging** - Comprehensive error tracking for AI API failures and database connection issues
- **Performance metrics** - Track API response times, database query performance, and user session duration
- **Cost monitoring** - Monitor Claude API usage and implement rate limiting to control costs

### Security and compliance
- **Data encryption** - Encrypt all user learning data and personal information at rest and in transit
- **GDPR compliance** - Implement data export, deletion, and consent management features
- **Educational privacy** - FERPA compliance for educational institutions and student data protection
- **API security** - Rate limiting, request validation, and protection against prompt injection attacks

### Scalability architecture
- **CDN integration** - Serve static assets and cached content from global edge locations
- **Microservices transition** - Split AI processing, user management, and analytics into separate services
- **Queue system** - Background processing for analytics calculations and email notifications
- **Multi-region deployment** - Deploy across multiple regions for global user base with data locality

## Why this showcases Claude effectively

### Educational Excellence
1. **Adaptive teaching intelligence** - Demonstrates Claude's ability to adjust difficulty and content based on real-time performance analysis
2. **Contextual understanding** - Shows Claude maintaining conversation history and learning context across extended sessions
3. **Progressive pedagogy** - Exhibits sophisticated educational principles like spaced repetition, scaffolding, and mastery-based learning
4. **Multi-modal content generation** - Creates varied question types (basic, multiple choice, fill-in-blank) with appropriate difficulty scaling

### Technical Sophistication
5. **Advanced tool integration** - Showcases complex tool calling with structured data generation and real-time UI updates
6. **State management complexity** - Handles persistent learning sessions with comprehensive progress tracking and metrics
7. **Performance optimization** - Demonstrates efficient database design and real-time scoring calculations
8. **Production-ready architecture** - Uses modern Next.js patterns with proper authentication, authorization, and data validation

### User Experience Innovation
9. **Gamification integration** - Combines learning with engaging scoring, streaks, and progression systems
10. **Personalized learning paths** - Creates unique educational experiences tailored to individual user performance
11. **Seamless session continuity** - Allows users to pause and resume learning sessions without losing any progress or context
12. **Interactive engagement** - Encourages deeper learning through hints, follow-up questions, and explanatory content

### Real-World Impact
13. **Practical educational value** - Solves genuine learning challenges with evidence-based educational techniques
14. **Scalable learning platform** - Demonstrates how AI can democratize access to personalized tutoring
15. **Data-driven insights** - Provides actionable analytics to help users understand and improve their learning patterns
16. **Retention and motivation** - Uses psychological principles to maintain user engagement and learning consistency

### Developer Appeal
17. **Modern web stack integration** - Shows how to integrate Claude with Next.js 15, React Server Components, and Server Actions
18. **Complex state synchronization** - Demonstrates managing client/server state with real-time updates and optimistic UI
19. **Educational domain expertise** - Proves Claude's ability to understand and implement sophisticated educational concepts
20. **Extensible architecture** - Provides a foundation that developers can expand with additional subjects, features, and integrations

**Key innovations that will excite developers:**

- **Intelligent difficulty progression** - AI that learns from user performance and adapts in real-time
- **Comprehensive learning analytics** - Deep insights into user progress with actionable feedback
- **Persistent conversational context** - Maintains educational relationships across time and sessions
- **Gamified learning mechanics** - Combines engagement with educational effectiveness
- **Production-scale architecture** - Demonstrates enterprise-ready patterns for AI-powered applications

This demo proves that Claude can power sophisticated educational platforms that rival commercial tutoring services while providing developers with a complete blueprint for building AI-enhanced learning applications. The combination of pedagogical intelligence, technical excellence, and user engagement creates a compelling showcase of Claude's potential in the education technology space.