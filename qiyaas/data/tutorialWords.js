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

  selectedLetters: 'RSTE',

  keyboard: {
    still_available: ['U', 'O', 'P'],
    used_up:         ['E', 'R', 'T', 'A', 'S', 'L'],
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
      word:            'PLAY',
      type:            'VERB',
      rule:            'length_rule',
      number:          4,
      length_category: 'short',
      word_length:     4,
    },

    clue_3: {
      word:            'AWESOME',
      type:            'ADJECTIVE',
      rule:            'alphabet_rule',
      number:          1,
      length_category: 'medium',
      word_length:     7,
    },

    numbers_for_clue: [2, 4, 1],

  },

  // null = empty dash, string = pre-filled letter
  // Array length must match word_length for each clue
  wordInputs: {
    clue_1: ['T', null, 'T', null, 'R', null, 'A', 'L'],     // T _ T _ R _ A L (TUTORIAL)
    clue_2: [null, 'L', 'A', null],                           // _ L A _         (PLAY)
    clue_3: ['A', null, 'E', 'S', null, null, 'E'],          // A _ E S _ _ E  (AWESOME)

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
      word:            'HONEY',
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