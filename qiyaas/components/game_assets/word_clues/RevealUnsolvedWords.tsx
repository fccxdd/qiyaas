// components/game_assets/word_clues/RevealUnsolvedWords.tsx
//
// Reveals unsolved words letter by letter when the player loses.
// Fires onRevealComplete when done so PlayMode knows to show the game over modal.

'use client';

import { useEffect, useRef } from 'react';
import { getClueAnswers } from './ExtractAnswer';
import { GameConfig } from '@/lib/gameConfig';

interface RevealUnsolvedWordsProps {
	isGameOver: boolean;
	hasWon: boolean;
	completed: boolean[];
	clueWordsArray: string[];
	wordInputs: (string | null)[][];
	onWordInputsSync: (inputs: (string | null)[][]) => void;
	sequenceRevealed: (string | null)[][];
	verified: boolean[][];
	onVerifiedSync: (verified: boolean[][]) => void;
	onSilentRevealSync: (revealed: boolean[]) => void;
	onCompletedChange: (completed: boolean[]) => void;
	onRevealComplete: () => void;
	hasRevealedOnLoss: boolean;
}

export default function RevealUnsolvedWords({
	isGameOver,
	hasWon,
	completed,
	clueWordsArray,
	wordInputs,
	onWordInputsSync,
	sequenceRevealed,
	verified,
	onVerifiedSync,
	onSilentRevealSync,
	onCompletedChange,
	onRevealComplete,
	hasRevealedOnLoss,
}: RevealUnsolvedWordsProps) {
	const hasRevealed = useRef(false);

	// Mutable refs so timeout callbacks always read latest state
	const wordInputsRef = useRef(wordInputs);
	const verifiedRef = useRef(verified);
	const completedRef = useRef(completed);

	useEffect(() => { wordInputsRef.current = wordInputs; }, [wordInputs]);
	useEffect(() => { verifiedRef.current = verified; }, [verified]);
	useEffect(() => { completedRef.current = completed; }, [completed]);

	useEffect(() => {
		if (!isGameOver || hasWon || hasRevealed.current || hasRevealedOnLoss) return;

		hasRevealed.current = true;

		const { clueAnswers } = getClueAnswers();

		// Collect all empty positions across all unsolved words
		const positions: Array<{ clueIndex: number; position: number; letter: string }> = [];
		const silentRevealed = [false, false, false];

		clueWordsArray.forEach((word, clueIndex) => {
			if (completed[clueIndex] || !clueAnswers[clueIndex]) return;

			const answer = clueAnswers[clueIndex].toUpperCase();
			const currentInputs = wordInputs[clueIndex] ?? [];
			const revealed = sequenceRevealed[clueIndex] ?? [];

			for (let pos = 0; pos < answer.length; pos++) {
				const alreadyCorrect = currentInputs[pos]?.toUpperCase() === answer[pos];
				if (!alreadyCorrect && !revealed[pos]) {
					positions.push({ clueIndex, position: pos, letter: answer[pos] });
					silentRevealed[clueIndex] = true;
				}
			}
		});

		// Nothing to reveal — fire complete immediately
		if (positions.length === 0) {
			onRevealComplete();
			return;
		}

		onSilentRevealSync(silentRevealed);

		// Wait for loss message to show before starting reveal
		const START_DELAY = 3000;

		const startTimeout = setTimeout(() => {
			positions.forEach(({ clueIndex, position, letter }, index) => {
				const t = setTimeout(() => {
					// Update inputs
					const newInputs = wordInputsRef.current.map((row, i) => {
						if (i !== clueIndex) return row;
						const next = [...row];
						next[position] = letter;
						return next;
					});
					wordInputsRef.current = newInputs;
					onWordInputsSync(newInputs);

					// Mark position as verified (green)
					const newVerified = verifiedRef.current.map((row, i) => {
						if (i !== clueIndex) return row;
						const next = [...row];
						next[position] = true;
						return next;
					});
					verifiedRef.current = newVerified;
					onVerifiedSync(newVerified);

					// Check if this word is now fully revealed
					const newInputsForWord = wordInputsRef.current[clueIndex];
					const wordLength = clueWordsArray[clueIndex].length;
					const isFull = newInputsForWord.length === wordLength &&
						newInputsForWord.every(l => l !== null);

					if (isFull && !completedRef.current[clueIndex]) {
						const newCompleted = [...completedRef.current];
						newCompleted[clueIndex] = true;
						completedRef.current = newCompleted;
						onCompletedChange(newCompleted);
					}

					// Last letter — fire complete
					if (index === positions.length - 1) {
						setTimeout(() => onRevealComplete(), 100);
					}
				}, index * GameConfig.duration.revealLetterDelay);

				return t;
			});
		}, START_DELAY);

		return () => clearTimeout(startTimeout);
	}, [isGameOver, hasWon, hasRevealedOnLoss]);

	return null;
}