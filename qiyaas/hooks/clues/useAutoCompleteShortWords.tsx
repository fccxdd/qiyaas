// hooks/clues/useAutoCompleteShortWords.tsx

'use client';

import { useEffect, useCallback, useRef } from 'react';

interface UseAutoCompleteWordsProps {
  activeClues: string[];
  userInputs: Map<string, Map<number, string>>;
  startingLetters?: string;
  additionalLetters?: { vowel?: string; consonant?: string };
  onWordComplete: (clue: string) => void;
  completedWords?: Set<string>;
  findNextEditablePosition?: (clue: string, wordInputs: Map<number, string>, currentPosition?: number) => number;
  cursorPosition?: { clueIndex: number; position: number } | null;
  setCursorPosition?: (position: { clueIndex: number; position: number } | null) => void;
  revealedLetters?: Map<string, Map<number, string>>; // Track per-word completion
}

/**
 * Hook to auto-complete words when all positions are filled with starting letters and/or additional letters
 * 
 * Checks each word individually as soon as that word's letters finish revealing.
 */
export function useAutoCompleteWords({
  activeClues,
  userInputs,
  startingLetters,
  additionalLetters,
  onWordComplete,
  completedWords = new Set(),
  findNextEditablePosition,
  cursorPosition,
  setCursorPosition,
  revealedLetters = new Map(),
}: UseAutoCompleteWordsProps) {
  
  const autoCompletedWords = useRef<Set<string>>(new Set());
  
  const checkAndCompleteWords = useCallback(() => {
    if (!startingLetters) return;
    
    const startingLettersArray = startingLetters.toUpperCase().split('');
    
    // Build array of all available letters (starting + additional)
    const allAvailableLetters = [...startingLettersArray];
    
    if (additionalLetters?.vowel) {
      allAvailableLetters.push(additionalLetters.vowel.toUpperCase());
    }
    
    if (additionalLetters?.consonant) {
      allAvailableLetters.push(additionalLetters.consonant.toUpperCase());
    }
    
    activeClues.forEach((clue, clueIndex) => {
      // Skip if already completed or auto-completed
      if (completedWords.has(clue) || autoCompletedWords.current.has(clue)) {
        return;
      }
      
      // Check if THIS SPECIFIC WORD has finished revealing
      const revealedForThisWord = revealedLetters.get(clue);
      if (!revealedForThisWord || revealedForThisWord.size === 0) {
        return; // This word hasn't started revealing yet
      }
      
      // Count how many positions in this word should have starting letters
      const clueUpper = clue.toUpperCase();
      let expectedRevealedCount = 0;
      for (let i = 0; i < clueUpper.length; i++) {
        if (startingLettersArray.includes(clueUpper[i])) {
          expectedRevealedCount++;
        }
      }
      
      // If this word's reveal isn't complete, skip it
      if (revealedForThisWord.size < expectedRevealedCount) {
        return;
      }
      
      const wordLength = clue.length;
      const wordInputs = userInputs.get(clue);
      
      if (!wordInputs) return;
      
      // Check if all positions are filled
      if (wordInputs.size !== wordLength) return;
      
      // Check if ALL letters in the word are from available letters (starting + additional)
      // AND that they match the clue
      let allLettersAreAvailable = true;
      
      for (let i = 0; i < wordLength; i++) {
        const userInput = wordInputs.get(i);
        const clueLetter = clue[i].toUpperCase();
        
        if (!userInput) {
          allLettersAreAvailable = false;
          break;
        }
        
        const userInputUpper = userInput.toUpperCase();
        
        // Must match the clue letter
        if (userInputUpper !== clueLetter) {
          allLettersAreAvailable = false;
          break;
        }
        
        // Check if this letter is available (from starting or additional letters)
        if (!allAvailableLetters.includes(userInputUpper)) {
          allLettersAreAvailable = false;
          break;
        }
      }
      
      // Auto-complete if ALL letters are from available letters (starting + additional)
      if (allLettersAreAvailable) {
        autoCompletedWords.current.add(clue);
        
        // Move cursor to next editable position if on this word
        if (cursorPosition && cursorPosition.clueIndex === clueIndex && findNextEditablePosition && setCursorPosition) {
          const nextPosition = findNextEditablePosition(clue, wordInputs, cursorPosition.position);
          
          // Only move if there's a different editable position
          if (nextPosition !== cursorPosition.position) {
            setCursorPosition({
              clueIndex,
              position: nextPosition
            });
          } else {
            // No editable positions left, clear cursor
            setCursorPosition(null);
          }
        }
        
        onWordComplete(clue);
      }
    });
  }, [activeClues, userInputs, startingLetters, additionalLetters, onWordComplete, completedWords, findNextEditablePosition, cursorPosition, setCursorPosition, revealedLetters]);
  
  // Run the check whenever inputs change
  useEffect(() => {
    checkAndCompleteWords();
  }, [checkAndCompleteWords]);
  
  return {
    checkAndCompleteWords
  };
}