// hooks/clues/useHorizontalNavigation.tsx

'use client';

import { useCallback } from 'react';

interface CursorPosition {
  clueIndex: number;
  position: number;
}

interface UseHorizontalNavigationProps {
  activeClues: string[];
  userInputs: Map<string, Map<number, string>>;
  completedWords: Set<string>;
  cursorPosition: CursorPosition | null;
  setCursorPosition: (position: CursorPosition) => void;
  isPositionEditable: (clue: string, position: number, wordInputs: Map<number, string>) => boolean;
}

/**
 * Hook for horizontal cursor navigation (left/right arrow keys)
 * Moves cursor to next/previous editable positions, skipping protected letters
 */
export function useHorizontalNavigation({
  activeClues,
  userInputs,
  completedWords,
  cursorPosition,
  setCursorPosition,
  isPositionEditable
}: UseHorizontalNavigationProps) {
  
  // Move cursor to next editable position (right arrow)
  // allowClueJump: true for arrow keys, false for typing
  const moveToNextPosition = useCallback((allowClueJump: boolean = true) => {
    if (!cursorPosition) return;

    const currentClue = activeClues[cursorPosition.clueIndex];
    const wordInputs = userInputs.get(currentClue);
    if (!wordInputs) return;

    // Look for next editable position in current word
    let nextPos = null;
    
    for (let i = cursorPosition.position + 1; i < currentClue.length; i++) {
      if (isPositionEditable(currentClue, i, wordInputs)) {
        nextPos = i;
        break;
      }
    }

    if (nextPos !== null) {
      setCursorPosition({ clueIndex: cursorPosition.clueIndex, position: nextPos });
      return;
    }

    // Only move to next clue if allowClueJump is true (arrow key press)
    if (!allowClueJump) return;

    // Move to next incomplete clue
    let nextClueIdx = cursorPosition.clueIndex + 1;
    
    while (nextClueIdx < activeClues.length) {
      const nextClue = activeClues[nextClueIdx];
      
      if (!completedWords.has(nextClue)) {
        const nextWordInputs = userInputs.get(nextClue);
        
        if (nextWordInputs) {
          // Find first editable position
          for (let i = 0; i < nextClue.length; i++) {
            if (isPositionEditable(nextClue, i, nextWordInputs)) {
              setCursorPosition({ clueIndex: nextClueIdx, position: i });
              return;
            }
          }
        }
      }
      
      nextClueIdx++;
    }
  }, [cursorPosition, activeClues, userInputs, completedWords, setCursorPosition, isPositionEditable]);

  // Move cursor to previous editable position (left arrow)
  // allowClueJump: true for arrow keys, false for typing
  const moveToPreviousPosition = useCallback((allowClueJump: boolean = true) => {
    if (!cursorPosition) return;

    const currentClue = activeClues[cursorPosition.clueIndex];
    const wordInputs = userInputs.get(currentClue);
    if (!wordInputs) return;

    // Look for previous editable position in current word
    let prevPos = null;
    
    for (let i = cursorPosition.position - 1; i >= 0; i--) {
      if (isPositionEditable(currentClue, i, wordInputs)) {
        prevPos = i;
        break;
      }
    }
    
    if (prevPos !== null) {
      setCursorPosition({ clueIndex: cursorPosition.clueIndex, position: prevPos });
      return;
    }

    // Only move to previous clue if allowClueJump is true (arrow key press)
    if (!allowClueJump) return;

    // Move to previous incomplete clue
    let prevClueIdx = cursorPosition.clueIndex - 1;
    
    while (prevClueIdx >= 0) {
      const prevClue = activeClues[prevClueIdx];
      
      if (!completedWords.has(prevClue)) {
        const prevWordInputs = userInputs.get(prevClue);
        
        if (prevWordInputs) {
          // Find last editable position
          for (let i = prevClue.length - 1; i >= 0; i--) {
            if (isPositionEditable(prevClue, i, prevWordInputs)) {
              setCursorPosition({ clueIndex: prevClueIdx, position: i });
              return;
            }
          }
        }
      }
      
      prevClueIdx--;
    }
  }, [cursorPosition, activeClues, userInputs, completedWords, setCursorPosition, isPositionEditable]);

  return {
    moveToNextPosition,
    moveToPreviousPosition
  };
}