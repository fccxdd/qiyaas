// components/game_assets/number_clues/HintToggle.tsx

"use client"

import React, { useState } from 'react';
import hintMap from '@/data/hint_map.json';

interface HintToggleProps {
  numbers?: number[];
}

const HintToggle: React.FC<HintToggleProps> = ({ 
  numbers = []
}) => {
  const [hintsVisible, setHintsVisible] = useState<boolean[]>([]);

  const toggleHint = (index: number) => {
    setHintsVisible(prev => {
      const newHints = [...prev];
      newHints[index] = !newHints[index];
      return newHints;
    });
  };

  return (
    <div className="w-1/4 flex flex-col justify-center items-end pr-4 sm:pr-8 md:pr-20">
      <div className="space-y-4 sm:space-y-6 md:space-y-8 text-right">
        {numbers.map((number, index) => (
          <div key={index} className="flex items-center justify-end space-x-3">
            <button
              onClick={() => toggleHint(index)}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white cursor-pointer hover:text-green-600 dark:hover:text-green-400 hover:scale-110 active:scale-95 transition-all duration-200"
              style={{ fontFamily: 'Indie Flower, cursive' }}
            >
              {number}
            </button>
            
            {hintsVisible[index] && (
              <div className="text-sm sm:text-base md:text-lg text-green-400 font-mono px-2 py-1 rounded animate-fadeIn">
                {hintMap[number.toString() as keyof typeof hintMap] || ''}
              </div>
            )}
          </div>
        ))}
      </div>
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