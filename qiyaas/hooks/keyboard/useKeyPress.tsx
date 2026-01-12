// hooks/keyboard/useKeyPress.tsx

import { useState, useEffect, useCallback } from 'react';

interface UseKeyPressProps {
	onKeyPress?: (key: string) => void;
	onBackspace?: () => void;
	onEnter?: () => void;
	disabled?: boolean;
	gameStarted?: boolean;
	awaitingLetterType?: 'vowel' | 'consonant' | null;
	clueLettersComplete?: boolean;
	isGameOver?: boolean;
	hasLostLifeForNoStartingLetters?: boolean;
}

export function useKeyPress({ 
	onKeyPress, 
	onBackspace, 
	onEnter, 
	disabled = false,
	gameStarted = false,
	awaitingLetterType = null,
	clueLettersComplete = false,
	isGameOver = false,
	hasLostLifeForNoStartingLetters = false,
}: UseKeyPressProps) {
	const [pressedKey, setPressedKey] = useState<string | null>(null);

	// Determine if keyboard should be actually disabled
	// Disable if:
	// - disabled=true AND we're NOT waiting for additional letter
	// - OR (game has started AND letters are still revealing)
	const isRevealingLetters = gameStarted && !clueLettersComplete && !hasLostLifeForNoStartingLetters;
	const isActuallyDisabled = !isGameOver && (disabled && !awaitingLetterType && !hasLostLifeForNoStartingLetters) || isRevealingLetters ;
	
// Handle physical keyboard events
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Ignore key presses with modifier keys
			if (event.ctrlKey || event.metaKey || event.altKey) {
				return;
			}
			
			const key = event.key.toUpperCase();
			
			// Check if this is a game-related key
			const isGameKey = /^[A-Z]$/.test(key) || key === 'BACKSPACE' || key === 'ENTER';
			
			// If disabled and it's a game key, prevent it and stop
			if (isActuallyDisabled && isGameKey) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();
				return;
			}			
		
			// Check if disabled and return if so
			if (isActuallyDisabled) return;
			
			// During active gameplay, let ClueWords handle it
			const isActiveGameplay = gameStarted && !awaitingLetterType;
				
			// Prevent default behavior for game keys
			if (!isActiveGameplay) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();
			}

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

		// Use capture phase to run BEFORE parent's listener
		window.addEventListener('keydown', handleKeyDown, true);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('keydown', handleKeyDown, true);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [onKeyPress, onBackspace, onEnter, isActuallyDisabled, awaitingLetterType, gameStarted]);

	// Helper function to dispatch a keyboard event
	const dispatchKeyboardEvent = useCallback((key: string) => {
		const event = new KeyboardEvent('keydown', {
			key: key,
			code: key === 'Backspace' ? 'Backspace' : key === 'Enter' ? 'Enter' : `Key${key}`,
			keyCode: key === 'Backspace' ? 8 : key === 'Enter' ? 13 : key.charCodeAt(0),
			which: key === 'Backspace' ? 8 : key === 'Enter' ? 13 : key.charCodeAt(0),
			bubbles: true,
			cancelable: true
		});
		window.dispatchEvent(event);
	}, []);

	// Handle click events
	const handleKeyClick = useCallback((key: string) => {
		if (isActuallyDisabled) return;
		
		setPressedKey(key);
		onKeyPress?.(key);
		
		// ONLY dispatch synthetic keyboard event if NOT waiting for additional letter
		if (gameStarted && !awaitingLetterType) {
			dispatchKeyboardEvent(key);
		}
		
		setTimeout(() => setPressedKey(null), 150);
	}, [isActuallyDisabled, onKeyPress, gameStarted, dispatchKeyboardEvent, awaitingLetterType]);

	const handleBackspaceClick = useCallback(() => {
		if (isActuallyDisabled) return;
		
		setPressedKey('BACKSPACE');
		onBackspace?.();
		
		// Only dispatch keyboard event if NOT waiting for additional letter
		if (gameStarted && !awaitingLetterType) {
			dispatchKeyboardEvent('Backspace');
		}
		
		setTimeout(() => setPressedKey(null), 150);
	}, [isActuallyDisabled, onBackspace, gameStarted, dispatchKeyboardEvent, awaitingLetterType]);

	const handleEnterClick = useCallback(() => {
		if (isActuallyDisabled) return;
		
		setPressedKey('ENTER');
		onEnter?.();
		
		// Only dispatch keyboard event if NOT waiting for additional letter
		if (gameStarted && !awaitingLetterType) {
			dispatchKeyboardEvent('Enter');
		}
		
		setTimeout(() => setPressedKey(null), 150);
	}, [isActuallyDisabled, onEnter, gameStarted, dispatchKeyboardEvent, awaitingLetterType]);

	return {
		pressedKey,
		handleKeyClick,
		handleBackspaceClick,
		handleEnterClick,
		isActuallyDisabled,
	};
}