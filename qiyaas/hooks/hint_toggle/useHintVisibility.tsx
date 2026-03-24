// hooks/hint_toggle/useHintVisibility.tsx

"use client";

import React, { useState, useEffect } from 'react';

interface HintVisibilityManagerProps {
  numbersForClue: number[];
  puzzleDate: string;
  hintsEnabled: boolean;
  solvedClues?: boolean[];
  isGameOver?: boolean;
  autoOpenAll?: boolean;
  children: (props: {
    hintsVisible: boolean[];
    hintsOpacity: boolean[];
    toggleHint: (index: number) => void;
  }) => React.ReactNode;
}

const HintVisibilityManager: React.FC<HintVisibilityManagerProps> = ({
  numbersForClue,
  puzzleDate,
  hintsEnabled,
  solvedClues = [false, false, false],
  isGameOver = false,
  autoOpenAll = false,
  children
}) => {
  const [hintsVisible, setHintsVisible] = useState<boolean[]>([false, false, false]);
  const [hintsOpacity, setHintsOpacity] = useState<boolean[]>([false, false, false]);

  // Auto-open hint when a clue is solved
  useEffect(() => {
    solvedClues.forEach((isSolved, index) => {
      if (!isSolved) return;
      setHintsVisible(prev => {
        if (prev[index]) return prev;
        const next = [...prev];
        next[index] = true;
        return next;
      });
      setTimeout(() => {
        setHintsOpacity(prev => {
          if (prev[index]) return prev;
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, 10);
    });
  }, [solvedClues]);

  useEffect(() => {
    if (autoOpenAll) {
      setHintsVisible([true, true, true]);
      setHintsOpacity([true, true, true]);
    }
  }, [autoOpenAll]);

  const toggleHint = (index: number) => {
    if (isGameOver) return;
    if (autoOpenAll) return;
    if (hintsVisible[index]) {
      setHintsOpacity(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      setTimeout(() => {
        setHintsVisible(prev => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
      }, 400);
    } else {
      setHintsVisible(prev => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
      setTimeout(() => {
        setHintsOpacity(prev => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, 10);
    }
  };

  useEffect(() => {
    if (!hintsEnabled) {
      setHintsVisible([false, false, false]);
      setHintsOpacity([false, false, false]);
    }
  }, [hintsEnabled]);

  const resolvedVisible = autoOpenAll ? [true, true, true] : hintsVisible;
  const resolvedOpacity = autoOpenAll ? [true, true, true] : hintsOpacity;

  return <>{children({ hintsVisible: resolvedVisible, hintsOpacity: resolvedOpacity, toggleHint })}</>;
};

export default HintVisibilityManager;