'use client';

import { useEffect, useState } from 'react';

interface SessionStatsClientProps {
  sessionId: string;
  initialMessageCount: number;
  initialFlashcardCount: number;
  createdAt: Date;
}

export function SessionStatsClient({ 
  sessionId, 
  initialMessageCount, 
  initialFlashcardCount, 
  createdAt 
}: SessionStatsClientProps) {
  const [messageCount, setMessageCount] = useState(initialMessageCount);
  const [flashcardCount, setFlashcardCount] = useState(initialFlashcardCount);

  useEffect(() => {
    // Listen for custom events from the chat component when flashcards are added
    const handleFlashcardAdded = (event: CustomEvent) => {
      if (event.detail.sessionId === sessionId) {
        setFlashcardCount(prev => prev + 1);
      }
    };

    const handleMessageAdded = (event: CustomEvent) => {
      if (event.detail.sessionId === sessionId) {
        setMessageCount(prev => prev + 1);
      }
    };

    window.addEventListener('flashcard-added', handleFlashcardAdded as EventListener);
    window.addEventListener('message-added', handleMessageAdded as EventListener);

    return () => {
      window.removeEventListener('flashcard-added', handleFlashcardAdded as EventListener);
      window.removeEventListener('message-added', handleMessageAdded as EventListener);
    };
  }, [sessionId]);

  return (
    <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
      <span>{messageCount} messages</span>
      <span>{flashcardCount} flashcards</span>
      <span>Created {new Date(createdAt).toLocaleDateString()}</span>
    </div>
  );
}