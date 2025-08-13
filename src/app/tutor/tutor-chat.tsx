'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { SimpleFlashcard } from '@/components/flashcards/simple-flashcard';
import { 
  Message, 
  MessageContent, 
  MessageAvatar 
} from '@/components/ai-elements/message';
import { 
  Conversation, 
  ConversationContent, 
  ConversationScrollButton 
} from '@/components/ai-elements/conversation';
import { 
  PromptInput, 
  PromptInputTextarea, 
  PromptInputToolbar, 
  PromptInputSubmit 
} from '@/components/ai-elements/prompt-input';

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
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageAvatar 
                src={message.role === 'user' ? 'https://ui-avatars.com/api/?name=You&background=0ea5e9&color=fff' : 'https://ui-avatars.com/api/?name=AI&background=6366f1&color=fff'}
                name={message.role === 'user' ? 'You' : 'AI Tutor'}
              />
              <MessageContent>
                {/* Render message parts */}
                {message.parts.map((part, partIndex) => {
                  // Text parts
                  if (part.type === 'text') {
                    return (
                      <div key={`text-${partIndex}`}>
                        {part.text}
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
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      
      {/* Input */}
      <div className="p-4 border-t">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for flashcards on any topic..."
            disabled={status === 'streaming'}
          />
          <PromptInputToolbar>
            <div />
            <PromptInputSubmit status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}