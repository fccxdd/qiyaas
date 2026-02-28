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
	verified: boolean[][];
}

export function useAutoCompleteWords({
	activeClues,
	wordInputs,
	sequenceRevealed,
	completed,
	verified,
	onWordComplete,
}: UseAutoCompleteWordsProps) {

	const autoCompletedRef = useRef<Set<number>>(new Set());

	useEffect(() => {
		activeClues.forEach((clue, clueIndex) => {
			// Skip already completed or already auto-completed
			if (completed[clueIndex] || autoCompletedRef.current.has(clueIndex)) return;

			const inputs = wordInputs[clueIndex];
			const verifiedRow = verified[clueIndex];


			if (!inputs || !verifiedRow) return;

            // All positions must be filled, correct, and verified (i.e. from reveal)
            const allVerifiedAndCorrect = clue.split('').every((char, pos) =>
                inputs[pos]?.toUpperCase() === char.toUpperCase() && verifiedRow[pos] === true
            );
            if (!allVerifiedAndCorrect) return;

            autoCompletedRef.current.add(clueIndex);
            onWordComplete(clueIndex);
		});
	}, [activeClues, wordInputs, verified, completed, onWordComplete]);
}