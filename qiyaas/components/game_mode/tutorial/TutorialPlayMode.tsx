// components/game_mode/tutorial/TutorialPlayMode.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import HintToggle from "@/components/game_assets/number_clues/HintToggle";
import { getNumbersForClue, getCluesData } from '@/components/game_assets/word_clues/ExtractAnswer';
import Keyboard from "@/components/game_assets/keyboard/Keyboard";
import LifeBar from "@/components/game_assets/lives/LifeBar";
import StartingLetters from "@/components/game_assets/word_clues/StartingLetters";
import AdditionalLetters from "@/components/game_assets/word_clues/AdditionalLetters";
import ClueWords from "@/components/game_assets/word_clues/ClueWords";
import MessageBox from "@/components/game_assets/messages/MessageBox";
import { WinScreen, LoseScreen } from '@/components/game_assets/game_over/GameOverScreen_Tutorial';
import { GameConfig } from "@/lib/gameConfig";
import { usePreventRefresh, useAllowKeyboardShortcuts } from "@/hooks/keyboard/usePreventRefresh";
import { useKeyboardLetterStatus } from "@/hooks/keyboard/KeyboardLetterTracker";

export default function TutorialPlayMode() {
	
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
	
	const { numbersForClue } = getNumbersForClue();
	const cluesData = getCluesData();

	// Track keyboard letter status based on VERIFIED inputs only
	const letterStatus = useKeyboardLetterStatus({
		selectedStartingLetters: selectedLetters,
		additionalLetters,
		cluesData,
		wordInputs: verifiedInputs, // Use verified inputs, not all typed inputs
		gameStarted
	});

	// RevealLetters animation
	const [startRevealingClues, setStartRevealingClues] = useState(false);
	
	const handleLifeLost = useCallback(() => {
		setLives(prev => Math.max(0, prev - 1));
	}, []);

	// Handle win condition - called by ClueWords component
	const handleWin = useCallback(() => {
		setTimeout(() => {
			setIsGameOver(true);
			setHasWon(true);
		}, GameConfig.gameOverScreenDelay);
	}, []);

	// Prevent accidental refresh with confirmation dialog
	usePreventRefresh();
	
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
			}, GameConfig.gameOverScreenDelay);
		}
	}, [lives, isGameOver]);

	const showMessage = useCallback((msg: string, type: 'error' | 'success' | 'info' = 'error') => {
		setMessage(msg);
		setMessageType(type);
	}, []);

	const handleMessageClose = useCallback(() => {
		setMessage('');
	}, []);

	// Function to cancel additional letter selection
	const cancelAdditionalLetterSelection = useCallback(() => {
		console.log('🚫 Canceling additional letter selection');
		setAwaitingLetterType(null);
		setPendingLetter({});
		setMessage('');
	}, []);

	// Handle request for additional letter
	const handleRequestAdditionalLetter = useCallback((type: 'vowel' | 'consonant') => {
		// Check if already selected and confirmed
		const validatedLetter = validatedAdditionalLetters[type];
		if (validatedLetter) {
			// Don't show error - just set awaiting state so they can change it if they want
			setAwaitingLetterType(type);
			// Keep the validated letter visible as pending so user can see it
			setPendingLetter(prev => ({
				...prev,
				[type]: validatedLetter.letter
			}));
			showMessage(`Press Backspace to remove ${validatedLetter.letter}, or select a new letter`, 'info');
			return;
		}

		// If clicking the same button that's already awaiting, cancel it
		if (awaitingLetterType === type) {
			setAwaitingLetterType(null);
			// Clear only this type's pending letter
			setPendingLetter(prev => {
				const updated = {...prev};
				delete updated[type];
				return updated;
			});
			setMessage('');
			return;
		}

		// Set awaiting state FIRST, then show message
		// This ensures the keyboard knows to accept input before the message blocks anything
		setAwaitingLetterType(type);
		console.log('✅ Set awaitingLetterType to:', type);
		
		// Clear pending letter for this type if it doesn't exist
		if (!pendingLetter[type]) {
			setPendingLetter(prev => {
				const updated = {...prev};
				delete updated[type];
				return updated;
			});
		}
		
		// Use setTimeout to ensure state update is processed before message
		setTimeout(() => {
			showMessage(GameConfig.messages.selectAdditionalLetter?.replace('{type}', type), 'info');
		}, 0);
	}, [validatedAdditionalLetters, showMessage, awaitingLetterType, pendingLetter]);

	// Check which letters (including additional) appear in any clue word
	const checkLettersInClues = useCallback((letters: string) => {
		const lettersArray = letters.split('');
		const inClues = new Set<string>();
		
		// Get all clue words
		const clueWords = [
			cluesData.clue_1?.toUpperCase(),
			cluesData.clue_2?.toUpperCase(),
			cluesData.clue_3?.toUpperCase()
		].filter(Boolean);

		// Check each letter
		lettersArray.forEach(letter => {
			const upperLetter = letter.toUpperCase();
			// Check if letter appears in any clue word
			if (clueWords.some(word => word.includes(upperLetter))) {
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

			// Check if letter is already used in starting letters or other additional letter
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
		console.log('⌫ TutorialPlayMode handleBackspace:', { 
			gameStarted, 
			awaitingLetterType, 
			hasPendingLetter: awaitingLetterType ? !!pendingLetter[awaitingLetterType] : false 
		});
		
		// If awaiting additional letter, handle deletion of that specific type
		if (awaitingLetterType) {
			if (pendingLetter[awaitingLetterType]) {
				// Clear only the pending letter for this specific type
				console.log(`🗑️ Clearing pending ${awaitingLetterType} letter`);
				setPendingLetter(prev => {
					const updated = {...prev};
					delete updated[awaitingLetterType];
					return updated;
				});
				showMessage(GameConfig.messages.selectAdditionalLetter?.replace('{type}', awaitingLetterType), 'info');
			} else if (validatedAdditionalLetters[awaitingLetterType]) {
				// If there's a validated letter for this type, remove it
				console.log(`🗑️ Removing validated ${awaitingLetterType} letter`);
				setValidatedAdditionalLetters(prev => {
					const updated = { ...prev };
					delete updated[awaitingLetterType];
					return updated;
				});
				setAdditionalLetters(prev => {
					const updated = { ...prev };
					delete updated[awaitingLetterType];
					return updated;
				});
				// Check if we still have at least one correct additional letter
				const remainingCorrect = Object.values({
					...validatedAdditionalLetters,
					[awaitingLetterType]: undefined
				}).some(val => val?.correct);
				setHasAnyCorrectAdditionalLetter(remainingCorrect);
				// Cancel the awaiting state
				setAwaitingLetterType(null);
				setMessage('');
			} else {
				// No pending or validated letter for this type, just cancel awaiting state
				console.log('🚫 No pending letter, canceling awaiting state');
				setAwaitingLetterType(null);
				setMessage('');
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
		console.log('⏎ TutorialPlayMode handleEnter:', { 
			gameStarted, 
			awaitingLetterType, 
			hasPendingVowel: !!pendingLetter.vowel,
			hasPendingConsonant: !!pendingLetter.consonant
		});
		
		// PRIORITY 1: If confirming additional letter, handle that FIRST
		if (awaitingLetterType && pendingLetter[awaitingLetterType]) {
			// Check if the letter is in ANY of the clue words
			const clueWords = [
				cluesData.clue_1?.toUpperCase(),
				cluesData.clue_2?.toUpperCase(),
				cluesData.clue_3?.toUpperCase()
			].filter(Boolean);

			const letterToValidate = pendingLetter[awaitingLetterType];
			const isCorrect = clueWords.some(word => word?.includes(letterToValidate));
			
			// Update the validated letter for this specific type
			const updatedValidatedLetters = {
				...validatedAdditionalLetters,
				[awaitingLetterType]: { letter: letterToValidate, correct: isCorrect }
			};
			setValidatedAdditionalLetters(updatedValidatedLetters);
			
			setAdditionalLetters(prev => ({
				...prev,
				[awaitingLetterType]: letterToValidate
			}));

			// Check if we now have at least one correct additional letter
			const hasCorrect = Object.values(updatedValidatedLetters).some(val => val?.correct);
			setHasAnyCorrectAdditionalLetter(hasCorrect);
			console.log('✅ Has any correct additional letter:', hasCorrect);

			// Show appropriate message and lose life if incorrect
			if (!isCorrect) {
				handleLifeLost();	
			}

			// Clear ONLY the current awaiting type and its pending letter
			setPendingLetter(prev => {
				const updated = {...prev};
				delete updated[awaitingLetterType];
				return updated;
			});
			setAwaitingLetterType(null);
			setMessage('');
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
	}, [gameStarted, selectedLetters, showMessage, checkLettersInClues, message, awaitingLetterType, pendingLetter, handleLifeLost, cluesData, validatedAdditionalLetters]);

	// Handle Play Again button
	const handlePlayAgain = useCallback(() => {
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
	}, []);

	// Handle Go to Main Game button
	const handleGoToMainGame = useCallback(() => {
		// Navigate to main game - adjust this path to your routing structure
		window.location.href = '/play';
	}, []);

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
							onGoToMainGame={handleGoToMainGame}
						/>
					) : (
						<LoseScreen 
							onRetryTutorial={handlePlayAgain}
							onGoToMainGame={handleGoToMainGame}
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
							{/* Update the StartingLetters component */}
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
						
						{/* Lives */}
						<div className={`transition-all duration-700 ${
							isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
						}`}>
							<LifeBar lives={lives} maxLives={GameConfig.maxLives} />
						</div>
					</div>
				</div>

				{/* Middle Section - Game Area */}
				<div className="relative flex-1 px-4 md:px-0">
					{/* Wrapper to align with keyboard width on tablet+ */}
					<div className="h-full w-full md:max-w-[680px] md:mx-auto flex items-center justify-between">
						
						{/* Left side - Clue dashes OR ClueWords component */}
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
										hintsEnabled={true}
										getNumbers={getNumbersForClue}  />
						</div>
					</div>
				</div>

				{/* Bottom Section - Keyboard */}
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