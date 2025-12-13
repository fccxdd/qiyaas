// components/game_assets/word_clues/StartingLetters.tsx

'use client';

import { GameConfig } from '@/lib/gameConfig';

interface StartingLettersProps {
  letters: string;
  onLettersChange?: (letters: string) => void;
  onShowMessage?: (message: string) => void;
  gameStarted?: boolean;
  lettersInClues?: Set<string>;
  revealedColors?: Set<number>;
}

export default function StartingLetters({ 
  letters, 
  gameStarted = false,
  lettersInClues = new Set(),
  revealedColors = new Set(),
}: StartingLettersProps) {

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
            {Array.from({ length: GameConfig.startingLettersNumber - letters.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full border-2 border-dashed ${GameConfig.startingColors.beforeGameBegins} flex items-center justify-center`}
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
            const letterUpper = letter.toUpperCase();
            const isInClue = lettersInClues.has(letterUpper);
            
            // Determine background color
            const bgColor = hasRevealedColor
              ? (isInClue ? GameConfig.startingColors.inClue : GameConfig.startingColors.notInClue)
              : GameConfig.startingColors.default;

            // Check if this is the letter currently being revealed
            const isCurrentlyRevealing = hasRevealedColor && 
              revealedColors.size === index + 1;

            // Calculate delay for staggered reveal (in milliseconds)
            const revealDelay = index * GameConfig.duration.startingLetterBounceDelay;

            return (
              <div
                key={index}
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full ${bgColor} flex items-center justify-center`}
                style={{
                  transitionProperty: 'background-color',
                  transitionDuration: `${GameConfig.duration.startingLetterColorReveal}ms`,
                  transitionDelay: hasRevealedColor ? `${revealDelay}ms` : '0ms',
                  animation: isCurrentlyRevealing
                    ? `color-reveal ${GameConfig.duration.startingLetterBounceDelay}ms ease-out ${revealDelay}ms`
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