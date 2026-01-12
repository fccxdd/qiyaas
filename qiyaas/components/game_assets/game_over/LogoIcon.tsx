// components/game_assets/game_over/LogoIcon.tsx

"use client"

import React from 'react';
import Image from 'next/image';
import PulseGlow from '@/hooks/hint_toggle/pulseGlow';
import { GameConfig } from '@/lib/gameConfig';

interface LogoIconProps {
  variant: 'win' | 'lose';
}

export const LogoIcon: React.FC<LogoIconProps> = ({ variant }) => {

  if (variant === 'win') {
    return (
      <div className="flex flex-col gap-[20px] sm:gap-[30px] row-start-2 items-center">
  
        <Image
          className="block animate-bounce dark:hidden"
          src={GameConfig.imagePaths.wonGame}
          alt="qiyaas-logo-light"
          width={400}
          height={380}
        />
        <Image
          className="hidden animate-bounce dark:block"
          src={GameConfig.imagePaths.wonGame}
          alt="qiyaas-logo-dark"
          width={400}
          height={380}
        />
       
      </div>
    );
  }

  if (variant === 'lose') {
  return (
    <div className="flex flex-col gap-[20px] sm:gap-[30px] row-start-2 items-center">
      <Image
        className="dark:hidden block animate-pulse linear"
        src={GameConfig.imagePaths.lostGameLightMode}
        alt="qiyaas-greyed-out-light"
        width={200}
        height={180}
      />
      <Image
        className="not-dark:hidden block animate-pulse linear"
        src={GameConfig.imagePaths.lostGameDarkMode}
        alt="qiyaas-greyed-out-dark"
        width={200}
        height={180}
      />
    </div>
  );

};

};