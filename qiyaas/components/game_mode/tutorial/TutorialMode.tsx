// components/game_mode/tutorial/TutorialMode.tsx

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Game1Tutorial from '@/components/game_mode/tutorial/Game1Tutorial';
import Game2Tutorial from '@/components/game_mode/tutorial/Game2Tutorial';
import { Game1 } from '@/data/tutorialGameSteps';

const PHASE_INTRO = 0;
const PHASE_GAME2 = 1;

interface TutorialModeProps {
  tutorialBoxReady?: boolean;
}

export default function TutorialMode({ tutorialBoxReady = false }: TutorialModeProps) {
  const router = useRouter();
  const [phase, setPhase] = useState(PHASE_INTRO);
  const [isTransitioned, setIsTransitioned] = useState(false);
  const [game1InitialStep, setGame1InitialStep] = useState<number | undefined>(undefined);

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
    setGame1InitialStep(Game1.length - 1);
    setPhase(PHASE_INTRO);
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
      initialStep={game1InitialStep}
      onComplete={() => router.push('/play')}
      onRestartTutorial={() => window.location.reload()}
    />
  );
}