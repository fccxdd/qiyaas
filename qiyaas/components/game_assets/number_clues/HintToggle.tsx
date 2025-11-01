"use client";

import React, { useState, useEffect } from 'react';
import hintMap from '@/data/hint_map.json';

interface HintToggleProps {
  numbers?: number[]; // optional static numbers
  hintsEnabled?: boolean;
  getNumbers?: () => { numbersForClue: number[] }; // optional dynamic function
}

const HintToggle: React.FC<HintToggleProps> = ({ hintsEnabled = true, numbers, getNumbers }) => { 
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

  // --- dynamic numbersForClue: either prop, function, or empty array ---
  const numbersForClue = numbers ?? getNumbers?.()?.numbersForClue ?? [];

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
      color: inherit;
      filter: none;
    }
    50% { 
      color: rgb(34, 197, 94);
      filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.5));
    }
  }

  @media (prefers-color-scheme: dark) {
    @keyframes pulseGlow {
      0%, 100% { 
        color: inherit;
        filter: none;
      }
      50% { 
        color: rgb(134, 239, 172);
        filter: drop-shadow(0 0 8px rgba(134, 239, 172, 0.5));
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
