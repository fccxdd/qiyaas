// components/game_assets/number_clues/HintToggle.tsx

"use client"

import React, { useState } from 'react';
import hintMap from '@/data/hint_map.json';
import { getNumbersForClue } from '@/components/game_assets/word_clues/ExtractAnswer';

interface HintToggleProps {
  numbers?: number[];
  hintsEnabled?: boolean;
}

const HintToggle: React.FC<HintToggleProps> = ({ hintsEnabled = true }) => { 

  const [hintsVisible, setHintsVisible] = useState<boolean[]>([]);

  const toggleHint = (index: number) => {
    if (!hintsEnabled) return; // Don't allow clicking if disabled
    
    setHintsVisible(prev => {
      const newHints = [...prev];
      newHints[index] = !newHints[index];
      return newHints;
    });
  };

  const { numbersForClue } = getNumbersForClue();

  return (
    <div className="flex flex-col justify-center items-start space-y-6 sm:space-y-8 relative">
      {numbersForClue.map((number, index) => (
        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-start space-y-1 sm:space-y-0 sm:space-x-2 relative">
          <button
            onClick={() => toggleHint(index)}
            disabled={!hintsEnabled}
            className={`text-base sm:text-2xl font-bold text-black dark:text-white transition-all duration-200 min-w-[20px] sm:min-w-[32px] text-left relative z-10 ${
              hintsEnabled 
                ? 'hover:text-green-400 hover:scale-110 active:scale-95 cursor-pointer' 
                : 'cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Indie Flower' }}
          >
            {number}
          </button>
          
          {hintsVisible[index] && hintsEnabled && (
            <>
            {/* TODO: Get rid of this mobile hint below number */}
              {/* Mobile: Hint below number */}
              <div className="sm:hidden text-[10px] text-green-400 font-mono px-2 py-1 rounded bg-black/90 backdrop-blur-sm animate-fadeIn border border-green-400/30 z-50 whitespace-nowrap">
                {hintMap[number.toString() as keyof typeof hintMap] || ''}
              </div>
              
              {/* Desktop: Hint to the right of number */}
              <div className="hidden sm:block absolute left-9 top-1/2 -translate-y-1/2 text-[10px] text-green-400 font-mono px-1.5 py-0.5 rounded bg-black/90 backdrop-blur-sm animate-fadeIn border border-green-400/30 z-50 whitespace-nowrap">
                {hintMap[number.toString() as keyof typeof hintMap] || ''}
              </div>
            </>
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