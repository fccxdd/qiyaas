// components/game_assets/word_clues/hooks/useClueManagement.tsx

import { useState, useEffect, useRef } from 'react';
import { getMatchingClues, initializeWordInputs } from '@/hooks/clues/clueHelpers';

interface TutorialWords {
  clue_1: string;
  clue_2: string;
  clue_3: string;
  numbers_for_clue: number[];
}

export function useClueManagement(
  clues: TutorialWords,
  selectedStartingLetters: string
) {
  const [activeClues, setActiveClues] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<Map<string, Map<number, string>>>(new Map());
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const startingLettersSet = useRef<Set<string>>(new Set());
  
  // Track the base starting letters (first letters selected, before any additional letters)
  const baseStartingLettersRef = useRef<string>('');
  
  // Track the full starting letters including additional
  const lastStartingLettersRef = useRef<string>('');

  // Initialize starting letters set whenever it changes
  useEffect(() => {
    startingLettersSet.current = new Set(selectedStartingLetters.toUpperCase().split(''));
  }, [selectedStartingLetters]);

  // Update active clues and initialize states
  useEffect(() => {
    const matchingClues = getMatchingClues(clues, selectedStartingLetters);
    
    // CRITICAL FIX: Detect if this is a NEW round vs just adding additional letters
    const isNewRound = (() => {
      const lastLetters = lastStartingLettersRef.current;
      const currentLetters = selectedStartingLetters;
            
      // First time initialization
      if (!lastLetters) {
        baseStartingLettersRef.current = currentLetters;
        return true;
      }
      
      // If current letters are LONGER than last, check if it's just additional letters
      if (currentLetters.length > lastLetters.length) {
        // Check if the current letters START WITH the last letters (additional letters added)
        if (currentLetters.startsWith(lastLetters)) {
          return false; // Same round, just additional letters
        }
        // Otherwise it's completely different letters that happen to be longer
        baseStartingLettersRef.current = currentLetters;
        return true;
      }
      
      // If current letters are SHORTER or SAME LENGTH but different, it's a new round
      if (currentLetters !== lastLetters) {
        baseStartingLettersRef.current = currentLetters;
        return true;
      }
      
      // Same letters, no change
      return false;
    })();
    
    // Update active clues regardless
    setActiveClues(matchingClues);
    
    if (isNewRound) {
      
      // Initialize user inputs for NEW round
      const newInputs = new Map<string, Map<number, string>>();
      
      matchingClues.forEach(clue => {
        const wordInputs = initializeWordInputs(clue, startingLettersSet.current);
        newInputs.set(clue, wordInputs);
      });

      setUserInputs(newInputs);
      setCompletedWords(new Set()); // Clear completed words on new round
      
      lastStartingLettersRef.current = selectedStartingLetters;
      
    } else {
      
      // Update the last letters ref to include the new additional letters
      lastStartingLettersRef.current = selectedStartingLetters;
      
      // CRITICAL: Don't touch userInputs or completedWords - they must be preserved!
    }
  }, [selectedStartingLetters, clues]);

  return {
    activeClues,
    userInputs,
    setUserInputs,
    completedWords,
    setCompletedWords,
    startingLettersSet
  };
}