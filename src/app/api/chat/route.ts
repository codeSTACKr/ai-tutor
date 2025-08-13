import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { revalidatePath } from 'next/cache';
import { tools } from '@/lib/tools';
import { getLearningSession, updateSessionMessages } from '@/lib/actions';
import { convertChatMessagesToUIMessages, convertUIMessagesToChatMessages } from '@/lib/message-utils';

export async function POST(req: Request) {
  try {
    const { messages, sessionId }: { messages: UIMessage[]; sessionId?: string } = await req.json();
    // Load existing messages if sessionId is provided and messages array is empty/minimal
    let allMessages = messages;
    if (sessionId && messages.length <= 1) {
      try {
        const session = await getLearningSession(sessionId);
        const existingUIMessages = convertChatMessagesToUIMessages(session.messages);
        
        // Combine existing messages with new ones (avoid duplicates)
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          allMessages = [...existingUIMessages, lastMessage];
        } else {
          allMessages = existingUIMessages;
        }
        
      } catch {
        // Continue with just the provided messages
      }
    }

    // Filter out messages with empty parts and clean up tool calls for model processing
    const validMessages = allMessages
      .filter(msg => msg.parts && msg.parts.length > 0)
      .map(msg => {
        // For assistant messages, remove completed tool calls to avoid re-sending them
        if (msg.role === 'assistant') {
          const cleanParts = msg.parts.filter(part => {
            // Keep text parts
            if (part.type === 'text') return true;
            // Remove completed tool calls (they shouldn't be re-sent to the model)
            if ((part.type.startsWith('tool-') || part.type === 'dynamic-tool') && 'state' in part && part.state === 'output-available') {
              return false;
            }
            return true;
          });
          
          // Only include the message if it has content after filtering
          if (cleanParts.length === 0) return null;
          
          return { ...msg, parts: cleanParts };
        }
        return msg;
      })
      .filter((msg): msg is UIMessage => msg !== null);

    // Convert UIMessages to ModelMessages for AI processing
    const modelMessages = convertToModelMessages(validMessages);

    const result = streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: modelMessages,
      tools,
      system: `You are an AI tutor that creates interactive flashcards for learning. When users ask for flashcards or learning materials, you MUST call the generateFlashcard tool.

FLASHCARD TYPES:
1. Use "basic" for simple question-answer pairs
2. Use "multiple-choice" for questions with 4 options (include the correct answer in the options)

INSTRUCTIONS:
- ALWAYS call generateFlashcard tool when users ask for flashcards or learning materials
- Vary the card types to keep learning engaging - mix basic and multiple-choice cards
- For multiple-choice cards, provide exactly 4 options including the correct answer
- Include helpful explanations when appropriate
- Create questions that are educational and appropriately challenging
- Generate multiple flashcards when appropriate (2-5 cards per topic)

Example: If user says "create flashcards for JavaScript", generate both basic Q&A cards and multiple-choice questions about JavaScript concepts.

${sessionId ? `This is learning session ${sessionId}. The user's progress and chat history persist across the session.` : ''}`,
    });

    // Use proper v5 persistence pattern with onFinish callback
    return result.toUIMessageStreamResponse({
      originalMessages: allMessages,
      onFinish: async ({ messages: finalMessages }) => {
        if (sessionId) {
          try {
            // Convert UI messages back to our ChatMessage format and save
            const chatMessages = convertUIMessagesToChatMessages(finalMessages);
            await updateSessionMessages(sessionId, chatMessages);
            
            // Revalidate the session page to update flashcard count
            revalidatePath(`/tutor/${sessionId}`);
            revalidatePath('/tutor');
          } catch (error) {
            console.error('Failed to save messages:', error);
          }
        }
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}