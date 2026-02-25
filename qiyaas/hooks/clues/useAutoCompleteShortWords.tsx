// hooks/clues/useAutoCompleteShortWords.tsx
//
// Auto-completes a word ONLY when the reveal animation has filled ALL positions.
// Never fires for player-typed letters, even if the word is correct.

'use client';

import { useEffect, useRef } from 'react';

interface UseAutoCompleteWordsProps {
	activeClues: string[];
	wordInputs: (string | null)[][];
	sequenceRevealed: (string | null)[][];  // letters placed by reveal animation
	completed: boolean[];
	onWordComplete: (clueIndex: number) => void;
}

export function useAutoCompleteWords({
	activeClues,
	wordInputs,
	sequenceRevealed,
	completed,
	onWordComplete,
}: UseAutoCompleteWordsProps) {

	const autoCompletedRef = useRef<Set<number>>(new Set());

	useEffect(() => {
		activeClues.forEach((clue, clueIndex) => {
			// Skip already completed or already auto-completed
			if (completed[clueIndex] || autoCompletedRef.current.has(clueIndex)) return;

			const revealed = sequenceRevealed[clueIndex];
			const inputs = wordInputs[clueIndex];

			if (!revealed || !inputs) return;

			// Every position must have been filled by the reveal animation
			const allFromReveal = clue.split('').every((_, pos) =>
				revealed[pos] !== null && revealed[pos] !== undefined
			);
			if (!allFromReveal) return;

			// Every position must match the clue
			const allMatch = clue.split('').every((char, pos) =>
				inputs[pos]?.toUpperCase() === char.toUpperCase()
			);
			if (!allMatch) return;

			autoCompletedRef.current.add(clueIndex);
			onWordComplete(clueIndex);
		});
	}, [activeClues, wordInputs, sequenceRevealed, completed, onWordComplete]);
}