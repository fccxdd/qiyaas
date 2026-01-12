// components/game_assets/game_walkthrough/components/PendingAdditionalLetters.jsx

'use client';

import { GameConfig } from '@/lib/gameConfig';

export default function PendingAdditionalLetters() {
  return (
    <div className="flex gap-3 sm:gap-4">
      {/* +V (Vowel) */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 border-dashed ${GameConfig.additionalColors.unselectedLetter} flex items-center justify-center font-bold text-base sm:text-lg md:text-xl cursor-pointer hover:border-solid hover:${GameConfig.additionalColors.selectedLetter} hover:scale-105 active:scale-95 transition-all animate-pulse`}
        >
          <span className={`${GameConfig.additionalColors.vowel} font-bold`}>
            +V
          </span>
        </div>
      </div>

      {/* +C (Consonant) */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 border-dashed ${GameConfig.additionalColors.unselectedLetter} flex items-center justify-center font-bold text-base sm:text-lg md:text-xl cursor-pointer hover:border-solid hover:${GameConfig.additionalColors.selectedLetter} hover:scale-105 active:scale-95 transition-all animate-pulse`}
        >
          <span className={`${GameConfig.additionalColors.consonant} font-bold`}>
            +C
          </span>
        </div>
      </div>
    </div>
  );
}