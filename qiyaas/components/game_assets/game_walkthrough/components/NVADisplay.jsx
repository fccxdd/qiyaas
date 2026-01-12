// components/game_assets/game_walkthrough/components/NVADisplay.jsx

'use client';

import { useState, useEffect } from 'react';
import { GameConfig } from '@/lib/gameConfig';

export default function NVADisplay() {
  const [isTransitioned, setIsTransitioned] = useState(false);

  useEffect(() => {
    // Trigger the transition after component mounts
    const timer = setTimeout(() => {
      setIsTransitioned(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-all duration-700 ${
      isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
    } text-2xl sm:text-4xl md:text-4xl flex items-center gap-3`}>
      <div className={GameConfig.wordColors.noun}> n </div>
      <div className={GameConfig.wordColors.verb}> v </div>
      <div className={GameConfig.wordColors.adjective}> a </div>
    </div>
  );
}