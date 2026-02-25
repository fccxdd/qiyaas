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
  cluesData: {
    clue_1?: ClueValue;
    clue_2?: ClueValue;
    clue_3?: ClueValue;
  };
  verified?: boolean[][];
  gameStarted: boolean;
  submittedGuesses?: string[][];
  completed?: boolean[];
}

export function useKeyboardLetterStatus({
  selectedStartingLetters,
  cluesData,
  verified,
  gameStarted,
  submittedGuesses,
  completed,
}: KeyboardLetterTrackerProps): LetterStatus {

  return useMemo(() => {
    const letterStatus: LetterStatus = {};

    if (!gameStarted) return letterStatus;

    // Get all clue words
    const clueWords: string[] = [
      cluesData.clue_1 && getWordFromClue(cluesData.clue_1),
      cluesData.clue_2 && getWordFromClue(cluesData.clue_2),
      cluesData.clue_3 && getWordFromClue(cluesData.clue_3),
    ].filter(Boolean).map(w => (w as string).toUpperCase());

    const trackedLettersSet = new Set<string>();
    const startingLettersSet = new Set<string>();

    // Track starting letters
    selectedStartingLetters.split('').forEach(letter => {
      if (letter) {
        const upper = letter.toUpperCase();
        trackedLettersSet.add(upper);
        startingLettersSet.add(upper);
      }
    });

    // Track letters from verified positions
    if (verified) {
      clueWords.forEach((word, clueIndex) => {
        word.split('').forEach((char, pos) => {
          if (verified[clueIndex]?.[pos]) {
            trackedLettersSet.add(char.toUpperCase());
          }
        });
      });
    }

    // Track letters from submitted guesses (recorded after Enter, not while typing)
    if (submittedGuesses) {
      submittedGuesses.forEach((guesses, clueIndex) => {
        guesses.forEach(word => {
          word.toUpperCase().split('').forEach(letter => {
            if (letter) trackedLettersSet.add(letter);
          });
        });
      });
    }

    // For each tracked letter, determine its status
    Array.from(trackedLettersSet).forEach(letter => {
      const isStartingLetter = startingLettersSet.has(letter);
      let totalNeeded = 0;
      let totalPlaced = 0;
      let appearsInAnyClue = false;

      clueWords.forEach((word, clueIndex) => {
        const neededCount = word.split('').filter(c => c === letter).length;
        if (neededCount === 0) return;

        appearsInAnyClue = true;
        totalNeeded += neededCount;

        // Count verified positions containing this letter
        let verifiedCount = 0;
        if (verified?.[clueIndex]) {
          word.split('').forEach((char, pos) => {
            if (char === letter && verified[clueIndex][pos]) {
              verifiedCount++;
            }
          });
        }

        // Starting letters auto-fill every matching position
        const autoPlacedCount = isStartingLetter
          ? word.split('').filter(c => c === letter).length
          : 0;

        totalPlaced += Math.max(verifiedCount, autoPlacedCount);
      });

      if (!appearsInAnyClue) {
        letterStatus[letter] = 'unused';
      } else if (totalPlaced >= totalNeeded) {
        letterStatus[letter] = 'used_up';
      } else {
        letterStatus[letter] = 'still_available';
      }
    });

    return letterStatus;
  }, [selectedStartingLetters, cluesData, verified, gameStarted, submittedGuesses, completed]);
}

export function getKeyboardKeyClass(letter: string, letterStatus: LetterStatus): string {
  if (letter === 'ENTER' || letter === 'BACKSPACE') {
    return GameConfig.keyboardColors.default;
  }

  const status = letterStatus[letter.toUpperCase()];

  if (!status) return GameConfig.keyboardColors.default;

  if (status === 'unused' || status === 'used_up') {
    return GameConfig.keyboardColors.used_up;
  }

  if (status === 'still_available') {
    return GameConfig.keyboardColors.still_available;
  }

  return GameConfig.keyboardColors.default;
}