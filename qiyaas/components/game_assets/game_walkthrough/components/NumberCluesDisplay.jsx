// components/game_assets/game_walkthrough/components/NumberCluesDisplay.jsx

'use client';

import { GameConfig } from '@/lib/gameConfig';

export default function NumberCluesDisplay() {
  // Example numbers for the tutorial (representing the three clues)
  const exampleNumbers = [5, 1, 7];
  const wordTypes = ['NOUN', 'VERB', 'ADJECTIVE'];

  const getWordTypeColor = (type) => {
    switch (type.toUpperCase()) {
      case 'NOUN':
        return GameConfig.wordColors.noun;
      case 'VERB':
        return GameConfig.wordColors.verb;
      case 'ADJECTIVE':
        return GameConfig.wordColors.adjective;
      default:
        return GameConfig.wordColors.default;
    }
  };

  return (
    <div className="hint-container flex flex-col justify-center items-start gap-2">
      {exampleNumbers.map((number, index) => {
        const wordType = wordTypes[index];
        const colorClass = getWordTypeColor(wordType);

        return (
          <div key={index} className="flex items-center relative">
            <div
              className={`hint-number relative z-10 transition-all duration-500 ease-in-out rounded-lg ${colorClass} font-bold`}
              style={{ fontFamily: 'Indie Flower' }}
            >
              {number}
            </div>
          </div>
        );
      })}
    </div>
  );
}