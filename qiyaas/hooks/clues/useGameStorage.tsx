// hooks/useGameStorage.tsx

import { useCallback } from 'react';
import { DailyWordPuzzle } from '@/components/game_assets/word_clues/ExtractAnswer';

interface GameState {
	lives: number;
	selectedLetters: string;
	additionalLetters: {
		vowel?: string;
		consonant?: string;
	};
	validatedAdditionalLetters: {
		vowel?: { letter: string; correct: boolean };
		consonant?: { letter: string; correct: boolean };
	};
	hasAnyCorrectAdditionalLetter: boolean;
	hasLostLifeForNoStartingLetters: boolean;
	gameStarted: boolean;
	lettersInClues: string[];
	wordInputs: Array<[string, string]>; // Flat Map - kept for compatibility
	verifiedInputs: Array<[string, string]>;
	userInputsNested: Array<[string, Array<[number, string]>]>; // Nested structure for ClueGameManager
	verifiedPositions: Array<[string, number[]]>;
	completedWords: string[];
	revealedSequenceLetters: Array<[string, Array<[number, string]>]>; // Track sequence revealed letters
	cursorPosition?: { clueIndex: number; position: number } | null;
	cluesData: DailyWordPuzzle;
	isGameOver: boolean;
	hasWon: boolean;
	letterStatus: Record<string, 'correct' | 'partial' | 'incorrect' | 'unused'>;
	hintsEnabled: boolean;
	puzzleDate: string;
	solvedClues: boolean[];
	timestamp: number;
	hasRevealedOnLoss: boolean;
	silentRevealedWords: string[];
	autoRevealedPositions: Array<[string, number[]]>;
	
	// Starting letter color reveal state
	revealedStartingColors: number[]; // Indices of starting letters with revealed colors
	
	// Track if starting letters animation has completed
	hasStartingLettersAnimationCompleted: boolean;
	
	// Track if additional letters animation has completed
	hasAdditionalLettersAnimationCompleted: {
		vowel: boolean;
		consonant: boolean;
	};
}

const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useGameStorage(puzzleDate: string) {
	// Storage key is unique per puzzle date
	const STORAGE_KEY = `wordGameState_${puzzleDate}`;
	
	// Load game state from localStorage
	const loadGameState = useCallback((): GameState | null => {
		if (typeof window === 'undefined') return null;
		
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (!saved) return null;
			
			const parsed: GameState = JSON.parse(saved);
			
			// Check if saved state is for correct puzzle date
			if (parsed.puzzleDate !== puzzleDate) {
				localStorage.removeItem(STORAGE_KEY);
				return null;
			}
			
			// Check if saved state is expired (older than 24 hours)
			const now = Date.now();
			if (now - parsed.timestamp > EXPIRY_TIME) {
				localStorage.removeItem(STORAGE_KEY);
				return null;
			}
			
			return parsed;
		} catch (error) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
	}, [STORAGE_KEY, puzzleDate]);

	// Save game state to localStorage
	const saveGameState = useCallback((state: Partial<GameState>) => {
		if (typeof window === 'undefined') return;
		
		try {
			const currentState = loadGameState();
			const newState: GameState = {
				...currentState,
				...state,
				puzzleDate, // Always include puzzle date
				timestamp: Date.now()
			} as GameState;
			
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
		} catch (error) {
			console.error('Error saving game state:', error);
		}
	}, [loadGameState, STORAGE_KEY, puzzleDate]);

	// Clear saved game state for current puzzle
	const clearGameState = useCallback(() => {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(STORAGE_KEY);
	}, [STORAGE_KEY]);

	return {
		loadGameState,
		saveGameState,
		clearGameState
	};
}