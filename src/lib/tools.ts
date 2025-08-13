import { tool } from 'ai';
import { z } from 'zod';

export const generateFlashcardTool = tool({
  description: 'Generate a flashcard for learning with support for multiple types',
  inputSchema: z.object({
    type: z.enum(['basic', 'multiple-choice']),
    question: z.string(),
    answer: z.string(),
    options: z.array(z.string()).optional(),
    explanation: z.string().optional(),
  }),
  execute: async ({ type, question, answer, options, explanation }) => {
    // Validate multiple-choice cards have options
    if (type === 'multiple-choice' && (!options || options.length !== 4)) {
      throw new Error('Multiple-choice cards must have exactly 4 options');
    }
    
    // Validate multiple-choice cards have the correct answer in options
    if (type === 'multiple-choice' && options && !options.includes(answer)) {
      throw new Error('Multiple-choice cards must include the correct answer in the options');
    }
    
    return { 
      type, 
      question, 
      answer, 
      options: type === 'multiple-choice' ? options : undefined,
      explanation 
    };
  },
});

export const tools = {
  generateFlashcard: generateFlashcardTool,
};