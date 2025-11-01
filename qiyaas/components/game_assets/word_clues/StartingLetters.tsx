// components/game_assets/word_clues/StartingLetters.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface StartingLettersProps {
  letters: string;
  onLettersChange?: (letters: string) => void;
  onShowMessage?: (message: string) => void;
  gameStarted?: boolean;
  lettersInClues?: Set<string>;
  onRevealComplete?: () => void; // Add this
}

export default function StartingLetters({ 
  letters, 
  gameStarted = false,
  lettersInClues = new Set(),
  onRevealComplete // Add this
}: StartingLettersProps) {
  // Track which letters have had their colors revealed
  const [revealedColors, setRevealedColors] = useState<Set<number>>(new Set());
  const hasStartedReveal = useRef(false);
  const currentLetters = useRef(letters);

  // Reset when letters change (new round)
  useEffect(() => {
    if (letters !== currentLetters.current) {
      setRevealedColors(new Set());
      hasStartedReveal.current = false;
      currentLetters.current = letters;
    }
  }, [letters]);

  // Sequentially reveal colors when game starts
  useEffect(() => {
    if (gameStarted && !hasStartedReveal.current && letters.length > 0) {
      hasStartedReveal.current = true;
      
      const letterArray = letters.split('');
      
      // Reveal each letter's color sequentially
      letterArray.forEach((_, index) => {
        setTimeout(() => {
          setRevealedColors(prev => new Set([...prev, index]));
          
          // Call onRevealComplete after the last letter
          if (index === letterArray.length - 1 && onRevealComplete) {
            setTimeout(() => {
              onRevealComplete();
            }, 500); // Wait for the color-reveal animation to finish
          }
        }, index * 500); // 500ms delay between each letter
      });
    }
  }, [gameStarted, letters, onRevealComplete]);

  // If game hasn't started, don't show colors
  if (!gameStarted) {
    return (
      <>
        <style jsx>{`
          @keyframes scale-in {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>

        <div className="flex flex-col gap-4">
          {/* Main 4 starting letters */}
          <div className="flex gap-3 sm:gap-4">
            {/* Filled letter slots */}
            {letters.split('').map((letter, index) => (
              <div
                key={index}
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full ${GameConfig.startingColors.default} flex items-center justify-center animate-[scale-in_0.2s_ease-out]`}
              >
                <span className="text-white text-xl sm:text-2xl md:text-3xl font-bold uppercase">
                  {letter}
                </span>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 4 - letters.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center"
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes color-reveal {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      <div className="flex flex-col gap-4">
        {/* Main 4 starting letters */}
        <div className="flex gap-3 sm:gap-4">
          {/* Filled letter slots */}
          {letters.split('').map((letter, index) => {
            const hasRevealedColor = revealedColors.has(index);
            const isInClue = lettersInClues.has(letter.toUpperCase());
            
            // Determine background color
            const bgColor = hasRevealedColor
              ? (isInClue ? GameConfig.startingColors.inClue : GameConfig.startingColors.notInClue)
              : GameConfig.startingColors.default;

            return (
              <div
                key={index}
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full ${bgColor} flex items-center justify-center transition-colors duration-500`}
                style={{
                  animation: hasRevealedColor && revealedColors.size === index + 1
                    ? 'color-reveal 0.5s ease-out'
                    : undefined
                }}
              >
                <span className="text-white text-xl sm:text-2xl md:text-3xl font-bold uppercase">
                  {letter}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}