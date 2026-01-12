// components/game_assets/game_walkthrough/components/EmptyLetterSlots.jsx

'use client';

import { GameConfig } from '@/lib/gameConfig';

export default function EmptyStartingLetters() {
  return (
    <div className="flex gap-3 sm:gap-4 ">
      {Array.from({ length: GameConfig.startingLettersNumber }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className={`w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full border-2 border-dashed ${GameConfig.startingColors.beforeGameBegins} flex items-center justify-center`}
        />
      ))}
    </div>
  );
}