// components/TutorialContainer.jsx

import { useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { tutorialSteps } from '@/data/tutorialSteps';
import tutorialWords from '@/data/tutorial_words.json';
import CluePlaceholder from "@/components/CluePlaceholder";
import DashPlaceholder from "@/components/DashPlaceholder";
import LetterSelector from "@/components/LetterSelector";
import Keyboard from "@/components/Keyboard";
import LifeBar from "@/components/LifeBar";
import { WinScreen, LoseScreen } from "@/components/GameOverScreen";
import MessageBox from "@/components/MessageBox";

export default function TutorialContainer() {
  
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [virtualKeyboardInput, setVirtualKeyboardInput] = useState(null);
  const [lockedLetters, setLockedLetters] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [lives, setLives] = useState(5);
  const [letterStates, setLetterStates] = useState({});
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showLoseScreen, setShowLoseScreen] = useState(false);

  // Message state - moved from DashPlaceholder to here
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Message handling function
  const showMessage = (message, type) => {
    setCurrentMessage(message);
    setMessageType(type);
  };

  const clearMessage = () => {
    setCurrentMessage('');
    setMessageType('');
  };

  // Filter out empty steps
  const validSteps = tutorialSteps.filter(step => step.content.trim() !== "");
  
  // Check if current step is the letter selection step
  const isLetterSelectionStep = Boolean(
    validSteps[currentStep]?.content?.includes("select some letters") || 
    validSteps[currentStep]?.content?.includes("3 consonants, 1 vowel")
  );

  // Check if current step is a game step (after letter selection)
  const isGameStep = lockedLetters.length === 4; // Simplified - if we have 4 locked letters, activate game

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

  const handleLetterStatesChange = (newLetterStates) => {
    setLetterStates(newLetterStates);
  };

  const handleLifeLost = () => {
    console.log('Life lost triggered!'); // Debug log
    setLives(prev => {
      const newLives = Math.max(0, prev - 1);
      console.log('Lives updated from', prev, 'to', newLives); // Debug log
      
      // Check if game is lost (no lives remaining)
      if (newLives === 0) {
        console.log('💀 GAME LOST - No lives remaining!');
        setTimeout(() => {
          setShowLoseScreen(true);
        }, 1500); // Delay to show final life loss animation
      }
      
      return newLives;
    });
  };

  const handleGameWon = () => {
    console.log('🎉 Game won!');
    setShowWinScreen(true);
  };

  const handleGameLost = () => {
    console.log('💀 Game lost!');
    setShowLoseScreen(true);
  };

  // Reset the game to initial state
  const resetGame = () => {
    console.log('🔄 Resetting game...');
    setSelectedLetters([]);
    setLockedLetters([]);
    setGameState(null);
    setLives(5);
    setShowWinScreen(false);
    setShowLoseScreen(false);
    setVirtualKeyboardInput(null);
    clearMessage(); // Clear any messages

    // Reset to the letter selection step
    const letterSelectionStepIndex = validSteps.findIndex(step => 
      step.content.includes("select some letters") || step.content.includes("3 consonants, 1 vowel")
    );
    if (letterSelectionStepIndex !== -1) {
      setCurrentStep(letterSelectionStepIndex);
    }
  };

  // Go Back to Main Game
  const goToMainGame = () => {
    // Simple navigation (current - works immediately)
    window.location.href = '/play';
  };

  // Handle virtual keyboard input
  const handleVirtualKeyboardInput = (input) => {
    setVirtualKeyboardInput(input);
  };

  const nextStep = () => {
    if (showWinScreen || showLoseScreen) return; // Don't advance if game over screens are showing
    setCurrentStep(prev => (prev + 1) % validSteps.length);
  };

  const prevStep = () => {
    if (showWinScreen || showLoseScreen) return; // Don't go back if game over screens are showing
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

    if (isLeftSwipe && currentStep < validSteps.length - 1) {
      nextStep();
    }
    if (isRightSwipe && currentStep > 0) {
      prevStep();
    }
  };

  return (
    <div className="relative h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Message Box - Rendered at top level */}
      <MessageBox 
        message={currentMessage}
        type={messageType}
        onClose={clearMessage}
        duration={3000}
      />

      <div 
        className="w-full max-w-6xl mx-auto bg-white dark:bg-black rounded-lg shadow-lg p-6 h-full title-text"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* Keyboard */}
        <Keyboard 
          selectedLetters={lockedLetters}
          letterStates={letterStates}
        />

        {/* Main Content Container */}
        <div className="relative h-full flex items-center">
          
          {/* LifeBar */}
          <LifeBar 
            lives={lives} 
            maxLives={5}
            onLifeLost={() => console.log('Life lost!')}
          />

          {/* Left Section - Start of Dash */}
          <DashPlaceholder 
            startingLetters={lockedLetters}
            isGameActive={isGameStep}
            onLetterStatesChange={handleLetterStatesChange}
            onLifeLost={handleLifeLost}
            onGameWon={handleGameWon}
            onGameLost={handleGameLost}
            onShowMessage={showMessage}
          />

          {/* Center Section - Tutorial Content */}
          <div className="w-1/2 flex flex-col justify-center items-center text-center px-8">
            <div className="min-h-[200px] flex flex-col justify-center">
              {validSteps[currentStep]?.title && (
                <div 
                  className="text-lg title-text leading-relaxed text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ 
                    __html: validSteps[currentStep].title 
                  }} 
                />
              )}
              {validSteps[currentStep]?.content && (
                <div 
                  className="text-sm title-text leading-relaxed text-gray-800 dark:text-gray-200 mt-2"
                  dangerouslySetInnerHTML={{ 
                    __html: validSteps[currentStep].content 
                  }} 
                />
              )}
            </div>

            {/* Letter Selector */}
            {isLetterSelectionStep && (
              <div className="mt-8 w-full">
                <LetterSelector 
                  onLettersChange={handleLettersChange}
                  onLettersLocked={handleLettersLocked}
                  isActive={Boolean(isLetterSelectionStep)}
                  onShowMessage={showMessage}
                />
              </div>
            )}
          </div>

          {/* Right Section - Clue Placeholder with Toggleable Hints */}
          <CluePlaceholder 
            numbers={tutorialWords?.numbers_for_clue}
            showHints={false}
            gameState={isGameStep && gameState ? gameState : null}
            isGameActive={true}
          />
          
          {/* Navigation Chevrons - positioned to not overlap */}
          <button
            onClick={prevStep}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-10"
            aria-label="Previous step"
          >
            <ChevronLeftIcon size={24} className="text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={nextStep}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-10"
            aria-label="Next step"
          >
            <ChevronRightIcon size={24} className="text-gray-600 dark:text-gray-300" />
          </button>

          {/* Tutorial Progress Step indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {validSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep 
                    ? 'bg-purple-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Game Over Screens */}
      {showWinScreen && (
        <WinScreen
          onPlayAgain={resetGame}
          onGoToMainGame={goToMainGame}
          onClose={() => setShowWinScreen(false)}
        />
      )}

      {showLoseScreen && (
        <LoseScreen
          onRetryTutorial={resetGame}
          onGoToMainGame={goToMainGame}
          onClose={() => setShowLoseScreen(false)}
        />
      )}
    </div>
  );
}