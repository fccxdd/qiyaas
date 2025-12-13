// components/game_assets/game_over/GameMessage.tsx

"use client"

import React, { ReactNode } from 'react';

interface GameMessageProps {
  type: 'win' | 'lose';
  title: string;
  message: ReactNode;
}

export const GameMessage: React.FC<GameMessageProps> = ({ type, title, message }) => {
  const titleColor = type === 'win' 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';

  return (
    <>
      <h1 className={`text-2xl sm:text-4xl font-bold ${titleColor} mb-3 sm:mb-4`}>
        {title}
      </h1>
      
      <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
        {message}
      </p>
    </>
  );
};