'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MultipleChoiceCardProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  onAnswer?: (correct: boolean) => void;
}

export function MultipleChoiceCard({ 
  question, 
  options, 
  correctAnswer, 
  explanation,
  onAnswer 
}: MultipleChoiceCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    
    setSelectedOption(option);
    setShowResult(true);
    
    const isCorrect = option === correctAnswer;
    onAnswer?.(isCorrect);
  };

  const reset = () => {
    setSelectedOption(null);
    setShowResult(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <h3 className="text-lg font-semibold">Multiple Choice</h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg mb-4">{question}</p>
        </div>
        
        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === correctAnswer;
            
            let buttonClass = '';
            if (showResult && isSelected) {
              if (isCorrect) {
                buttonClass = 'bg-green-100 border-green-500 text-green-700';
              } else {
                buttonClass = 'bg-red-100 border-red-500 text-red-700';
              }
            } else if (showResult && isCorrect) {
              buttonClass = 'bg-green-100 border-green-500 text-green-700';
            }

            return (
              <Button
                key={index}
                variant="outline"
                className={`w-full text-left justify-start h-auto p-3 ${buttonClass}`}
                onClick={() => handleOptionSelect(option)}
                disabled={showResult}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            );
          })}
        </div>

        {showResult && explanation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Explanation:</strong> {explanation}
            </p>
          </div>
        )}

        {showResult && (
          <Button 
            onClick={reset} 
            variant="outline" 
            className="w-full mt-4"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}