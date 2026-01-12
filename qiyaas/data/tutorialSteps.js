// data/tutorialSteps.js

import { Clue1Example, Clue2Example, Clue3Example } from '@/components/game_assets/game_walkthrough/components/ClueExamples';
import NVADisplay from '@/components/game_assets/game_walkthrough/components/NVADisplay';
import NumberCluesDisplay from '@/components/game_assets/game_walkthrough/components/NumberCluesDisplay';
import EmptyStartingLetters from '@/components/game_assets/game_walkthrough/components/EmptyStartingLetters';
import PendingAdditionalLetters from '@/components/game_assets/game_walkthrough/components/PendingAdditionalLetters';
import ExampleWordsDisplay from '@/components/game_assets/game_walkthrough/components/ExampleWordsDisplay';

export const tutorialSteps = [
  {
    id: 0,
    title: `Hello. Welcome to <span style="color:#CC00FF">Qiyaas</span>`, 
    content: `This is a word game based on numbers`
  },

  {
    id: 1,
    title: `Each puzzle has one <span style="color:#74A8DC">noun</span>,\
              one <span style="color:#6AA84F">verb</span>, and \
              one  <span style="color:#E06666">adjective</span>`, 
    content: "",
    component: NVADisplay
  },

  {
    id: 2,
    title: `The numbers on the right represent the different <span style="color:#12B503">clues</span>`, 
    content: `Number clues range from <span style="color:#74A8DC">1</span> <span style="color:#6AA84F">--></span> <span style="color:#E06666">9</span>`,
    component: NumberCluesDisplay
  },

  {
    id: 3,
    title: `Each <span style="text-decoration: underline; color:#12B503">clue</span> is unique and will only appear once.`,
    content: `Here's how the different clues work`,
  },

  {
    id: 4,
    title: `<span style="text-decoration: underline; color:#12B503">Clue 1:</span>`,
    content: `Number = length rule
              The number represents the length of the word`,
    component: Clue1Example
  },

  {
    id: 5,
    title: `<span style="text-decoration: underline; color:#12B503">Clue 2:</span>`,
    content: `Number = alphabet rule
              The number shown (e.g. <span style="color:#6AA84F; font-weight: bold">1</span>) means that the word starts with the first letter in the alphabet. (<span style="color:#6AA84F; font-weight: bold">1 = A</span>).
              A <span style="color:#6AA84F; font-weight: bold">2</span> would mean it starts with the second letter (<span style="color:#6AA84F; font-weight: bold">2 = B</span>), and so on.`,
    component: Clue2Example
  },

  {
    id: 6,
    title: `<span style="text-decoration: underline; color:#12B503">Clue 3:</span>`,
    content: `Number = number rule
              The number shown (e.g. <span style="color:#E06666; font-weight: bold">7</span>) means that the word starts with the number's first letter. (7 = <span style="background-color:#E06666; text-decoration: underline; font-weight: bold">S</span>even)`,
    component: Clue3Example
  },

  {
    id: 7,
    title: `You will start by selecting some letters`,
    content: `<span style="color:#CC00FF">3</span> consonants, <span style="color:#CC00FF">1</span> vowel`,
    component: EmptyStartingLetters
  },

  {
    id: 8,
    title: `You may guess 1 additional <span style="color:#CC00FF">consonant</span> and <span style="color:#CC00FF">vowel</span> at any point throughout the game`,
    content: `If you guess wrong you will <span style="color:#CC00FF">lose a life</span>`,
    component: PendingAdditionalLetters
  },
  {
    id: 9,
    title: `<span style="text-decoration: underline;">Keyboard Rules</span>`,
    content: ``
  },

  {
    id: 10,
    title: `You have <span style="color:#CC00FF">5 chances</span> to solve the puzzle`,
    content: `Use some reasoning and the puzzle will slowly start to reveal itself.
              Good luck 💭`,
    component: ExampleWordsDisplay
  }
];