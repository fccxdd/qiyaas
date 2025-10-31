// components/game_mode/tutorial/TutorialWalkthrough.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GameWalkthrough, { getTotalSteps } from "@/components/game_assets/game_walkthrough/GameWalkthrough";
import { NextButton, BackButton, StartButton } from '@/components/game_assets/game_walkthrough/ButtonNavigation';
import ProgressIndicator from '@/components/game_assets/game_walkthrough/ProgressIndicator';

export default function TutorialWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const totalSteps = getTotalSteps();

  const handleStart = () => {
    router.push('/tutorial-play');
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-black overflow-hidden">
      {/* Main Game Area - Centered content */}
 
      <div className="absolute inset-0 flex flex-col justify-center items-center">

        {/* Center Section - Tutorial Content */}
        <div className="w-[78%] sm:w-[50%] md:max-w-md text-center z-10 md:text-xl lg:text-2xl">
          <GameWalkthrough currentStep={currentStep} />
        </div>
        
      </div>

      {/* Progress Indicator */}
      <div className={`absolute left-0 right-0 flex justify-center items-center px-4 z-20 ${
        currentStep === totalSteps - 1 ? 'bottom-44' : 'bottom-28'
      }`}>
        <ProgressIndicator currentStep={currentStep} />
      </div>

      {/* Start Button */}
      {currentStep === totalSteps - 1 && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center items-center px-4 z-20">
          <StartButton onClick={handleStart} />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4 sm:gap-8 md:gap-12 px-4 z-20">
        {currentStep > 0 && (
          <BackButton onClick={() => setCurrentStep(prev => prev - 1)} />
        )}
        {currentStep < totalSteps - 1 && (
          <NextButton onClick={() => setCurrentStep(prev => prev + 1)} />
        )}
      </div>
    </div>
  );
}