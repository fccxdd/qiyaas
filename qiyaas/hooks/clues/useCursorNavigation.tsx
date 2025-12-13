// hooks/clues/useCursorNavigation.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePositionEditability } from './usePositionEditability';
import { useHorizontalNavigation } from './useHorizontalNavigation';
import { useVerticalNavigation } from './useVerticalNavigation';

interface CursorPosition {
	clueIndex: number;
	position: number;
}

interface UseCursorNavigationProps {
	activeClues: string[];
	userInputs: Map<string, Map<number, string>>;
	completedWords: Set<string>;
	verifiedPositions: Map<string, Set<number>>;
	startingLetters?: string;
	hasAnyCorrectAdditionalLetter?: boolean;
	additionalLetters?: { vowel?: string; consonant?: string; any?: string; };
	additionalLetterPositions: Map<string, Set<number>>;
}

/**
 * Main cursor navigation hook
 * 
 * Combines position editability checks with horizontal and vertical navigation
 * Supports skipping over:
 * - Verified letters (correct guesses)
 * - Starting letters (pre-filled)
 * - Additional vowels and consonants (bonus letters)
 */
export function useCursorNavigation({
	activeClues,
	userInputs,
	completedWords,
	verifiedPositions,
	startingLetters,
	hasAnyCorrectAdditionalLetter,
	additionalLetters,
	additionalLetterPositions
}: UseCursorNavigationProps) {
	
	const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);

	// Check position editability (skips protected letters)
	const { isPositionEditable } = usePositionEditability({
		verifiedPositions,
		startingLetters,
		additionalLetters,
		additionalLetterPositions
	});

	// Set initial cursor position when clues are loaded
	useEffect(() => {
		if (activeClues.length > 0 && cursorPosition === null) {
			const firstClue = activeClues[0];
			const wordInputs = userInputs.get(firstClue);
			
			if (wordInputs) {
				// Find first editable position
				for (let i = 0; i < firstClue.length; i++) {
					if (isPositionEditable(firstClue, i, wordInputs)) {
						setCursorPosition({ clueIndex: 0, position: i });
						return;
					}
				}
			}
		}
	}, [activeClues, userInputs, cursorPosition, isPositionEditable]);

	// Find next incomplete word
	const findNextIncompleteWord = useCallback(() => {
		if (!cursorPosition) {
			// If no cursor position, start from beginning
			for (let i = 0; i < activeClues.length; i++) {
				const clue = activeClues[i];
				if (!completedWords.has(clue)) {
					const wordInputs = userInputs.get(clue);
					if (wordInputs) {
						// Find first editable position
						for (let j = 0; j < clue.length; j++) {
							if (isPositionEditable(clue, j, wordInputs)) {
								return { clueIndex: i, position: j };
							}
						}
					}
				}
			}
			return null;
		}

		// Search forward from NEXT word after current position
		for (let i = cursorPosition.clueIndex + 1; i < activeClues.length; i++) {
			const clue = activeClues[i];
			if (!completedWords.has(clue)) {
				const wordInputs = userInputs.get(clue);
				if (wordInputs) {
					// Find first editable position
					for (let j = 0; j < clue.length; j++) {
						if (isPositionEditable(clue, j, wordInputs)) {
							return { clueIndex: i, position: j };
						}
					}
				}
			}
		}

		// If nothing found forward, wrap around and search from beginning up to current
		for (let i = 0; i < cursorPosition.clueIndex; i++) {
			const clue = activeClues[i];
			if (!completedWords.has(clue)) {
				const wordInputs = userInputs.get(clue);
				if (wordInputs) {
					// Find first editable position
					for (let j = 0; j < clue.length; j++) {
						if (isPositionEditable(clue, j, wordInputs)) {
							return { clueIndex: i, position: j };
						}
					}
				}
			}
		}

		return null;
	}, [activeClues, completedWords, userInputs, isPositionEditable, cursorPosition]);

	// Horizontal navigation (left/right)
	const { moveToNextPosition, moveToPreviousPosition } = useHorizontalNavigation({
		activeClues,
		userInputs,
		completedWords,
		cursorPosition,
		setCursorPosition,
		isPositionEditable
	});

	// Vertical navigation (up/down)
	const { moveToClueAbove, moveToClueBelow } = useVerticalNavigation({
		activeClues,
		userInputs,
		completedWords,
		cursorPosition,
		setCursorPosition,
		isPositionEditable
	});

	return {
		cursorPosition,
		setCursorPosition,
		findNextIncompleteWord,
		moveToNextPosition,
		moveToPreviousPosition,
		moveToClueAbove,
		moveToClueBelow,
		isPositionEditable: (clue: string, position: number) => {
			const wordInputs = userInputs.get(clue);
			return wordInputs ? isPositionEditable(clue, position, wordInputs) : false;
		}
	};
}