// components/game_assets/word_clues/ClueLetter.tsx

'use client';

import { memo, useMemo } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface ClueLetterProps {
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
  isAutoRevealed?: boolean;
}

// Memoize the component to prevent unnecessary re-renders
const ClueLetter = memo(function ClueLetter({
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
  onClick,
  isAutoRevealed = false
}: ClueLetterProps) {
  
  // Show green dash if the dash has been revealed but the letter hasn't appeared yet
  // This keeps the dash green during the ENTIRE Phase 1, until Phase 2 reveals the letter
  const shouldShowGreenDash = isDashRevealed && !isRevealed;
  
  // Show letter when it's revealed (Phase 2)
  const shouldShowLetter = isRevealed;

  // Memoize class names to avoid recreating strings
  const dashColorClass = useMemo(() => {
    if (isComplete) return wordTypeColor;
    
    // GREEN DASH CHECK FIRST - before cursor!
    if (shouldShowGreenDash) return GameConfig.cursorColor.inClue;
    if (isCursor) return GameConfig.cursorColor.default;
    if (clueLettersComplete) return GameConfig.wordColors.default;
    return GameConfig.wordColors.default;
  }, [isComplete, isCursor, shouldShowGreenDash, clueLettersComplete, wordTypeColor]);

  const letterColorClass = useMemo(() => {
    if (isComplete) return wordTypeColor;
    
    // FIXED PRIORITY ORDER:
    // 1. Verified letters (correct position) → grey/white
    // 2. Sequence letters (from animation) → grey/white
    // 3. Auto-revealed (from loss) → grey/white
    // 4. User-typed (not verified) → purple
    
    if (isVerified || isSequenceLetterRevealed || isAutoRevealed) {
      return GameConfig.wordColors.default; // grey/white
    }
    
    if (isUserTyped) {
      return GameConfig.cursorColor.default; // purple
    }
    
    return GameConfig.wordColors.default;
  }, [isComplete, isVerified, isSequenceLetterRevealed, isAutoRevealed, isUserTyped, wordTypeColor]);

  // Memoize style objects to prevent prop changes
  const dashStyle = useMemo(() => 
    isCurrentlyAnimating ? { animation: 'dash-to-green 0.3s ease-out' } : undefined,
    [isCurrentlyAnimating]
  );

  const letterStyle = useMemo(() => 
    isBouncing 
      ? { animation: `bounce ${GameConfig.duration.greencursorDuration}ms ease-out` }
      : undefined,
    [isBouncing]
  );

  return (
    <>
      <style jsx>{`
        .dash-container {
          width: 24px;
          height: 36px;
        }
        .dash-text {
          font-size: 1.5rem;
        }
        .letter-text {
          font-size: 1.25rem;
        }
        
        @media screen and (min-width: 481px) and (max-width: 768px) {
          .dash-container {
            width: 26px;
            height: 38px;
          }
          .dash-text {
            font-size: 1.75rem;
          }
          .letter-text {
            font-size: 1.375rem;
          }
        }
        
        @media screen and (min-width: 769px) and (max-width: 1024px) {
          .dash-container {
            width: 28px;
            height: 40px;
          }
          .dash-text {
            font-size: 2rem;
          }
          .letter-text {
            font-size: 1.5rem;
          }
        }
        
        @media screen and (min-width: 1025px) and (max-width: 1200px) {
          .dash-container {
            width: 30px;
            height: 42px;
          }
          .dash-text {
            font-size: 2.25rem;
          }
          .letter-text {
            font-size: 1.625rem;
          }
        }
        
        @media screen and (min-width: 1201px) {
          .dash-container {
            width: 32px;
            height: 44px;
          }
          .dash-text {
            font-size: 2.5rem;
          }
          .letter-text {
            font-size: 1.75rem;
          }
        }
        
        @media screen and (min-width: 1201px) and (max-width: 1400px) {
          .dash-container {
            width: 24px;
            height: 36px;
          }
          .dash-text {
            font-size: 1.75rem;
          }
          .letter-text {
            font-size: 1.25rem;
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes dash-to-green {
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

      <div 
        className="dash-container relative flex items-end justify-center cursor-pointer"
        onClick={onClick}
      >
        {/* The dash underscore */}
        <span
          className={`dash-text font-bold leading-none transition-all duration-300 ${dashColorClass}`}
          style={dashStyle}
        >
          _
        </span>

        {/* Letter (appears above dash) */}
        {shouldShowLetter && (
          <span
            onClick={onClick}
            className={`letter-text absolute bottom-4 left-1/2 -translate-x-1/2 font-bold leading-none transition-all duration-300 cursor-pointer ${letterColorClass}`}
            style={letterStyle}
          >
            {letter?.toUpperCase()}
          </span>
        )}
      </div>
    </>
  );
});

export default ClueLetter;