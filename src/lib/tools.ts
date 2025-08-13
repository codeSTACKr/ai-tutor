import { tool as createTool } from 'ai';
import { z } from 'zod';

export const generateFlashcardTool = createTool({
  description: 'Generate a simple flashcard for learning',
  inputSchema: z.object({
    question: z.string().describe('The question for the flashcard'),
    answer: z.string().describe('The correct answer to the question'),
    explanation: z.string().optional().describe('Optional explanation of the answer'),
  }),
  execute: async ({ question, answer, explanation }) => {
    console.log('Tool executed with:', { question, answer, explanation });
    return { question, answer, explanation };
  },
});

export const tools = {
  generateFlashcard: generateFlashcardTool,
};