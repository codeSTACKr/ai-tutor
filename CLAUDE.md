# AI Tutor Demo - Implementation Guide

## Project Overview

AI-powered tutoring application that generates interactive flashcards for any subject. Built on the better-auth-mongodb todo app foundation, transformed into an educational platform with generative UI patterns.

**Key Innovation**: Interactive flashcards generated as UI components within chat interface, demonstrating Claude's structured educational content creation.

## Implementation Strategy

### 🚀 Phase 1: Proof of Concept (2-4 hours)
- Basic AI chat with simple flashcard generation
- Transform existing todo app structure
- Simple Q&A flashcards with flip interaction

### 📈 Phase 2: Minimum Viable Product (2-4 hours)  
- Learning sessions with persistence
- Multiple flashcard types (basic, multiple choice)
- Session management and progress tracking

### 🎯 Phase 3: Advanced Features (2-4 hours)
- Adaptive difficulty and scoring system
- Comprehensive analytics dashboard
- Hint system and follow-up engagement

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: better-auth with MongoDB: https://www.better-auth.com/docs
- **Database**: MongoDB with native driver
- **AI**: Vercel AI SDK v5 with Claude integration: https://ai-sdk.dev/docs
- **UI**: AI Elements → shadcn/ui → Tailwind CSS: https://ai-sdk.dev/elements
- **Deployment**: Vercel

## File Structure Migration

Transform existing todo app structure:
- Convert `todos/` → `tutor/` (main interface)
- Add `api/chat/` for AI streaming
- Add `dashboard/` for analytics
- Create `components/flashcards/`, `components/chat/`, `components/sessions/`
- Modify `lib/actions.ts` for flashcard operations
- Add `lib/ai.ts` for Vercel AI SDK setup
- Update `lib/types.ts` with session and flashcard types

## Phase 1: Basic AI Chat with Flashcards

### Prerequisites
Repository includes: AI SDK, AI Elements, Zod validation, Better Auth, MongoDB integration

### Setup Steps
1. **Environment Variables**: Add `ANTHROPIC_API_KEY` to `.env.local`
2. **Environment Validation**: Update `src/lib/env.ts` to include AI key
3. **AI Configuration**: Create `src/lib/ai.ts` with Claude model setup
4. **Chat API Route**: Create `src/app/api/chat/route.ts` with streaming and tools
5. **Flashcard Component**: Create basic flippable flashcard in `src/components/flashcards/`
6. **Transform Pages**: Convert `todos/page.tsx` to `tutor/page.tsx`
7. **Chat Interface**: Create `tutor-chat.tsx` with AI Elements integration
8. **Update Navigation**: Change "Todos" link to "Tutor" in layout

### Testing Phase 1
1. Start app: `npm run dev`
2. Login and navigate to `/tutor`
3. Ask: "Create flashcards for basic algebra"
4. Verify flashcards appear with flip functionality

**Success Criteria**: Interactive flashcards generated within chat interface

## Phase 2: Learning Sessions & Persistence

### Features
- **Learning Sessions**: Users can create and resume study sessions
- **Session Persistence**: Chat history and progress saved to database
- **Multiple Card Types**: Basic Q&A, Multiple Choice
- **Session Management**: List, create, delete sessions

### Implementation Steps
1. **Add Session Types**: Update `lib/types.ts` with ChatMessage, Flashcard, LearningSession interfaces
2. **Session Management Actions**: Update `lib/actions.ts` with CRUD operations for sessions
3. **Multiple Choice Component**: Create interactive multiple choice flashcard
4. **Update Chat API**: Add support for multiple card types with tool parameters
5. **Session List Page**: Transform main tutor page to show session management
6. **Individual Session Pages**: Create `[sessionId]/page.tsx` for chat interface
7. **Session Components**: Build session list, cards, and creation forms

### Testing Phase 2
1. Create new learning session with title/subject
2. Generate both basic and multiple choice cards
3. Leave session and return - verify chat history persists
4. Create multiple sessions and switch between them

**Success Criteria**: Persistent learning sessions with mixed flashcard types

## Phase 3: Advanced Features & Analytics

### Features
- **Adaptive Difficulty**: AI adjusts question difficulty based on performance
- **Comprehensive Scoring**: Points, streaks, accuracy tracking with time bonuses
- **Hint System**: Progressive hints with penalty scoring (3 levels max)
- **Learning Analytics**: Performance insights and progress visualization
- **Mastery Tracking**: Topic-based progress and skill levels
- **Follow-up Learning**: Encourage deeper exploration through follow-up questions

### Key Components
- Enhanced flashcard components with timing, hints, and difficulty badges
- Comprehensive scoring system with multiple factors (difficulty, hints, time, streaks)
- Adaptive difficulty progression algorithms (80%+ accuracy = increase, 40%- = decrease)
- Rich analytics dashboard with performance metrics
- Advanced session metrics and progress tracking
- Performance prediction and recommendations

### Implementation Priority
1. **Scoring System & Adaptive Difficulty**: Enhanced flashcards with comprehensive scoring
2. **Analytics Dashboard**: Mastery tracking and performance insights

### Testing Phase 3 - Advanced Features
**Beginner Progression**: Start with basic questions, build accuracy, watch difficulty increase
**Struggling Learner**: Answer incorrectly, use hints, verify difficulty decreases and penalties apply
**Engaged Learner**: Answer correctly, ask follow-ups, check engagement bonuses and mastery tracking
**Session Persistence**: Verify complete state restoration including scores, streaks, and progress

**Success Criteria**: Comprehensive adaptive learning platform with sophisticated analytics

## Architecture & Implementation Notes

### Component Hierarchy Priority
1. **AI Elements** - Chat interface, message handling (Message, MessageContent, PromptInput)
2. **shadcn/ui** - Standard UI components (buttons, cards, forms)
3. **Custom Tailwind** - Only when above don't meet requirements

### Next.js App Router Patterns
- **Server Components** - Data fetching, static content, initial page loads
- **Server Actions** - Form submissions, database mutations, user actions
- **API Routes** - AI streaming, webhooks, external API integrations
- **Client Components** - Interactivity, state management, real-time features

### Database Strategy
- MongoDB with native driver (no ORM overhead)
- Learning sessions with embedded chat history and flashcards
- Progress tracking embedded within session documents for performance
- Server-side queries with user ID filtering for security
- Atomic operations to prevent data loss

### Session Persistence Architecture
- Learning sessions as main entity with complete chat history
- Real-time progress updates during flashcard interactions
- User isolation through authentication and database filtering
- Optimistic updates with database confirmation

### Key Features Showcase
1. **Educational Excellence**: Adaptive teaching, contextual understanding, progressive pedagogy
2. **Technical Sophistication**: Advanced tool integration, state management, production architecture
3. **User Experience**: Gamification, personalized paths, seamless continuity, interactive engagement
4. **Real-World Impact**: Practical value, scalable platform, data-driven insights, retention mechanics

This demonstrates Claude's ability to power sophisticated educational platforms while providing developers with a complete blueprint for AI-enhanced learning applications.

- always use the context 7 mcp server to look at the most recent docs for the vercel ai sdk (v5) and the vercel ai-elements package. both of these are very new and you do not know how to use them without help from the docs, so do not rely on your own knowledge ever.
- never type something as `any`