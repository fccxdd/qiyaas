// components/ThemeToggle.tsx

// Toggle to Enable Light Mode and Dark Mode
'use client'

import { useState, useEffect } from 'react'
import { MdLightMode, MdDarkMode } from 'react-icons/md'

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false)

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setDarkMode(false)
    //   console.log('Switched to light mode', document.documentElement.classList.contains('dark'))
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setDarkMode(true)
    //   console.log('Switched to dark mode', document.documentElement.classList.contains('dark'))
    }
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-600"
      aria-label="Toggle dark mode"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          darkMode ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {/* Material Design Icons */}
      <span className="absolute left-1 top-1">
        {darkMode ? (
          <MdLightMode className="h-4 w-4" style={{ color: '#FAA70D' }} />
        ) : (
          <MdDarkMode className="h-4 w-4" style={{ color: '#CC00FF' }} />
        )}
      </span>
    </button>
  )
}