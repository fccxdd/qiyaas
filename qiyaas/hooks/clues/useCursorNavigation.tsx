// hooks/clues/useCursorNavigation.tsx
//
// Cursor navigation for arrow keys and finding the next incomplete word.
// Collapses useHorizontalNavigation and useVerticalNavigation into one file.

'use client';

import { useCallback } from 'react';

interface CursorPosition {
	clueIndex: number;
	position: number;
}

interface UseCursorNavigationProps {
	activeClues: string[];
	completed: boolean[];
	cursorPosition: CursorPosition | null;
	setCursorPosition: (pos: CursorPosition | null) => void;
	isPositionEditable: (clueIndex: number, position: number) => boolean;
}

export function useCursorNavigation({
	activeClues,
	completed,
	cursorPosition,
	setCursorPosition,
	isPositionEditable,
}: UseCursorNavigationProps) {

	// ── Helpers ───────────────────────────────────────────────────────────────

	// First editable position in a word, or null if fully locked
	const findFirstEditable = useCallback((clueIndex: number): CursorPosition | null => {
		const clue = activeClues[clueIndex];
		if (!clue) return null;
		for (let pos = 0; pos < clue.length; pos++) {
			if (isPositionEditable(clueIndex, pos)) return { clueIndex, position: pos };
		}
		return null;
	}, [activeClues, isPositionEditable]);

	// Closest editable position to a target column in a word
	const findClosestEditable = useCallback((clueIndex: number, targetPos: number): CursorPosition | null => {
		const clue = activeClues[clueIndex];
		if (!clue) return null;

		let closest: CursorPosition | null = null;
		let minDistance = Infinity;

		for (let pos = 0; pos < clue.length; pos++) {
			if (isPositionEditable(clueIndex, pos)) {
				const distance = Math.abs(pos - targetPos);
				if (distance < minDistance) {
					minDistance = distance;
					closest = { clueIndex, position: pos };
				}
			}
		}
		return closest;
	}, [activeClues, isPositionEditable]);

	// ── Find next incomplete word ─────────────────────────────────────────────

	const findNextIncompleteWord = useCallback((): CursorPosition | null => {
		const searchFrom = cursorPosition ? cursorPosition.clueIndex + 1 : 0;

		// Forward from current word
		for (let i = searchFrom; i < activeClues.length; i++) {
			if (completed[i]) continue;
			const pos = findFirstEditable(i);
			if (pos) return pos;
		}

		// Wrap around
		const searchTo = cursorPosition ? cursorPosition.clueIndex : activeClues.length;
		for (let i = 0; i < searchTo; i++) {
			if (completed[i]) continue;
			const pos = findFirstEditable(i);
			if (pos) return pos;
		}

		return null;
	}, [activeClues, completed, cursorPosition, findFirstEditable]);

	// ── Horizontal navigation ─────────────────────────────────────────────────

	const moveToNextPosition = useCallback((allowClueJump = true) => {
		if (!cursorPosition) return;
		const { clueIndex, position } = cursorPosition;
		const clue = activeClues[clueIndex];

		// Next editable in current word
		for (let i = position + 1; i < clue.length; i++) {
			if (isPositionEditable(clueIndex, i)) {
				setCursorPosition({ clueIndex, position: i });
				return;
			}
		}

		if (!allowClueJump) return;

		// Jump to next incomplete word
		for (let i = clueIndex + 1; i < activeClues.length; i++) {
			if (completed[i]) continue;
			const pos = findFirstEditable(i);
			if (pos) { setCursorPosition(pos); return; }
		}
	}, [cursorPosition, activeClues, completed, isPositionEditable, setCursorPosition, findFirstEditable]);

	const moveToPreviousPosition = useCallback((allowClueJump = true) => {
		if (!cursorPosition) return;
		const { clueIndex, position } = cursorPosition;
		const clue = activeClues[clueIndex];

		// Previous editable in current word
		for (let i = position - 1; i >= 0; i--) {
			if (isPositionEditable(clueIndex, i)) {
				setCursorPosition({ clueIndex, position: i });
				return;
			}
		}

		if (!allowClueJump) return;

		// Jump to previous incomplete word
		for (let i = clueIndex - 1; i >= 0; i--) {
			if (completed[i]) continue;
			const clueLen = activeClues[i].length;
			// Find last editable in that word
			for (let j = clueLen - 1; j >= 0; j--) {
				if (isPositionEditable(i, j)) {
					setCursorPosition({ clueIndex: i, position: j });
					return;
				}
			}
		}
	}, [cursorPosition, activeClues, completed, isPositionEditable, setCursorPosition]);

	// ── Vertical navigation ───────────────────────────────────────────────────

	const moveToClueAbove = useCallback(() => {
		if (!cursorPosition) return;
		const { clueIndex, position } = cursorPosition;

		for (let i = clueIndex - 1; i >= 0; i--) {
			if (completed[i]) continue;
			// Try same column first, then closest
			if (position < activeClues[i].length && isPositionEditable(i, position)) {
				setCursorPosition({ clueIndex: i, position });
				return;
			}
			const closest = findClosestEditable(i, position);
			if (closest) { setCursorPosition(closest); return; }
		}
	}, [cursorPosition, activeClues, completed, isPositionEditable, setCursorPosition, findClosestEditable]);

	const moveToClueBelow = useCallback(() => {
		if (!cursorPosition) return;
		const { clueIndex, position } = cursorPosition;

		for (let i = clueIndex + 1; i < activeClues.length; i++) {
			if (completed[i]) continue;
			// Try same column first, then closest
			if (position < activeClues[i].length && isPositionEditable(i, position)) {
				setCursorPosition({ clueIndex: i, position });
				return;
			}
			const closest = findClosestEditable(i, position);
			if (closest) { setCursorPosition(closest); return; }
		}
	}, [cursorPosition, activeClues, completed, isPositionEditable, setCursorPosition, findClosestEditable]);

	// ── Return ────────────────────────────────────────────────────────────────

	return {
		findNextIncompleteWord,
		moveToNextPosition,
		moveToPreviousPosition,
		moveToClueAbove,
		moveToClueBelow,
	};
}