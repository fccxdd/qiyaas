// hooks/useGameStorage.ts

import { useState, useEffect, useCallback } from 'react';
import { DailyWordRound } from '@/components/game_assets/word_clues/ExtractAnswer_GamePlay';

interface GameState {
	lives: number;
	selectedLetters: string;
	additionalLetters: {
		vowel?: string;
		consonants?: string[];
	};
	validatedAdditionalLetters: {
		vowel?: { letter: string; correct: boolean };
		consonants?: Array<{ letter: string; correct: boolean }>;
	};
	hasAnyCorrectAdditionalLetter: boolean;
	gameStarted: boolean;
	lettersInClues: string[]; // Convert Set to Array for JSON
	wordInputs: Array<[string, string]>; // Convert Map to Array for JSON
	verifiedInputs: Array<[string, string]>; // Convert Map to Array for JSON
	cluesData: DailyWordRound;
	isGameOver: boolean;
	hasWon: boolean;
	letterStatus: Record<string, 'correct' | 'partial' | 'incorrect' | 'unused'>; // Save keyboard colors
	currentRound: number; // Track which round the player is on
	hintsEnabled: boolean; // Track whether hints are shown or hidden
	timestamp: number; // To check if game is stale
}

const STORAGE_KEY = 'wordGameState';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useGameStorage() {
	// Load game state from localStorage
	const loadGameState = useCallback((): GameState | null => {
		if (typeof window === 'undefined') return null;
		
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (!saved) return null;
			
			const parsed: GameState = JSON.parse(saved);
			
			// Check if saved state is expired (older than 24 hours)
			const now = Date.now();
			if (now - parsed.timestamp > EXPIRY_TIME) {
				localStorage.removeItem(STORAGE_KEY);
				return null;
			}
			
			return parsed;
		} catch (error) {
			console.error('Error loading game state:', error);
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
	}, []);

	// Save game state to localStorage
	const saveGameState = useCallback((state: Partial<GameState>) => {
		if (typeof window === 'undefined') return;
		
		try {
			const currentState = loadGameState();
			const newState: GameState = {
				...currentState,
				...state,
				timestamp: Date.now()
			} as GameState;
			
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
		} catch (error) {
			console.error('Error saving game state:', error);
		}
	}, [loadGameState]);

	// Clear saved game state
	const clearGameState = useCallback(() => {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(STORAGE_KEY);
	}, []);

	return {
		loadGameState,
		saveGameState,
		clearGameState
	};
}