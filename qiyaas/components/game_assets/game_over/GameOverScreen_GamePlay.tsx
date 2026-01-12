// components/game_assets/game_over/GameOverScreen_GamePlay.tsx

"use client"

import React from 'react';
import { GameOverModal } from './GameOverModal';
import { LogoIcon } from './LogoIcon';
import { GameMessage } from './GameMessage';
import { useMarkGameAsPlayed } from '@/hooks/game_over/useMarkGameAsPlayed';

interface WinScreenProps {
  onClose?: () => void;
}

interface LoseScreenProps {
  onClose?: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ onClose }) => {
  useMarkGameAsPlayed();

  return (
    <GameOverModal onClose={onClose}>
      <LogoIcon variant="win"/>
      <GameMessage 
        type="win"
        title="GREAT JOB!"
        message={
          <>
            You have completed todays game!<br/>
            Come back tomorrow for another chance to win!
          </>
        }
      />
    </GameOverModal>
  );
};

export const LoseScreen: React.FC<LoseScreenProps> = ({ onClose }) => {
  useMarkGameAsPlayed();

  return (
    <GameOverModal onClose={onClose}>
      <LogoIcon variant="lose" />
      <GameMessage 
        type="lose"
        title="GAME OVER!"
        message={
          <>
            You didnt get it this time.<br/>
            Come back tomorrow for another chance to win!
          </>
        }
      />
    </GameOverModal>
  );
};