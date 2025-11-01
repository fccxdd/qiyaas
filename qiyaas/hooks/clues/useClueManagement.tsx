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
  const [flashStates, setFlashStates] = useState<Map<string, 'none' | 'red' | 'yellow' | 'green'>>(new Map());
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
      
      console.log('🔍 Checking round status:', { lastLetters, currentLetters });
      
      // First time initialization
      if (!lastLetters) {
        console.log('🎬 Initial load - setting as new round');
        baseStartingLettersRef.current = currentLetters;
        return true;
      }
      
      // If current letters are LONGER than last, check if it's just additional letters
      if (currentLetters.length > lastLetters.length) {
        // Check if the current letters START WITH the last letters (additional letters added)
        if (currentLetters.startsWith(lastLetters)) {
          console.log('📝 Additional letters added (same round)');
          return false; // Same round, just additional letters
        }
        // Otherwise it's completely different letters that happen to be longer
        console.log('🔄 New round - different letters (longer)');
        baseStartingLettersRef.current = currentLetters;
        return true;
      }
      
      // If current letters are SHORTER or SAME LENGTH but different, it's a new round
      if (currentLetters !== lastLetters) {
        console.log('🔄 New round - letters changed');
        baseStartingLettersRef.current = currentLetters;
        return true;
      }
      
      // Same letters, no change
      console.log('⏭️ No change in letters');
      return false;
    })();
    
    // Update active clues regardless
    setActiveClues(matchingClues);
    
    if (isNewRound) {
      console.log('🎬 Initializing NEW round with letters:', selectedStartingLetters);
      console.log('📊 Current state before reset:', {
        userInputsSize: userInputs.size,
        completedWordsSize: completedWords.size
      });
      
      // Initialize user inputs and flash states for NEW round
      const newInputs = new Map<string, Map<number, string>>();
      const newFlashStates = new Map<string, 'none' | 'red' | 'yellow' | 'green'>();
      
      matchingClues.forEach(clue => {
        const wordInputs = initializeWordInputs(clue, startingLettersSet.current);
        newInputs.set(clue, wordInputs);
        newFlashStates.set(clue, 'none');
      });

      setUserInputs(newInputs);
      setFlashStates(newFlashStates);
      setCompletedWords(new Set()); // Clear completed words on new round
      
      lastStartingLettersRef.current = selectedStartingLetters;
      
      console.log('✅ New round initialized');
    } else {
      console.log('⏭️ Same round - PRESERVING existing states');
      console.log('📊 Preserved state:', {
        userInputsSize: userInputs.size,
        completedWordsSize: completedWords.size,
        completedWords: Array.from(completedWords)
      });
      
      // Update the last letters ref to include the new additional letters
      lastStartingLettersRef.current = selectedStartingLetters;
      
      // Only update flash states for any new clues (shouldn't happen in same round, but defensive)
      setFlashStates(prev => {
        const updated = new Map(prev);
        matchingClues.forEach(clue => {
          if (!updated.has(clue)) {
            updated.set(clue, 'none');
          }
        });
        return updated;
      });
      
      // CRITICAL: Don't touch userInputs or completedWords - they must be preserved!
      console.log('✅ States preserved, additional letters ready for use');
    }
  }, [selectedStartingLetters, clues]); // Note: completedWords NOT in dependencies

  return {
    activeClues,
    userInputs,
    setUserInputs,
    flashStates,
    setFlashStates,
    completedWords,
    setCompletedWords,
    startingLettersSet
  };
}