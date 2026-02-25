'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import HintToggle from "@/components/game_assets/number_clues/HintToggle";
import Keyboard from "@/components/game_assets/keyboard/Keyboard";
import LifeBar from "@/components/game_assets/lives/LifeBar";
import StartingLetters from "@/components/game_assets/word_clues/StartingLetters";
import { UseRevealLetter } from '@/hooks/clues/useRevealLetter';
import ClueGameManager from "@/components/game_assets/word_clues/ClueGameManager";
import MessageBox from "@/components/game_assets/messages/MessageBox";
import TutorialBox from '@/components/game_assets/messages/TutorialBox';
import { GameConfig } from "@/lib/gameConfig";
import { useAllowKeyboardShortcuts } from "@/hooks/keyboard/usePreventRefresh";
import { useKeyboardLetterStatus } from "@/hooks/keyboard/KeyboardLetterTracker";
import { TutorialGameInstructions, Game2 } from '@/data/tutorialGameSteps';
import { TutorialGame1, TutorialGame2 } from '@/data/tutorialWords';
import { useTutorialGameState } from '@/hooks/clues/game_state/UseTutorialGameState';
import { useKeyboardHandlers } from '@/hooks/keyboard/UseKeyboardHandlers';
import GameViewportLayout, { TopSection, MiddleSection, BottomSection } from '@/components/ux/GameViewPortLayout';
import { useRouter } from 'next/navigation';

interface TutorialModeProps {
  onComplete?: () => void;
}

const PHASE_INTRO = 0;
const PHASE_GAME2 = 1;

export default function TutorialMode({ onComplete }: TutorialModeProps) {
  const router = useRouter();
  const [phase, setPhase] = useState(PHASE_INTRO);
  const [isTransitioned, setIsTransitioned] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsTransitioned(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handlePhaseComplete = useCallback(() => {
    setPhase(prev => {
      if (prev < PHASE_GAME2) return prev + 1;
      router.push('/play');  // Redirect to main game after tutorial
      return prev;
    });
  }, [router]);

  if (phase === PHASE_GAME2) {
    return (
            <Game2Tutorial
              isTransitioned={isTransitioned}
              onComplete={handlePhaseComplete}
              onRestartTutorial={() => {setPhase(PHASE_INTRO)
                router.push('/how-to-play')
              }
            }
            />
          );
        }

  return (
    <Game1Tutorial
      isTransitioned={isTransitioned}
      onPhaseComplete={handlePhaseComplete}
    />
  );
}

interface Game1TutorialProps {
  isTransitioned: boolean;
  onPhaseComplete: () => void;
}

function Game1Tutorial({ isTransitioned, onPhaseComplete }: Game1TutorialProps) {

  const currentGameData = TutorialGame1;

  const {
    lives,
    selectedLetters,
    hasLostLifeForNoStartingLetters,
    message,
    messageType,
    messagePersist,
    handleMessageClose,
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
    solvedClues,
    submittedGuesses,

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

    handleLifeLost,
    handleWin,
    showMessage,
    checkLettersInClues,
  } = useTutorialGameState({ cluesData: currentGameData.cluesData });

  // Pre-fill on mount — no animations, state set instantly
  useEffect(() => {
    const letters = currentGameData.selectedLetters;

    setSelectedLetters(letters);
    setGameStarted(true);
    // revealedStartingColors is number[] in new model
    setRevealedStartingColors(letters.split('').map((_, i) => i));
    setHasStartingLettersAnimationCompleted(true);
     setLettersInClues(checkLettersInClues(letters));

    // wordInputs — arrays per clue
    const inputs: (string | null)[][] = [[], [], []];
    (['clue_1', 'clue_2', 'clue_3'] as const).forEach((key, i) => {
      inputs[i] = currentGameData.wordInputs[key] as (string | null)[];
    });
    setWordInputs(inputs);

    // verified — mark all pre-filled positions as verified
    const newVerified: boolean[][] = [[], [], []];
    (['clue_1', 'clue_2', 'clue_3'] as const).forEach((key, i) => {
      newVerified[i] = (currentGameData.wordInputs[key] as (string | null)[]).map(c => c !== null);
    });
    setVerified(newVerified);

    // Set cursor to first non-verified position across all clues
    outer: for (let i = 0; i < inputs.length; i++) {
      for (let pos = 0; pos < inputs[i].length; pos++) {
        if (inputs[i][pos] === null) {
          setCursorPosition({ clueIndex: i, position: pos });
          break outer;
        }
      }
    }
  }, [
    currentGameData,
    setSelectedLetters,
    setGameStarted,
    setRevealedStartingColors,
    setHasStartingLettersAnimationCompleted,
    setWordInputs,
    setVerified,
    setCursorPosition
  ]);

  const handleClueSolved = useCallback((clueIndex: number) => {
    setSolvedClues(prev => {
      const next = [...prev];
      next[clueIndex] = true;
      return next;
    });
  }, [setSolvedClues]);

  // lettersInClues is string[] in new model — useKeyboardHandlers expects string[]
  const { handleKeyPress, handleBackspace, handleEnter } = useKeyboardHandlers({
    selectedLetters,
    gameStarted,
    message,
    setSelectedLetters,
    setGameStarted,
    setLettersInClues,
    onStartingLettersSubmit: () => {},
    showMessage,
    handleLifeLost,
    checkLettersInClues,
  });

  const handleGuessSubmitted = useCallback((clueIndex: number, word: string) => {
      setSubmittedGuesses(prev => {
        const next = [...prev];
        next[clueIndex] = [...next[clueIndex], word];
        return next;
      });
}, [setSubmittedGuesses]);

  const letterStatus = useKeyboardLetterStatus({
    selectedStartingLetters: selectedLetters,
    cluesData,
    verified,
    gameStarted,
    completed,
    submittedGuesses
    
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

  useAllowKeyboardShortcuts();

  return (
    <div className="fixed inset-0 bg-white dark:bg-black overflow-hidden">
      
      {/* <div className="z-[9999]">
				<MessageBox
					message={message}
					type={messageType}
					onClose={handleMessageClose}
					persist={messagePersist}
				/>
			</div> */}
      <GameViewportLayout isTransitioned={isTransitioned}>

        <TopSection isTransitioned={isTransitioned}>
          <div className="flex flex-col gap-2 sm:gap-4 w-full">
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

            <div className="w-full flex justify-center">
              <TutorialBox
                steps={TutorialGameInstructions}
                onComplete={onPhaseComplete}
              />
            </div>
          </div>

          <div className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          } text-2xl sm:text-4xl md:text-4xl flex items-center gap-3`}>
            <div className={GameConfig.wordColors.noun}> n </div>
            <div className={GameConfig.wordColors.verb}> v </div>
            <div className={GameConfig.wordColors.adjective}> a </div>
          </div>
        </TopSection>

        <MiddleSection isTransitioned={isTransitioned}>
          <div className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}>
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
              isMessageActive={message !== ''}
              isGameOver={false}
              onClueSolved={handleClueSolved}
              letterStatus={mergedLetterStatus}
              hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
              setHasLostLifeForNoStartingLetters={setHasLostLifeForNoStartingLetters}
              onGuessSubmitted={handleGuessSubmitted}
              
            />
          </div>

          <div className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}>
            <HintToggle
              hintsEnabled={hintsEnabled}
              solvedClues={solvedClues}
              numbersForClue={numbersForClue}
              wordTypes={wordTypes}
              ruleTypes={ruleTypes}
            />
          </div>
        </MiddleSection>

        <BottomSection
          isTransitioned={isTransitioned}
          livesComponent={<LifeBar lives={lives} maxLives={GameConfig.maxLives} />}
          keyboardComponent={
            <Keyboard
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              onEnter={handleEnter}
              gameStarted={gameStarted}
              letterStatus={mergedLetterStatus}
              hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
              isGameOver={false}
            />
          }
        />

      </GameViewportLayout>
    </div>
  );
}

interface Game2TutorialProps {
  isTransitioned: boolean;
  onComplete: () => void;
  onRestartTutorial: () => void;
}

function Game2Tutorial({ isTransitioned, onComplete, onRestartTutorial }: Game2TutorialProps) {
  const [showEndScreen, setShowEndScreen] = useState<'win' | 'lose' | null>(null);
  const hasSeededWordInputsRef = useRef(false);

  const {
    lives, selectedLetters, hasLostLifeForNoStartingLetters,
    message, messageType, messagePersist, handleMessageClose,
    gameStarted, lettersInClues, hintsEnabled, cluesData,
    numbersForClue, completed, verified, wordInputs, cursorPosition,
    revealedStartingColors, hasStartingLettersAnimationCompleted,
    solvedClues, isGameOver, clueWordsArray,
    sequenceRevealed, submittedGuesses,

    setSelectedLetters, setGameStarted, setLettersInClues,
    setWordInputs, setVerified, setCompleted, setCursorPosition,
    setHasLostLifeForNoStartingLetters, setRevealedStartingColors,
    setHasStartingLettersAnimationCompleted, setSolvedClues,
    setSequenceRevealed, setSubmittedGuesses,

    handleLifeLost, showMessage, checkLettersInClues,
  } = useTutorialGameState({ cluesData: TutorialGame2.cluesData });

  const handleWin = useCallback(() => {
    setTimeout(() => setShowEndScreen('win'), GameConfig.duration.gameOverScreenDelay);
  }, []);

  const handleLose = useCallback(() => {
    setTimeout(() => setShowEndScreen('lose'), GameConfig.duration.gameOverScreenDelay);
  }, []);

  const wrappedHandleLifeLost = useCallback(() => {
    handleLifeLost();
    if (lives - 1 <= 0) handleLose();
  }, [handleLifeLost, lives, handleLose]);

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

  const { handleKeyPress, handleBackspace, handleEnter } = useKeyboardHandlers({
    selectedLetters, gameStarted, message,
    setSelectedLetters, setGameStarted, setLettersInClues,
    onStartingLettersSubmit: handleStartingLettersSubmit,
    showMessage, handleLifeLost: wrappedHandleLifeLost, checkLettersInClues,
  });

  const handleGuessSubmitted = useCallback((clueIndex: number, word: string) => {
    setSubmittedGuesses(prev => {
      const next = [...prev];
      next[clueIndex] = [...next[clueIndex], word];
      return next;
    });
  }, [setSubmittedGuesses]);

  const letterStatus = useKeyboardLetterStatus({
    selectedStartingLetters: selectedLetters,
    cluesData, 
    verified, 
    gameStarted,
    submittedGuesses,
    completed
  });

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
    setVerified(prev => prev.map((row, i) =>
      row.map((v, pos) => v || lettersRevealed[i]?.[pos] !== null)
    ));

    const newVerified = verified.map((row, i) =>
    row.map((v, pos) => v || lettersRevealed[i]?.[pos] !== null)
    );
    setVerified(newVerified);
    // Set cursor to first non-verified position after reveal
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

  // ── Clue solved ───────────────────────────────────────────────────────────

  const handleClueSolved = useCallback((clueIndex: number) => {
    setSolvedClues(prev => {
      const next = [...prev];
      next[clueIndex] = true;
      return next;
    });
  }, [setSolvedClues]);

  const wordTypes = [
    TutorialGame2.cluesData.clue_1.type,
    TutorialGame2.cluesData.clue_2.type,
    TutorialGame2.cluesData.clue_3.type,
  ];
  const ruleTypes = [
    TutorialGame2.cluesData.clue_1.rule,
    TutorialGame2.cluesData.clue_2.rule,
    TutorialGame2.cluesData.clue_3.rule,
  ];

  useAllowKeyboardShortcuts();

  if (showEndScreen === 'win') {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-bold text-green-500">Youre ready to play! 🎉</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center px-8">Youve completed the tutorial. Time to play the real game!</p>
        <button onClick={onComplete} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
          Play Qiyaas →
        </button>
        <button onClick={onRestartTutorial} className="text-sm text-gray-500 hover:text-gray-700 underline">
          Restart tutorial
        </button>
      </div>
    );
  }

  if (showEndScreen === 'lose') {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-bold text-red-500">Not quite yet...</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center px-8">Lets go through the tutorial again to get you ready.</p>
        <button onClick={onRestartTutorial} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
          Restart Tutorial
        </button>
        <button onClick={onComplete} className="text-sm text-gray-500 hover:text-gray-700 underline">
          Skip to game anyway
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-black overflow-hidden">
      <div className="z-[9999]">
        <MessageBox
          message={message}
          type={messageType}
          onClose={handleMessageClose}
          persist={messagePersist}
        />
      </div>

      <GameViewportLayout isTransitioned={isTransitioned}>
        <TopSection isTransitioned={isTransitioned}>
          <div className="flex flex-col gap-2 sm:gap-4 w-full">
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

            <div className="w-full flex justify-center">
              <TutorialBox
                steps={Game2}
                collapsible
                forceCollapsed={gameStarted}
                onComplete={() => {}}
              />
            </div>
          </div>

          <div className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          } text-2xl sm:text-4xl md:text-4xl flex items-center gap-3`}>
            <div className={GameConfig.wordColors.noun}> n </div>
            <div className={GameConfig.wordColors.verb}> v </div>
            <div className={GameConfig.wordColors.adjective}> a </div>
          </div>
        </TopSection>

        <MiddleSection isTransitioned={isTransitioned}>
          <div className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
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
                letterStatus={letterStatus}
                hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
                setHasLostLifeForNoStartingLetters={setHasLostLifeForNoStartingLetters}
                onGuessSubmitted={handleGuessSubmitted}
                
              />
            )}
          </div>

          <div className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}>
            <HintToggle
              hintsEnabled={hintsEnabled}
              solvedClues={solvedClues}
              numbersForClue={numbersForClue}
              wordTypes={wordTypes}
              ruleTypes={ruleTypes}
            />
          </div>
        </MiddleSection>

        <BottomSection
          isTransitioned={isTransitioned}
          livesComponent={<LifeBar lives={lives} maxLives={GameConfig.maxLives} />}
          keyboardComponent={
            <Keyboard
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              onEnter={handleEnter}
              gameStarted={gameStarted}
              letterStatus={letterStatus}
              hasLostLifeForNoStartingLetters={hasLostLifeForNoStartingLetters}
              isGameOver={isGameOver}
              isRevealing={gameStarted && !lettersComplete}
            />
          }
        />
      </GameViewportLayout>
    </div>
  );
}