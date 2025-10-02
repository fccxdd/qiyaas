// components/CluePlaceholder.tsx

"use client"

import React, { useState, useEffect } from 'react';
import hintMap from '@/data/hint_map.json';

interface FlashingLetter {
  clue: number;
  position: number;
  color: string;
}

interface GameState {
  clueWords: string[];
  clueRevealed: boolean[][];
  clueGuesses: string[][];
  newlyRevealed?: boolean[][];
  currentClue: number;
  currentPosition: number;
  flashingLetters?: FlashingLetter[];
}

interface CluePlaceholderProps {
  numbers?: number[];
  showHints?: boolean;
  gameState?: GameState | null;
  currentClue?: number;
  currentPosition?: number;
  isGameActive?: boolean;
}

const CluePlaceholder: React.FC<CluePlaceholderProps> = ({ 
  numbers = [],
  showHints = false,
  gameState = null,
  isGameActive = false
}) => {
  
  // State for individual hint toggles (only used in game mode)
  const [individualHints, setIndividualHints] = useState([false, false, false]);

  // Debug logging
  console.log('CluePlaceholder props:', {
    showHints,
    isGameActive,
    hasGameState: !!gameState,
    numbers
  });

  // Reset individual hints when game mode changes
  useEffect(() => {
    if (!isGameActive) {
      setIndividualHints([false, false, false]);
    }
  }, [isGameActive]);

  const toggleIndividualHint = (index: number) => {
    console.log(`🎯 CLICK! Toggling hint for index ${index}, isGameActive: ${isGameActive}`);
    setIndividualHints(prev => {
      const newHints = prev.map((show, i) => i === index ? !show : show);
      console.log('Individual hints updated:', newHints);
      return newHints;
    });
  };
  
  // If we have game state, show the word dashes instead of just numbers
  const renderGameView = () => {
    if (!gameState || !gameState.clueWords) {
      console.log('No game state or clue words:', gameState);
      return null;
    }
    
    console.log('Rendering game view with state:', gameState);
    console.log('Clue guesses:', gameState.clueGuesses);
    
    return (
      <div className="w-full flex flex-col justify-center items-end pr-4 sm:pr-8 md:pr-20 space-y-4 sm:space-y-6 md:space-y-8">
        {gameState.clueWords.map((word: string, clueIndex: number) => (
          <div key={clueIndex} className="flex items-center justify-end space-x-1 sm:space-x-2">
            {/* Word dashes */}
            <div className="flex space-x-1">
              {Array.from(word).map((letter: string, letterIndex: number) => {
                const isRevealed = gameState.clueRevealed?.[clueIndex]?.[letterIndex];
                const isCurrentPosition = gameState.currentClue === clueIndex && gameState.currentPosition === letterIndex;
                const flashingLetter = gameState.flashingLetters?.find(
                  (fl: FlashingLetter) => fl.clue === clueIndex && fl.position === letterIndex
                );
                // Get the letter to display - either revealed letter or user input
                const userInputLetter = gameState.clueGuesses?.[clueIndex]?.[letterIndex] || '';
                const isNewlyRevealed = gameState.newlyRevealed?.[clueIndex]?.[letterIndex];
                
                console.log(`Clue ${clueIndex}, Position ${letterIndex}: userInputLetter = "${userInputLetter}", isRevealed = ${isRevealed}`);
                
                return (
                  <div
                    key={letterIndex}
                    className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-b-2 flex items-center justify-center text-sm sm:text-base md:text-lg font-bold transition-all duration-300 text-black dark:text-white ${
                      isCurrentPosition 
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-900 animate-pulse' 
                        : isNewlyRevealed
                        ? 'border-green-500 bg-green-100 dark:bg-green-900 animate-bounce' // Green animation for newly revealed
                        : isRevealed 
                        ? 'border-black dark:border-white' // Black/white for established letters
                        : userInputLetter
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' // Blue for user input
                        : 'border-gray-400' // Empty dash
                    } ${
                      flashingLetter 
                        ? `animate-pulse ${
                            flashingLetter.color === 'green' ? 'bg-green-200' :
                            flashingLetter.color === 'yellow' ? 'bg-yellow-200' :
                            'bg-red-200'
                          }` 
                        : ''
                    }`}
                  >
                    {userInputLetter}
                  </div>
                );
              })}
            </div>
            
            {/* Number and hint */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Clickable Number (only in game mode) */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`🖱️ Button clicked! Index: ${clueIndex}, isGameActive: ${isGameActive}`);
                  if (isGameActive) {
                    toggleIndividualHint(clueIndex);
                  } else {
                    console.log('Not in game mode, click ignored');
                  }
                }}
                className={`text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-200 ${
                  isGameActive 
                    ? 'text-black dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 active:scale-95' 
                    : 'text-black dark:text-white cursor-default'
                }`}
                style={{ fontFamily: 'Indie Flower, cursive' }}
                disabled={!isGameActive}
              >
                {numbers[clueIndex]}
              </button>
              
              {/* Hint Display - Fixed Logic */}
              {(() => {
                // Tutorial/Letter Selection mode: show hints automatically if showHints is true
                if (!isGameActive) {
                  return showHints && (
                    <div className="text-sm sm:text-base md:text-lg title-text text-green-400 font-mono px-2 py-1 rounded">
                      {hintMap[numbers[clueIndex]?.toString() as keyof typeof hintMap] || ''}
                    </div>
                  );
                }
                
                // Game mode: only show hints when individually clicked
                return individualHints[clueIndex] && (
                  <div className="text-sm sm:text-base md:text-lg title-text text-green-400 font-mono px-2 py-1 rounded animate-fadeIn">
                    {hintMap[numbers[clueIndex]?.toString() as keyof typeof hintMap] || ''}
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
        
        {/* Instructions for game mode */}
        {/* {isGameActive && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
            💡 Click numbers for hints
          </div>
        )} */}
        
        {/* Debug info */}
        {/* {isGameActive && (
          <div className="mt-2 text-xs text-red-500 bg-white p-1 rounded text-right">
            Game Active: {isGameActive.toString()}<br/>
            Individual Hints: [{individualHints.join(', ')}]
          </div>
        )} */}
      </div>
    );
  };

  // Regular tutorial view (just numbers and hints)
  const renderTutorialView = () => (
    <div className="w-1/4 flex flex-col justify-center items-end pr-4 sm:pr-8 md:pr-20">
      <div className="space-y-4 sm:space-y-6 md:space-y-8 text-right">
        {numbers.map((number, index) => (
          <div key={index} className="flex items-center justify-end space-x-3">
            {/* In tutorial mode, make numbers clickable if isGameActive is true */}
            {isGameActive ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`🖱️ Tutorial Button clicked! Index: ${index}, isGameActive: ${isGameActive}`);
                  toggleIndividualHint(index);
                }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white cursor-pointer hover:text-green-600 dark:hover:text-green-400 hover:scale-110 active:scale-95 transition-all duration-200"
                style={{ fontFamily: 'Indie Flower, cursive' }}
              >
                {number}
              </button>
            ) : (
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white">
                {number}
              </div>
            )}
            
            {/* Show hints based on mode */}
            {(() => {
              if (isGameActive) {
                // Game mode: only show if individually toggled
                return individualHints[index] && (
                  <div className="text-sm sm:text-base md:text-lg title-text text-green-400 font-mono px-2 py-1 rounded animate-fadeIn">
                    {hintMap[number.toString() as keyof typeof hintMap] || ''}
                  </div>
                );
              } else {
                // Tutorial mode: show if showHints is true
                return showHints && (
                  <div className="text-sm sm:text-base md:text-lg title-text text-green-400 font-mono px-2 py-1 rounded">
                    {hintMap[number.toString() as keyof typeof hintMap] || ''}
                  </div>
                );
              }
            })()}
          </div>
        ))}
        
        {/* Instructions and debug for game mode without gameState */}
        {/* {isGameActive && (
          <>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
              💡 Click numbers for hints
            </div>
            <div className="mt-1 text-xs text-red-500 bg-white p-1 rounded text-right">
              Game Active: {isGameActive.toString()}<br/>
              Individual Hints: [{individualHints.join(', ')}]<br/>
              No GameState - Using Tutorial View
            </div>
          </>
        )} */}
      </div>
    </div>
  );

  return gameState ? renderGameView() : renderTutorialView();
};

// Add the CSS animation styles
const styles = `
  @keyframes fadeIn {
    from { 
      opacity: 0; 
      transform: translateX(-10px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  if (!document.head.querySelector('style[data-component="CluePlaceholder"]')) {
    styleSheet.setAttribute('data-component', 'CluePlaceholder');
    document.head.appendChild(styleSheet);
  }
}

export default CluePlaceholder;