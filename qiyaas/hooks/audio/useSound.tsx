// hooks/audio/useSound.tsx

import { useCallback, useRef } from 'react';

export function useSound(src: string, volume = 1) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }
    audioRef.current.volume = volume;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Ignore autoplay policy errors silently
    });
  }, [src, volume]);

  return play;
}