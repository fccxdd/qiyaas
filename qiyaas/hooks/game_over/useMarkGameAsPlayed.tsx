"use client"

import { useEffect } from 'react';
import { markTodayAsPlayed } from '@/components/game_assets/game_over/dailyGameTracker';

export const useMarkGameAsPlayed = () => {
  useEffect(() => {
    markTodayAsPlayed();
  }, []);
};