// components/Keyboard.tsx

"use client"

import React, { useState, useEffect } from 'react';
import BackspaceIcon from '@mui/icons-material/Backspace';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

interface KeyboardProps {
  selectedLetters: string[];
  letterStates: { [key: string]: 'purple' | 'green' | 'red' | 'yellow' | 'grey' };
  onLetterClick?: (letter: string) => void;
  onEnterClick?: () => void;
  onBackspaceClick?: () => void;
}

const Keyboard: React.FC<KeyboardProps> = ({
  selectedLetters,
  letterStates,
  onLetterClick,
  onEnterClick,
  onBackspaceClick
}) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // Listen for physical keyboard presses to show visual feedback
  useEffect(() => {
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        setPressedKey(key);
        setTimeout(() => setPressedKey(null), 150);
      } else if (e.key === 'Enter') {
        setPressedKey('ENTER');
        setTimeout(() => setPressedKey(null), 150);
      } else if (e.key === 'Backspace') {
        setPressedKey('BACKSPACE');
        setTimeout(() => setPressedKey(null), 150);
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyDown);
    return () => window.removeEventListener('keydown', handlePhysicalKeyDown);
    }, []);

  const getLetterColor = (letter: string) => {
    const state = letterStates[letter];
    switch (state) {
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      case 'red':
        return 'bg-red-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      case 'grey':
        return 'bg-gray-400 text-gray-600';
      default:
        return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600';
    }
  };

  const handleKeyPress = (key: string, action?: () => void) => {
    setPressedKey(key);
    
    // For virtual keyboard clicks, simulate actual keyboard events
    if (action) {
      action();
    } else {
      // Simulate physical keyboard press by dispatching actual keyboard event
      const keyEvent = new KeyboardEvent('keydown', {
        key: key,
        code: `Key${key}`,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(keyEvent);
    }
    
    // Remove pressed effect after short delay
    setTimeout(() => {
      setPressedKey(null);
    }, 150);
  };

  const handleEnterPress = () => {
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(enterEvent);
  };

  const handleBackspacePress = () => {
    const backspaceEvent = new KeyboardEvent('keydown', {
      key: 'Backspace',
      code: 'Backspace',
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(backspaceEvent);
  };

  const getKeyPressedStyle = (key: string) => {
    return pressedKey === key 
      ? 'transform scale-95 shadow-inner' 
      : 'transform scale-100 shadow-md hover:shadow-lg';
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="space-y-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-3">
            {row.map((letter) => (
              <button
                key={letter}
                onMouseDown={() => handleKeyPress(letter)}
                onTouchStart={() => handleKeyPress(letter)}
                className={`w-8 h-8 rounded-full text-sm font-bold transition-all duration-150 select-none ${getLetterColor(letter)} ${getKeyPressedStyle(letter)} active:scale-95`}
                disabled={letterStates[letter] === 'grey'}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
        
        {/* Bottom row with Enter and Backspace */}
        <div className="flex justify-center space-x-2 mt-3">
          <button
            onMouseDown={() => handleKeyPress('BACKSPACE', handleBackspacePress)}
            onTouchStart={() => handleKeyPress('BACKSPACE', handleBackspacePress)}
            className={`px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-bold transition-all duration-150 select-none hover:bg-gray-300 dark:hover:bg-gray-600 ${getKeyPressedStyle('BACKSPACE')} active:scale-95`}
          >
            <BackspaceIcon/>
          </button>
          <button
            onMouseDown={() => handleKeyPress('ENTER', handleEnterPress)}
            onTouchStart={() => handleKeyPress('ENTER', handleEnterPress)}
            className={`px-4 py-2 bg-blue-500 text-white rounded text-sm font-bold transition-all duration-150 select-none hover:bg-blue-600 ${getKeyPressedStyle('ENTER')} active:scale-95`}
          >
            <KeyboardReturnIcon/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Keyboard;