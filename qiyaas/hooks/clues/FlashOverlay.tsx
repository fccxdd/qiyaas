// components/game_assets/word_clues/FlashOverlay.tsx

'use client';

interface FlashOverlayProps {
  flashState: 'none' | 'red' | 'yellow' | 'green';
  wordType?: string;
  children: React.ReactNode;
}

export default function FlashOverlay({ 
  flashState, 
  wordType, 
  children 
}: FlashOverlayProps) {
  const isFlashing = flashState !== 'none';

  return (
    <div 
      className={`
        flash-wrapper
        ${isFlashing ? 'flash-active' : ''}
        ${flashState === 'red' ? 'flash-red' : ''}
        ${flashState === 'yellow' ? 'flash-yellow' : ''}
        ${flashState === 'green' && wordType?.toUpperCase() === 'NOUN' ? 'flash-green-noun' : ''}
        ${flashState === 'green' && wordType?.toUpperCase() === 'VERB' ? 'flash-green-verb' : ''}
        ${flashState === 'green' && wordType?.toUpperCase() === 'ADJECTIVE' ? 'flash-green-adjective' : ''}
      `}
    >
      {children}
    </div>
  );
}