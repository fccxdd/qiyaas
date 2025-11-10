// hooks/clue/SlowRevealLetters.tsx

// TODO: Implment this

import { useState, useEffect, useRef } from 'react';

interface RevealState {
  currentLetterIndex: number; // Which starting letter we're revealing (0 = S, 1 = M, etc.)
  currentClueIndex: number; // Which clue we're currently revealing
  revealingPositions: Map<number, Set<number>>; // clueIndex -> Set of positions being revealed
  completedPositions: Map<number, Set<number>>; // clueIndex -> Set of completed positions
}

interface RevealLettersProps {
  startingLetters: string;
  clueWords: string[];
  onRevealComplete?: () => void;
  shouldStart: boolean;
  children: (props: {
    currentRevealingLetter: string | null;
    isPositionRevealing: (clueIndex: number, position: number) => boolean;
    isPositionCompleted: (clueIndex: number, position: number) => boolean;
    shouldShowStartingLetterHighlight: (letterIndex: number) => boolean;
  }) => React.ReactNode;
}

export default function RevealLetters({
  startingLetters,
  clueWords,
  onRevealComplete,
  shouldStart,
  children
}: RevealLettersProps) {
  const [revealState, setRevealState] = useState<RevealState>({
    currentLetterIndex: -1,
    currentClueIndex: -1,
    revealingPositions: new Map(),
    completedPositions: new Map()
  });
  
  const [currentHighlightedStartingLetter, setCurrentHighlightedStartingLetter] = useState<number>(-1);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!shouldStart || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const startingLettersArray = startingLetters.toUpperCase().split('');
    
    // Build a map of which positions in each clue match each starting letter
    const letterPositionsMap: Map<number, Map<number, number[]>> = new Map(); // letterIndex -> clueIndex -> positions[]
    
    startingLettersArray.forEach((letter, letterIndex) => {
      const cluePositions = new Map<number, number[]>();
      
      clueWords.forEach((word, clueIndex) => {
        const wordUpper = word.toUpperCase();
        const positions: number[] = [];
        
        // Get positions from left to right
        for (let i = 0; i < wordUpper.length; i++) {
          if (wordUpper[i] === letter) {
            positions.push(i);
          }
        }
        
        if (positions.length > 0) {
          cluePositions.set(clueIndex, positions);
        }
      });
      
      letterPositionsMap.set(letterIndex, cluePositions);
    });

    // Start the sequential reveal animation
    let delay = 500; // Initial delay before starting
    
    startingLettersArray.forEach((letter, letterIndex) => {
      const cluePositions = letterPositionsMap.get(letterIndex);
      
      if (!cluePositions || cluePositions.size === 0) {
        // No matches for this letter, skip it
        return;
      }
      
      // Highlight the starting letter
      setTimeout(() => {
        setCurrentHighlightedStartingLetter(letterIndex);
        setRevealState(prev => ({
          ...prev,
          currentLetterIndex: letterIndex,
          currentClueIndex: -1
        }));
      }, delay);
      
      delay += 500; // Time for starting letter to turn green
      
      // Process each clue one by one
      cluePositions.forEach((positions, clueIndex) => {
        // Set current clue
        setTimeout(() => {
          setRevealState(prev => ({
            ...prev,
            currentClueIndex: clueIndex
          }));
        }, delay);
        
        // Reveal positions in this clue from left to right
        positions.forEach((position) => {
          // Show green dash
          setTimeout(() => {
            setRevealState(prev => {
              const newRevealing = new Map(prev.revealingPositions);
              const clueSet = newRevealing.get(clueIndex) || new Set();
              clueSet.add(position);
              newRevealing.set(clueIndex, new Set(clueSet));
              
              return {
                ...prev,
                revealingPositions: newRevealing
              };
            });
          }, delay);
          
          delay += 300; // Green dash duration
          
          // Complete reveal (show letter)
          setTimeout(() => {
            setRevealState(prev => {
              const newRevealing = new Map(prev.revealingPositions);
              const revealingSet = newRevealing.get(clueIndex) || new Set();
              revealingSet.delete(position);
              newRevealing.set(clueIndex, new Set(revealingSet));
              
              const newCompleted = new Map(prev.completedPositions);
              const completedSet = newCompleted.get(clueIndex) || new Set();
              completedSet.add(position);
              newCompleted.set(clueIndex, new Set(completedSet));
              
              return {
                ...prev,
                revealingPositions: newRevealing,
                completedPositions: newCompleted
              };
            });
          }, delay);
          
          delay += 500; // Letter bounce duration
        });
        
        // Small pause before moving to next clue
        delay += 200;
      });
      
      // Pause before moving to next starting letter
      delay += 300;
    });
    
    // Complete animation
    setTimeout(() => {
      setCurrentHighlightedStartingLetter(-1);
      if (onRevealComplete) {
        onRevealComplete();
      }
    }, delay);
    
  }, [startingLetters, clueWords, onRevealComplete, shouldStart]);

  return (
    <>
      {children({
        currentRevealingLetter: revealState.currentLetterIndex >= 0 
          ? startingLetters[revealState.currentLetterIndex] 
          : null,
        isPositionRevealing: (clueIndex: number, position: number) => {
          return revealState.revealingPositions.get(clueIndex)?.has(position) ?? false;
        },
        isPositionCompleted: (clueIndex: number, position: number) => {
          return revealState.completedPositions.get(clueIndex)?.has(position) ?? false;
        },
        shouldShowStartingLetterHighlight: (letterIndex: number) => {
          return currentHighlightedStartingLetter === letterIndex;
        }
      })}
    </>
  );
}