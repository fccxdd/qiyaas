// components/game_assets/word_clues/ClueWord.tsx

'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameConfig } from '@/lib/gameConfig';
import FlashOverlay from '@/hooks/clues/FlashOverlay';

type LetterStatus = { [letter: string]: 'used_up' | 'still_available' | 'unused' };

interface RevealAnimation {
	dashesRevealed: Set<number>;
	dashesAnimating: Set<number>;
	lettersRevealed: (string | null)[];
}

interface ClueWordProps {
	word: string;
	wordType?: string;
	cursorPosition: number | null;
	onCursorClick: (position: number) => void;
	flashState: 'none' | 'red' | 'yellow' | 'green';
	isComplete: boolean;
	inputs: (string | null)[];
	verified: boolean[];
	shouldShake?: boolean;
	isLocked?: boolean;
	silentReveal?: boolean;
	revealAnimation?: RevealAnimation;
	letterStatus?: LetterStatus;
}

export default function ClueWord({
	word,
	wordType,
	cursorPosition,
	onCursorClick,
	flashState,
	isComplete,
	inputs,
	verified,
	shouldShake = false,
	isLocked = false,
	silentReveal = false,
	revealAnimation,
	letterStatus = {},
}: ClueWordProps) {

	const [bouncingIndices, setBouncingIndices] = useState<Set<number>>(new Set());
	const bounceTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
	const processedForBounce = useRef<Set<number>>(new Set());
	const prevInputsRef = useRef<(string | null)[]>([]);

	// ── Word type color ───────────────────────────────────────────────────────

	const wordTypeColor = useMemo(() => {
		if (!wordType) return GameConfig.wordColors.default;
		switch (wordType.toUpperCase()) {
			case 'NOUN': return GameConfig.wordColors.noun;
			case 'VERB': return GameConfig.wordColors.verb;
			case 'ADJECTIVE': return GameConfig.wordColors.adjective;
			default: return GameConfig.wordColors.default;
		}
	}, [wordType]);

	// ── Bounce helpers ────────────────────────────────────────────────────────

	const triggerBounce = useCallback((indices: number[]) => {
		if (indices.length === 0) return;
		setBouncingIndices(prev => new Set([...prev, ...indices]));
		indices.forEach(idx => {
			const existing = bounceTimeoutsRef.current.get(idx);
			if (existing) clearTimeout(existing);
			const t = setTimeout(() => {
				setBouncingIndices(prev => { const s = new Set(prev); s.delete(idx); return s; });
				bounceTimeoutsRef.current.delete(idx);
			}, GameConfig.duration.greencursorDuration);
			bounceTimeoutsRef.current.set(idx, t);
		});
	}, []);

	// ── Bounce for sequence-revealed letters ──────────────────────────────────

	useEffect(() => {
		if (!revealAnimation?.lettersRevealed) return;

		const newlyRevealed: number[] = [];
		revealAnimation.lettersRevealed.forEach((letter, pos) => {
			if (letter && !processedForBounce.current.has(pos)) {
				newlyRevealed.push(pos);
				processedForBounce.current.add(pos);
			}
		});

		triggerBounce(newlyRevealed);
	}, [revealAnimation?.lettersRevealed, triggerBounce]);

	// ── Bounce for user-typed letters ─────────────────────────────────────────

	useEffect(() => {
		const prev = prevInputsRef.current;
		const newlyTyped: number[] = [];

		inputs.forEach((letter, pos) => {
			if (revealAnimation?.lettersRevealed[pos]) return;
			if (letter && letter !== prev[pos]) newlyTyped.push(pos);
		});

		triggerBounce(newlyTyped);
		prevInputsRef.current = [...inputs];
	}, [inputs, revealAnimation?.lettersRevealed, triggerBounce]);

	// ── Cleanup on unmount ────────────────────────────────────────────────────

	useEffect(() => {
		return () => {
			bounceTimeoutsRef.current.forEach(t => clearTimeout(t));
		};
	}, []);

	// ── Click handler ─────────────────────────────────────────────────────────

	const handleClick = useCallback((position: number) => {
		if (isLocked) return;
		onCursorClick(position);
	}, [isLocked, onCursorClick]);

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<>
			<style>{`

				@keyframes bounce {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-10px); }
				}
				@keyframes dash-to-green {
					0%, 100% { transform: scale(1); }
					50% { transform: scale(1.2); }
				}
			`}</style>

			<FlashOverlay
				flashState={flashState}
				wordType={wordType}
				isComplete={isComplete}
				silentReveal={silentReveal}
			>
				<div className={`word-dash-wrapper flex my-2 relative ${shouldShake ? 'animate-shake' : ''} justify-start`}>
					{word.split('').map((char, i) => {
						const isVerified = verified[i] ?? false;
						const isDashRevealed = revealAnimation?.dashesRevealed.has(i) ?? false;
						const isAnimating = revealAnimation?.dashesAnimating.has(i) ?? false;
						const sequenceLetter = revealAnimation?.lettersRevealed[i] ?? null;
						const isSequenceRevealed = !!sequenceLetter;
						const isWaitingForReveal = isDashRevealed && !isSequenceRevealed;
						const userLetter = isWaitingForReveal ? null : (inputs[i] ?? null);
						const letter = sequenceLetter ?? userLetter;
						const isRevealed = isSequenceRevealed ? true : (!!userLetter && !isWaitingForReveal);
						const isCursor = cursorPosition === i && !isLocked;
						const isUserTyped = !!inputs[i] && !isSequenceRevealed && !isWaitingForReveal;
						const isBouncing = bouncingIndices.has(i);
						const charStatus = letterStatus[char.toUpperCase()];

						// Dash color
						let dashColor: string;
						if (flashState !== 'none') {
							dashColor = ''; // let .flash-active CSS handle it
						}
						else if (isComplete) {
							dashColor = wordTypeColor;
						} else if (isDashRevealed && !isRevealed) {
							dashColor = GameConfig.cursorColor.inClue;
						} else if (charStatus === 'still_available' && !isVerified) {
							dashColor = isCursor
								? `${GameConfig.cursorColor.stillAvailable} animate-pulse`
								: GameConfig.cursorColor.stillAvailable;
						} else if (isCursor) {
							dashColor = GameConfig.cursorColor.default;
						} else {
							dashColor = GameConfig.wordColors.default;
						}

						// Letter color
						let letterColor: string;
						if (flashState !== 'none') {
							letterColor = ''; // let .flash-active CSS handle it
						} else if (isComplete) {
							letterColor = wordTypeColor;
						} else if (isVerified || isSequenceRevealed) {
							letterColor = GameConfig.wordColors.default;
						} else if (isUserTyped) {
							letterColor = GameConfig.cursorColor.default;
						} else {
							letterColor = GameConfig.wordColors.default;
						}

						return (
							<div
								key={i}
								className="dash-container relative flex items-end justify-center cursor-pointer"
								onClick={() => handleClick(i)}
							>
								<span
									className={`dash-text font-bold leading-none transition-all duration-300 ${dashColor}`}
									style={isAnimating ? { animation: 'dash-to-green 0.3s ease-out' } : undefined}
								>
									_
								</span>
								{isRevealed && (
									<span
										className={`letter-text absolute bottom-4 left-1/2 -translate-x-1/2 font-bold leading-none transition-all duration-300 cursor-pointer ${letterColor}`}
										style={isBouncing ? { animation: `bounce ${GameConfig.duration.greencursorDuration}ms ease-out` } : undefined}
									>
										{letter?.toUpperCase()}
									</span>
								)}
							</div>
						);
					})}
				</div>
			</FlashOverlay>
		</>
	);
}