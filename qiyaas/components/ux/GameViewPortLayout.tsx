'use client';

import { ReactNode } from 'react';

/*
 * Standard Breakpoints (width-based):
 * - 320px — 480px: Mobile devices
 * - 481px — 768px: iPads, Tablets
 * - 769px — 1024px: Small screens, laptops (13-inch)
 * - 1025px — 1280px: Desktops, large screens (15-inch+)
 * - 1281px and more: Extra large screens, TV
 */

interface GameViewportLayoutProps {
  children: ReactNode;
  isTransitioned: boolean;
}

export default function GameViewportLayout({ 
  children, 
  isTransitioned 
}: GameViewportLayoutProps) {
  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] mt-16 overflow-hidden">
      {children}
    </div>
  );
}

// Sub-components for layout sections
interface TopSectionProps {
  children: ReactNode;
  isTransitioned: boolean;
}

export function TopSection({ children, isTransitioned }: TopSectionProps) {
  return (
    <div className="relative px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 shrink-0">
      <div className="w-full max-w-[720px] mx-auto flex justify-between items-start">
        {children}
      </div>
    </div>
  );
}

interface MiddleSectionProps {
  children: ReactNode;
  isTransitioned: boolean;
}

export function MiddleSection({ children, isTransitioned }: MiddleSectionProps) {
  return (
    <div className="flex-[1.3] min-h-0 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="h-full w-full max-w-[720px] mx-auto flex items-center justify-between">
        {children}
      </div>
    </div>
  );
}

interface BottomSectionProps {
  livesComponent: ReactNode;
  keyboardComponent: ReactNode;
  isTransitioned: boolean;
}

export function BottomSection({ 
  livesComponent, 
  keyboardComponent, 
  isTransitioned 
}: BottomSectionProps) {
  return (
    <div className="flex-[0.7] flex flex-col justify-end">
      <div className="flex flex-col items-center gap-6 sm:px-6 lg:px-8">
        
        {/* Lives */}
        <div
          className={`transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {livesComponent}
        </div>

        {/* Keyboard */}
        <div
          className={`w-full transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))"
          }}
        >
          {keyboardComponent}
        </div>

      </div>
    </div>
  );
}