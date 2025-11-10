// components/game_assets/word_clues/hooks/useCursorNavigation.ts

// Purpose: Manage cursor navigation across multiple clue words, allowing movement to next/previous editable positions while respecting verified letters.

import { useState, useEffect, useCallback } from 'react';
import { findNextEmptyPosition } from '@/hooks/clues/clueHelpers';

export function useCursorNavigation(
  activeClues: string[],
  userInputs: Map<string, Map<number, string>>,
  completedWords: Set<string>,
  verifiedPositions: Map<string, Set<number>>,
  startingLetters?: string,
  hasAnyCorrectAdditionalLetter?: boolean
) {
  const [cursorPosition, setCursorPosition] = useState<{ clueIndex: number; position: number } | null>(null);

  // Helper to check if starting letters match a specific clue
  const clueHasStartingLetterMatch = useCallback((clue: string): boolean => {
    if (!startingLetters) return false;
    const startingLettersArray = startingLetters.toUpperCase().split('');
    const clueUpper = clue.toUpperCase();
    return startingLettersArray.some(letter => clueUpper.includes(letter));
  }, [startingLetters]);

  // Helper to check if a position can be edited (not verified/locked)
  const isPositionEditable = useCallback((clue: string, position: number) => {
    const verified = verifiedPositions.get(clue) || new Set();
    return !verified.has(position);
  }, [verifiedPositions]);

  // Helper to check if position is a starting letter
  const isStartingLetterPosition = useCallback((clue: string, position: number, wordInputs: Map<number, string>): boolean => {
    if (!startingLetters || !wordInputs.has(position)) return false;
    const letter = wordInputs.get(position)!;
    const clueUpper = clue.toUpperCase();
    const letterUpper = letter.toUpperCase();
    const startingLettersArray = startingLetters.toUpperCase().split('');
    return clueUpper[position] === letterUpper && startingLettersArray.includes(letterUpper);
  }, [startingLetters]);

  // Set initial cursor position when clues are loaded
  useEffect(() => {
    if (activeClues.length > 0 && cursorPosition === null) {
      const firstClue = activeClues[0];
      const wordInputs = userInputs.get(firstClue);
      if (wordInputs) {
        const firstEmptyPos = findNextEmptyPosition(firstClue, -1, wordInputs);
        if (firstEmptyPos !== null) {
          setCursorPosition({ clueIndex: 0, position: firstEmptyPos });
        }
      }
    }
  }, [activeClues, userInputs, cursorPosition]);

  // Find next incomplete word
  const findNextIncompleteWord = useCallback(() => {
    for (let i = 0; i < activeClues.length; i++) {
      const clue = activeClues[i];
      if (!completedWords.has(clue)) {
        const wordInputs = userInputs.get(clue);
        if (wordInputs) {
          const firstEmpty = findNextEmptyPosition(clue, -1, wordInputs);
          if (firstEmpty !== null) {
            return { clueIndex: i, position: firstEmpty };
          }
        }
      }
    }
    return null;
  }, [activeClues, completedWords, userInputs]);

  // Move cursor to next position (only empty positions, skip filled ones)
  const moveToNextPosition = useCallback(() => {
    if (!cursorPosition) return;

    const currentClue = activeClues[cursorPosition.clueIndex];
    const wordInputs = userInputs.get(currentClue);
    if (!wordInputs) return;

    // Check if current clue has no starting letter matches AND no correct additional letter
    const currentClueHasNoMatches = !clueHasStartingLetterMatch(currentClue);
    const shouldRestrictNavigation = currentClueHasNoMatches && !hasAnyCorrectAdditionalLetter;
    
    // If current clue should be restricted and we're at position 0, immediately move to next clue
    // (because positions beyond 0 are hidden or restricted)
    if (shouldRestrictNavigation && cursorPosition.position === 0) {
      // Move to next clue - skip completed words
      let nextClueIdx = cursorPosition.clueIndex + 1;
      
      // Find the next incomplete word
      while (nextClueIdx < activeClues.length) {
        const nextClue = activeClues[nextClueIdx];
        
        if (!completedWords.has(nextClue)) {
          const nextWordInputs = userInputs.get(nextClue);
          
          if (nextWordInputs) {
            // Check if next clue should be restricted
            const hasNoMatches = !clueHasStartingLetterMatch(nextClue);
            const isRestricted = hasNoMatches && !hasAnyCorrectAdditionalLetter;
            
            if (isRestricted) {
              // Navigate to position 0 (the only visible dash)
              if (!nextWordInputs.has(0)) {
                setCursorPosition({ clueIndex: nextClueIdx, position: 0 });
                return;
              }
            }
            
            // Normal behavior: find first empty position
            for (let i = 0; i < nextClue.length; i++) {
              if (!nextWordInputs.has(i)) {
                setCursorPosition({ clueIndex: nextClueIdx, position: i });
                return;
              }
            }
          }
        }
        
        nextClueIdx++;
      }
      return;
    }

    // Look for next editable position (empty OR guessed but not verified/starting)
    let nextPos = null;
    const verified = verifiedPositions.get(currentClue) || new Set();
    
    for (let i = cursorPosition.position + 1; i < currentClue.length; i++) {
      const isVerified = verified.has(i);
      const isStarting = wordInputs.has(i) && isStartingLetterPosition(currentClue, i, wordInputs);
      
      // Position is editable if it's either empty OR filled but not verified and not starting
      if (!isVerified && !isStarting) {
        nextPos = i;
        break;
      }
    }

    if (nextPos !== null) {
      setCursorPosition({ clueIndex: cursorPosition.clueIndex, position: nextPos });
    } else {
      
      // Move to next clue - skip completed words
      let nextClueIdx = cursorPosition.clueIndex + 1;
      
      // Find the next incomplete word
      while (nextClueIdx < activeClues.length) {
        const nextClue = activeClues[nextClueIdx];
        
        if (!completedWords.has(nextClue)) {
          const nextWordInputs = userInputs.get(nextClue);
          
          if (nextWordInputs) {
            // Check if next clue should be restricted
            const hasNoMatches = !clueHasStartingLetterMatch(nextClue);
            const isRestricted = hasNoMatches && !hasAnyCorrectAdditionalLetter;
            
            if (isRestricted) {
              // Navigate to position 0 (the only visible dash)
              if (!nextWordInputs.has(0)) {
                setCursorPosition({ clueIndex: nextClueIdx, position: 0 });
                return;
              }
            }
            
            // Normal behavior: find first editable position
            const nextVerified = verifiedPositions.get(nextClue) || new Set();
            for (let i = 0; i < nextClue.length; i++) {
              const isVerified = nextVerified.has(i);
              const isStarting = nextWordInputs.has(i) && isStartingLetterPosition(nextClue, i, nextWordInputs);
              
              if (!isVerified && !isStarting) {
                setCursorPosition({ clueIndex: nextClueIdx, position: i });
                return;
              }
            }
          }
        }
        
        nextClueIdx++;
      }
    }
  }, [cursorPosition, activeClues, userInputs, completedWords, verifiedPositions, clueHasStartingLetterMatch, hasAnyCorrectAdditionalLetter, isStartingLetterPosition]);

  // Move cursor to previous position (look for editable positions including guessed)
  const moveToPreviousPosition = useCallback(() => {
    if (!cursorPosition) return;

    const currentClue = activeClues[cursorPosition.clueIndex];
    const wordInputs = userInputs.get(currentClue);
    if (!wordInputs) return;

    // Check if current clue has no starting letter matches AND no correct additional letter
    const currentClueHasNoMatches = !clueHasStartingLetterMatch(currentClue);
    const shouldRestrictNavigation = currentClueHasNoMatches && !hasAnyCorrectAdditionalLetter;
    
    // If current clue should be restricted and we're at position 0, immediately move to previous clue
    // (because there are no positions before 0)
    if (shouldRestrictNavigation && cursorPosition.position === 0) {
      // Move to previous clue - skip completed words
      let prevClueIdx = cursorPosition.clueIndex - 1;
      
      // Find the previous incomplete word
      while (prevClueIdx >= 0) {
        const prevClue = activeClues[prevClueIdx];
        
        if (!completedWords.has(prevClue)) {
          const prevWordInputs = userInputs.get(prevClue);
          
          if (prevWordInputs) {
            // Check if previous clue should be restricted
            const hasNoMatches = !clueHasStartingLetterMatch(prevClue);
            const isRestricted = hasNoMatches && !hasAnyCorrectAdditionalLetter;
            
            if (isRestricted) {
              // Navigate to position 0 (the only visible dash)
              if (!prevWordInputs.has(0)) {
                setCursorPosition({ clueIndex: prevClueIdx, position: 0 });
                return;
              }
            }
            
            // Normal behavior: find last editable position
            const prevVerified = verifiedPositions.get(prevClue) || new Set();
            for (let i = prevClue.length - 1; i >= 0; i--) {
              const isVerified = prevVerified.has(i);
              const isStarting = prevWordInputs.has(i) && isStartingLetterPosition(prevClue, i, prevWordInputs);
              
              if (!isVerified && !isStarting) {
                setCursorPosition({ clueIndex: prevClueIdx, position: i });
                return;
              }
            }
          }
        }
        
        prevClueIdx--;
      }
      return;
    }

    // Look for previous editable position (empty OR guessed but not verified/starting)
    let prevPos = null;
    const verified = verifiedPositions.get(currentClue) || new Set();
    
    for (let i = cursorPosition.position - 1; i >= 0; i--) {
      const isVerified = verified.has(i);
      const isStarting = wordInputs.has(i) && isStartingLetterPosition(currentClue, i, wordInputs);
      
      // Position is editable if it's either empty OR filled but not verified and not starting
      if (!isVerified && !isStarting) {
        prevPos = i;
        break;
      }
    }
    
    if (prevPos !== null) {
      setCursorPosition({ clueIndex: cursorPosition.clueIndex, position: prevPos });
    } else {
      // Move to previous clue - skip completed words
      let prevClueIdx = cursorPosition.clueIndex - 1;
      
      // Find the previous incomplete word
      while (prevClueIdx >= 0) {
        const prevClue = activeClues[prevClueIdx];
        
        if (!completedWords.has(prevClue)) {
          const prevWordInputs = userInputs.get(prevClue);
          
          if (prevWordInputs) {
            // Check if previous clue should be restricted
            const hasNoMatches = !clueHasStartingLetterMatch(prevClue);
            const isRestricted = hasNoMatches && !hasAnyCorrectAdditionalLetter;
            
            if (isRestricted) {
              // Navigate to position 0 (the only visible dash)
              if (!prevWordInputs.has(0)) {
                setCursorPosition({ clueIndex: prevClueIdx, position: 0 });
                return;
              }
            }
            
            // Normal behavior: find last editable position
            const prevVerified = verifiedPositions.get(prevClue) || new Set();
            for (let i = prevClue.length - 1; i >= 0; i--) {
              const isVerified = prevVerified.has(i);
              const isStarting = prevWordInputs.has(i) && isStartingLetterPosition(prevClue, i, prevWordInputs);
              
              if (!isVerified && !isStarting) {
                setCursorPosition({ clueIndex: prevClueIdx, position: i });
                return;
              }
            }
          }
        }
        
        prevClueIdx--;
      }
    }
  }, [cursorPosition, activeClues, userInputs, completedWords, verifiedPositions, clueHasStartingLetterMatch, hasAnyCorrectAdditionalLetter, isStartingLetterPosition]);

  // Move cursor to the clue above (up arrow)
  const moveToClueAbove = useCallback(() => {
    if (!cursorPosition) return;

    const currentPosition = cursorPosition.position;
    let targetClueIdx = cursorPosition.clueIndex - 1;

    // Find the previous incomplete word
    while (targetClueIdx >= 0) {
      const targetClue = activeClues[targetClueIdx];
      
      if (!completedWords.has(targetClue)) {
        const targetWordInputs = userInputs.get(targetClue);
        
        if (targetWordInputs) {
          // Check if target clue should be restricted
          const hasNoMatches = !clueHasStartingLetterMatch(targetClue);
          const isRestricted = hasNoMatches && !hasAnyCorrectAdditionalLetter;
          
          if (isRestricted) {
            // Navigate to position 0 (the only visible dash)
            if (!targetWordInputs.has(0)) {
              setCursorPosition({ clueIndex: targetClueIdx, position: 0 });
              return;
            }
          }
          
          const targetVerified = verifiedPositions.get(targetClue) || new Set();
          
          // Try to maintain the same position if it's editable
          if (currentPosition < targetClue.length) {
            const isVerified = targetVerified.has(currentPosition);
            const isStarting = targetWordInputs.has(currentPosition) && 
                              isStartingLetterPosition(targetClue, currentPosition, targetWordInputs);
            
            if (!isVerified && !isStarting) {
              setCursorPosition({ clueIndex: targetClueIdx, position: currentPosition });
              return;
            }
          }
          
          // Otherwise, find the closest editable position
          let closestPos = null;
          let minDistance = Infinity;
          
          for (let i = 0; i < targetClue.length; i++) {
            const isVerified = targetVerified.has(i);
            const isStarting = targetWordInputs.has(i) && 
                              isStartingLetterPosition(targetClue, i, targetWordInputs);
            
            if (!isVerified && !isStarting) {
              const distance = Math.abs(i - currentPosition);
              if (distance < minDistance) {
                minDistance = distance;
                closestPos = i;
              }
            }
          }
          
          if (closestPos !== null) {
            setCursorPosition({ clueIndex: targetClueIdx, position: closestPos });
            return;
          }
        }
      }
      
      targetClueIdx--;
    }
  }, [cursorPosition, activeClues, userInputs, completedWords, verifiedPositions, clueHasStartingLetterMatch, hasAnyCorrectAdditionalLetter, isStartingLetterPosition]);

  // Move cursor to the clue below (down arrow)
  const moveToClueBelow = useCallback(() => {
    if (!cursorPosition) return;

    const currentPosition = cursorPosition.position;
    let targetClueIdx = cursorPosition.clueIndex + 1;

    // Find the next incomplete word
    while (targetClueIdx < activeClues.length) {
      const targetClue = activeClues[targetClueIdx];
      
      if (!completedWords.has(targetClue)) {
        const targetWordInputs = userInputs.get(targetClue);
        
        if (targetWordInputs) {
          // Check if target clue should be restricted
          const hasNoMatches = !clueHasStartingLetterMatch(targetClue);
          const isRestricted = hasNoMatches && !hasAnyCorrectAdditionalLetter;
          
          if (isRestricted) {
            // Navigate to position 0 (the only visible dash)
            if (!targetWordInputs.has(0)) {
              setCursorPosition({ clueIndex: targetClueIdx, position: 0 });
              return;
            }
          }
          
          const targetVerified = verifiedPositions.get(targetClue) || new Set();
          
          // Try to maintain the same position if it's editable
          if (currentPosition < targetClue.length) {
            const isVerified = targetVerified.has(currentPosition);
            const isStarting = targetWordInputs.has(currentPosition) && 
                              isStartingLetterPosition(targetClue, currentPosition, targetWordInputs);
            
            if (!isVerified && !isStarting) {
              setCursorPosition({ clueIndex: targetClueIdx, position: currentPosition });
              return;
            }
          }
          
          // Otherwise, find the closest editable position
          let closestPos = null;
          let minDistance = Infinity;
          
          for (let i = 0; i < targetClue.length; i++) {
            const isVerified = targetVerified.has(i);
            const isStarting = targetWordInputs.has(i) && 
                              isStartingLetterPosition(targetClue, i, targetWordInputs);
            
            if (!isVerified && !isStarting) {
              const distance = Math.abs(i - currentPosition);
              if (distance < minDistance) {
                minDistance = distance;
                closestPos = i;
              }
            }
          }
          
          if (closestPos !== null) {
            setCursorPosition({ clueIndex: targetClueIdx, position: closestPos });
            return;
          }
        }
      }
      
      targetClueIdx++;
    }
  }, [cursorPosition, activeClues, userInputs, completedWords, verifiedPositions, clueHasStartingLetterMatch, hasAnyCorrectAdditionalLetter, isStartingLetterPosition]);

  return {
    cursorPosition,
    setCursorPosition,
    findNextIncompleteWord,
    moveToNextPosition,
    moveToPreviousPosition,
    moveToClueAbove,
    moveToClueBelow,
    isPositionEditable
  };
}