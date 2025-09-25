// components/LetterSelector.jsx

import { useState, useEffect } from 'react';

export default function LetterSelector({ 
  isActive = false, 
  onLettersChange = null, 
  virtualKeyboardInput = null,
  persistedLetters = null,
  onLettersLocked = null 
}) {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState('');

  // Vowels and consonants
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
  
  // Load persisted letters when component mounts
  useEffect(() => {
    if (persistedLetters && persistedLetters.length > 0) {
      setSelectedLetters(persistedLetters);
      setIsLocked(true);
    }
  }, [persistedLetters]);
  
  const validateLetters = (letters) => {
    if (letters.length === 0) return '';
    
    const currentVowels = letters.filter(l => vowels.includes(l)).length;
    const currentConsonants = letters.filter(l => consonants.includes(l)).length;
    
    if (currentVowels > 1) {
      return 'Only 1 vowel allowed!';
    }
    if (currentConsonants > 3) {
      return 'Only 3 consonants allowed!';
    }
    if (letters.length > 4) {
      return 'Maximum 4 letters allowed!';
    }
    
    return '';
  };

  const addLetter = (letter) => {
    if (isLocked) return;
    
    const upperLetter = letter.toUpperCase();
    
    // Check if letter is already selected
    if (selectedLetters.includes(upperLetter)) {
      setError('Letter already selected!');
      return;
    }
    
    const newLetters = [...selectedLetters, upperLetter];
    const validationError = validateLetters(newLetters);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Add letter immediately
    setSelectedLetters(newLetters);
    setError('');
    
    // Callback to parent component
    if (onLettersChange) {
      onLettersChange(newLetters);
    }
  };

  const removeLetter = () => {
    if (isLocked) return;
    
    const newLetters = selectedLetters.slice(0, -1);
    setSelectedLetters(newLetters);
    setError('');
    if (onLettersChange) {
      onLettersChange(newLetters);
    }
  };

  const clearAllLetters = () => {
    if (isLocked) return;
    
    setSelectedLetters([]);
    setError('');
    if (onLettersChange) {
      onLettersChange([]);
    }
  };

  const lockLetters = () => {
    if (selectedLetters.length === 0) {
      setError('No letters to lock!');
      return;
    }
    
    // Final validation
    const currentVowels = selectedLetters.filter(l => vowels.includes(l)).length;
    const currentConsonants = selectedLetters.filter(l => consonants.includes(l)).length;
    
    if (currentVowels !== 1 || currentConsonants !== 3) {
      setError('Must have exactly 3 consonants and 1 vowel to lock!');
      return;
    }
    
    setIsLocked(true);
    setError('');
    
    // Notify parent that letters are locked
    if (onLettersLocked) {
      onLettersLocked(selectedLetters);
    }
  };

  // Handle virtual keyboard input
  useEffect(() => {
    if (!isActive || !virtualKeyboardInput) return;

    const { type, value } = virtualKeyboardInput;
    
    if (type === 'letter') {
      addLetter(value);
    } else if (type === 'enter') {
      lockLetters();
    } else if (type === 'backspace') {
      removeLetter();
    } else if (type === 'clear') {
      clearAllLetters();
    }
  }, [virtualKeyboardInput, isActive, selectedLetters, isLocked]);

  // Handle physical keyboard input
  useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = (e) => {
      if (/^[A-Za-z]$/.test(e.key)) {
        e.preventDefault();
        addLetter(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        lockLetters();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeLetter();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearAllLetters();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, selectedLetters, isLocked]);

  // Only show when active (letter selection step)
  if (!isActive) return null;

  return (
    <>
      {/* Selected Letters Display - Top Left Area */}
      <div className="absolute top-4 left-4 z-30">
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedLetters.map((letter, index) => (
            <button
              key={index}
              className={`w-12 h-12 rounded-full font-semibold text-lg transition-all duration-150 transform shadow-lg flex items-center justify-center ${
                isLocked 
                  ? 'bg-green-500 text-white' 
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm mb-2 max-w-64">
            {error}
          </div>
        )}
        
        {/* Instructions */}
        <div className="text-xs text-gray-600 dark:text-gray-400 max-w-48">
          {isLocked ? (
            <span className="text-green-600 font-semibold">
              Letters locked! Navigate to next slide.
            </span>
          ) : (
            <>
              Type letter (adds instantly)<br/>
              Backspace: Remove last<br/>
              Enter: Lock letters<br/>
              Esc: Clear all<br/>
              <span className="text-blue-500">Need: 3 consonants + 1 vowel</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}