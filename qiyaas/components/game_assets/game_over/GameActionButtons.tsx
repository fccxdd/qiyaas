// components/game_assets/game_over/GameActionButtons.tsx

"use client"

import React, { ReactNode } from 'react';

interface ActionButton {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  variant: 'primary' | 'secondary';
}

interface GameActionButtonsProps {
  buttons: ActionButton[];
}

export const GameActionButtons: React.FC<GameActionButtonsProps> = ({ buttons }) => {
  return (
    <div className="flex gap-3 sm:gap-6 items-center flex-col">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          className={
            button.variant === 'primary'
              ? "rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center text-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full"
              : "rounded-full shadow-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-all flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent hover:-translate-y-1 hover:shadow-2xl font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full"
          }
        >
          {button.icon} {button.label}
        </button>
      ))}
    </div>
  );
};