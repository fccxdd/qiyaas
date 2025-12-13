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
          className="block dark:hidden"
          src="qiyaas_logo_glow_light.svg"
          alt="qiyaas-logo-light"
          width={140}
          height={119}
        />
        <Image
          className="hidden dark:block"
          src="qiyaas_logo_glow_dark.svg"
          alt="qiyaas-logo-dark"
          width={140}
          height={119}
        />
       
      </div>
    );
  }

  if (variant === 'lose') {
  return (
    <div className="flex flex-col gap-[20px] sm:gap-[30px] row-start-2 items-center">
      <Image
        className="dark:hidden block animate-pulse linear"
        src="/qiyaas_grey_light.svg"
        alt="qiyaas-greyed-out-light"
        width={140}
        height={119}
      />
      <Image
        className="not-dark:hidden block animate-pulse linear"
        src="/qiyaas_grey_dark.svg"
        alt="qiyaas-greyed-out-dark"
        width={140}
        height={119}
      />
    </div>
  );

};

};