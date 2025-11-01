// components/game_assets/word_clues/WordDash.tsx

import { useState, useEffect, useRef } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface WordDashProps {
	word: string;
	startingLetters: string;
	cursorPosition: number | null;
	onCursorClick: (position: number) => void;
	flashState: 'none' | 'red' | 'yellow' | 'green';
	isComplete: boolean;
	userInputs: Map<number, string>;
	verifiedPositions?: Set<number>;
	shouldShake?: boolean;
	hasUsedAdditionalLetters?: boolean;
	hasValidatedAdditionalLetter?: boolean;
	bothAdditionalLettersGuessed?: boolean;
	isLocked?: boolean;
	onFlashComplete?: () => void;
	additionalLetters?: { vowel?: string; consonant?: string };
	onAdditionalLettersFilled?: (positions: Map<number, string>) => void;
}

export default function WordDash({ 
	word, 
	startingLetters, 
	cursorPosition,
	onCursorClick,
	flashState,
	isComplete,
	userInputs,
	verifiedPositions = new Set(),
	shouldShake = false,
	hasValidatedAdditionalLetter = false,
	bothAdditionalLettersGuessed = false,
	isLocked = false,
	onFlashComplete,
	additionalLetters = {},
	onAdditionalLettersFilled
}: WordDashProps) {
	const [revealedLetters, setRevealedLetters] = useState<Map<number, string>>(new Map());
	const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [bouncingIndices, setBouncingIndices] = useState<Set<number>>(new Set());
	const [userTypedIndices, setUserTypedIndices] = useState<Set<number>>(new Set());
	const initializedRef = useRef(false);
	const prevUserInputsRef = useRef<Map<number, string>>(new Map());
	const startingLettersPositions = useRef<Set<number>>(new Set());
	const additionalLettersPositions = useRef<Set<number>>(new Set());

	// Check if starting letters match THIS specific clue
	const startingLettersMatchThisClue = useRef(false);
	
	useEffect(() => {
		if (startingLetters) {
			const startingLettersArray = startingLetters.toUpperCase().split('');
			const wordUpper = word.toUpperCase();
			
			// Check if any starting letter appears in this word
			const hasMatch = startingLettersArray.some(letter => wordUpper.includes(letter));
			startingLettersMatchThisClue.current = hasMatch;
		}
	}, [word, startingLetters]);

	// Sync revealed letters with user inputs (including newly typed letters)
	useEffect(() => {
		const prevInputs = prevUserInputsRef.current;
		
		// Find newly added letters (user typed)
		const newlyTypedIndices = new Set<number>();
		const currentUserTyped = new Set<number>();
		
		userInputs.forEach((letter, index) => {
			
			// Check if this is a starting letter position or additional letter position
			const isStartingLetterPosition = startingLettersPositions.current.has(index);
			const isAdditionalLetterPosition = additionalLettersPositions.current.has(index);
			
			if (!isStartingLetterPosition && !isAdditionalLetterPosition) {
				// This is a user-typed letter
				currentUserTyped.add(index);
				
				// Check if it's newly added
				if (!prevInputs.has(index) || prevInputs.get(index) !== letter) {
					newlyTypedIndices.add(index);
				}
			}
		});

		// Update user-typed indices
		setUserTypedIndices(currentUserTyped);

		// Trigger bounce animation for newly typed letters (only if not currently flashing)
		if (newlyTypedIndices.size > 0 && !isAnimating) {
			setBouncingIndices(newlyTypedIndices);
			setTimeout(() => {
				setBouncingIndices(new Set());
			}, 500);
		}

		// Update revealed letters
		setRevealedLetters(new Map(userInputs));
		prevUserInputsRef.current = new Map(userInputs);
	}, [userInputs, isAnimating]);

	// Auto-fill starting letters with sequential animation
	// This runs when: 1) Component initializes, OR 2) hasValidatedAdditionalLetter changes to true
	useEffect(() => {
		if (startingLetters) {
			const startingLettersArray = startingLetters.toUpperCase().split('');
			const wordUpper = word.toUpperCase();
			
			// Check if we should show starting letters (starting letters match OR additional letter validated)
			const hasMatch = startingLettersArray.some(letter => wordUpper.includes(letter));
			const shouldAutoFill = hasMatch || hasValidatedAdditionalLetter;
			
			if (shouldAutoFill && !initializedRef.current) {
				// Find all positions where starting letters match
				const matchingPositions: { position: number; letter: string }[] = [];
				for (let i = 0; i < wordUpper.length; i++) {
					const letterAtPosition = wordUpper[i];
					if (startingLettersArray.includes(letterAtPosition)) {
						matchingPositions.push({ position: i, letter: letterAtPosition });
						startingLettersPositions.current.add(i);
					}
				}

				// Animate each matching position sequentially
				matchingPositions.forEach((match, idx) => {
					setTimeout(() => {
						// First: highlight dash in green
						setHighlightedIndex(match.position);
						
						// After 300ms: reveal letter with bounce
						setTimeout(() => {
							setHighlightedIndex(null);
							setRevealedLetters(prev => new Map(prev).set(match.position, match.letter));
						}, 300);
					}, idx * 500);
				});

				initializedRef.current = true;
			}
			
			// If hasValidatedAdditionalLetter becomes true and we haven't filled yet, fill now
			if (hasValidatedAdditionalLetter && !initializedRef.current) {
				const matchingPositions: { position: number; letter: string }[] = [];
				for (let i = 0; i < wordUpper.length; i++) {
					const letterAtPosition = wordUpper[i];
					if (startingLettersArray.includes(letterAtPosition)) {
						matchingPositions.push({ position: i, letter: letterAtPosition });
						startingLettersPositions.current.add(i);
					}
				}

				matchingPositions.forEach((match, idx) => {
					setTimeout(() => {
						setHighlightedIndex(match.position);
						setTimeout(() => {
							setHighlightedIndex(null);
							setRevealedLetters(prev => new Map(prev).set(match.position, match.letter));
						}, 300);
					}, idx * 500);
				});
				
				initializedRef.current = true;
			}
		}
	}, [word, startingLetters, hasValidatedAdditionalLetter]);

	// Auto-fill additional letters when hasValidatedAdditionalLetter becomes true
	// BUG FIX: Skip positions that already have user-typed letters AND skip completed words
	const [hasFilledAdditionalLetters, setHasFilledAdditionalLetters] = useState(false);
	const hasFilledRef = useRef(false);
	const lastAdditionalLettersRef = useRef<string>('');
	
	// Reset hasFilledRef when additional letters change (new vowel/consonant selected)
	useEffect(() => {
		const currentLettersKey = `${additionalLetters.vowel || ''}-${additionalLetters.consonant || ''}`;
		if (currentLettersKey !== lastAdditionalLettersRef.current) {
			console.log('🔄 Additional letters changed, resetting hasFilledRef');
			hasFilledRef.current = false;
			setHasFilledAdditionalLetters(false);
			lastAdditionalLettersRef.current = currentLettersKey;
		}
	}, [additionalLetters]);
	
	useEffect(() => {
		// CRITICAL FIX: Don't auto-fill if word is already complete (prevents wiping completed words)
		if (hasValidatedAdditionalLetter && !hasFilledRef.current && additionalLetters && !isComplete) {
			console.log('🎨 Auto-fill triggered for word:', word, 'isComplete:', isComplete, 'userInputs size:', userInputs.size);
			const wordUpper = word.toUpperCase();
			const additionalToFill: { position: number; letter: string }[] = [];
			
			// CRITICAL CHECK #1: If word is complete, NEVER auto-fill (prevents wiping completed words)
			if (isComplete) {
				console.log('⏭️ Word is already complete:', word, '- skipping auto-fill to preserve completion status');
				hasFilledRef.current = true;
				setHasFilledAdditionalLetters(true);
				return;
			}
			
			// ADDITIONAL CHECK #2: If all positions are already filled, don't auto-fill
			let allPositionsFilled = true;
			for (let i = 0; i < wordUpper.length; i++) {
				if (!userInputs.has(i)) {
					allPositionsFilled = false;
					break;
				}
			}
			
			if (allPositionsFilled) {
				console.log('⏭️ All positions already filled for word:', word, '- skipping auto-fill');
				hasFilledRef.current = true;
				setHasFilledAdditionalLetters(true);
				return;
			}
			
			// Check for vowel
			if (additionalLetters.vowel) {
				const vowelUpper = additionalLetters.vowel.toUpperCase();
				for (let i = 0; i < wordUpper.length; i++) {
					// BUG FIX: Check userInputs from parent (not local revealedLetters) to see if position is filled
					if (wordUpper[i] === vowelUpper && !userInputs.has(i)) {
						additionalToFill.push({ position: i, letter: vowelUpper });
						additionalLettersPositions.current.add(i);
					}
				}
			}
			
			// Check for consonant
			if (additionalLetters.consonant) {
				const consonantUpper = additionalLetters.consonant.toUpperCase();
				for (let i = 0; i < wordUpper.length; i++) {
					// BUG FIX: Check userInputs from parent (not local revealedLetters) to see if position is filled
					if (wordUpper[i] === consonantUpper && !userInputs.has(i)) {
						additionalToFill.push({ position: i, letter: consonantUpper });
						additionalLettersPositions.current.add(i);
					}
				}
			}
			
			console.log('📊 Positions to fill:', additionalToFill);
			
			// Only proceed if there are positions to fill
			if (additionalToFill.length > 0) {
				// Build the map of filled positions
				const filledPositions = new Map<number, string>();
				additionalToFill.forEach(match => {
					filledPositions.set(match.position, match.letter);
				});
				
				// Notify parent FIRST so userInputs gets updated immediately
				if (onAdditionalLettersFilled) {
					console.log('🔔 Notifying parent about filled positions:', filledPositions);
					onAdditionalLettersFilled(filledPositions);
				}
				
				// Then animate each additional letter position sequentially
				additionalToFill.forEach((match, idx) => {
					setTimeout(() => {
						setHighlightedIndex(match.position);
						setTimeout(() => {
							setHighlightedIndex(null);
							setRevealedLetters(prev => new Map(prev).set(match.position, match.letter));
						}, 300);
					}, idx * 500);
				});
			}
			
			hasFilledRef.current = true;
			setHasFilledAdditionalLetters(true);
		} else {
			console.log('⏭️ Skipping auto-fill for word:', word, 'Reasons:', {
				hasValidatedAdditionalLetter,
				hasFilledRef: hasFilledRef.current,
				hasAdditionalLetters: !!additionalLetters,
				isComplete
			});
		}
	}, [hasValidatedAdditionalLetter, additionalLetters, word, userInputs, isComplete, onAdditionalLettersFilled]);

	// Handle flash animation - show color twice with pulses
	const [animationKey, setAnimationKey] = useState(0);
	
	useEffect(() => {
		if (flashState !== 'none') {
			// Clear any bouncing animations when flash starts
			setBouncingIndices(new Set());
			
			// Force animation restart by changing key
			setAnimationKey(prev => prev + 1);
			
			// Keep color on for entire sequence
			setIsAnimating(true);
			
			// Tailwind's animate-pulse is 2s per pulse, so 4s = 2 pulses
			setTimeout(() => {
				setIsAnimating(false);
				
				// Trigger callback for letter removal (if applicable)
				if (onFlashComplete) {
					onFlashComplete();
				}
			}, 4000);
		}
	}, [flashState, onFlashComplete]);

	// Determine how many dashes to show and whether to hide starting letters:
	// Logic:
	// 1. If starting letters match this clue → show all dashes WITH starting letters
	// 2. If starting letters DON'T match this clue:
	//    a. If at least one additional letter is validated as correct → show all dashes WITH starting/additional letters
	//    b. If BOTH additional letters have been guessed AND BOTH are wrong → show all dashes WITHOUT starting letters (fully unlocked for guessing)
	//    c. Otherwise (no additional letters used yet, or only one guessed, or waiting for validation) → show 1 locked dash
	
	const shouldShowAllDashes = startingLettersMatchThisClue.current || hasValidatedAdditionalLetter || (bothAdditionalLettersGuessed && !hasValidatedAdditionalLetter);
	const dashesToShow = shouldShowAllDashes ? word.length : 1;
	
	// Hide starting letters and unlock ONLY when: starting letters don't match AND BOTH additional letters guessed AND BOTH are wrong
	const shouldHideStartingLetters = !startingLettersMatchThisClue.current && bothAdditionalLettersGuessed && !hasValidatedAdditionalLetter;

	return (
		<div className={`flex gap-1.5 sm:gap-3 md:gap-4 my-2 relative ${shouldShake ? 'animate-shake' : ''} justify-start`}>
			{word.split('').slice(0, dashesToShow).map((letter, index) => {
				const isRevealed = revealedLetters.has(index);
				const isHighlighted = highlightedIndex === index;
				const isCursor = cursorPosition === index && !isLocked;
				const isVerified = verifiedPositions.has(index);
				const isStartingLetter = startingLettersPositions.current.has(index);
				const isAdditionalLetterPosition = additionalLettersPositions.current.has(index);
				
				// When hiding starting letters (both additional letters wrong), don't lock starting letter positions
				const shouldIgnoreStartingLetter = shouldHideStartingLetters && isStartingLetter;
				
				// Lock if: verified, starting letter (unless hiding), or additional letter position
				const isDashLocked = isLocked || isVerified || (isStartingLetter && !shouldIgnoreStartingLetter) || isAdditionalLetterPosition;
				
				// Check if this position contains an additional letter (vowel or consonant)
				// Additional letters should have white dashes, not purple

				return (
					<div 
						key={index} 
						className="relative flex items-end justify-center"
						onClick={() => !isDashLocked && onCursorClick(index)}
						style={{ 
							cursor: isDashLocked ? 'not-allowed' : 'pointer', 
							width: '28px',
							height: '40px',
							opacity: isLocked && !isRevealed ? 0.5 : 1,
							pointerEvents: isDashLocked ? 'none' : 'auto'
						}}
					>
						{/* Dash with cursor */}
						<span
							key={`dash-${index}-${animationKey}`}
							className={`text-3xl md:text-5xl font-bold leading-none transition-all duration-300 ${
								isAnimating && flashState !== 'none' ? 'animate-pulse' : ''
							} ${
								isAnimating 
									? flashState === 'red' ? GameConfig.flashColors.incorrect 
									: flashState === 'yellow' ? GameConfig.flashColors.partial
									: flashState === 'green' ? GameConfig.flashColors.correct
									: 'text-black dark:text-white'
									: isHighlighted
									? GameConfig.flashColors.correct
									: isComplete && flashState === 'green'
									? GameConfig.flashColors.correct
									: isCursor
									? 'text-purple-500'
									: 'text-black dark:text-white'
							}`}
						>
							_
						</span>

						{/* Letter display above dash - absolutely positioned */}
						{isRevealed && !shouldIgnoreStartingLetter && (
							<span
								key={`letter-${index}-${animationKey}`}
								onClick={() => !isDashLocked && onCursorClick(index)}
								className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl font-bold leading-none transition-all duration-300 ${
									isDashLocked ? '' : 'cursor-pointer'
								} ${
									isAnimating && flashState !== 'none' ? 'animate-pulse' : ''
								} ${
									isAnimating 
										? flashState === 'red' ? GameConfig.flashColors.incorrect 
										: flashState === 'yellow' ? GameConfig.flashColors.partial
										: flashState === 'green' ? GameConfig.flashColors.correct
										: 'text-black dark:text-white'
										: isComplete && flashState === 'green'
										? GameConfig.flashColors.correct
										: verifiedPositions.has(index) || startingLettersPositions.current.has(index) || additionalLettersPositions.current.has(index)
										? 'text-black dark:text-white'
										: userTypedIndices.has(index)
										? (() => {
											const typedLetter = revealedLetters.get(index)?.toUpperCase();
											const isAdditionalLetter = typedLetter === additionalLetters.vowel?.toUpperCase() || 
																		typedLetter === additionalLetters.consonant?.toUpperCase();
											return isAdditionalLetter ? 'text-black dark:text-white' : 'text-purple-500';
										})()
										: 'text-black dark:text-white'
								}`}
								style={{
									animation: bouncingIndices.has(index) && !isAnimating
										? 'bounce 0.5s ease-out' 
										: 'none'
								}}
							>
								{revealedLetters.get(index)?.toUpperCase()}
							</span>
						)}
					</div>
				);
			})}

			<style jsx>{`
				@keyframes bounce {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-10px); }
				}
				
				@keyframes shake {
					0%, 100% { transform: translateX(0); }
					10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
					20%, 40%, 60%, 80% { transform: translateX(8px); }
				}
				
				.animate-shake {
					animation: shake 0.5s ease-in-out;
				}
			`}</style>
		</div>
	);
}