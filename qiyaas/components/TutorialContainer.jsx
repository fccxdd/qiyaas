// components/TutorialContainer.jsx

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { tutorialSteps } from '@/data/tutorialSteps';
import LifeBar from "@/components/LifeBar";
import CluePlaceholder from "@/components/CluePlaceholder";
import DashPlaceholder from "@/components/DashPlaceholder";
import LetterSelector from "@/components/LetterSelector";
import WordGameManager from "@/components/WordGameManager";

export default function TutorialContainer() {
  
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [virtualKeyboardInput, setVirtualKeyboardInput] = useState(null);
  const [lockedLetters, setLockedLetters] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [lives, setLives] = useState(5);

  // Filter out empty steps
  const validSteps = tutorialSteps.filter(step => step.content.trim() !== "");
  
  // Check if current step is the letter selection step
  const isLetterSelectionStep = validSteps[currentStep]?.content.includes("select some letters") || 
                               validSteps[currentStep]?.content.includes("3 consonants, 1 vowel");
  
  // Check if current step is a game step (after letter selection)
  const isGameStep = lockedLetters.length === 4 && currentStep >= validSteps.findIndex(step => 
    step.content.includes("select some letters") || step.content.includes("3 consonants, 1 vowel")
  );

  // Handle letters change from LetterSelector
  const handleLettersChange = (letters) => {
    setSelectedLetters(letters);
  };

  // Handle letters being locked
  const handleLettersLocked = (letters) => {
    setLockedLetters(letters);
  };

  // Handle game state changes
  const handleGameStateChange = (newGameState) => {
    setGameState(newGameState);
    // Update lives from game state
    if (newGameState.lives !== lives) {
      setLives(newGameState.lives);
    }
  };

  // Handle virtual keyboard input
  const handleVirtualKeyboardInput = (type, value) => {
    if (isLetterSelectionStep || isGameStep) {
      setVirtualKeyboardInput({ type, value, timestamp: Date.now() });
    }
  };

  // Expose virtual keyboard handler globally so MinimalistKeyboard can use it
  useEffect(() => {
    window.letterSelectorInput = handleVirtualKeyboardInput;
    return () => {
      delete window.letterSelectorInput;
    };
  }, [isLetterSelectionStep, isGameStep]);
  
  const nextStep = () => {
    setCurrentStep(prev => (prev + 1) % validSteps.length);
  };

  const prevStep = () => {
    setCurrentStep(prev => (prev - 1 + validSteps.length) % validSteps.length);
  };

  // Handle touch events for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextStep();
    } else if (isRightSwipe) {
      prevStep();
    }
  };

  const ContentContainer = ({ currentStepData }) => {
  return (
    <div className="w-1/2 flex flex-col justify-center text-center px-8">
      {currentStepData.title && (
        <h2 
          className="tutorial-title mb-6"
          dangerouslySetInnerHTML={{ __html: currentStepData.title }}
        />
      )}
      
      <h3 
        className="tutorial-content leading-relaxed"
        dangerouslySetInnerHTML={{ __html: currentStepData.content }}
      />
    </div>
  );
  };
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle navigation if not in letter selection mode or game mode
      if (!isLetterSelectionStep && !isGameStep) {
        if (e.key === 'ArrowLeft') {
          prevStep();
        } else if (e.key === 'ArrowRight') {
          nextStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLetterSelectionStep, isGameStep]);

  const currentStepData = validSteps[currentStep];

  return (
    <div className="w-full max-w-7xl mx-auto bg-white dark:bg-black rounded-lg shadow-lg p-2 sm:p-4 md:p-6 min-h-screen sm:min-h-0">
      {/* LifeBar - Top Right */}
      <LifeBar lives={lives} maxLives={5} />
      
      {/* Letter Selector Component - Only shows during letter selection */}
      <LetterSelector 
        isActive={isLetterSelectionStep} 
        onLettersChange={handleLettersChange}
        virtualKeyboardInput={virtualKeyboardInput}
        persistedLetters={lockedLetters}
        onLettersLocked={handleLettersLocked}
      />

      {/* Word Game Manager - Only shows during game */}
      <WordGameManager
        isActive={isGameStep}
        startingLetters={lockedLetters}
        onGameStateChange={handleGameStateChange}
        virtualKeyboardInput={virtualKeyboardInput}
      />
      
      {/* Tutorial Container with Navigation */}
      <div className="relative">
        {/* Main Content Area */}
        <div 
          className="min-h-[500px] flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Left Section - Dash Placeholder */}
          <DashPlaceholder/>

          {/* Left Navigation Button */}
          <button
            onClick={prevStep}
            className="mx-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Center Section - Content Container */}
          <ContentContainer currentStepData={currentStepData} />
          
          {/* Right Navigation Button */}
          <button
            onClick={nextStep}
            className="mx-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Next step"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Right Section - Clue Placeholder */}
          <CluePlaceholder numbers={[5, 1, 7]} />
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {validSteps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentStep 
                ? 'bg-fuchsia-600 scale-125' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Custom Styles for Inknut Antiqua Font */}
      <style jsx>{`
        .tutorial-title {
          font-family: var(--font-inknut-antiqua), serif;
          font-weight: bold;
          text-decoration: underline;
          font-size: 1.5rem;
          line-height: 1.4;
        }
        
        .tutorial-content {
          font-family: var(--font-inknut-antiqua), serif;
          font-weight: normal;
          text-decoration: none;
          font-size: 1.125rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}