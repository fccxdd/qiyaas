// components/game_assets/game_walkthrough/ThemeMediaPlayer.tsx

'use client';

import React from 'react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ThemeMediaPlayerProps {
  lightSrc: string;
  darkSrc: string;
  type?: 'video' | 'image';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  displayWidth?: string | number;  // Display size (e.g., '50%', '400px', 400)
  displayHeight?: string | number; // Display size
  className?: string;
  alt?: string;
  imageWidth?: number;   // Actual image resolution width
  imageHeight?: number;  // Actual image resolution height
  priority?: boolean;
}

export function ThemeMediaPlayer({
  lightSrc,
  darkSrc,
  type = 'video',
  autoplay = true,
  loop = true,
  muted = true,
  controls = false,
  displayWidth = '100%',
  displayHeight = 'auto',
  className = '',
  alt = 'Demo media',
  imageWidth = 800,
  imageHeight = 600,
  priority = false
}: ThemeMediaPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Check for dark mode on mount and when it changes
  useEffect(() => {
    // Initial check
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass);
    };

    checkDarkMode();
    setMounted(true);

    // Set up a MutationObserver to watch for class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  // Show loading state during mount to prevent hydration mismatch
  if (!mounted) {
    return <div className="media-container" style={{ maxWidth: '600px', margin: '0 auto', height: '400px' }} />;
  }

  const currentSrc = isDark ? darkSrc : lightSrc;

  if (type === 'video') {
    return (
      <>
        <style jsx>{`
          /* Mobile devices (320px — 480px) */
          .media-container {
            max-width: 100%;
            margin: 0 auto;
            display: flex;
            justify-content: center;
            align-items: center;
            padding-top: 0.5rem;
          }
          
          .media-element {
            width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            display: block;
            margin: 0 auto;
          }
          
          /* iPads, Tablets (481px — 768px) */
          @media (min-width: 481px) and (max-width: 768px) {
            .media-container {
              max-width: 500px;
              padding-top: 1rem;
            }
          }
          
          /* Small screens, laptops - 13-inch (769px — 1024px) */
          @media (min-width: 769px) and (max-width: 1024px) {
            .media-container {
              max-width: 450px;
              padding-top: 1.5rem;
              margin-top: 1rem;
            }
            
            .media-element {
              max-height: 280px;
              object-fit: contain;
            }
          }
          
          /* Desktops, large screens - 15-inch+ (1025px — 1280px) */
          @media (min-width: 1025px) and (max-width: 1280px) {
            .media-container {
              max-width: 550px;
              padding-top: 2rem;
            }
            
            .media-element {
              max-height: 350px;
            }
          }
          
          /* Extra large screens, TV (1281px and more) */
          @media (min-width: 1281px) {
            .media-container {
              max-width: 600px;
              padding-top: 2rem;
            }
          }
        `}</style>
        <div className={`media-container ${className}`}>
          <video
            key={currentSrc}
            src={currentSrc}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline
            className="media-element"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </>
    );
  }

  // Image type
  return (
    <>
      <style jsx>{`
        /* Mobile devices (320px — 480px) */
        .media-container {
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-top: 0.5rem;
        }
        
        /* iPads, Tablets (481px — 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .media-container {
            max-width: 500px;
            padding-top: 1rem;
          }
        }
        
        /* Small screens, laptops - 13-inch (769px — 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .media-container {
            max-width: 450px;
            padding-top: 1.5rem;
            margin-top: 1rem;
          }
        }
        
        /* Desktops, large screens - 15-inch+ (1025px — 1280px) */
        @media (min-width: 1025px) and (max-width: 1280px) {
          .media-container {
            max-width: 550px;
            padding-top: 2rem;
          }
        }
        
        /* Extra large screens, TV (1281px and more) */
        @media (min-width: 1281px) {
          .media-container {
            max-width: 600px;
            padding-top: 2rem;
          }
        }
        
        .image-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
      `}</style>
      <div className={`media-container ${className}`}>
        <div className="image-wrapper">
          <Image
            key={currentSrc}
            src={currentSrc}
            alt={alt}
            width={imageWidth}
            height={imageHeight}
            priority={priority}
            className="object-contain"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '280px'
            }}
          />
        </div>
      </div>
    </>
  );
}

// Specific demo components with theme support

export function LetterSelectionDemo() {
  return (
    <ThemeMediaPlayer 
      lightSrc="/tutorial_steps/letter-selection-demo-light.mp4"
      darkSrc="/tutorial_steps/letter-selection-demo-dark_resized.mp4"
      type="video"
      autoplay={true}
      loop={true}
      muted={true}
      controls={false}
    />
  );
}

export function HintToggleScreenshot() {
  return (
    <ThemeMediaPlayer 
      lightSrc="/tutorial_steps/hint-toggle-light.png"
      darkSrc="/tutorial_steps/hint-toggle-dark.png"
      type="image"
      alt="Hint toggle example"
      imageWidth={800}       // Actual image resolution
      imageHeight={600}      // Actual image resolution
      displayWidth="100%"     // Display size (makes it smaller)
      displayHeight="auto"   // Maintains aspect ratio
      priority={false}
    />
  );
}

export function WordSolvingDemo() {
  return (
    <ThemeMediaPlayer 
      lightSrc="/videos/word-solving-light.mp4"
      darkSrc="/videos/word-solving-dark.mp4"
      type="video"
      autoplay={true}
      loop={true}
      muted={true}
      controls={false}
    />
  );
}

export function FirstClueDemo() {
  return (
    <ThemeMediaPlayer 
      lightSrc="/videos/first-clue-light.mp4"
      darkSrc="/videos/first-clue-dark.mp4"
      type="video"
      autoplay={true}
      loop={true}
      muted={true}
      controls={false}
    />
  );
}

export function SecondClueDemo() {
  return (
    <ThemeMediaPlayer 
      lightSrc="/videos/second-clue-light.mp4"
      darkSrc="/videos/second-clue-dark.mp4"
      type="video"
      autoplay={true}
      loop={true}
      muted={true}
      controls={false}
    />
  );
}

export function ThirdClueDemo() {
  return (
    <ThemeMediaPlayer 
      lightSrc="/videos/third-clue-light.mp4"
      darkSrc="/videos/third-clue-dark.mp4"
      type="video"
      autoplay={true}
      loop={true}
      muted={true}
      controls={false}
    />
  );
}