// hooks/clues/UseRevealLetter.tsx
//
// Two-phase animation for starting letters in clue dashes:
// Phase 1 — green dashes appear one by one
// Phase 2 — letters bounce in above each dash
//
// Both phases start simultaneously with the starting letter color reveal.
// On refresh, saved state is restored instantly with no animation.

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface UseRevealLetterParams {
	startingLetters: string;
	clueWords: string[];
	triggered: boolean;
	initialRevealedLetters?: (string | null)[][];
	isAlreadyComplete?: boolean;
}

interface RevealAnimation {
	dashesRevealed: Set<number>[];
	dashesAnimating: Set<number>[];
	lettersRevealed: (string | null)[][];
	isComplete: boolean;
	lettersComplete: boolean;
}

export function UseRevealLetter({
	startingLetters,
	clueWords,
	triggered,
	initialRevealedLetters = [[], [], []],
	isAlreadyComplete = false,
}: UseRevealLetterParams): RevealAnimation {

	const hasSavedLetters = initialRevealedLetters.some(arr => arr.some(l => l !== null));

	// Initialize state directly from storage on refresh — no effect needed
	const [dashesRevealed, setDashesRevealed] = useState<Set<number>[]>(() => {
		if (isAlreadyComplete && hasSavedLetters) {
			return initialRevealedLetters.map(arr =>
				new Set(arr.map((l, i) => l !== null ? i : -1).filter(i => i !== -1))
			);
		}
		return clueWords.map(() => new Set<number>());
	});

	const [dashesAnimating, setDashesAnimating] = useState<Set<number>[]>(() =>
		clueWords.map(() => new Set<number>())
	);

	const [lettersRevealed, setLettersRevealed] = useState<(string | null)[][]>(() => {
		if (isAlreadyComplete && hasSavedLetters) {
			return initialRevealedLetters.map(arr => arr.map(l => l ?? null));
		}
		return clueWords.map(w => Array(w.length).fill(null));
	});

	const [isComplete, setIsComplete] = useState(() => isAlreadyComplete && hasSavedLetters);

	// On refresh, skip animation entirely
	const hasAnimatedRef = useRef(isAlreadyComplete);
	const animatedKeysRef = useRef<Set<string>>(new Set());
	const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

	const clearAllTimeouts = useCallback(() => {
		timeoutsRef.current.forEach(t => clearTimeout(t));
		timeoutsRef.current = [];
	}, []);

	// Pre-populate animatedKeys from saved state so positions are never re-animated
	useEffect(() => {
		if (!isAlreadyComplete) return;
		initialRevealedLetters.forEach((arr, clueIndex) => {
			arr.forEach((l, pos) => {
				if (l !== null) animatedKeysRef.current.add(`${clueIndex}-${pos}`);
			});
		});
	}, []);

	// ── Reset when starting letters change (pre-game only) ───────────────────

	useEffect(() => {
		if (hasAnimatedRef.current) return;

		clearAllTimeouts();
		setDashesRevealed(clueWords.map(() => new Set()));
		setDashesAnimating(clueWords.map(() => new Set()));
		setLettersRevealed(clueWords.map(w => Array(w.length).fill(null)));
		setIsComplete(false);
		animatedKeysRef.current = new Set();
	}, [startingLetters]);

	// ── Main animation ────────────────────────────────────────────────────────
	// Runs once when game starts for the first time (not on refresh).

	useEffect(() => {
		if (!triggered || hasAnimatedRef.current) return;
		if (isAlreadyComplete) return;
		if (!startingLetters || clueWords.length === 0) return;

		hasAnimatedRef.current = true;

		const startingSet = new Set(startingLetters.toUpperCase().split(''));
		const positions: Array<{ clueIndex: number; position: number; letter: string }> = [];

		clueWords.forEach((word, clueIndex) => {
			word.toUpperCase().split('').forEach((char, pos) => {
				const key = `${clueIndex}-${pos}`;
				if (startingSet.has(char) && !animatedKeysRef.current.has(key)) {
					positions.push({ clueIndex, position: pos, letter: char });
					animatedKeysRef.current.add(key);
				}
			});
		});

		if (positions.length === 0) {
			setIsComplete(true);
			return;
		}

		const dashDelay = GameConfig.duration.clueDashRevealDelay;
		const letterDelay = GameConfig.duration.startingLetterBounceDelay;

		// Phase 1 — green dashes appear one by one
		positions.forEach(({ clueIndex, position }, i) => {
			const t = setTimeout(() => {
				setDashesAnimating(prev => {
					const next = prev.map(s => new Set(s));
					next[clueIndex].add(position);
					return next;
				});
				setDashesRevealed(prev => {
					const next = prev.map(s => new Set(s));
					next[clueIndex].add(position);
					return next;
				});

				const endT = setTimeout(() => {
					setDashesAnimating(prev => {
						const next = prev.map(s => new Set(s));
						next[clueIndex].delete(position);
						return next;
					});
				}, 300);
				timeoutsRef.current.push(endT);
			}, i * dashDelay);
			timeoutsRef.current.push(t);
		});

		// Phase 2 — letters bounce in after dashes done
		const dashPhaseEnd = positions.length * dashDelay + 300;

		positions.forEach(({ clueIndex, position, letter }, i) => {
			const t = setTimeout(() => {
				setLettersRevealed(prev => {
					const next = prev.map(arr => [...arr]);
					next[clueIndex][position] = letter;
					return next;
				});

				// Mark complete after the very last letter is placed
				if (i === positions.length - 1) {
					const completeT = setTimeout(
						() => setIsComplete(true),
						GameConfig.duration.greencursorDuration
					);
					timeoutsRef.current.push(completeT);
				}
			}, dashPhaseEnd + i * letterDelay);
			timeoutsRef.current.push(t);
		});

	}, [triggered, startingLetters, clueWords]);

	useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

	// lettersComplete — true once all starting letter positions have been filled.
	// Used to enable the keyboard after phase 2 finishes (not after phase 1).
	const startingSet = new Set(startingLetters.toUpperCase().split(''));
	const lettersComplete = (isAlreadyComplete && hasSavedLetters) || clueWords.every((word, i) =>
		word.toUpperCase().split('').every((char, pos) =>
			!startingSet.has(char) || lettersRevealed[i]?.[pos] !== null
		)
	);

	return { dashesRevealed, dashesAnimating, lettersRevealed, isComplete, lettersComplete };
}