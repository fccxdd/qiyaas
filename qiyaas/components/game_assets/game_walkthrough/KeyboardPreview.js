'use client';

import { GameConfig } from '@/lib/gameConfig';

export default function KeyboardPreview() {
  return (
    <div className="flex flex-col gap-3 justify-center items-center py-4">
      
      {/* Grey X with description */}
      <div className="flex items-center gap-3 h-12">
        <div
          className={`flex items-center justify-center font-bold uppercase rounded-md select-none ${GameConfig.keyboardColors.used_up}`}
          style={{
            width: '3rem',
            height: '3rem',
            fontSize: '1.5rem',
          }}
        >
          X
        </div>
        <span className="text-sm sm:text-sm title-text leading-loose text-black dark:text-white w-32">Teema</span>
      </div>

      {/* Yellow E with description */}
      <div className="flex items-center gap-3 h-12">
        <div
          className={`flex items-center justify-center font-bold uppercase rounded-md select-none ${GameConfig.keyboardColors.still_available}`}
          style={{
            width: '3rem',
            height: '3rem',
            fontSize: '1.5rem',
          }}
        >
          E
        </div>
        <span className="text-sm sm:text-sm title-text leading-loose text-black dark:text-white w-32">Rox</span>
      </div>

    </div>
  );
}