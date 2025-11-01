// /hooks/clues/useWordValidation.tsx

import { useCallback, RefObject } from 'react';
import { isWordComplete, findNextEmptyPosition } from '@/hooks/clues/clueHelpers';
import { validateWord } from '@/components/game_assets/word_clues/ValidateWords';
import { GameConfig } from '@/lib/gameConfig';

export function useWordValidation(
  userInputs: Map<string, Map<number, string>>,
  setUserInputs: (inputs: Map<string, Map<number, string>> | ((prev: Map<string, Map<number, string>>) => Map<string, Map<number, string>>)) => void,
  setFlashStates: (states: Map<string, 'none' | 'red' | 'yellow' | 'green'> | ((prev: Map<string, 'none' | 'red' | 'yellow' | 'green'>) => Map<string, 'none' | 'red' | 'yellow' | 'green'>)) => void,
  setCompletedWords: (words: Set<string> | ((prev: Set<string>) => Set<string>)) => void,
  setCursorPosition: (position: { clueIndex: number; position: number } | null) => void,
  findNextIncompleteWord: () => { clueIndex: number; position: number } | null,
  startingLettersSet: RefObject<Set<string>>,
  onLifeLost: () => void,
  verifiedPositions: Map<string, Set<number>>,
  setVerifiedPositions: (positions: Map<string, Set<number>> | ((prev: Map<string, Set<number>>) => Map<string, Set<number>>)) => void,
  onShowMessage: (msg: string, type?: 'error' | 'success' | 'info') => void,
  setShakeWord: (word: string | null) => void,
  setAllGuessedLetters: (letters: Set<string> | ((prev: Set<string>) => Set<string>)) => void
) {
  const submitWord = useCallback((clue: string, clueIndex: number) => {
    const wordInputs = userInputs.get(clue);
    if (!wordInputs || !isWordComplete(clue, wordInputs)) return;

    // Reconstruct the user's complete word
    const userWord = Array.from({ length: clue.length }, (_, i) => 
      wordInputs.get(i) || ''
    ).join('');
    
    // Validate against word list FIRST
    const isValid = validateWord(userWord);
    
    if (!isValid) {

      // Not a valid word - DON'T add letters to guessed set (no keyboard hints!)
      // Not a valid word message
      onShowMessage(GameConfig.messages.wordNotValid, 'info');
      
      // Trigger shake animation
      setShakeWord(clue);
      setTimeout(() => setShakeWord(null), 500); // Clear shake after animation
      
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // Short vibration pattern
      }
      
      // Clear all user-typed letters (keep starting letters AND verified correct letters)
      setTimeout(() => {
        const newWordInputs = new Map<number, string>();
        const clueUpper = clue.toUpperCase();
        const verified = verifiedPositions.get(clue); // Get verified positions
        
        // Keep starting letters AND verified correct letters
        for (let i = 0; i < clueUpper.length; i++) {
          if (startingLettersSet.current?.has(clueUpper[i])) {
            newWordInputs.set(i, clueUpper[i]);
          } else if (verified?.has(i)) {
            // Keep verified correct letters from previous attempts
            const letter = wordInputs.get(i);
            if (letter) newWordInputs.set(i, letter);
          }
        }
        
        setUserInputs(prev => new Map(prev).set(clue, newWordInputs));
        
        // Move cursor to first empty position
        const nextEmpty = findNextEmptyPosition(clue, -1, newWordInputs);
        if (nextEmpty !== null) {
          setCursorPosition({ clueIndex, position: nextEmpty });
        }
      }, 1000); // Clear after shake animation completes
      
      // Don't lose a life, just return (and DON'T track letters!)
      return;
    }

    // Word is valid - NOW add letters to the guessed set for keyboard tracking
    setAllGuessedLetters(prev => {
      const newSet = new Set(prev);
      userWord.split('').forEach(letter => {
        if (letter) {
          const upper = letter.toUpperCase();
          newSet.add(upper);
        }
      });
      return newSet;
    });

    // Word is valid, now check if it matches the clue
    const clueUpper = clue.toUpperCase();
    let allCorrect = true;
    let someCorrectPosition = false;
    const correctPositions = new Set<number>();

    // Check each position
    for (let i = 0; i < clueUpper.length; i++) {
      const userLetter = wordInputs.get(i);
      const correctLetter = clueUpper[i];

      if (userLetter === correctLetter) {
        correctPositions.add(i);
        someCorrectPosition = true;
      } else {
        allCorrect = false;
      }
    }

    if (allCorrect) {
      // All correct - flash green and mark as complete
      setFlashStates(prev => new Map(prev).set(clue, 'green'));
      setCompletedWords(prev => new Set(prev).add(clue));
      
      // Mark ALL positions as verified since the entire word is correct
      const allPositions = new Set<number>();
      for (let i = 0; i < clue.length; i++) {
        allPositions.add(i);
      }
      setVerifiedPositions(prev => new Map(prev).set(clue, allPositions));
      
      onShowMessage(GameConfig.messages.wordCorrect, 'success');
      
      // Move to next incomplete word - with a 200 ms delay
      setTimeout(() => {
        const nextPos = findNextIncompleteWord();
        if (nextPos) {
          setCursorPosition(nextPos);
        } else {
          setCursorPosition(null); // All words complete!
        }
      }, 200);
    } else {
      // Wrong - lose a life
      onLifeLost();
      

      // Show incorrect message
      onShowMessage(GameConfig.messages.wordIncorrect, 'error');
      if (someCorrectPosition) {
        
        // Flash yellow - some correct positions
        setFlashStates(prev => new Map(prev).set(clue, 'yellow'));

        // Add correct positions to verified positions
        setVerifiedPositions(prev => new Map(prev).set(clue, correctPositions));        

        // Remove incorrect letters after flash - REDUCED DELAY from 400ms to 250ms
        setTimeout(() => {
          const newWordInputs = new Map<number, string>();
          correctPositions.forEach(pos => {
            const letter = wordInputs.get(pos);
            if (letter) newWordInputs.set(pos, letter);
          });
          
          setUserInputs(prev => new Map(prev).set(clue, newWordInputs));
          setFlashStates(prev => new Map(prev).set(clue, 'none'));
          
          // Move cursor to first empty position
          const nextEmpty = findNextEmptyPosition(clue, -1, newWordInputs);
          if (nextEmpty !== null) {
            setCursorPosition({ clueIndex, position: nextEmpty });
          }
        }, 250);
      } else {
        
        // Flash red - all wrong
        setFlashStates(prev => new Map(prev).set(clue, 'red'));
        
        // Clear all non-starting letters after flash - REDUCED DELAY from 400ms to 250ms
        setTimeout(() => {
          const newWordInputs = new Map<number, string>();
          // Keep only starting letters
          for (let i = 0; i < clueUpper.length; i++) {
            if (startingLettersSet.current?.has(clueUpper[i])) {
              newWordInputs.set(i, clueUpper[i]);
            }
          }
          
          setUserInputs(prev => new Map(prev).set(clue, newWordInputs));
          setFlashStates(prev => new Map(prev).set(clue, 'none'));
          
          // Move cursor to first empty position
          const nextEmpty = findNextEmptyPosition(clue, -1, newWordInputs);
          if (nextEmpty !== null) {
            setCursorPosition({ clueIndex, position: nextEmpty });
          }
        }, 250);
      }
    }
  }, [
    userInputs,
    setUserInputs,
    setFlashStates,
    setCompletedWords,
    setCursorPosition,
    findNextIncompleteWord,
    startingLettersSet,
    onLifeLost,
    verifiedPositions,
    setVerifiedPositions,
    onShowMessage,
    setShakeWord,
    setAllGuessedLetters
  ]);

  return { submitWord };
}