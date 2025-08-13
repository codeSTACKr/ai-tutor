'use client';

import { useFormStatus } from 'react-dom';
import { createLearningSession } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Creating Session...' : 'Start Learning Session'}
    </Button>
  );
}

export function CreateSessionForm() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await createLearningSession(formData);
    
    if (result.success && result.sessionId) {
      router.push(`/tutor/${result.sessionId}`);
    } else {
      console.error('Failed to create session:', result.error);
      // In a real app, you'd show a toast notification here
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start New Learning Session</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input 
              id="title"
              name="title" 
              placeholder="e.g., JavaScript Fundamentals" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject"
              name="subject" 
              placeholder="e.g., Programming, Math, Science" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description"
              name="description" 
              placeholder="What specific topics do you want to focus on?" 
              rows={3}
            />
          </div>
          
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}