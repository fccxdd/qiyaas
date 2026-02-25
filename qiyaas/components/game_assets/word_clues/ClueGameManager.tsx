// components/game_assets/word_clues/ClueGameManager.tsx

'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ClueWord from './ClueWord';
import { useCursorNavigation } from '@/hooks/clues/useCursorNavigation';
import { useWordValidation } from '@/hooks/clues/useWordValidation';
import { useWinCondition } from '@/hooks/game_wins/useWinCondition';
import { useKeyboardInput } from '@/hooks/keyboard/useKeyboardInput';
import { useStartingLettersValidation } from '@/hooks/clues/useStartingLettersValidation';
import { useFlashState } from '@/hooks/clues/useFlashState';
import { normalizeCluesData, getClueWordsArray, BaseCluesData } from '@/hooks/clues/clueTypes';
import { GameConfig } from '@/lib/gameConfig';

type LetterStatus = { [letter: string]: 'used_up' | 'still_available' | 'unused' };

interface RevealAnimation {
	dashesRevealed: Set<number>[];
	dashesAnimating: Set<number>[];
	lettersRevealed: (string | null)[][];
}

interface ClueGameManagerProps {
	clues: BaseCluesData;
	selectedStartingLetters: string;
	wordInputs: (string | null)[][];
	verified: boolean[][];
	completed: boolean[];
	cursorPosition: { clueIndex: number; position: number } | null;
	onWordInputsChange: (inputs: (string | null)[][]) => void;
	onVerifiedChange: (verified: boolean[][]) => void;
	onCompletedChange: (completed: boolean[]) => void;
	onCursorChange: (pos: { clueIndex: number; position: number } | null) => void;
	onLifeLost: () => void;
	onWin: () => void;
	onShowMessage: (msg: string, type?: 'error' | 'success' | 'info') => void;
	isMessageActive: boolean;
	isGameOver: boolean;
	revealAnimation?: RevealAnimation;
	onClueSolved: (clueIndex: number) => void;
	letterStatus?: LetterStatus;
	hasLostLifeForNoStartingLetters: boolean;
	setHasLostLifeForNoStartingLetters: (value: boolean) => void;
  	onGuessSubmitted?: (clueIndex: number, word: string) => void;
}

export default function ClueGameManager({
	clues,
	selectedStartingLetters,
	wordInputs,
	verified,
	completed,
	cursorPosition,
	onWordInputsChange,
	onVerifiedChange,
	onCompletedChange,
	onCursorChange,
	onLifeLost,
	onWin,
	onShowMessage,
	isMessageActive,
	isGameOver,
	revealAnimation,
	onClueSolved,
	letterStatus = {},
	hasLostLifeForNoStartingLetters,
	setHasLostLifeForNoStartingLetters,
  	onGuessSubmitted = () => {}
}: ClueGameManagerProps) {

	const [shakeWord, setShakeWord] = useState<string | null>(null);
	const { triggerFlash, getFlashState } = useFlashState();

	const startingLettersRef = useRef<Set<string>>(
		new Set(selectedStartingLetters.toUpperCase().split(''))
	);
	useEffect(() => {
		startingLettersRef.current = new Set(selectedStartingLetters.toUpperCase().split(''));
	}, [selectedStartingLetters]);

	const clueWords = useMemo(() => normalizeCluesData(clues), [clues]);
	const activeClues = useMemo(() => getClueWordsArray(clues), [clues]);

	const wordTypes = useMemo(() => [
		clues.clue_1.type,
		clues.clue_2.type,
		clues.clue_3.type,
	], [clues]);

	// ── Position editability ──────────────────────────────────────────────────

	const isPositionEditable = useCallback((clueIndex: number, position: number): boolean => {
		if (verified[clueIndex]?.[position]) return false;
		const char = activeClues[clueIndex]?.[position]?.toUpperCase();
		if (char && startingLettersRef.current.has(char)) return false;
		return true;
	}, [verified, activeClues]);

	// ── Cursor navigation ─────────────────────────────────────────────────────

	const {
		findNextIncompleteWord,
		moveToNextPosition,
		moveToPreviousPosition,
		moveToClueAbove,
		moveToClueBelow,
	} = useCursorNavigation({
		activeClues,
		completed,
		cursorPosition,
		setCursorPosition: onCursorChange,
		isPositionEditable,
	});

	const setCursorPosition = useCallback((
		pos: { clueIndex: number; position: number } | null
	) => onCursorChange(pos), [onCursorChange]);

	// ── Find next incomplete word ─────────────────────────────────────────────
	// Takes explicit completed array to avoid stale closure after word is solved.

	const findNextIncompleteWordFrom = useCallback((
		currentCompleted: boolean[],
		fromClueIndex: number,
	): { clueIndex: number; position: number } | null => {
		for (let i = fromClueIndex + 1; i < activeClues.length; i++) {
			if (currentCompleted[i]) continue;
			for (let pos = 0; pos < activeClues[i].length; pos++) {
				if (isPositionEditable(i, pos)) return { clueIndex: i, position: pos };
			}
		}
		for (let i = 0; i < fromClueIndex; i++) {
			if (currentCompleted[i]) continue;
			for (let pos = 0; pos < activeClues[i].length; pos++) {
				if (isPositionEditable(i, pos)) return { clueIndex: i, position: pos };
			}
		}
		return null;
	}, [activeClues, isPositionEditable]);

	// ── Word complete ─────────────────────────────────────────────────────────

	const handleWordComplete = useCallback((clueIndex: number) => {
		if (completed[clueIndex]) return;

		const clue = activeClues[clueIndex];
		if (!clue) return;

		const newVerified = verified.map((row, i) =>
			i === clueIndex ? Array(clue.length).fill(true) : row
		);
		onVerifiedChange(newVerified);

		const newCompleted = completed.map((c, i) => i === clueIndex ? true : c);
		onCompletedChange(newCompleted);

		onShowMessage(GameConfig.messages.wordCorrect, 'success');
		onClueSolved(clueIndex);

		const nextPos = findNextIncompleteWordFrom(newCompleted, clueIndex);

		triggerFlash(clue, 'green', () => {
			setTimeout(() => {
				setCursorPosition(nextPos ?? null);
			}, GameConfig.duration.moveToNextIncompleteWord);
		});
	}, [
		completed, activeClues, verified,
		onVerifiedChange, onCompletedChange,
		onShowMessage, onClueSolved,
		findNextIncompleteWordFrom, triggerFlash, setCursorPosition,
	]);

	// ── Set initial cursor for pre-filled games (no revealAnimation) ──────────

	useEffect(() => {
		if (revealAnimation || cursorPosition) return;
		const nextPos = findNextIncompleteWord();
		if (nextPos) setCursorPosition(nextPos);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Word validation ───────────────────────────────────────────────────────

	const { submitWord } = useWordValidation({
		activeClues,
		wordInputs,
		verified,
		completed,
		cursorPosition,
		onWordInputsChange,
		onVerifiedChange,
		onWordComplete: handleWordComplete,
		onLifeLost,
		onShowMessage,
		setShakeWord,
		triggerFlash,
		setCursorPosition,
		findNextIncompleteWord,
    	onGuessSubmitted
	});

	// ── Keyboard ──────────────────────────────────────────────────────────────

	useKeyboardInput({
		isEnabled: !isMessageActive && !!cursorPosition && !isGameOver,
		activeClues,
		wordInputs,
		onWordInputsChange,
		completed,
		verified,
		cursorPosition,
		setCursorPosition,
		startingLettersRef,
		submitWord,
		onShowMessage,
		moveToNextPosition,
		moveToPreviousPosition,
		moveToClueAbove,
		moveToClueBelow,
		isPositionEditable,
	});

	// ── Starting letters validation ───────────────────────────────────────────

	useStartingLettersValidation({
		selectedStartingLetters,
		activeClues,
		onLifeLost,
		onShowMessage,
		hasLostLifeForNoStartingLetters,
		setHasLostLifeForNoStartingLetters,
	});

	// ── Win condition ─────────────────────────────────────────────────────────

	useWinCondition({ completed, onWin, isGameOver });

	// ── Cursor click ──────────────────────────────────────────────────────────

	const handleCursorClick = useCallback((clueIndex: number, position: number) => {
		if (completed[clueIndex]) return;
		if (!isPositionEditable(clueIndex, position)) return;
		setCursorPosition({ clueIndex, position });
	}, [completed, isPositionEditable, setCursorPosition]);

	// ── Render ────────────────────────────────────────────────────────────────

	if (activeClues.length === 0) return null;

	return (
		<div className="flex flex-col items-start gap-4">
			{activeClues.map((clue, index) => (
				<ClueWord
					key={clue}
					word={clue}
					wordType={wordTypes[index]}
					cursorPosition={cursorPosition?.clueIndex === index ? cursorPosition.position : null}
					onCursorClick={(position) => handleCursorClick(index, position)}
					flashState={getFlashState(clue)}
					isComplete={completed[index]}
					inputs={wordInputs[index] ?? []}
					verified={verified[index] ?? []}
					shouldShake={shakeWord === clue}
					isLocked={isGameOver}
					revealAnimation={revealAnimation ? {
						dashesRevealed: revealAnimation.dashesRevealed[index] ?? new Set(),
						dashesAnimating: revealAnimation.dashesAnimating[index] ?? new Set(),
						lettersRevealed: revealAnimation.lettersRevealed[index] ?? [],
					} : undefined}
					letterStatus={letterStatus}
				/>
			))}
		</div>
	);
}