// components/game_assets/game_walkthrough/components/ClueExamples.tsx

import { GameConfig } from '@/lib/gameConfig';

// Clue 1 Example: HONEY 5 = E, F
export function Clue1Example() {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 py-4">
      {/* Left - HONEY word */}
      <div className="flex items-center gap-2">
        <span className={`${GameConfig.wordColors_bg.noun} inline-block text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xl sm:text-3xl font-bold`}>
          HONEY
        </span>
        <h3 className={`${GameConfig.wordColors.noun} text-lg sm:text-2xl font-bold`}>n</h3>
      </div>

      {/* Right - Clue */}
      <div className="text-black dark:text-white text-xl sm:text-3xl font-semibold">
        <span className={`${GameConfig.wordColors_bg.noun} inline-block text-white px-2 sm:px-3 py-1 rounded text-xl sm:text-3xl font-bold`}>
          5
        </span>
        {' = E , F'}
      </div>
    </div>
  );
}

// Clue 2 Example: ARRIVE 1 = A, O
export function Clue2Example() {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 py-4">
      {/* Left - ARRIVE word */}
      <div className="flex items-center gap-2">
        <span className={`${GameConfig.wordColors_bg.verb} inline-block text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xl sm:text-3xl font-bold`}>
          A
        </span>
        <span className="text-xl sm:text-3xl font-semibold text-black dark:text-white">RRIVE</span>
        <h3 className={`${GameConfig.wordColors.verb} text-lg sm:text-2xl font-bold`}>v</h3>
      </div>

      {/* Right - Clue */}
      <div className="text-black dark:text-white text-xl sm:text-3xl font-semibold">
        {'1 = '}
        <span className={`${GameConfig.wordColors_bg.verb} inline-block text-white px-2 sm:px-3 py-1 rounded text-xl sm:text-3xl font-bold`}>
          A
        </span>
        {' , O'}
      </div>
    </div>
  );
}

// Clue 3 Example: SMART 7 = G, S
export function Clue3Example() {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 py-4">
      {/* Left - SMART word */}
      <div className="flex items-center gap-2">
        <span className={`${GameConfig.wordColors_bg.adjective} inline-block text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xl sm:text-3xl font-bold`}>
          S
        </span>
        <span className="text-xl sm:text-3xl font-semibold text-black dark:text-white">MART</span>
        <h3 className={`${GameConfig.wordColors.adjective} text-lg sm:text-2xl font-bold`}>a</h3>
      </div>

      {/* Right - Clue */}
      <div className="text-black dark:text-white text-xl sm:text-3xl font-semibold">
        {'7 = G , '}
        <span className={`${GameConfig.wordColors_bg.adjective} inline-block text-white px-2 sm:px-3 py-1 rounded text-xl sm:text-3xl font-bold`}>
          S
        </span>
      </div>
    </div>
  );
}