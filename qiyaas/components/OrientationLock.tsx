// components/OrientationLock.tsx

"use client"

import React, { useState, useEffect } from 'react';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';

const OrientationLock = ({ children }: { children: React.ReactNode }) => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is mobile/tablet
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || (window.innerWidth <= 1024 && 'ontouchstart' in window);
      
      setIsMobile(isMobileDevice);
      
      // Only check orientation on mobile devices
      if (isMobileDevice) {
        const isCurrentlyLandscape = window.innerWidth > window.innerHeight;
        setIsLandscape(isCurrentlyLandscape);
      } else {
        setIsLandscape(false); // Never show rotation message on desktop
      }
    };

    // Check orientation on mount
    checkOrientation();

    // Listen for orientation/resize changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Show landscape warning overlay (only on mobile devices)
  if (isMobile && isLandscape) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-8">
        <div className="text-center max-w-sm">
          {/* Rotating phone icon */}
          <div className="mb-8 animate-bounce">
            <ScreenRotationIcon className="text-white mx-auto animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          
          {/* Main message */}
          <h2 className="text-white text-2xl font-bold mb-4">
            Please Rotate Your Device
          </h2>
          
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            This app is designed for portrait mode only. Please rotate your device to continue.
          </p>
          
          {/* Visual phone representation */}
          <div className="flex justify-center items-center gap-4 mb-6">
            {/* Landscape phone (crossed out) */}
            <div className="relative">
              <div className="w-16 h-10 bg-gray-700 rounded-lg border-2 border-gray-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-1 bg-red-500 rotate-45 absolute"></div>
                <div className="w-20 h-1 bg-red-500 -rotate-45 absolute"></div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="text-white text-2xl">→</div>
            
            {/* Portrait phone (preferred) */}
            <div className="w-10 h-16 bg-green-600 rounded-lg border-2 border-green-400 flex items-center justify-center">
              <div className="w-1 h-8 bg-green-200 rounded"></div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm">
            Rotate your device to portrait mode to play Qiyaas.
          </p>
        </div>
      </div>
    );
  }

  // Show normal app content in portrait mode
  return <>{children}</>;
};

export default OrientationLock;