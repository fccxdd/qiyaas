// components/game_assets/game_walkthrough/componentsKeyboardPreview.js

'use client';

import { GameConfig } from '@/lib/gameConfig';

export default function KeyboardPreview() {
  return (
    <div className="flex flex-col gap-3 py-4 w-full max-w-2xl">


    {/* Grey S with description */}
    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full">
      <div
        className={`flex items-center justify-center font-bold uppercase rounded-md select-none flex-shrink-0 ${GameConfig.keyboardColors.used_up}`}
        style={{
          width: '3rem',
          height: '3rem',
          fontSize: '1.5rem',
        }}
      >
        S
      </div>
      <span className="text-base sm:text-lg title-text text-black dark:text-white text-left flex-1 min-w-0">
        The letter is <span className="text-gray-600">dark gray</span> when not in any words <span className="font-bold">OR</span> used up
      </span>
    </div>
    
    {/* Yellow E with description */}
    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full">
      <div
        className={`flex items-center justify-center font-bold uppercase rounded-md select-none flex-shrink-0 ${GameConfig.keyboardColors.still_available}`}
        style={{ width: '3rem', height: '3rem', fontSize: '1.5rem' }}
      >
        E
      </div>

      <div className="flex items-end gap-1">
        <span className="text-base sm:text-lg title-text text-black dark:text-white text-left">
          <span className="text-yellow-500">Yellow</span> letters go in the yellow dash(es){' '}
          <span className={`leading-none dash-text ${GameConfig.cursorColor.stillAvailable} animate-pulse`} style={{ fontFamily: 'var(--font-indie-flower)' }}>
            _
          </span>
        </span>
      </div>
    </div>
    </div>
  );
}