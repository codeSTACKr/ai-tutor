'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SimpleFlashcardProps {
  question: string;
  answer: string;
  explanation?: string;
}

export function SimpleFlashcard({ question, answer, explanation }: SimpleFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <h3 className="text-lg font-semibold">
          {!isFlipped ? 'Question' : 'Answer'}
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="min-h-[100px] flex items-center justify-center text-center">
          {!isFlipped ? (
            <p className="text-lg">{question}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-green-600">{answer}</p>
              {explanation && (
                <p className="text-sm text-gray-600 italic">{explanation}</p>
              )}
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => setIsFlipped(!isFlipped)} 
          className="w-full"
        >
          {!isFlipped ? 'Show Answer' : 'Show Question'}
        </Button>
      </CardContent>
    </Card>
  );
}