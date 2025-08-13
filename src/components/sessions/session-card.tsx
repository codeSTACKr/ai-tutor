'use client';

import { type LearningSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteLearningSession } from '@/lib/actions';
import Link from 'next/link';
import { Trash2, BookOpen, Clock } from 'lucide-react';

interface SessionCardProps {
  session: LearningSession;
}

// Native JavaScript relative time utility
function getRelativeTime(date: string | Date) {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function SessionCard({ session }: SessionCardProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this learning session? All progress will be lost.')) {
      await deleteLearningSession(session._id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <p className="text-sm text-gray-600">{session.subject}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {session.description && (
          <p className="text-sm text-gray-700 line-clamp-2">{session.description}</p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{session.messages.length} messages</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{getRelativeTime(session.lastAccessedAt)}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/tutor/${session._id}`} className="flex-1">
            <Button className="w-full">
              {session.messages.length > 0 ? 'Continue Session' : 'Start Session'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}