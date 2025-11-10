// components/game_assets/word_clues/ClueWords.tsx

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import WordDash from './WordDash';
import { useClueManagement } from '@/hooks/clues/useClueManagement';
import { useCursorNavigation } from '@/hooks/clues/useCursorNavigation';
import { useWordValidation } from '@/hooks/clues/useWordValidation';
import { isWordComplete, findNextEmptyPosition } from '@/hooks/clues/clueHelpers';
import { useWinCondition } from '@/hooks/game_wins/useWinCondition';
import { GameConfig } from '@/lib/gameConfig';
import { BaseCluesData, normalizeCluesData } from '@/hooks/clues/clueTypes';

interface ClueWordsProps {
  clues: BaseCluesData;
  selectedStartingLetters: string;
  additionalLetters?: { vowel?: string; consonants?: string[] };
  onLifeLost: () => void;
  onWin: () => void;
  onShowMessage: (msg: string, type?: 'error' | 'success' | 'info') => void;
  isMessageActive: boolean;
  awaitingAdditionalLetter?: boolean;
  onWordInputsChange?: (inputs: Map<string, string>) => void;
  onVerifiedPositionsChange?: (verified: Map<string, string>) => void;
  bothAdditionalLettersConfirmed?: boolean;
}

export default function ClueWords({ 
  clues, 
  selectedStartingLetters,
  additionalLetters = {},
  onLifeLost,
  onWin,
  onShowMessage,
  isMessageActive,
  awaitingAdditionalLetter = false,
  onWordInputsChange,
  onVerifiedPositionsChange,
  bothAdditionalLettersConfirmed = false
}: ClueWordsProps) {

  // Add shake state
  const [shakeWord, setShakeWord] = useState<string | null>(null);
  
  // Track ALL letters that have ever been guessed (for keyboard tracking)
  const [allGuessedLetters, setAllGuessedLetters] = useState<Set<string>>(new Set());

  // Extract word strings from clues for internal use
  const clueWords = useMemo(() => normalizeCluesData(clues), [clues]);

  // Combine starting letters with additional letters for validation
  const allAvailableLetters = useMemo(() => {
    let letters = selectedStartingLetters;
    if (additionalLetters.vowel) {
      letters += additionalLetters.vowel;
    }
    if (additionalLetters.consonants && additionalLetters.consonants.length > 0) {
      letters += additionalLetters.consonants.join('');
    }
    return letters;
  }, [selectedStartingLetters, additionalLetters]);

  // Check if user has used any additional letters
  const hasUsedAdditionalLetters = !!(
    additionalLetters.vowel || 
    (additionalLetters.consonants && additionalLetters.consonants.length > 0)
  );
  
  // Check if BOTH additional letters have been guessed (for GamePlay mode with multiple consonants)
  const bothAdditionalLettersGuessed = useMemo(() => {
    const hasVowel = !!additionalLetters.vowel;
    const hasConsonants = additionalLetters.consonants && additionalLetters.consonants.length > 0;
    return hasVowel && hasConsonants;
  }, [additionalLetters]);
  
  // bothAdditionalLettersConfirmed is now "hasAnyCorrectAdditionalLetter" from parent
  const hasAnyCorrectAdditionalLetter = bothAdditionalLettersConfirmed;

  // Manage clues state - now using extracted word strings
  const {
    activeClues,
    userInputs,
    setUserInputs,
    flashStates,
    setFlashStates,
    completedWords,
    setCompletedWords,
    startingLettersSet
  } = useClueManagement(clueWords, allAvailableLetters);

  // Track verified positions (letters that were confirmed correct after Enter)
  const [verifiedPositions, setVerifiedPositions] = useState<Map<string, Set<number>>>(new Map());

  // Check if starting letters appear in any of the clues
  const startingLettersMatchClues = useMemo(() => {
    if (!selectedStartingLetters) return false;
    
    const startingLettersArray = selectedStartingLetters.toUpperCase().split('');
    
    // Check each clue to see if any starting letter appears in it
    return activeClues.some(clue => {
      const clueUpper = clue.toUpperCase();
      return startingLettersArray.some(letter => clueUpper.includes(letter));
    });
  }, [selectedStartingLetters, activeClues]);

  // Determine if words should be locked
  // Words are locked if: starting letters don't match ANY clues AND user hasn't used additional letters
  const areWordsLocked = !startingLettersMatchClues && !hasUsedAdditionalLetters;

  // Track if we've already lost a life for no starting letters
  const [hasLostLifeForNoStartingLetters, setHasLostLifeForNoStartingLetters] = useState(false);

  // Lose a life if no starting letters match any clues (only trigger once per round)
  useEffect(() => {
    if (!startingLettersMatchClues && !hasLostLifeForNoStartingLetters && selectedStartingLetters) {
      // Delay slightly to allow UI to render before losing life
      const timeoutId = setTimeout(() => {
        onLifeLost();
        onShowMessage(GameConfig.messages.noStartingLettersMatch);
        setHasLostLifeForNoStartingLetters(true);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [startingLettersMatchClues, hasLostLifeForNoStartingLetters, selectedStartingLetters, onLifeLost, onShowMessage]);

  // Reset the life loss flag when starting letters change (new round)
  useEffect(() => {
    setHasLostLifeForNoStartingLetters(false);
  }, [selectedStartingLetters]);

  // Convert completedWords Set to solvedClues Set of indices
  const solvedClues = new Set<number>();
  activeClues.forEach((clue, index) => {
    if (completedWords.has(clue)) {
      solvedClues.add(index);
    }
  });

  // Use win condition hook - now using extracted word strings
  useWinCondition({
    cluesData: clueWords,
    solvedClues,
    onWin,
    isGameOver: false
  });

  // Manage cursor navigation
  const {
    cursorPosition,
    setCursorPosition,
    findNextIncompleteWord,
    moveToNextPosition,
    moveToPreviousPosition,
    moveToClueAbove,
    moveToClueBelow
  } = useCursorNavigation(
    activeClues, 
    userInputs, 
    completedWords, 
    verifiedPositions, 
    selectedStartingLetters,
    hasAnyCorrectAdditionalLetter
  );

  // Handle word validation
  const { submitWord } = useWordValidation(
    userInputs,
    setUserInputs,
    setFlashStates,
    setCompletedWords,
    setCursorPosition,
    findNextIncompleteWord,
    startingLettersSet,
    onLifeLost,
    verifiedPositions,
    setVerifiedPositions,
    onShowMessage,
    setShakeWord,
    setAllGuessedLetters
  );

  // Extract word types
  const wordTypes = [clues.clue_1.type, clues.clue_2.type, clues.clue_3.type];

  // Handle additional letters being auto-filled
  const handleAdditionalLettersFilled = useCallback((clue: string, clueIndex: number, filledPositions: Map<number, string>) => {
    // CRITICAL FIX: Don't update if word is already completed
    if (completedWords.has(clue)) {
      console.log('⏭️ Word is already completed:', clue, '- skipping additional letter fill to preserve completion');
      return;
    }
    
    console.log('🎨 Additional letters filled for clue:', clue, 'positions:', filledPositions);
    
    // Update userInputs with the filled positions SYNCHRONOUSLY
    setUserInputs(prev => {
      const currentWordInputs = prev.get(clue) || new Map();
      const newWordInputs = new Map(currentWordInputs);
      
      // Add all filled positions
      filledPositions.forEach((letter, position) => {
        newWordInputs.set(position, letter);
      });
      
      console.log('📝 Updated word inputs for', clue, ':', newWordInputs);
      
      return new Map(prev).set(clue, newWordInputs);
    });

    // NO AUTO-SUBMIT - User must press Enter even if word is complete and correct
    // This is because they might have typed some letters manually
  }, [completedWords, setUserInputs]);

  // When additional letters are validated, let WordDash auto-fill them
  // but DON'T auto-submit - user must press Enter
  useEffect(() => {
    if (hasAnyCorrectAdditionalLetter) {
      console.log('🔍 Additional letter validated - WordDash will auto-fill but user must press Enter');
    }
  }, [hasAnyCorrectAdditionalLetter]);

  // Flatten all userInputs into a single Map for keyboard tracking
  // This converts Map<word, Map<position, letter>> to Map<position_key, letter>
  useEffect(() => {
    if (onWordInputsChange) {
      // Small delay to prevent flashing during word validation animations
      const timeoutId = setTimeout(() => {
        const flattenedInputs = new Map<string, string>();
        
        activeClues.forEach((clue, clueIndex) => {
          const wordInputs = userInputs.get(clue);
          if (wordInputs) {
            wordInputs.forEach((letter, position) => {
              // Create unique key: "clue0-pos2" for clue 0, position 2
              const key = `clue${clueIndex}-pos${position}`;
              flattenedInputs.set(key, letter);
            });
          }
        });
        
        onWordInputsChange(flattenedInputs);
      }, 50); // 50ms delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [userInputs, activeClues, onWordInputsChange]);

  // Track verified positions (letters confirmed correct after pressing Enter)
  // ALSO track all guessed letters (even wrong ones) so keyboard knows about them
  useEffect(() => {
    if (onVerifiedPositionsChange) {
      const flattenedVerified = new Map<string, string>();
      
      // Only send verified positions if words are NOT locked
      if (!areWordsLocked) {
        activeClues.forEach((clue, clueIndex) => {
          const verified = verifiedPositions.get(clue);
          if (verified) {
            // Add correct letters (verified positions)
            verified.forEach((position) => {
              const letter = clue[position];
              if (letter) {
                const key = `clue${clueIndex}-pos${position}`;
                flattenedVerified.set(key, letter.toUpperCase());
              }
            });
          }
        });
        
        // Add all guessed letters (even if they were wrong and cleared)
        let guessCount = 0;
        allGuessedLetters.forEach(letter => {
          const key = `guessed-${guessCount++}`;
          flattenedVerified.set(key, letter);
        });
      }
      
      onVerifiedPositionsChange(flattenedVerified);
    }
  }, [verifiedPositions, allGuessedLetters, activeClues, onVerifiedPositionsChange, areWordsLocked]);

  // Keyboard event listener for ACTUAL KEYBOARD typing (not on-screen keyboard)
  useEffect(() => {
    // Simplified conditions - only check critical blocking conditions
    const shouldSkipListener = isMessageActive || awaitingAdditionalLetter || !cursorPosition;
    
    if (shouldSkipListener) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      
      // Block input if words are locked
      if (areWordsLocked) {
        return;
      }
      
      const currentClue = activeClues[cursorPosition.clueIndex];
      const wordInputs = userInputs.get(currentClue);
      if (!wordInputs) {
        return;
      }

      // Handle Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isWordComplete(currentClue, wordInputs)) {
          submitWord(currentClue, cursorPosition.clueIndex);
        } else {
          onShowMessage(GameConfig.messages.wordNotComplete, 'info');
        }
        return;
      }

      // Handle backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        
        // Helper function to check if a position is a starting letter
        const isStartingLetter = (clue: string, position: number, letter: string): boolean => {
          const clueUpper = clue.toUpperCase();
          const letterUpper = letter.toUpperCase();
          return clueUpper[position] === letterUpper && startingLettersSet.current?.has(letterUpper);
        };
        
        // Helper function to check if a position can be deleted (not starting, not verified)
        const canDelete = (clue: string, position: number, inputs: Map<number, string>): boolean => {
          if (!inputs.has(position)) return false;
          const letter = inputs.get(position)!;
          const verified = verifiedPositions.get(clue) || new Set();
          const isStarting = isStartingLetter(clue, position, letter);
          return !isStarting && !verified.has(position);
        };
        
        // If cursor is on a filled position that can be deleted, delete it
        if (wordInputs.has(cursorPosition.position) && canDelete(currentClue, cursorPosition.position, wordInputs)) {
          const newWordInputs = new Map(wordInputs);
          newWordInputs.delete(cursorPosition.position);
          setUserInputs(prev => new Map(prev).set(currentClue, newWordInputs));
          return;
        }
        
        // Otherwise, navigate backwards to find either:
        // 1. A deletable letter (user-typed, not starting, not verified)
        // 2. An empty position to move cursor to
        let targetClueIndex = cursorPosition.clueIndex;
        let targetClue = currentClue;
        let targetWordInputs = wordInputs;
        let positionToDelete = -1;
        let emptyPositionToMoveTo = -1;

        // Search backwards in current word
        for (let i = cursorPosition.position - 1; i >= 0; i--) {
          if (targetWordInputs.has(i)) {
            // Found a filled position
            if (canDelete(targetClue, i, targetWordInputs)) {
              positionToDelete = i;
              break;
            }
            // Skip protected letters (starting/verified), continue searching
          } else {
            // Found an empty position - remember it as fallback
            if (emptyPositionToMoveTo === -1) {
              emptyPositionToMoveTo = i;
            }
          }
        }

        // If no deletable letter found in current word, search previous words
        if (positionToDelete === -1) {
          for (let clueIdx = targetClueIndex - 1; clueIdx >= 0; clueIdx--) {
            const prevClue = activeClues[clueIdx];
            if (!completedWords.has(prevClue)) {
              const prevWordInputs = userInputs.get(prevClue);
              if (prevWordInputs) {
                // Search from end of previous word backwards
                for (let i = prevClue.length - 1; i >= 0; i--) {
                  if (prevWordInputs.has(i)) {
                    // Found a filled position
                    if (canDelete(prevClue, i, prevWordInputs)) {
                      targetClueIndex = clueIdx;
                      targetClue = prevClue;
                      targetWordInputs = prevWordInputs;
                      positionToDelete = i;
                      break;
                    }
                    // Skip protected letters
                  } else {
                    // Found an empty position - remember it as fallback
                    if (emptyPositionToMoveTo === -1) {
                      emptyPositionToMoveTo = i;
                      targetClueIndex = clueIdx;
                      targetClue = prevClue;
                      targetWordInputs = prevWordInputs;
                    }
                  }
                }
              }
            }
            if (positionToDelete !== -1) break;
          }
        }
        
        // Priority 1: Delete a user-typed letter if found
        if (positionToDelete !== -1) {
          const newWordInputs = new Map(targetWordInputs);
          newWordInputs.delete(positionToDelete);
          setUserInputs(prev => new Map(prev).set(targetClue, newWordInputs));
          setCursorPosition({ clueIndex: targetClueIndex, position: positionToDelete });
        } 
        // Priority 2: Move cursor to empty position for navigation
        else if (emptyPositionToMoveTo !== -1) {
          setCursorPosition({ clueIndex: targetClueIndex, position: emptyPositionToMoveTo });
        } 
        else {
        }
        
        return;
      }

      // Handle letter input
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        
        if (!wordInputs.has(cursorPosition.position)) {
          const newWordInputs = new Map(wordInputs);
          newWordInputs.set(cursorPosition.position, key);
          setUserInputs(prev => new Map(prev).set(currentClue, newWordInputs));

          // Check if word is now complete
          const isComplete = isWordComplete(currentClue, newWordInputs);
          if (isComplete) {
            // DON'T auto-submit - user typed letters, so they need to press Enter
            // Just move to next empty position or stay put
            const nextEmpty = findNextEmptyPosition(currentClue, cursorPosition.position, newWordInputs);
            if (nextEmpty !== null) {
              setCursorPosition({ clueIndex: cursorPosition.clueIndex, position: nextEmpty });
            }
          } else {
            // Word not complete, move to next empty position
            const nextEmpty = findNextEmptyPosition(currentClue, cursorPosition.position, newWordInputs);
            if (nextEmpty !== null) {
              setCursorPosition({ clueIndex: cursorPosition.clueIndex, position: nextEmpty });
            }
          }
        } else {
        }
      }

      // Handle arrow keys
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveToNextPosition();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveToPreviousPosition();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveToClueAbove();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveToClueBelow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    cursorPosition,
    isMessageActive,
    areWordsLocked,
    awaitingAdditionalLetter,
    activeClues,
    userInputs,
    completedWords,
    verifiedPositions,
    submitWord,
    onShowMessage,
    setUserInputs,
    setCursorPosition,
    moveToNextPosition,
    moveToPreviousPosition,
    moveToClueAbove,
    moveToClueBelow,
    startingLettersSet
  ]);

  if (activeClues.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-4">
      {activeClues.map((clue, index) => (
        <WordDash
          key={clue}
          word={clue}
          wordType={wordTypes[index]}
          startingLetters={allAvailableLetters}
          additionalLetters={additionalLetters}
          cursorPosition={cursorPosition?.clueIndex === index ? cursorPosition.position : null}
          onCursorClick={(position) => {
            // Don't allow clicking if words are locked
            if (areWordsLocked) return;
            
            if (!completedWords.has(clue)) {
              const wordInputs = userInputs.get(clue);
              const verified = verifiedPositions.get(clue) || new Set();
              
              // Allow clicking on:
              // 1. Empty positions
              // 2. Positions with guessed letters (not verified, not starting letters)
              if (wordInputs) {
                const isVerified = verified.has(position);
                
                // Check if it's a starting letter
                const isStartingLetter = wordInputs.has(position) && (() => {
                  const letter = wordInputs.get(position)!;
                  const clueUpper = clue.toUpperCase();
                  const letterUpper = letter.toUpperCase();
                  const startingLettersArray = allAvailableLetters.toUpperCase().split('');
                  return clueUpper[position] === letterUpper && startingLettersArray.includes(letterUpper);
                })();
                
                // Allow click if not verified and not a starting letter
                if (!isVerified && !isStartingLetter) {
                  setCursorPosition({ clueIndex: index, position });
                }
              }
            }
          }}          
          flashState={flashStates.get(clue) || 'none'}
          isComplete={completedWords.has(clue)}
          userInputs={userInputs.get(clue) || new Map()}
          verifiedPositions={verifiedPositions.get(clue) || new Set()}
          shouldShake={shakeWord === clue}
          hasUsedAdditionalLetters={hasUsedAdditionalLetters}
          hasValidatedAdditionalLetter={hasAnyCorrectAdditionalLetter}
          bothAdditionalLettersGuessed={bothAdditionalLettersGuessed}
          isLocked={areWordsLocked}
          onAdditionalLettersFilled={(filledPositions) => handleAdditionalLettersFilled(clue, index, filledPositions)}
          onFlashComplete={() => {
            const flashState = flashStates.get(clue);
            
            // Only remove letters if the flash was red (incorrect)
            if (flashState === 'red') {
              const wordInputs = userInputs.get(clue);
              const verified = verifiedPositions.get(clue) || new Set();
              
              if (wordInputs) {
                const newWordInputs = new Map<number, string>();
                
                // Keep only starting letters and verified positions
                wordInputs.forEach((letter, position) => {
                  const wordLetter = clue[position]?.toUpperCase();
                  const isStartingLetter = letter === wordLetter && 
                                          startingLettersSet.current?.has(letter);
                  const isVerified = verified.has(position);
                  
                  // Only keep starting letters and verified letters
                  if (isStartingLetter || isVerified) {
                    newWordInputs.set(position, letter);
                  }
                });
                
                // Update user inputs to remove wrong letters
                setUserInputs(prev => new Map(prev).set(clue, newWordInputs));
                
                // Move cursor to first empty position in this word
                const firstEmpty = findNextEmptyPosition(clue, -1, newWordInputs);
                if (firstEmpty !== null) {
                  setCursorPosition({ clueIndex: index, position: firstEmpty });
                }
              }
            }
          }}
        />
      ))}
    </div>
  );
}