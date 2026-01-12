// hooks/keyboard/useEnterKeyHandler.tsx

'use client';

import { useCallback } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface CursorPosition {
  clueIndex: number;
  position: number;
}

interface UseEnterKeyHandlerProps {
  activeClues: string[];
  userInputs: Map<string, Map<number, string>>;
  cursorPosition: CursorPosition | null;
  submitWord: (clue: string, clueIndex: number) => void;
  onShowMessage: (msg: string, type?: 'error' | 'success' | 'info') => void;
  isWordComplete: (clue: string, wordInputs: Map<number, string>) => boolean;
}

export function useEnterKeyHandler({
  activeClues,
  userInputs,
  cursorPosition,
  submitWord,
  onShowMessage,
  isWordComplete
}: UseEnterKeyHandlerProps) {
  
  const handleEnter = useCallback(() => {
    if (!cursorPosition) return;

    const currentClue = activeClues[cursorPosition.clueIndex];
    const wordInputs = userInputs.get(currentClue);
    
    if (!wordInputs) return;

    if (isWordComplete(currentClue, wordInputs)) {
      submitWord(currentClue, cursorPosition.clueIndex);
    } else {
      onShowMessage(GameConfig.messages.wordNotComplete, 'info');
    }
  }, [activeClues, userInputs, cursorPosition, submitWord, onShowMessage, isWordComplete]);

  return { handleEnter };
}