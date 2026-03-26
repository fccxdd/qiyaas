// hooks/keyboard/useKeyboardInput.ts
//
// Handles all keyboard input for the game.
// Collapses useKeyboardArrowNavigation, useLetterInput,
// useLetterReplacement, and useEnterKeyHandler into one file.

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useBackspaceHandler } from './useBackspaceHandler';
import { GameConfig } from '@/lib/gameConfig';

interface CursorPosition {
	clueIndex: number;
	position: number;
}

interface UseKeyboardInputProps {
	isEnabled: boolean;
	activeClues: string[];
	wordInputs: (string | null)[][];
	verified: boolean[][];
	completed: boolean[];
	cursorPosition: CursorPosition | null;
	setCursorPosition: (position: CursorPosition | null) => void;
	startingLettersRef: React.RefObject<Set<string>>;
	submitWord: (clue: string, clueIndex: number) => void;
	onWordInputsChange: (inputs: (string | null)[][]) => void;
	onShowMessage: (msg: string, type?: 'error' | 'success' | 'info', persist?: boolean) => void;
	moveToNextPosition: (allowClueJump?: boolean) => void;
	moveToPreviousPosition: (allowClueJump?: boolean) => void;
	moveToClueAbove: () => void;
	moveToClueBelow: () => void;
	isPositionEditable: (clueIndex: number, position: number) => boolean;
	showConfirmWord?: boolean;
}

export function useKeyboardInput({
	isEnabled,
	activeClues,
	wordInputs,
	verified,
	completed,
	cursorPosition,
	setCursorPosition,
	startingLettersRef,
	submitWord,
	onWordInputsChange,
	onShowMessage,
	moveToNextPosition,
	moveToPreviousPosition,
	moveToClueAbove,
	moveToClueBelow,
	isPositionEditable,
	showConfirmWord = false,
}: UseKeyboardInputProps) {

	const isComposingRef = useRef(false);
	const pendingMoveRef = useRef(false);

	// ── Clear confirmWord message when cursor moves to a different clue ───────
	const prevClueIndexRef = useRef<number | null>(null);

	useEffect(() => {
	if (!cursorPosition) return;
	if (prevClueIndexRef.current !== null && prevClueIndexRef.current !== cursorPosition.clueIndex) {
		const clueIndex = cursorPosition.clueIndex;
		const clue = activeClues[clueIndex];
		const inputs = wordInputs[clueIndex];
		const isAlreadyComplete = inputs?.length === clue?.length && inputs.every(l => l !== null);

		if (isAlreadyComplete) {
			if (showConfirmWord) onShowMessage(GameConfig.messages.confirmWord, 'info', true);
		} else {
			onShowMessage('', 'info', false);
		}
	}	
	prevClueIndexRef.current = cursorPosition.clueIndex;
	}, [cursorPosition?.clueIndex]);

	// ── Backspace ─────────────────────────────────────────────────────────────

	const { handleBackspace } = useBackspaceHandler({
		activeClues,
		wordInputs,
		verified,
		completed,
		cursorPosition,
		setCursorPosition,
		onWordInputsChange,
		startingLettersRef,
	});

	// ── Letter input ──────────────────────────────────────────────────────────
	// Inlined from useLetterInput + useLetterReplacement

	const handleLetterInput = useCallback((key: string) => {
	if (!cursorPosition || !/^[A-Z]$/.test(key)) return;
	if (!isPositionEditable(cursorPosition.clueIndex, cursorPosition.position)) return;
	if (pendingMoveRef.current) return;

	pendingMoveRef.current = true;
	
	const newInputs = wordInputs.map((row, i) => {
		if (i !== cursorPosition.clueIndex) return row;
		const next = [...row];
		next[cursorPosition.position] = key;
		return next;
	});
	onWordInputsChange(newInputs);

	// Check if this letter just completed the word
	const updatedRow = newInputs[cursorPosition.clueIndex];
	const clue = activeClues[cursorPosition.clueIndex];
	const isNowComplete = updatedRow.length === clue.length && updatedRow.every(l => l !== null);
	const lastEditablePos = clue.split('').reduce((last, _, pos) =>
		isPositionEditable(cursorPosition.clueIndex, pos) ? pos : last, -1
	);
	if (isNowComplete && cursorPosition.position === lastEditablePos) {
		if (showConfirmWord) onShowMessage(GameConfig.messages.confirmWord, 'info', true);
	}

	queueMicrotask(() => {
		moveToNextPosition(false);
		pendingMoveRef.current = false;
	});
	}, [cursorPosition, wordInputs, activeClues, isPositionEditable, onWordInputsChange, moveToNextPosition, onShowMessage, showConfirmWord]);
	
	// ── Enter ─────────────────────────────────────────────────────────────────
	// Inlined from useEnterKeyHandler

	const handleEnter = useCallback(() => {
		if (!cursorPosition) return;

		const { clueIndex } = cursorPosition;
		const clue = activeClues[clueIndex];
		const inputs = wordInputs[clueIndex];

		if (!inputs) return;

		const isComplete = inputs.length === clue.length && inputs.every(l => l !== null);

		if (isComplete) {
			onShowMessage('', 'info', false);  // clear confirmWord before submitting
			submitWord(clue, clueIndex);
		} else {
			onShowMessage(GameConfig.messages.wordNotComplete, 'info');
		}
	}, [cursorPosition, activeClues, wordInputs, submitWord, onShowMessage]);

	// ── Main event listener ───────────────────────────────────────────────────

	useEffect(() => {
		if (!isEnabled || !cursorPosition) return;

		const { clueIndex, position } = cursorPosition;
		const isLocked = !isPositionEditable(clueIndex, position);

		const handleCompositionStart = () => {
			isComposingRef.current = true;
		};

		const handleCompositionEnd = (e: CompositionEvent) => {
			isComposingRef.current = false;
			if (isLocked) return;
			const key = e.data?.toUpperCase();
			if (key && /^[A-Z]$/.test(key)) handleLetterInput(key);
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (isComposingRef.current) return;

			switch (e.key) {
				case 'ArrowRight':
					e.preventDefault();
					moveToNextPosition();
					break;
				case 'ArrowLeft':
					e.preventDefault();
					moveToPreviousPosition();
					break;
				case 'ArrowUp':
					e.preventDefault();
					moveToClueAbove();
					break;
				case 'ArrowDown':
					e.preventDefault();
					moveToClueBelow();
					break;
				case 'Enter':
					e.preventDefault();
					handleEnter();
					break;
				case 'Backspace':
					e.preventDefault();
					if (isLocked) {
						moveToPreviousPosition();
					} else {
						onShowMessage('', 'info', false); // clear confirmWord on backspace
						handleBackspace();
					}
					break;
				default: {
					const key = e.key.toUpperCase();
					if (/^[A-Z]$/.test(key)) {
						e.preventDefault();
						if (!isLocked) handleLetterInput(key);
					}
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('compositionstart', handleCompositionStart);
		window.addEventListener('compositionend', handleCompositionEnd);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('compositionstart', handleCompositionStart);
			window.removeEventListener('compositionend', handleCompositionEnd);
		};
	}, [
		isEnabled,
		cursorPosition,
		isPositionEditable,
		handleLetterInput,
		handleEnter,
		handleBackspace,
		moveToNextPosition,
		moveToPreviousPosition,
		moveToClueAbove,
		moveToClueBelow,
	]);
}