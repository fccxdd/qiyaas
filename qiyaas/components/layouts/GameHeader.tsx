// components/layouts/GameHeader.tsx

import { ReactNode } from 'react';

interface GameHeaderProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export default function GameHeader({ leftContent, rightContent }: GameHeaderProps) {
  return (
    <header className="absolute top-8 left-4 right-4 sm:top-20 sm:left-20 sm:right-20 z-50 flex items-center justify-between">
      {leftContent}
      {rightContent}
    </header>
  );
}