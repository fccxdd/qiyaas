// data/tutorialWords.js
// ─────────────────────────────────────────────────────────────────────────────
// Tutorial game data. Each entry satisfies the DailyWordPuzzle type from
// ExtractAnswer so it can be passed directly into useTutorialGameState.
//
// ClueWithType fields required:
//   word, type, rule, number, length_category, word_length
// ─────────────────────────────────────────────────────────────────────────────

export const TutorialGame1 = {

  // Satisfies DailyWordPuzzle
  date: 'tutorial-1',

  selectedLetters: '',

  keyboard: {
    still_available: [],
    used_up:         [],
  },

  cluesData: {
    date: 'tutorial-1',

    clue_1: {
      word:            'TUTORIAL',
      type:            'NOUN',
      rule:            'number_rule',
      number:          2,
      length_category: 'long',
      word_length:     8,
    },

    clue_2: {
      word:            'RETAIN',
      type:            'VERB',
      rule:            'length_rule',
      number:          6,
      length_category: 'medium',
      word_length:     6,
    },

    clue_3: {
      word:            'EASY',
      type:            'ADJECTIVE',
      rule:            'alphabet_rule',
      number:          5,
      length_category: 'short',
      word_length:     4,
    },

    numbers_for_clue: [2, 6, 5],

  },

  // All empty — player starts from scratch
  wordInputs: {
    clue_1: [null, null, null, null, null],
    clue_2: [null, null, null, null, null, null],
    clue_3: [null, null, null, null, null],

  },

};

// ─────────────────────────────────────────────────────────────────────────────

export const TutorialGame2 = {

  date: 'tutorial-2',

  selectedLetters: '',

  keyboard: {
    still_available: [],
    used_up:         [],
  },

  cluesData: {
    date: 'tutorial-2',

    numbers_for_clue: [7, 1, 5],

    clue_1: {
      word:            'SMART',
      type:            'ADJECTIVE',
      rule:            'number_rule',
      number:          7,
      length_category: 'short',
      word_length:     5,
    },
    clue_2: {
      word:            'ARRIVE',
      type:            'VERB',
      rule:            'alphabet_rule',
      number:          1,
      length_category: 'medium',
      word_length:     6,
    },
    clue_3: {
      word:            'TIGER',
      type:            'NOUN',
      rule:            'length_rule',
      number:          5,
      length_category: 'short',
      word_length:     5,
    },
  },

  // All empty — player starts from scratch
  wordInputs: {
    clue_1: [null, null, null, null, null],
    clue_2: [null, null, null, null, null, null],
    clue_3: [null, null, null, null, null],
  },

};