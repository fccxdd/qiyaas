// components/TutorialContainer.jsx

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { tutorialSteps } from '@/data/tutorialSteps';
import LifeBar from "@/components/LifeBar";
import CluePlaceholder from "@/components/CluePlaceholder";
import DashPlaceholder from "@/components/DashPlaceholder";
import LetterSelector from "@/components/LetterSelector";
import TutorialAnswer from "@/data/tutorial_words.json";

export default function TutorialContainer() {
  
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);

  // Filter out empty steps
  const validSteps = tutorialSteps.filter(step => step.content.trim() !== ""); //=> step.content.trim() !== "");
  
  const nextStep = () => {
    setCurrentStep(prev => (prev + 1) % validSteps.length);
  };

  const prevStep = () => {
    setCurrentStep(prev => (prev - 1 + validSteps.length) % validSteps.length);
  };

  // Check if current step is the letter selection step
  const isLetterSelectionStep = validSteps[currentStep]?.content.includes("select some letters") || 
                               validSteps[currentStep]?.content.includes("3 consonants, 1 vowel");
  

  // Handle letters change from LetterSelector
  const handleLettersChange = (letters) => {
    setSelectedLetters(letters);
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
      if (e.key === 'ArrowLeft') {
        prevStep();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const currentStepData = validSteps[currentStep];

  return (
    
    <div className="w-full max-w-6xl mx-auto bg-white dark:bg-black rounded-lg shadow-lg p-6">
      
      {/* LifeBar - Top Right */}
      <LifeBar/>

      {/* Tutorial Container */}
      <div 
        className="relative min-h-[500px] flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Navigation Buttons */}
        <button
          onClick={prevStep}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
          aria-label="Previous step"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={nextStep}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
          aria-label="Next step"
        >
          <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        
        {/* Left Section - Dash Placeholder */}
        <DashPlaceholder/>

        {/* Center Section - Content Container */}
        <ContentContainer currentStepData={currentStepData} />
        
        {/* Letter Selector Component */}
        <LetterSelector 
          isActive={isLetterSelectionStep} 
          onLettersChange={handleLettersChange}
        />

        {/* Right Section - Clue Placeholder */}
        <CluePlaceholder numbers={[5, 1, 7]} showHints={true} />

      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {validSteps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentStep 
                ? 'bg-purple-600 dark:bg-white scale-125' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Step Counter */}
      {/* <div className="text-center mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {/* {currentStep + 1} of {validSteps.length} */}
        {/* </span> */}
      {/* </div> */}

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