// components/game_assets/word_clues/ClueGameManager.tsx

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import ClueWord from './ClueWord';
import { useClueManagement } from '@/hooks/clues/useClueManagement';
import { useCursorNavigation } from '@/hooks/clues/useCursorNavigation';
import { useWordValidation } from '@/hooks/clues/useWordValidation';
import { useWinCondition } from '@/hooks/game_wins/useWinCondition';
import { useKeyboardInput } from '@/hooks/keyboard/useKeyboardInput';
import { useInputTracking } from '@/hooks/clues/useInputTracking';
import { useStartingLettersValidation } from '@/hooks/clues/useStartingLettersValidation';
import { BaseCluesData, normalizeCluesData } from '@/hooks/clues/clueTypes';
import { useAutoCompleteShortWords } from '@/hooks/clues/useAutoCompleteShortWords';
import { useFlashState } from '@/hooks/clues/useFlashState';
import { GameConfig } from '@/lib/gameConfig';

interface ClueGameManagerProps {
	clues: BaseCluesData;
	selectedStartingLetters: string;
	additionalLetters?: { vowel?: string; consonant?: string; any?: string };
	onLifeLost: () => void;
	onWin: () => void;
	onShowMessage: (msg: string, type?: 'error' | 'success' | 'info') => void;
	isMessageActive: boolean;
	awaitingAdditionalLetter?: boolean;
	onWordInputsChange?: (inputs: Map<string, string>) => void;
	onVerifiedPositionsChange?: (verified: Map<string, string>) => void;
	bothAdditionalLettersConfirmed?: boolean;
	revealedDashes?: Map<string, Set<number>>;
	revealedLetters?: Map<string, Map<number, string>>;
	dashesCurrentlyAnimating?: Map<string, Set<number>>;
	clueLettersComplete?: boolean;
	onClueSolved?: (clueIndex: number) => void;
	setSolvedClues?: (clues: boolean[] | ((prev: boolean[]) => boolean[])) => void
	clueWordsArray?: string[];
}

export default function ClueGameManager({ 
	clues, 
	selectedStartingLetters,
	additionalLetters = {},
	onLifeLost,
	onWin,
	onShowMessage,
	isMessageActive,
	awaitingAdditionalLetter = false,
	onWordInputsChange,
	onVerifiedPositionsChange,
	bothAdditionalLettersConfirmed = false,
	revealedDashes = new Map(),
	revealedLetters = new Map(),
	dashesCurrentlyAnimating = new Map(),
	clueLettersComplete = false,
	onClueSolved,
	setSolvedClues,
	clueWordsArray = []
}: ClueGameManagerProps) {

	const [shakeWord, setShakeWord] = useState<string | null>(null);
	const [allGuessedLetters, setAllGuessedLetters] = useState<Set<string>>(new Set());
	const [verifiedPositions, setVerifiedPositions] = useState<Map<string, Set<number>>>(new Map());
	const [additionalLetterPositions, setAdditionalLetterPositions] = useState<Map<string, Set<number>>>(new Map());
	const [notifiedSolvedClues, setNotifiedSolvedClues] = useState<Set<number>>(new Set());

	// Per-clue state for clue letters completion
	const [clueLettersCompleteMap, setClueLettersCompleteMap] = useState<Map<string, boolean>>(new Map());
	
	// Use centralized flash state hook
	const { triggerFlash, getFlashState } = useFlashState();
	
	const clueWords = useMemo(() => normalizeCluesData(clues), [clues]);

	const allAvailableLetters = useMemo(() => {
		let letters = selectedStartingLetters;
		if (additionalLetters.vowel) letters += additionalLetters.vowel;
		if (additionalLetters.consonant) letters += additionalLetters.consonant;
		return letters;
	}, [selectedStartingLetters, additionalLetters]);

	const hasUsedAdditionalLetters = !!(
		additionalLetters.vowel || 
		(additionalLetters.consonant)
	);
	
	const bothAdditionalLettersGuessed = useMemo(() => {
		return !!additionalLetters.vowel && !!additionalLetters.consonant;
	}, [additionalLetters]);
	
	const hasAnyCorrectAdditionalLetter = bothAdditionalLettersConfirmed;

	const {
		activeClues,
		userInputs,
		setUserInputs,
		completedWords,
		setCompletedWords,
		startingLettersSet
	} = useClueManagement(clueWords, allAvailableLetters);

	 // After useClueManagement but before other hooks
	useEffect(() => {
		activeClues.forEach(clue => {
			const isAnimating = (dashesCurrentlyAnimating.get(clue)?.size ?? 0) > 0;
			const hasRevealedLetters = (revealedLetters.get(clue)?.size ?? 0) > 0;
			
			// If no letters are animating AND we have revealed letters (or no starting letters at all)
			if (!isAnimating && (hasRevealedLetters || selectedStartingLetters.length === 0)) {
				setClueLettersCompleteMap(prev => {
					if (prev.get(clue) !== true) {
						return new Map(prev).set(clue, true);
					}
					return prev;
				});
			}
		});
		
	}, [activeClues, dashesCurrentlyAnimating, revealedLetters, selectedStartingLetters]);
	useStartingLettersValidation({
		selectedStartingLetters,
		activeClues,
		onLifeLost,
		onShowMessage
	});

	const {
		cursorPosition,
		setCursorPosition,
		findNextIncompleteWord,
		moveToNextPosition,
		moveToPreviousPosition,
		moveToClueAbove,
		moveToClueBelow
	} = useCursorNavigation({
		activeClues,
		userInputs,
		completedWords,
		verifiedPositions,
		startingLetters: selectedStartingLetters,
		hasAnyCorrectAdditionalLetter,
		additionalLetters,
		additionalLetterPositions
	});

	const { submitWord } = useWordValidation(
		userInputs,
		setUserInputs,
		triggerFlash,
		setCompletedWords,
		setCursorPosition,
		findNextIncompleteWord,
		startingLettersSet,
		onLifeLost,
		verifiedPositions,
		setVerifiedPositions,
		onShowMessage,
		setShakeWord,
		setAllGuessedLetters,
		completedWords,
		setSolvedClues || (() => {}),
		clueWordsArray
	);

	const isKeyboardEnabled = !isMessageActive && !awaitingAdditionalLetter && !!cursorPosition;
	useKeyboardInput({
		isEnabled: isKeyboardEnabled,
		activeClues,
		userInputs,
		setUserInputs,
		completedWords,
		verifiedPositions,
		cursorPosition,
		setCursorPosition,
		startingLettersSet,
		submitWord,
		onShowMessage,
		moveToNextPosition,
		moveToPreviousPosition,
		moveToClueAbove,
		moveToClueBelow,
		additionalLetters,
		additionalLetterPositions
	});

	useInputTracking({
		activeClues,
		userInputs,
		verifiedPositions,
		allGuessedLetters,
		onWordInputsChange,
		onVerifiedPositionsChange
	});

	const wordTypes = useMemo(() => [
		clues.clue_1.type, 
		clues.clue_2.type, 
		clues.clue_3.type
	], [clues]);
	
	const solvedClues = useMemo(() => {
		const solved = new Set<number>();
		activeClues.forEach((clue, index) => {
			if (completedWords.has(clue)) solved.add(index);
		});
		return solved;
	}, [activeClues, completedWords]);

	
		useEffect(() => {
		if (!onClueSolved) return;
		
		activeClues.forEach((clue, index) => {
			if (completedWords.has(clue) && !notifiedSolvedClues.has(index)) {
				onClueSolved(index);
				setNotifiedSolvedClues(prev => new Set(prev).add(index));
			}
		});
	}, [completedWords, activeClues, onClueSolved, notifiedSolvedClues]);

	useWinCondition({
		cluesData: clueWords,
		solvedClues,
		onWin,
		isGameOver: false
	});

	const handleWordComplete = useCallback((clue: string) => {
		if (completedWords.has(clue)) {
			return;
		}
		
		const allPositions = new Set<number>();
		for (let i = 0; i < clue.length; i++) {
			allPositions.add(i);
		}
		setVerifiedPositions(prev => new Map(prev).set(clue, allPositions));
		
		onShowMessage(GameConfig.messages.wordCorrect, 'success');
		
		const nextPos = findNextIncompleteWord();
		
		setCompletedWords(prev => new Set(prev).add(clue));
		
		// Use triggerFlash instead of setFlashStates
		triggerFlash(clue, 'green', () => {
			setTimeout(() => {
				if (nextPos) {
					setCursorPosition(nextPos);
				} else {
					setCursorPosition(null);
				}
			}, GameConfig.duration.moveToNextIncompleteWord);
		});
	}, [
		completedWords,
		setVerifiedPositions, 
		triggerFlash, 
		onShowMessage, 
		findNextIncompleteWord, 
		setCompletedWords, 
		setCursorPosition
	]);

	useAutoCompleteShortWords({
		activeClues,
		userInputs,
		startingLetters: selectedStartingLetters,
		additionalLetters,
		onWordComplete: handleWordComplete
	});
	
	const handleAdditionalLettersFilled = useCallback((
		clue: string, 
		clueIndex: number, 
		filledPositions: Map<number, string>
	) => {
		if (completedWords.has(clue)) {
			return;
		}
				
		setUserInputs(prev => {
			const currentWordInputs = prev.get(clue) || new Map();
			const newWordInputs = new Map(currentWordInputs);
			
			filledPositions.forEach((letter, position) => {
				newWordInputs.set(position, letter);
			});
			
			return new Map(prev).set(clue, newWordInputs);
		});
		
		setAdditionalLetterPositions(prev => {
			const currentPositions = prev.get(clue) || new Set();
			const newPositions = new Set(currentPositions);
			
			filledPositions.forEach((letter, position) => {
				newPositions.add(position);
			});
			
			return new Map(prev).set(clue, newPositions);
		});
	}, [completedWords, setUserInputs]);

	const handleCursorClick = useCallback((clue: string, index: number, position: number) => {
		if (completedWords.has(clue)) return;

		const wordInputs = userInputs.get(clue);
		const verified = verifiedPositions.get(clue) || new Set();
		const additionalPositions = additionalLetterPositions.get(clue) || new Set();
		
		if (!wordInputs) return;

		const isVerified = verified.has(position);
		const isAdditionalLetterPosition = additionalPositions.has(position);
		
		const isStartingLetter = wordInputs.has(position) && (() => {
			const letter = wordInputs.get(position)!;
			const clueUpper = clue.toUpperCase();
			const letterUpper = letter.toUpperCase();
			const startingLettersArray = allAvailableLetters.toUpperCase().split('');
			return clueUpper[position] === letterUpper && startingLettersArray.includes(letterUpper);
		})();
		
		if (!isVerified && !isStartingLetter && !isAdditionalLetterPosition) {
			setCursorPosition({ clueIndex: index, position });
		}
	}, [completedWords, userInputs, verifiedPositions, additionalLetterPositions, allAvailableLetters, setCursorPosition]);
	
	if (activeClues.length === 0) return null;

	return (
		<div className="flex flex-col items-start gap-4">
			{activeClues.map((clue, index) => (
				<ClueWord
					key={clue}
					word={clue}
					wordType={wordTypes[index]}
					startingLetters={allAvailableLetters}
					additionalLetters={additionalLetters}
					cursorPosition={cursorPosition?.clueIndex === index ? cursorPosition.position : null}
					flashState={getFlashState(clue)}
					onCursorClick={(position) => handleCursorClick(clue, index, position)}
					isComplete={completedWords.has(clue)}
					userInputs={userInputs.get(clue) || new Map()}
					verifiedPositions={verifiedPositions.get(clue) || new Set()}
					shouldShake={shakeWord === clue}
					onAdditionalLettersFilled={(filledPositions) => handleAdditionalLettersFilled(clue, index, filledPositions)}
					revealedDashIndices={revealedDashes.get(clue) || new Set()}
					revealedSequenceLetters={revealedLetters.get(clue) || new Map()}
					dashesCurrentlyAnimating={dashesCurrentlyAnimating.get(clue) || new Set()}
					clueLettersComplete={clueLettersCompleteMap.get(clue) ?? false} // Use per-clue state
				/>
			))}
		</div>
	);
}