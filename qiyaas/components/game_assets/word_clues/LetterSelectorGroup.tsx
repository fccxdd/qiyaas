// components/game_assets/word_clues/LetterSelectorGroup.tsx

'use client';

import { useRef, useEffect } from 'react';
import LetterSelector, { LetterType } from './LetterSelector';

export interface LetterSelectorConfig {
	type: LetterType;
	label: string;
	colorConfig?: {
		label: string;
		selected: string;
		unselected: string;
	};
}

interface LetterSelectorGroupProps {
	selectors: LetterSelectorConfig[];
	onRequestLetter?: (type: LetterType) => void;
	letters?: { [key: string]: string };
	gameStarted?: boolean;
	awaitingLetterType?: LetterType | null;
	pendingLetters?: { [key: string]: string };
	validatedLetters?: {
		[key: string]: { letter: string; correct: boolean };
	};
	onCancelSelection?: () => void;
}

export default function LetterSelectorGroup({
	selectors,
	onRequestLetter,
	letters = {},
	gameStarted = false,
	awaitingLetterType = null,
	pendingLetters = {},
	validatedLetters = {},
	onCancelSelection,
}: LetterSelectorGroupProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

	// Add click-away listener
	useEffect(() => {
		if (!awaitingLetterType) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			
			// Check if clicking on any of our letter selector buttons
			for (const button of buttonRefs.current.values()) {
				if (button.contains(target)) {
					return;
				}
			}
			
			// Check if clicking on keyboard or other game controls
			const isKeyboardClick = target.closest('button')?.textContent?.match(/^[A-Z]$/) || 
				target.closest('svg[data-testid*="Icon"]') ||
				(target.tagName === 'BUTTON' && target.closest('.flex.justify-center.w-full'));
			
			if (isKeyboardClick) {
				return;
			}
			
			// If clicking outside the container and not on game controls, cancel selection
			if (containerRef.current && !containerRef.current.contains(target)) {
				onCancelSelection?.();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [awaitingLetterType, onCancelSelection]);

	// Register button refs
	const registerButtonRef = (type: string, element: HTMLButtonElement | null) => {
		if (element) {
			buttonRefs.current.set(type, element);
		} else {
			buttonRefs.current.delete(type);
		}
	};

	if (!gameStarted) {
		return null;
	}

	return (
		<div ref={containerRef} className="flex gap-3 sm:gap-4 justify-start">
			{selectors.map((config, index) => {
				const typeKey = config.type;
				
				return (
					<div key={`${typeKey}-${index}`} ref={(el) => {
						if (el) {
							const button = el.querySelector('button');
							registerButtonRef(`${typeKey}-${index}`, button);
						}
					}}>
						<LetterSelector
							type={config.type}
							label={config.label}
							onRequestLetter={() => onRequestLetter?.(config.type)}
							letter={letters[typeKey]}
							pendingLetter={pendingLetters[typeKey]}
							gameStarted={gameStarted}
							isAwaiting={awaitingLetterType === config.type}
							isPending={awaitingLetterType === config.type && !!pendingLetters[typeKey]}
							validated={validatedLetters[typeKey] || null}
							onCancelSelection={onCancelSelection}
							colorConfig={config.colorConfig}
						/>
					</div>
				);
			})}
		</div>
	);
}