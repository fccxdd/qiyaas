// components/game_assets/game_walkthrough/components/EmptyLetterSlots.jsx

'use client';

import { GameConfig } from '@/lib/gameConfig';

export default function EmptyStartingLetters() {
  return (
    <div className="flex gap-3 sm:gap-4 ">
      {Array.from({ length: GameConfig.startingLettersNumber }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className={`starting-letter-slot rounded-full border-2 border-dashed ${GameConfig.startingColors.beforeGameBegins} flex items-center justify-center`}
        />
      ))}
    </div>
  );
}