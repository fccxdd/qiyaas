// components/game_mode/tutorial/TutorialWalkthrough.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GameWalkthrough, { getTotalSteps } from "@/components/game_assets/game_walkthrough/GameWalkthrough";
import { getNumbersForClue } from '@/components/game_assets/word_clues/ExtractAnswer';
import { NextButton, BackButton, StartButton } from '@/components/game_assets/game_walkthrough/ButtonNavigation';
import ProgressIndicator from '@/components/game_assets/game_walkthrough/ProgressIndicator';
import HintToggle from "@/components/game_assets/number_clues/HintToggle";

export default function TutorialWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { numbersForClue } = getNumbersForClue();
  const totalSteps = getTotalSteps();

  const handleStart = () => {
    router.push('/tutorial-play');
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-black overflow-hidden">
      {/* Main Game Area - Centered content */}
 
      <div className="absolute inset-0 flex flex-col justify-center items-center">

        {/* Left side - Clue numbers/dashes */}
        <div className="absolute left-0.5 sm:left-4 md:left-12 lg:left-16 top-1/2 -translate-y-1/2 flex flex-col justify-center space-y-6 sm:space-y-8 md:space-y-10">
          {numbersForClue.map((_, index) => (
            <div key={index} className="text-black dark:text-white text-3xl md:text-5xl font-bold">
              _
            </div>
          ))}
        </div>

        {/* Center Section - Tutorial Content */}
        <div className="w-[78%] sm:w-[50%] md:max-w-md text-center z-10">
          <GameWalkthrough currentStep={currentStep} />
        </div>
        
        {/* Right side - Hint Numbers */}
        <div className="absolute right-0.5 sm:right-[15%] top-1/2 -translate-y-1/2 z-30">
          <HintToggle hintsEnabled={false} />
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