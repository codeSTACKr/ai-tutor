'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { SimpleFlashcard } from '@/components/flashcards/simple-flashcard';
import { MultipleChoiceCard } from '@/components/flashcards/multiple-choice-card';
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
import { Response } from '@/components/ai-elements/response';

interface TutorChatProps {
  sessionId?: string;
  initialMessages?: UIMessage[];
}

export function TutorChat({ sessionId, initialMessages = [] }: TutorChatProps) {
  const [input, setInput] = useState('');
  const [previousMessageCount, setPreviousMessageCount] = useState(initialMessages.length);
  const [previousFlashcardCount, setPreviousFlashcardCount] = useState(() => {
    // Count initial flashcards from initialMessages
    return initialMessages.reduce((count, message) => {
      return count + (message.parts?.filter(part => 
        part.type === 'tool-generateFlashcard' && part.state === 'output-available'
      ).length || 0);
    }, 0);
  });
  
  const { messages, sendMessage, status } = useChat({
    id: sessionId, // Use sessionId as chat ID for persistence
    messages: initialMessages, // Load initial messages using v5 pattern
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { sessionId },
    }),
  });

  // Track when new messages are added (both user and AI messages)
  useEffect(() => {
    if (messages.length > previousMessageCount) {
      const newMessagesCount = messages.length - previousMessageCount;
      
      // Dispatch message added events for each new message
      for (let i = 0; i < newMessagesCount; i++) {
        if (sessionId) {
          window.dispatchEvent(new CustomEvent('message-added', { 
            detail: { sessionId } 
          }));
        }
      }

      setPreviousMessageCount(messages.length);
    }
  }, [messages.length, previousMessageCount, sessionId]);

  // Track when flashcards are added by scanning all message parts
  useEffect(() => {
    const currentFlashcardCount = messages.reduce((count, message) => {
      return count + (message.parts?.filter(part => 
        part.type === 'tool-generateFlashcard' && part.state === 'output-available'
      ).length || 0);
    }, 0);

    if (currentFlashcardCount > previousFlashcardCount) {
      const newFlashcardsCount = currentFlashcardCount - previousFlashcardCount;
      
      // Dispatch flashcard added events for each new flashcard
      for (let i = 0; i < newFlashcardsCount; i++) {
        if (sessionId) {
          window.dispatchEvent(new CustomEvent('flashcard-added', { 
            detail: { sessionId } 
          }));
        }
      }

      setPreviousFlashcardCount(currentFlashcardCount);
    }
  }, [messages, previousFlashcardCount, sessionId]);

  const renderFlashcard = (part: { type: string; state: string; toolCallId: string; output: unknown }) => {
    if (part.type === 'tool-generateFlashcard' && part.state === 'output-available') {
      const output = part.output as { type: string; question: string; answer: string; options?: string[]; explanation?: string };
      const { type, question, answer, options, explanation } = output;
      
      if (type === 'basic') {
        return (
          <SimpleFlashcard
            question={question}
            answer={answer}
            explanation={explanation}
          />
        );
      } else if (type === 'multiple-choice') {
        return (
          <MultipleChoiceCard
            question={question}
            options={options || []}
            correctAnswer={answer}
            explanation={explanation}
          />
        );
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[70vh] min-h-[800px] max-w-4xl mx-auto border rounded-lg">
      {/* Messages */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.map((message, messageIndex) => (
            <Message key={message.id || `message-${messageIndex}`} from={message.role}>
              <MessageContent>
                {/* Render message parts */}
                {message.parts
                  .filter((part) => {
                    // Filter out parts that might cause issues
                    if (!part || !part.type) return false;
                    return true;
                  })
                  .map((part, index) => {
                    // Ensure we have a unique key for each part
                    const partKey = `${message.id}-part-${index}-${part.type}`;
                    
                    switch (part.type) {
                      case 'text':
                        return (
                          <Response key={partKey}>
                            {part.text || ''}
                          </Response>
                        );
                      
                      case 'tool-generateFlashcard':
                        if (part.state === 'output-available') {
                          return (
                            <div key={partKey} className="mt-4">
                              {renderFlashcard({
                                type: part.type,
                                state: part.state,
                                toolCallId: part.toolCallId || `fallback-${index}`,
                                output: part.output
                              })}
                            </div>
                          );
                        } else {
                          return (
                            <div key={partKey} className="text-gray-500 italic mt-4">
                              Generating flashcard...
                            </div>
                          );
                        }
                      
                      default:
                        return null;
                    }
                  })}
              </MessageContent>
              <MessageAvatar 
                src={message.role === 'user' ? 'https://ui-avatars.com/api/?name=You&background=0ea5e9&color=fff' : 'https://ui-avatars.com/api/?name=AI&background=6366f1&color=fff'}
                name={message.role === 'user' ? 'You' : 'AI Tutor'}
              />
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
          <PromptInputToolbar className="relative">
            <PromptInputSubmit status={status} disabled={!input.trim()} className="absolute bottom-2 right-2" />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}