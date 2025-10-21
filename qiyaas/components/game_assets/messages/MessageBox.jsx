// components/messages/MessageBox.jsx

import React, { useState, useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const MessageBox = ({ message, type, onClose, duration = 3000 }) => {
    
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    
    if (message) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // If already showing a message, briefly hide it then show new one
      if (shouldRender && displayMessage !== message) {
        setIsVisible(false);
        setTimeout(() => {
          setDisplayMessage(message);
          setIsVisible(true);
        }, 150);
      } else {
        // First message or same message
        setDisplayMessage(message);
        setShouldRender(true);
        setTimeout(() => setIsVisible(true), 10);
      }
      
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
    } 
    else {
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
    }
  };

  return (
    <div className={`fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={getMessageStyles()}>
        <div className="flex items-center justify-between">
          <span className="flex-1">{message}</span>
          {/* Button to close the message */}
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  setShouldRender(false);
                  onClose();
                }, 300);
              }}
              className="ml-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <CloseIcon/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBox;