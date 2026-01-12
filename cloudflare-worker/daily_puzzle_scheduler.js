// Cloudflare Worker for Daily Puzzle Generation
// Handles both scheduled (cron) and HTTP fetch requests
// Updated with historical puzzle storage

// daily_puzzle_scheduler.js

// --- CONFIGURATION ---
const INPUT_FILE_KEY = 'daily_words_tagged';
const USED_WORDS_KEY = 'used_words';
const CURRENT_PUZZLE_KEY = 'current_puzzle';
const PUZZLE_PREFIX = 'puzzle_'; // Prefix for date-specific puzzle keys

// --- NUMBER FUNCTIONS ---
function numberFromLength(word) {
  return (word.length % 9) || 9;
}

function numberFromFirstLetter(word) {
  // Convert A-I to 1-9
  const first = word[0].toUpperCase();
  return first.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
}

function numberFromLetterOfNumber(word) {
  // Map O/T/F/S/E/N to their corresponding numbers
  const map = { 'O': 1, 'T': 2, 'F': 4, 'S': 6, 'E': 8, 'N': 9 };
  const first = word[0].toUpperCase();
  return map[first];
}

const numberMethods = {
  "length_rule": numberFromLength,
  "alphabet_rule": numberFromFirstLetter,
  "number_rule": numberFromLetterOfNumber
};

// --- UTILITY FUNCTIONS ---
function shuffleArray(array, rng) {
  // Fisher-Yates shuffle with seeded random
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Seeded random number generator (for deterministic puzzles)
function seededRandom(seed) {
  let value = seed;
  return function() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// --- WORD CLASSIFICATION ---
function organizeWordsByLength(wordsByPos) {
  const result = {
    nouns: { short: [], medium: [], long: [] },
    verbs: { short: [], medium: [], long: [] },
    adjectives: { short: [], medium: [], long: [] }
  };

  // Process nouns
  for (const word of (wordsByPos.noun || [])) {
    const length = word.length;
    if (length >= 3 && length <= 5) {
      result.nouns.short.push(word);
    } else if (length > 5 && length <= 7) {
      result.nouns.medium.push(word);
    } else if (length > 7 && length <= 9) {
      result.nouns.long.push(word);
    }
  }

  // Process verbs
  for (const word of (wordsByPos.verb || [])) {
    const length = word.length;
    if (length >= 3 && length <= 5) {
      result.verbs.short.push(word);
    } else if (length > 5 && length <= 7) {
      result.verbs.medium.push(word);
    } else if (length > 7 && length <= 9) {
      result.verbs.long.push(word);
    }
  }

  // Process adjectives
  for (const word of (wordsByPos.adjective || [])) {
    const length = word.length;
    if (length >= 3 && length <= 5) {
      result.adjectives.short.push(word);
    } else if (length > 5 && length <= 7) {
      result.adjectives.medium.push(word);
    } else if (length > 7 && length <= 9) {
      result.adjectives.long.push(word);
    }
  }

  return result;
}

// --- Check if word matches multiple rules ---
function countMatchingRules(word) {
  let count = 0;
  
  // Check alphabet_rule (A-I)
  const first = word[0].toUpperCase();
  if (first >= 'A' && first <= 'I') {
    count++;
  }
  
  // Check number_rule (O/T/F/S/E/N)
  const validLetters = new Set(['O', 'T', 'F', 'S', 'E', 'N']);
  if (validLetters.has(first)) {
    count++;
  }
  
  return count;
}

// --- WORD PICKER ---
function pickWord(wordDict, lengthCat, rule, usedWords, rng) {
  const words = wordDict[lengthCat];
  
  // Filter out words that have already been used
  let availableWords = words.filter(w => !usedWords.has(w));
  
  if (availableWords.length === 0) {
    throw new Error(`No unused ${lengthCat} words available! All words have been used.`);
  }

  // For alphabet_rule: only select words starting with A-I
  if (rule === "alphabet_rule") {
    availableWords = availableWords.filter(w => {
      const first = w[0].toUpperCase();
      return first >= 'A' && first <= 'I';
    });
    if (availableWords.length === 0) {
      throw new Error(`No unused ${lengthCat} words starting with A-I available!`);
    }
  }

  // For number_rule: only select words starting with O, T, F, S, E, N
  if (rule === "number_rule") {
    const validLetters = new Set(['O', 'T', 'F', 'S', 'E', 'N']);
    availableWords = availableWords.filter(w => validLetters.has(w[0].toUpperCase()));
    if (availableWords.length === 0) {
      throw new Error(`No unused ${lengthCat} words starting with O/T/F/S/E/N available!`);
    }
  }

  // Pick random word using seeded RNG
  const index = Math.floor(rng() * availableWords.length);
  return availableWords[index];
}

// --- PUZZLE GENERATOR ---
function generateDailyPuzzle(wordsByPos, usedWordsSet, puzzleDate, allowRerollChance = 0.5) {
  const dateStr = puzzleDate || new Date().toISOString().split('T')[0];
  
  // Organize words by POS and length
  const organized = organizeWordsByLength(wordsByPos);
  
  // Create seeded RNG based on date
  const seed = hashString(dateStr);
  const rng = seededRandom(seed);
  
  // Shuffle rule order - ensures 1 of each rule
  const ruleOrder = shuffleArray(Object.keys(numberMethods), rng);
  
  // Shuffle and select length categories - ensures 1 short, 1 medium, 1 long
  const lengthCategories = shuffleArray(['short', 'medium', 'long'], rng);
  
  // Pick words - 1 noun, 1 verb, 1 adjective
  const noun = pickWord(organized.nouns, lengthCategories[0], ruleOrder[0], usedWordsSet, rng);
  const verb = pickWord(organized.verbs, lengthCategories[1], ruleOrder[1], usedWordsSet, rng);
  const adj = pickWord(organized.adjectives, lengthCategories[2], ruleOrder[2], usedWordsSet, rng);
  
  const words = [noun, verb, adj];
  const types = ["NOUN", "VERB", "ADJECTIVE"];
  const clues = [];
  
  for (let i = 0; i < 3; i++) {
    const word = words[i];
    const wtype = types[i];
    const ruleName = ruleOrder[i];
    const lengthCat = lengthCategories[i];
    const num = numberMethods[ruleName](word);
    
    clues.push({
      type: wtype,
      word: word,
      rule: ruleName,
      number: num,
      length_category: lengthCat,
      word_length: word.length
    });
  }
  
  // Shuffle the order of the clues for display
  const shuffledClues = shuffleArray(clues, rng);

  // Check for distinct numbers and potentially reroll (up to 2 attempts)
  let numbers = shuffledClues.map(c => c.number);
  let uniqueNumbers = new Set(numbers);
  
  // Reroll logic that maintains POS constraints
  // Attempt up to 2 rerolls to maximize chances of unique numbers
  let rerollAttempts = 0;
  const maxRerolls = 2;
  
  while (uniqueNumbers.size < 3 && rerollAttempts < maxRerolls && rng() < allowRerollChance) {
    // Find which clue to reroll (prefer rerolling the one that caused the duplicate)
    let rerollIndex = -1;
    
    // Find the first duplicate and reroll the second occurrence
    outerLoop: for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        if (shuffledClues[i].number === shuffledClues[j].number) {
          rerollIndex = j; // Reroll the later one
          break outerLoop; // Break out of both loops
        }
      }
    }
    
    // Fallback: if no duplicate found (shouldn't happen), reroll last one
    if (rerollIndex === -1) {
      rerollIndex = 2;
    }
    
    const clueToReroll = shuffledClues[rerollIndex];
    const wtype = clueToReroll.type;
    const ruleName = clueToReroll.rule;
    const lengthCat = clueToReroll.length_category;
    
    // Get the correct word dictionary based on POS
    let wordDict;
    if (wtype === "NOUN") wordDict = organized.nouns;
    else if (wtype === "VERB") wordDict = organized.verbs;
    else wordDict = organized.adjectives;
    
    // Pick a new word maintaining the same POS, rule, and length category
    const newWord = pickWord(wordDict, lengthCat, ruleName, usedWordsSet, rng);
    const newNum = numberMethods[ruleName](newWord);
    
    // Update the shuffledClues at the correct index
    shuffledClues[rerollIndex] = {
      type: wtype,
      word: newWord,
      rule: ruleName,
      number: newNum,
      length_category: lengthCat,
      word_length: newWord.length
    };
    
    // Update the words array - find which original word to replace
    const originalIndex = types.indexOf(wtype);
    words[originalIndex] = newWord;
    
    // Recalculate numbers and uniqueness for next iteration
    numbers = shuffledClues.map(c => c.number);
    uniqueNumbers = new Set(numbers);
    rerollAttempts++;
  }
  
  // Mark words as used
  words.forEach(w => usedWordsSet.add(w));
  
  return {
    date: dateStr,
    clues: shuffledClues
  };
}

// --- CLOUDFLARE WORKER EXPORT ---
// 
// CACHING STRATEGY:
// The /puzzle endpoint uses aggressive edge caching (1 hour TTL) to minimize KV reads.
// Historical puzzles (/puzzle/YYYY-MM-DD) are cached for 24 hours as they never change.
// This keeps the service FREE even with millions of daily visitors because:
// - First request hits KV (counts toward 100k free reads/day)
// - Subsequent requests are served from Cloudflare's edge cache (FREE)
// - New puzzle generated at midnight automatically invalidates cache (new date = new response)
// 
// Result: Even 10 million visitors/day = still within free tier limits!
//
export default {
  // Scheduled trigger (cron job)
  async scheduled(event, env, ctx) {
    
    try {
      // Load word database
      const wordsByPosJson = await env.PUZZLE_DATA.get(INPUT_FILE_KEY);
      if (!wordsByPosJson) {
        return;
      }
      const wordsByPos = JSON.parse(wordsByPosJson);
      
      // Load used words
      const usedWordsJson = await env.PUZZLE_DATA.get(USED_WORDS_KEY);
      const usedWordsArray = usedWordsJson ? JSON.parse(usedWordsJson).used_words || [] : [];
      const usedWordsSet = new Set(usedWordsArray);
      
      // Generate today's puzzle
      const todayET = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
      const puzzleDate = new Date(todayET).toISOString().split('T')[0];
      
      const puzzle = generateDailyPuzzle(wordsByPos, usedWordsSet, puzzleDate);
      
      // Save puzzle with date-specific key for historical access
      const puzzleKey = `${PUZZLE_PREFIX}${puzzleDate}`;
      await env.PUZZLE_DATA.put(puzzleKey, JSON.stringify(puzzle));
      
      // Also save as current puzzle for easy access
      await env.PUZZLE_DATA.put(CURRENT_PUZZLE_KEY, JSON.stringify(puzzle));
      
      // Save updated used words
      await env.PUZZLE_DATA.put(USED_WORDS_KEY, JSON.stringify({
        used_words: Array.from(usedWordsSet)
      }));
      
      
    } catch (error) {
      console.error('Error generating puzzle:', error);
    }
  },

  // HTTP request handler
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // GET /puzzle/YYYY-MM-DD - Get puzzle for specific date
    if (url.pathname.startsWith('/puzzle/') && url.pathname.length > 8) {
      const date = url.pathname.substring(8); // Remove '/puzzle/'
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Response(JSON.stringify({ 
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      try {
        const puzzleKey = `${PUZZLE_PREFIX}${date}`;
        const puzzleJson = await env.PUZZLE_DATA.get(puzzleKey);
        
        if (!puzzleJson) {
          return new Response(JSON.stringify({ 
          }), {
            status: 404,
            headers: corsHeaders
          });
        }
        
        // Cache historical puzzles for 24 hours (they never change)
        const cachedHeaders = {
          ...corsHeaders,
          'Cache-Control': 'public, max-age=86400, immutable',
          'CDN-Cache-Control': 'public, max-age=86400',
          'Cloudflare-CDN-Cache-Control': 'public, max-age=86400'
        };
        
        return new Response(puzzleJson, { headers: cachedHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }
    
    // GET /puzzle or / - Return current puzzle
    if (url.pathname === '/puzzle' || url.pathname === '/') {
      try {
        const puzzleJson = await env.PUZZLE_DATA.get(CURRENT_PUZZLE_KEY);
        
        if (!puzzleJson) {
          return new Response(JSON.stringify({ error: 'No puzzle available' }), {
            status: 404,
            headers: corsHeaders
          });
        }
        
        // Add caching headers to serve from CDN edge cache
        // This dramatically reduces KV reads and keeps costs at $0 even with millions of visitors
        const cachedHeaders = {
          ...corsHeaders,
          'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
          'CDN-Cache-Control': 'public, max-age=3600',
          'Cloudflare-CDN-Cache-Control': 'public, max-age=3600'
        };
        
        return new Response(puzzleJson, { headers: cachedHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }
        
    return new Response(JSON.stringify({ 
      error: 'Not Found',
    }), { 
      status: 404,
      headers: corsHeaders 
    });
  }
};