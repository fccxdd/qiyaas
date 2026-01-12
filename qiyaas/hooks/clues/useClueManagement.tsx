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
  selectedStartingLetters: string,
  initialCompletedWords: Set<string> = new Set(),
  initialUserInputs: Map<string, Map<number, string>> = new Map()
) {
  const [activeClues, setActiveClues] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<Map<string, Map<number, string>>>(initialUserInputs);
  const [completedWords, setCompletedWords] = useState<Set<string>>(initialCompletedWords);
  const startingLettersSet = useRef<Set<string>>(new Set());
  
  // Track if we've initialized
  const hasInitialized = useRef(false);

  // Initialize starting letters set whenever it changes
  useEffect(() => {
    startingLettersSet.current = new Set(selectedStartingLetters.toUpperCase().split(''));
  }, [selectedStartingLetters]);

  // Sync completedWords when initialCompletedWords changes (from parent)
  useEffect(() => {
    if (initialCompletedWords.size > 0) {
      setCompletedWords(initialCompletedWords);
    }
  }, [initialCompletedWords]);

  // Update active clues when clues change
  useEffect(() => {
    const matchingClues = getMatchingClues(clues, selectedStartingLetters);
    setActiveClues(matchingClues);
    
    // ONLY initialize userInputs if:
    // 1. We haven't initialized yet, AND
    // 2. We don't have saved userInputs to restore
    if (!hasInitialized.current && initialUserInputs.size === 0) {
      const newInputs = new Map<string, Map<number, string>>();
      
      matchingClues.forEach(clue => {
        newInputs.set(clue, new Map());
      });

      setUserInputs(newInputs);
      hasInitialized.current = true;
    } 
    
    // When additional letters are added, DO NOTHING - preserve all state
  }, [clues, selectedStartingLetters, initialUserInputs.size]);

  return {
    activeClues,
    userInputs,
    setUserInputs,
    completedWords,
    setCompletedWords,
    startingLettersSet
  };
}