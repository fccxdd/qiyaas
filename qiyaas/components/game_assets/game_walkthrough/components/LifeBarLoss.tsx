// components/game_assets/game_walkthrough/components/LifeBarLoss.jsx
'use client';

import { useState, useEffect } from 'react';
import LifeBar from '@/components/game_assets/lives/LifeBar';
import { GameConfig } from '@/lib/gameConfig';

export default function LifeBarLoss() {
  const [lives, setLives] = useState(GameConfig.maxLives);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= GameConfig.maxLives; i++) {
      timers.push(setTimeout(() => {
        setLives(prev => prev - 1);
      }, i * 600));
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return <LifeBar lives={lives} maxLives={GameConfig.maxLives} />;
}