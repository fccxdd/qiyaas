'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useRevealSequence } from '@/hooks/clues/useRevealSequence';
import { getTypeFromClue } from '@/hooks/clues/clueTypes';

// Modular imports
import { useGameState, useKeyboardHandlers } from '@/hooks';
import GameViewportLayout, { TopSection, MiddleSection, BottomSection } from '@/components/ux/GameViewPortLayout';

export default function PlayMode() {
  const [isTransitioned, setIsTransitioned] = useState(false);
  const [solvedClues, setSolvedClues] = useState<boolean[]>([false, false, false]);
  const [revealedStartingColors, setRevealedStartingColors] = useState<Set<number>>(new Set());

  // Use modular game state hook
  const gameState = useGameState();
  const {
    lives,
    selectedLetters,
    additionalLetters,
    validatedAdditionalLetters,
    hasAnyCorrectAdditionalLetter,
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
    handleLifeLost,
    handleWin,
    showMessage,
    handleMessageClose,
    checkLettersInClues
  } = gameState;

  // Add this callback function before the useKeyboardHandlers call
  const handleStartingLettersSubmit = useCallback(() => {
    // Reset and trigger staggered color reveal
    setRevealedStartingColors(new Set());
    
    selectedLetters.split('').forEach((_, index) => {
      setTimeout(() => {
        setRevealedStartingColors(prev => new Set([...prev, index]));
      }, index * GameConfig.duration.startingLetterBounceDelay);
    });
  }, [selectedLetters]);

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
  const letterStatus = useKeyboardLetterStatus({
    selectedStartingLetters: selectedLetters,
    additionalLetters,
    cluesData,
    wordInputs: verifiedInputs,
    gameStarted
  });

  // Reveal sequence for clue dashes and letters
  const { 
    revealedClueDashes,          // Green dashes that appear one by one
    revealedClueLetters,         // Letters that bounce in one by one (currently not used in WordDash)
    dashesCurrentlyAnimating,
    clueLettersComplete,
  } = useRevealSequence({
    startingLetters: selectedLetters,
    clueWords: clueWordsArray,
    lettersInClue: lettersInClues,
    triggered: gameStarted,
    config: {
      clueDashDelay: GameConfig.duration.clueDashRevealDelay,  // Time between each dash
      clueLetterDelay:  GameConfig.duration.startingLetterBounceDelay,  // Time between each letter
    }
  });

  // Allow keyboard shortcuts
  useAllowKeyboardShortcuts();

  // Transition effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioned(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Extract word types for hints
  const wordTypes = useMemo(() => {
    if (!cluesData) return [];
    return [
      getTypeFromClue(cluesData.clue_1),
      getTypeFromClue(cluesData.clue_2),
      getTypeFromClue(cluesData.clue_3)
    ].filter(Boolean) as string[];
  }, [cluesData]);

  // Add a handler for when a clue is solved
  const handleClueSolved = useCallback((clueIndex: number) => {
    // console.log('🎯 Clue solved! Index:', clueIndex);
    setSolvedClues(prev => {
      const newSolved = [...prev];
      newSolved[clueIndex] = true;
      // console.log('Updated solvedClues:', newSolved);
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
      {isGameOver && (
        hasWon ? (
          <WinScreen onClose={() => setIsGameOver(false)} />
        ) : (
          <LoseScreen onClose={() => setIsGameOver(false)} />
        )
      )}      
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
                  <div key={index} className="text-black dark:text-white text-3xl md:text-5xl font-bold">
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
                revealedDashes={revealedClueDashes}  // Map<string, Set<number>> - green dash positions
                revealedLetters={revealedClueLetters}  // Map<string, Map<number, string>> - letters with values
                dashesCurrentlyAnimating={dashesCurrentlyAnimating}  // Map<string, Set<number>> - which dashes are animating
                clueLettersComplete={clueLettersComplete}  // boolean - when to turn dashes black/white
                onClueSolved={handleClueSolved}
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
              disabled={message !== '' && !awaitingLetterType}
              gameStarted={gameStarted}
              letterStatus={letterStatus}
              awaitingLetterType={awaitingLetterType}
            />
          }
        />
      </GameViewportLayout>
    </div>
  );
}