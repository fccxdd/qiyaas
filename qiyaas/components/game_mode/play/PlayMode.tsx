// components/game_mode/play/PlayMode.tsx

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import HintToggle from "@/components/game_assets/number_clues/HintToggle";
import Keyboard from "@/components/game_assets/keyboard/Keyboard";
import LifeBar from "@/components/game_assets/lives/LifeBar";
import StartingLetters from "@/components/game_assets/word_clues/StartingLetters";
import AdditionalLetters from "@/components/game_assets/word_clues/AdditionalLetters";
import ClueGameManager from "@/components/game_assets/word_clues/ClueGameManager";
import MessageBox from "@/components/game_assets/messages/MessageBox";
import { WinScreen, LoseScreen } from '@/components/game_assets/game_over/GameOverScreen_GamePlay';
import { GameConfig } from "@/lib/gameConfig";
import { useAllowKeyboardShortcuts } from "@/hooks/keyboard/usePreventRefresh";
import { useKeyboardLetterStatus } from "@/hooks/keyboard/KeyboardLetterTracker";
import { UseRevealLetter } from '@/hooks/clues/useRevealLetter';
import RevealUnsolvedWords from '@/components/game_assets/word_clues/RevealUnsolvedWords';

// Modular imports
import { useGameState, useKeyboardHandlers } from '@/hooks';
import GameViewportLayout, { TopSection, MiddleSection, BottomSection } from '@/components/ux/GameViewPortLayout';

export default function PlayMode() {
  const [isTransitioned, setIsTransitioned] = useState(false);
  const [solvedClues, setSolvedClues] = useState<boolean[]>([false, false, false]);
  const [showGameOverScreen, setShowGameOverScreen] = useState(false);

  // Ref to store handleWordComplete from ClueGameManager
  const handleWordCompleteRef = useRef<((clue: string) => void) | null>(null);
  
  // Track if we should show modal (only once per game end, and always on refresh)
  const hasShownModalForCurrentGameOver = useRef(false);
  
  // Use modular game state hook
  const gameState = useGameState();
  const {
    lives,
    selectedLetters,
    additionalLetters,
    validatedAdditionalLetters,
    hasAnyCorrectAdditionalLetter,
    hasLostLifeForNoStartingLetters,
    awaitingLetterType,
    pendingLetter,
    message,
    messageType,
    gameStarted,
    lettersInClues,
    isGameOver,
    setIsGameOver,
    hasWon,
    verifiedInputs,
    hintsEnabled,
    cluesData,
    numbersForClue,
    clueWordsArray,
    completedWords,
    verifiedPositions,
    userInputsNested,
    revealedSequenceLetters,
    cursorPosition,
    silentRevealedWords,
    autoRevealedPositions,
    
    // Animation states
    revealedStartingColors,
    hasStartingLettersAnimationCompleted,
    hasAdditionalLettersAnimationCompleted,
    
    setSelectedLetters,
    setAdditionalLetters,
    setValidatedAdditionalLetters,
    setHasAnyCorrectAdditionalLetter,
    setAwaitingLetterType,
    setPendingLetter,
    setGameStarted,
    setLettersInClues,
    setWordInputs,
    setVerifiedInputs,
    setHintsEnabled,
    setCompletedWords,
    setVerifiedPositions,
    setUserInputsNested,
    setRevealedSequenceLetters,
    setCursorPosition,
    setHasLostLifeForNoStartingLetters,
    setSilentRevealedWords,
    setAutoRevealedPositions,
    
    // Animation setters
    setRevealedStartingColors,
    setHasStartingLettersAnimationCompleted,
    setHasAdditionalLettersAnimationCompleted,
    
    handleLifeLost,
    handleWin,
    showMessage,
    handleMessageClose,
    checkLettersInClues,
    hasRevealedOnLoss,
    setHasRevealedOnLoss,
  } = gameState;

  // Handle reveal completion
  const handleRevealComplete = useCallback(() => {
    setHasRevealedOnLoss(true);
    // Add a delay before showing the modal
    setTimeout(() => {
      setShowGameOverScreen(true);
    }, 1500); // 1.5 seconds delay after reveal completes
  }, [setHasRevealedOnLoss]);

  // Handle game over screen delay and show appropriate message
  useEffect(() => {
    if (isGameOver && !hasShownModalForCurrentGameOver.current) {
      hasShownModalForCurrentGameOver.current = true;
      
      const gameOverMessage = hasWon 
        ? GameConfig.messages.gameWinMessage 
        : GameConfig.messages.gameLossMessage;
      const messageType = hasWon ? 'success' : 'error';
      
      // Show message after a short delay (2 seconds after losing last life)
      // But ONLY if we haven't already revealed (to avoid showing on refresh)
      if (!hasRevealedOnLoss) {
        setTimeout(() => {
          showMessage(gameOverMessage, messageType);
        }, 2000); // 2 seconds after game over
      }

      // If won or already revealed (refresh), show modal immediately
      if (hasWon || hasRevealedOnLoss) {
        setShowGameOverScreen(true);
      }
      // If lost and haven't revealed yet, the modal will show via handleRevealComplete
    }
  }, [isGameOver, hasWon, hasRevealedOnLoss, showMessage]);

  // Reset the "has shown" flag when game is no longer over (new game starts)
  useEffect(() => {
    if (!isGameOver) {
      hasShownModalForCurrentGameOver.current = false;
      setShowGameOverScreen(false);
      
      // Reset silent reveal states on new game
      setSilentRevealedWords(new Set());
      setAutoRevealedPositions(new Map());
    }
  }, [isGameOver, setSilentRevealedWords, setAutoRevealedPositions]);

  // handleStartingLettersSubmit to mark animation as completed
  const handleStartingLettersSubmit = useCallback(() => {
    // Only trigger animation if not already completed
    if (hasStartingLettersAnimationCompleted || revealedStartingColors.size === selectedLetters.length) {
      return;
    }
    
    // Reset and trigger staggered color reveal
    setRevealedStartingColors(new Set());
    
    selectedLetters.split('').forEach((_, index) => {
      setTimeout(() => {
        setRevealedStartingColors(prev => new Set([...prev, index]));
      }, index * GameConfig.duration.startingLetterBounceDelay);
    });
    
    // Mark as completed after all animations finish
    const totalAnimationTime = selectedLetters.length * GameConfig.duration.startingLetterBounceDelay + 500;
    setTimeout(() => {
      setHasStartingLettersAnimationCompleted(true);
    }, totalAnimationTime);
  }, [selectedLetters, hasStartingLettersAnimationCompleted, revealedStartingColors.size, setRevealedStartingColors, setHasStartingLettersAnimationCompleted]);

  // Handler for auto-complete
  const handleAutoComplete = useCallback((clue: string) => {
    const clueIndex = clueWordsArray.indexOf(clue);
    if (clueIndex !== -1) {
      handleClueSolved(clueIndex);
    }
    
    // Call the handleWordComplete from ClueGameManager
    if (handleWordCompleteRef.current) {
      handleWordCompleteRef.current(clue);
    }
  }, [clueWordsArray]);

  // Use modular keyboard handlers
  const {
    handleKeyPress,
    handleBackspace,
    handleEnter,
    handleRequestAdditionalLetter,
  } = useKeyboardHandlers({
    selectedLetters,
    gameStarted,
    message,
    awaitingLetterType,
    pendingLetter,
    validatedAdditionalLetters,
    cluesData,
    setSelectedLetters,
    setAwaitingLetterType,
    setPendingLetter,
    setValidatedAdditionalLetters,
    setAdditionalLetters,
    setHasAnyCorrectAdditionalLetter,
    setGameStarted,
    setLettersInClues,
    onStartingLettersSubmit: handleStartingLettersSubmit,
    showMessage,
    handleLifeLost,
    checkLettersInClues,
  });

  // Track keyboard letter status based on VERIFIED inputs only
  // Colors show ONLY after user presses Enter (when letters are added to verifiedInputs)
  const letterStatus = useKeyboardLetterStatus({
    selectedStartingLetters: selectedLetters,
    additionalLetters,
    cluesData,
    wordInputs: verifiedInputs, // Use verifiedInputs directly
    gameStarted
  });
  
  // CRITICAL FIX: Pass revealedSequenceLetters directly (not via ref) so it updates when loaded from storage
  const { 
    revealedClueDashes,
    revealedClueLetters,
    dashesCurrentlyAnimating,
    clueLettersComplete,
  } = UseRevealLetter({
    startingLetters: selectedLetters,
    clueWords: clueWordsArray,
    lettersInClue: lettersInClues,
    triggered: gameStarted,
    initialRevealedLetters: revealedSequenceLetters, // Pass directly, not via ref!
    additionalLetters: additionalLetters,
    config: {
      clueDashDelay: GameConfig.duration.clueDashRevealDelay,
      clueLetterDelay: GameConfig.duration.startingLetterBounceDelay,
    },
    // Pass callback to mark additional letters as completed
    onAdditionalLetterComplete: (type: 'vowel' | 'consonant') => {
      setHasAdditionalLettersAnimationCompleted(prev => ({
        ...prev,
        [type]: true
      }));
    },
    // Pass current completion state to prevent re-animation
    hasAdditionalLettersAnimationCompleted: hasAdditionalLettersAnimationCompleted,
  });

  // Sync revealed sequence letters for PERSISTENCE only (page refresh)
  // This saves the state but we use revealedClueLetters for rendering
  useEffect(() => {
    if (clueLettersComplete && revealedClueLetters && revealedClueLetters.size > 0) {
      setRevealedSequenceLetters(revealedClueLetters);
    }
  }, [clueLettersComplete, revealedClueLetters, setRevealedSequenceLetters]);
  
  // Allow keyboard shortcuts
  useAllowKeyboardShortcuts();

  // Transition effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioned(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Add a handler for when a clue is solved
  const handleClueSolved = useCallback((clueIndex: number) => {
    setSolvedClues(prev => {
      const newSolved = [...prev];
      newSolved[clueIndex] = true;
      return newSolved;
    });
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
      {showGameOverScreen && (
        hasWon ? (
          <WinScreen onClose={() => setShowGameOverScreen(false)} />
        ) : (
          <LoseScreen onClose={() => setShowGameOverScreen(false)} />
        )
      )}

      {/* Reveal Unsolved Words on Loss */}
      <RevealUnsolvedWords
        isGameOver={isGameOver}
        hasWon={hasWon}
        completedWords={completedWords}
        clueWordsArray={clueWordsArray}
        userInputsNested={userInputsNested}
        onUserInputsSync={setUserInputsNested}
        revealedSequenceLetters={revealedSequenceLetters}
        verifiedPositions={verifiedPositions}
        onVerifiedPositionsSync={setVerifiedPositions}
        onSilentRevealSync={setSilentRevealedWords}
        autoRevealedPositions={autoRevealedPositions}
        onAutoRevealedPositionsSync={setAutoRevealedPositions}
        onCompletedWordsChange={setCompletedWords}
        onRevealComplete={handleRevealComplete}
        hasRevealedOnLoss={hasRevealedOnLoss}
      />

      {/* Viewport-Adaptive Layout */}
      <GameViewportLayout isTransitioned={isTransitioned}>
        {/* Top Section - Starting Letters, Additional Letters & Word Type Hints */}
        <TopSection isTransitioned={isTransitioned}>
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
                revealedColors={revealedStartingColors}
              />
            </div>
            
            {/* Additional Letters */}
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
                  setAwaitingLetterType(null);
                  showMessage('', 'info');
                }}
                isGameOver={isGameOver}
                clueLettersComplete={clueLettersComplete}
                hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
              />
            </div>
          </div>
          
          {/* Noun Verb Adjective Placement - stays in top right */}
          <div className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          } text-2xl sm:text-4xl md:text-4xl flex items-center gap-3`}>
            <div className={GameConfig.wordColors.noun}> n </div>
            <div className={GameConfig.wordColors.verb}> v </div>
            <div className={GameConfig.wordColors.adjective}> a </div>
          </div>
        </TopSection>

        {/* Middle Section - Game Area */}
        <MiddleSection isTransitioned={isTransitioned}>
          {/* Left side - Clue Dashes */}
          <div className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}>
            {!gameStarted ? (
              // Placeholder dashes before game starts
              <div className="flex flex-col justify-center space-y-6 sm:space-y-8 md:space-y-10">
                {numbersForClue.map((_, index) => (
                  <div key={index} className={`${GameConfig.wordColors.default} text-3xl md:text-5xl font-bold`}>
                    _
                  </div>
                ))}
              </div>						
            ) : (
              // ClueGameManager component after game starts
              <ClueGameManager 
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
                revealedDashes={revealedClueDashes}
                revealedLetters={revealedClueLetters} 
                dashesCurrentlyAnimating={dashesCurrentlyAnimating}
                clueLettersComplete={clueLettersComplete}
                onClueSolved={handleClueSolved}
                initialCompletedWords={completedWords}
                onCompletedWordsChange={setCompletedWords}
                initialVerifiedPositions={verifiedPositions}
                onVerifiedPositionsSync={setVerifiedPositions}
                initialUserInputs={userInputsNested}
                onUserInputsSync={setUserInputsNested}
                clueWordsArray={clueWordsArray}
                hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
                setHasLostLifeForNoStartingLetters={setHasLostLifeForNoStartingLetters}
                initialCursorPosition={cursorPosition}
                onCursorPositionChange={setCursorPosition}
                isGameOver={isGameOver}
                onWordAutoComplete={(handler) => {
                  handleWordCompleteRef.current = handler;
                }}
                silentRevealedWords={silentRevealedWords}
                autoRevealedPositions={autoRevealedPositions}
              />
            )}
          </div>

          {/* Right side - Hints */}
          <div className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}>
            <HintToggle 
              hintsEnabled={hintsEnabled}
              solvedClues={solvedClues}
            />
          </div>
        </MiddleSection>

        {/* Bottom Section - Lives & Keyboard */}
        <BottomSection
          isTransitioned={isTransitioned}
          livesComponent={
            <LifeBar lives={lives} maxLives={GameConfig.maxLives} />
          }
          
          keyboardComponent={
            <Keyboard 
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              onEnter={handleEnter}
              disabled={!isGameOver && message !== '' && !awaitingLetterType}
              gameStarted={gameStarted}
              letterStatus={letterStatus}
              awaitingLetterType={awaitingLetterType}
              clueLettersComplete={clueLettersComplete}
              hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
              isGameOver={isGameOver}
            />
            
          }
        />
      </GameViewportLayout>
    </div>
  );
}