'use client';

import { GameConfig } from '@/lib/gameConfig';

export default function KeyboardPreview() {
  return (
    <div className="flex flex-col gap-3 justify-center items-center py-4 w-full">
      
      {/* Grey S with description */}
      <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto">
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
          The letter is not in any words <span style={{color:"#12B503", fontWeight:"bold" }}>OR</span> used up
        </span>
      </div>

      {/* Yellow E with description */}
      <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto">
        <div
          className={`flex items-center justify-center font-bold uppercase rounded-md select-none flex-shrink-0 ${GameConfig.keyboardColors.still_available}`}
          style={{
            width: '3rem',
            height: '3rem',
            fontSize: '1.5rem',
          }}
        >
          E
        </div>
        <span className="text-base sm:text-lg title-text text-black dark:text-white text-left flex-1 min-w-0">
          Letter is in the wrong spot <span style={{color:"#12B503", fontWeight:"bold" }}>OR</span> in another word
        </span>
      </div>

    </div>
  );
}