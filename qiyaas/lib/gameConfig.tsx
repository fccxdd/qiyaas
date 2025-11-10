// lib/GameConfig.tsx

export const GameConfig = {

							// Maximum number of lives
							maxLives: 5,
							
							// Game over screen delay (in milliseconds)
							gameOverScreenDelay: 700,
							
							// Vowels
							vowels: ['A', 'E', 'I', 'O', 'U'],
							

							// Hint Number Fallback
							hintNumberFallback: [0, 0, 0],
							
							// Consonants
							consonants: 		[
													'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
													'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
												],

							// KeyBoard Layout
							keyboardLayout: [
												["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
												["A", "S", "D", "F", "G", "H", "J", "K", "L"],
												["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
											],

							// Keyboard Colors
							keyboardColors: {
								used_up: 'bg-gray-500 dark:bg-gray-600/50 text-white',
								still_available: 'bg-yellow-500 dark:bg-yellow-500 text-white',
								default: 'bg-gray-300 dark:bg-gray-500 text-black dark:text-white'
							},
							
							// Flash Duration (in milliseconds)
							flashDuration: 1000,
							
							// Messages
							messages: {
								
											// Messages Delay
											messageDelay: 900,

											// Starting Letters Messages
											letterAlreadySelected: "Letter already selected!",
											onlyOneVowel: "Only 1 vowel allowed!",
											onlyThreeConsonants: "Only 3 consonants allowed!",
											maxLettersReached: "Only 4 starting letters allowed!",
											noSelectedLetters: "Please select 4 starting letters first!",
											noStartingLettersMatch: "No starting letters match any clues!",
											

											// Additional Letters Messages
											additionalLetterAlreadySelected: "You've already selected an additional {type}",
											selectAdditionalLetter: "Select a {type}, then press Enter to confirm",
											confirmAdditionalLetter: "Press Enter to confirm {letter}",
											additionalLetterWrongType: "Please select a {expected}!",
											additionalLetterAlreadyUsed: "This letter is already in use!",
											
											// Clue Words Messages
											wordNotValid: "Not a playable word. Try again",
											wordNotComplete: "Please enter a complete word.",
											wordCorrect: "Correct!",
											wordIncorrect: "Incorrect.",
										},

							// Messages Colors
							messageColors: {
												success: 'text-green-700 dark:text-green-400',
												error: 'text-red-700 dark:text-red-400',
												info: 'text-black dark:text-white'
											},

							// Starting Letters Colors
							startingColors: {
												default: 'bg-purple-500',
												inClue: 'bg-green-500',
												notInClue: 'bg-gray-500 dark:bg-gray-700'
											},
							
							
							// Additional Letters Colors
							additionalColors: {

												vowel: 'text-purple-600 dark:text-purple-400',
												consonant: 'text-purple-600 dark:text-purple-400'
												},

							// Flash Colors for WordDash
							flashColors: {
											correct: 'text-green-500',
											incorrect: 'text-red-500',
											partial: 'text-yellow-500'
										},
							
							// Noun & Verb & Adjective Colors

							wordColors: {
											noun: 'text-[#74A8DC]',
											verb: 'text-[#6AA84F]',
											adjective: 'text-[#E06666]',
											default: 'text-gray-800 dark:text-gray-200'											
							},
							wordColors_bg: {
											noun: 'bg-[#74A8DC]',
											verb: 'bg-[#6AA84F]',
											adjective: 'bg-[#E06666]'
																						
							}

					};