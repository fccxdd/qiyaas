// hooks/clues/useGameStorage.tsx

import { useCallback } from 'react';
import { DailyWordPuzzle } from '@/components/game_assets/word_clues/ExtractAnswer';

const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

export interface StoredGameState {
  puzzleDate: string;
  timestamp: number;

  // Game progress
  lives: number;
  selectedLetters: string;
  gameStarted: boolean;
  isGameOver: boolean;
  hasWon: boolean;
  hasRevealedOnLoss: boolean;
  hasLostLifeForNoStartingLetters: boolean;

  // Word state — parallel arrays, index matches clue index
  wordInputs: (string | null)[][];       // player typed letters per clue
  verified: boolean[][];                  // correct positions per clue
  completed: boolean[];                   // solved clues
  sequenceRevealed: (string | null)[][];  // animation-revealed letters per clue
  silentRevealed: boolean[];              // revealed without flash on loss
  submittedGuesses: string[][];

  // UI state
  cursorPosition: { clueIndex: number; position: number } | null;
  hintsEnabled: boolean;
  solvedClues: boolean[];
  lettersInClues: string[];
  revealedStartingColors: number[];
  hasStartingLettersAnimationCompleted: boolean;
  hintsRevealComplete: boolean;

  // Puzzle data
  cluesData: DailyWordPuzzle;
}

export function useGameStorage(puzzleDate: string) {
  const STORAGE_KEY = `wordGameState_${puzzleDate}`;

  // Delete all puzzle keys except today's
  const cleanOldKeys = useCallback(() => {
    if (typeof window === 'undefined') return;
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wordGameState_') && key !== STORAGE_KEY) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));
  }, [STORAGE_KEY]);

  const loadGameState = useCallback((): StoredGameState | null => {
    if (typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const parsed = JSON.parse(saved);

      // Wrong puzzle date
      if (parsed.puzzleDate !== puzzleDate) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Expired
      if (Date.now() - parsed.timestamp > EXPIRY_TIME) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Old format — if wordInputs isn't an array it's the old Map format, reset cleanly
      if (!Array.isArray(parsed.wordInputs)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed as StoredGameState;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, [STORAGE_KEY, puzzleDate]);

  const saveGameState = useCallback((state: StoredGameState) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        puzzleDate,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, [STORAGE_KEY, puzzleDate]);

  const clearGameState = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }, [STORAGE_KEY]);

  return { loadGameState, saveGameState, clearGameState, cleanOldKeys };
}