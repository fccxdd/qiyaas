// components/game_assets/game_over/dailyGameTracker.js

/**
 * Daily Game Tracker - Simple tracker for once-per-day gameplay
 * Uses localStorage to track when user last played
 */

const STORAGE_KEY = 'wordGameLastPlayed';

/**
 * Get today's date string in YYYY-MM-DD format (local timezone)
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if user has already played today
 * @returns {boolean} - true if already played today, false otherwise
 */
export function hasPlayedToday() {
  try {
    const lastPlayed = localStorage.getItem(STORAGE_KEY);
    const today = getTodayDateString();
    return lastPlayed === today;
  } catch (error) {
    console.error('Error checking if played today:', error);
    return false;
  }
}

/**
 * Mark today as played
 */
export function markTodayAsPlayed() {
  try {
    const today = getTodayDateString();
    localStorage.setItem(STORAGE_KEY, today);
  } catch (error) {
    console.error('Error marking today as played:', error);
  }
}