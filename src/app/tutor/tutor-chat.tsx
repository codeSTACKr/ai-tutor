'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { SimpleFlashcard } from '@/components/flashcards/simple-flashcard';

interface TutorChatProps {
  session: unknown;
}

export function TutorChat({ }: TutorChatProps) {
  const [input, setInput] = useState('');
  
  const { messages, sendMessage, status } = useChat({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      console.log('Sending message:', input);
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {/* Render message parts */}
            {message.parts.map((part, partIndex) => {
              // Text parts
              if (part.type === 'text') {
                return (
                  <div key={`text-${partIndex}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {part.text}
                    </div>
                  </div>
                );
              }
              
              // Tool result parts - render as flashcards
              if (part.type === 'tool-generateFlashcard' && 'output' in part && part.output) {
                const result = part.output as {
                  question: string;
                  answer: string;
                  explanation?: string;
                };
                return (
                  <div key={`flashcard-${partIndex}`} className="flex justify-center py-4">
                    <SimpleFlashcard
                      question={result.question}
                      answer={result.answer}
                      explanation={result.explanation}
                    />
                  </div>
                );
              }
              
              return null;
            })}
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for flashcards on any topic..."
            className="flex-1 p-2 border rounded-md"
            disabled={status === 'streaming'}
          />
          <button
            type="submit"
            disabled={status === 'streaming'}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {status === 'streaming' ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}