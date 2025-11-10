// components/game_mode/play/PlayMode.tsx

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import HintToggle from "@/components/game_assets/number_clues/HintToggle";
import { getCluesData } from '@/components/game_assets/word_clues/ExtractAnswer_GamePlay';
import Keyboard from "@/components/game_assets/keyboard/Keyboard";
import LifeBar from "@/components/game_assets/lives/LifeBar";
import StartingLetters from "@/components/game_assets/word_clues/StartingLetters";
import AdditionalLetters from "@/components/game_assets/word_clues/AdditionalLetters";
import ClueWords from "@/components/game_assets/word_clues/ClueWords";
import MessageBox from "@/components/game_assets/messages/MessageBox";
import { WinScreen, LoseScreen } from '@/components/game_assets/game_over/GameOverScreen_Multiple_GamePlay';
import { GameConfig } from "@/lib/gameConfig";
import { useAllowKeyboardShortcuts } from "@/hooks/keyboard/usePreventRefresh";
import { useKeyboardLetterStatus } from "@/hooks/keyboard/KeyboardLetterTracker";
import { useGameStorage } from "@/hooks/clues/useGameStorage";

// Only for Multiple Rounds Version of Game
import { advanceToNextRound, DailyWordRound, getRoundByIndex, setCurrentRoundIndex } from '@/components/game_assets/word_clues/ExtractAnswer_GamePlay';

// Import helper to get word from clue
import { getWordFromClue, getTypeFromClue } from '@/hooks/clues/clueTypes';

export default function PlayMode() {

	const { loadGameState, saveGameState, clearGameState } = useGameStorage();
	
	const [isTransitioned, setIsTransitioned] = useState(false);
	const [lives, setLives] = useState(GameConfig.maxLives);
	const [selectedLetters, setSelectedLetters] = useState('');
	
	const [additionalLetters, setAdditionalLetters] = useState<{
		vowel?: string;
		consonant?: string;
	}>({});
	
	const [validatedAdditionalLetters, setValidatedAdditionalLetters] = useState<{
		vowel?: { letter: string; correct: boolean };
		consonant?: { letter: string; correct: boolean };
	}>({});
	
	const [hasAnyCorrectAdditionalLetter, setHasAnyCorrectAdditionalLetter] = useState(false);
	const [awaitingLetterType, setAwaitingLetterType] = useState<'vowel' | 'consonant' | null>(null);
	const [pendingLetter, setPendingLetter] = useState<{vowel?: string; consonant?: string}>({});
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('error');
	const [gameStarted, setGameStarted] = useState(false);
	const [lettersInClues, setLettersInClues] = useState<Set<string>>(new Set());
	const [isGameOver, setIsGameOver] = useState(false);
	const [hasWon, setHasWon] = useState(false);
	const [wordInputs, setWordInputs] = useState<Map<string, string>>(new Map());
	const [verifiedInputs, setVerifiedInputs] = useState<Map<string, string>>(new Map());
	const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
	const [currentRound, setCurrentRound] = useState(1); // Track current round number
	const [hintsEnabled, setHintsEnabled] = useState(true); // Track hint toggle state
	    
	// Use lazy initialization to prevent calling getCluesData() before localStorage loads
	const [cluesData, setCluesData] = useState<DailyWordRound>(() => {
		// On first render, return a placeholder that will be overwritten by localStorage
		// or by getCluesData() if no save exists
		return {} as DailyWordRound;
	});
	const hasInitializedClues = useRef(false);

	// Access numbers_for_clue from new structure
	const numbersForClue = cluesData?.numbers_for_clue ?? [];
	
	// Track keyboard letter status based on VERIFIED inputs only
	const letterStatus = useKeyboardLetterStatus({
		selectedStartingLetters: selectedLetters,
		additionalLetters,
		cluesData,
		wordInputs: verifiedInputs, // Use verified inputs, not all typed inputs
		gameStarted
	});
	
	// Debug: Log letterStatus and verifiedInputs
	useEffect(() => {
		if (hasLoadedFromStorage && gameStarted) {
			console.log('🎨 Current letterStatus:', letterStatus);
			console.log('✅ Current verifiedInputs:', Array.from(verifiedInputs.entries()));
		}
	}, [letterStatus, verifiedInputs, hasLoadedFromStorage, gameStarted]);

	// RevealLetters animation
	const [startRevealingClues, setStartRevealingClues] = useState(false);
	
	// Load game state from localStorage on mount - BEFORE any initialization
	useEffect(() => {
		const savedState = loadGameState();
		if (savedState && savedState.cluesData) {
			console.log('📂 Loading saved game state:', savedState);
			
			// Restore all state
			setLives(savedState.lives);
			setSelectedLetters(savedState.selectedLetters);
			setAdditionalLetters(savedState.additionalLetters);
			setValidatedAdditionalLetters(savedState.validatedAdditionalLetters);
			setHasAnyCorrectAdditionalLetter(savedState.hasAnyCorrectAdditionalLetter);
			setGameStarted(savedState.gameStarted);
			setLettersInClues(new Set(savedState.lettersInClues || []));
			
			// Convert arrays back to Maps properly
			setWordInputs(new Map(savedState.wordInputs || []));
			setVerifiedInputs(new Map(savedState.verifiedInputs || []));
			
			// Restore round number and sync module-level index
			if (savedState.currentRound) {
				const roundIndex = savedState.currentRound - 1; // Convert 1-based to 0-based index
				setCurrentRound(savedState.currentRound);
				setCurrentRoundIndex(roundIndex); // Sync the module-level index
				console.log('🔄 Synced round index to:', roundIndex);
			}
			
			// Restore hints toggle state
			if (typeof savedState.hintsEnabled !== 'undefined') {
				setHintsEnabled(savedState.hintsEnabled);
			}
			
			// CRITICAL: Restore the exact cluesData that was saved
			setCluesData(savedState.cluesData);
			hasInitializedClues.current = true;
			
			setIsGameOver(savedState.isGameOver || false);
			setHasWon(savedState.hasWon || false);
			
			console.log('✅ Restored wordInputs:', new Map(savedState.wordInputs || []));
			console.log('✅ Restored verifiedInputs:', new Map(savedState.verifiedInputs || []));
			console.log('✅ Restored currentRound:', savedState.currentRound);
			console.log('✅ Restored cluesData:', savedState.cluesData);
		} else {
			// No saved state, initialize with fresh clues
			console.log('🆕 No saved state, starting fresh');
			setCurrentRoundIndex(0); // Reset to first round
			setCluesData(getCluesData());
			hasInitializedClues.current = true;
		}
		setHasLoadedFromStorage(true);
	}, [loadGameState]);

	// Save game state to localStorage whenever key state changes
	useEffect(() => {
		// Don't save until we've loaded from storage first
		if (!hasLoadedFromStorage) {
			console.log('⏸️ Skipping save - waiting for storage load');
			return;
		}
		
		// Don't save if game is over (we'll clear storage instead)
		if (isGameOver) {
			console.log('⏸️ Skipping save - game is over');
			return;
		}
		
		const stateToSave = {
			lives,
			selectedLetters,
			additionalLetters,
			validatedAdditionalLetters,
			hasAnyCorrectAdditionalLetter,
			gameStarted,
			lettersInClues: Array.from(lettersInClues),
			wordInputs: Array.from(wordInputs.entries()),
			verifiedInputs: Array.from(verifiedInputs.entries()),
			cluesData,
			isGameOver,
			hasWon,
			letterStatus: letterStatus as Record<string, 'correct' | 'partial' | 'incorrect' | 'unused'>, // Cast to explicit type
			currentRound, // Save the current round number
			hintsEnabled, // Save the hints toggle state
			timestamp: Date.now()
		};
		
		console.log('💾 Saving game state to localStorage');
		console.log('   - wordInputs size:', wordInputs.size, 'entries:', Array.from(wordInputs.entries()));
		console.log('   - verifiedInputs size:', verifiedInputs.size, 'entries:', Array.from(verifiedInputs.entries()));
		console.log('   - letterStatus:', letterStatus);
		console.log('   - currentRound:', currentRound);
		console.log('   - hintsEnabled:', hintsEnabled);
		console.log('   - cluesData round:', cluesData);
		saveGameState(stateToSave);
	}, [
		lives,
		selectedLetters,
		additionalLetters,
		validatedAdditionalLetters,
		hasAnyCorrectAdditionalLetter,
		gameStarted,
		lettersInClues,
		wordInputs,
		verifiedInputs,
		cluesData,
		isGameOver,
		hasWon,
		letterStatus,
		currentRound,
		hintsEnabled,
		hasLoadedFromStorage,
		saveGameState
	]);
	
	const handleLifeLost = useCallback(() => {
		setLives(prev => Math.max(0, prev - 1));
	}, []);

	// Handle win condition - called by ClueWords component
	const handleWin = useCallback(() => {
		setTimeout(() => {
			setIsGameOver(true);
			setHasWon(true);
			// Don't clear game state on win - we'll advance to next round in handlePlayAgain
		}, GameConfig.gameOverScreenDelay);
	}, []);
	
	// Allow keyboard shortcuts like Ctrl+C, Ctrl+V to work normally
	useAllowKeyboardShortcuts();

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsTransitioned(true);
		}, 50);
		return () => clearTimeout(timer);
	}, []);

	// Monitor lives and trigger game over screen when lives reach 0
	useEffect(() => {
		if (lives === 0 && !isGameOver) {
			setTimeout(() => {
				setIsGameOver(true);
				setHasWon(false);
				// Clear saved game when losing
				clearGameState();
			}, GameConfig.gameOverScreenDelay);
		}
	}, [lives, isGameOver, clearGameState]);

	const showMessage = useCallback((msg: string, type: 'error' | 'success' | 'info' = 'error') => {
		setMessage(msg);
		setMessageType(type);
	}, []);

	const handleMessageClose = useCallback(() => {
		setMessage('');
	}, []);

	// Handle request for additional letter (no consonantIndex needed anymore)
	const handleRequestAdditionalLetter = useCallback((type: 'vowel' | 'consonant') => {
		console.log('📝 handleRequestAdditionalLetter:', type);
		
		// Check if already selected and confirmed
		if (type === 'vowel') {
			const validatedLetter = validatedAdditionalLetters.vowel;
			if (validatedLetter) {
				setAwaitingLetterType(type);
				setPendingLetter(prev => ({
					...prev,
					vowel: validatedLetter.letter
				}));
				showMessage(`Press Backspace to remove ${validatedLetter.letter}, or select a new letter`, 'info');
				return;
			}
		} else {
			// For consonant (singular)
			const validatedLetter = validatedAdditionalLetters.consonant;
			if (validatedLetter) {
				setAwaitingLetterType(type);
				setPendingLetter(prev => ({
					...prev,
					consonant: validatedLetter.letter
				}));
				showMessage(`Press Backspace to remove ${validatedLetter.letter}, or select a new letter`, 'info');
				return;
			}
		}

		// If clicking the same button that's already awaiting, cancel it
		if (awaitingLetterType === type) {
			setAwaitingLetterType(null);
			setPendingLetter(prev => {
				const updated = {...prev};
				delete updated[type === 'vowel' ? 'vowel' : 'consonant'];
				return updated;
			});
			setMessage('');
			return;
		}

		// Set awaiting state
		setAwaitingLetterType(type);
		console.log('✅ Set awaitingLetterType to:', type);
		
		// Clear pending letter for this type if it doesn't exist
		if (type === 'vowel' && !pendingLetter.vowel) {
			setPendingLetter(prev => {
				const updated = {...prev};
				delete updated.vowel;
				return updated;
			});
		} else if (type === 'consonant' && !pendingLetter.consonant) {
			setPendingLetter(prev => {
				const updated = {...prev};
				delete updated.consonant;
				return updated;
			});
		}
		
		setTimeout(() => {
			showMessage(GameConfig.messages.selectAdditionalLetter?.replace('{type}', type), 'info');
		}, 0);
	}, [validatedAdditionalLetters, showMessage, awaitingLetterType, pendingLetter]);

	// Check which letters (including additional) appear in any clue word
	const checkLettersInClues = useCallback((letters: string) => {
		const lettersArray = letters.split('');
		const inClues = new Set<string>();
		
		// Get all clue words using helper function
		const clueWords = [
			getWordFromClue(cluesData.clue_1)?.toUpperCase(),
			getWordFromClue(cluesData.clue_2)?.toUpperCase(),
			getWordFromClue(cluesData.clue_3)?.toUpperCase()
		].filter(Boolean);

		// Check each letter
		lettersArray.forEach(letter => {
			const upperLetter = letter.toUpperCase();
			// Check if letter appears in any clue word
			if (clueWords.some(word => word?.includes(upperLetter))) {
				inClues.add(upperLetter);
			}
		});

		return inClues;
	}, [cluesData]);

	const handleKeyPress = useCallback((key: string) => {
		console.log('🎹 handleKeyPress called with key:', key, 'awaitingLetterType:', awaitingLetterType);
		const upperKey = key.toUpperCase();
		const VOWELS = GameConfig.vowels;
		const isVowel = VOWELS.includes(upperKey);

		// If awaiting additional letter selection
		if (awaitingLetterType) {
			
			// Validate the letter type matches what we're waiting for
			if (awaitingLetterType === 'vowel' && !isVowel) {
				showMessage(
					GameConfig.messages.additionalLetterWrongType
						?.replace('{expected}', 'vowel (A, E, I, O, U)')
						.replace('{got}', 'consonant'),
					'error'
				);
				return;
			}
			if (awaitingLetterType === 'consonant' && isVowel) {
				showMessage(
					GameConfig.messages.additionalLetterWrongType
						?.replace('{expected}', 'consonant')
						?.replace('{got}', 'vowel'),
					'error'
				);
				return;
			}

			// Check if letter is already used in starting letters or other additional letters
			const allUsedLetters = [
				...selectedLetters.split(''),
				validatedAdditionalLetters.vowel?.letter,
				validatedAdditionalLetters.consonant?.letter
			].filter(Boolean).map(l => l?.toUpperCase());

			if (allUsedLetters.includes(upperKey)) {
				showMessage(GameConfig.messages.additionalLetterAlreadyUsed, 'error');
				return;
			}

			// Set as pending letter (not confirmed yet)
			setPendingLetter(prev => ({...prev, [awaitingLetterType]: upperKey}));
			showMessage(GameConfig.messages.confirmAdditionalLetter?.replace('{letter}', upperKey), 'info');
			return;
		}

		// Only handle starting letter selection if game hasn't started
		if (!gameStarted) {
			const currentLettersArray = selectedLetters.split('');
			
			// Block if a message is already showing FIRST (prevents rapid-fire messages)
			// BUT allow if we're awaiting additional letter (handled above)
			if (message !== '' && !awaitingLetterType) return;
			
			// Check if letter already selected
			if (currentLettersArray.includes(upperKey)) {
				showMessage(GameConfig.messages.letterAlreadySelected, 'error');
				return;
			}
			
			// Check if max letters reached
			if (currentLettersArray.length >= 4) {
				showMessage(GameConfig.messages.maxLettersReached, 'error');
				return;
			}

			const vowelCount = currentLettersArray.filter(letter => VOWELS.includes(letter)).length;
			const consonantCount = currentLettersArray.length - vowelCount;

			// Check vowel limit
			if (isVowel && vowelCount >= 1) {
				showMessage(GameConfig.messages.onlyOneVowel, 'error');
				return;
			}

			// Check consonant limit
			if (!isVowel && consonantCount >= 3) {
				showMessage(GameConfig.messages.onlyThreeConsonants, 'error');
				return;
			}

			// If valid, add the letter
			setSelectedLetters(prev => prev + upperKey);
			return;
		}

		// During gameplay (when game started and NOT awaiting additional letter),
		// ClueWords handles typing via its own keyboard listener
		// The function naturally ends here without doing anything
	}, [selectedLetters, showMessage, gameStarted, message, awaitingLetterType, validatedAdditionalLetters]);

	const handleBackspace = useCallback(() => {
		console.log('⌫ PlayMode handleBackspace:', { 
			gameStarted, 
			awaitingLetterType,
			hasPendingLetter: awaitingLetterType ? !!pendingLetter[awaitingLetterType] : false 
		});
		
		// If awaiting additional letter, handle deletion of that specific type
		if (awaitingLetterType) {
			if (awaitingLetterType === 'vowel') {
				if (pendingLetter.vowel) {
					console.log('🗑️ Clearing pending vowel letter');
					setPendingLetter(prev => {
						const updated = {...prev};
						delete updated.vowel;
						return updated;
					});
					showMessage(GameConfig.messages.selectAdditionalLetter?.replace('{type}', 'vowel'), 'info');
				} else if (validatedAdditionalLetters.vowel) {
					console.log('🗑️ Removing validated vowel letter');
					setValidatedAdditionalLetters(prev => {
						const updated = { ...prev };
						delete updated.vowel;
						return updated;
					});
					setAdditionalLetters(prev => {
						const updated = { ...prev };
						delete updated.vowel;
						return updated;
					});
					const remainingCorrect = validatedAdditionalLetters.consonant?.correct;
					setHasAnyCorrectAdditionalLetter(!!remainingCorrect);
					setAwaitingLetterType(null);
					setMessage('');
				} else {
					console.log('🚫 No pending vowel letter, canceling awaiting state');
					setAwaitingLetterType(null);
					setMessage('');
				}
			} else {
				// Handling consonant (singular)
				if (pendingLetter.consonant) {
					console.log('🗑️ Clearing pending consonant letter');
					setPendingLetter(prev => {
						const updated = {...prev};
						delete updated.consonant;
						return updated;
					});
					showMessage(GameConfig.messages.selectAdditionalLetter?.replace('{type}', 'consonant'), 'info');
				} else if (validatedAdditionalLetters.consonant) {
					console.log('🗑️ Removing validated consonant letter');
					setValidatedAdditionalLetters(prev => {
						const updated = { ...prev };
						delete updated.consonant;
						return updated;
					});
					setAdditionalLetters(prev => {
						const updated = { ...prev };
						delete updated.consonant;
						return updated;
					});
					const remainingCorrect = validatedAdditionalLetters.vowel?.correct;
					setHasAnyCorrectAdditionalLetter(!!remainingCorrect);
					setAwaitingLetterType(null);
					setMessage('');
				} else {
					console.log('🚫 No pending consonant letter, canceling awaiting state');
					setAwaitingLetterType(null);
					setMessage('');
				}
			}
			return;
		}

		// Only delete starting letters before game starts and if message is not showing
		if (!gameStarted && message === '') {
			setSelectedLetters(prev => prev.slice(0, -1));
		}

		// During gameplay, ClueWords will handle backspace via its own keyboard listener
	}, [gameStarted, message, awaitingLetterType, pendingLetter, showMessage, validatedAdditionalLetters]);

	const handleEnter = useCallback(() => {
		console.log('⏎ PlayMode handleEnter:', { 
			gameStarted, 
			awaitingLetterType,
			hasPendingVowel: !!pendingLetter.vowel,
			hasPendingConsonant: !!pendingLetter.consonant
		});
		
		// PRIORITY 1: If confirming additional letter, handle that FIRST
		if (awaitingLetterType && pendingLetter[awaitingLetterType]) {
			// Check if the letter is in ANY of the clue words
			const clueWords = [
				getWordFromClue(cluesData.clue_1)?.toUpperCase(),
				getWordFromClue(cluesData.clue_2)?.toUpperCase(),
				getWordFromClue(cluesData.clue_3)?.toUpperCase()
			].filter(Boolean);

			const letterToValidate = pendingLetter[awaitingLetterType];
			const isCorrect = clueWords.some(word => word?.includes(letterToValidate));
			
			if (awaitingLetterType === 'vowel') {
				// Update validated vowel
				const updatedValidatedLetters = {
					...validatedAdditionalLetters,
					vowel: { letter: letterToValidate!, correct: isCorrect }
				};
				setValidatedAdditionalLetters(updatedValidatedLetters);
				
				setAdditionalLetters(prev => ({
					...prev,
					vowel: letterToValidate
				}));

				const hasCorrect = isCorrect || validatedAdditionalLetters.consonant?.correct;
				setHasAnyCorrectAdditionalLetter(!!hasCorrect);
				console.log('✅ Has any correct additional letter:', hasCorrect);

				if (!isCorrect) {
					handleLifeLost();	
				}

				setPendingLetter(prev => {
					const updated = {...prev};
					delete updated.vowel;
					return updated;
				});
				setAwaitingLetterType(null);
				setMessage('');
			} else {
				// Update validated consonant (singular)
				const updatedValidatedLetters = {
					...validatedAdditionalLetters,
					consonant: { letter: letterToValidate!, correct: isCorrect }
				};
				setValidatedAdditionalLetters(updatedValidatedLetters);
				
				setAdditionalLetters(prev => ({
					...prev,
					consonant: letterToValidate
				}));

				const hasCorrect = validatedAdditionalLetters.vowel?.correct || isCorrect;
				setHasAnyCorrectAdditionalLetter(!!hasCorrect);
				console.log('✅ Has any correct additional letter:', hasCorrect);

				if (!isCorrect) {
					handleLifeLost();	
				}

				setPendingLetter(prev => {
					const updated = {...prev};
					delete updated.consonant;
					return updated;
				});
				setAwaitingLetterType(null);
				setMessage('');
			}
			return;
		}

		// If awaiting letter type but no pending letter, cancel the awaiting state
		if (awaitingLetterType && !pendingLetter[awaitingLetterType]) {
			console.log('🚫 Awaiting letter type but no pending letter, canceling');
			setAwaitingLetterType(null);
			setMessage('');
			return;
		}

		// PRIORITY 2: Start the game when Enter is pressed (only if 4 letters selected)
		if (!gameStarted && selectedLetters.length === 4) {
			// Block if message is showing
			if (message !== '') return;
			
			setGameStarted(true);
			// Check which letters are in clues
			const inClues = checkLettersInClues(selectedLetters);
			setLettersInClues(inClues);
		} else if (!gameStarted && selectedLetters.length < 4) {
			// Always show the message, even if another message is active
			showMessage(GameConfig.messages.noSelectedLetters, 'info');
		}

		// During gameplay, ClueWords will handle Enter via its own keyboard listener
	}, [gameStarted, selectedLetters, showMessage, checkLettersInClues, message, awaitingLetterType, pendingLetter, handleLifeLost, cluesData, validatedAdditionalLetters, additionalLetters]);

	// Handle Play Again button
	const handlePlayAgain = useCallback(() => {
		console.log('🔄 Play Again clicked. Current round:', currentRound, 'Has won:', hasWon);
		
		// Only advance to next round if player won, otherwise restart same round
		let nextRoundData: DailyWordRound;
		let nextRoundNumber: number;
		let nextRoundIndex: number;
		
		if (hasWon) {
			// Player won - advance to next round
			nextRoundData = advanceToNextRound(); // This increments currentRoundIndex internally
			nextRoundNumber = currentRound + 1;
			nextRoundIndex = nextRoundNumber - 1; // 0-based index
			console.log('🎉 Advancing to round:', nextRoundNumber, 'index:', nextRoundIndex);
		} else {
			// Player lost - restart same round
			nextRoundIndex = currentRound - 1; // Convert to 0-based index
			setCurrentRoundIndex(nextRoundIndex); // Sync the module
			nextRoundData = getRoundByIndex(nextRoundIndex); // Get same round data
			nextRoundNumber = currentRound; // Keep same round number
			console.log('💔 Restarting round:', nextRoundNumber, 'index:', nextRoundIndex);
		}
		
		// Clear localStorage when starting/restarting a round
		clearGameState();
		
		// Reset all game state
		setLives(GameConfig.maxLives);
		setSelectedLetters('');
		setAdditionalLetters({});
		setValidatedAdditionalLetters({});
		setHasAnyCorrectAdditionalLetter(false);
		setAwaitingLetterType(null);
		setPendingLetter({});
		setMessage('');
		setGameStarted(false);
		setLettersInClues(new Set());
		setIsGameOver(false);
		setHasWon(false);
		setWordInputs(new Map());
		setVerifiedInputs(new Map());

		setCluesData(nextRoundData);
		setCurrentRound(nextRoundNumber);

	}, [clearGameState, hasWon, currentRound]);

	// Extract word types for hints
	const wordTypes = useMemo(() => {
	if (!cluesData) return [];
	return [
		getTypeFromClue(cluesData.clue_1),
		getTypeFromClue(cluesData.clue_2),
		getTypeFromClue(cluesData.clue_3)
	].filter(Boolean) as string[];
	}, [cluesData]);

	return (
		<div className="fixed inset-0 bg-white dark:bg-black overflow-hidden">
			{/* Message Box */}
			<div className="z-[9999]">
				<MessageBox 
					message={message} 
					type={messageType}
					onClose={handleMessageClose}
				/>
			</div>

			{/* Game Over Screens */}
			{isGameOver && (
				<>
					{hasWon ? (
						<WinScreen 
							onPlayAgain={handlePlayAgain}
						/>
					) : (
						<LoseScreen 
							onPlayAgain={handlePlayAgain}
						/>
					)}
				</>
			)}
			
			{/* VIEWPORT-ADAPTIVE LAYOUT - Uses vh units and percentages */}
			{/* Add scrollbar ONLY for very small screens via CSS */}
			<div className="fixed inset-0 flex flex-col h-screen" style={{ height: '100dvh' }}>
				<style jsx>{`
					@media (max-height: 500px) {
						.fixed.inset-0.flex.flex-col {
							overflow-y: auto;
						}
					}
				`}</style>
				
				{/* Top Section - Starting Letters, Additional Letters & Lives */}
				<div className="relative px-4 md:px-0 mt-16 sm:mt-28 md:mt-32 pt-2 sm:pt-6" style={{ minHeight: '120px' }}>
					{/* Wrapper to align with keyboard width on tablet+ */}
					<div className="w-full md:max-w-[680px] md:mx-auto flex justify-between items-start">
						{/* Left side - Starting Letters + Additional Letters stacked */}
						<div className="flex flex-col gap-2 sm:gap-4">
							<div className={`transition-all duration-700 ${
								isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
							}`}>
								<StartingLetters  
									letters={selectedLetters} 
									onLettersChange={setSelectedLetters}
									onShowMessage={showMessage}
									gameStarted={gameStarted}
									lettersInClues={lettersInClues}
									onRevealComplete={() => setStartRevealingClues(true)}
								/>
							</div>
							
							{/* Additional Letters directly underneath */}
							<div className={`transition-all duration-700 mt-2 sm:mt-0 ${
								isTransitioned ? "opacity-100" : "opacity-0"
							}`}>
								<AdditionalLetters
									gameStarted={gameStarted}
									additionalLetters={additionalLetters}
									validatedLetters={validatedAdditionalLetters}
									onRequestAdditionalLetter={handleRequestAdditionalLetter}
									awaitingLetterType={awaitingLetterType}
									pendingLetter={pendingLetter}
									lettersInClues={lettersInClues}
									onCancelSelection={() => {
										console.log('🚫 Canceling selection via click-away');
										setAwaitingLetterType(null);
										setMessage('');
									}}
								/>
							</div>
						</div>
						
						{/* Noun Verb Adjective Placement */}
						<div className={`transition-all duration-700 ${
							isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
						} text-3xl sm:text-3xl md:text-3xl flex items-center gap-3`}>
							<div className={GameConfig.wordColors.noun}> n </div>
							<div className={GameConfig.wordColors.verb}> v </div>
							<div className={GameConfig.wordColors.adjective}> a </div>
						</div>
					</div>
				</div>

				{/* Middle Section - Game Area */}
				<div className="relative flex-1 px-4 md:px-0">
					{/* Wrapper to align with keyboard width on tablet+ */}
					<div className="h-full w-full md:max-w-[680px] md:mx-auto flex items-center justify-between">
						
						{/* Left side - Clue Dashes */}
						<div className={`transition-all duration-700 ${
							isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
						}`}>
							{!gameStarted ? (
								// Before game starts, show placeholder dashes
								<div className="flex flex-col justify-center space-y-6 sm:space-y-8 md:space-y-10">
									{numbersForClue.map((_, index) => (
										<div key={index} className="text-black dark:text-white text-3xl md:text-5xl font-bold">
											_
										</div>
									))}
								</div>						
							) : (
								// After Enter is pressed, show ClueWords component
								<ClueWords 
									clues={cluesData}
									selectedStartingLetters={selectedLetters}
									additionalLetters={additionalLetters}
									onLifeLost={handleLifeLost}
									onWin={handleWin}
									onShowMessage={showMessage}
									isMessageActive={message !== ''}
									awaitingAdditionalLetter={awaitingLetterType !== null}
									onWordInputsChange={setWordInputs}
									onVerifiedPositionsChange={setVerifiedInputs}
									bothAdditionalLettersConfirmed={hasAnyCorrectAdditionalLetter}
								/>
							)}
						</div>

						{/* Right side - Hints */}
						<div className={`transition-all duration-700 ${
							isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
						}`}>
							<HintToggle 
								hintsEnabled={hintsEnabled}
								onToggle={setHintsEnabled}
								numbers={numbersForClue}
								wordTypes={wordTypes}
							/>
						</div>
					</div>
				</div>

				{/* Bottom Section */}
				{/* Lives */}
				<div 
					className={`w-full flex justify-center mt-8 mb-6 transition-all duration-700 ${
						isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
					}`}>
					<LifeBar lives={lives} maxLives={GameConfig.maxLives} />
				</div>
				
				{/* Keyboard */}
				<div 
					className={`relative flex items-end justify-center transition-all duration-700 ${
						isTransitioned ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
					}`}
					style={{ 
						height: 'clamp(145px, 28vh, 210px)',
						paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))'
					}}
				>
					<Keyboard 
						onKeyPress={handleKeyPress}
						onBackspace={handleBackspace}
						onEnter={handleEnter}
						disabled={message !== '' && !awaitingLetterType}
						gameStarted={gameStarted}
						letterStatus={letterStatus}
						awaitingLetterType={awaitingLetterType}
					/>
				</div>
			</div>
		</div>
	);
}