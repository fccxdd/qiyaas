// hooks/clues/UseRevealLetter.tsx

// Purpose: Reveal Letters for Starting Letters and Additional +V and +C 
// Two-phase animation: 
// ALL green dashes first, THEN all letters bounce

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameConfig } from '@/lib/gameConfig';

export interface RevealConfig {
	clueDashDelay?: number;
	clueLetterDelay?: number;
	enabled?: boolean;
}

export interface RevealState {
	revealedClueDashes: Map<string, Set<number>>;
	revealedClueLetters: Map<string, Map<number, string>>;
	dashesCurrentlyAnimating: Map<string, Set<number>>;
	clueDashesComplete: boolean;
	clueLettersComplete: boolean;
	allComplete: boolean;
}

interface UseRevealLetterParams {
	startingLetters: string;
	clueWords: string[];
	lettersInClue: Set<string>;
	triggered: boolean;
	initialRevealedLetters?: Map<string, Map<number, string>>;
	config?: RevealConfig;
	onComplete?: () => void;
	additionalLetters?: { vowel?: string; consonant?: string };
	
	// Callback when additional letter animation completes
	onAdditionalLetterComplete?: (type: 'vowel' | 'consonant') => void;
	
	// Track which additional letters have already been animated
	hasAdditionalLettersAnimationCompleted?: {
		vowel: boolean;
		consonant: boolean;
	};
}

interface AnimationItem {
	clue: string;
	position: number;
	letter: string;
}

const DEFAULT_CONFIG: Required<RevealConfig> = {
	clueDashDelay: GameConfig.duration.clueDashRevealDelay,
	clueLetterDelay: GameConfig.duration.startingLetterBounceDelay,
	enabled: true,
};

export function UseRevealLetter({
	startingLetters,
	clueWords,
	lettersInClue,
	triggered,
	initialRevealedLetters = new Map(),
	onComplete,
	additionalLetters = {},
	onAdditionalLetterComplete,
	hasAdditionalLettersAnimationCompleted = { vowel: false, consonant: false }
}: UseRevealLetterParams): RevealState {
	const clueDashDelay = DEFAULT_CONFIG.clueDashDelay;
	const clueLetterDelay = DEFAULT_CONFIG.clueLetterDelay;
	const enabled = DEFAULT_CONFIG.enabled;
	
	// Core state
	const [revealedClueDashes, setRevealedClueDashes] = useState<Map<string, Set<number>>>(new Map());
	const [revealedClueLetters, setRevealedClueLetters] = useState<Map<string, Map<number, string>>>(new Map());
	const [dashesCurrentlyAnimating, setDashesCurrentlyAnimating] = useState<Map<string, Set<number>>>(new Map());
	const [clueDashesComplete, setClueDashesComplete] = useState(false);
	const [clueLettersComplete, setClueLettersComplete] = useState(false);
	
	// Refs for tracking state
	const hasStartedRef = useRef(false);
	const hasLoadedFromStateRef = useRef(false);
	const hasInitializedRef = useRef(false); // NEW: Track if we've initialized once
	const animatedPositionsRef = useRef<Set<string>>(new Set()); // Track "clue-position" keys
	const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
	const clueWordsRef = useRef<string[]>([]);
	
	// Track additional letters separately to detect changes
	const prevAdditionalVowelRef = useRef<string | undefined>(undefined);
	const prevAdditionalConsonantRef = useRef<string | undefined>(undefined);
	
	// Track current letters string for reset detection
	const currentLettersRef = useRef<string>('');

	// Keep clueWords ref updated - ALWAYS store uppercase for consistent key matching
	useEffect(() => {
		clueWordsRef.current = clueWords.map(w => w.toUpperCase());
	}, [clueWords]);

	// Cleanup all timeouts
	const clearAllTimeouts = useCallback(() => {
		timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
		timeoutsRef.current = [];
	}, []);

	// Reset when starting letters change (new game)
	useEffect(() => {
		if (startingLetters !== currentLettersRef.current) {
			// Don't reset if we have saved state and haven't started yet
			if (initialRevealedLetters.size > 0 && !hasStartedRef.current && !hasLoadedFromStateRef.current) {
				currentLettersRef.current = startingLetters;
				return;
			}
			
			clearAllTimeouts();
			setRevealedClueDashes(new Map());
			setRevealedClueLetters(new Map());
			setDashesCurrentlyAnimating(new Map());
			setClueDashesComplete(false);
			setClueLettersComplete(false);
			hasStartedRef.current = false;
			hasLoadedFromStateRef.current = false;
			animatedPositionsRef.current = new Set();
			prevAdditionalVowelRef.current = undefined;
			prevAdditionalConsonantRef.current = undefined;
			currentLettersRef.current = startingLetters;
		}
	}, [startingLetters, initialRevealedLetters.size, clearAllTimeouts]);

	// Load from saved state (page refresh persistence) - ONLY RUN ONCE
	useEffect(() => {
		// CRITICAL: Only run this ONCE when we have data
		if (hasInitializedRef.current) {
			console.log('⏭️ Skipping load - already initialized');
			return;
		}
		
		if (initialRevealedLetters.size > 0) {
			console.log('📦 Loading animation state from saved game (FIRST TIME ONLY)');
			
			// Normalize keys to uppercase
			const normalizedLetters = new Map<string, Map<number, string>>();
			initialRevealedLetters.forEach((letterMap, clue) => {
				normalizedLetters.set(clue.toUpperCase(), letterMap);
			});
			
			setRevealedClueLetters(normalizedLetters);

			const allDashes = new Map<string, Set<number>>();
			normalizedLetters.forEach((letterMap, clue) => {
				allDashes.set(clue, new Set(letterMap.keys()));
				// Mark these positions as already animated
				letterMap.forEach((_, position) => {
					animatedPositionsRef.current.add(`${clue}-${position}`);
				});
			});
			setRevealedClueDashes(allDashes);
			
			// CRITICAL: Set ALL completion flags IMMEDIATELY when loading from state
			setClueDashesComplete(true);
			setClueLettersComplete(true);
			hasStartedRef.current = true;
			hasLoadedFromStateRef.current = true;
			hasInitializedRef.current = true;
			
			console.log('✅ Animation state loaded, ALL completion flags set');
		}
	}, [initialRevealedLetters.size]); // Only depend on SIZE, not the Map itself

	// Core animation function:
	// Phase 1: All green dashes appear one by one
	// Phase 2: All letters appear one by one (after ALL dashes are done)
	
	const runAnimation = useCallback((positions: AnimationItem[]) => {
		if (positions.length === 0) return;

		// Filter out already-animated positions
		const newPositions = positions.filter(item => {
			const key = `${item.clue}-${item.position}`;
			return !animatedPositionsRef.current.has(key);
		});

		if (newPositions.length === 0) {
			// All positions already animated, just return
			return;
		}

		// Mark positions as animated (before animation starts to prevent re-triggering)
		newPositions.forEach(item => {
			animatedPositionsRef.current.add(`${item.clue}-${item.position}`);
		});

		// PHASE 1: Reveal green dashes one by one (CHRONOLOGICAL ORDER)
		newPositions.forEach((item, sequenceIndex) => {
			const dashTimeout = setTimeout(() => {
				// Add to animating set (triggers green dash CSS)
				setDashesCurrentlyAnimating(prev => {
					const newMap = new Map(prev);
					const currentSet = newMap.get(item.clue) || new Set();
					newMap.set(item.clue, new Set([...currentSet, item.position]));
					return newMap;
				});
				
				// Add to revealed dashes
				setRevealedClueDashes(prev => {
					const newMap = new Map(prev);
					const currentSet = newMap.get(item.clue) || new Set();
					newMap.set(item.clue, new Set([...currentSet, item.position]));
					return newMap;
				});
				
				// Remove from animating after animation duration
				const animationEndTimeout = setTimeout(() => {
					setDashesCurrentlyAnimating(prev => {
						const newMap = new Map(prev);
						const currentSet = newMap.get(item.clue);
						if (currentSet) {
							const newSet = new Set(currentSet);
							newSet.delete(item.position);
							newMap.set(item.clue, newSet);
						}
						return newMap;
					});
				}, 300);
				
				timeoutsRef.current.push(animationEndTimeout);
			}, sequenceIndex * clueDashDelay);
			
			timeoutsRef.current.push(dashTimeout);
		});

		// PHASE 2: Reveal letters AFTER all dashes complete
		const dashPhaseEndTime = (newPositions.length * clueDashDelay) + 300;

		newPositions.forEach((item, sequenceIndex) => {
			const letterTimeout = setTimeout(() => {
				setRevealedClueLetters(prev => {
					const newMap = new Map(prev);
					const currentLetterMap = newMap.get(item.clue) || new Map();
					const newLetterMap = new Map(currentLetterMap);
					newLetterMap.set(item.position, item.letter);
					newMap.set(item.clue, newLetterMap);
					return newMap;
				});
			}, dashPhaseEndTime + (sequenceIndex * clueLetterDelay));
			
			timeoutsRef.current.push(letterTimeout);
		});
	}, [clueDashDelay, clueLetterDelay]);

	// Collect positions for a set of letters in CHRONOLOGICAL order
	// (clue1 positions in order, then clue2 positions in order, etc.)
	// IMPORTANT: Always use UPPERCASE clue words as keys to match ClueGameManager
	const collectPositionsChronologically = useCallback((letters: string): AnimationItem[] => {
		const lettersSet = new Set(letters.toUpperCase().split(''));
		const positions: AnimationItem[] = [];
		
		// Go through each clue in order
		clueWordsRef.current.forEach(clue => {
			const clueUpper = clue.toUpperCase(); // Use uppercase as the key
			const clueArray = clueUpper.split('');
			// Go through each position in this clue in order
			clueArray.forEach((char, index) => {
				if (lettersSet.has(char)) {
					positions.push({ clue: clueUpper, position: index, letter: char });
				}
			});
		});
		
		return positions;
	}, []);

	// Starting letters animation - triggered when game starts
	useEffect(() => {
		// CRITICAL: Check loaded state FIRST before hasStartedRef
		if (initialRevealedLetters.size > 0 && hasLoadedFromStateRef.current) {
			console.log('⏭️ Skipping starting letter animation - already loaded from state');
			if (!hasStartedRef.current) {
				hasStartedRef.current = true;
				setClueDashesComplete(true);
				setClueLettersComplete(true);
			}
			return;
		}
		
		if (!triggered || !enabled || hasStartedRef.current) {
			return;
		}
		
		if (startingLetters.length === 0 || clueWordsRef.current.length === 0) {
			return;
		}
		
		console.log('🎬 Starting letter animation beginning');
		hasStartedRef.current = true;
		
		// Collect all positions for starting letters in chronological order
		const positions = collectPositionsChronologically(startingLetters);
		
		// Run the animation
		runAnimation(positions);
		
		// Mark starting animation as complete after it finishes
		const totalTime = (positions.length * clueDashDelay) + 300 + (positions.length * clueLetterDelay) + GameConfig.duration.greencursorDuration;
		const completeTimeout = setTimeout(() => {
			setClueDashesComplete(true);
			setClueLettersComplete(true);
		}, totalTime);
		timeoutsRef.current.push(completeTimeout);
	}, [triggered, startingLetters, enabled, collectPositionsChronologically, runAnimation, clueDashDelay, clueLetterDelay]); // Removed initialRevealedLetters.size

	// Additional VOWEL animation - skip if already completed
	useEffect(() => {
		// CRITICAL: Exit immediately if animation already completed
		if (hasAdditionalLettersAnimationCompleted.vowel) {
			const currentVowel = additionalLetters?.vowel?.toUpperCase();
			const prevVowel = prevAdditionalVowelRef.current;
			
			// Just update the ref if vowel changed, but don't animate
			if (currentVowel && currentVowel !== prevVowel) {
				console.log('⏭️ Vowel changed but animation already completed, just updating ref');
				prevAdditionalVowelRef.current = currentVowel;
			}
			return;
		}
		
		if (!triggered || !enabled) {
			return;
		}
		
		const currentVowel = additionalLetters?.vowel?.toUpperCase();
		const prevVowel = prevAdditionalVowelRef.current;
		
		// Only animate if vowel is NEW and DIFFERENT
		if (currentVowel && currentVowel !== prevVowel) {
			console.log('🎬 Vowel animation beginning:', currentVowel);
			prevAdditionalVowelRef.current = currentVowel;
			
			// Collect positions for this vowel
			const positions = collectPositionsChronologically(currentVowel);
			
			// Run animation (will skip already-animated positions)
			if (positions.length > 0) {
				runAnimation(positions);
				
				// Mark as completed after animation finishes
				if (onAdditionalLetterComplete) {
					const totalTime = (positions.length * clueDashDelay) + 300 + (positions.length * clueLetterDelay) + GameConfig.duration.greencursorDuration;
					const completeTimeout = setTimeout(() => {
						onAdditionalLetterComplete('vowel');
					}, totalTime);
					timeoutsRef.current.push(completeTimeout);
				}
			}
		}
	}, [additionalLetters?.vowel, triggered, enabled, collectPositionsChronologically, runAnimation, hasAdditionalLettersAnimationCompleted.vowel, onAdditionalLetterComplete, clueDashDelay, clueLetterDelay]);

	// Additional CONSONANT animation - skip if already completed
	useEffect(() => {
		// CRITICAL: Exit immediately if animation already completed
		if (hasAdditionalLettersAnimationCompleted.consonant) {
			const currentConsonant = additionalLetters?.consonant?.toUpperCase();
			const prevConsonant = prevAdditionalConsonantRef.current;
			
			// Just update the ref if consonant changed, but don't animate
			if (currentConsonant && currentConsonant !== prevConsonant) {
				console.log('⏭️ Consonant changed but animation already completed, just updating ref');
				prevAdditionalConsonantRef.current = currentConsonant;
			}
			return;
		}
		
		if (!triggered || !enabled) {
			return;
		}
		
		const currentConsonant = additionalLetters?.consonant?.toUpperCase();
		const prevConsonant = prevAdditionalConsonantRef.current;
		
		// Only animate if consonant is NEW and DIFFERENT
		if (currentConsonant && currentConsonant !== prevConsonant) {
			console.log('🎬 Consonant animation beginning:', currentConsonant);
			prevAdditionalConsonantRef.current = currentConsonant;
			
			// Collect positions for this consonant
			const positions = collectPositionsChronologically(currentConsonant);
			
			// Run animation (will skip already-animated positions)
			if (positions.length > 0) {
				runAnimation(positions);
				
				// Mark as completed after animation finishes
				if (onAdditionalLetterComplete) {
					const totalTime = (positions.length * clueDashDelay) + 300 + (positions.length * clueLetterDelay) + GameConfig.duration.greencursorDuration;
					const completeTimeout = setTimeout(() => {
						onAdditionalLetterComplete('consonant');
					}, totalTime);
					timeoutsRef.current.push(completeTimeout);
				}
			}
		}
	}, [additionalLetters?.consonant, triggered, enabled, collectPositionsChronologically, runAnimation, hasAdditionalLettersAnimationCompleted.consonant, onAdditionalLetterComplete, clueDashDelay, clueLetterDelay]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			clearAllTimeouts();
		};
	}, [clearAllTimeouts]);

	// Call onComplete callback
	const allComplete = clueDashesComplete && clueLettersComplete;
	
	useEffect(() => {
		if (allComplete && onComplete) {
			onComplete();
		}
	}, [allComplete, onComplete]);

	return {
		revealedClueDashes,
		revealedClueLetters,
		dashesCurrentlyAnimating,
		clueDashesComplete,
		clueLettersComplete,
		allComplete,
	};
}