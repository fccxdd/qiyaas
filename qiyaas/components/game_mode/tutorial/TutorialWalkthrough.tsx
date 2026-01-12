// components/game_mode/tutorial/TutorialWalkthrough.tsx

'use client';

import { useRouter } from 'next/navigation';
import { tutorialSteps } from '@/data/tutorialSteps';
import KeyboardPreview from '@/components/game_assets/game_walkthrough/components/KeyboardPreview';
import { StartButton } from '@/components/game_assets/game_walkthrough/ButtonNavigation';

export default function TutorialWalkthrough() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/play');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 sm:pt-28 md:pt-32">
      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        
        {/* Tutorial Steps */}
        <div className="space-y-16 md:space-y-20">
          {tutorialSteps.map((step, index) => (
            <div 
              key={index}
              className="tutorial-step"
            >
              {/* Step Title */}
              {step.title && (
                <h2 
                  className={`tutorial-title text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed text-black dark:text-white mb-4 `}
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: step.title }} 
                />
              )}
              
              {/* Step Content */}
              {step.content && (
                <div 
                  className="tutorial-content text-xl md:text-2xl lg:text-3xl text-center leading-loose md:leading-[2.5] text-black dark:text-white"
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ __html: step.content }} 
                />
              )}

              {/* Render component if it exists in the step */}
              {step.component && (
                <div className="mt-5 flex justify-center">
                  {(() => {
                    const StepComponent = step.component;
                    return <StepComponent />;
                  })()}
                </div>
              )}
           

              {/* Step 9 keyboard preview */}
              {index === 9 && (
                <div className="mt-6">
                  <KeyboardPreview />
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Start Button */}
        <div className="mt-16 md:mt-20 flex justify-center">
          <StartButton onClick={handleStart} />
        </div>
      </div>
    </div>
  );
}