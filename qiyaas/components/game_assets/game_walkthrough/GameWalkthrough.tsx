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
    <div className="w-full overflow-hidden walkthrough-container">
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
            className={`walkthrough-title title-text leading-loose text-black dark:text-white fade-in ${
              currentStep === 7 ? 'text-center' : ''
            }`}
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', display: 'block' }}
            dangerouslySetInnerHTML={{ __html: validSteps[currentStep].title }} 
          />
        )}
        
        {validSteps[currentStep]?.content && (
          <div 
            key={`content-${currentStep}`}
            className="walkthrough-content title-text leading-loose md:leading-[2.5] text-black dark:text-white mt-2 fade-in-delay"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line', display: 'block' }}
            dangerouslySetInnerHTML={{ __html: validSteps[currentStep].content }} 
          />
        )}

        {/* Render component if it exists in the step */}
        {validSteps[currentStep]?.component && (
          <div className="fade-in-delay mt-4">
            {(() => {
              const StepComponent = validSteps[currentStep].component;
              return <StepComponent />;
            })()}
          </div>
        )}

        {/* Step 7 keyboard preview */}
        {currentStep === 7 && (
          <div className="fade-in-delay mt-4">
            <KeyboardPreview />
          </div>
        )}
      </div>

      <style jsx>{`
        /* Mobile devices (320px — 480px) */
        .walkthrough-container {
          padding-top: 0;
        }
        
        .walkthrough-title {
          font-size: 1rem; /* text-base */
          line-height: 2;
        }
        
        .walkthrough-content {
          font-size: 1rem; /* text-base */
          line-height: 2;
        }
        
        /* iPads, Tablets (481px — 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .walkthrough-container {
            padding-top: 0.5rem;
          }
          
          .walkthrough-title {
            font-size: 1.125rem; /* text-lg */
          }
          
          .walkthrough-content {
            font-size: 1.125rem; /* text-lg */
          }
        }
        
        /* Small screens, laptops - 13-inch (769px — 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .walkthrough-container {
            padding-top: 2rem;
          }
          
          .walkthrough-title {
            font-size: 1.25rem; /* text-xl - reduced from text-2xl */
          }
          
          .walkthrough-content {
            font-size: 1rem; /* text-base */
            line-height: 2.25;
          }
        }
        
        /* Desktops, large screens - 15-inch+ (1025px — 1280px) */
        @media (min-width: 1025px) and (max-width: 1280px) {
          .walkthrough-container {
            padding-top: 1rem;
          }
          
          .walkthrough-title {
            font-size: 1.125rem; /* text-2xl */
          }
          
          .walkthrough-content {
            font-size: 1rem; /* text-lg */
            line-height: 2.5;
          }
        }
        
        /* Extra large screens, TV (1281px and more) */
        @media (min-width: 1281px) {
          .walkthrough-container {
            padding-top: 1rem;
          }
          
          .walkthrough-title {
            font-size: 1.5rem; /* text-2xl */
          }
          
          .walkthrough-content {
            font-size: 1.125rem; /* text-lg */
            line-height: 2.5;
          }
        }
        
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