// components/WordGameManager.jsx

import { useState, useEffect } from 'react';
import tutorialWords from '@/data/tutorial_words.json';
import Link from "next/link";

export default function WordGameManager({ 
  isActive = false, 
  startingLetters = [],
  onGameStateChange = null,
  virtualKeyboardInput = null 
}) {
  const [gameState, setGameState] = useState({
    startingLetters: [],
    additionalLetters: [],
    pendingAdditionalLetters: [],
    currentClue: 0,
    currentPosition: 0,
    clueGuesses: [[], [], []],
    clueRevealed: [[], [], []],
    newlyRevealed: [[], [], []],
    correctWords: [false, false, false],
    lives: 5,
    gameStatus: 'playing',
    usedLetters: new Set(),
    availableLetters: new Set(),
    flashingLetters: [],
    shakingClue: -1,
    clueWords: [
      tutorialWords.clue_1.toUpperCase(),
      tutorialWords.clue_2.toUpperCase(), 
      tutorialWords.clue_3.toUpperCase()
    ],
    hoverAnimation: false,
    showHints: [false, false, false]
  });

  useEffect(() => {
    if (isActive && startingLetters.length === 4) {
      const clueWords = [
        tutorialWords.clue_1.toUpperCase(),
        tutorialWords.clue_2.toUpperCase(), 
        tutorialWords.clue_3.toUpperCase()
      ];
      
      setGameState(prev => ({
        ...prev,
        startingLetters: [...startingLetters],
        clueWords: clueWords,
        availableLetters: new Set()
      }));
      
      revealStartingLetters(startingLetters, clueWords);
    }
  }, [isActive, startingLetters]);

  const revealStartingLetters = (letters, clueWords) => {
    const newClueRevealed = [[], [], []];
    const newClueGuesses = [[], [], []];
    const newlyRevealed = [[], [], []];
    
    clueWords.forEach((word, clueIndex) => {
      newClueGuesses[clueIndex] = new Array(word.length).fill('');
      newClueRevealed[clueIndex] = new Array(word.length).fill(false);
      newlyRevealed[clueIndex] = new Array(word.length).fill(false);
      
      letters.forEach(letter => {
        for (let i = 0; i < word.length; i++) {
          if (word[i] === letter) {
            newClueGuesses[clueIndex][i] = letter;
            newClueRevealed[clueIndex][i] = true;
            newlyRevealed[clueIndex][i] = true;
          }
        }
      });
    });

    setGameState(prev => ({
      ...prev,
      clueGuesses: newClueGuesses,
      clueRevealed: newClueRevealed,
      newlyRevealed: newlyRevealed,
      usedLetters: new Set(letters)
    }));

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        newlyRevealed: [[], [], []]
      }));
    }, 2000);
  };

  const addPendingAdditionalLetter = (letter) => {
    const upperLetter = letter.toUpperCase();
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    
    if (gameState.startingLetters.includes(upperLetter) || 
        gameState.additionalLetters.includes(upperLetter) ||
        gameState.pendingAdditionalLetters.includes(upperLetter)) {
      return { success: false, error: 'Letter already used!' };
    }
    
    const currentVowels = [...gameState.additionalLetters, ...gameState.pendingAdditionalLetters].filter(l => vowels.includes(l)).length;
    const currentConsonants = [...gameState.additionalLetters, ...gameState.pendingAdditionalLetters].filter(l => !vowels.includes(l)).length;
    
    if (vowels.includes(upperLetter) && currentVowels >= 1) {
      return { success: false, error: 'Only 1 additional vowel allowed!' };
    }
    
    if (!vowels.includes(upperLetter) && currentConsonants >= 1) {
      return { success: false, error: 'Only 1 additional consonant allowed!' };
    }
    
    if (gameState.additionalLetters.length + gameState.pendingAdditionalLetters.length >= 2) {
      return { success: false, error: 'Maximum 2 additional letters!' };
    }
    
    setGameState(prev => ({
      ...prev,
      pendingAdditionalLetters: [...prev.pendingAdditionalLetters, upperLetter]
    }));
    
    return { success: true };
  };

  const confirmAdditionalLetters = () => {
    if (gameState.pendingAdditionalLetters.length === 0) return;
    
    const correctLetters = [];
    const incorrectLetters = [];
    
    gameState.pendingAdditionalLetters.forEach(letter => {
      const letterInWords = gameState.clueWords.some(word => word.includes(letter));
      if (letterInWords) {
        correctLetters.push(letter);
      } else {
        incorrectLetters.push(letter);
      }
    });
    
    if (correctLetters.length > 0) {
      animateLetterReveal(correctLetters);
    }
    
    const newAdditionalLetters = [...gameState.additionalLetters, ...correctLetters, ...incorrectLetters];
    const livesLost = incorrectLetters.length;
    
    setGameState(prev => ({
      ...prev,
      additionalLetters: newAdditionalLetters,
      pendingAdditionalLetters: [],
      lives: prev.lives - livesLost
    }));
    
    if (gameState.lives - livesLost <= 0) {
      setGameState(prev => ({ ...prev, gameStatus: 'lost' }));
    }
  };

  const animateLetterReveal = (letters) => {
    const positions = [];
    
    letters.forEach(letter => {
      gameState.clueWords.forEach((word, clueIndex) => {
        for (let i = 0; i < word.length; i++) {
          if (word[i] === letter) {
            positions.push({ clue: clueIndex, position: i, letter });
          }
        }
      });
    });
    
    let index = 0;
    const hoverInterval = setInterval(() => {
      if (index < positions.length) {
        const pos = positions[index];
        setGameState(prev => ({
          ...prev,
          currentClue: pos.clue,
          currentPosition: pos.position,
          hoverAnimation: true
        }));
        index++;
      } else {
        clearInterval(hoverInterval);
        revealLetters(letters);
      }
    }, 200);
  };

  const revealLetters = (letters) => {
    const newClueRevealed = [...gameState.clueRevealed];
    const newClueGuesses = [...gameState.clueGuesses];
    const newlyRevealed = [...gameState.newlyRevealed];
    
    letters.forEach(letter => {
      gameState.clueWords.forEach((word, clueIndex) => {
        for (let i = 0; i < word.length; i++) {
          if (word[i] === letter) {
            newClueGuesses[clueIndex][i] = letter;
            newClueRevealed[clueIndex][i] = true;
            newlyRevealed[clueIndex][i] = true;
          }
        }
      });
    });
    
    setGameState(prev => ({
      ...prev,
      clueGuesses: newClueGuesses,
      clueRevealed: newClueRevealed,
      newlyRevealed: newlyRevealed,
      usedLetters: new Set([...prev.usedLetters, ...letters]),
      hoverAnimation: false
    }));
    
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        newlyRevealed: prev.newlyRevealed.map(clue => clue.map(() => false))
      }));
    }, 2000);
  };

  const addLetterToCurrentPosition = (letter) => {
    const upperLetter = letter.toUpperCase();
    
    const hasRevealedLetter = gameState.clueRevealed?.[gameState.currentClue]?.[gameState.currentPosition];
    const isWordComplete = gameState.correctWords[gameState.currentClue];
    
    if (hasRevealedLetter || isWordComplete) {
      if (gameState.currentPosition < gameState.clueWords[gameState.currentClue].length - 1) {
        setGameState(prev => ({
          ...prev,
          currentPosition: prev.currentPosition + 1
        }));
      }
      return;
    }
    
    if (!gameState.startingLetters.includes(upperLetter) && 
        !gameState.additionalLetters.includes(upperLetter) &&
        !gameState.pendingAdditionalLetters.includes(upperLetter)) {
      const result = addPendingAdditionalLetter(upperLetter);
      if (result.success) {
        return;
      }
    }
    
    const currentWord = gameState.clueWords[gameState.currentClue];
    
    if (gameState.currentPosition < currentWord.length) {
      const newClueGuesses = [...gameState.clueGuesses];
      
      if (!newClueGuesses[gameState.currentClue] || newClueGuesses[gameState.currentClue].length !== currentWord.length) {
        newClueGuesses[gameState.currentClue] = new Array(currentWord.length).fill('');
      }
      
      newClueGuesses[gameState.currentClue][gameState.currentPosition] = upperLetter;
      
      setGameState(prev => ({
        ...prev,
        clueGuesses: newClueGuesses
      }));
      
      if (gameState.currentPosition < currentWord.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentPosition: prev.currentPosition + 1
        }));
      }
    }
  };

  const removeLetterFromCurrentPosition = () => {
    const isCurrentRevealed = gameState.clueRevealed?.[gameState.currentClue]?.[gameState.currentPosition];
    const isWordComplete = gameState.correctWords[gameState.currentClue];
    
    if (isCurrentRevealed || isWordComplete) return;
    
    const newClueGuesses = [...gameState.clueGuesses];
    
    if (newClueGuesses[gameState.currentClue]?.[gameState.currentPosition]) {
      newClueGuesses[gameState.currentClue][gameState.currentPosition] = '';
      setGameState(prev => ({
        ...prev,
        clueGuesses: newClueGuesses
      }));
    }
  };

  const handleEnterKey = () => {
    if (gameState.pendingAdditionalLetters.length > 0) {
      confirmAdditionalLetters();
    } else {
      guessWord();
    }
  };

  const handleClickPosition = (clueIndex, positionIndex) => {
    setGameState(prev => ({
      ...prev,
      currentClue: clueIndex,
      currentPosition: positionIndex
    }));
  };

  const guessWord = () => {
    const currentWord = gameState.clueWords[gameState.currentClue];
    const guessedWord = gameState.clueGuesses[gameState.currentClue].join('');
    
    if (guessedWord.length !== currentWord.length) {
      setGameState(prev => ({ ...prev, shakingClue: gameState.currentClue }));
      setTimeout(() => {
        setGameState(prev => ({ ...prev, shakingClue: -1 }));
      }, 500);
      return;
    }
    
    if (guessedWord === currentWord) {
      setGameState(prev => ({
        ...prev,
        flashingLetters: Array.from(guessedWord).map((_, i) => ({ 
          clue: gameState.currentClue, 
          position: i, 
          color: 'green' 
        })),
        correctWords: prev.correctWords.map((correct, idx) => 
          idx === gameState.currentClue ? true : correct
        )
      }));
      
      const newClueRevealed = [...gameState.clueRevealed];
      const newUsedLetters = new Set(gameState.usedLetters);
      const newAvailableLetters = new Set(gameState.availableLetters);
      
      Array.from(guessedWord).forEach((letter, idx) => {
        newClueRevealed[gameState.currentClue][idx] = true;
        const existsInOtherWords = gameState.clueWords.some((word, clueIdx) => 
          clueIdx !== gameState.currentClue && word.includes(letter)
        );
        
        if (existsInOtherWords) {
          newAvailableLetters.add(letter);
        } else {
          newUsedLetters.add(letter);
        }
      });
      
      setGameState(prev => ({
        ...prev,
        clueRevealed: newClueRevealed,
        usedLetters: newUsedLetters,
        availableLetters: newAvailableLetters
      }));
      
      setTimeout(() => {
        setGameState(prev => ({ ...prev, flashingLetters: [] }));
      }, 1000);
      
      const allSolved = gameState.correctWords.every(correct => correct) && 
                       gameState.correctWords[gameState.currentClue];
      
      if (allSolved) {
        setGameState(prev => ({ ...prev, gameStatus: 'won' }));
      }
    } else {
      const newClueGuesses = [...gameState.clueGuesses];
      
      Array.from(guessedWord).forEach((letter, idx) => {
        if (currentWord[idx] !== letter) {
          newClueGuesses[gameState.currentClue][idx] = '';
        }
      });
      
      const hasMatchingLetters = Array.from(guessedWord).some(letter => 
        gameState.clueWords.some(clueWord => clueWord.includes(letter))
      );
      
      const flashColor = hasMatchingLetters ? 'yellow' : 'red';
      const newUsedLetters = new Set(gameState.usedLetters);
      const newAvailableLetters = new Set(gameState.availableLetters);
      
      Array.from(guessedWord).forEach(letter => {
        if (gameState.clueWords.some(clueWord => clueWord.includes(letter))) {
          newAvailableLetters.add(letter);
        } else {
          newUsedLetters.add(letter);
          newAvailableLetters.delete(letter);
        }
      });
      
      setGameState(prev => ({
        ...prev,
        flashingLetters: Array.from(guessedWord).map((_, i) => ({ 
          clue: gameState.currentClue, 
          position: i, 
          color: flashColor 
        })),
        lives: prev.lives - 1,
        usedLetters: newUsedLetters,
        availableLetters: newAvailableLetters,
        clueGuesses: newClueGuesses
      }));
      
      setTimeout(() => {
        setGameState(prev => ({ ...prev, flashingLetters: [] }));
      }, 1000);
      
      if (gameState.lives - 1 <= 0) {
        setGameState(prev => ({ ...prev, gameStatus: 'lost' }));
      }
    }
  };

  const navigateClue = (direction) => {
    if (direction === 'up' && gameState.currentClue > 0) {
      setGameState(prev => ({ ...prev, currentClue: prev.currentClue - 1, currentPosition: 0 }));
    } else if (direction === 'down' && gameState.currentClue < 2) {
      setGameState(prev => ({ ...prev, currentClue: prev.currentClue + 1, currentPosition: 0 }));
    } else if (direction === 'left' && gameState.currentPosition > 0) {
      setGameState(prev => ({ ...prev, currentPosition: prev.currentPosition - 1 }));
    } else if (direction === 'right') {
      const maxPosition = gameState.clueWords[gameState.currentClue].length - 1;
      if (gameState.currentPosition < maxPosition) {
        setGameState(prev => ({ ...prev, currentPosition: prev.currentPosition + 1 }));
      }
    }
  };

  useEffect(() => {
    if (!isActive || !virtualKeyboardInput) return;

    const { type, value } = virtualKeyboardInput;
    
    if (type === 'letter') {
      addLetterToCurrentPosition(value);
    } else if (type === 'enter') {
      handleEnterKey();
    } else if (type === 'backspace') {
      removeLetterFromCurrentPosition();
    } else if (type === 'clear') {
      if (gameState.pendingAdditionalLetters.length > 0) {
        setGameState(prev => ({ ...prev, pendingAdditionalLetters: [] }));
      } else {
        const newClueGuesses = [...gameState.clueGuesses];
        newClueGuesses[gameState.currentClue] = new Array(gameState.clueWords[gameState.currentClue].length).fill('');
        setGameState(prev => ({
          ...prev,
          clueGuesses: newClueGuesses,
          currentPosition: 0
        }));
      }
    }
  }, [virtualKeyboardInput, isActive, gameState.currentClue, gameState.currentPosition]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateClue('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateClue('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateClue('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateClue('right');
      } else if (/^[A-Za-z]$/.test(e.key)) {
        e.preventDefault();
        addLetterToCurrentPosition(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEnterKey();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeLetterFromCurrentPosition();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (gameState.pendingAdditionalLetters.length > 0) {
          setGameState(prev => ({ ...prev, pendingAdditionalLetters: [] }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, gameState.currentClue, gameState.currentPosition, gameState.pendingAdditionalLetters]);

  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange(gameState);
    }
    window.gameState = gameState;
  }, [gameState, onGameStateChange]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute left-4 top-32 pointer-events-auto">
        <div className="space-y-6">
          {gameState.clueWords.map((word, clueIndex) => (
            <div key={clueIndex} className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {Array.from(word).map((_, letterIndex) => {
                  const isCurrentPosition = gameState.currentClue === clueIndex && gameState.currentPosition === letterIndex;
                  const isRevealed = gameState.clueRevealed?.[clueIndex]?.[letterIndex];
                  const userLetter = gameState.clueGuesses?.[clueIndex]?.[letterIndex] || '';
                  const isNewlyRevealed = gameState.newlyRevealed?.[clueIndex]?.[letterIndex];
                  const isWordComplete = gameState.correctWords[clueIndex];
                  const flashingLetter = gameState.flashingLetters?.find(
                    (fl) => fl.clue === clueIndex && fl.position === letterIndex
                  );

                  return (
                    <div
                      key={letterIndex}
                      onClick={() => handleClickPosition(clueIndex, letterIndex)}
                      className={`w-8 h-8 flex items-center justify-center text-lg font-bold transition-all duration-300 cursor-pointer relative ${
                        isCurrentPosition 
                          ? 'bg-purple-100 dark:bg-purple-900 animate-pulse' 
                          : isNewlyRevealed
                          ? 'bg-green-100 animate-bounce' 
                          : isWordComplete
                          ? 'bg-green-200'
                          : isRevealed 
                          ? '' 
                          : userLetter
                          ? 'bg-blue-50 dark:bg-blue-900' 
                          : 'hover:bg-gray-100'
                      } ${
                        flashingLetter 
                          ? `animate-pulse ${
                              flashingLetter.color === 'green' ? 'bg-green-200' :
                              flashingLetter.color === 'yellow' ? 'bg-yellow-200' :
                              'bg-red-200'
                            }` 
                          : ''
                      }`}
                      style={{ fontFamily: 'Indie Flower, cursive' }}
                    >
                      {/* Letter or dash */}
                      <span className={`font-bold text-2xl ${
                        isWordComplete 
                          ? 'text-green-800' 
                          : isRevealed
                          ? 'text-black dark:text-white'
                          : userLetter
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-black'
                      }`}>
                        {userLetter || '_'}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div 
                onClick={() => setGameState(prev => ({
                  ...prev,
                  showHints: prev.showHints.map((show, idx) => 
                    idx === clueIndex ? !show : show
                  )
                }))}
                className="text-3xl font-bold text-black dark:text-white ml-4 cursor-pointer hover:text-blue-600 transition-colors"
              >
                {tutorialWords.numbers_for_clue[clueIndex]}
                {gameState.showHints[clueIndex] && (
                  <span className="text-sm ml-2 text-green-500">
                    {clueIndex === 0 ? '{F,S}' : clueIndex === 1 ? '{A,O}' : '{D,F}'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="flex gap-2">
          {gameState.startingLetters.map((letter, index) => {
            const isCorrect = gameState.clueWords.some(word => word.includes(letter));
            return (
              <button 
                key={index} 
                className={`w-12 h-12 rounded-full font-semibold text-lg transition-all duration-150 transform shadow-lg flex items-center justify-center ${
                  isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
        
        {(gameState.additionalLetters.length > 0 || gameState.pendingAdditionalLetters.length > 0) && (
          <div className="flex gap-2 mt-2">
            {gameState.additionalLetters.map((letter, index) => {
              const isCorrect = gameState.clueWords.some(word => word.includes(letter));
              return (
                <button 
                  key={index} 
                  className={`w-12 h-12 rounded-full font-semibold text-lg transition-all duration-150 transform shadow-lg flex items-center justify-center ${
                    isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
            
            {gameState.pendingAdditionalLetters.map((letter, index) => (
              <button 
                key={`pending-${index}`}
                className="w-12 h-12 rounded-full font-semibold text-lg transition-all duration-150 transform shadow-lg flex items-center justify-center bg-purple-500 text-white hover:bg-purple-600"
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {gameState.pendingAdditionalLetters.length > 0 && (
          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 max-w-48">
            Press Enter to confirm {gameState.pendingAdditionalLetters.join(', ')} or Escape to cancel
          </div>
        )}
      </div>

      {gameState.gameStatus === 'won' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto">
          <div className="bg-green-100 p-8 rounded-lg text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Congratulations!</h2>
            <p className="mb-6 text-lg">You have completed the tutorial!</p>
            <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 font-semibold">
              <Link href="/play">Play Game</Link>
            </button>
          </div>
        </div>
      )}

      {gameState.gameStatus === 'lost' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto">
          <div className="bg-red-100 p-8 rounded-lg text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-red-800 mb-4">Game Over!</h2>
            <p className="mb-6 text-lg">You have run out of lives.</p>
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 font-semibold">
              Replay Tutorial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}