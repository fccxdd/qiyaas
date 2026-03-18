// components/game_mode/tutorial/Game1Tutorial.tsx

'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import HintToggle from "@/components/game_assets/number_clues/HintToggle";
import Keyboard from "@/components/game_assets/keyboard/Keyboard";
import LifeBar from "@/components/game_assets/lives/LifeBar";
import StartingLetters from "@/components/game_assets/word_clues/StartingLetters";
import { UseRevealLetter } from '@/hooks/clues/useRevealLetter';
import ClueGameManager from "@/components/game_assets/word_clues/ClueGameManager";
import TutorialBox from '@/components/game_assets/messages/TutorialBox';
import { GameConfig } from "@/lib/gameConfig";
import { useAllowKeyboardShortcuts } from "@/hooks/keyboard/usePreventRefresh";
import { useKeyboardLetterStatus } from "@/hooks/keyboard/KeyboardLetterTracker";
import { Game1 } from '@/data/tutorialGameSteps';
import { TutorialGame1 } from '@/data/tutorialWords';
import { useTutorialGameState } from '@/hooks/clues/game_state/UseTutorialGameState';
import { useKeyboardHandlers } from '@/hooks/keyboard/UseKeyboardHandlers';
import GameViewportLayout, { TopSection, MiddleSection, BottomSection } from '@/components/ux/GameViewPortLayout';
import { GameOverModal } from '@/components/game_assets/game_over/GameOverModal';

interface Game1TutorialProps {
  isTransitioned: boolean;
  onPhaseComplete: () => void;
  tutorialBoxReady?: boolean;
  initialStep?: number;
  onRestartTutorial: () => void;
  onComplete: () => void;
}

export default function Game1Tutorial({ isTransitioned, onPhaseComplete, tutorialBoxReady = false, initialStep, onRestartTutorial, onComplete }: Game1TutorialProps) {
  const currentGameData = TutorialGame1;
  const [spotlight, setSpotlight] = useState<string[] | null>(null);
  const [hintsAllOpened, setHintsAllOpened] = useState(false);
  const [autoOpenAll, setAutoOpenAll] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<number>(Game1[0].id);

  // ── Guess flow state ──────────────────────────────────────────────────────
  const [step21Done, setStep21Done] = useState(false);
  const [resultStepDone, setResultStepDone] = useState(false);
  const [solveCount, setSolveCount] = useState(0);
  const [lastResultStepId, setLastResultStepId] = useState<number | null>(null);
  const solvedOrderRef = useRef<number[]>([]);
  const wrongGuessOnStep21Ref = useRef(false);
  const lastGuessCorrectRef = useRef(false);
  const [lastGuessCorrect, setLastGuessCorrect] = useState(false);
  const hasSeededWordInputsRef = useRef(false);
  const [showEndScreen, setShowEndScreen] = useState<'lose' | null>(null);

  useEffect(() => {
    if (currentStepId === 21) {
      // Re-arm for each new round
      setStep21Done(false);
      wrongGuessOnStep21Ref.current = false;
      lastGuessCorrectRef.current = false;
      setLastGuessCorrect(false);
    }

    if ([22, 23, 24].includes(currentStepId)) {
      setLastResultStepId(currentStepId);
      setResultStepDone(false);
      const t = setTimeout(() => setResultStepDone(true), 1500);
      return () => clearTimeout(t);
    } else {
      setResultStepDone(false);
    }
  }, [currentStepId]);

  // ── Spotlight / autoOpenAll ───────────────────────────────────────────────

  useEffect(() => {
    const isHintsColumnSpotlight = !!spotlight?.some(s => s.startsWith('hints:'));
    if (isHintsColumnSpotlight) {
      setAutoOpenAll(false);
      setTimeout(() => setAutoOpenAll(true), 0);
    } else {
      setAutoOpenAll(false);
    }
  }, [spotlight]);

  // ── Game state ────────────────────────────────────────────────────────────

  const {
    lives,
    selectedLetters,
    hasLostLifeForNoStartingLetters,
    message,
    messagePersist,
    gameStarted,
    lettersInClues,
    hintsEnabled,
    cluesData,
    clueWordsArray,
    completed,
    verified,
    wordInputs,
    cursorPosition,
    revealedStartingColors,
    hasStartingLettersAnimationCompleted,
    solvedClues,
    submittedGuesses,
    sequenceRevealed,
    isGameOver,

    setSelectedLetters,
    setGameStarted,
    setLettersInClues,
    setWordInputs,
    setVerified,
    setCompleted,
    setCursorPosition,
    setHasLostLifeForNoStartingLetters,
    setRevealedStartingColors,
    setHasStartingLettersAnimationCompleted,
    setSolvedClues,
    setSubmittedGuesses,
    setSequenceRevealed,

    handleLifeLost,
    handleWin,
    showMessage,
    handleMessageClose,
    checkLettersInClues,
  } = useTutorialGameState({ cluesData: currentGameData.cluesData });

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
  }, [selectedLetters, hasStartingLettersAnimationCompleted, revealedStartingColors.length,
      setRevealedStartingColors, setHasStartingLettersAnimationCompleted]);

  const handleClueSolved = useCallback((clueIndex: number) => {
    setSolvedClues(prev => {
      const next = [...prev];
      next[clueIndex] = true;
      return next;
    });
    if (!solvedOrderRef.current.includes(clueIndex)) {
      solvedOrderRef.current = [...solvedOrderRef.current, clueIndex];
      setSolveCount(solvedOrderRef.current.length);
    }
    if (currentStepId === 21) {
      lastGuessCorrectRef.current = true;
      setLastGuessCorrect(true);
      setStep21Done(true);
    }
  }, [setSolvedClues, currentStepId]);

  const handleLose = useCallback(() => {
    setTimeout(() => setShowEndScreen('lose'), GameConfig.duration.gameOverScreenDelay);
  }, []);

  const wrappedHandleLifeLost = useCallback(() => {
    handleLifeLost();
    if (lives - 1 <= 0) handleLose();
  }, [handleLifeLost, lives, handleLose]);

  const { handleKeyPress: baseHandleKeyPress, handleBackspace, handleEnter, restoreStartingMessage } = useKeyboardHandlers({
    selectedLetters,
    gameStarted,
    message,
    setSelectedLetters,
    setGameStarted,
    setLettersInClues,
    onStartingLettersSubmit: handleStartingLettersSubmit,
    showMessage,
    handleLifeLost: wrappedHandleLifeLost,
    checkLettersInClues,
  });

  const ALLOWED_STARTING_LETTERS = new Set(['R', 'S', 'T', 'E']);

  const handleKeyPress = useCallback((key: string) => {
    if (!gameStarted && !ALLOWED_STARTING_LETTERS.has(key.toUpperCase())) {
      showMessage('For this tutorial, please select R, S, T, E', 'error');
      restoreStartingMessage();
      return;
    }
    baseHandleKeyPress(key);
  }, [gameStarted, baseHandleKeyPress, showMessage]);

  const handleGuessSubmitted = useCallback((clueIndex: number, word: string) => {
    setSubmittedGuesses(prev => {
      const next = [...prev];
      next[clueIndex] = [...next[clueIndex], word];
      return next;
    });
    // On step 21, any wrong guess (on any round) triggers yellow tip
    if (currentStepId === 21 && !solvedClues[clueIndex] && !wrongGuessOnStep21Ref.current) {
      wrongGuessOnStep21Ref.current = true;
      lastGuessCorrectRef.current = false;
      setLastGuessCorrect(false);
      setStep21Done(true);
    }
  }, [setSubmittedGuesses, currentStepId, solvedClues]);

  // ── Letter status ─────────────────────────────────────────────────────────

  const letterStatus = useKeyboardLetterStatus({
    selectedStartingLetters: selectedLetters,
    cluesData,
    verified,
    gameStarted,
    completed,
    submittedGuesses,
  });

  const mergedLetterStatus = useMemo(() => {
    const merged = { ...letterStatus };
    currentGameData.keyboard.used_up.forEach((letter: string) => {
      if (!merged[letter] || merged[letter] === 'unused') merged[letter] = 'used_up';
    });
    currentGameData.keyboard.still_available.forEach((letter: string) => {
      if (!merged[letter] || merged[letter] === 'unused') merged[letter] = 'still_available';
    });
    return merged;
  }, [letterStatus, currentGameData]);

  // ── Reveal animation ──────────────────────────────────────────────────────

  const {
    dashesRevealed,
    dashesAnimating,
    lettersRevealed,
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

    const newVerified = verified.map((row, i) =>
      row.map((v, pos) => v || lettersRevealed[i]?.[pos] !== null)
    );
    setVerified(newVerified);

    for (let i = 0; i < newVerified.length; i++) {
      for (let pos = 0; pos < newVerified[i].length; pos++) {
        if (!newVerified[i][pos]) {
          setCursorPosition({ clueIndex: i, position: pos });
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

  // ── Clue data ─────────────────────────────────────────────────────────────

  const numbersForClue = [
    currentGameData.cluesData.clue_1.number,
    currentGameData.cluesData.clue_2.number,
    currentGameData.cluesData.clue_3.number,
  ];
  const wordTypes = [
    currentGameData.cluesData.clue_1.type,
    currentGameData.cluesData.clue_2.type,
    currentGameData.cluesData.clue_3.type,
  ];
  const ruleTypes = [
    currentGameData.cluesData.clue_1.rule,
    currentGameData.cluesData.clue_2.rule,
    currentGameData.cluesData.clue_3.rule,
  ];

  const hintSpotlightColumn: 'number' | 'alpha' | 'value' | null = (() => {
    if (!spotlight) return null;
    if (spotlight.includes('hints:number')) return 'number';
    if (spotlight.includes('hints:alpha')) return 'alpha';
    if (spotlight.includes('hints:value')) return 'value';
    return null;
  })();

  useAllowKeyboardShortcuts();

  if (showEndScreen === 'lose') {
    return (
      <GameOverModal showCloseButton={false}>
        <h2 className="text-2xl font-bold text-red-500">NOT QUITE YET...</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center px-8 mt-3">Lets go through the tutorial again to get you ready.</p>
        <div className="flex flex-col gap-3 mt-6 items-center">
          <button
            onClick={onRestartTutorial}
            className="rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center text-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl font-medium text-base sm:text-lg h-11 px-5 w-[140px] whitespace-nowrap"
          >
            Restart Tutorial
          </button>
          <button
            onClick={onComplete}
            className="rounded-full shadow-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-all flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent hover:-translate-y-1 hover:shadow-2xl font-medium text-base sm:text-lg h-11 px-5 w-[140px] whitespace-nowrap"
          >
            Skip Tutorial
          </button>
        </div>
      </GameOverModal>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-black overflow-hidden">
      <GameViewportLayout isTransitioned={isTransitioned}>

        <TopSection isTransitioned={isTransitioned}>
          <div className="w-full flex justify-between items-start">
            <div className={`transition-all duration-700 pointer-events-none ${
              !isTransitioned ? "opacity-0 -translate-x-4" :
              spotlight && !spotlight.includes('startingLetters') ? "opacity-20 pointer-events-none" :
              "opacity-100 translate-x-0"
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
              !isTransitioned ? "opacity-0 translate-x-4" :
              spotlight && !spotlight.includes('wordTypes') ? "opacity-20 pointer-events-none" :
              "opacity-100 translate-x-0"
            } text-2xl sm:text-4xl md:text-4xl flex items-center gap-3`}>
              <div className={GameConfig.wordColors.noun}> n </div>
              <div className={GameConfig.wordColors.verb}> v </div>
              <div className={GameConfig.wordColors.adjective}> a </div>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <TutorialBox
              steps={Game1}
              onComplete={onPhaseComplete}
              onSpotlightChange={setSpotlight}
              onStepChange={(index) => setCurrentStepId(Game1[index].id)}
              actionCompleted={{
                19: gameStarted,
                14: hintsAllOpened,
                20: lettersComplete,
                21: step21Done,
                22: resultStepDone,
                23: resultStepDone,
                24: resultStepDone,
              }}
              onActionComplete={(stepId) => {
                const resultStepMap: Record<number, number> = { 0: 22, 1: 23, 2: 24 };

                if (stepId === 21) {
                  if (wrongGuessOnStep21Ref.current) return 25;
                  const clue = solvedOrderRef.current[solvedOrderRef.current.length - 1];
                  if (clue !== undefined) return resultStepMap[clue] ?? null;
                }

                if ([22, 23, 24].includes(stepId)) {
                  return solveCount >= 3 ? 26 : 21;
                }

                if (stepId === 25) return 21;

                return null;
              }}
              backOverride={{
                25: lastResultStepId ?? 21,
              }}
              nextOverride={{
                25: 21,
              }}
              stepOverrides={{
                21: {
                  title: solveCount === 0
                    ? `Try guessing one of the words`
                    : solveCount === 1
                    ? `Now guess another word`
                    : `Last one!`,
                },
                25: {
                  title: lastGuessCorrect
                    ? `✨Quick Tip!✨`
                    : `Close, but not quite!`,
                },
              }}
              message={currentStepId >= 19 ? message : null}
              messagePersist={messagePersist}
              onMessageDismiss={handleMessageClose}
              ready={tutorialBoxReady}
              initialStep={initialStep}
            />
          </div>
        </TopSection>

        <MiddleSection isTransitioned={isTransitioned}>
          <div className={`transition-all duration-700 ${
            !isTransitioned ? "opacity-0 -translate-x-4" :
            spotlight && !spotlight.includes('clues') ? "opacity-20 pointer-events-none" :
            "opacity-100 translate-x-0"
          }`}>
            {!gameStarted ? (
              <div className="flex flex-col justify-center space-y-6 sm:space-y-8 md:space-y-10">
                {numbersForClue.map((_, index) => (
                  <div key={index} className={`${GameConfig.wordColors.default} text-3xl md:text-5xl font-bold`}>
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
                onLifeLost={wrappedHandleLifeLost}
                onWin={handleWin}
                onShowMessage={showMessage}
                isMessageActive={message !== ''}
                isGameOver={isGameOver}
                revealAnimation={revealAnimation}
                onClueSolved={handleClueSolved}
                letterStatus={mergedLetterStatus}
                hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
                setHasLostLifeForNoStartingLetters={setHasLostLifeForNoStartingLetters}
                onGuessSubmitted={handleGuessSubmitted}
                sequenceRevealed={sequenceRevealed}
              />
            )}
          </div>

          <div className={`transition-all duration-700 ${
            !isTransitioned ? "opacity-0 translate-x-4" :
            spotlight && !spotlight.some(s => s === 'hints' || s.startsWith('hints:')) ? "opacity-20 pointer-events-none" :
            "opacity-100 translate-x-0"
          }`}>
            <HintToggle
              hintsEnabled={hintsEnabled}
              solvedClues={solvedClues}
              numbersForClue={numbersForClue}
              wordTypes={wordTypes}
              ruleTypes={ruleTypes}
              spotlightColumn={hintSpotlightColumn}
              onAllHintsOpened={() => setHintsAllOpened(true)}
              autoOpenAll={autoOpenAll}
            />
          </div>
        </MiddleSection>

        <BottomSection
          isTransitioned={isTransitioned}
          livesComponent={
            <div className={`transition-all duration-500 ${
              spotlight && !spotlight.includes('lifebar') ? "opacity-20 pointer-events-none" : "opacity-100"
            }`}>
              <LifeBar lives={lives} maxLives={GameConfig.maxLives} />
            </div>
          }
          keyboardComponent={
            <div className={`transition-all duration-500 ${
              spotlight && !spotlight.includes('keyboard') ? "opacity-20 pointer-events-none" : "opacity-100"
            }`}>
              <Keyboard
                onKeyPress={handleKeyPress}
                onBackspace={handleBackspace}
                onEnter={handleEnter}
                gameStarted={gameStarted}
                letterStatus={mergedLetterStatus}
                hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
                isGameOver={isGameOver}
                isRevealing={gameStarted && !lettersComplete}
                disabled={
                  currentStepId < 19 ||
                  (!isGameOver &&
                    message !== '' &&
                    message !== GameConfig.messages.startingLettersMessage &&
                    message !== GameConfig.messages.confirmStartingLetters)
                }
              />
            </div>
          }
        />

      </GameViewportLayout>
    </div>
  );
}