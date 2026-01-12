// components/game_assets/game_walkthrough/ExampleWordsDisplay.jsx

'use client';

import { GameConfig } from '@/lib/gameConfig';

export default function ExampleWordsDisplay() {
  return (
    <div className="rounded-lg sm:rounded-xl p-2 sm:p-4 w-full">
      <div className="grid grid-cols-2 gap-12 sm:gap-24 text-sm sm:text-3xl">
        {/* Left column - words */}
        <div className="space-y-2 sm:space-y-4">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <span className={`${GameConfig.wordColors_bg.adjective} inline-block text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xl sm:text-3xl font-bold`}>S</span>
            <span className="text-xl sm:text-3xl">MART</span>
            <h3 className={`${GameConfig.wordColors.adjective} text-lg sm:text-2xl`}>a</h3>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <span className={`${GameConfig.wordColors_bg.verb} inline-block text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xl sm:text-3xl font-bold`}>A</span>
            <span className="text-xl sm:text-3xl">RRIVE</span>
            <h3 className={`${GameConfig.wordColors.verb} text-lg sm:text-2xl`}>v</h3>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <span className={`${GameConfig.wordColors_bg.noun} inline-block text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xl sm:text-3xl font-bold`}>HONEY</span>
            <h3 className={`${GameConfig.wordColors.noun} text-lg sm:text-2xl`}>n</h3>
          </div>
        </div>

        {/* Right column - clues */}
        <div className="space-y-2 sm:space-y-4 text-black dark:text-white text-xl sm:text-3xl text-center">
          <div>7 = G , <span className={`${GameConfig.wordColors_bg.adjective} inline-block text-white px-1.5 sm:px-2 py-0.5 rounded text-xl sm:text-3xl`}>S</span></div>
          <div>1 = <span className={`${GameConfig.wordColors_bg.verb} inline-block text-white px-1.5 sm:px-2 py-0.5 rounded text-xl sm:text-3xl`}>A</span> , O</div>
          <div><span className={`${GameConfig.wordColors_bg.noun} inline-block text-white px-1.5 sm:px-2 py-0.5 rounded text-xl sm:text-3xl`}>5</span> = E , F</div>
        </div>
      </div>
    </div>
  );
}