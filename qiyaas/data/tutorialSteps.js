import { LetterSelectionDemo, HintToggleScreenshot, WordSolvingDemo} from '@/components/game_assets/game_walkthrough/ThemeMediaPlayer';

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
    content: ""
  },

  {
    id: 2,
    title: `The numbers on the right represent the different <span style="color:#12B503">clues</span>`, 
    content: `Number clues range from <span style="color:#74A8DC">1</span> <span style="color:#6AA84F">--></span> <span style="color:#E06666">9</span>`,
     component: HintToggleScreenshot
  },

    {
    id: 3,
    title: `You will start by selecting some <span style="color:#12B503">letters</span>`,
    content: `Based on the number clues provided`,
    component: LetterSelectionDemo         
  },

  {
    id: 4,
    title: `<span style="text-decoration: underline; color:#12B503">Clue 1:</span>`,
    content: `number = word length <br>\
              e.g <span style="color:#CC00FF">7</span> = <span style="color:#CC00FF">7 letter word</span>`
  },

  {
    id: 5,
    title: `<span style="text-decoration: underline; color:#12B503">Clue 2:</span>`,
    content: `number = word's first letter <br>\
              e.g <span style="color:#CC00FF">1</span>=<span style="color:#CC00FF">A</span>`
  },

  {
    id: 6,
    title: `<span style="text-decoration: underline; color:#12B503">Clue 3:</span>`,
    content: `number's first letter = word's first letter <br>\
              e.g  <span style="color:#CC00FF">5</span> (<span style="text-decoration: underline; color:#CC00FF">F</span>ive) = <span style="color:#CC00FF">F</span>`
  },

  {
    id: 7,
    title: `<span style="text-decoration: underline;">Keyboard Rules</span>`,
    content: ``
  },

  {
    id: 8,
    title: `Each <span style="text-decoration: underline; color:#12B503">clue</span> will only appear once`,
    content: `You have <span style="color:#CC00FF">5 chances</span> to solve the puzzle. 
              Use some reasoning and the puzzle will slowly start to reveal itself.
              Good luck 💭`
  }


];