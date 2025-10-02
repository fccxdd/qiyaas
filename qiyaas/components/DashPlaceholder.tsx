// components/DashPlaceholder.tsx

"use client"

import React, { useState, useEffect } from 'react';
import tutorialWords from '@/data/tutorial_words.json';
import words from '@/data/wordsList';

interface DashPlaceholderProps {
  startingLetters?: string[];
  isGameActive?: boolean;
  onLetterStatesChange?: (letterStates: { [key: string]: 'purple' | 'green' | 'red' | 'yellow' | 'grey' }) => void;
  onLifeLost?: () => void;
  onGameWon?: () => void;
  onGameLost?: () => void;
  onShowMessage?: (message: string, type: string) => void;  
}

const DashPlaceholder: React.FC<DashPlaceholderProps> = ({ 
  startingLetters = [],
  isGameActive = false,
  onLetterStatesChange,
  onLifeLost,
  onGameWon,
  onGameLost,
  onShowMessage
}) => {
  // Enhanced game state
  const [gameState, setGameState] = useState({
    clueWords: [
      tutorialWords.clue_1.toUpperCase(),
      tutorialWords.clue_2.toUpperCase(), 
      tutorialWords.clue_3.toUpperCase()
    ],
    currentClue: 0,
    currentPosition: 0,
    clueRevealed: [[], [], []] as boolean[][],
    clueGuesses: [[], [], []] as string[][],
    newlyRevealed: [[], [], []] as boolean[][],
    correctWords: [false, false, false],
    flashingLetters: [] as Array<{clue: number; position: number; color: string}>,
    lives: 5,
    gameStatus: 'playing' as 'playing' | 'won' | 'lost',
    letterStates: {} as { [key: string]: 'purple' | 'green' | 'red' | 'yellow' | 'grey' },
    isRevealing: false,
    invalidWordMessage: '' as string,
    shakingClue: -1 as number,
    additionalLetters: [] as string[], // Stack of additional letters [vowel, consonant]
    maxAdditionalLetters: 2, // 1 vowel + 1 consonant
    additionalLettersUsed: false, // Track if additional letters were used
    cluesUnlocked: [false, false, false], // Track which clues are fully unlocked
    gamePhase: 'starting' as 'starting' | 'additional' | 'unlocked' // Track game progression
  });

  // Word list for validation
  const [wordsList, setWordsList] = useState<Set<string>>(new Set());

  // Vowels and consonants for additional letter validation
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

  // Use the parent's showMessage function
  const showMessage = (message: string, type: string) => {
    if (onShowMessage) {
      onShowMessage(message, type);
    }
  };

  // Load words list on component mount
  useEffect(() => {
    const wordSet = new Set(words.map((w) => w.toUpperCase()));
    setWordsList(wordSet);
    console.log(`Loaded ${wordSet.size} words for validation`);
  }, []);

  // Validate word against word list
  const isValidWord = (word: string): boolean => {
    return wordsList.has(word.toUpperCase());
  };

  // Check if clue has starting letters
  const clueHasStartingLetters = (clueIndex: number): boolean => {
    return startingLetters.some(letter => 
      gameState.clueWords[clueIndex].includes(letter.toUpperCase())
    );
  };

  // Check if clue is unlocked (has starting letters OR is fully unlocked)
  const isClueUnlocked = (clueIndex: number): boolean => {
    return clueHasStartingLetters(clueIndex) || gameState.cluesUnlocked[clueIndex];
  };

  // Initialize game when starting letters are provided
  useEffect(() => {
    if (startingLetters.length === 4 && isGameActive) {
      const clueWords = [
        tutorialWords.clue_1.toUpperCase(),
        tutorialWords.clue_2.toUpperCase(), 
        tutorialWords.clue_3.toUpperCase()
      ];

      // Initialize arrays
      const newClueGuesses = clueWords.map(word => new Array(word.length).fill(''));
      const newClueRevealed = clueWords.map(word => new Array(word.length).fill(false));
      const newlyRevealed = clueWords.map(word => new Array(word.length).fill(false));

      setGameState(prev => {
        const newState = Object.assign({}, prev);
        newState.clueWords = clueWords;
        newState.clueGuesses = newClueGuesses;
        newState.clueRevealed = newClueRevealed;
        newState.newlyRevealed = newlyRevealed;
        newState.isRevealing = true;
        newState.currentClue = 0;
        newState.currentPosition = 0;
        newState.gamePhase = 'starting';
        return newState;
      });

      // Animate revealing starting letters one by one
      revealStartingLettersAnimated(startingLetters, clueWords, newClueGuesses, newClueRevealed, newlyRevealed);
    }
  }, [startingLetters, isGameActive]);

  const revealStartingLettersAnimated = async (
    letters: string[], 
    clueWords: string[], 
    clueGuesses: string[][], 
    clueRevealed: boolean[][], 
    newlyRevealed: boolean[][]
  ) => {
    // Find all positions for each letter
    const letterPositions: Array<{clue: number; pos: number; letter: string}> = [];
    
    letters.forEach(letter => {
      clueWords.forEach((word, clueIndex) => {
        for (let i = 0; i < word.length; i++) {
          if (word[i] === letter.toUpperCase()) {
            letterPositions.push({ clue: clueIndex, pos: i, letter: letter.toUpperCase() });
          }
        }
      });
    });

    // Animate each position with green flash
    for (let i = 0; i < letterPositions.length; i++) {
      const { clue, pos, letter } = letterPositions[i];
      
      // Flash green
      setGameState(prev => {
        const newState = Object.assign({}, prev);
        newState.flashingLetters = [{ clue, position: pos, color: 'green' }];
        return newState;
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reveal letter
      clueGuesses[clue][pos] = letter;
      clueRevealed[clue][pos] = true;
      newlyRevealed[clue][pos] = true;
      
      setGameState(prev => {
        const newState = Object.assign({}, prev);
        newState.clueGuesses = [...clueGuesses];
        newState.clueRevealed = [...clueRevealed];
        newState.newlyRevealed = [...newlyRevealed];
        newState.flashingLetters = [];
        return newState;
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Mark initial letters as green in keyboard
    const initialLetterStates: { [key: string]: 'purple' | 'green' | 'red' | 'yellow' | 'grey' } = {};
    letters.forEach(letter => {
      initialLetterStates[letter.toUpperCase()] = 'green';
    });
    
    // Find first clue with starting letters and position cursor there
    let initialClue = 0;
    let initialPosition = 0;
    
    for (let clueIndex = 0; clueIndex < clueWords.length; clueIndex++) {
      if (clueHasStartingLetters(clueIndex)) {
        initialClue = clueIndex;
        // Find first unrevealed position
        for (let pos = 0; pos < clueWords[clueIndex].length; pos++) {
          if (!clueRevealed[clueIndex][pos]) {
            initialPosition = pos;
            break;
          }
        }
        break;
      }
    }
    
    setGameState(prev => {
      const newState = Object.assign({}, prev);
      newState.letterStates = initialLetterStates;
      newState.isRevealing = false;
      newState.currentClue = initialClue;
      newState.currentPosition = initialPosition;
      newState.gamePhase = 'additional';
      return newState;
    });
    
    onLetterStatesChange?.(initialLetterStates);

    // Remove green animation after delay
    setTimeout(() => {
      setGameState(prev => {
        const newState = Object.assign({}, prev);
        newState.newlyRevealed = prev.clueWords.map(word => new Array(word.length).fill(false));
        return newState;
      });
    }, 1000);
  };

  // Handle additional letter selection (stacked like starting letters)
  const addAdditionalLetter = (letter: string) => {
    const currentVowels = gameState.additionalLetters.filter(l => vowels.includes(l)).length;
    const currentConsonants = gameState.additionalLetters.filter(l => consonants.includes(l)).length;
    
    if (vowels.includes(letter) && currentVowels >= 1) {
      showMessage('Only 1 additional vowel allowed', 'error');
      return;
    }
    
    if (consonants.includes(letter) && currentConsonants >= 1) {
      showMessage('Only 1 additional consonant allowed', 'error');
      return;
    }
    
    if (gameState.additionalLetters.length >= 2) {
      showMessage('Maximum additional letters reached', 'error');
      return;
    }

    const newAdditionalLetters = [...gameState.additionalLetters, letter];
    
    setGameState(prev => {
      const newState = Object.assign({}, prev);
      newState.additionalLetters = newAdditionalLetters;
      return newState;
    });

    // If we have 2 additional letters, reveal them and unlock remaining clues
    if (newAdditionalLetters.length === 2) {
      revealAdditionalLetters(newAdditionalLetters);
    }
  };

  const revealAdditionalLetters = async (additionalLetters: string[]) => {
    const updatedLetterStates = Object.assign({}, gameState.letterStates);
    let foundAnyLetters = false;

    // Check if any additional letters exist in the puzzle
    for (const letter of additionalLetters) {
      const letterExistsInPuzzle = gameState.clueWords.some(word => word.includes(letter));
      
      if (letterExistsInPuzzle) {
        foundAnyLetters = true;
        updatedLetterStates[letter] = 'green';
        
        // Reveal all instances of this letter
        const newClueGuesses = [...gameState.clueGuesses];
        const newClueRevealed = [...gameState.clueRevealed];
        const newlyRevealed = [...gameState.newlyRevealed];
        
        gameState.clueWords.forEach((word, clueIndex) => {
          for (let pos = 0; pos < word.length; pos++) {
            if (word[pos] === letter) {
              newClueGuesses[clueIndex][pos] = letter;
              newClueRevealed[clueIndex][pos] = true;
              newlyRevealed[clueIndex][pos] = true;
            }
          }
        });
        
        setGameState(prev => {
          const newState = Object.assign({}, prev);
          newState.clueGuesses = newClueGuesses;
          newState.clueRevealed = newClueRevealed;
          newState.newlyRevealed = newlyRevealed;
          newState.letterStates = updatedLetterStates;
          newState.additionalLettersUsed = true;
          return newState;
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        updatedLetterStates[letter] = 'red';
      }
    }

    // If no additional letters were found, unlock all remaining clues
    if (!foundAnyLetters) {
      unlockAllClues();
    }

    setGameState(prev => {
      const newState = Object.assign({}, prev);
      newState.letterStates = updatedLetterStates;
      newState.gamePhase = 'unlocked';
      return newState;
    });
    
    onLetterStatesChange?.(updatedLetterStates);
  };

  const unlockAllClues = () => {
    console.log('Unlocking all clues - no additional letters found');
    
    setGameState(prev => {
      const newState = Object.assign({}, prev);
      newState.cluesUnlocked = [true, true, true];
      newState.gamePhase = 'unlocked';
      return newState;
    });
  };

  // Handle keyboard input
  useEffect(() => {
    if (!isGameActive || gameState.isRevealing) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // If in additional letter phase and we haven't used additional letters yet
      if (gameState.gamePhase === 'additional' && !gameState.additionalLettersUsed) {
        if (/^[A-Za-z]$/.test(e.key)) {
          e.preventDefault();
          addAdditionalLetter(e.key.toUpperCase());
          return;
        }
      }

      // Navigation and letter input for unlocked clues
      if (e.key === 'ArrowUp' && gameState.currentClue > 0) {
        e.preventDefault();
        // Find previous unlocked clue
        for (let clueIndex = gameState.currentClue - 1; clueIndex >= 0; clueIndex--) {
          if (isClueUnlocked(clueIndex)) {
            setGameState(prev => {
              const newState = Object.assign({}, prev);
              newState.currentClue = clueIndex;
              newState.currentPosition = 0;
              return newState;
            });
            break;
          }
        }
      } else if (e.key === 'ArrowDown' && gameState.currentClue < 2) {
        e.preventDefault();
        // Find next unlocked clue
        for (let clueIndex = gameState.currentClue + 1; clueIndex < gameState.clueWords.length; clueIndex++) {
          if (isClueUnlocked(clueIndex)) {
            setGameState(prev => {
              const newState = Object.assign({}, prev);
              newState.currentClue = clueIndex;
              newState.currentPosition = 0;
              return newState;
            });
            break;
          }
        }
      } else if (e.key === 'ArrowLeft' && gameState.currentPosition > 0) {
        e.preventDefault();
        setGameState(prev => {
          const newState = Object.assign({}, prev);
          newState.currentPosition = prev.currentPosition - 1;
          return newState;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const maxPosition = gameState.clueWords[gameState.currentClue].length - 1;
        if (gameState.currentPosition < maxPosition) {
          setGameState(prev => {
            const newState = Object.assign({}, prev);
            newState.currentPosition = prev.currentPosition + 1;
            return newState;
          });
        }
      } else if (/^[A-Za-z]$/.test(e.key) && gameState.gamePhase === 'unlocked') {
        e.preventDefault();
        addLetterToPosition(e.key.toUpperCase());
      } else if (e.key === 'Enter') {
        e.preventDefault();
        guessWord();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeLetter();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameActive, gameState.currentClue, gameState.currentPosition, gameState.isRevealing, gameState.gamePhase, gameState.additionalLettersUsed]);

  const addLetterToPosition = (letter: string) => {
    const { currentClue, currentPosition, correctWords, clueRevealed } = gameState;
    if (correctWords[currentClue] || clueRevealed[currentClue][currentPosition]) return;

    const newClueGuesses = [...gameState.clueGuesses];
    newClueGuesses[currentClue][currentPosition] = letter;
    
    const updatedLetterStates = Object.assign({}, gameState.letterStates);
    updatedLetterStates[letter] = 'purple';
    
    setGameState(prev => {
      const newState = Object.assign({}, prev);
      newState.clueGuesses = newClueGuesses;
      newState.letterStates = updatedLetterStates;
      newState.currentPosition = Math.min(currentPosition + 1, gameState.clueWords[currentClue].length - 1);
      return newState;
    });
    
    onLetterStatesChange?.(updatedLetterStates);
  };

  const removeLetter = () => {
    const { currentClue, currentPosition, correctWords } = gameState;
    if (correctWords[currentClue]) return;

    const newClueGuesses = [...gameState.clueGuesses];
    newClueGuesses[currentClue][currentPosition] = '';
    
    setGameState(prev => {
      const newState = Object.assign({}, prev);
      newState.clueGuesses = newClueGuesses;
      return newState;
    });
  };

  const guessWord = () => {
    const { currentClue, clueGuesses, clueWords, letterStates } = gameState;
    const currentGuessArray = clueGuesses[currentClue];
    const guessedWord = currentGuessArray.join('');
    const correctWord = clueWords[currentClue];
    
    // Check for empty positions
    const hasEmptyPositions = currentGuessArray.some(letter => letter === '' || letter === null || letter === undefined);
    
    if (currentGuessArray.length !== correctWord.length || hasEmptyPositions) {
      console.log('Word not complete');
      showMessage('Word not complete', 'error');
      return;
    }

    // Check if word is valid
    if (!isValidWord(guessedWord)) {
      console.log('Invalid word');
      showMessage('Not a playable word', 'error');
      
      setGameState(prev => {
        const newState = Object.assign({}, prev);
        newState.invalidWordMessage = `"${guessedWord}" is not a valid word!`;
        newState.shakingClue = currentClue;
        newState.flashingLetters = Array.from(guessedWord).map((_, i) => ({ 
          clue: currentClue, 
          position: i, 
          color: 'red' 
        }));
        return newState;
      });
      
      setTimeout(() => {
        setGameState(prev => {
          const newState = Object.assign({}, prev);
          newState.invalidWordMessage = '';
          newState.shakingClue = -1;
          newState.flashingLetters = [];
          return newState;
        });
      }, 2000);
      
      return;
    }
    
    const updatedLetterStates = Object.assign({}, letterStates);
    
    if (guessedWord === correctWord) {
      console.log('Correct word!');
      showMessage('Correct!', 'success');
      
      const newCorrectWords = [...gameState.correctWords];
      newCorrectWords[currentClue] = true;
      
      Array.from(guessedWord).forEach(letter => {
        updatedLetterStates[letter] = 'green';
      });
      
      setGameState(prev => {
        const newState = Object.assign({}, prev);
        newState.correctWords = newCorrectWords;
        newState.letterStates = updatedLetterStates;
        newState.flashingLetters = Array.from(guessedWord).map((_, i) => ({ 
          clue: currentClue, 
          position: i, 
          color: 'green' 
        }));
        return newState;
      });

      if (newCorrectWords.every(word => word === true)) {
        setTimeout(() => {
          onGameWon?.();
        }, 1500);
      }

      setTimeout(() => {
        setGameState(prev => {
          const newState = Object.assign({}, prev);
          newState.flashingLetters = [];
          return newState;
        });
      }, 1000);
      
    } else {
      console.log('Wrong word!');
      
      // Wrong word logic
      const hasCorrectPositions = Array.from(guessedWord).some((letter, i) => 
        correctWord[i] === letter
      );
      
      const hasLettersInOtherWords = Array.from(guessedWord).some(letter =>
        gameState.clueWords.some(word => word.includes(letter))
      );
      let flashColor = 'red';
      let message = 'Wrong Word';
      
      // TODO: Delete This, we don't need almost logic anymore
      if (hasCorrectPositions || hasLettersInOtherWords) {
        flashColor = 'yellow';
        message = 'Almost...';
      }
      
      showMessage(message, flashColor === 'yellow' ? 'warning' : 'error');
      
      Array.from(guessedWord).forEach(letter => {
        if (gameState.clueWords.some(word => word.includes(letter))) {
          updatedLetterStates[letter] = 'yellow';
        } else {
          updatedLetterStates[letter] = 'red';
        }
      });
      
      
      const newClueGuesses = [...gameState.clueGuesses];
      for (let i = 0; i < guessedWord.length; i++) {
        if (guessedWord[i] !== correctWord[i]) {
          newClueGuesses[currentClue][i] = '';
        }
      }
      
      setGameState(prev => {
        const newState = Object.assign({}, prev);
        newState.clueGuesses = newClueGuesses;
        newState.letterStates = updatedLetterStates;
        newState.flashingLetters = Array.from(guessedWord).map((_, i) => ({ 
          clue: currentClue, 
          position: i, 
          color: flashColor 
        }));
        newState.currentPosition = 0;
        return newState;
      });
      
      if (onLifeLost) {
        onLifeLost();
      }
      
      setTimeout(() => {
        setGameState(prev => {
          const newState = Object.assign({}, prev);
          newState.flashingLetters = [];
          return newState;
        });
      }, 1000);
    }
    
    onLetterStatesChange?.(updatedLetterStates);
  };

  const handleClickPosition = (clueIndex: number, letterIndex: number) => {
    if (gameState.correctWords[clueIndex] || gameState.isRevealing) return;
    
    // Only allow clicking on unlocked clues
    if (!isClueUnlocked(clueIndex)) return;
    
    setGameState(prev => {
      const newState = Object.assign({}, prev);
      newState.currentClue = clueIndex;
      newState.currentPosition = letterIndex;
      return newState;
    });
  };
  
  // Show game if active and has starting letters
  if (isGameActive && startingLetters.length > 0) {
    return (
      <div>
        
        <div className="w-1/4 flex flex-col justify-center items-start pl-20">
          {/* Additional Letters Display */}
          {gameState.gamePhase === 'additional' && !gameState.additionalLettersUsed && (
            <div className="mb-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Additional letters ({gameState.additionalLetters.length}/2):
              </div>
              <div className="flex gap-2">
                {gameState.additionalLetters.map((letter, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Type 1 vowel + 1 consonant
              </div>
            </div>
          )}

          <div className="space-y-8">
            {gameState.clueWords.map((word: string, clueIndex: number) => {
              const isUnlocked = isClueUnlocked(clueIndex);

              // If clue is not unlocked, show single interactive dash
              if (!isUnlocked) {
                const isCurrentClue = gameState.currentClue === clueIndex;
                return (
                  <div 
                    key={clueIndex} 
                    className={`cursor-pointer ${isCurrentClue ? 'bg-purple-100 dark:bg-purple-900' : ''}`}
                    onClick={() => handleClickPosition(clueIndex, 0)}
                  >
                    <div className="text-4xl font-bold text-black dark:text-white" style={{ fontFamily: 'Indie Flower, cursive' }}>
                      _
                    </div>
                  </div>
                );
              }

              // If clue is unlocked, show full word structure
              return (
                <div key={clueIndex} className="flex space-x-2">
                  {Array.from(word).map((_, letterIndex: number) => {
                    const isCurrentPosition = gameState.currentClue === clueIndex && gameState.currentPosition === letterIndex;
                    const isRevealed = gameState.clueRevealed[clueIndex]?.[letterIndex] || false;
                    const userLetter = gameState.clueGuesses[clueIndex]?.[letterIndex] || '';
                    const isNewlyRevealed = gameState.newlyRevealed[clueIndex]?.[letterIndex] || false;
                    const isWordComplete = gameState.correctWords[clueIndex] || false;
                    const flashingLetter = gameState.flashingLetters.find(
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
                        <span className={`font-bold text-4xl ${
                          isWordComplete 
                            ? 'text-4xl font-bold text-green-800' 
                            : isRevealed
                            ? 'text-4xl font-bold text-black dark:text-white'
                            : userLetter
                            ? 'text-4xl font-bold text-purple-600 dark:text-purple-400'
                            : 'text-4xl font-bold text-black dark:text-white'
                        }`}>
                          {userLetter || '_'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          
          {/* Game Phase Indicator */}
          <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
            Phase: {gameState.gamePhase} | Unlocked: {gameState.cluesUnlocked.filter(Boolean).length}/3
          </div>
        </div>
        </div>
    );
  }

  // Default tutorial view - just 3 simple dashes
  return (
    <div className="w-1/4 flex flex-col justify-center items-start pl-20">
      <div className="space-y-8">
        <div className="text-4xl font-bold text-black dark:text-white" style={{ fontFamily: 'Indie Flower, cursive' }}>
          _
        </div>
        <div className="text-4xl font-bold text-black dark:text-white" style={{ fontFamily: 'Indie Flower, cursive' }}>
          _
        </div>
        <div className="text-4xl font-bold text-black dark:text-white" style={{ fontFamily: 'Indie Flower, cursive' }}>
          _
        </div>
        
      </div>
    </div>
  )
};

export default DashPlaceholder;