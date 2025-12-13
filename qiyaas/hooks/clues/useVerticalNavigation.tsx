// hooks/clues/useVerticalNavigation.tsx

'use client';

import { useCallback } from 'react';

interface CursorPosition {
  clueIndex: number;
  position: number;
}

interface UseVerticalNavigationProps {
  activeClues: string[];
  userInputs: Map<string, Map<number, string>>;
  completedWords: Set<string>;
  cursorPosition: CursorPosition | null;
  setCursorPosition: (position: CursorPosition) => void;
  isPositionEditable: (clue: string, position: number, wordInputs: Map<number, string>) => boolean;
}

/**
 * Hook for vertical cursor navigation (up/down arrow keys)
 * Tries to maintain horizontal position when moving between clues
 */
export function useVerticalNavigation({
  activeClues,
  userInputs,
  completedWords,
  cursorPosition,
  setCursorPosition,
  isPositionEditable
}: UseVerticalNavigationProps) {
  
  // Move cursor to the clue above (up arrow)
  const moveToClueAbove = useCallback(() => {
    if (!cursorPosition) return;

    const currentPosition = cursorPosition.position;
    let targetClueIdx = cursorPosition.clueIndex - 1;

    // Find the previous incomplete word
    while (targetClueIdx >= 0) {
      const targetClue = activeClues[targetClueIdx];
      
      if (!completedWords.has(targetClue)) {
        const targetWordInputs = userInputs.get(targetClue);
        
        if (targetWordInputs) {
          // Try to maintain the same position if it's editable
          if (currentPosition < targetClue.length && 
              isPositionEditable(targetClue, currentPosition, targetWordInputs)) {
            setCursorPosition({ clueIndex: targetClueIdx, position: currentPosition });
            return;
          }
          
          // Otherwise, find the closest editable position
          let closestPos = null;
          let minDistance = Infinity;
          
          for (let i = 0; i < targetClue.length; i++) {
            if (isPositionEditable(targetClue, i, targetWordInputs)) {
              const distance = Math.abs(i - currentPosition);
              if (distance < minDistance) {
                minDistance = distance;
                closestPos = i;
              }
            }
          }
          
          if (closestPos !== null) {
            setCursorPosition({ clueIndex: targetClueIdx, position: closestPos });
            return;
          }
        }
      }
      
      targetClueIdx--;
    }
  }, [cursorPosition, activeClues, userInputs, completedWords, setCursorPosition, isPositionEditable]);

  // Move cursor to the clue below (down arrow)
  const moveToClueBelow = useCallback(() => {
    if (!cursorPosition) return;

    const currentPosition = cursorPosition.position;
    let targetClueIdx = cursorPosition.clueIndex + 1;

    // Find the next incomplete word
    while (targetClueIdx < activeClues.length) {
      const targetClue = activeClues[targetClueIdx];
      
      if (!completedWords.has(targetClue)) {
        const targetWordInputs = userInputs.get(targetClue);
        
        if (targetWordInputs) {
          // Try to maintain the same position if it's editable
          if (currentPosition < targetClue.length && 
              isPositionEditable(targetClue, currentPosition, targetWordInputs)) {
            setCursorPosition({ clueIndex: targetClueIdx, position: currentPosition });
            return;
          }
          
          // Otherwise, find the closest editable position
          let closestPos = null;
          let minDistance = Infinity;
          
          for (let i = 0; i < targetClue.length; i++) {
            if (isPositionEditable(targetClue, i, targetWordInputs)) {
              const distance = Math.abs(i - currentPosition);
              if (distance < minDistance) {
                minDistance = distance;
                closestPos = i;
              }
            }
          }
          
          if (closestPos !== null) {
            setCursorPosition({ clueIndex: targetClueIdx, position: closestPos });
            return;
          }
        }
      }
      
      targetClueIdx++;
    }
  }, [cursorPosition, activeClues, userInputs, completedWords, setCursorPosition, isPositionEditable]);

  return {
    moveToClueAbove,
    moveToClueBelow
  };
}