// components/Keyboard.tsx

"use client"

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Delete, CornerDownLeft } from 'lucide-react';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    letterSelectorInput?: (type: string, value: string | null) => void;
    gameState?: {
      usedLetters: Set<string>;
      availableLetters: Set<string>;
    };
  }
}

const MinimalistKeyboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const keyRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // Get keyboard color based on game state
  const getKeyColor = (keyValue: string): string => {
    // Check if there's game state available
    if (window.gameState?.usedLetters && window.gameState?.availableLetters) {
      const { usedLetters, availableLetters } = window.gameState;
      
      if (usedLetters.has(keyValue)) {
        return 'grey'; // Used/correct or invalid
      } else if (availableLetters.has(keyValue)) {
        return 'yellow'; // Still available
      }
    }
    
    return 'default'; // Default color
  };

  const handleKeyPress = (key: string) => {
    if (key === 'ENTER') {
      setInputValue(prev => prev + '\n');
    } else if (key === 'BACKSPACE') {
      setInputValue(prev => prev.slice(0, -1));
    } else if (key === 'CLEAR') {
      setInputValue('');
    } else {
      setInputValue(prev => prev + key.toLowerCase());
    }
  };

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key: string = event.key.toUpperCase();
      
      // Prevent space key entirely - block it completely
      if (key === ' ' || key === 'SPACE') {
        event.preventDefault();
        return; // Exit early, don't process space at all
      }
      
      // Add to pressed keys for visual feedback
      setPressedKeys(prev => new Set([...prev, key]));
      
      // Handle special keys
      if (key === 'BACKSPACE') {
        event.preventDefault(); // Prevent default for special keys
        handleKeyPress('BACKSPACE');
      } else if (key === 'ENTER') {
        event.preventDefault(); // Prevent default for special keys
        handleKeyPress('ENTER');
      } else if (key === 'ESCAPE') {
        event.preventDefault(); // Prevent default for special keys
        handleKeyPress('CLEAR');
      } else if (/^[A-Z]$/.test(key)) {
        event.preventDefault(); // Prevent default for letters
        // Only handle A-Z letters
        handleKeyPress(key);
      }
      // Don't prevent default for other keys we don't handle
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key: string = event.key.toUpperCase();
      // Remove from pressed keys
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const KeyButton = ({ keyValue, isSpecial = false, width = 'w-12' }: {
    keyValue: string;
    isSpecial?: boolean;
    width?: string;
  }) => {
    const isPressed = pressedKeys.has(keyValue) || 
                     (keyValue === 'ENTER' && pressedKeys.has('ENTER')) ||
                     (keyValue === 'BACKSPACE' && pressedKeys.has('BACKSPACE'));
    
    const isEnterKey = keyValue === 'ENTER';
    const keyColor = getKeyColor(keyValue);
    
    // Determine button styling based on key color
    let buttonStyles = '';
    if (!isSpecial && /^[A-Z]$/.test(keyValue)) {
      switch (keyColor) {
        case 'grey':
          buttonStyles = isPressed 
            ? 'bg-gray-600 text-white scale-95'
            : 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 hover:scale-105 active:scale-95';
          break;
        case 'yellow':
          buttonStyles = isPressed 
            ? 'bg-yellow-600 text-black scale-95'
            : 'bg-yellow-400 text-black hover:bg-yellow-500 active:bg-yellow-600 hover:scale-105 active:scale-95';
          break;
        default:
          buttonStyles = isPressed 
            ? 'bg-gray-400 text-black scale-95'
            : 'bg-white text-black hover:bg-gray-200 active:bg-gray-300 hover:scale-105 active:scale-95';
      }
    } else {
      // Special keys (Enter, Backspace, etc.)
      buttonStyles = isPressed 
        ? isEnterKey
          ? 'bg-green-700 text-white scale-95'
          : 'bg-gray-400 text-black scale-95'
        : isEnterKey
          ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 hover:scale-105 active:scale-95'
          : 'bg-white text-black hover:bg-gray-200 active:bg-gray-300 hover:scale-105 active:scale-95';
    }
    
    return (
      <button
        onClick={() => handleKeyPress(keyValue)}
        className={`${width} h-12 rounded-full font-semibold text-lg transition-all duration-150 transform shadow-lg flex items-center justify-center ${buttonStyles}`}
      >
        {keyValue === 'ENTER' ? <CornerDownLeft size={20} /> : keyValue === 'BACKSPACE' ? <Delete size={20} /> : keyValue}
      </button>
    );
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black rounded-2xl p-6 shadow-2xl border border-gray-800 max-w-4xl">
        {/* Header with collapse button */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Input display */}
        {!isCollapsed && (
          <div className="mb-6">
            <div className="bg-gray-900 rounded-lg p-3 min-h-[50px] text-white font-mono text-lg border border-gray-700 whitespace-pre-wrap break-words">
              {inputValue || <span className="text-gray-500">Type with physical or virtual keyboard...</span>}
            </div>
          </div>
        )}

        {/* Keyboard */}
        {!isCollapsed && (
          <div className="space-y-3">
            {/* First row - QWERTY */}
            <div className="flex justify-center gap-2">
              {keyRows[0].map((key) => (
                <KeyButton key={key} keyValue={key} />
              ))}
            </div>

            {/* Second row - ASDF */}
            <div className="flex justify-center gap-2">
              {keyRows[1].map((key) => (
                <KeyButton key={key} keyValue={key} />
              ))}
            </div>

            {/* Third row - ZXCV */}
            <div className="flex justify-center gap-2">
              {keyRows[2].map((key) => (
                <KeyButton key={key} keyValue={key} />
              ))}
            </div>

            {/* Bottom row - Enter and special keys */}
            <div className="flex justify-center gap-2 mt-4">
              <KeyButton keyValue="BACKSPACE" width="w-24" />
              <KeyButton keyValue="ENTER" width="w-32" />
              <button
                onClick={() => handleKeyPress('CLEAR')}
                className={`w-20 h-12 rounded-full font-semibold text-sm transition-all duration-150 transform shadow-lg ${
                  pressedKeys.has('ESCAPE')
                    ? 'bg-red-800 text-white scale-95'
                    : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 hover:scale-105 active:scale-95'
                }`}
              >
                CLEAR
              </button>
            </div>
          </div>
        )}

        {/* Collapsed state */}
        {isCollapsed && (
          <div className="text-center text-gray-400 text-sm py-2">
            Keyboard minimized - click to expand
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalistKeyboard;