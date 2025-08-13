import { getLearningSession } from '@/lib/actions';
import { convertChatMessagesToUIMessages } from '@/lib/message-utils';
import { TutorChat } from '../tutor-chat';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionStatsClient } from '@/components/sessions/session-stats-client';

interface SessionPageProps {
  params: {
    sessionId: string;
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  const session = await getLearningSession(sessionId);
  
  // Convert ChatMessage[] to UIMessage[] format for AI SDK v5
  const uiMessages = convertChatMessagesToUIMessages(session.messages);

  return (
    <div className="container mx-auto py-8">
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/tutor">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <Badge variant="outline">{session.status}</Badge>
        </div>
        <p className="text-gray-600">{session.subject}</p>
        {session.description && (
          <p className="text-sm text-gray-500 mt-2">{session.description}</p>
        )}
        
        {/* Quick Stats */}
        {session.messages.length > 0 && (
          <SessionStatsClient 
            sessionId={sessionId}
            initialMessageCount={session.messages.length}
            initialFlashcardCount={session.flashcards.length}
            createdAt={session.createdAt}
          />
        )}
      </div>
      
      <TutorChat 
        sessionId={sessionId}
        initialMessages={uiMessages}
      />
    </div>
  );
}