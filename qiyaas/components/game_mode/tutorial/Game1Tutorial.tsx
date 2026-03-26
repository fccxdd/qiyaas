// components/game_mode/tutorial/Game1Tutorial.tsx

'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import HintToggle from "@/components/game_assets/number_clues/HintToggle";
import Keyboard from "@/components/game_assets/keyboard/Keyboard";
import LifeBar from "@/components/game_assets/lives/LifeBar";
import StartingLetters from "@/components/game_assets/word_clues/StartingLetters";
import { UseRevealLetter } from '@/hooks/clues/useRevealLetter';
import ClueGameManager from "@/components/game_assets/word_clues/ClueGameManager";
import TutorialBox, { TutorialBoxHandle } from '@/components/game_assets/messages/TutorialBox';
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

// Step ID sets
const GUESS_STEP_IDS = new Set([21, 27, 28]);
const RESULT_STEP_IDS = new Set([22, 23, 24]);
const TIP_STEP_IDS = new Set([25, 29, 30]);

// Maps clue rule → result step ID
const RULE_TO_RESULT: Record<string, number> = {
  number_rule:   22,
  length_rule:   23,
  alphabet_rule: 24,
};

// Maps result step ID → clue rule (for back nav labels)
const RESULT_TO_RULE: Record<number, string> = {
  22: 'number_rule',
  23: 'length_rule',
  24: 'alphabet_rule',
};

// The three clue rules in order, for looking up which result step a clue index maps to
const CLUE_RULES = [
  TutorialGame1.cluesData.clue_1.rule,
  TutorialGame1.cluesData.clue_2.rule,
  TutorialGame1.cluesData.clue_3.rule,
];

// Maps clue index → result step ID (derived from actual rule, not assumed order)
function clueIndexToResultStep(clueIndex: number): number {
  return RULE_TO_RESULT[CLUE_RULES[clueIndex]] ?? 22;
}

export default function Game1Tutorial({
  isTransitioned,
  onPhaseComplete,
  tutorialBoxReady = false,
  initialStep,
  onRestartTutorial,
  onComplete,
}: Game1TutorialProps) {
  const currentGameData = TutorialGame1;
  const [spotlight, setSpotlight] = useState<string[] | null>(null);
  const [hintsAllOpened, setHintsAllOpened] = useState(false);
  const [autoOpenAll, setAutoOpenAll] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<number>(Game1[0].id);
  const currentStepIdRef = useRef<number>(Game1[0].id);

  // ── Persist step "ever done" state ────────────────────────────────────────
  const [step14EverDone, setStep14EverDone] = useState(false);
  const [step19EverDone, setStep19EverDone] = useState(false);
  const [step20EverDone, setStep20EverDone] = useState(false);
  const [step19Done, setStep19Done] = useState(false);

  // ── Guess flow ────────────────────────────────────────────────────────────
  const hadWrongGuessPerStepRef = useRef<Record<number, boolean>>({});
  const currentGuessStepRef = useRef<number>(21);

  const [solvedResultsInOrder, setSolvedResultsInOrder] = useState<number[]>([]);
  const solvedResultsInOrderRef = useRef<number[]>([]);
  useEffect(() => {
    solvedResultsInOrderRef.current = solvedResultsInOrder;
  }, [solvedResultsInOrder]);

  const [tipIsCorrect, setTipIsCorrect] = useState(false);
  const [tipBackTarget, setTipBackTarget] = useState<number>(21);
  const [tipArrivedViaBack, setTipArrivedViaBack] = useState(false);
  const [prevInstructionStep, setPrevInstructionStep] = useState<number>(20);
  const pendingWrongGuessRef = useRef(false);

  // ── End screen ────────────────────────────────────────────────────────────
  const [showEndScreen, setShowEndScreen] = useState<'lose' | null>(null);

  const hasSeededWordInputsRef = useRef(false);
  const tutorialBoxRef = useRef<TutorialBoxHandle>(null);

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

  // ── Step 19 tracking ──────────────────────────────────────────────────────
  useEffect(() => {
    if (currentStepId === 19) setStep19Done(false);
  }, [currentStepId]);

  useEffect(() => {
    if (gameStarted && currentStepId === 19) setStep19Done(true);
  }, [gameStarted, currentStepId]);

  // ── Starting letters submit ───────────────────────────────────────────────
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

  // ── Clue solved ───────────────────────────────────────────────────────────
  const handleClueSolved = useCallback((clueIndex: number) => {
    setSolvedClues(prev => {
      const next = [...prev];
      next[clueIndex] = true;
      return next;
    });

    const resultStepId = clueIndexToResultStep(clueIndex);

    setSolvedResultsInOrder(prev =>
      prev.includes(resultStepId) ? prev : [...prev, resultStepId]
    );

    // Clear wrong-guess history for all steps — once a word is solved,
    // navigating back should never show "not quite" again
    hadWrongGuessPerStepRef.current = {};
    pendingWrongGuessRef.current = false;

    setTipIsCorrect(true);
    setTipBackTarget(resultStepId);

    tutorialBoxRef.current?.goToStepId(resultStepId);
  }, [setSolvedClues]);

  // ── Guess submitted (wrong guess handling) ────────────────────────────────
  const lastGuessCorrectRef = useRef(false);

  const handleGuessSubmitted = useCallback((clueIndex: number, word: string) => {
    setSubmittedGuesses(prev => {
      const next = [...prev];
      next[clueIndex] = [...next[clueIndex], word];
      return next;
    });

    if (GUESS_STEP_IDS.has(currentStepIdRef.current) || RESULT_STEP_IDS.has(currentStepIdRef.current)) {
      lastGuessCorrectRef.current = false;
      setTimeout(() => {
        if (lastGuessCorrectRef.current) return;

        const guessStep = currentGuessStepRef.current;
        hadWrongGuessPerStepRef.current[guessStep] = true;
        pendingWrongGuessRef.current = true;
        setTipIsCorrect(false);
        setTipBackTarget(guessStep);
        tutorialBoxRef.current?.goToStepId(25);
      }, 50);
    }
  }, [setSubmittedGuesses]);

  const handleClueSolvedWrapped = useCallback((clueIndex: number) => {
    lastGuessCorrectRef.current = true;
    handleClueSolved(clueIndex);
  }, [handleClueSolved]);

  // ── Life / lose ───────────────────────────────────────────────────────────
  const handleLose = useCallback(() => {
    setTimeout(() => setShowEndScreen('lose'), GameConfig.duration.gameOverScreenDelay);
  }, []);

  const wrappedHandleLifeLost = useCallback(() => {
    handleLifeLost();
    if (lives - 1 <= 0) handleLose();
  }, [handleLifeLost, lives, handleLose]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
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
  }, [gameStarted, baseHandleKeyPress, showMessage, restoreStartingMessage]);

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

  // ── Persist-step auto-advance ─────────────────────────────────────────────
  useEffect(() => {
    if (hintsAllOpened && !step14EverDone) {
      setStep14EverDone(true);
      tutorialBoxRef.current?.goNext();
    }
  }, [hintsAllOpened]);

  useEffect(() => {
    if (step19Done && !step19EverDone) {
      setStep19EverDone(true);
      tutorialBoxRef.current?.goNext();
    }
  }, [step19Done]);

  useEffect(() => {
    if (lettersComplete && currentStepId === 20 && !step20EverDone) {
      setStep20EverDone(true);
      tutorialBoxRef.current?.goNext();
    }
  }, [lettersComplete, currentStepId, step20EverDone]);

  const revealAnimation = gameStarted ? { dashesRevealed, dashesAnimating, lettersRevealed } : undefined;

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

  // ── Spotlight derivations ─────────────────────────────────────────────────
  const hintSpotlightColumn: 'number' | 'alpha' | 'value' | null = (() => {
    if (!spotlight) return null;
    if (spotlight.includes('hints:number')) return 'number';
    if (spotlight.includes('hints:alpha')) return 'alpha';
    if (spotlight.includes('hints:value')) return 'value';
    return null;
  })();

  // Which individual clue row to spotlight (null = all visible)
  const spotlightClueIndex: number | null = (() => {
    if (!spotlight) return null;
    const s = spotlight.find(s => s.startsWith('clues:'));
    return s ? parseInt(s.split(':')[1]) : null;
  })();

  // Which word type to spotlight: 'noun' | 'verb' | 'adjective' | null
  const spotlightWordType: string | null = (() => {
    if (!spotlight) return null;
    const s = spotlight.find(s => s.startsWith('wordTypes:'));
    return s ? s.split(':')[1] : null;
  })();

  useAllowKeyboardShortcuts();

  // ── onStepChange ──────────────────────────────────────────────────────────
  const handleStepChange = useCallback((index: number, isBack: boolean) => {
    const stepId = Game1[index].id;
    const prevStepId = currentStepIdRef.current; // capture BEFORE updating
    currentStepIdRef.current = stepId;
    setCurrentStepId(stepId);

    if (GUESS_STEP_IDS.has(stepId)) {
      currentGuessStepRef.current = stepId;

      const hadWrong = !!hadWrongGuessPerStepRef.current[stepId];
      pendingWrongGuessRef.current = hadWrong;
      if (hadWrong) {
        setTipIsCorrect(false);
        setTipBackTarget(stepId);
      } else {
        setTipIsCorrect(true);
      }
    }

    if (TIP_STEP_IDS.has(stepId)) {
      setTipArrivedViaBack(isBack);
      if (!isBack && RESULT_STEP_IDS.has(prevStepId)) {
        // Arriving forward from a result slide
        setTipBackTarget(prevStepId);
        setTipIsCorrect(true);
      } else if (isBack) {
        const solved = solvedResultsInOrderRef.current;
        const hasCorrectResult = solved.length > 0;
        setTipIsCorrect(hasCorrectResult);
        if (hasCorrectResult) {
          setTipBackTarget(solved[0]);
        }
      }
    }

    if (!GUESS_STEP_IDS.has(stepId) && !RESULT_STEP_IDS.has(stepId) && !TIP_STEP_IDS.has(stepId)) {
      setPrevInstructionStep(stepId);
    }
  }, []);

  // ── nextOverride ──────────────────────────────────────────────────────────
  const nextOverride = useMemo((): Record<number, number> => {
    const allSolved = solvedResultsInOrder.length === 3;
    const nextGuessStep = solvedResultsInOrder.length === 0 ? 21
      : solvedResultsInOrder.length === 1 ? 27
      : solvedResultsInOrder.length === 2 ? 28
      : 26;
    const tipNextCorrect = solvedResultsInOrder.length >= 2
      ? solvedResultsInOrder[1]
      : nextGuessStep;
    const tipNext = tipIsCorrect ? tipNextCorrect : currentGuessStepRef.current;

    const nextForResult = (resultStepId: number): number => {
      const idx = solvedResultsInOrder.indexOf(resultStepId);
      if (idx === -1) return 25;
      if (idx === 0) return 25;
      if (idx < solvedResultsInOrder.length - 1) return solvedResultsInOrder[idx + 1];
      if (allSolved) return 26;
      return nextGuessStep;
    };

    const step20Next = solvedResultsInOrder.length > 0
      ? solvedResultsInOrder[0]
      : 21;

    return {
      20: step20Next,
      22: nextForResult(22),
      23: nextForResult(23),
      24: nextForResult(24),
      25: tipNext,
      29: tipNext,
      30: tipNext,
    };
  }, [tipIsCorrect, tipArrivedViaBack, currentStepId, solvedResultsInOrder]);

  // ── backOverride ──────────────────────────────────────────────────────────
  const backOverride = useMemo((): Record<number, number> => {
    const lastResult = solvedResultsInOrder.length > 0
      ? solvedResultsInOrder[solvedResultsInOrder.length - 1]
      : 20;

    const backForResult = (resultStepId: number): number => {
      const idx = solvedResultsInOrder.indexOf(resultStepId);
      if (idx === 1) return 25;
      if (idx > 1) return solvedResultsInOrder[idx - 1];
      return 20;
    };

    return {
      26: lastResult,
      20: 19,
      19: 18,
      18: 17,
      17: 16,
      16: 15,
      15: 14,
      14: 13,
      13: 11,
      11: 10,
      21: lastResult !== 20 ? lastResult : prevInstructionStep,
      27: lastResult !== 20 ? lastResult : prevInstructionStep,
      28: lastResult !== 20 ? lastResult : prevInstructionStep,
      25: tipBackTarget,
      29: tipBackTarget,
      30: tipBackTarget,
      22: backForResult(22),
      23: backForResult(23),
      24: backForResult(24),
    };
  }, [prevInstructionStep, tipBackTarget, solvedResultsInOrder]);

  // ── nextDisabled ──────────────────────────────────────────────────────────
  const nextDisabled =
    (currentStepId === 14 && !step14EverDone) ||
    (currentStepId === 19 && !step19EverDone) ||
    (currentStepId === 20 && !step20EverDone) ||
    GUESS_STEP_IDS.has(currentStepId);

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

            {/* Word type indicators — dim whole section if no wordTypes spotlight,
                dim individual letters if wordTypes:noun/verb/adjective */}
            <div className={`transition-all duration-700 ${
              !isTransitioned ? "opacity-0 translate-x-4" :
              spotlight && !spotlight.some(s => s === 'wordTypes' || s.startsWith('wordTypes:')) ? "opacity-20 pointer-events-none" :
              "opacity-100 translate-x-0"
            } text-2xl sm:text-4xl md:text-4xl flex items-center gap-3`}>
              {(['noun', 'verb', 'adjective'] as const).map((type) => (
                <div
                  key={type}
                  className={`${GameConfig.wordColors[type]} transition-opacity duration-300 ${
                    spotlightWordType && spotlightWordType !== type ? 'opacity-20' : 'opacity-100'
                  }`}
                >
                  {type === 'noun' ? 'n' : type === 'verb' ? 'v' : 'a'}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex justify-center">
            <TutorialBox
              ref={tutorialBoxRef}
              steps={Game1}
              onComplete={onPhaseComplete}
              onSpotlightChange={setSpotlight}
              onStepChange={handleStepChange}
              nextDisabled={nextDisabled}
              nextOverride={nextOverride}
              backOverride={backOverride}
              stepOverrides={{
                25: { title: tipIsCorrect ? `✨ Quick Tip! ✨` : `Close, but not quite!` },
                29: { title: tipIsCorrect ? `✨ Quick Tip! ✨` : `Close, but not quite!` },
                30: { title: tipIsCorrect ? `✨ Quick Tip! ✨` : `Close, but not quite!` },
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
            spotlight && !spotlight.some(s => s === 'clues' || s.startsWith('clues:')) ? "opacity-20 pointer-events-none" :
            "opacity-100 translate-x-0"
          }`}>
            {!gameStarted ? (
              <div className="flex flex-col justify-center space-y-6 sm:space-y-8 md:space-y-10">
                {numbersForClue.map((_, index) => (
                  <div key={index} className={`${GameConfig.wordColors.default} dash-text md:text-5xl font-bold`}>
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
                onShowMessage={(msg, type, persist) => {
                  if (
                    msg === '' ||
                    msg === GameConfig.messages.wordNotValid ||
                    msg === GameConfig.messages.wordNotComplete ||
                    msg === GameConfig.messages.confirmWord
                  ) showMessage(msg, type, persist);
                }}
                isMessageActive={message !== '' &&
                                message !== GameConfig.messages.confirmWord
                                }
                isGameOver={isGameOver}
                revealAnimation={revealAnimation}
                onClueSolved={handleClueSolvedWrapped}
                letterStatus={mergedLetterStatus}
                hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
                setHasLostLifeForNoStartingLetters={setHasLostLifeForNoStartingLetters}
                onGuessSubmitted={handleGuessSubmitted}
                sequenceRevealed={sequenceRevealed}
                showConfirmWord={true}
                spotlightClueIndex={spotlightClueIndex}
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
                    message !== GameConfig.messages.confirmStartingLetters &&
                    message !== GameConfig.messages.confirmWord)
                }
              />
            </div>
          }
        />

      </GameViewportLayout>
    </div>
  );
}