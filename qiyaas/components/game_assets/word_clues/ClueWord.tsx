// components/game_assets/word_clues/ClueWord.tsx
// Uses revealedSequenceLetters prop as source of truth for animation

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameConfig } from '@/lib/gameConfig';
import FlashOverlay from '@/hooks/clues/FlashOverlay';
import ClueLetter from './ClueLetter';
import { useAdditionalLetterValidation } from '@/hooks/clues/useAdditionalLetterValidation';

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
	findNextEditablePosition?: (clue: string, wordInputs: Map<number, string>, currentPosition?: number) => number;
	autoRevealedPositions?: Map<string, Set<number>>;
	silentRevealedWords?: Set<string>;
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
	findNextEditablePosition,
	autoRevealedPositions = new Map(),
	silentRevealedWords = new Set(),
}: ClueWordProps) {
	
	const [bouncingIndices, setBouncingIndices] = useState<Set<number>>(new Set());
	
	// Track which positions have been processed for bounce animation
	const processedForBounce = useRef<Set<number>>(new Set());
	const prevUserInputsRef = useRef<Map<number, string>>(new Map());
	
	// Track ALL bounce timeouts for proper cleanup
	const bounceTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
	
	// ADDED: Track previous additional letters to detect when they change
	const prevAdditionalLettersRef = useRef<{ vowel?: string; consonant?: string }>({});
	
	// ADDED: Track positions that should be hidden because they're about to be animated
	const [hiddenForAnimation, setHiddenForAnimation] = useState<Set<number>>(new Set());
	
	// ADDED: Spam detection - track input rate
	const lastInputTimeRef = useRef<number>(Date.now());
	const inputCountRef = useRef<number>(0);
	const spamCooldownRef = useRef<NodeJS.Timeout | null>(null);
	const [isSpamming, setIsSpamming] = useState(false);
	
	// Memoize the cursor click handler
	const handleCursorClick = useCallback((position: number) => {

		// Check if this position is auto-revealed (locked)
  		const autoRevealed = autoRevealedPositions.get(word);
  		const isLocked = autoRevealed?.has(position) || false;
  
		// Don't allow clicking on locked positions
		if (isLocked) {
			return;
		}
		onCursorClick(position);
	}, [onCursorClick, autoRevealedPositions, word]);
	
	// Function to move cursor to next editable position after validation
	const moveToNextEditablePosition = useCallback(() => {
		if (findNextEditablePosition) {
			const nextPosition = findNextEditablePosition(word, userInputs, cursorPosition ?? undefined);
			onCursorClick(nextPosition);
		} else {
			for (let i = 0; i < word.length; i++) {
				if (!userInputs.has(i)) {
					onCursorClick(i);
					return;
				}
			}
			onCursorClick(0);
		}
	}, [findNextEditablePosition, word, userInputs, cursorPosition, onCursorClick]);
	
	// Use the validation hook to handle additional letter auto-fill
	const additionalLettersPositions = useAdditionalLetterValidation({
		word,
		userInputs,
		additionalLetters,
		clueLettersComplete,
		isComplete,
		onAdditionalLettersFilled,
		setUserTypedIndices: () => {}, // No longer needed
		onValidationComplete: moveToNextEditablePosition,
	});
	
	// Get color class based on word type
	const wordTypeColor = useMemo(() => {
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
	}, [wordType]);

	// ADDED: Detect when additional letters change and preemptively hide matching positions
	useEffect(() => {
		const prev = prevAdditionalLettersRef.current;
		const current = additionalLetters;
		
		// Check if vowel or consonant changed
		const vowelChanged = current.vowel && current.vowel !== prev.vowel;
		const consonantChanged = current.consonant && current.consonant !== prev.consonant;
		
		if (vowelChanged || consonantChanged) {
			console.log('🎯 Additional letter changed, hiding positions for animation');
			
			// Find all positions in this word that match the new letter
			const newLetter = vowelChanged ? current.vowel : current.consonant;
			const positionsToHide = new Set<number>();
			
			if (newLetter) {
				word.split('').forEach((char, index) => {
					if (char.toUpperCase() === newLetter.toUpperCase()) {
						positionsToHide.add(index);
					}
				});
			}
			
			console.log('🎯 Hiding positions:', Array.from(positionsToHide));
			setHiddenForAnimation(positionsToHide);
			
			// Update the ref
			prevAdditionalLettersRef.current = { ...current };
		}
	}, [additionalLetters, word]);

	// ADDED: Clear hidden positions when letters are revealed via animation
	useEffect(() => {
		if (revealedSequenceLetters.size > 0) {
			// Remove positions from hiddenForAnimation once they appear in revealedSequenceLetters
			setHiddenForAnimation(prev => {
				const newSet = new Set(prev);
				revealedSequenceLetters.forEach((_, position) => {
					newSet.delete(position);
				});
				return newSet.size !== prev.size ? newSet : prev;
			});
		}
	}, [revealedSequenceLetters]);

	// Trigger bounce animation for sequence letters
	useEffect(() => {
		if (!revealedSequenceLetters || revealedSequenceLetters.size === 0) return;
		
		const newlyRevealed = new Set<number>();
		
		revealedSequenceLetters.forEach((letter, position) => {
			if (!processedForBounce.current.has(position)) {
				newlyRevealed.add(position);
				processedForBounce.current.add(position);
			}
		});
		
		if (newlyRevealed.size > 0) {
			// Add to bouncing set (sequence letters always bounce, even during spam)
			setBouncingIndices(prev => new Set([...prev, ...newlyRevealed]));
			
			// Create a timeout for EACH newly revealed index
			newlyRevealed.forEach(idx => {
				const existingTimeout = bounceTimeoutsRef.current.get(idx);
				if (existingTimeout) {
					clearTimeout(existingTimeout);
				}
				
				const timeout = setTimeout(() => {
					setBouncingIndices(prev => {
						const newSet = new Set(prev);
						newSet.delete(idx);
						return newSet;
					});
					bounceTimeoutsRef.current.delete(idx);
				}, GameConfig.duration.greencursorDuration);
				
				bounceTimeoutsRef.current.set(idx, timeout);
			});
		}
	}, [revealedSequenceLetters]);

	// SPAM DETECTION: Monitor input rate
	useEffect(() => {
		const prevInputs = prevUserInputsRef.current;
		const currentTime = Date.now();
		const timeDiff = currentTime - lastInputTimeRef.current;
		
		// Count new inputs
		let newInputCount = 0;
		userInputs.forEach((letter, index) => {
			if (!prevInputs.has(index) || prevInputs.get(index) !== letter) {
				newInputCount++;
			}
		});
		
		if (newInputCount > 0) {
			// Update input tracking
			lastInputTimeRef.current = currentTime;
			
			// Detect spam: more than 3 inputs within 150ms = spam
			if (timeDiff < 150) {
				inputCountRef.current += newInputCount;
				
				if (inputCountRef.current > 3) {
					// SPAM DETECTED
					if (!isSpamming) {
						setIsSpamming(true);
					}
					
					// Clear existing cooldown
					if (spamCooldownRef.current) {
						clearTimeout(spamCooldownRef.current);
					}
					
					// Set cooldown to exit spam mode
					spamCooldownRef.current = setTimeout(() => {
						setIsSpamming(false);
						inputCountRef.current = 0;
					}, 300); // 300ms of no spam = exit spam mode
				}
			} else {
				// Reset counter if inputs are slow enough
				inputCountRef.current = newInputCount;
			}
		}
		
		prevUserInputsRef.current = new Map(userInputs);
	}, [userInputs, isSpamming]);

	// Handle user-typed bounce animation - DISABLED during spam
	useEffect(() => {
		// SKIP bounce animation entirely if spamming
		if (isSpamming) {
			return;
		}
		
		const prevInputs = prevUserInputsRef.current;
		const newlyTypedIndices = new Set<number>();
		
		userInputs.forEach((letter, index) => {
			// Skip positions that are sequence letters
			if (revealedSequenceLetters.has(index)) return;
			// Skip positions that are additional letter positions
			if (additionalLettersPositions.current.has(index)) return;
			
			if (!prevInputs.has(index) || prevInputs.get(index) !== letter) {
				newlyTypedIndices.add(index);
			}
		});

		// Bounce animation for user-typed letters
		if (newlyTypedIndices.size > 0) {
			setBouncingIndices(prev => new Set([...prev, ...newlyTypedIndices]));
			
			// Create a timeout for EACH newly typed index
			newlyTypedIndices.forEach(idx => {
				const existingTimeout = bounceTimeoutsRef.current.get(idx);
				if (existingTimeout) {
					clearTimeout(existingTimeout);
				}
				
				const timeout = setTimeout(() => {
					setBouncingIndices(prev => {
						const newSet = new Set(prev);
						newSet.delete(idx);
						return newSet;
					});
					bounceTimeoutsRef.current.delete(idx);
				}, GameConfig.duration.greencursorDuration);
				
				bounceTimeoutsRef.current.set(idx, timeout);
			});
		}
	}, [userInputs, revealedSequenceLetters, additionalLettersPositions, isSpamming]);

	// Cleanup ALL timeouts on unmount
	useEffect(() => {
		return () => {
			bounceTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
			bounceTimeoutsRef.current.clear();
			if (spamCooldownRef.current) {
				clearTimeout(spamCooldownRef.current);
			}
		};
	}, []);

	// Build the letters array for rendering
	const letters = useMemo(() => {
		return word.split('').map((_, index) => {
			const isCursor = cursorPosition === index && !isLocked;
			const isVerified = verifiedPositions.has(index);
			const isDashRevealed = revealedDashIndices.has(index);
			const isCurrentlyAnimating = dashesCurrentlyAnimating.has(index);
			
			// DISABLE bouncing during spam to prevent glitches
			const isBouncing = isSpamming ? false : bouncingIndices.has(index);
			
			// Check if this is a sequence letter position (from animation)
			const isSequenceLetterPosition = revealedSequenceLetters.has(index);
			
			// Check if this position was auto-revealed (on loss)
			const isAutoRevealed = autoRevealedPositions.get(word)?.has(index) || false;
			
			// Check if this position has a dash revealed but letter not yet shown
			const isWaitingForLetterReveal = isDashRevealed && !isSequenceLetterPosition;
			
			// CRITICAL FIX: Check if this position is hidden for upcoming animation
			const isHiddenForAnimation = hiddenForAnimation.has(index);
			
			// Compute isUserTyped DIRECTLY to prevent race condition
			// Hide user-typed letter if:
			// 1. We're waiting for the reveal animation, OR
			// 2. This position is marked as hidden for animation
			const isUserTyped = userInputs.has(index) && 
			                   !revealedSequenceLetters.has(index) && 
			                   !additionalLettersPositions.current.has(index) &&
			                   !isWaitingForLetterReveal &&
			                   !isHiddenForAnimation; // HIDE before animation starts!
			
			// For sequence letters: letter comes from revealedSequenceLetters
			// For user input: letter comes from userInputs (but only if not hidden)
			const sequenceLetter = revealedSequenceLetters.get(index);
			const userLetter = (isWaitingForLetterReveal || isHiddenForAnimation) ? undefined : userInputs.get(index);
			const letter = sequenceLetter || userLetter;
			
			// isRevealed = should we show the letter?
			// Don't reveal if waiting for animation OR hidden for animation
			const isRevealed = isSequenceLetterPosition 
				? !!sequenceLetter 
				: (!!userLetter && !isWaitingForLetterReveal && !isHiddenForAnimation);
			
			const isSequenceLetterRevealed = isSequenceLetterPosition && !!sequenceLetter;

			return {
				index,
				letter,
				isRevealed,
				isCursor,
				isVerified,
				isSequenceLetterRevealed,
				isDashRevealed,
				isCurrentlyAnimating,
				isUserTyped,
				isBouncing,
				isAutoRevealed,
			};
		});
	}, [
		word,
		userInputs,
		cursorPosition,
		isLocked,
		verifiedPositions,
		revealedDashIndices,
		revealedSequenceLetters,
		dashesCurrentlyAnimating,
		bouncingIndices,
		autoRevealedPositions,
		additionalLettersPositions,
		isSpamming,
		hiddenForAnimation, // Added dependency
	]);

	return (
		<FlashOverlay
			flashState={flashState} 
			wordType={wordType}
			isComplete={isComplete}
			silentReveal={silentRevealedWords.has(word)}
		>
			<div className={`word-dash-wrapper flex my-2 relative ${shouldShake ? 'animate-shake' : ''} justify-start`}>
				{letters.map((letterData) => (
					<ClueLetter
						key={letterData.index}
						letter={letterData.letter}
						isRevealed={letterData.isRevealed}
						isCursor={letterData.isCursor}
						isVerified={letterData.isVerified}
						isSequenceLetterRevealed={letterData.isSequenceLetterRevealed}
						isDashRevealed={letterData.isDashRevealed}
						isCurrentlyAnimating={letterData.isCurrentlyAnimating}
						isComplete={isComplete}
						isUserTyped={letterData.isUserTyped}
						isBouncing={letterData.isBouncing}
						clueLettersComplete={clueLettersComplete}
						wordTypeColor={wordTypeColor}
						onClick={() => handleCursorClick(letterData.index)}
						isAutoRevealed={letterData.isAutoRevealed}
					/>
				))}
			</div>
		</FlashOverlay>
	);
}