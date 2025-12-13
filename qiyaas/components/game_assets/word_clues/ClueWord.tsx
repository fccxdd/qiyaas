// components/game_assets/word_clues/ClueWord.tsx

import { useState, useEffect, useRef } from 'react';
import { GameConfig } from '@/lib/gameConfig';
import FlashOverlay from '@/hooks/clues/FlashOverlay';
import ClueLetter from './ClueLetter';

interface ClueWordProps {
	word: string;
	startingLetters: string;
	cursorPosition: number | null;
	onCursorClick: (position: number) => void;
	flashState: 'none' | 'red' | 'yellow' | 'green';
	isComplete: boolean;
	userInputs: Map<number, string>;
	verifiedPositions?: Set<number>;
	shouldShake?: boolean;
	isLocked?: boolean;
	additionalLetters?: { vowel?: string; consonant?: string; any?: string };
	onAdditionalLettersFilled?: (positions: Map<number, string>) => void;
	wordType?: string;
	revealedDashIndices?: Set<number>;
	revealedSequenceLetters?: Map<number, string>;
	dashesCurrentlyAnimating?: Set<number>;
	clueLettersComplete?: boolean;
}

export default function ClueWord({ 
	word, 
	startingLetters, 
	cursorPosition,
	onCursorClick,
	flashState,
	isComplete,
	userInputs,
	verifiedPositions = new Set(),
	shouldShake = false,
	isLocked = false,
	additionalLetters = {},
	onAdditionalLettersFilled,
	wordType,
	revealedDashIndices = new Set(),
	revealedSequenceLetters = new Map(),
	dashesCurrentlyAnimating = new Set(),
	clueLettersComplete = false,
}: ClueWordProps) {
	const [revealedLetters, setRevealedLetters] = useState<Map<number, string>>(new Map());
	const [bouncingIndices, setBouncingIndices] = useState<Set<number>>(new Set());
	const [userTypedIndices, setUserTypedIndices] = useState<Set<number>>(new Set());
	const prevUserInputsRef = useRef<Map<number, string>>(new Map());
	const startingLettersPositions = useRef<Set<number>>(new Set());
	const additionalLettersPositions = useRef<Set<number>>(new Set());
	const prevRevealedSequenceLettersRef = useRef<Set<number>>(new Set());
	const hasFilledAdditionalLettersRef = useRef(false);
	const lastAdditionalLettersRef = useRef<string>('');
	
	// Get color class based on word type
	const getWordTypeColor = () => {
		if (!wordType) return GameConfig.wordColors.default;
		
		switch (wordType.toUpperCase()) {
			case 'NOUN':
				return GameConfig.wordColors.noun;
			case 'VERB':
				return GameConfig.wordColors.verb;
			case 'ADJECTIVE':
				return GameConfig.wordColors.adjective;
			default:
				return GameConfig.wordColors.default;
		}
	};

	// Handle revealed sequence letters from the hook
	useEffect(() => {
		if (revealedSequenceLetters && revealedSequenceLetters.size > 0) {
			const newlyRevealed = new Set<number>();
			
			revealedSequenceLetters.forEach((letter, position) => {
				if (!prevRevealedSequenceLettersRef.current.has(position)) {
					newlyRevealed.add(position);
					
					setRevealedLetters(prev => {
						const newMap = new Map(prev);
						newMap.set(position, letter);
						return newMap;
					});
					
					startingLettersPositions.current.add(position);
				}
			});
			
			if (newlyRevealed.size > 0) {
				setBouncingIndices(newlyRevealed);
				setTimeout(() => {
					setBouncingIndices(new Set());
				}, GameConfig.duration.greencursorDuration);
			}
			
			prevRevealedSequenceLettersRef.current = new Set(revealedSequenceLetters.keys());
		}
	}, [revealedSequenceLetters]);

	// Sync revealed letters with user inputs
	useEffect(() => {
		const prevInputs = prevUserInputsRef.current;
		const newlyTypedIndices = new Set<number>();
		const currentUserTyped = new Set<number>();
		
		const removedPositions = new Set<number>();
		prevInputs.forEach((_, position) => {
			if (!userInputs.has(position)) {
				removedPositions.add(position);
			}
		});
		
		if (removedPositions.size > 0) {
			setRevealedLetters(prev => {
				const newMap = new Map(prev);
				removedPositions.forEach(position => {
					if (!startingLettersPositions.current.has(position) && 
					    !additionalLettersPositions.current.has(position) &&
					    !revealedSequenceLetters.has(position)) {
						newMap.delete(position);
					}
				});
				return newMap;
			});
		}
		
		if (userInputs.size === 0) {
			setRevealedLetters(prev => {
				const newMap = new Map(prev);
				Array.from(newMap.keys()).forEach(position => {
					if (!startingLettersPositions.current.has(position) && 
					    !additionalLettersPositions.current.has(position) &&
					    !revealedSequenceLetters.has(position)) {
						newMap.delete(position);
					}
				});
				return newMap;
			});
			setUserTypedIndices(new Set());
			prevUserInputsRef.current = new Map();
			return;
		}
		
		userInputs.forEach((letter, index) => {
			const isStartingLetterPosition = startingLettersPositions.current.has(index);
			const isAdditionalLetterPosition = additionalLettersPositions.current.has(index);
			const isRevealedLetterPosition = revealedSequenceLetters.has(index);
			
			if (!isStartingLetterPosition && !isAdditionalLetterPosition && !isRevealedLetterPosition) {
				currentUserTyped.add(index);
				
				if (!prevInputs.has(index) || prevInputs.get(index) !== letter) {
					newlyTypedIndices.add(index);
				}
			}
		});

		setUserTypedIndices(currentUserTyped);

		if (newlyTypedIndices.size > 0) {
			setBouncingIndices(newlyTypedIndices);
			setTimeout(() => {
				setBouncingIndices(new Set());
			}, GameConfig.duration.greencursorDuration);
		}

		setRevealedLetters(prev => {
			const newMap = new Map(prev);
			userInputs.forEach((letter, index) => {
				const isSequenceLetter = revealedSequenceLetters.has(index);
				const isStartingLetterPosition = startingLettersPositions.current.has(index);
				const isAdditionalLetterPosition = additionalLettersPositions.current.has(index);
				const isCurrentlyBouncing = bouncingIndices.has(index);

				if (isSequenceLetter) {
					return;
				}
				
				// Show letters if:
				// 1. They are starting/additional letters (always show)
				// 2. User-typed letters - only if no letters are currently bouncing AND (animation complete OR no starting letters)
				
				if (isStartingLetterPosition || isAdditionalLetterPosition) {
				// Starting/additional letters - always show
				newMap.set(index, letter);
				} else if (bouncingIndices.size === 0 && (clueLettersComplete || startingLettersPositions.current.size === 0)) {
				// User-typed letters - only show when NO letters are bouncing
				newMap.set(index, letter);
				}
			});
			return newMap;
		});
		
		prevUserInputsRef.current = new Map(userInputs);
	}, [userInputs, revealedSequenceLetters, clueLettersComplete]);

	// Reset additional letters flag when letters change
	useEffect(() => {
		const currentLettersKey = `${additionalLetters.vowel || ''}-${additionalLetters.consonant || ''}-${additionalLetters.any || ''}`;
		if (currentLettersKey !== lastAdditionalLettersRef.current) {
			hasFilledAdditionalLettersRef.current = false;
			lastAdditionalLettersRef.current = currentLettersKey;
		}
	}, [additionalLetters]);
	
	// Auto-fill additional letters when clue letters are complete
	useEffect(() => {
		if (clueLettersComplete && !hasFilledAdditionalLettersRef.current && additionalLetters && !isComplete) {
			const wordUpper = word.toUpperCase();
			const additionalToFill: { position: number; letter: string }[] = [];
			
			if (isComplete) {
				hasFilledAdditionalLettersRef.current = true;
				return;
			}
			
			let allPositionsFilled = true;
			for (let i = 0; i < wordUpper.length; i++) {
				if (!userInputs.has(i)) {
					allPositionsFilled = false;
					break;
				}
			}
			
			if (allPositionsFilled) {
				hasFilledAdditionalLettersRef.current = true;
				return;
			}
			
			if (additionalLetters.vowel) {
				const vowelUpper = additionalLetters.vowel.toUpperCase();
				for (let i = 0; i < wordUpper.length; i++) {
					if (wordUpper[i] === vowelUpper && !userInputs.has(i)) {
						additionalToFill.push({ position: i, letter: vowelUpper });
						additionalLettersPositions.current.add(i);
					}
				}
			}
			
			if (additionalLetters.consonant) {
				const consonantUpper = additionalLetters.consonant.toUpperCase();
				for (let i = 0; i < wordUpper.length; i++) {
					if (wordUpper[i] === consonantUpper && !userInputs.has(i)) {
						additionalToFill.push({ position: i, letter: consonantUpper });
						additionalLettersPositions.current.add(i);
					}
				}
			}
			
			if (additionalToFill.length > 0) {
				const filledPositions = new Map<number, string>();
				additionalToFill.forEach(match => {
					filledPositions.set(match.position, match.letter);
				});
				
				if (onAdditionalLettersFilled) {
					onAdditionalLettersFilled(filledPositions);
				}
				
				additionalToFill.forEach((match, idx) => {
					setTimeout(() => {
						setRevealedLetters(prev => new Map(prev).set(match.position, match.letter));
						setBouncingIndices(new Set([match.position]));
						setTimeout(() => setBouncingIndices(new Set()), GameConfig.duration.greencursorDuration);
					}, idx * 500);
				});
			}
			
			hasFilledAdditionalLettersRef.current = true;
		}
	}, [clueLettersComplete, additionalLetters, word, userInputs, isComplete, onAdditionalLettersFilled]);

	return (
		<FlashOverlay
			flashState={flashState} 
			wordType={wordType}
		>
			<div className={`word-dash-wrapper flex my-2 relative ${shouldShake ? 'animate-shake' : ''} justify-start`}>
				{word.split('').map((letter, index) => {
					const isRevealed = revealedLetters.has(index);
					const isCursor = cursorPosition === index && !isLocked;
					const isVerified = verifiedPositions.has(index);
					const isSequenceLetterRevealed = revealedSequenceLetters.has(index);
					const isDashRevealed = revealedDashIndices.has(index);
					const isCurrentlyAnimating = dashesCurrentlyAnimating.has(index);
					const isUserTyped = userTypedIndices.has(index);
					const isBouncing = bouncingIndices.has(index);

					return (
						<ClueLetter
							key={index}
							letter={revealedLetters.get(index)}
							isRevealed={isRevealed}
							isCursor={isCursor}
							isVerified={isVerified}
							isSequenceLetterRevealed={isSequenceLetterRevealed}
							isDashRevealed={isDashRevealed}
							isCurrentlyAnimating={isCurrentlyAnimating}
							isComplete={isComplete}
							isUserTyped={isUserTyped}
							isBouncing={isBouncing}
							clueLettersComplete={clueLettersComplete}
							wordTypeColor={getWordTypeColor()}
							onClick={() => onCursorClick(index)}
						/>
					);
				})}
			</div>
		</FlashOverlay>
	);
}