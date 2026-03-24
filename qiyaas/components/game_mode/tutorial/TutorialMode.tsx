// components/game_mode/tutorial/TutorialMode.tsx

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Game1Tutorial from '@/components/game_mode/tutorial/Game1Tutorial';
import Game2Tutorial from '@/components/game_mode/tutorial/Game2Tutorial';

const PHASE_INTRO = 0;
const PHASE_GAME2 = 1;

interface TutorialModeProps {
  tutorialBoxReady?: boolean;
}

export default function TutorialMode({ tutorialBoxReady = false }: TutorialModeProps) {
  const router = useRouter();
  const [phase, setPhase] = useState(PHASE_INTRO);
  const [isTransitioned, setIsTransitioned] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsTransitioned(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handlePhaseComplete = useCallback(() => {
    setPhase(prev => {
      if (prev < PHASE_GAME2) return prev + 1;
      return prev;
    });
    if (phase >= PHASE_GAME2) {
      router.push('/play');
    }
  }, [router, phase]);

  const handleBackFromGame2Done = useCallback(() => {
    setPhase(PHASE_INTRO);
    // No initialStep — defaults to 0, restarting Game 1 from the beginning
  }, []);

  if (phase === PHASE_GAME2) {
    return (
      <Game2Tutorial
        isTransitioned={isTransitioned}
        onComplete={handlePhaseComplete}
        onBackFromDone={handleBackFromGame2Done}
        onRestartTutorial={() => {
          setPhase(PHASE_INTRO);
          router.push('/how-to-play');
        }}
      />
    );
  }

  return (
    <Game1Tutorial
      isTransitioned={isTransitioned}
      onPhaseComplete={handlePhaseComplete}
      tutorialBoxReady={tutorialBoxReady}
      onComplete={() => router.push('/play')}
      onRestartTutorial={() => window.location.reload()}
    />
  );
}