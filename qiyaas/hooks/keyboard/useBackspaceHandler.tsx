// hooks/keyboard/useBackspaceHandler.tsx

'use client';

import { useCallback } from 'react';

interface CursorPosition {
	clueIndex: number;
	position: number;
}

interface UseBackspaceHandlerProps {
	activeClues: string[];
	wordInputs: (string | null)[][];
	verified: boolean[][];
	completed: boolean[];
	cursorPosition: CursorPosition | null;
	setCursorPosition: (position: CursorPosition) => void;
	onWordInputsChange: (inputs: (string | null)[][]) => void;
	startingLettersRef: React.RefObject<Set<string>>;
}

export function useBackspaceHandler({
	activeClues,
	wordInputs,
	verified,
	completed,
	cursorPosition,
	setCursorPosition,
	onWordInputsChange,
	startingLettersRef,
}: UseBackspaceHandlerProps) {

	const isStartingLetter = useCallback((clueIndex: number, pos: number): boolean => {
		const char = activeClues[clueIndex]?.[pos]?.toUpperCase();
		return !!(char && startingLettersRef.current?.has(char));
	}, [activeClues, startingLettersRef]);

	const isProtected = useCallback((clueIndex: number, pos: number): boolean => {
		if (verified[clueIndex]?.[pos]) return true;
		if (isStartingLetter(clueIndex, pos)) return true;
		return false;
	}, [verified, isStartingLetter]);

	const canDelete = useCallback((clueIndex: number, pos: number): boolean => {
		if (isProtected(clueIndex, pos)) return false;
		return wordInputs[clueIndex]?.[pos] !== null;
	}, [wordInputs, isProtected]);

	const handleBackspace = useCallback(() => {
		if (!cursorPosition) return;

		const { clueIndex, position } = cursorPosition;

		// If cursor is on a deletable letter, delete in place — no navigation
		if (canDelete(clueIndex, position)) {
			const newInputs = wordInputs.map((row, i) => {
				if (i !== clueIndex) return row;
				const next = [...row];
				next[position] = null;
				return next;
			});
			onWordInputsChange(newInputs);
			return;
		}

		// Navigate backwards, skipping protected positions.
		// Compute full target first — one state update, no visible bounce.
		let targetClueIndex = clueIndex;
		let targetPos = position - 1;

		// Skip protected positions in current word
		while (targetPos >= 0 && isProtected(clueIndex, targetPos)) {
			targetPos--;
		}

		// Ran off the start — look at previous incomplete words
		if (targetPos < 0) {
			for (let i = clueIndex - 1; i >= 0; i--) {
				if (completed[i]) continue;
				targetClueIndex = i;
				targetPos = activeClues[i].length - 1;

				while (targetPos >= 0 && isProtected(i, targetPos)) {
					targetPos--;
				}

				if (targetPos >= 0) break;
			}
		}

		if (targetPos < 0) return;

		// Move cursor and delete together — no bounce
		setCursorPosition({ clueIndex: targetClueIndex, position: targetPos });

		if (canDelete(targetClueIndex, targetPos)) {
			const newInputs = wordInputs.map((row, i) => {
				if (i !== targetClueIndex) return row;
				const next = [...row];
				next[targetPos] = null;
				return next;
			});
			onWordInputsChange(newInputs);
		}
	}, [
		cursorPosition,
		activeClues,
		wordInputs,
		completed,
		canDelete,
		isProtected,
		onWordInputsChange,
		setCursorPosition,
	]);

	return { handleBackspace };
}