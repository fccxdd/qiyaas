// components/game_assets/number_clues/HintToggle.tsx

"use client"

import React, { useState, useEffect } from 'react';
import hintMap from '@/data/hint_map.json';
import { getNumbersForClue } from '@/components/game_assets/word_clues/ExtractAnswer';

interface HintToggleProps {
  numbers?: number[];
  hintsEnabled?: boolean;
}

const HintToggle: React.FC<HintToggleProps> = ({ hintsEnabled = true }) => { 

  const [hintsVisible, setHintsVisible] = useState<boolean[]>([]);
  const [hintsOpacity, setHintsOpacity] = useState<boolean[]>([]);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const toggleHint = (index: number) => {
    if (!hintsEnabled) return;
    
    setHasBeenClicked(true);
    setShouldPulse(false);
    
    if (hintsVisible[index]) {
      // Closing: fade out hint
      setHintsOpacity(prev => {
        const newOpacity = [...prev];
        newOpacity[index] = false;
        return newOpacity;
      });
      
      // Then remove after transition
      setTimeout(() => {
        setHintsVisible(prev => {
          const newHints = [...prev];
          newHints[index] = false;
          return newHints;
        });
      }, 400);
    } else {
      // Opening: show immediately, then fade in
      setHintsVisible(prev => {
        const newHints = [...prev];
        newHints[index] = true;
        return newHints;
      });
      
      setTimeout(() => {
        setHintsOpacity(prev => {
          const newOpacity = [...prev];
          newOpacity[index] = true;
          return newOpacity;
        });
      }, 10);
    }
  };

  const { numbersForClue } = getNumbersForClue();

  // Trigger pulse animation only when hints become enabled (game starts)
  useEffect(() => {
    if (hintsEnabled && !hasBeenClicked) {
      const pulseTimer = setTimeout(() => {
        setShouldPulse(true);
        // Stop pulsing after animation completes
        setTimeout(() => {
          setShouldPulse(false);
        }, 2000); // Duration of one pulse cycle
      }, 3000); // Wait 3s before starting pulse

      return () => clearTimeout(pulseTimer);
    }
  }, [hintsEnabled, hasBeenClicked, shouldPulse]); // Added shouldPulse to dependencies to retrigger

  return (
    <div className="flex flex-col justify-center items-start space-y-6 sm:space-y-8 relative">
      {numbersForClue.map((number, index) => (
        <div key={index} className="flex items-center relative">
          <button
            onClick={() => toggleHint(index)}
            disabled={!hintsEnabled}
            className={`text-3xl md:text-5xl font-bold text-black dark:text-white min-w-[20px] sm:min-w-[32px] text-left relative z-10 transition-all duration-500 ease-in-out ${
              shouldPulse ? 'animate-pulse-glow' : ''
            } ${
              hintsEnabled 
                ? 'hover:text-green-700 dark:hover:text-green-400 hover:scale-110 active:scale-95 cursor-pointer' 
                : 'cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Indie Flower' }}
          >
            {number}
          </button>
          
          {/* FIXED: Added max-width and text truncation for mobile to prevent overlap */}
          {hintsVisible[index] && hintsEnabled && (
            <div className={`text-base sm:text-xl md:text-2xl text-green-700 dark:text-green-400 font-mono px-2 py-1 rounded backdrop-blur-sm z-50 whitespace-nowrap ml-2 sm:ml-3 transition-all duration-500 ease-in-out max-w-[120px] sm:max-w-none overflow-hidden text-ellipsis ${
              hintsOpacity[index] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
              {hintMap[number.toString() as keyof typeof hintMap] || ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

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
      color: inherit;
      text-shadow: none;
    }
    50% { 
      color: rgb(20, 83, 45);
      text-shadow: 0 0 8px rgba(22, 101, 52, 0.3),
                   0 0 12px rgba(22, 101, 52, 0.15);
    }
  }
  
  @media (prefers-color-scheme: dark) {
    @keyframes pulseGlow {
      0%, 100% { 
        color: inherit;
        text-shadow: none;
      }
      50% { 
        color: rgb(74, 222, 128);
        text-shadow: 0 0 8px rgba(74, 222, 128, 0.3),
                     0 0 12px rgba(74, 222, 128, 0.15);
      }
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

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  if (!document.head.querySelector('style[data-component="HintToggle"]')) {
    styleSheet.setAttribute('data-component', 'HintToggle');
    document.head.appendChild(styleSheet);
  }
}

export default HintToggle;