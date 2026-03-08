import EmptyStartingLetters from "@/components/game_assets/game_walkthrough/components/EmptyStartingLetters";
import KeyboardPreview from "@/components/game_assets/game_walkthrough/components/KeyboardPreview";
import LifeBarLoss from "@/components/game_assets/game_walkthrough/components/LifeBarLoss";

export const TutorialGameInstructions = [
  {
    id: 0,
    title: `Welcome to Qiyaas!`,
    content: `A word game based on numbers`
  },

  {
    id: 1,
    title: `Each puzzle has a <span style="color:#74A8DC">noun,</span> <span style="color:#6AA84F">verb,</span> <span style="color:#E06666">adjective,</span> and a number that represents a clue.`,
    content: `Numbers range from <span style="font-weight: bold;">1 - 9</span>`
  },

  {
    id: 2,
    title: `Each clue is unique and will only appear once.`,
    content: `These are the different clues`
  },

  {
    id: 3,
    title: `Length clue`,
    content: `The number represents the <span style="font-weight: bold;">length</span> of the word.<br/><br/>
              <span style="color:#6AA84F; font-weight: bold">PROTECT&nbsp;&nbsp;&nbsp;&nbsp;<span style="background-color:#6AA84F; padding:1.5px 5px; color: white; border-radius:4px; font-weight: bold">7</span> = G , S</span><br/>
              <span style="color:#E06666; font-weight: bold">ORIGINAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="background-color:#E06666; padding:1.5px 5px; color: white; border-radius:4px; font-weight: bold">8</span> = H , E</span><br/>
              <span style="color:#74A8DC; font-weight: bold">CHOCOLATE&nbsp;<span style="background-color:#74A8DC; padding:1.5px 5px; color: white; border-radius:4px; font-weight: bold">9</span> = I , N</span>`
  },

  {
    id: 4,
    title: `Alphabet clue`,
    content: `Each number represents a <span style="font-weight: bold;">letter's position in the alphabet</span> telling you which letter the word starts with.<br/><br/>
              <span style="color:#74A8DC; font-weight: bold">APPLE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1 = <span style="background-color:#74A8DC; padding:1.5px 5px; color: white; border-radius:4px; font-weight: bold">A</span> , O</span><br/>
              <span style="color:#6AA84F; font-weight: bold">BOUNCE&nbsp;&nbsp;&nbsp;2 = <span style="background-color:#6AA84F; padding:1.5px 5px; color: white; border-radius:4px; font-weight: bold">B</span> , T</span><br/>
              <span style="color:#E06666; font-weight: bold">CLEAR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3 = <span style="background-color:#E06666; padding:1.5px 5px; color: white; border-radius:4px; font-weight: bold">C</span> , T</span>`
  },

  {
    id: 5,
    title: `Number clue`,
    content: `Each number tells you to <span style="font-weight: bold;">start the word with the first letter of that number</span>.<br/>
              4 = <span style="text-decoration:underline; font-weight:bold; color:#74A8DC;">F</span>our, 5 = <span style="text-decoration:underline; font-weight:bold; color:#E06666;">F</span>ive, 6 = <span style="text-decoration:underline; font-weight:bold; color:#6AA84F;">S</span>ix<br/><br/>
              <span style="color:#74A8DC; font-weight: bold">FLOWER&nbsp;&nbsp;&nbsp;4 = D , <span style="background-color:#74A8DC; padding:1.5px 5px; color: white; border-radius:4px; font-weight: bold">F</span></span><br/>
              <span style="color:#E06666; font-weight: bold">FINAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5 = E , <span style="background-color:#E06666; padding:1.5px 5px; color: white; border-radius:4px; font-weight: bold">F</span></span><br/>
              <span style="color:#6AA84F; font-weight: bold">SPEAK&nbsp;&nbsp;&nbsp;&nbsp;6 = F , <span style="background-color:#6AA84F; padding:1.5px 5px; color: white; border-radius:4px; font-weight: bold">S</span></span>`
  },

  {
    id: 6,
    title: `Starting Letters`,
    content: `You will start by selecting <span style="color:#CC00FF; font-weight: bold;">3</span> consonants and <span style="color:#CC00FF; font-weight: bold;">1</span> vowel <br />`,
    component: EmptyStartingLetters
  },

  {
    id: 7,
    title: `Keyboard Rules`,
    content: ``,
    component: KeyboardPreview
  },

  {
    id: 8,
    title: `You have <span style="color:#CC00FF; font-weight: bold;">4</span> chances to solve the puzzle`,
    content: `Solve <span style="font-weight: bold;">1</span> word at a time!`,
    component: LifeBarLoss
  },

  {
    id: 9,
    variants: {
      howToPlay: {
        title: `Let's try a practice puzzle!`,
        content: `Let's put those rules into action!`
      },
      play: {
        title: `Play Tutorial`,
        content: `If you need practice <br/>
                  ✨<a href="/how-to-play" style="font-weight: bold; text-decoration: underline; color:#EAB308;">Tutorial</a>✨`
      }
    }
    }
  ];

export const Game1 = [
  
  {
    id: 10,
    title: `This is a half completed puzzle`,
    content: ``,
  },

  {
    id: 11,
    title: `You will start by selecting some starting letters`,
    content: `<span style="color:#CC00FF; font-weight: bold;">3</span> consonants, <span style="color:#CC00FF; font-weight: bold;">1</span> vowel
              We've already selected some for you to get started <span style="color:#48bb78; font-weight:bold;">(R, S, T, E)</span>`
  },

  {
    id: 12,
    title: `Remember <span style="color:#74A8DC">noun <span style="color:#6AA84F">verb <span style="color:#E06666">adjective`,
    content: ``,
  },

  {
    id: 13,
    title: `Look at those numbers <span style="color:#74A8DC">G</span><span style="color:#6AA84F">L</span><span style="color:#E06666">O</span><span style="color:">W</span>!`,
    content: `Go ahead and click on it to see the clues`,
  },

  {
    id: 14,
    title: `Try guessing the <span style="color:#74A8DC; font-weight: bold;">first</span> word`,
    content: ``,
  },

  {
    id: 15,
    title: `Great! That was the <span style="color:#74A8DC; font-weight: bold;">number</span> clue`,
    content: ``
  },

  {
    id: 16,
    title: `Try solving the <span style="color:#6AA84F; font-weight: bold;">second</span> word`,
    content: ``,
  },

  {
    id: 17,
    title: `Great! You solved the <span style="color:#6AA84F; font-weight: bold;">length</span> clue`,
    content: ``
  },

  {
    id: 18,
    title: `<span style="color:#E06666; font-weight: bold;">Last</span> word`,
    content: ``,
  },

  {
    id: 19,
    title: `Great! You solved the <span style="color:#E06666; font-weight: bold;">alphabet</span> clue`,
    content: ``
  },

  {
    id: 20,
    title: `Makes sense so far?`,
    content: `Let's try a harder one.`
  },
];

export const Game2 = [
  {
    id: 0,
    title: `You're on your own now...`,
    content: `Good Luck!`,
  },
];