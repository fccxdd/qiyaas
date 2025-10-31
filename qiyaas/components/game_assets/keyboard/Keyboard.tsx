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
  letterStatus?: LetterStatus;
  awaitingLetterType?: 'vowel' | 'consonant' | null;
}

export default function Keyboard({ 
  onKeyPress, 
  onBackspace, 
  onEnter,
  disabled = false,
  gameStarted = false,
  letterStatus = {},
  awaitingLetterType = null
}: KeyboardProps) {
  const { pressedKey, handleKeyClick, handleBackspaceClick, handleEnterClick } = useKeyPress({
    onKeyPress,
    onBackspace,
    onEnter,
    disabled,
    gameStarted,
    awaitingLetterType
  });

  const rows = GameConfig.keyboardLayout;

  const renderKey = (key: string) => {
    const isSpecial = key === "ENTER" || key === "BACKSPACE";
    const Icon = key === "ENTER" ? KeyboardReturnIcon : key === "BACKSPACE" ? BackspaceIcon : null;

    // Get the appropriate background color class based on letter status
    const bgColorClass = getKeyboardKeyClass(key, letterStatus);

    // FIXED: Only disable if disabled=true AND not awaiting letter type
    const isKeyDisabled = disabled && !awaitingLetterType;

    return (
      <button
        key={key}
        onClick={() => {
          // FIXED: Check isKeyDisabled instead of just disabled
          if (isKeyDisabled) return;
          if (key === "ENTER") handleEnterClick();
          else if (key === "BACKSPACE") handleBackspaceClick();
          else handleKeyClick(key);
        }}
        disabled={isKeyDisabled}
        className={`flex items-center justify-center font-bold uppercase rounded-md select-none
          ${bgColorClass}
          active:scale-95 transition-transform
          ${pressedKey === key ? 'scale-95 opacity-80' : ''}
          ${isSpecial ? 'flex-[1.3]' : 'flex-1'}
          ${isKeyDisabled ? 'opacity-50 cursor-not-allowed' : ''} 
        `}
        style={{
          height: 'clamp(1.875rem, 7vh, 3.5rem)',
          fontSize: 'clamp(0.7rem, 2vh, 1.25rem)',
          touchAction: 'manipulation',
        }}
      >
        {Icon ? <Icon style={{ fontSize: 'clamp(1rem, 3vh, 1.875rem)' }} /> : key}
      </button>
    );
  };

  return (
    <div className="w-full max-w-[600px] md:max-w-[700px] mx-auto px-1 sm:px-3 flex flex-col" 
         style={{ 
           gap: 'clamp(0.2rem, 0.8vh, 1rem)',
           paddingTop: 'clamp(0.1rem, 0.3vh, 0.75rem)',
           paddingBottom: 'clamp(0.1rem, 0.3vh, 0.75rem)'
         }}>
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center w-full" style={{ gap: 'clamp(0.375rem, 1vw, 0.75rem)' }}>
          {i === 1 && <div className="flex-[0.5]" />}
          {row.map(renderKey)}
          {i === 1 && <div className="flex-[0.5]" />}
        </div>
      ))}
    </div>
  );
}