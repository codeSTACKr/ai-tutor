import { getUserLearningSessions } from '@/lib/actions';
import { SessionList } from '@/components/sessions/session-list';
import { CreateSessionForm } from '@/components/sessions/create-session-form';

export default async function TutorPage() {
  const sessions = await getUserLearningSessions();

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Your Learning Sessions</h2>
          <SessionList sessions={sessions} />
        </div>
        <div>
          <CreateSessionForm />
        </div>
      </div>
    </div>
  );
}