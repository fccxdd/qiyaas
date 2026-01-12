// hooks/hint_toggle/useHintVisibility.tsx

"use client";

import React, { useState, useEffect } from 'react';

interface HintVisibilityManagerProps {
  numbersForClue: number[];
  puzzleDate: string;
  hintsEnabled: boolean;
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
  children
}) => {
  const [hintsVisible, setHintsVisible] = useState<boolean[]>([false, false, false]);
  const [hintsOpacity, setHintsOpacity] = useState<boolean[]>([false, false, false]);

  // Toggle hint visibility
  const toggleHint = (index: number) => {
    if (hintsVisible[index]) {
      // Closing hint
      setHintsOpacity(prev => {
        const newOpacity = [...prev];
        newOpacity[index] = false;
        return newOpacity;
      });
      setTimeout(() => {
        setHintsVisible(prev => {
          const newHints = [...prev];
          newHints[index] = false;
          return newHints;
        });
      }, 400);
    } else {
      // Opening hint
      setHintsVisible(prev => {
        const newHints = [...prev];
        newHints[index] = true;
        return newHints;
      });
      setTimeout(() => {
        setHintsOpacity(prev => {
          const newOpacity = [...prev];
          newOpacity[index] = true;
          return newOpacity;
        });
      }, 10);
    }
  };

  // Reset hints when the numbers change (new round/puzzle)
  useEffect(() => {
    setHintsVisible([false, false, false]);
    setHintsOpacity([false, false, false]);
  }, [JSON.stringify(numbersForClue), puzzleDate]);

  // Reset hints visibility when hintsEnabled changes from parent
  useEffect(() => {
    if (!hintsEnabled) {
      setHintsVisible([false, false, false]);
      setHintsOpacity([false, false, false]);
    }
  }, [hintsEnabled]);

  return <>{children({ hintsVisible, hintsOpacity, toggleHint })}</>;
};

export default HintVisibilityManager;