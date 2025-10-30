// components/game_assets/game_walkthrough/GameWalkthrough.tsx

'use client';

import { tutorialSteps } from '@/data/tutorialSteps';
import { useState, useEffect } from 'react';
import KeyboardPreview from '@/components/game_assets/game_walkthrough/KeyboardPreview';

const validSteps = tutorialSteps;

// Export helper function to get total steps
export const getTotalSteps = () => tutorialSteps.length;

interface GameWalkthroughProps {
  currentStep: number;
}

const GameWalkthrough: React.FC<GameWalkthroughProps> = ({ currentStep }) => {
  const [direction, setDirection] = useState<'forward' | 'backward' | null>(null);
  const [previousStep, setPreviousStep] = useState(currentStep);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentStep !== previousStep) {
      setDirection(currentStep > previousStep ? 'forward' : 'backward');
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPreviousStep(currentStep);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, previousStep]);

  return (
    <div className="w-full overflow-hidden">
      <div 
        className={`w-full transition-transform duration-500 ease-in-out ${
          isAnimating 
            ? direction === 'forward' 
              ? 'sm:animate-none animate-slide-in-right' 
              : 'sm:animate-none animate-slide-in-left'
            : ''
        }`}
      >
        {validSteps[currentStep]?.title && (
          <div 
            key={`title-${currentStep}`}
            className={`text-base sm:text-base md:text-2xl title-text leading-loose text-black dark:text-white fade-in ${
              currentStep === 7 ? 'text-center' : ''
            }`}
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', display: 'block' }}
            dangerouslySetInnerHTML={{ __html: validSteps[currentStep].title }} 
          />
        )}
        
        {validSteps[currentStep]?.content && (
          <div 
            key={`content-${currentStep}`}
            className="text-base sm:text-lg title-text leading-loose md:leading-[2.5] text-black dark:text-white mt-2 fade-in-delay"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line', display: 'block' }}
            dangerouslySetInnerHTML={{ __html: validSteps[currentStep].content }} 
          />
        )}

        {/* Step 7 keyboard preview */}
        {currentStep === 7 && (
          <div className="fade-in-delay mt-4">
            <KeyboardPreview />
          </div>
        )}
      </div>

      <style jsx>{`
        .fade-in {
          animation: simpleFadeIn 0.8s ease-in forwards;
          opacity: 0;
        }
        
        .fade-in-delay {
          animation: simpleFadeIn 0.8s ease-in 0.4s forwards;
          opacity: 0;
        }
        
        @keyframes simpleFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GameWalkthrough;