// hooks/useWinCondition.tsx

import { useEffect } from 'react';

interface WinConditionProps {
  cluesData: {
    clue_1?: string;
    clue_2?: string;
    clue_3?: string;
  };
  solvedClues: Set<number>; // Set of clue indices that have been solved (0, 1, 2)
  onWin: () => void;
  isGameOver: boolean;
}

/**
 * Custom hook to monitor win condition
 * Triggers onWin callback when all clues are solved
 */
export const useWinCondition = ({ 
  cluesData, 
  solvedClues, 
  onWin, 
  isGameOver 
}: WinConditionProps) => {
  useEffect(() => {
    
    // Don't check if game is already over
    if (isGameOver) return;

    // Get total number of clues
    const totalClues = [
      cluesData.clue_1,
      cluesData.clue_2,
      cluesData.clue_3
    ].filter(Boolean).length;

    // Check if all clues are solved
    if (solvedClues.size === totalClues && totalClues > 0) {
      onWin();
    }
  }, [solvedClues, cluesData, onWin, isGameOver]);
};

/**
 * Helper function to check if a specific clue is solved
 */
export const isClueComplete = (
  clueWord: string | undefined,
  revealedLetters: Set<string>
): boolean => {
  if (!clueWord) return false;
  
  const upperClue = clueWord.toUpperCase();
  
  // Check if all letters in the clue word have been revealed
  for (let i = 0; i < upperClue.length; i++) {
    const letter = upperClue[i];
    if (!revealedLetters.has(letter)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Helper function to get all solved clue indices
 */
export const getSolvedClues = (
  cluesData: {
    clue_1?: string;
    clue_2?: string;
    clue_3?: string;
  },
  revealedLetters: Set<string>
): Set<number> => {
  const solved = new Set<number>();
  
  if (isClueComplete(cluesData.clue_1, revealedLetters)) {
    solved.add(0);
  }
  if (isClueComplete(cluesData.clue_2, revealedLetters)) {
    solved.add(1);
  }
  if (isClueComplete(cluesData.clue_3, revealedLetters)) {
    solved.add(2);
  }
  
  return solved;
};