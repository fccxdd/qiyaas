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
    <div 
      className="flex flex-col min-h-[100dvh] overflow-x-hidden overflow-y-auto"
      style={{ 
        height: '100dvh',
      }}
    >
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
    <>
      <style jsx>{`
        /* Mobile devices (320px — 480px) */
        @media (max-width: 480px) {
        .top-section {
          margin-top: 4rem;
          min-height: 100px;
          padding-top: 0.5rem;
        }
      }
        
        /* iPads, Tablets (481px — 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .top-section {
            margin-top: 4rem;
            padding-top: 0.75rem;
          }
        }
        
        /* Small screens, laptops - 13-inch (769px — 1024px) */
        /* Same as 15-inch for consistent experience */
        @media (min-width: 769px) and (max-width: 1024px) {
          .top-section {
            margin-top: 5rem;
            min-height: 100px;
            padding-top: 1rem;
          }
        }
        
        /* Desktops, large screens - 13-inch+ (1025px — 1280px) */
        @media (min-width: 1025px) and (max-width: 1280px) {
          .top-section {
            margin-top: 5rem;
            min-height: 180px;
            padding-top: 1.5rem;
          }
        }
        
        /* Extra large screens, 15-inch+ and TV (1281px and more) */
        @media (min-width: 1281px) {
          .top-section {
            margin-top: 5rem;
            min-height: 180px;
            padding-top: 1.5rem;
          }
      }
        
      `}</style>
      <div className="top-section relative px-4 md:px-0 shrink-0">
        <div className="w-full md:max-w-[680px] md:mx-auto flex justify-between items-start">
          {children}
        </div>
      </div>
    </>
  );
}

interface MiddleSectionProps {
  children: ReactNode;
  isTransitioned: boolean;
}

export function MiddleSection({ children, isTransitioned }: MiddleSectionProps) {
  return (
    <>
      <style jsx>{`
        /* Mobile devices (320px — 480px) */
        .middle-section {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .middle-content {
          max-width: 100%;
        }
        
        /* iPads, Tablets (481px — 768px) */
        @media screen and (min-width: 481px) and (max-width: 768px) {
          .middle-section {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          .middle-content {
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
        }
        
        /* Small screens, laptops - 13-inch (769px — 1024px) */
        @media screen and (min-width: 769px) and (max-width: 1024px) {
          .middle-section {
            padding-left: 0;
            padding-right: 0;
          }
          .middle-content {
            max-width: 680px;
            margin-left: auto;
            margin-right: auto;
          }
        }
        
        /* Desktops, large screens - 15-inch+ (1025px — 1280px) */
        @media screen and (min-width: 1025px) and (max-width: 1280px) {
          .middle-section {
            padding-left: 0;
            padding-right: 0;
          }
          .middle-content {
            max-width: 680px;
            margin-left: auto;
            margin-right: auto;
          }
        }
        
        /* Extra large screens (1281px and more) */
        @media screen and (min-width: 1281px) {
          .middle-section {
            padding-left: 0;
            padding-right: 0;
          }
          .middle-content {
            max-width: 720px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
      <div className="middle-section relative flex-1 min-h-0">
        <div className="middle-content h-full w-full flex items-center justify-between">
          {children}
        </div>
      </div>
    </>
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
    <>
      <style jsx>{`
        /* Mobile devices (320px — 480px) */
         @media (max-width: 480px) {
            .lives-container {
            margin-top: 0.25rem;
            margin-bottom: 3.5rem;
            }
            
            .keyboard-container {
            height: 145px;
            }
        }
        
        /* iPads, Tablets (481px — 768px) */
         @media (min-width: 481px) and (max-width: 768px) {
          .lives-container {
            margin-top: 6rem;
            margin-bottom: 6rem;
          }
          
          .keyboard-container {
            height: 160px;
          }
        }
        
        /* Small screens, laptops - 13-inch (769px — 1024px) */
        
        @media (min-width: 769px) and (max-width: 1024px) {
          
        .lives-container {
            margin-top: 2rem;
            margin-bottom: 2rem;
          }
          
          .keyboard-container {
            height: 180px;
          }
        }
        
        /* Desktops, large screens - 15-inch+ (1025px — 1280px) */
        @media (min-width: 1025px) and (max-width: 1280px) {
          .lives-container {
            margin-top: 2rem;
            margin-bottom: 0.25rem;
          }
          
          .keyboard-container {
            height: 150px;
          }
        }
        
        /* Extra large screens, TV (1281px and more) */
        @media (min-width: 1281px) {
          .lives-container {
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          
          .keyboard-container {
            height: 210px;
          }
        }

      `}</style>
      <div className="shrink-0">
        
        {/* Lives */}
        <div 
          className={`lives-container w-full flex justify-center transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          {livesComponent}
        </div>
        
        {/* Keyboard */}
        <div 
          className={`keyboard-container relative flex items-end justify-center transition-all duration-700 ${
            isTransitioned ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ 
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))'
          }}
        >
          {keyboardComponent}
        </div>
      </div>
    </>
  );
}