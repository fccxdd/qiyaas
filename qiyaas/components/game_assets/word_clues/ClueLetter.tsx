// components/game_assets/word_clues/ClueLetter.tsx

'use client';

import { GameConfig } from '@/lib/gameConfig';

interface DashLetterProps {
  letter?: string;
  isRevealed: boolean;
  isCursor: boolean;
  isVerified: boolean;
  isSequenceLetterRevealed: boolean;
  isDashRevealed: boolean;
  isCurrentlyAnimating: boolean;
  isComplete: boolean;
  isUserTyped: boolean;
  isBouncing: boolean;
  clueLettersComplete: boolean;
  wordTypeColor: string;
  onClick: () => void;
}

export default function DashLetter({
  letter,
  isRevealed,
  isCursor,
  isVerified,
  isSequenceLetterRevealed,
  isDashRevealed,
  isCurrentlyAnimating,
  isComplete,
  isUserTyped,
  isBouncing,
  clueLettersComplete,
  wordTypeColor,
  onClick
}: DashLetterProps) {
  
  const shouldShowGreenDash = isDashRevealed && !isSequenceLetterRevealed;
  const shouldShowLetter = isRevealed;

  const getDashColor = () => {
    if (isComplete) return wordTypeColor;
    if (isCursor) return GameConfig.cursorColor.default;
    if (shouldShowGreenDash) return GameConfig.cursorColor.inClue;
    if (clueLettersComplete) return 'text-black dark:text-white';
    return 'text-black dark:text-white';
  };

  const getLetterColor = () => {
    if (isComplete) return wordTypeColor;
    if (isVerified || isSequenceLetterRevealed) {
      return 'text-black dark:text-white';
    }
    if (isUserTyped) {
      return GameConfig.cursorColor.default;
    }
    return 'text-black dark:text-white';
  };

  return (
    <>


      <div 
        className="dash-container relative flex items-end justify-center cursor-pointer"
        onClick={onClick}
      >
        <span
          className={`dash-text font-bold leading-none transition-all duration-300 ${getDashColor()}`}
          style={{
            animation: isCurrentlyAnimating ? 'dash-to-green 0.3s ease-out' : undefined
          }}
        >
          _
        </span>

        {shouldShowLetter && (
          <span
            onClick={onClick}
            className={`letter-text absolute bottom-4 left-1/2 -translate-x-1/2 font-bold leading-none transition-all duration-300 cursor-pointer ${getLetterColor()}`}
            style={{
              animation: isBouncing ? `bounce ${GameConfig.duration.bounceDuration}ms ease-out` : 'none'
            }}
          >
            {letter?.toUpperCase()}
          </span>
        )}
      </div>
    </>
  );
}