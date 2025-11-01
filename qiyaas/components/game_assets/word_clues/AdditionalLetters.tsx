// components/game_assets/word_clues/AdditionalLetters.tsx

'use client';

import { useRef, useEffect, useState } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface AdditionalLettersProps {
	onRequestAdditionalLetter?: (type: 'vowel' | 'consonant') => void;
	additionalLetters?: { vowel?: string; consonant?: string };
	gameStarted?: boolean;
	awaitingLetterType?: 'vowel' | 'consonant' | null;
	pendingLetter?: {vowel?: string; consonant?: string};
	lettersInClues?: Set<string>;
	validatedLetters?: {
		vowel?: { letter: string; correct: boolean };
		consonant?: { letter: string; correct: boolean };
	};
	onCancelSelection?: () => void;
}

export default function AdditionalLetters({
	onRequestAdditionalLetter,
	additionalLetters,
	gameStarted = false,
	awaitingLetterType = null,
	pendingLetter = {},
	validatedLetters = {},
	onCancelSelection,
}: AdditionalLettersProps) {
	const vowelButtonRef = useRef<HTMLButtonElement>(null);
	const consonantButtonRef = useRef<HTMLButtonElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Track which letters have had their colors revealed
	const [vowelColorRevealed, setVowelColorRevealed] = useState(false);
	const [consonantColorRevealed, setConsonantColorRevealed] = useState(false);
	const [shouldAnimateVowel, setShouldAnimateVowel] = useState(false);
	const [shouldAnimateConsonant, setShouldAnimateConsonant] = useState(false);
	const currentVowelState = useRef<string>('');
	const currentConsonantState = useRef<string>('');

	// Track and animate when validation state changes
	useEffect(() => {
		const vowelState = validatedLetters.vowel ? `${validatedLetters.vowel.letter}-${validatedLetters.vowel.correct}` : '';
		const consonantState = validatedLetters.consonant ? `${validatedLetters.consonant.letter}-${validatedLetters.consonant.correct}` : '';
		
		// Check if vowel validation state changed
		if (vowelState !== currentVowelState.current) {
			if (vowelState && !currentVowelState.current) {
				// Vowel was just validated for the first time
				setShouldAnimateVowel(true);
				setTimeout(() => {
					setVowelColorRevealed(true);
				}, 0);
			} else if (!vowelState) {
				// Vowel was cleared (new round)
				setVowelColorRevealed(false);
				setShouldAnimateVowel(false);
			}
			currentVowelState.current = vowelState;
		}
		
		// Check if consonant validation state changed
		if (consonantState !== currentConsonantState.current) {
			if (consonantState && !currentConsonantState.current) {
				// Consonant was just validated for the first time
				const delay = vowelColorRevealed ? 500 : 0; // Delay if vowel already revealed
				setShouldAnimateConsonant(true);
				setTimeout(() => {
					setConsonantColorRevealed(true);
				}, delay);
			} else if (!consonantState) {
				// Consonant was cleared (new round)
				setConsonantColorRevealed(false);
				setShouldAnimateConsonant(false);
			}
			currentConsonantState.current = consonantState;
		}
	}, [validatedLetters, vowelColorRevealed]);

	// Add click-away listener
	useEffect(() => {
		if (!awaitingLetterType) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			
			if (vowelButtonRef.current?.contains(target) || consonantButtonRef.current?.contains(target)) {
				return;
			}
			
			const isKeyboardClick = target.closest('button')?.textContent?.match(/^[A-Z]$/) || 
				target.closest('svg[data-testid*="Icon"]') ||
				(target.tagName === 'BUTTON' && target.closest('.flex.justify-center.w-full'));
			
			if (isKeyboardClick) {
				return;
			}
			
			if (containerRef.current && !containerRef.current.contains(target)) {
				onCancelSelection?.();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [awaitingLetterType, onCancelSelection]);

	const handleVowelClick = () => {
		if (validatedLetters.vowel) return;
		
		if (onRequestAdditionalLetter) {
			onRequestAdditionalLetter('vowel');
		}
	};

	const handleConsonantClick = () => {
		if (validatedLetters.consonant) return;
		
		if (onRequestAdditionalLetter) {
			onRequestAdditionalLetter('consonant');
		}
	};

	if (!gameStarted) {
		return null;
	}

	const vowelLetter = validatedLetters.vowel?.letter || pendingLetter?.vowel || additionalLetters?.vowel || null;
	const vowelCorrect = validatedLetters.vowel?.correct;
	const hasVowel = !!validatedLetters.vowel;
	const vowelPending = awaitingLetterType === 'vowel' && !!pendingLetter?.vowel;

	const consonantLetter = validatedLetters.consonant?.letter || pendingLetter?.consonant || additionalLetters?.consonant || null;
	const consonantCorrect = validatedLetters.consonant?.correct;
	const hasConsonant = !!validatedLetters.consonant;
	const consonantPending = awaitingLetterType === 'consonant' && !!pendingLetter?.consonant;

	// Determine background colors based on reveal state
	const getVowelBgColor = () => {
		if (hasVowel && vowelColorRevealed) {
			return vowelCorrect ? GameConfig.startingColors.inClue : GameConfig.startingColors.notInClue;
		}
		if (hasVowel && !vowelColorRevealed) {
			return GameConfig.startingColors.default;
		}
		if (vowelPending) {
			return GameConfig.startingColors.default;
		}
		return '';
	};

	const getConsonantBgColor = () => {
		if (hasConsonant && consonantColorRevealed) {
			return consonantCorrect ? GameConfig.startingColors.inClue : GameConfig.startingColors.notInClue;
		}
		if (hasConsonant && !consonantColorRevealed) {
			return GameConfig.startingColors.default;
		}
		if (consonantPending) {
			return GameConfig.startingColors.default;
		}
		return '';
	};

	return (
		<>
			<style jsx>{`
				@keyframes scale-in {
					from {
						transform: scale(0);
						opacity: 0;
					}
					to {
						transform: scale(1);
						opacity: 1;
					}
				}
				
				@keyframes color-reveal {
					0% {
						transform: scale(1);
					}
					50% {
						transform: scale(1.2);
					}
					100% {
						transform: scale(1);
					}
				}
			`}</style>

			<div ref={containerRef} className="flex gap-3 sm:gap-4 justify-start">
				
				{/* Additional Vowel */}
				<button
					ref={vowelButtonRef}
					onClick={handleVowelClick}
					disabled={hasVowel}
					className={`w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
						hasVowel || vowelPending
							? `${getVowelBgColor()} animate-[scale-in_0.2s_ease-out] transition-colors duration-500`
							: awaitingLetterType === 'vowel'
							? 'border-2 border-purple-500 border-solid animate-pulse'
							: 'border-2 border-dashed border-purple-400 hover:border-purple-500 hover:scale-105 active:scale-95 animate-pulse cursor-pointer'
					}`}
					style={{
						animation: shouldAnimateVowel && vowelColorRevealed
							? 'color-reveal 0.5s ease-out'
							: undefined
					}}
					onAnimationEnd={() => setShouldAnimateVowel(false)}
				>
					{vowelLetter ? (
						<span className={`text-xl sm:text-2xl md:text-3xl font-bold uppercase ${
							hasVowel || vowelPending
								? 'text-white dark:text-white'
								: 'text-black dark:text-white'
						}`}>
							{vowelLetter}
						</span>
					) : (
						<span className={`${GameConfig.additionalColors.vowel} text-base sm:text-lg font-bold`}>
							+V
						</span>
					)}				
				</button>

				{/* Additional Consonant */}
				<button
					ref={consonantButtonRef}
					onClick={handleConsonantClick}
					disabled={hasConsonant}
					className={`w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
						hasConsonant || consonantPending
							? `${getConsonantBgColor()} animate-[scale-in_0.2s_ease-out] transition-colors duration-500`
							: awaitingLetterType === 'consonant'
							? 'border-2 border-purple-500 border-solid animate-pulse'
							: 'border-2 border-dashed border-purple-400 hover:border-purple-500 hover:scale-105 active:scale-95 animate-pulse cursor-pointer'
					}`}
					style={{
						animation: shouldAnimateConsonant && consonantColorRevealed
							? 'color-reveal 0.5s ease-out'
							: undefined
					}}
					onAnimationEnd={() => setShouldAnimateConsonant(false)}
				>
					{consonantLetter ? (
						<span className={`text-xl sm:text-2xl md:text-3xl font-bold uppercase ${
							hasConsonant || consonantPending
								? 'text-white dark:text-white'
								: 'text-black dark:text-white'
						}`}>
							{consonantLetter}
						</span>
					) : (
						<span className={`${GameConfig.additionalColors.consonant} text-base sm:text-lg font-bold`}>
							+C
						</span>
					)}				
				</button>
			</div>
		</>
	);
}