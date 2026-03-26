// qiyaas/components/game_assets/messages/MessageBox.jsx

import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from '@/lib/gameConfig';

const MessageBox = ({ 
  message, 
  type, 
  onClose, 
  duration = GameConfig.duration.messageDelay,
  persist = false,
  top = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timerRef = useRef(null);
  const fadeOutRef = useRef(null);

  useEffect(() => {

    if (message) {
      // Clear any existing timer
      if (timerRef.current) clearTimeout(timerRef.current);
      
      if (fadeOutRef.current) clearTimeout(fadeOutRef.current);
      
      // Show the message
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), GameConfig.duration.messageFadeInDelay);
      
      // Only auto-hide if not persistent
      if (!persist) {
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
          fadeOutRef.current = setTimeout(() => {
                      setShouldRender(false);
                      if (onClose) onClose();
                    }, GameConfig.duration.messageFadeOutDelay);
                  }, duration);      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        if (fadeOutRef.current) {
          clearTimeout(fadeOutRef.current);
        }
      };
    } else {
      // Only hide if we're not in persist mode
      if (!persist) {
        setIsVisible(false);
        fadeOutRef.current = setTimeout(() => setShouldRender(false), GameConfig.duration.messageFadeOutDelay);
        return () => clearTimeout(fadeOutRef.current);
      }
    }
  }, [message, duration, onClose, persist]);

  if (!shouldRender) return null;

  // Style of the Messages
  const getMessageStyles = () => {
    const baseStyles = "px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium title-text text-center shadow-lg transition-all duration-300 transform w-[90vw] sm:max-w-md mx-auto message-text";
    
    switch (type) {
      case 'error':
        return `${baseStyles} ${GameConfig.messageColors.error}`;
      case 'success':
        return `${baseStyles} ${GameConfig.messageColors.success}`;
      case 'info':
        return `${baseStyles} ${GameConfig.messageColors.info}`;
      default:
        return `${baseStyles} ${GameConfig.messageColors.error}`;  
    }
  };

  return (
    <>
      <style jsx>{`
        /* Mobile devices (320px — 480px) */
        .message-box {
          top: 25%;
        }
        
        /* iPads, Tablets (481px — 768px) */
        @media screen and (min-width: 481px) and (max-width: 768px) {
          .message-box {
            top: 18%;
          }
        }
        
        /* Small screens, laptops - 13-inch (769px — 1024px) */
        @media screen and (min-width: 769px) and (max-width: 1024px) {
          .message-box {
            top: 28%;
          }
        }
        
        /* iPad Pro 11" (834px wide, 1194px tall) and iPad Pro 12.9" (1024px wide, 1366px tall) */
        @media screen and (min-width: 769px) and (max-width: 1024px) and (min-height: 1000px) {
        .message-box {
          top: 20%;
        }
      }

        /* Desktops, large screens - 15-inch+ (1025px — 1280px) */
        @media screen and (min-width: 1025px) and (max-width: 1280px) {
          .message-box {
            top: 25%;
          }
        }
        
        /* Extra large screens, TV (1281px and more) */
        @media screen and (min-width: 1281px) {
          .message-box {
            top: 19%;
          }
        }
      `}</style>
      <div 
        className={`message-box fixed left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        style={top !== null ? { top } : undefined}
      >
        <div className={`${getMessageStyles()} whitespace-nowrap`}>
          {message}
        </div>
      </div>
    </>
  );
};

export default MessageBox;