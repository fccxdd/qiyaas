// hooks/keyboard/KeyboardLetterTracker.tsx

'use client';

import { useMemo } from 'react';
import { GameConfig } from '@/lib/gameConfig';
import { getWordFromClue, ClueValue } from '@/hooks/clues/clueTypes';

export interface LetterStatus {
  [key: string]: 'used_up' | 'still_available' | 'unused';
}

interface KeyboardLetterTrackerProps {
  selectedStartingLetters: string;
  additionalLetters: {
    vowel?: string;
    consonant?: string;
  };
  cluesData: {
    clue_1?: ClueValue; // Can be string or { word, type }
    clue_2?: ClueValue;
    clue_3?: ClueValue;
  };
  wordInputs?: Map<string, string>; // Map of verified positions -> letter
  gameStarted: boolean;
}

/**
 * Hook to track the status of each letter on the keyboard
 * Returns a map of letter -> status ('used_up' | 'still_available' | 'unused')
 * 
 * Tracks:
 * - Starting letters: immediately when game starts
 * - Additional letters: immediately when selected
 * - New letters: only after they're verified (Enter pressed)
 */
export function useKeyboardLetterStatus({
  selectedStartingLetters,
  additionalLetters,
  cluesData,
  wordInputs,
  gameStarted
}: KeyboardLetterTrackerProps): LetterStatus {
  
  return useMemo(() => {
    const letterStatus: LetterStatus = {};
    
    // If game hasn't started, all letters are unused
    if (!gameStarted) {
      return letterStatus;
    }

    // Get all clue words using helper function to handle both string and object formats
    const clueWords: string[] = [];
    if (cluesData.clue_1) {
      const word = getWordFromClue(cluesData.clue_1);
      if (word) clueWords.push(word.toUpperCase());
    }
    if (cluesData.clue_2) {
      const word = getWordFromClue(cluesData.clue_2);
      if (word) clueWords.push(word.toUpperCase());
    }
    if (cluesData.clue_3) {
      const word = getWordFromClue(cluesData.clue_3);
      if (word) clueWords.push(word.toUpperCase());
    }

    // Collect letters to track:
    // 1. Starting letters (ALWAYS tracked, treated as pre-placed)
    // 2. Additional letters (ALWAYS tracked once selected, treated as pre-placed)
    // 3. Any NEW letters that have been verified (after Enter press)
    
    const trackedLettersSet = new Set<string>();
    const startingLettersSet = new Set<string>();
    
    // Add starting letters - these are tracked immediately and treated as already placed
    selectedStartingLetters.split('').forEach(letter => {
      if (letter) {
        const upper = letter.toUpperCase();
        trackedLettersSet.add(upper);
        startingLettersSet.add(upper);
      }
    });
    
    // Add additional vowel - treated as pre-placed
    if (additionalLetters.vowel) {
      const upper = additionalLetters.vowel.toUpperCase();
      trackedLettersSet.add(upper);
      startingLettersSet.add(upper);
    }
    
    // Add additional consonant - treated as pre-placed
    if (additionalLetters.consonant) {
      const upper = additionalLetters.consonant.toUpperCase();
      trackedLettersSet.add(upper);
      startingLettersSet.add(upper);
    }

    // Add any NEW letters that have been verified (from wordInputs)
    if (wordInputs) {
      wordInputs.forEach((letter) => {
        trackedLettersSet.add(letter.toUpperCase());
      });
    }
    
    const trackedLetters = Array.from(trackedLettersSet);

    // For each tracked letter, determine its status
    trackedLetters.forEach(letter => {
      const isStartingLetter = startingLettersSet.has(letter);
      let totalNeeded = 0;
      let totalVerified = 0;
      let appearsInAnyClue = false;

      clueWords.forEach((word, clueIndex) => {
        
        // Count how many times this letter appears in this clue word
        const neededCount = word.split('').filter(l => l === letter).length;
                
        if (neededCount === 0) {
          // This letter isn't in this clue at all
          return;
        }

        appearsInAnyClue = true;
        totalNeeded += neededCount;

        // Count verified letters from wordInputs (letters confirmed via Enter)
        let verifiedCount = 0;
        if (wordInputs) {
          wordInputs.forEach((inputLetter, key) => {
            if (key.startsWith(`clue${clueIndex}-`) && inputLetter.toUpperCase() === letter) {
              verifiedCount++;
            }
          });
        }

        // If this is a starting letter (or additional letter), count how many positions it auto-fills in this clue
        let autoPlacedCount = 0;
        if (isStartingLetter) {
          
          // Count positions where this starting/additional letter appears in the clue
          for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
              autoPlacedCount++;
            }
          }
        }

        const totalInThisClue = verifiedCount + autoPlacedCount;
        totalVerified += totalInThisClue;
        
      });

      // Determine the letter's status
      if (!appearsInAnyClue) {
        // Letter is tracked but doesn't appear in any clue
        letterStatus[letter] = 'unused';
      } else if (totalVerified >= totalNeeded) {
        // Letter has been placed in all positions where it's needed
        letterStatus[letter] = 'used_up';
      } else {
        // Letter is still needed in at least one position
        letterStatus[letter] = 'still_available';
      }
    });

    return letterStatus;
  }, [selectedStartingLetters, additionalLetters, cluesData, wordInputs, gameStarted]);
}

/**
 * Get the CSS class for a keyboard key based on its status
 */
export function getKeyboardKeyClass(letter: string, letterStatus: LetterStatus): string {
  // Special keys always use default color
  if (letter === 'ENTER' || letter === 'BACKSPACE') {
    return GameConfig.keyboardColors.default;
  }
  
  const status = letterStatus[letter.toUpperCase()];
  
  // No status = letter hasn't been selected/tracked yet
  if (!status) {
    return GameConfig.keyboardColors.default;
  }
  
  // Unused (not in any clue) or used_up (all positions filled) both = gray
  if (status === 'unused' || status === 'used_up') {
    return GameConfig.keyboardColors.used_up;
  }
  
  // Still available = yellow
  if (status === 'still_available') {
    return GameConfig.keyboardColors.still_available;
  }
  
  return GameConfig.keyboardColors.default;
}