// components/CluePlaceholder.tsx

"use client"

import React from 'react';
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
}

const CluePlaceholder: React.FC<CluePlaceholderProps> = ({ 
  numbers = [],
  showHints = false,
  gameState = null
}) => {
  
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
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white">
                {numbers[clueIndex]}
              </div>
              
              {showHints && (
                <div className="text-sm sm:text-base md:text-lg text-green-400 font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
                  {hintMap[numbers[clueIndex]?.toString() as keyof typeof hintMap] || ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Regular tutorial view (just numbers and hints)
  const renderTutorialView = () => (
    <div className="w-1/4 flex flex-col justify-center items-end pr-4 sm:pr-8 md:pr-20">
      <div className="space-y-4 sm:space-y-6 md:space-y-8 text-right">
        {numbers.map((number, index) => (
          <div key={index} className="flex items-center justify-end space-x-3">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white">
              {number}
            </div>
            
            {showHints && (
              <div className="text-sm sm:text-base md:text-lg text-green-400 font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
                {hintMap[number.toString() as keyof typeof hintMap] || ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return gameState ? renderGameView() : renderTutorialView();
};

export default CluePlaceholder;