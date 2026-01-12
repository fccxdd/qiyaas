// components/game_assets/word_clues/FlashOverlay.tsx

'use client';

interface FlashOverlayProps {
  flashState: 'none' | 'red' | 'yellow' | 'green';
  wordType?: string;
  isComplete?: boolean;
  silentReveal?: boolean;
  children: React.ReactNode;
}

export default function FlashOverlay({ 
  flashState, 
  wordType, 
  isComplete = false,
  silentReveal = false,
  children 
}: FlashOverlayProps) {
  const isFlashing = flashState !== 'none';
  
  // Only glow if complete AND not a silent reveal
  const shouldGlow = isComplete && !silentReveal;

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
        ${shouldGlow ? 'completed-word-glow' : ''}
        ${shouldGlow && wordType?.toUpperCase() === 'NOUN' ? 'flash-green-noun' : ''}
        ${shouldGlow && wordType?.toUpperCase() === 'VERB' ? 'flash-green-verb' : ''}
        ${shouldGlow && wordType?.toUpperCase() === 'ADJECTIVE' ? 'flash-green-adjective' : ''}
        ${shouldGlow && !wordType ? 'flash-green-default' : ''}
      `}
    >
      {children}
    </div>
  );
}