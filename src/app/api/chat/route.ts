import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToCoreMessages } from 'ai';
import { tools } from '@/lib/tools';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('Received messages:', messages);

    // Convert UIMessages to CoreMessages
    const coreMessages = convertToCoreMessages(messages);
    console.log('Converted messages:', coreMessages);

    const result = streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: coreMessages,
      tools,
      system: `You are an AI tutor. When users ask for flashcards, you MUST call the generateFlashcard tool. Do not provide text responses about creating flashcards - actually call the tool.

ALWAYS call generateFlashcard tool when users ask for flashcards or learning materials.

Example: If user says "flashcards to teach me javascript", immediately call generateFlashcard with a JavaScript question and answer.`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}