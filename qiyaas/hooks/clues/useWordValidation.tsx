// hooks/clues/useWordValidation.tsx

import { useCallback } from 'react';
import { validateWord } from '@/components/game_assets/word_clues/ValidateWords';
import { GameConfig } from '@/lib/gameConfig';
import { FlashState } from './useFlashState';

interface UseWordValidationProps {
	activeClues: string[];
	wordInputs: (string | null)[][];
	verified: boolean[][];
	completed: boolean[];
	cursorPosition: { clueIndex: number; position: number } | null;
	onWordInputsChange: (inputs: (string | null)[][]) => void;
	onVerifiedChange: (verified: boolean[][]) => void;
	onWordComplete: (clueIndex: number) => void;
	onLifeLost: () => void;
	onShowMessage: (msg: string, type?: 'error' | 'success' | 'info') => void;
	setShakeWord: (word: string | null) => void;
	triggerFlash: (clue: string, state: FlashState, onComplete?: () => void) => void;
	setCursorPosition: (pos: { clueIndex: number; position: number } | null) => void;
	findNextIncompleteWord: () => { clueIndex: number; position: number } | null;
	onGuessSubmitted?: (clueIndex: number, word: string) => void;
}

export function useWordValidation({
	activeClues,
	wordInputs,
	verified,
	completed,
	cursorPosition,
	onWordInputsChange,
	onVerifiedChange,
	onWordComplete,
	onLifeLost,
	onShowMessage,
	setShakeWord,
	triggerFlash,
	setCursorPosition,
	findNextIncompleteWord,
	onGuessSubmitted = () => {},
}: UseWordValidationProps) {

	const submitWord = useCallback((clue: string, clueIndex: number) => {
		const inputs = wordInputs[clueIndex];
		if (!inputs) return;

		// Word must be fully filled
		const isFull = inputs.length === clue.length && inputs.every(l => l !== null);
		if (!isFull) return;

		const userWord = inputs.join('');

		// Clears all non-verified positions and moves cursor to first empty position
		const clearUnverified = (currentVerified: boolean[][], delay: number) => {
			setTimeout(() => {
				const newInputs = wordInputs.map((row, i) => {
					if (i !== clueIndex) return row;
					return row.map((letter, pos) =>
						currentVerified[clueIndex]?.[pos] ? letter : null
					);
				});
				onWordInputsChange(newInputs);

				// Move cursor to first non-verified position
				const firstEmpty = newInputs[clueIndex].findIndex(
					(_, pos) => !currentVerified[clueIndex]?.[pos]
				);
				if (firstEmpty !== -1) {
					setCursorPosition({ clueIndex, position: firstEmpty });
				}
			}, delay);
		};

		// ── Not a valid dictionary word ───────────────────────────────────────
		// Invalid words are NOT recorded in submittedGuesses

		if (!validateWord(userWord)) {
			onShowMessage(GameConfig.messages.wordNotValid, 'info');
			setShakeWord(clue);
			setTimeout(() => setShakeWord(null), GameConfig.duration.shakeDuration);
			if (navigator.vibrate) navigator.vibrate(GameConfig.vibrationPattern);
			clearUnverified(verified, GameConfig.duration.clearShakeAfter);
			return;
		}

		// ── Valid word — record the guess for keyboard tracking ───────────────

		onGuessSubmitted(clueIndex, userWord);

		// ── Check against clue ────────────────────────────────────────────────

		const clueUpper = clue.toUpperCase();
		const correctPositions: number[] = [];
		let allCorrect = true;

		for (let i = 0; i < clueUpper.length; i++) {
			if (inputs[i]?.toUpperCase() === clueUpper[i]) {
				correctPositions.push(i);
			} else {
				allCorrect = false;
			}
		}

		// ── All correct → word complete ───────────────────────────────────────

		if (allCorrect) {
			onWordComplete(clueIndex);
			return;
		}

		// ── Wrong → lose a life, flash, then clear ────────────────────────────

		onLifeLost();
		onShowMessage(GameConfig.messages.wordIncorrect, 'error');

		const hasAnyCorrect = correctPositions.length > 0;
		const hasLetterInWord = inputs.some(l =>
			l && clueUpper.includes(l.toUpperCase())
		);

		if (hasAnyCorrect || hasLetterInWord) {
			// Update verified with newly correct positions
			const newVerified = verified.map((row, i) => {
				if (i !== clueIndex) return row;
				const next = [...row];
				correctPositions.forEach(pos => { next[pos] = true; });
				return next;
			});
			onVerifiedChange(newVerified);

			// Yellow flash, then clear after flash completes
			triggerFlash(clue, 'yellow', () => {
				clearUnverified(newVerified, GameConfig.duration.moveToFirstEmptyPosition);
			});
		} else {
			// Red flash, then clear after flash completes
			triggerFlash(clue, 'red', () => {
				clearUnverified(verified, GameConfig.duration.moveToFirstEmptyPosition);
			});
		}

	}, [
		activeClues,
		wordInputs,
		verified,
		completed,
		cursorPosition,
		onWordInputsChange,
		onVerifiedChange,
		onWordComplete,
		onLifeLost,
		onShowMessage,
		setShakeWord,
		triggerFlash,
		setCursorPosition,
		findNextIncompleteWord,
		onGuessSubmitted,
	]);

	return { submitWord };
}