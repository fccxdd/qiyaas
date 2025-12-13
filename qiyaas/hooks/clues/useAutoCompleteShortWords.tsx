// hooks/clues/useAutoCompleteShortWords.tsx

'use client';

import { useEffect, useCallback } from 'react';

interface UseAutoCompleteShortWordsProps {
  activeClues: string[];
  userInputs: Map<string, Map<number, string>>;
  startingLetters?: string;
  additionalLetters?: { vowel?: string; consonant?: string };
  onWordComplete: (clue: string) => void;
}

/**
 * Hook to auto-complete short words (3-4 letters) when all positions are filled with starting letters
 * OR when filled with a combination of starting letters and additional letters
 * 
 * If a word has 3 or 4 letters and all positions contain starting/additional letters, 
 * it should be automatically marked as complete since the user cannot edit any positions.
 */
export function useAutoCompleteShortWords({
  activeClues,
  userInputs,
  startingLetters,
  additionalLetters,
  onWordComplete
}: UseAutoCompleteShortWordsProps) {
  
  const checkAndCompleteShortWords = useCallback(() => {
    if (!startingLetters) return;
    
    const startingLettersArray = startingLetters.toUpperCase().split('');
    
    // Combine all available letters (starting + additional)
    const allAvailableLetters = [...startingLettersArray];
    
    if (additionalLetters?.vowel) {
      allAvailableLetters.push(additionalLetters.vowel.toUpperCase());
    }
    
    if (additionalLetters?.consonant) {
        allAvailableLetters.push(additionalLetters.consonant.toUpperCase());
    }
    
    activeClues.forEach(clue => {
      const wordLength = clue.length;
      
      // Only check 3 or 4 letter words
      if (wordLength !== 3 && wordLength !== 4) return;
      
      const wordInputs = userInputs.get(clue);
      if (!wordInputs) return;
      
      // Check if all positions are filled
      if (wordInputs.size !== wordLength) return;
      
      // Check if all letters are from available letters (starting + additional)
      let allAreAvailableLetters = true;
      
      for (let i = 0; i < wordLength; i++) {
        const userInput = wordInputs.get(i);
        const clueLetter = clue[i].toUpperCase();
        
        if (!userInput) {
          allAreAvailableLetters = false;
          break;
        }
        
        const userInputUpper = userInput.toUpperCase();
        
        // Check if it matches the clue and is an available letter
        if (userInputUpper !== clueLetter || !allAvailableLetters.includes(userInputUpper)) {
          allAreAvailableLetters = false;
          break;
        }
      }
      
      // If all positions are available letters, mark as complete
      if (allAreAvailableLetters) {
        onWordComplete(clue);
      }
    });
  }, [activeClues, userInputs, startingLetters, additionalLetters, onWordComplete]);
  
  // Run the check whenever inputs change
  useEffect(() => {
    checkAndCompleteShortWords();
  }, [checkAndCompleteShortWords]);
  
  return {
    checkAndCompleteShortWords
  };
}