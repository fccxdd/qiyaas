// hooks/clues/useRevealSequence.tsx

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

interface UseRevealSequenceParams {
	startingLetters: string;
	clueWords: string[];
	lettersInClue: Set<string>;
	triggered: boolean;
	config?: RevealConfig;
	onComplete?: () => void;
}

const DEFAULT_CONFIG: Required<RevealConfig> = {
	clueDashDelay: GameConfig.duration.clueDashRevealDelay,
	clueLetterDelay: GameConfig.duration.startingLetterBounceDelay,
	enabled: true,
};

export function useRevealSequence({
	startingLetters,
	clueWords,
	lettersInClue,
	triggered,
	config = {},
	onComplete,
}: UseRevealSequenceParams): RevealState {
	const clueDashDelay = config?.clueDashDelay ?? DEFAULT_CONFIG.clueDashDelay;
	const clueLetterDelay = config?.clueLetterDelay ?? DEFAULT_CONFIG.clueLetterDelay;
	const enabled = config?.enabled ?? DEFAULT_CONFIG.enabled;
	
	const [revealedClueDashes, setRevealedClueDashes] = useState<Map<string, Set<number>>>(new Map());
	const [revealedClueLetters, setRevealedClueLetters] = useState<Map<string, Map<number, string>>>(new Map());
	const [dashesCurrentlyAnimating, setDashesCurrentlyAnimating] = useState<Map<string, Set<number>>>(new Map());
	const [clueDashesComplete, setClueDashesComplete] = useState(false);
	const [clueLettersComplete, setClueLettersComplete] = useState(false);
	
	const hasStartedRef = useRef(false);
	const currentLettersRef = useRef('');
	const currentCluesStringRef = useRef('');
	const clueWordsRef = useRef<string[]>([]);
	const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

	const clearTimeouts = useCallback(() => {
		timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
		timeoutsRef.current = [];
	}, []);

	useEffect(() => {
		clueWordsRef.current = clueWords;
	}, [clueWords]);

	// Reset when letters or clues change
	useEffect(() => {
		const cluesString = clueWords.join('|');
		
		const lettersChanged = startingLetters !== currentLettersRef.current;
		const cluesChanged = cluesString !== currentCluesStringRef.current;
		
		if (lettersChanged || cluesChanged) {
			
			clearTimeouts();
			setRevealedClueDashes(new Map());
			setRevealedClueLetters(new Map());
			setDashesCurrentlyAnimating(new Map());
			setClueDashesComplete(false);
			setClueLettersComplete(false);
			hasStartedRef.current = false;
			
			currentLettersRef.current = startingLetters;
			currentCluesStringRef.current = cluesString;
		}
	}, [startingLetters, clueWords, clearTimeouts]);

	// Main reveal sequence
	useEffect(() => {
		if (!triggered || !enabled || hasStartedRef.current) {
			return;
		}

		if (startingLetters.length === 0 || clueWordsRef.current.length === 0) {
			return;
		}

		hasStartedRef.current = true;

		// Collect all positions to reveal
		const allPositionsToReveal: Array<{ clue: string; position: number; letter: string }> = [];
		const startingLettersArray = startingLetters.toUpperCase().split('');
		
		clueWordsRef.current.forEach(clue => {
			const clueArray = clue.toUpperCase().split('');
			clueArray.forEach((letter, index) => {
				if (startingLettersArray.includes(letter)) {
					allPositionsToReveal.push({ clue, position: index, letter });
				}
			});
		});

		// Phase 1: Reveal green dashes one by one
		allPositionsToReveal.forEach((item, sequenceIndex) => {
			const dashTimeout = setTimeout(() => {
				
				// Add to animating set
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
				
				// Remove from animating after animation completes
				const animationEndTimeout = setTimeout(() => {
					setDashesCurrentlyAnimating(prev => {
						const newMap = new Map(prev);
						const currentSet = newMap.get(item.clue) || new Set();
						const newSet = new Set(currentSet);
						newSet.delete(item.position);
						newMap.set(item.clue, newSet);
						return newMap;
					});
				}, 300); // Animation duration
				
				timeoutsRef.current.push(animationEndTimeout);
				
				if (sequenceIndex === allPositionsToReveal.length - 1) {
					const completeTimeout = setTimeout(() => {
						setClueDashesComplete(true);
					}, clueDashDelay);
					timeoutsRef.current.push(completeTimeout);
				}
			}, sequenceIndex * clueDashDelay);
			
			timeoutsRef.current.push(dashTimeout);
		});

		// Phase 2: Reveal letters one by one AFTER ALL dashes are complete
		// Calculate when to start (after all dashes + animation + pause)
		const dashPhaseEndTime = 
			(allPositionsToReveal.length * clueDashDelay)  // Time for all dashes to appear
			; 
		
		// console.log(`⏰ Letters will start revealing at: ${dashPhaseEndTime}ms`);
		// console.log(`⏰ Delay between each letter: ${clueLetterDelay}ms`);

		allPositionsToReveal.forEach((item, sequenceIndex) => {
			const letterTimeout = setTimeout(() => {
				// console.log(`✨ Bouncing in letter ${sequenceIndex}: ${item.clue}[${item.position}] = "${item.letter}"`);
				setRevealedClueLetters(prev => {
					const newMap = new Map(prev);
					const currentLetterMap = newMap.get(item.clue) || new Map();
					const newLetterMap = new Map(currentLetterMap);
					newLetterMap.set(item.position, item.letter);
					newMap.set(item.clue, newLetterMap);
					return newMap;
				});
				
				if (sequenceIndex === allPositionsToReveal.length - 1) {
					const completeTimeout = setTimeout(() => {
						// console.log('✅ All letters revealed');
						setClueLettersComplete(true);
					}, clueLetterDelay + 3000); // Wait for dash delay + extra time for bounce animation to finish
					timeoutsRef.current.push(completeTimeout);
				}
			}, dashPhaseEndTime + (sequenceIndex * clueLetterDelay)); // ← Use same delay as dashes!
			
			timeoutsRef.current.push(letterTimeout);
		});

		return () => {
			clearTimeouts();
		};
	}, [
		triggered,
		startingLetters,
		lettersInClue,
		clueDashDelay,
		clueLetterDelay,
		enabled,
		clearTimeouts,
	]);

	const allComplete = clueDashesComplete && clueLettersComplete;
	
	useEffect(() => {
		if (allComplete && onComplete) {
			// console.log('🎉 All reveals complete!');
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