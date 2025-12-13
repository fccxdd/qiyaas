// components/game_assets/word_clues/LetterSelector.tsx

'use client';

import { useRef, useEffect, useState } from 'react';
import { GameConfig } from '@/lib/gameConfig';

export type LetterType = 'vowel' | 'consonant';

interface LetterSelectorProps {
	type: LetterType;
	label: string;
	onRequestLetter?: () => void;
	letter?: string | null;
	pendingLetter?: string | null;
	gameStarted?: boolean;
	isAwaiting?: boolean;
	isPending?: boolean;
	validated?: { letter: string; correct: boolean } | null;
	onCancelSelection?: () => void;
	colorConfig?: {
		label: string;
		selected: string;
		unselected: string;
	};
}

export default function LetterSelector({
	type,
	label,
	onRequestLetter,
	letter = null,
	pendingLetter = null,
	gameStarted = false,
	isAwaiting = false,
	isPending = false,
	validated = null,
	onCancelSelection,
	colorConfig,
}: LetterSelectorProps) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [colorRevealed, setColorRevealed] = useState(false);
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const currentState = useRef<string>('');

	// Default color config
	const colors = colorConfig || {
		label: type === 'vowel' 
			? GameConfig.additionalColors.vowel 
			: type === 'consonant'
			? GameConfig.additionalColors.consonant
			: 'text-gray-600 dark:text-gray-400',
		selected: GameConfig.additionalColors.selectedLetter,
		unselected: GameConfig.additionalColors.unselectedLetter,
	};

	// Track and animate when validation state changes
	useEffect(() => {
		const state = validated ? `${validated.letter}-${validated.correct}` : '';
		
		if (state !== currentState.current) {
			if (state && !currentState.current) {
				// Letter was just validated for the first time
				setShouldAnimate(true);
				setTimeout(() => {
					setColorRevealed(true);
				}, 0);
			} else if (!state) {
				// Letter was cleared (new round)
				setColorRevealed(false);
				setShouldAnimate(false);
			}
			currentState.current = state;
		}
	}, [validated]);

	// Expose button ref for parent components
	useEffect(() => {
		if (buttonRef.current) {
			buttonRef.current.dataset.letterType = type;
		}
	}, [type]);

	const handleClick = () => {
		if (validated) return;
		onRequestLetter?.();
	};

	if (!gameStarted) {
		return null;
	}

	const displayLetter = validated?.letter || pendingLetter || letter || null;
	const isCorrect = validated?.correct;
	const hasValidated = !!validated;

	// Determine background color based on reveal state
	const getBgColor = () => {
		if (hasValidated && colorRevealed) {
			return isCorrect 
				? GameConfig.startingColors.inClue 
				: GameConfig.startingColors.notInClue;
		}
		if (hasValidated && !colorRevealed) {
			return GameConfig.startingColors.default;
		}
		if (isPending) {
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
				
				/* Standard Breakpoints for letter selector sizing */
				
				/* Mobile devices (320px — 480px) */
				.letter-selector {
					width: 1.75rem;
					height: 1.75rem;
				}
				.letter-text {
					font-size: 1.25rem;
				}
				.label-text {
					font-size: 0.875rem;
				}
				
				/* iPads, Tablets (481px — 768px) */
				@media screen and (min-width: 481px) and (max-width: 768px) {
					.letter-selector {
						width: 2rem;
						height: 2rem;
					}
					.letter-text {
						font-size: 1.5rem;
					}
					.label-text {
						font-size: 1rem;
					}
				}
				
				/* Small screens, laptops - 13-inch (769px — 1024px) */
				@media screen and (min-width: 769px) and (max-width: 1024px) {
					.letter-selector {
						width: 2.5rem;
						height: 2.5rem;
					}
					.letter-text {
						font-size: 1.75rem;
					}
					.label-text {
						font-size: 1.125rem;
					}
				}
				
				/* Desktops, large screens - 15-inch+ (1025px — 1200px) */
				@media screen and (min-width: 1025px) and (max-width: 1200px) {
					.letter-selector {
						width: 2.75rem;
						height: 2.75rem;
					}
					.letter-text {
						font-size: 1.875rem;
					}
					.label-text {
						font-size: 1.125rem;
					}
				}
				
				/* Extra large screens (1201px and more) */
				@media screen and (min-width: 1201px) {
					.letter-selector {
						width: 3rem;
						height: 3rem;
					}
					.letter-text {
						font-size: 1.875rem;
					}
					.label-text {
						font-size: 1.125rem;
					}
				}
				
				/* High-DPI 13-inch laptops (Yoga, etc.) - needs smaller sizing */
				@media screen and (min-width: 1201px) and (max-width: 1400px) {
					.letter-selector {
						width: 1.75rem;
						height: 1.75rem;
					}
					.letter-text {
						font-size: 1rem;
					}
					.label-text {
						font-size: 1rem;
					}
				}
			`}</style>

			<button
				ref={buttonRef}
				onClick={handleClick}
				disabled={hasValidated}
				className={`letter-selector rounded-full flex items-center justify-center transition-all ${
					hasValidated || isPending
						? `${getBgColor()} animate-[scale-in_0.2s_ease-out] transition-colors duration-500`
						: isAwaiting
						? `border-2 ${colors.selected} border-solid animate-pulse`
						: `border-2 border-dashed ${colors.unselected} hover:${colors.selected} hover:scale-105 active:scale-95 animate-pulse cursor-pointer`
				}`}
				style={{
					animation: shouldAnimate && colorRevealed
						? 'color-reveal 0.5s ease-out'
						: undefined
				}}
				onAnimationEnd={() => setShouldAnimate(false)}
			>
				{displayLetter ? (
					<span className={`letter-text font-bold uppercase ${
						hasValidated || isPending
							? 'text-white dark:text-white'
							: 'text-black dark:text-white'
					}`}>
						{displayLetter}
					</span>
				) : (
					<span className={`label-text ${colors.label} font-bold`}>
						{label}
					</span>
				)}
			</button>
		</>
	);
}