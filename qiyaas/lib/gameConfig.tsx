// lib/GameConfig.tsx

export const GameConfig = {

							
							// Puzzle Start Day
							puzzleStartDay: "2025-12-11",

							// Maximum number of lives
							maxLives: 5,
							
							// Image Paths
							imagePaths: {

											image404: "/qiyaas_glow_404.png",
											
										},
							// Timing Durations
							duration: {
											
											
											// Tutorial Loading Delay
											tutorialLoadingDelay: 500,
											
											// Hint Toggle Pause before Pulse
											hintToggleDelay: 3000,

											// Hint Toggle Duration
											hintToggleDuration: 5000,

											// Game over screen delay (in milliseconds)
											gameOverScreenDelay: 700,
											
											// Flash Duration (in milliseconds)
											flashDuration: 1000,

											// Messages Delay
											messageDelay: 900,

											messageFadeInDelay: 10,

											messageFadeOutDelay: 300,

											// Shake Animation Duration
											shakeDuration: 500,

											// Clear Shake After Duration
											clearShakeAfter: 1000,

											moveToNextIncompleteWord: 200,

											moveToFirstEmptyPosition: 250,

											// Letter Reveal delay
											letterRevealDelay: 500,

											// Green Cursor Duration
											greencursorDuration: 300,

											// Bounce Duration
											bounceDuration: 1000,
											// Reveal Sequence Timings
											
											// Speed of the starting letter color
											startingLetterColorReveal: 2000,
											
											// Delay between revealing each starting letter (in milliseconds)
											startingLetterBounceDelay: 1000,
											
											// Delay before starting clue dash reveals after starting letters finish (in milliseconds)
											pauseBeforeClueReveal: 2000,
											
											// Delay between revealing each clue dash (in milliseconds)
											clueDashRevealDelay: 1000,

										},

							// Vibration Pattern
							vibrationPattern: [100, 50, 100],
							
							// Number of Starting Letters
							startingLettersNumber: 4,

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
														
							// Messages
							messages: {

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
							
							// Cursor Color
							cursorColor: {
											default: 'text-purple-500',
											inClue: 'text-green-500',

										},
							
							// Starting Letters Colors
							startingColors: {
												beforeGameBegins: 'border-purple-300',
												default: 'bg-purple-500',
												inClue: 'bg-green-500',
												notInClue: 'bg-gray-500 dark:bg-gray-700'
											},
							
							// Lives Colors
							livesColors: {
											
												full: 'bg-purple-500 dark:shadow-lg dark:shadow-purple-500/50',
												lost: 'bg-gray-700 dark:bg-gray-300 scale-75 opacity-30'
											},

							// Additional Letters Colors
							additionalColors: {

												selectedLetter: 'border-purple-500',
												unselectedLetter: 'border-purple-400',
												vowel: 'text-purple-600 dark:text-purple-400',
												consonant: 'text-purple-600 dark:text-purple-400'
											},

							// Flash Colors for WordDash
							flashColors: {
											incorrect: 'text-red-500',
											partial: 'text-yellow-500'
										},
							
							// Noun & Verb & Adjective Colors
							wordColors: {
											noun: 'text-[#74A8DC]',
											verb: 'text-[#6AA84F]',
											adjective: 'text-[#E06666]',
											default: 'text-black dark:text-white'											
										},
							
							wordColors_bg: {
											noun: 'bg-[#74A8DC]',
											verb: 'bg-[#6AA84F]',
											adjective: 'bg-[#E06666]'
																						
											}

					};