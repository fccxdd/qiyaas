// components/game_assets/word_clues/RevealUnsolvedWords.tsx

'use client';

import { useEffect, useRef } from 'react';
import { getClueAnswers } from './ExtractAnswer';
import { GameConfig } from '@/lib/gameConfig';

interface RevealUnsolvedWordsProps {
  isGameOver: boolean;
  hasWon: boolean;
  completedWords: Set<string>;
  clueWordsArray: string[];
  userInputsNested: Map<string, Map<number, string>>;
  onUserInputsSync: (userInputs: Map<string, Map<number, string>>) => void;
  revealedSequenceLetters: Map<string, Map<number, string>>;
  verifiedPositions: Map<string, Set<number>>;
  onVerifiedPositionsSync: (verifiedPositions: Map<string, Set<number>>) => void;
  onSilentRevealSync?: (silentRevealedWords: Set<string>) => void;
  autoRevealedPositions: Map<string, Set<number>>;
  onAutoRevealedPositionsSync: (positions: Map<string, Set<number>>) => void;
  onCompletedWordsChange?: (completedWords: Set<string>) => void;
  onRevealComplete?: () => void;
  hasRevealedOnLoss: boolean;
}

export default function RevealUnsolvedWords({
  isGameOver,
  hasWon,
  completedWords,
  clueWordsArray,
  userInputsNested,
  onUserInputsSync,
  revealedSequenceLetters,
  verifiedPositions,
  onVerifiedPositionsSync,
  onSilentRevealSync,
  autoRevealedPositions,
  onAutoRevealedPositionsSync,
  onCompletedWordsChange,
  onRevealComplete,
  hasRevealedOnLoss,
}: RevealUnsolvedWordsProps) {
  const hasRevealed = useRef(false);
  
  // Keep track of the current state to build upon
  const currentMapRef = useRef<Map<string, Map<number, string>>>(new Map());
  const currentVerifiedRef = useRef<Map<string, Set<number>>>(new Map());
  const currentAutoRevealedRef = useRef<Map<string, Set<number>>>(new Map());
  const currentCompletedWordsRef = useRef<Set<string>>(new Set());

  // On refresh, if already revealed, restore which words were silently revealed
  useEffect(() => {
    if (isGameOver && !hasWon && hasRevealedOnLoss && onSilentRevealSync) {
      // Reconstruct which words were auto-revealed by checking completedWords
      const { clueAnswers } = getClueAnswers();
      const silentRevealedWords = new Set<string>();
      
      clueWordsArray.forEach((word, wordIndex) => {
        if (completedWords.has(word) && clueAnswers[wordIndex]) {
          // Check if this word was completed by auto-reveal (has auto-revealed positions)
          const autoRevealed = autoRevealedPositions.get(word);
          if (autoRevealed && autoRevealed.size > 0) {
            silentRevealedWords.add(word);
          }
        }
      });
      
      if (silentRevealedWords.size > 0) {
        console.log('🔴 Restoring silentRevealedWords on refresh:', Array.from(silentRevealedWords));
        onSilentRevealSync(silentRevealedWords);
      }
    }
  }, [isGameOver, hasWon, hasRevealedOnLoss, completedWords, clueWordsArray, autoRevealedPositions, onSilentRevealSync]);

  useEffect(() => {
    // Only reveal if game is over, player lost, we haven't revealed yet, AND not already revealed from storage
    if (!isGameOver || hasWon || hasRevealed.current || hasRevealedOnLoss) return;

    hasRevealed.current = true;
    
    // Initialize with current state
    currentMapRef.current = new Map(userInputsNested);
    currentVerifiedRef.current = new Map(verifiedPositions);
    currentAutoRevealedRef.current = new Map(autoRevealedPositions);
    currentCompletedWordsRef.current = new Set(completedWords);

    // Get correct answers
    const { clueAnswers } = getClueAnswers();

    // Find unsolved words and collect ALL empty positions across ALL words
    const allEmptyPositions: Array<{ word: string; position: number; letter: string }> = [];
    const silentRevealedWords = new Set<string>();
    const wordLengths = new Map<string, number>();
    
    clueWordsArray.forEach((word, wordIndex) => {
      if (!completedWords.has(word) && clueAnswers[wordIndex]) {
        const answer = clueAnswers[wordIndex].toUpperCase();
        const currentInputs = userInputsNested.get(word) || new Map();
        const revealedLetters = revealedSequenceLetters.get(word) || new Map();
        
        // Collect empty positions for this word
        for (let i = 0; i < answer.length; i++) {
          if (!currentInputs.has(i) && !revealedLetters.has(i)) {
            allEmptyPositions.push({
              word: word,
              position: i,
              letter: answer[i]
            });
            silentRevealedWords.add(word);
          }
        }
        
        // Store the word length
        if (silentRevealedWords.has(word)) {
          wordLengths.set(word, answer.length);
        }
      }
    });

    // If nothing to reveal, call complete immediately
    if (allEmptyPositions.length === 0) {
      if (onRevealComplete) {
        onRevealComplete();
      }
      return;
    }

    // Notify parent about which words are being auto-revealed
    if (onSilentRevealSync) {
      console.log('🔴 Setting silentRevealedWords on first loss:', Array.from(silentRevealedWords));
      onSilentRevealSync(silentRevealedWords);
    }

    // Wait for message to show (2 seconds) + a bit more (1 second) before starting reveal
    const startDelay = 3000; // 3 seconds total

    setTimeout(() => {
      // Reveal ALL positions one by one in sequence
      allEmptyPositions.forEach((item, index) => {
        setTimeout(() => {
          // Build upon the current state for user inputs
          const newMap = new Map(currentMapRef.current);
          const wordInputs = new Map(newMap.get(item.word) || new Map<number, string>());
          wordInputs.set(item.position, item.letter);
          newMap.set(item.word, wordInputs);
          
          // Build upon the current state for verified positions (makes them green!)
          const newVerifiedMap = new Map(currentVerifiedRef.current);
          const verifiedSet = new Set(newVerifiedMap.get(item.word) || new Set<number>());
          verifiedSet.add(item.position);
          newVerifiedMap.set(item.word, verifiedSet);
          
          // Track auto-revealed positions separately
          const newAutoRevealedMap = new Map(currentAutoRevealedRef.current);
          const autoRevealedSet = new Set(newAutoRevealedMap.get(item.word) || new Set<number>());
          autoRevealedSet.add(item.position);
          newAutoRevealedMap.set(item.word, autoRevealedSet);
          
          // Update the refs and sync
          currentMapRef.current = newMap;
          currentVerifiedRef.current = newVerifiedMap;
          currentAutoRevealedRef.current = newAutoRevealedMap;
          onUserInputsSync(newMap);
          onVerifiedPositionsSync(newVerifiedMap);
          onAutoRevealedPositionsSync(newAutoRevealedMap);
          
          // Check if this word is now complete
          const wordLength = wordLengths.get(item.word);
          if (wordLength !== undefined) {
            const totalFilledPositions = wordInputs.size;
            
            // If all positions are filled, mark as complete (for coloring)
            if (totalFilledPositions === wordLength && !currentCompletedWordsRef.current.has(item.word)) {
              const newCompletedWords = new Set(currentCompletedWordsRef.current);
              newCompletedWords.add(item.word);
              currentCompletedWordsRef.current = newCompletedWords;
              
              if (onCompletedWordsChange) {
                onCompletedWordsChange(newCompletedWords);
              }
            }
          }
          
          // If this is the last letter, notify completion
          if (index === allEmptyPositions.length - 1 && onRevealComplete) {
            // Add a small buffer to ensure the last animation completes
            setTimeout(() => {
              onRevealComplete();
            }, 100);
          }
        }, index * GameConfig.duration.revealLetterDelay);
      });
    }, startDelay);
  }, [
    isGameOver,
    hasWon,
    completedWords,
    clueWordsArray,
    userInputsNested,
    onUserInputsSync,
    revealedSequenceLetters,
    verifiedPositions,
    onVerifiedPositionsSync,
    onSilentRevealSync,
    autoRevealedPositions,
    onAutoRevealedPositionsSync,
    onCompletedWordsChange,
    onRevealComplete,
    hasRevealedOnLoss,
  ]);

  return null;
}