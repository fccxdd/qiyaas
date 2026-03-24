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
  // Wrong guess tracking — per guess step, did it have a wrong guess?
  // Used to restore tip routing when user goes back and then forward again.
  const hadWrongGuessPerStepRef = useRef<Record<number, boolean>>({});

  // Which guess step (21/27/28) is currently active
  const currentGuessStepRef = useRef<number>(21);

  // Result steps visited in solve order — drives back navigation
  // e.g. [23, 22, 24] means length was solved first, then number, then alphabet
  const [solvedResultsInOrder, setSolvedResultsInOrder] = useState<number[]>([]);
  const solvedResultsInOrderRef = useRef<number[]>([]);
  // Keep ref in sync with state
  useEffect(() => {
    solvedResultsInOrderRef.current = solvedResultsInOrder;
  }, [solvedResultsInOrder]);

  // Whether the current tip slide is showing a correct-guess tip or wrong-guess tip
  const [tipIsCorrect, setTipIsCorrect] = useState(false);

  // The result step ID that the current tip should go Back to
  // (set when routing to tip — correct → result slide, wrong → guess step)
  const [tipBackTarget, setTipBackTarget] = useState<number>(21);

  // Whether the tip was arrived at going backwards — drives tipNext routing.
  // State (not ref) so nextOverride useMemo reacts when it changes.
  const [tipArrivedViaBack, setTipArrivedViaBack] = useState(false);

  // The last instruction step seen — used as Back target for guess steps
  const [prevInstructionStep, setPrevInstructionStep] = useState<number>(20);

  // Whether a wrong guess is pending resolution for the current guess step
  // Used to re-arm the wrong-guess tip when user navigates back then forward
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
  // Called immediately when a word is solved correctly.
  // Jump directly to the matching result slide regardless of current step.
  const handleClueSolved = useCallback((clueIndex: number) => {
    setSolvedClues(prev => {
      const next = [...prev];
      next[clueIndex] = true;
      return next;
    });

    const resultStepId = clueIndexToResultStep(clueIndex);

    // Record this result in solve order (skip duplicates)
    setSolvedResultsInOrder(prev =>
      prev.includes(resultStepId) ? prev : [...prev, resultStepId]
    );

    // Mark the current guess step as no longer having a pending wrong guess
    hadWrongGuessPerStepRef.current[currentGuessStepRef.current] = false;
    pendingWrongGuessRef.current = false;

    // Tip after this result will be a "quick tip" (correct)
    setTipIsCorrect(true);
    // Back from tip → result slide
    setTipBackTarget(resultStepId);

    // Jump immediately to the result slide
    tutorialBoxRef.current?.goToStepId(resultStepId);
  }, [setSolvedClues]);

  // ── Guess submitted (wrong guess handling) ────────────────────────────────
  // Only fires on wrong guesses — correct guesses are handled by handleClueSolved.
  // We use a short timeout so handleClueSolved can fire first if correct.
  const lastGuessCorrectRef = useRef(false);

  const handleGuessSubmitted = useCallback((clueIndex: number, word: string) => {
    setSubmittedGuesses(prev => {
      const next = [...prev];
      next[clueIndex] = [...next[clueIndex], word];
      return next;
    });

    if (GUESS_STEP_IDS.has(currentStepIdRef.current)) {
      lastGuessCorrectRef.current = false;
      setTimeout(() => {
        // If handleClueSolved ran, lastGuessCorrectRef will be true — skip wrong path
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

  // Keep lastGuessCorrectRef in sync with handleClueSolved
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

  const hintSpotlightColumn: 'number' | 'alpha' | 'value' | null = (() => {
    if (!spotlight) return null;
    if (spotlight.includes('hints:number')) return 'number';
    if (spotlight.includes('hints:alpha')) return 'alpha';
    if (spotlight.includes('hints:value')) return 'value';
    return null;
  })();

  useAllowKeyboardShortcuts();

  // ── onStepChange ──────────────────────────────────────────────────────────
  const handleStepChange = useCallback((index: number, isBack: boolean) => {
    const stepId = Game1[index].id;
    currentStepIdRef.current = stepId;
    setCurrentStepId(stepId);

    // Track which guess step is active
    if (GUESS_STEP_IDS.has(stepId)) {
      currentGuessStepRef.current = stepId;

      // Restore wrong-guess tip routing if this step had a prior wrong guess
      const hadWrong = !!hadWrongGuessPerStepRef.current[stepId];
      pendingWrongGuessRef.current = hadWrong;
      if (hadWrong) {
        setTipIsCorrect(false);
        setTipBackTarget(stepId);
      }
    }

    // When arriving at a tip slide (forward or back), restore tipIsCorrect
    if (TIP_STEP_IDS.has(stepId)) {
      setTipArrivedViaBack(isBack);
      if (!isBack && RESULT_STEP_IDS.has(currentStepIdRef.current)) {
        // Arriving forward from a result slide — update back target and mark correct
        setTipBackTarget(currentStepIdRef.current);
        setTipIsCorrect(true);
      } else if (isBack) {
        // Arriving via back nav — tip is correct if any words have been solved
        const solved = solvedResultsInOrderRef.current;
        const hasCorrectResult = solved.length > 0;
        setTipIsCorrect(hasCorrectResult);
        if (hasCorrectResult) {
          setTipBackTarget(solved[0]);
        }
      }
    }

    // Track last instruction step for guess step back navigation
    if (!GUESS_STEP_IDS.has(stepId) && !RESULT_STEP_IDS.has(stepId) && !TIP_STEP_IDS.has(stepId)) {
      setPrevInstructionStep(stepId);
    }
  }, []);

  // ── nextOverride ──────────────────────────────────────────────────────────
  // Result slides:
  //   If all 3 words solved → skip tip, go straight to 26
  //   Otherwise → tip (25)
  // Tip slides:
  //   correct → next guess step (or 26 if all done)
  //   wrong   → same guess step
  const nextOverride = useMemo((): Record<number, number> => {
    const allSolved = solvedResultsInOrder.length === 3;
    // Next guess step is determined by how many words have been solved so far,
    // not by which guess step is currently active — this ensures consistency
    // regardless of which order words are solved.
    const nextGuessStep = solvedResultsInOrder.length === 0 ? 21
      : solvedResultsInOrder.length === 1 ? 27
      : solvedResultsInOrder.length === 2 ? 28
      : 26;
    // Tip Next:
    //   If result 2 exists (2+ words solved) → go to result 2 to continue showing results
    //   Otherwise → next guess step (more words left to solve)
    //   Wrong guess → return to same guess step
    const tipNextCorrect = solvedResultsInOrder.length >= 2
      ? solvedResultsInOrder[1]
      : nextGuessStep;
    const tipNext = tipIsCorrect ? tipNextCorrect : currentGuessStepRef.current;

    // For each result slide, Next goes to the next result in solve order,
    // or to 25 (tip) if there's no next result yet,
    // or to 26 if this is the last result and all words are solved.
    const nextForResult = (resultStepId: number): number => {
      const idx = solvedResultsInOrder.indexOf(resultStepId);
      // Not yet solved — shouldn't normally happen but default to tip
      if (idx === -1) return 25;
      // First result → tip
      if (idx === 0) return 25;
      // There's a next result in solve order → go there
      if (idx < solvedResultsInOrder.length - 1) return solvedResultsInOrder[idx + 1];
      // This is the last result so far
      if (allSolved) return 26;
      // Not all solved yet → go to the next guess step so they can solve the remaining word
      return nextGuessStep;
    };

    // Step 20 (correctly guessed letters): if any words already solved,
    // skip the guess steps and jump to the first result in solve order (or 26 if all done).
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
  // Step 26 ("makes sense?") → last result slide in solve order
  // Tip → tipBackTarget (result slide if correct, guess step if wrong)
  // Result → previous result in solve order, or step 20
  // Guess → last instruction step
  const backOverride = useMemo((): Record<number, number> => {
    const lastResult = solvedResultsInOrder.length > 0
      ? solvedResultsInOrder[solvedResultsInOrder.length - 1]
      : 20;

    const backForResult = (resultStepId: number): number => {
      const idx = solvedResultsInOrder.indexOf(resultStepId);
      // Second result → tip always sits between result 1 and result 2
      if (idx === 1) return 25;
      // Third result → second result
      if (idx > 1) return solvedResultsInOrder[idx - 1];
      // First result → step 20
      return 20;
    };

    return {
      // Step 26 → last result slide visited
      26: lastResult,
      // Step 20 → step 19 (previous instruction)
      20: 19,
      // Guess steps → last result if any solved, else last instruction step
      21: lastResult !== 20 ? lastResult : prevInstructionStep,
      27: lastResult !== 20 ? lastResult : prevInstructionStep,
      28: lastResult !== 20 ? lastResult : prevInstructionStep,
      // Tips → result slide (correct) or guess step (wrong)
      25: tipBackTarget,
      29: tipBackTarget,
      30: tipBackTarget,
      // Result slides → previous result in solve order, or step 20
      22: backForResult(22),
      23: backForResult(23),
      24: backForResult(24),
    };
  }, [prevInstructionStep, tipBackTarget, solvedResultsInOrder]);

  // ── nextDisabled ──────────────────────────────────────────────────────────
  // Guess steps are locked until the user solves a word (which auto-jumps them)
  // or submits a wrong guess (which jumps to tip).
  // We lock based on whether they're still on a guess step with nothing resolved yet.
  // Result and tip slides are always freely navigable.
  const nextDisabled =
    (currentStepId === 14 && !step14EverDone) ||
    (currentStepId === 19 && !step19EverDone) ||
    (currentStepId === 20 && !step20EverDone) ||
    GUESS_STEP_IDS.has(currentStepId);
  // Note: guess steps are always locked because the user can never manually
  // press Next on them — they always exit via solving (→ result) or wrong guess (→ tip).
  // Back is always available via backOverride.

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
                onClueSolved={handleClueSolvedWrapped}
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