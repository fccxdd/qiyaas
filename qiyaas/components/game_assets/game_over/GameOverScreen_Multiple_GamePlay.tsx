// components/game_assets/game_over/GameOverScreen_Multiple_GamePlay.tsx

'use client';

import React from 'react';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';

type WinScreenProps = {
  onPlayAgain: () => void;
  onClose?: () => void;
};

type LoseScreenProps = {
  onPlayAgain: () => void;
  onClose?: () => void;
};

export const WinScreen: React.FC<WinScreenProps> = ({ onPlayAgain }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-black z-[9999]">
      <h1 className="text-4xl md:text-6xl font-bold text-green-600">🎉 You Won!</h1>
      <p className="mt-4 text-lg md:text-xl text-gray-800 dark:text-gray-200">
        Congratulations! Ready for the next round?
      </p>
      <button
        onClick={onPlayAgain}
        className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-lg md:text-xl font-semibold transition-all duration-300"
      >
        Next Round
      </button>
    </div>
  );
};

export const LoseScreen: React.FC<LoseScreenProps> = ({ onPlayAgain }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-black z-[9999]">
      <h1 className="text-4xl md:text-6xl font-bold text-red-600">💀 You Lost</h1>
      <p className="mt-4 text-lg md:text-xl text-gray-800 dark:text-gray-200 text-center">
        Don’t worry! You can try your luck on the next round.
      </p>
      <button
        onClick={onPlayAgain}
        className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-lg md:text-xl font-semibold transition-all duration-300"
      >
        Next Round
      </button>
    </div>
  );
};
