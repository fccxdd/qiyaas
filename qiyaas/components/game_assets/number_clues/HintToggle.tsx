"use client";

import React, { useState, useEffect } from 'react';
import hintMap from '@/data/hint_map.json';
import { GameConfig } from '@/lib/gameConfig';

interface HintToggleProps {
  numbers?: number[]; // optional static numbers
  wordTypes?: string[]; // NEW: word types (NOUN, VERB, ADJECTIVE)
  hintsEnabled?: boolean;
  onToggle?: (enabled: boolean) => void; // callback to update parent state
  getNumbers?: () => { numbersForClue: number[] }; // optional dynamic function
}

const HintToggle: React.FC<HintToggleProps> = ({ 
  hintsEnabled = true, 
  onToggle, 
  numbers, 
  wordTypes, // NEW: Receive word types
  getNumbers 
}) => { 
  const [hintsVisible, setHintsVisible] = useState<boolean[]>([]);
  const [hintsOpacity, setHintsOpacity] = useState<boolean[]>([]);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const toggleHint = (index: number) => {
    if (!hintsEnabled) return;

    setHasBeenClicked(true);
    setShouldPulse(false);

    if (hintsVisible[index]) {
      // Closing hint
      setHintsOpacity(prev => { const newOpacity = [...prev]; newOpacity[index] = false; return newOpacity; });
      setTimeout(() => { setHintsVisible(prev => { const newHints = [...prev]; newHints[index] = false; return newHints; }); }, 400);
    } else {
      // Opening hint
      setHintsVisible(prev => { const newHints = [...prev]; newHints[index] = true; return newHints; });
      setTimeout(() => { setHintsOpacity(prev => { const newOpacity = [...prev]; newOpacity[index] = true; return newOpacity; }); }, 10);
    }
  };

  // NEW: Get color class based on word type
  const getWordTypeColor = (type?: string) => {
    if (!type) return 'text-black dark:text-white';
    
    switch (type.toUpperCase()) {
      case 'NOUN':
        return GameConfig.wordColors.noun;
      case 'VERB':
        return GameConfig.wordColors.verb;
      case 'ADJECTIVE':
        return GameConfig.wordColors.adjective;
      default:
        return 'text-black dark:text-white';
    }
  };

  // NEW: Get hover color based on word type (lighter version)
  const getHoverColor = (type?: string) => {
    if (!type) return 'hover:text-green-700 dark:hover:text-green-400';
    
    switch (type.toUpperCase()) {
      case 'NOUN':
        return 'hover:opacity-80';
      case 'VERB':
        return 'hover:opacity-80';
      case 'ADJECTIVE':
        return 'hover:opacity-80';
      default:
        return 'hover:text-green-700 dark:hover:text-green-400';
    }
  };

  // --- dynamic numbersForClue: either prop, function, or empty array ---
  const numbersForClue = numbers ?? getNumbers?.()?.numbersForClue ?? [];

  // Reset hints when the numbers change (new round)
  useEffect(() => {
    setHintsVisible([]);
    setHintsOpacity([]);
  }, [JSON.stringify(numbersForClue)]); // Reset when numbers change

  // Trigger pulse animation only when hints become enabled
  useEffect(() => {
    if (hintsEnabled && !hasBeenClicked) {
      const pulseTimer = setTimeout(() => {
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 2000); // stop after one pulse cycle
      }, 3000); // wait 3s before starting pulse
      return () => clearTimeout(pulseTimer);
    }
  }, [hintsEnabled, hasBeenClicked]);

  // Reset hints visibility when hintsEnabled changes from parent
  useEffect(() => {
    if (!hintsEnabled) {
      setHintsVisible([]);
      setHintsOpacity([]);
    }
  }, [hintsEnabled]);

  return (
    <div className="flex flex-col justify-center items-start space-y-6 sm:space-y-8 relative">
      {numbersForClue.map((number, index) => {
        // Get the word type for this hint
        const wordType = wordTypes?.[index];
        const colorClass = getWordTypeColor(wordType);
        const hoverClass = getHoverColor(wordType);
        
        return (
          <div key={index} className="flex items-center relative">
            <button
              onClick={() => toggleHint(index)}
              disabled={!hintsEnabled}
              className={`text-3xl md:text-5xl font-bold min-w-[20px] sm:min-w-[32px] text-left relative z-10 transition-all duration-500 ease-in-out ${
                colorClass
              } ${
                shouldPulse ? 'animate-pulse-glow' : ''
              } ${
                hintsEnabled 
                  ? `${hoverClass} hover:scale-110 active:scale-95 cursor-pointer` 
                  : 'cursor-not-allowed'
              }`}
              style={{ fontFamily: 'Indie Flower' }}
            >
              {number}
            </button>

            {hintsVisible[index] && hintsEnabled && (
              <div className={`text-base sm:text-xl md:text-2xl font-mono px-2 py-1 rounded backdrop-blur-sm z-50 whitespace-nowrap ml-2 sm:ml-3 transition-all duration-500 ease-in-out max-w-[120px] sm:max-w-none overflow-hidden text-ellipsis ${
                colorClass
              } ${
                hintsOpacity[index] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
                {hintMap[number.toString() as keyof typeof hintMap] || ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- CSS animations ---
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes pulseGlow {
    0%, 100% { 
      filter: none;
    }
    50% { 
      filter: drop-shadow(0 0 8px currentColor);
    }
  }

  .animate-pulse-glow {
    animation: pulseGlow 2s ease-in-out;
  }

  .smooth-scale {
    transition: transform 2s ease-out, color 0.2s ease;
  }

  .smooth-scale:active {
    transition: transform 0.15s ease-out;
  }
`;

// inject styles once
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  if (!document.head.querySelector('style[data-component="HintToggle"]')) {
    styleSheet.setAttribute('data-component', 'HintToggle');
    document.head.appendChild(styleSheet);
  }
}

export default HintToggle;