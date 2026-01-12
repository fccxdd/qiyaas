// components/game_assets/keyboard/Keyboard.tsx

'use client';

import BackspaceIcon from '@mui/icons-material/Backspace';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useKeyPress } from '@/hooks/keyboard/useKeyPress';
import { GameConfig } from '@/lib/gameConfig';
import { LetterStatus, getKeyboardKeyClass } from '@/hooks/keyboard/KeyboardLetterTracker';

interface KeyboardProps {
  onKeyPress?: (key: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  disabled?: boolean;
  gameStarted?: boolean;
  letterStatus?: LetterStatus | Record<string, 'correct' | 'partial' | 'incorrect' | 'unused'>;
  awaitingLetterType?: 'vowel' | 'consonant' | null;
  clueLettersComplete?: boolean;
  isGameOver?: boolean;
  hasLostLifeForNoStartingLetters?: boolean;
}

export default function Keyboard({ 
  onKeyPress, 
  onBackspace, 
  onEnter,
  disabled = false,
  gameStarted = false,
  letterStatus = {},
  awaitingLetterType = null,
  clueLettersComplete = false,
  isGameOver = false,
  hasLostLifeForNoStartingLetters = false,
}: KeyboardProps) {
  const { pressedKey, handleKeyClick, handleBackspaceClick, handleEnterClick, isActuallyDisabled } = useKeyPress({
    onKeyPress,
    onBackspace,
    onEnter,
    disabled,
    gameStarted,
    awaitingLetterType,
    clueLettersComplete,
    isGameOver,
    hasLostLifeForNoStartingLetters
  });

  const rows = GameConfig.keyboardLayout;

  const renderKey = (key: string) => {
    const isSpecial = key === "ENTER" || key === "BACKSPACE";
    const Icon = key === "ENTER" ? KeyboardReturnIcon : key === "BACKSPACE" ? BackspaceIcon : null;

    const bgColorClass = getKeyboardKeyClass(key, letterStatus as LetterStatus);

    return (
      <button
        key={key}
        onClick={() => {
          if (isActuallyDisabled) return;
          if (key === "ENTER") handleEnterClick();
          else if (key === "BACKSPACE") handleBackspaceClick();
          else handleKeyClick(key);
        }}
        disabled={isActuallyDisabled}
        className={`keyboard-key cursor-pointer flex items-center justify-center font-bold uppercase rounded-md select-none
          ${bgColorClass}
          active:scale-95 transition-transform
          ${pressedKey === key ? 'scale-95 opacity-80' : ''}
          ${isSpecial ? 'flex-[1.3]' : 'flex-1'}
          ${isActuallyDisabled ? 'opacity-50 cursor-not-allowed' : ''} 
        `}
        style={{
          touchAction: 'manipulation',
        }}
      >
        {Icon ? <Icon className="keyboard-icon" /> : key}
      </button>
    );
  };

  return (
    <>
      <style jsx>{`
        /* Standard Breakpoints for keyboard sizing */
        
        /* Mobile devices (320px — 480px) */
        :global(.keyboard-key) {
          height: 3rem;
          font-size: 1rem;
        }
        :global(.keyboard-icon) {
          font-size: 1rem !important;
        }
        .keyboard-container {
          max-width: 500px;
          gap: 0.5rem;
          padding-top: 0.125rem;
          padding-bottom: 1rem;
        }
        .keyboard-row {
          gap: 0.5rem;
        }
        
        /* iPads, Tablets (481px — 768px) */
        @media screen and (min-width: 481px) and (max-width: 768px) {
          :global(.keyboard-key) {
            height: 2.5rem;
            font-size: 0.875rem;
          }
          :global(.keyboard-icon) {
            font-size: 1.25rem !important;
          }
          .keyboard-container {
            max-width: 550px;
            gap: 0.375rem;
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          .keyboard-row {
            gap: 0.375rem;
          }
        }
        
        /* Small screens, laptops - 13-inch (769px — 1024px) */
        @media screen and (min-width: 769px) and (max-width: 1024px) {
          :global(.keyboard-key) {
            height: 2.75rem;
            font-size: 1rem;
          }
          :global(.keyboard-icon) {
            font-size: 1.5rem !important;
          }
          .keyboard-container {
            max-width: 600px;
            gap: 0.5rem;
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
          .keyboard-row {
            gap: 0.5rem;
          }
        }
        
        /* Desktops, large screens - 15-inch+ (1025px — 1200px) */
        @media screen and (min-width: 1025px) and (max-width: 1200px) {
          :global(.keyboard-key) {
            height: 3rem;
            font-size: 1.0625rem;
          }
          :global(.keyboard-icon) {
            font-size: 1.625rem !important;
          }
          .keyboard-container {
            max-width: 650px;
            gap: 0.625rem;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .keyboard-row {
            gap: 0.5rem;
          }
        }
        
        /* Extra large screens (1201px and more) */
        @media screen and (min-width: 1201px) {
          :global(.keyboard-key) {
            height: 3.5rem;
            font-size: 1.25rem;
          }
          :global(.keyboard-icon) {
            font-size: 1.875rem !important;
          }
          .keyboard-container {
            max-width: 700px;
            gap: 0.75rem;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          .keyboard-row {
            gap: 0.75rem;
          }
        }
        
        /* High-DPI 13-inch laptops (Yoga, etc.) - needs smaller sizing */
        @media screen and (min-width: 1201px) and (max-width: 1400px) {
          :global(.keyboard-key) {
            height: 2.5rem;
            font-size: 1rem;
          }
          :global(.keyboard-icon) {
            font-size: 1.125rem !important;
          }
          .keyboard-container {
            max-width: 500px;
            gap: 0.375rem;
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          .keyboard-row {
            gap: 0.375rem;
          }
        }
      `}</style>
      
      <div className="keyboard-container w-full mx-auto px-1 sm:px-3 flex flex-col">
        {rows.map((row, i) => (
          <div key={i} className="keyboard-row flex justify-center w-full">
            {i === 1 && <div className="flex-[0.5]" />}
            {row.map(renderKey)}
            {i === 1 && <div className="flex-[0.5]" />}
          </div>
        ))}
      </div>
    </>
  );
}