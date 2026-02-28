// hooks/keyboard/useKeyPress.tsx

import { useState, useEffect, useCallback } from 'react';

interface UseKeyPressProps {
	onKeyPress?: (key: string) => void;
	onBackspace?: () => void;
	onEnter?: () => void;
	disabled?: boolean;
	gameStarted?: boolean;
	isGameOver?: boolean;
	hasLostLifeForNoStartingLetters?: boolean;
	isRevealing?: boolean;
}

export function useKeyPress({ 
	onKeyPress, 
	onBackspace, 
	onEnter, 
	disabled = false,
	gameStarted = false,
	isGameOver = false,
	hasLostLifeForNoStartingLetters = false,
	isRevealing = false,
}: UseKeyPressProps) {
	const [pressedKey, setPressedKey] = useState<string | null>(null);

	// Keyboard is disabled only when explicitly told to be (e.g. message showing)
	// and the game is not over. useKeyboardInput owns all post-game-start gating.
	const isActuallyDisabled = !isGameOver && (disabled || isRevealing);

	// Handle physical keyboard events — only pre-game (starting letter selection).
	// Once game starts, useKeyboardInput takes over physical key handling.
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey || event.metaKey || event.altKey) return;

			const key = event.key.toUpperCase();
			const isGameKey = /^[A-Z]$/.test(key) || key === 'BACKSPACE' || key === 'ENTER';

			if (isActuallyDisabled && isGameKey) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();
				return;
			}

			if (isActuallyDisabled) return;

			// Once game has started, useKeyboardInput owns physical key events.
			// Don't intercept here — let them propagate.
			if (gameStarted) return;

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();

			if (key === 'BACKSPACE' && onBackspace) {
				setPressedKey('BACKSPACE');
				onBackspace();
				return;
			}

			if (key === 'ENTER' && onEnter) {
				setPressedKey('ENTER');
				onEnter();
				return;
			}

			if (/^[A-Z]$/.test(key) && onKeyPress) {
				setPressedKey(key);
				onKeyPress(key);
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			const key = event.key.toUpperCase();
			if (/^[A-Z]$/.test(key) || key === 'BACKSPACE' || key === 'ENTER') {
				setPressedKey(null);
			}
		};

		window.addEventListener('keydown', handleKeyDown, true);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('keydown', handleKeyDown, true);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [onKeyPress, onBackspace, onEnter, isActuallyDisabled, gameStarted]);

	// Dispatch synthetic keyboard event — used by on-screen keyboard clicks
	// so that useKeyboardInput picks them up via its window listener.
	const dispatchKeyboardEvent = useCallback((key: string) => {
		const event = new KeyboardEvent('keydown', {
			key: key,
			code: key === 'Backspace' ? 'Backspace' : key === 'Enter' ? 'Enter' : `Key${key}`,
			keyCode: key === 'Backspace' ? 8 : key === 'Enter' ? 13 : key.charCodeAt(0),
			which: key === 'Backspace' ? 8 : key === 'Enter' ? 13 : key.charCodeAt(0),
			bubbles: true,
			cancelable: true,
		});
		window.dispatchEvent(event);
	}, []);

	const handleKeyClick = useCallback((key: string) => {
		if (isActuallyDisabled) return;
		setPressedKey(key);
		if (gameStarted) {
			// Post-game: dispatch synthetic event for useKeyboardInput to handle
			dispatchKeyboardEvent(key);
		} else {
			// Pre-game: call handler directly (starting letter selection)
			onKeyPress?.(key);
		}
		setTimeout(() => setPressedKey(null), 150);
	}, [isActuallyDisabled, gameStarted, dispatchKeyboardEvent, onKeyPress]);

	const handleBackspaceClick = useCallback(() => {
		if (isActuallyDisabled) return;
		setPressedKey('BACKSPACE');
		if (gameStarted) {
			dispatchKeyboardEvent('Backspace');
		} else {
			onBackspace?.();
		}
		setTimeout(() => setPressedKey(null), 150);
	}, [isActuallyDisabled, gameStarted, dispatchKeyboardEvent, onBackspace]);

	const handleEnterClick = useCallback(() => {
		if (isActuallyDisabled) return;
		setPressedKey('ENTER');
		if (gameStarted) {
			dispatchKeyboardEvent('Enter');
		} else {
			onEnter?.();
		}
		setTimeout(() => setPressedKey(null), 150);
	}, [isActuallyDisabled, gameStarted, dispatchKeyboardEvent, onEnter]);

	return {
		pressedKey,
		handleKeyClick,
		handleBackspaceClick,
		handleEnterClick,
		isActuallyDisabled,
	};
}