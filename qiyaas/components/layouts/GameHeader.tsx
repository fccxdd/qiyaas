// components/layouts/GameHeader.tsx

import { ReactNode } from 'react';

interface GameHeaderProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export default function GameHeader({ leftContent, rightContent }: GameHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-500 pb-1.5 sm:pb-4 px-4 sm:px-20 pt-3 sm:pt-2">
      {leftContent}
      {rightContent}
    </header>
  );
}