// components/messages/MessageBox.jsx

import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from '@/lib/gameConfig';

const MessageBox = ({ message, type, onClose, duration = GameConfig.messages.messageDelay }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (message) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Show the message
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
      
      // Auto-hide after duration
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        // Remove from DOM after animation
        setTimeout(() => {
          setShouldRender(false);
          if (onClose) onClose();
        }, 300);
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [message, duration, onClose]);

  if (!shouldRender) return null;

  // Style of the Messages
  const getMessageStyles = () => {
    const baseStyles = "px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium title-text text-center shadow-lg transition-all duration-300 transform w-[90vw] sm:max-w-md mx-auto text-xs sm:text-base";
    
    switch (type) {
      case 'error':
        return `${baseStyles} text-red-700 dark:text-red-400`;
      case 'success':
        return `${baseStyles} text-green-700 dark:text-green-400`;
      case 'info':
      default:
        return `${baseStyles} text-black dark:text-white`;  
    }
  };

  return (
    <div className={`fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={getMessageStyles()}>
        {message}
      </div>
    </div>
  );
};

export default MessageBox;