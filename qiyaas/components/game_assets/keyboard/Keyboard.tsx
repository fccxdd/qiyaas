// components/game_assets/keyboard/Keyboard.tsx

'use client';

import BackspaceIcon from '@mui/icons-material/Backspace';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useKeyPress } from '@/hooks/keyboard/useKeyPress';
import { GameConfig } from '@/lib/gameConfig';

interface KeyboardProps {
  onKeyPress?: (key: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  disabled?: boolean;
}

export default function Keyboard({ 
  onKeyPress, 
  onBackspace, 
  onEnter,
  disabled = false
}: KeyboardProps) {
  const { pressedKey, handleKeyClick, handleBackspaceClick, handleEnterClick } = useKeyPress({
    onKeyPress,
    onBackspace,
    onEnter,
    disabled
  });

  const rows = GameConfig.keyboardLayout;

  const renderKey = (key: string) => {
    const isSpecial = key === "ENTER" || key === "BACKSPACE";
    const Icon = key === "ENTER" ? KeyboardReturnIcon : key === "BACKSPACE" ? BackspaceIcon : null;

    return (
      <button
        key={key}
        onClick={() => {
          if (disabled) return; // Block clicks when disabled
          if (key === "ENTER") handleEnterClick();
          else if (key === "BACKSPACE") handleBackspaceClick();
          else handleKeyClick(key);
        }}
        disabled={disabled} // Add HTML disabled attribute
        className={`flex items-center justify-center font-bold uppercase rounded-md select-none
          bg-gray-300 dark:bg-gray-700 text-black dark:text-white 
          active:scale-95 transition-transform
          ${pressedKey === key ? 'scale-95 bg-gray-400 dark:bg-gray-600' : ''}
          ${isSpecial ? 'flex-[1.3]' : 'flex-1'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
        `}
        style={{
          minHeight: '3rem',
          maxHeight: '4rem',
        }}
      >
        {Icon ? <Icon className="text-lg md:text-2xl" /> : key}
      </button>
    );
  };

  return (
    <div className="w-full max-w-[600px] md:max-w-[700px] mx-auto px-1 sm:px-3 py-3 flex flex-col sm:gap-4" style={{ gap: '14px' }}>
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center sm:gap-3 w-full" style={{ gap: '10px' }}>
          {i === 1 && <div className="flex-[0.5]" />} {/* Indent middle row */}
          {row.map(renderKey)}
          {i === 1 && <div className="flex-[0.5]" />} {/* Indent middle row */}
        </div>
      ))}
    </div>
  );
}