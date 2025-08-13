# AI Tutor Demo - Video Script
*Developer-focused walkthrough emphasizing technical innovation and practical value*

---

## Opening Hook (0-30 seconds)

**[Screen: Show the live app with a user typing "Create flashcards for React hooks"]**

"What if I told you that Claude isn't just generating text responses anymore? It's generating interactive React components. Look at this - I'm asking for flashcards, and instead of getting a wall of text, Claude is creating actual functional UI components with state management, event handlers, and interactive logic."

**[Show the flashcard being generated in real-time in the chat]**

"This isn't just a chatbot. This is generative UI for education, and it changes everything about how we think about AI-powered applications."

---

## Live Demo (30 seconds - 2 minutes)

**[Quick demo flow - keep it snappy]**

"Let me show you what this looks like in practice. I'll ask for flashcards on Python basics."

**[Type: "Create flashcards for Python basics with both Q&A and multiple choice questions"]**

"Watch this - Claude isn't just understanding my request, it's making intelligent decisions about educational content. It's generating different card types, creating engaging questions, and building interactive components that actually work."

**[Show cards appearing, click through interactions]**

"Look at this multiple choice card - it has proper state management, visual feedback, explanations. This is a fully functional React component that Claude generated through a tool call."

**[Show session persistence]**

"And here's the kicker - everything persists. I can leave this session, come back tomorrow, and my entire learning history is here. This is production-grade session management powered by MongoDB and better-auth."

---

## Technical Deep-dive (2-6 minutes)

**[Switch to code view]**

"Alright, let's talk about how this actually works, because this is where it gets interesting from a developer perspective."

### The Tool Architecture

**[Show /src/lib/tools.ts]**

"The magic starts with tool definitions. I'm using the Vercel AI SDK v5 - which is brand new, by the way - to define structured tools that Claude can call. But here's what's different from typical AI tools..."

**[Highlight the generateFlashcardTool]**

"This isn't just returning JSON data. This tool is designed to generate UI components. Look at the schema - I've got different card types, validation for multiple-choice options, and educational metadata like explanations."

**[Point to validation logic]**

"And I'm doing validation at the tool level. If Claude tries to create a multiple-choice question without exactly 4 options, or if the correct answer isn't in the options, it fails fast. This ensures educational integrity."

### The Chat API Route

**[Show /src/app/api/chat/route.ts]**

"Now here's where the real sophistication happens. This isn't your typical chat endpoint."

**[Highlight the system prompt]**

"First, I'm prompting Claude to think like an educator, not just a chat assistant. I'm giving it specific instructions about flashcard types and educational best practices."

**[Show message persistence logic]**

"But the complex part is message persistence. I'm using the AI SDK's v5 patterns with session management. When a user continues a session, I'm loading their entire chat history, converting between UI messages and my custom ChatMessage format, and handling the complexity of tool call state."

**[Point to onFinish callback]**

"And here's the production pattern - I'm using the onFinish callback to persist everything back to MongoDB after each AI response. This ensures nothing gets lost, even if the user closes their browser mid-conversation."

### The Component Generation

**[Show the multiple-choice component]**

"Let's look at what Claude is actually generating. This multiple-choice component has proper TypeScript interfaces, React hooks for state management, conditional styling, and educational UX patterns like showing explanations after answers."

**[Highlight the interactive features]**

"Notice the details - it handles disabled states, visual feedback for correct/incorrect answers, the ability to retry questions. This isn't just displaying data, it's creating educational experiences."

### The Architecture Decision

**[Show the project structure]**

"Here's why this approach matters. I built this on Next.js 15 with App Router, using server components for data fetching and client components for interactivity. It's the same stack you'd use for a production SaaS application."

**[Show the session management]**

"Sessions are first-class entities with proper CRUD operations, user authentication through better-auth, and MongoDB for persistence. This isn't a prototype - this is production-ready architecture."

---

## Developer Value Proposition (6-7 minutes)

**[Show the running app again]**

"So why should you care about this as a developer?"

### Immediate Applications

"First, the immediate applications are obvious. Every developer wants to learn something - whether it's a new framework, preparing for interviews, or understanding complex algorithms. But Claude can generate learning content for literally any subject."

### Technical Innovation

"But more importantly, this demonstrates patterns you can use anywhere. Any time you need AI to generate structured, interactive content - not just text - this is your blueprint."

**[Quick code highlight]**

"The tool orchestration patterns, the session management, the way I'm handling AI streaming with persistence - these are production patterns you can adapt for any domain."

### Business Opportunity

"And let's be honest about the market opportunity here. Education technology is a massive market. Corporate training, certification prep, coding bootcamps - there's clear monetization potential."

**[Show the extensibility]**

"Look at what you could build on this foundation: coding challenges with live execution, collaborative learning sessions, adaptive difficulty algorithms, integration with existing learning management systems."

---

## Technical Wrap-up & Call to Action (7-8 minutes)

**[Back to the app]**

"Here's what makes this demo special. It's not just showing off Claude's capabilities - it's showing how to integrate those capabilities into real applications that people would actually pay for."

### Key Takeaways

"Three things I want you to remember from this demo:

1. **Generative UI is the future** - Stop thinking about AI as just text generation. Claude can create interactive experiences.

2. **Production patterns matter** - This isn't a toy. This is built with the same patterns you'd use for a million-user SaaS application.

3. **Education tech is just the beginning** - The same patterns work for any domain where AI needs to generate structured, interactive content."

### What's Next

"If you're interested in building something like this, everything is open source. The repo includes complete setup instructions, and I've documented exactly how I used Claude to build it - including the prompts and iterations that led to these patterns."

**[Show the README briefly]**

"And if you want to see where this goes next, I've outlined the roadmap for adaptive difficulty, analytics dashboards, and advanced features that would make this a competitive commercial product."

### Final Hook

"The question isn't whether AI will transform how we build applications. The question is whether you'll be building the applications that define that transformation."

**[End screen: Repository link and key technical stack]**

"Claude + Vercel AI SDK v5 + Next.js 15. The tools are here. The patterns are proven. What will you build?"

---

## Production Notes

- **Timing**: 7-8 minutes total
- **Tone**: Enthusiastic but not hype-driven; focus on practical value
- **Technical Level**: Assumes familiarity with React/Next.js but explains AI-specific concepts
- **Visual Flow**: Alternate between live demo and code views to maintain engagement
- **Key Message**: This is production-ready generative UI, not just another AI chat demo

## Recording Tips

1. **Practice the opening hook** - This needs to grab attention immediately
2. **Keep code explanations focused** - Don't get lost in implementation details
3. **Show, don't just tell** - Let the interactive components speak for themselves
4. **End with energy** - The call to action should inspire immediate action
5. **Time the demo carefully** - The live flashcard generation should feel seamless