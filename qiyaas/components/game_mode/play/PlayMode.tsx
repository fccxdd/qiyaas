// components/game_mode/play/PlayMode.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import HintToggle from "@/components/game_assets/number_clues/HintToggle";
import Keyboard from "@/components/game_assets/keyboard/Keyboard";
import LifeBar from "@/components/game_assets/lives/LifeBar";
import StartingLetters from "@/components/game_assets/word_clues/StartingLetters";
import ClueGameManager from "@/components/game_assets/word_clues/ClueGameManager";
import MessageBox from "@/components/game_assets/messages/MessageBox";
import { WinScreen, LoseScreen } from '@/components/game_assets/game_over/GameOverScreen_GamePlay';
import { GameConfig } from "@/lib/gameConfig";
import { useAllowKeyboardShortcuts } from "@/hooks/keyboard/usePreventRefresh";
import { useKeyboardLetterStatus } from "@/hooks/keyboard/KeyboardLetterTracker";
import { UseRevealLetter } from '@/hooks/clues/useRevealLetter';
import RevealUnsolvedWords from '@/components/game_assets/word_clues/RevealUnsolvedWords';
import { usePuzzleData, DailyWordPuzzle } from '@/components/game_assets/word_clues/ExtractAnswer';
import { useGameState } from '@/hooks/clues/game_state/UseGameState';
import { useKeyboardHandlers } from '@/hooks/keyboard/UseKeyboardHandlers';
import GameViewportLayout, { TopSection, MiddleSection, BottomSection } from '@/components/ux/GameViewPortLayout';
import React from 'react';
import GameHeader from "@/components/layouts/GameHeader";
import GoHome from "@/components/game_assets/game_walkthrough/GoHome";
import ReadHowToPlay from "@/components/game_assets/game_walkthrough/ReadHowToPlay";

interface PlayModeProps {
	puzzleData?: DailyWordPuzzle;
	onComplete?: () => void;
	tutorialOverlay?: React.ReactNode;
}

export default function PlayMode({ puzzleData: puzzleDataProp, onComplete, tutorialOverlay }: PlayModeProps) {
	const [isTransitioned, setIsTransitioned] = useState(false);
	const [showGameOverScreen, setShowGameOverScreen] = useState(false);

	const hasShownModalForCurrentGameOver = useRef(false);
	const hintsRevealedRef = useRef(false);
	const wordRevealCompleteRef = useRef(false);
	const hasSeededWordInputsRef = useRef(false);

	const { puzzle: puzzleFromApi } = usePuzzleData();
	const puzzle = puzzleDataProp ?? puzzleFromApi;

	const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

	const {
		lives,
		selectedLetters,
		hasLostLifeForNoStartingLetters,
		message,
		messageType,
		messagePersist,
		gameStarted,
		lettersInClues,
		isGameOver,
		hasWon,
		hintsEnabled,
		cluesData,
		numbersForClue,
		clueWordsArray,
		cursorPosition,
		hasRevealedOnLoss,
		revealedStartingColors,
		hasStartingLettersAnimationCompleted,
		hasLoadedFromStorage,

		wordInputs,
		verified,
		completed,
		sequenceRevealed,
		silentRevealed,
		solvedClues,
		submittedGuesses,

		setSelectedLetters,
		setGameStarted,
		setLettersInClues,
		setWordInputs,
		setVerified,
		setCompleted,
		setSequenceRevealed,
		setSilentRevealed,
		setCursorPosition,
		setHasLostLifeForNoStartingLetters,
		setRevealedStartingColors,
		setHasStartingLettersAnimationCompleted,
		setSolvedClues,
		setSubmittedGuesses,

		handleLifeLost,
		handleWin: handleWinInternal,
		showMessage,
		handleMessageClose,
		checkLettersInClues,
		setHasRevealedOnLoss,
		hintsRevealComplete,
		setHintsRevealComplete,
	} = useGameState();

	// ── Tutorial mode overrides ───────────────────────────────────────────────

	const handleWin = useCallback(() => {
		if (onComplete) onComplete();
		else handleWinInternal();
	}, [onComplete, handleWinInternal]);

	const openModal = useCallback(() => {
		if (onComplete) onComplete();
		else setShowGameOverScreen(true);
	}, [onComplete]);

	// ── Game over handling ────────────────────────────────────────────────────

	const handleRevealComplete = useCallback(() => {
		setHasRevealedOnLoss(true);
		wordRevealCompleteRef.current = true;
		if (hintsRevealedRef.current || hasRevealedOnLoss) openModal();
	}, [setHasRevealedOnLoss, hasRevealedOnLoss, openModal]);

	const handleHintsRevealed = useCallback(() => {
		setHintsRevealComplete(true);
		hintsRevealedRef.current = true;
		if (wordRevealCompleteRef.current) openModal();
	}, [openModal, setHintsRevealComplete]);

	useEffect(() => {
		if (!isGameOver || hasShownModalForCurrentGameOver.current) return;
		if (hintsRevealComplete) return;
		hasShownModalForCurrentGameOver.current = true;

		const gameOverMessage = hasWon
			? GameConfig.messages.gameWinMessage
			: GameConfig.messages.gameLossMessage;
		const type = hasWon ? 'success' : 'error';

		if (!hasRevealedOnLoss) {
			setTimeout(() => showMessage(gameOverMessage, type), GameConfig.duration.gameOverMessageDelay);
		}

		if (hasWon) {
			setTimeout(() => openModal(), GameConfig.duration.hintRevealComplete);
		} else if (hasRevealedOnLoss) {
			openModal();
		}
	}, [isGameOver, hasWon, hasRevealedOnLoss, hintsRevealComplete, showMessage, openModal]);

	useEffect(() => {
		if (isGameOver) return;
		hasShownModalForCurrentGameOver.current = false;
		hintsRevealedRef.current = false;
		wordRevealCompleteRef.current = false;
		setShowGameOverScreen(false);
		setSilentRevealed([false, false, false]);
		setHintsRevealComplete(false);
	}, [isGameOver, setSilentRevealed, setHintsRevealComplete]);

	// ── Open modal immediately on refresh if already completed ───────────────

  useEffect(() => {
      if (!hasLoadedFromStorage) return;
      if (!isGameOver) return;
      if (hasWon && !hintsRevealComplete) return;     // win: wait for hints
      if (!hasWon && !hasRevealedOnLoss) return;      // loss: wait for reveal
      openModal();
  }, [hasLoadedFromStorage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Starting letters animation ────────────────────────────────────────────

	const handleStartingLettersSubmit = useCallback(() => {
		if (hasStartingLettersAnimationCompleted || revealedStartingColors.length === selectedLetters.length) return;

		setRevealedStartingColors([]);
		selectedLetters.split('').forEach((_, index) => {
			setTimeout(() => {
				setRevealedStartingColors(prev => [...prev, index]);
			}, index * GameConfig.duration.startingLetterBounceDelay);
		});

		const totalAnimationTime = selectedLetters.length * GameConfig.duration.startingLetterBounceDelay + 500;
		setTimeout(() => setHasStartingLettersAnimationCompleted(true), totalAnimationTime);
	}, [
		selectedLetters,
		hasStartingLettersAnimationCompleted,
		revealedStartingColors.length,
		setRevealedStartingColors,
		setHasStartingLettersAnimationCompleted,
	]);

	useEffect(() => {
		if (!hasLoadedFromStorage) return;
		if (!gameStarted) return;
		if (hasStartingLettersAnimationCompleted) return;

		setRevealedStartingColors([]);
		selectedLetters.split('').forEach((_, index) => {
			setTimeout(() => {
				setRevealedStartingColors(prev => [...prev, index]);
			}, index * GameConfig.duration.startingLetterBounceDelay);
		});

		const totalAnimationTime = selectedLetters.length * GameConfig.duration.startingLetterBounceDelay + 500;
		setTimeout(() => setHasStartingLettersAnimationCompleted(true), totalAnimationTime);
	}, [hasLoadedFromStorage]); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Keyboard handlers (pre-game: letter selection + submit) ──────────────

	const { handleKeyPress, handleBackspace, handleEnter } = useKeyboardHandlers({
		selectedLetters,
		gameStarted,
		message,
		setSelectedLetters,
		setGameStarted,
		setLettersInClues,
		onStartingLettersSubmit: handleStartingLettersSubmit,
		showMessage,
		handleLifeLost,
		checkLettersInClues,
	});

	// ── Letter status for keyboard colors ────────────────────────────────────

	const letterStatus = useKeyboardLetterStatus({
		selectedStartingLetters: selectedLetters,
		cluesData,
		submittedGuesses,
		completed,
		verified,
		gameStarted,
	});

	// ── Submitted guess handler ───────────────────────────────────────────────

	const handleGuessSubmitted = useCallback((clueIndex: number, word: string) => {
		setSubmittedGuesses(prev => {
			const next = [...prev];
			next[clueIndex] = [...next[clueIndex], word];
			return next;
		});
	}, [setSubmittedGuesses]);

	// ── Reveal animation ──────────────────────────────────────────────────────

	const {
		dashesRevealed,
		dashesAnimating,
		lettersRevealed,
		isComplete: revealComplete,
		lettersComplete,
	} = UseRevealLetter({
		startingLetters: selectedLetters,
		clueWords: clueWordsArray,
		triggered: gameStarted,
		initialRevealedLetters: sequenceRevealed,
		isAlreadyComplete: hasStartingLettersAnimationCompleted,
	});

	useEffect(() => {
		if (!gameStarted) return;
		if (hasSeededWordInputsRef.current) return;
		if (!lettersComplete) return;

		const hasLetters = lettersRevealed.some(arr => arr.some(l => l !== null));
		if (!hasLetters) return;

		hasSeededWordInputsRef.current = true;
		setSequenceRevealed(lettersRevealed);
		setWordInputs(prev => prev.map((row, i) =>
			row.map((letter, pos) => letter ?? lettersRevealed[i]?.[pos] ?? null)
		));

		setVerified(prev => prev.map((row, i) =>
			row.map((v, pos) => v || lettersRevealed[i]?.[pos] !== null)
		));

		// Set cursor to first empty position after reveal
		const startingSet = new Set(selectedLetters.toUpperCase().split(''));
		for (let clueIndex = 0; clueIndex < clueWordsArray.length; clueIndex++) {
			const word = clueWordsArray[clueIndex];
			for (let pos = 0; pos < word.length; pos++) {
				if (!startingSet.has(word[pos].toUpperCase())) {
					setCursorPosition({ clueIndex, position: pos });
					return;
				}
			}
		}
	}, [gameStarted, lettersComplete, lettersRevealed]);

	const revealAnimation = gameStarted ? {
		dashesRevealed,
		dashesAnimating,
		lettersRevealed,
	} : undefined;

	// ── Clue solved ───────────────────────────────────────────────────────────

	const handleClueSolved = useCallback((clueIndex: number) => {
		setSolvedClues(prev => {
			const next = [...prev];
			next[clueIndex] = true;
			return next;
		});
	}, [setSolvedClues]);

	useAllowKeyboardShortcuts();

	useEffect(() => {
		const t = setTimeout(() => setIsTransitioned(true), 50);
		return () => clearTimeout(t);
	}, []);

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="fixed inset-0 bg-white dark:bg-black overflow-hidden">
			
			<GameHeader
			leftContent={
				<div className="flex items-center gap-3 sm:gap-4">
				<GoHome />
				</div>
			}
			rightContent={
				<div className="flex items-center gap-5 sm:gap-6">
				<ReadHowToPlay variant="play" 
								gameStarted={gameStarted} 
								hasLoadedFromStorage={hasLoadedFromStorage}
								onModalClose={() => setIsHowToPlayOpen(false)}
  								onModalOpen={() => setIsHowToPlayOpen(true)} 
				/>
				</div>
			}
			/>

			<div className="z-[9999]">
				<MessageBox
					message={isHowToPlayOpen ? '' : message}
					type={messageType}
					onClose={handleMessageClose}
					persist={messagePersist}
				/>
			</div>

			{showGameOverScreen && !onComplete && (
				hasWon
					? <WinScreen onClose={() => setShowGameOverScreen(false)} />
					: <LoseScreen onClose={() => setShowGameOverScreen(false)} />
			)}

			<RevealUnsolvedWords
				isGameOver={isGameOver}
				hasWon={hasWon}
				completed={completed}
				clueWordsArray={clueWordsArray}
				wordInputs={wordInputs}
				onWordInputsSync={setWordInputs}
				sequenceRevealed={sequenceRevealed}
				verified={verified}
				onVerifiedSync={setVerified}
				onSilentRevealSync={setSilentRevealed}
				onCompletedChange={setCompleted}
				onRevealComplete={handleRevealComplete}
				hasRevealedOnLoss={hasRevealedOnLoss}
				onClueSolved={handleClueSolved}
			/>

			<GameViewportLayout isTransitioned={isTransitioned}>

				<TopSection isTransitioned={isTransitioned}>
					<div className="w-full flex justify-between items-start">
						<div className={`transition-all duration-700 ${
							isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
						}`}>
							<StartingLetters
								letters={selectedLetters}
								onLettersChange={setSelectedLetters}
								onShowMessage={showMessage}
								gameStarted={gameStarted}
								lettersInClues={lettersInClues}
								revealedColors={revealedStartingColors}
							/>
						</div>
					

					<div className={`transition-all duration-700 ${
						isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
					} text-2xl sm:text-4xl md:text-4xl flex items-center gap-3`}>
						<div className={GameConfig.wordColors.noun}> n </div>
						<div className={GameConfig.wordColors.verb}> v </div>
						<div className={GameConfig.wordColors.adjective}> a </div>
					</div>

					</div>
					{/* Spacer to match TutorialBox height in Game1/Game2 */}
					<div className="h-[72px] sm:h-[80px]" />
				</TopSection>

				<MiddleSection isTransitioned={isTransitioned}>
					<div className={`transition-all duration-700 ${
						isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
					}`}>
						{!gameStarted ? (
							<div className="flex flex-col justify-center space-y-6 sm:space-y-8 md:space-y-10">
								{numbersForClue.map((_, index) => (
									<div key={index} className={`${GameConfig.wordColors.default} dash-text font-bold`}>
										{/* Placeholder Dash */}
										_
									</div>
								))}
							</div>
						) : (
							<ClueGameManager
								clues={cluesData}
								selectedStartingLetters={selectedLetters}
								wordInputs={wordInputs}
								verified={verified}
								completed={completed}
								cursorPosition={cursorPosition}
								onWordInputsChange={setWordInputs}
								onVerifiedChange={setVerified}
								onCompletedChange={setCompleted}
								onCursorChange={setCursorPosition}
								onLifeLost={handleLifeLost}
								onWin={handleWin}
								onShowMessage={showMessage}
								isMessageActive={message !== ''
												}
								isGameOver={isGameOver}
								revealAnimation={revealAnimation}
								onClueSolved={handleClueSolved}
								letterStatus={letterStatus}
								hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
								setHasLostLifeForNoStartingLetters={setHasLostLifeForNoStartingLetters}
								onGuessSubmitted={handleGuessSubmitted}
								silentRevealed={silentRevealed}
								sequenceRevealed={sequenceRevealed}
							/>
						)}
					</div>

					<div className={`transition-all duration-700 ${
						isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
					}`}>
						<HintToggle
							hasWon={hasWon}
							hintsEnabled={hintsEnabled}
							solvedClues={solvedClues}
							isGameOver={isGameOver}
							hintsRevealComplete={hintsRevealComplete}
							onHintsRevealed={handleHintsRevealed}
							numbersForClue={puzzle?.numbers_for_clue ?? numbersForClue}
							wordTypes={[puzzle?.clue_1?.type, puzzle?.clue_2?.type, puzzle?.clue_3?.type]}
							ruleTypes={[puzzle?.clue_1?.rule, puzzle?.clue_2?.rule, puzzle?.clue_3?.rule]}
							puzzleDate={puzzle?.date}
						/>
					</div>
				</MiddleSection>

				<BottomSection
					isTransitioned={isTransitioned}
					livesComponent={<LifeBar lives={lives} maxLives={GameConfig.maxLives} />}
					keyboardComponent={
						<>
							{tutorialOverlay}
							<Keyboard
								onKeyPress={handleKeyPress}
								onBackspace={handleBackspace}
								onEnter={handleEnter}
								disabled={
									!isGameOver &&
									message !== '' &&
									message !== GameConfig.messages.startingLettersMessage &&
									message !== GameConfig.messages.confirmStartingLetters
								}
								gameStarted={gameStarted}
								letterStatus={letterStatus}
								hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
								isGameOver={isGameOver}
								isRevealing={gameStarted && !lettersComplete}
							/>
						</>
					}
				/>

			</GameViewportLayout>
		</div>
	);
}