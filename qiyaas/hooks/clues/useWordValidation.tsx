// /hooks/clues/useWordValidation.tsx

import { useCallback, RefObject } from 'react';
import { validateWord } from '@/components/game_assets/word_clues/ValidateWords';
import { GameConfig } from '@/lib/gameConfig';
import { FlashState } from './useFlashState';

export function useWordValidation(
	userInputs: Map<string, Map<number, string>>,
	setUserInputs: (inputs: Map<string, Map<number, string>> | ((prev: Map<string, Map<number, string>>) => Map<string, Map<number, string>>)) => void,
	triggerFlash: (clue: string, state: FlashState, onComplete?: () => void) => void,	
	setCompletedWords: (words: Set<string> | ((prev: Set<string>) => Set<string>)) => void,
	setCursorPosition: (position: { clueIndex: number; position: number } | null) => void,
	findNextIncompleteWord: () => { clueIndex: number; position: number } | null,
	startingLettersSet: RefObject<Set<string>>,
	onLifeLost: () => void,
	verifiedPositions: Map<string, Set<number>>,
	setVerifiedPositions: (positions: Map<string, Set<number>> | ((prev: Map<string, Set<number>>) => Map<string, Set<number>>)) => void,
	onShowMessage: (msg: string, type?: 'error' | 'success' | 'info') => void,
	setShakeWord: (word: string | null) => void,
	setAllGuessedLetters: (letters: Set<string> | ((prev: Set<string>) => Set<string>)) => void,
	completedWords: Set<string>,
	setSolvedClues: (clues: boolean[] | ((prev: boolean[]) => boolean[])) => void,
	clueWordsArray: string[],
	findNextEmptyPosition: (clue: string, fromPosition: number, wordInputs: Map<number, string>) => number | null,
	isWordComplete: (clue: string, wordInputs: Map<number, string>) => boolean,
	silentRevealedWords: Set<string>
) {
	const submitWord = useCallback((clue: string, clueIndex: number) => {
		const wordInputs = userInputs.get(clue);
		if (!wordInputs || !isWordComplete(clue, wordInputs)) return;

		// Reconstruct the user's complete word
		const userWord = Array.from({ length: clue.length }, (_, i) => 
			wordInputs.get(i) || ''
		).join('');
		
		// Validate against word list
		const isValid = validateWord(userWord);
		
		if (!isValid) {
			// Not a valid word -> DON'T add letters to guessed set (or add any keyboard hints!)
			// Not a valid word message
			onShowMessage(GameConfig.messages.wordNotValid, 'info');
			
			// Trigger shake animation
			setShakeWord(clue);
			setTimeout(() => setShakeWord(null), GameConfig.duration.shakeDuration); // Clear shake after duration
			
			// Vibrate if supported
			if (navigator.vibrate) {
				navigator.vibrate(GameConfig.vibrationPattern); // Short vibration pattern
			}
			
			// Clear all user-typed letters (keep starting letters AND verified correct letters)
			setTimeout(() => {
				const newWordInputs = new Map<number, string>();
				const clueUpper = clue.toUpperCase();
				const verified = verifiedPositions.get(clue); // Get verified positions
				
				// Keep starting letters AND verified correct letters
				for (let i = 0; i < clueUpper.length; i++) {
					if (startingLettersSet.current?.has(clueUpper[i])) {
						newWordInputs.set(i, clueUpper[i]);
					} else if (verified?.has(i)) {
						// Keep verified correct letters from previous attempts
						const letter = wordInputs.get(i);
						if (letter) newWordInputs.set(i, letter);
					}
				}
				
				setUserInputs(prev => new Map(prev).set(clue, newWordInputs));
				
				// Move cursor to first empty position
				const nextEmpty = findNextEmptyPosition(clue, -1, newWordInputs);
				if (nextEmpty !== null) {
					setCursorPosition({ clueIndex, position: nextEmpty });
				}
			}, GameConfig.duration.clearShakeAfter); // Clear after shake animation completes
			
			// Don't lose a life, and DON'T track letters!
			return;
		}

		// Word is valid -> Add letters to the guessed set for keyboard tracking
		setAllGuessedLetters(prev => {
			const newSet = new Set(prev);
			userWord.split('').forEach(letter => {
				if (letter) {
					const upper = letter.toUpperCase();
					newSet.add(upper);
				}
			});
			return newSet;
		});

		// Word is valid -> Check if it matches the clue
		const clueUpper = clue.toUpperCase();
		let allCorrect = true;
		let someCorrectPosition = false;
		let hasLettersInWord = false;
		const correctPositions = new Set<number>();

		// Check each position
		for (let i = 0; i < clueUpper.length; i++) {
			const userLetter = wordInputs.get(i);
			const correctLetter = clueUpper[i];

			if (userLetter === correctLetter) {
				correctPositions.add(i);
				someCorrectPosition = true;
			} else {
				allCorrect = false;
			}
			
			// Check if this letter exists anywhere in the clue (even if wrong position)
			if (userLetter && clueUpper.includes(userLetter)) {
				hasLettersInWord = true;
			}
		}

		if (allCorrect) {
			// Mark ALL positions as verified since the entire word is correct
			const allPositions = new Set<number>();
			for (let i = 0; i < clue.length; i++) {
				allPositions.add(i);
			}
			setVerifiedPositions(prev => new Map(prev).set(clue, allPositions));
			
			// Only show message if this wasn't auto-revealed on loss
			if (!silentRevealedWords.has(clue)) {
				onShowMessage(GameConfig.messages.wordCorrect, 'success');
			}
			
			// IMPORTANT: Find next position BEFORE marking word as complete
			// Otherwise findNextIncompleteWord will include the current word in its search
			const nextPos = findNextIncompleteWord();
			
			// Now mark as complete
			setCompletedWords(prev => new Set(prev).add(clue));

			setSolvedClues(prev => {
				const newSolved = [...prev];
				newSolved[clueIndex] = true;
				return newSolved;
			});
			
			// Trigger green flash
			triggerFlash(clue, 'green', () => {
				// After flash completes, wait the moveToNextIncompleteWord duration before moving cursor
				setTimeout(() => {
					if (nextPos) {
						setCursorPosition(nextPos);
					} else {
						setCursorPosition(null);
					}
				}, GameConfig.duration.moveToNextIncompleteWord);
			});
		} else {
			// Wrong - lose a life
			onLifeLost();
			
			// Show incorrect message
			onShowMessage(GameConfig.messages.wordIncorrect, 'error');
		
			if (someCorrectPosition || hasLettersInWord) {
				// Add correct positions to verified positions
				setVerifiedPositions(prev => new Map(prev).set(clue, correctPositions));        

				// Trigger yellow flash
				triggerFlash(clue, 'yellow', () => {
					// After flash completes, wait additional time before cleanup
					setTimeout(() => {
						const newWordInputs = new Map<number, string>();
						correctPositions.forEach(pos => {
							const letter = wordInputs.get(pos);
							if (letter) newWordInputs.set(pos, letter);
						});
					
						setUserInputs(prev => new Map(prev).set(clue, newWordInputs));
						
						// Move cursor to first empty position
						const nextEmpty = findNextEmptyPosition(clue, -1, newWordInputs);
						if (nextEmpty !== null) {
							setCursorPosition({ clueIndex, position: nextEmpty });
						}
					}, GameConfig.duration.moveToFirstEmptyPosition);
				});
			} else {
				// Trigger red flash - no letters from the guess exist in the clue
				triggerFlash(clue, 'red', () => {
					// After flash completes, wait additional time before cleanup
					setTimeout(() => {
						const newWordInputs = new Map<number, string>();
						// Keep only starting letters
						for (let i = 0; i < clueUpper.length; i++) {
							if (startingLettersSet.current?.has(clueUpper[i])) {
								newWordInputs.set(i, clueUpper[i]);
							}
						}
					
						setUserInputs(prev => new Map(prev).set(clue, newWordInputs));
					
						// Move cursor to first empty position
						const nextEmpty = findNextEmptyPosition(clue, -1, newWordInputs);
						if (nextEmpty !== null) {
							setCursorPosition({ clueIndex, position: nextEmpty });
						}	
					}, GameConfig.duration.moveToFirstEmptyPosition);
				});
			}
		}
	}, [
		userInputs,
		setUserInputs,
		triggerFlash,
		setCompletedWords,
		setCursorPosition,
		findNextIncompleteWord,
		startingLettersSet,
		onLifeLost,
		verifiedPositions,
		setVerifiedPositions,
		onShowMessage,
		setShakeWord,
		setAllGuessedLetters,
		completedWords,
		setSolvedClues,
		clueWordsArray,
		findNextEmptyPosition,
		isWordComplete,
		silentRevealedWords
	]);

	return { submitWord };
}