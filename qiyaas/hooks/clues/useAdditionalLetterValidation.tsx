// hooks/clues/useAdditionalLetterValidation.tsx

import { useEffect, useRef } from 'react';

interface UseAdditionalLetterValidationProps {
	word: string;
	userInputs: Map<number, string>;
	additionalLetters: { vowel?: string; consonant?: string; any?: string };
	clueLettersComplete: boolean;
	isComplete: boolean;
	onAdditionalLettersFilled?: (positions: Map<number, string>) => void;
	setUserTypedIndices: React.Dispatch<React.SetStateAction<Set<number>>>;
	onValidationComplete?: () => void;
	currentPosition?: number;
	onPositionChange?: (position: number) => void;
	findNextEditablePosition?: (clue: string, wordInputs: Map<number, string>, currentPosition?: number) => number;
}

export function useAdditionalLetterValidation({
	word,
	userInputs,
	additionalLetters,
	clueLettersComplete,
	isComplete,
	onAdditionalLettersFilled,
	setUserTypedIndices,
	onValidationComplete,
	currentPosition,
	onPositionChange,
	findNextEditablePosition,
}: UseAdditionalLetterValidationProps) {
	const additionalLettersPositions = useRef<Set<number>>(new Set());
	const hasFilledAdditionalLettersRef = useRef(false);
	const lastAdditionalLettersRef = useRef<string>('');

	// Reset additional letters flag when letters change
	useEffect(() => {
		const currentLettersKey = `${additionalLetters.vowel || ''}-${additionalLetters.consonant || ''}-${additionalLetters.any || ''}`;
		if (currentLettersKey !== lastAdditionalLettersRef.current) {
			hasFilledAdditionalLettersRef.current = false;
			lastAdditionalLettersRef.current = currentLettersKey;
		}
	}, [additionalLetters]);

	// Update userTypedIndices when additionalLettersPositions changes
	useEffect(() => {
		setUserTypedIndices(prev => {
			const updated = new Set(prev);
			additionalLettersPositions.current.forEach(position => {
				updated.delete(position);
			});
			return updated;
		});
	}, [additionalLetters, clueLettersComplete, setUserTypedIndices]);

	// Mark positions as additional letters when validated
	useEffect(() => {
		if (clueLettersComplete && !hasFilledAdditionalLettersRef.current && 
			(additionalLetters.vowel || additionalLetters.consonant) && !isComplete) { 
			
			const wordUpper = word.toUpperCase();
			const additionalToFill: { position: number; letter: string }[] = [];

			if (isComplete) {
				hasFilledAdditionalLettersRef.current = true;
				return;
			}

			if (userInputs.size >= wordUpper.length) {
				hasFilledAdditionalLettersRef.current = true;
				return;
			}

			// Mark ALL matching positions as additional letters, even if already typed
			if (additionalLetters.vowel) {
				const vowelUpper = additionalLetters.vowel.toUpperCase();
				for (let i = 0; i < wordUpper.length; i++) {
					if (wordUpper[i] === vowelUpper) {
						additionalLettersPositions.current.add(i);
						// Only add to fill list if not already in userInputs
						if (!userInputs.has(i)) {
							additionalToFill.push({ position: i, letter: vowelUpper });
						}
					}
				}
			}

			if (additionalLetters.consonant) {
				const consonantUpper = additionalLetters.consonant.toUpperCase();
				for (let i = 0; i < wordUpper.length; i++) {
					if (wordUpper[i] === consonantUpper) {
						additionalLettersPositions.current.add(i);
						// Only add to fill list if not already in userInputs
						if (!userInputs.has(i)) {
							additionalToFill.push({ position: i, letter: consonantUpper });
						}
					}
				}
			}

			if (additionalToFill.length > 0) {
				const filledPositions = new Map<number, string>();
				additionalToFill.forEach(match => {
					filledPositions.set(match.position, match.letter);
				});

				if (onAdditionalLettersFilled) {
					onAdditionalLettersFilled(filledPositions);
				}
			}

			// Remove additional letter positions from userTypedIndices
			setUserTypedIndices(prev => {
				const updated = new Set(prev);
				additionalLettersPositions.current.forEach(position => {
					updated.delete(position);
				});
				return updated;
			});

			hasFilledAdditionalLettersRef.current = true;

			// Call the validation complete callback to move cursor
			if (onValidationComplete) {
				onValidationComplete();
			}

			// Move cursor to next editable position after filling additional letters
			if (findNextEditablePosition && onPositionChange) {
				// Create updated userInputs map that includes the newly filled positions
				const updatedInputs = new Map(userInputs);
				additionalToFill.forEach(match => {
					updatedInputs.set(match.position, match.letter);
				});

				// Find next editable position from current position
				const nextPosition = findNextEditablePosition(
					word,
					updatedInputs,
					currentPosition
				);

				// Move cursor to next editable position
				onPositionChange(nextPosition);
			}
		}
	}, [clueLettersComplete, additionalLetters, word, userInputs, isComplete, onAdditionalLettersFilled, setUserTypedIndices, onValidationComplete, currentPosition, onPositionChange, findNextEditablePosition]);

	return additionalLettersPositions;
}