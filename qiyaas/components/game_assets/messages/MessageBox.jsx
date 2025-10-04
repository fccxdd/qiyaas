// components/messages/MessageBox.jsx

import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const MessageBox = ({ message, type, onClose, duration = 3000 }) => {
    
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    
    if (message) {
      setShouldRender(true);
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 10);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Remove from DOM after animation
        setTimeout(() => {
          setShouldRender(false);
          if (onClose) onClose();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    } 
    else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [message, duration, onClose]);

  if (!shouldRender) return null;

    // Style of the Messages
    const getMessageStyles = () => {
    const baseStyles = "px-6 py-3 rounded-lg font-medium title-text text-center shadow-lg transition-all duration-300 transform max-w-md mx-auto";
    
    switch (type) {
      case 'error':
        return `${baseStyles} text-red-700 dark:text-red-400`;
      case 'success':
        return `${baseStyles} text-green-700 dark:text-green-400`;
    }
  };

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
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
mat};

export default MessageBox;