import { type LearningSession } from '@/lib/types';
import { SessionCard } from './session-card';

interface SessionListProps {
  sessions: LearningSession[];
}

export function SessionList({ sessions }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No learning sessions yet</h3>
        <p className="text-gray-500">Start your first learning session to begin studying with AI!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard key={session._id} session={session} />
      ))}
    </div>
  );
}