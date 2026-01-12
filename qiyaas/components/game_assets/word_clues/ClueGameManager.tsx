// components/game_assets/word_clues/ClueGameManager.tsx

'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ClueWord from './ClueWord';
import { useClueManagement } from '@/hooks/clues/useClueManagement';
import { useCursorNavigation } from '@/hooks/clues/useCursorNavigation';
import { useWordValidation } from '@/hooks/clues/useWordValidation';
import { useWinCondition } from '@/hooks/game_wins/useWinCondition';
import { useKeyboardInput } from '@/hooks/keyboard/useKeyboardInput';
import { useInputTracking } from '@/hooks/clues/useInputTracking';
import { useStartingLettersValidation } from '@/hooks/clues/useStartingLettersValidation';
import { usePositionEditability } from '@/hooks/clues/usePositionEditability';
import { BaseCluesData, normalizeCluesData, getClueWordsArray } from '@/hooks/clues/clueTypes';
import { useFlashState } from '@/hooks/clues/useFlashState';
import { useAutoCompleteWords } from '@/hooks/clues/useAutoCompleteShortWords';
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
	setSolvedClues?: (clues: boolean[] | ((prev: boolean[]) => boolean[])) => void;
	clueWordsArray?: string[];
	initialCompletedWords?: Set<string>;
	onCompletedWordsChange?: (completedWords: Set<string>) => void;
	initialVerifiedPositions?: Map<string, Set<number>>;
	onVerifiedPositionsSync?: (verifiedPositions: Map<string, Set<number>>) => void;
	initialUserInputs?: Map<string, Map<number, string>>; 
	onUserInputsSync?: (userInputs: Map<string, Map<number, string>>) => void; 
	hasLostLifeForNoStartingLetters: boolean; 
	setHasLostLifeForNoStartingLetters: (value: boolean) => void;
	onWordAutoComplete?: (handler: (clue: string) => void) => void;
	initialCursorPosition?: { clueIndex: number; position: number } | null;
	onCursorPositionChange?: (position: { clueIndex: number; position: number } | null) => void;
	silentRevealedWords?: Set<string>;
	autoRevealedPositions?: Map<string, Set<number>>;
	isGameOver?: boolean;
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
	clueWordsArray = [],
	initialCompletedWords = new Set(),
	onCompletedWordsChange,
	initialVerifiedPositions = new Map(),
	onVerifiedPositionsSync,
	initialUserInputs = new Map(), 
	onUserInputsSync, 
	hasLostLifeForNoStartingLetters,
	setHasLostLifeForNoStartingLetters,
	onWordAutoComplete,
	initialCursorPosition = null,
	onCursorPositionChange,
	silentRevealedWords = new Set(),
	autoRevealedPositions = new Map(),
	isGameOver = false
}: ClueGameManagerProps) {

	const [shakeWord, setShakeWord] = useState<string | null>(null);
	const [allGuessedLetters, setAllGuessedLetters] = useState<Set<string>>(new Set());
	const [verifiedPositions, setVerifiedPositions] = useState<Map<string, Set<number>>>(initialVerifiedPositions);
	const [additionalLetterPositions, setAdditionalLetterPositions] = useState<Map<string, Set<number>>>(new Map());
	const [notifiedSolvedClues, setNotifiedSolvedClues] = useState<Set<number>>(new Set());
	
	// Track which letters have been synced to userInputs to avoid re-syncing
	const syncedLettersRef = useRef<Map<string, Set<number>>>(new Map());

	// Initialize clueLettersCompleteMap based on whether there are starting letters
	const [clueLettersCompleteMap, setClueLettersCompleteMap] = useState<Map<string, boolean>>(() => {
		const initialMap = new Map<string, boolean>();
		const initialClues = getClueWordsArray(clues);
		const startingSet = new Set(selectedStartingLetters.toUpperCase().split(''));
		
		initialClues.forEach((clue: string) => {
			
			// Check if this clue has ANY letters from the starting letters
			const clueUpper = clue.toUpperCase();
			const hasMatchingLetters = Array.from(startingSet).some(letter => 
				clueUpper.includes(letter)
			);
			
			// If no matching letters, mark as complete immediately
			if (!hasMatchingLetters) {
				initialMap.set(clue, true);
			}
		});
		
		return initialMap;
	});
	
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
	} = useClueManagement(clueWords, allAvailableLetters, initialCompletedWords, initialUserInputs);

	useEffect(() => {
	// When initialUserInputs changes (from RevealUnsolvedWords), update local userInputs
	if (initialUserInputs && initialUserInputs.size > 0) {
		setUserInputs(initialUserInputs);
	}
	}, [initialUserInputs, setUserInputs]);
	
	// Sync completedWords changes back to parent
	useEffect(() => {
		if (onCompletedWordsChange) {
			onCompletedWordsChange(completedWords);
		}
	}, [completedWords, onCompletedWordsChange]);

	// Sync verifiedPositions changes back to parent
	useEffect(() => {
		if (onVerifiedPositionsSync) {
			onVerifiedPositionsSync(verifiedPositions);
		}
	}, [verifiedPositions, onVerifiedPositionsSync]);

	// Sync userInputs changes back to parent
	useEffect(() => {
		if (onUserInputsSync) {
			onUserInputsSync(userInputs);
		}
	}, [userInputs, onUserInputsSync]);

	// Use position editability hook
	const {
		findNextEmptyPosition,
		findNextEditablePosition,
		isWordComplete,
		isPositionEditable
	} = usePositionEditability({
		verifiedPositions,
		startingLetters: selectedStartingLetters,
		additionalLetters,
		additionalLetterPositions
	});

	// Update clueLettersCompleteMap when global clueLettersComplete changes
	useEffect(() => {
		if (clueLettersComplete) {
			activeClues.forEach(clue => {
				setClueLettersCompleteMap(prev => {
					if (prev.get(clue) !== true) {
						return new Map(prev).set(clue, true);
					}
					return prev;
				});
			});
		} else {
			// Reset completion when a new animation starts
			activeClues.forEach(clue => {
				// Only reset if there are new dashes being animated for this clue
				const animatingDashes = dashesCurrentlyAnimating.get(clue);
				if (animatingDashes && animatingDashes.size > 0) {
					setClueLettersCompleteMap(prev => {
						if (prev.get(clue) !== false) {
							return new Map(prev).set(clue, false);
						}
						return prev;
					});
				}
			});
		}
	}, [clueLettersComplete, activeClues, dashesCurrentlyAnimating]);

	// Add sequence letters to userInputs ONLY when clueLettersComplete is true
	// This ensures letters don't appear before the animation completes
	useEffect(() => {
		// Don't sync while animation is still running
		if (!clueLettersComplete) return;
		
		activeClues.forEach(clue => {
			const letterMap = revealedLetters.get(clue);
			if (!letterMap || letterMap.size === 0) return;
			
			const currentInputs = userInputs.get(clue) || new Map();
			const syncedForClue = syncedLettersRef.current.get(clue) || new Set();
			
			// Find letters that haven't been synced yet
			const newLettersToSync = new Map<number, string>();
			letterMap.forEach((letter, position) => {
				if (!syncedForClue.has(position) && !currentInputs.has(position)) {
					newLettersToSync.set(position, letter);
				}
			});
			
			if (newLettersToSync.size === 0) return;
			
			// Mark as synced
			const newSyncedSet = new Set(syncedForClue);
			newLettersToSync.forEach((_, position) => {
				newSyncedSet.add(position);
			});
			syncedLettersRef.current.set(clue, newSyncedSet);
			
			// Add to userInputs with a small delay
			setTimeout(() => {
				setUserInputs(prev => {
					const currentWordInputs = prev.get(clue) || new Map();
					const newWordInputs = new Map(currentWordInputs);
					
					newLettersToSync.forEach((letter, position) => {
						if (!newWordInputs.has(position)) {
							newWordInputs.set(position, letter);
						}
					});
					
					return new Map(prev).set(clue, newWordInputs);
				});
				
				// Mark this specific word as having completed its letter reveal
				setClueLettersCompleteMap(prev => {
					if (prev.get(clue) !== true) {
						return new Map(prev).set(clue, true);
					}
					return prev;
				});
			}, 100);
		});
	}, [clueLettersComplete, revealedLetters, userInputs, setUserInputs, activeClues]);
	
	
	useStartingLettersValidation({
		selectedStartingLetters,
		activeClues,
		onLifeLost,
		onShowMessage,
		hasLostLifeForNoStartingLetters,
		setHasLostLifeForNoStartingLetters, 
	});

	const {
		cursorPosition: internalCursorPosition,
		setCursorPosition: internalSetCursorPosition,
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
		additionalLetterPositions,
		initialCursorPosition
	});

	// Create a wrapper for setCursorPosition that syncs with parent
	const setCursorPosition = useCallback((position: { clueIndex: number; position: number } | null) => {
		internalSetCursorPosition(position);
		onCursorPositionChange?.(position);
	}, [internalSetCursorPosition, onCursorPositionChange]);

	// Use the internal cursor position (which now includes the initial value)
	const cursorPosition = internalCursorPosition;
	
	// Move cursor away from sequence letter positions
	useEffect(() => {
		if (!cursorPosition) return;
		
		const currentClue = activeClues[cursorPosition.clueIndex];
		if (!currentClue) return;
		
		const revealedLettersForClue = revealedLetters.get(currentClue);
		if (!revealedLettersForClue) return;
		
		const wordInputs = userInputs.get(currentClue) || new Map();
		
		// Check if cursor is on a position that just got a sequence letter
		if (revealedLettersForClue.has(cursorPosition.position)) {
			// Use the proper logic to find next editable position
			const nextPosition = findNextEditablePosition(
				currentClue,
				wordInputs,
				cursorPosition.position
			);
			
			// Only move if we found a different position
			if (nextPosition !== cursorPosition.position) {
				setCursorPosition({
					clueIndex: cursorPosition.clueIndex,
					position: nextPosition
				});
			} else {
				// No editable positions left in this word, clear cursor
				setCursorPosition(null);
			}
		}
	}, [revealedLetters, cursorPosition, activeClues, userInputs, findNextEditablePosition, setCursorPosition]);
	
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
		clueWordsArray,
		findNextEmptyPosition,
		isWordComplete,
		silentRevealedWords
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
		additionalLetterPositions,
		isWordComplete,
		autoRevealedPositions,
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
		isGameOver: isGameOver
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
		
		// Flash for when word is completed
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

	// Use the auto-complete hook
	useAutoCompleteWords({
		activeClues,
		userInputs,
		startingLetters: selectedStartingLetters,
		additionalLetters,
		onWordComplete: handleWordComplete,
		completedWords,
		findNextEditablePosition,
		cursorPosition,
		setCursorPosition,
		revealedLetters
	});

	// Expose handleWordComplete to parent
	useEffect(() => {
		if (onWordAutoComplete) {
			onWordAutoComplete(handleWordComplete);
		}
	}, [onWordAutoComplete, handleWordComplete]);
	
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
		
		if (!wordInputs) return;

		// Use isPositionEditable from the hook
		if (isPositionEditable(clue, position, wordInputs)) {
			setCursorPosition({ clueIndex: index, position });
		}
	}, [completedWords, userInputs, isPositionEditable, setCursorPosition]);
	
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
					clueLettersComplete={clueLettersCompleteMap.get(clue) ?? false}
					findNextEditablePosition={findNextEditablePosition}
					autoRevealedPositions={autoRevealedPositions}
					silentRevealedWords={silentRevealedWords}
					isLocked={isGameOver}
				/>
			))}
		</div>
	);
}