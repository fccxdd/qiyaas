import random
from datetime import datetime, date
import json
import re
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet as wn
from zoneinfo import ZoneInfo

# --- Setup: make sure NLTK tagger + WordNet data is available ---
for pkg in [
	("taggers/averaged_perceptron_tagger", "averaged_perceptron_tagger"),
	("corpora/wordnet", "wordnet"),
	("corpora/omw-1.4", "omw-1.4"),
]:
	try:
		nltk.data.find(pkg[0])
	except LookupError:
		nltk.download(pkg[1])

output_file = "qiyaas/data/dailywordsList.js"
json_file = "qiyaas/data/daily_words.json"


# --- WORD CLASS LOADER ---
def load_word_classes(filename):
	with open(filename, "r", encoding="utf-8") as f:
		text = f.read()

	words = re.findall(r'"([A-Za-z]+)"', text)
	words_lower = [w.lower() for w in words]
	words_upper_set = set([w.upper() for w in words])  # Create set of valid uppercase words
	lemmatizer = WordNetLemmatizer()

	nouns, verbs, adjectives = set(), set(), set()

	for word in words_lower:
		noun_senses = len(wn.synsets(word, pos="n"))
		verb_senses = len(wn.synsets(word, pos="v"))
		adj_senses = len(wn.synsets(word, pos="a"))

		if noun_senses + verb_senses + adj_senses == 0:
			continue

		dominant_pos = max(
			[("n", noun_senses), ("v", verb_senses), ("a", adj_senses)],
			key=lambda x: x[1],
		)[0]

		if dominant_pos == "n":
			lemma = lemmatizer.lemmatize(word, pos="n").upper()
			# Only add if the lemmatized word exists in original word list
			if lemma in words_upper_set:
				nouns.add(lemma)
		elif dominant_pos == "v":
			lemma = lemmatizer.lemmatize(word, pos="v").upper()
			# Only add if the lemmatized word exists in original word list
			if lemma in words_upper_set:
				verbs.add(lemma)
		elif dominant_pos == "a":
			lemma = lemmatizer.lemmatize(word, pos="a").upper()
			# Only add if the lemmatized word exists in original word list
			if lemma in words_upper_set:
				adjectives.add(lemma)

	print(f"Loaded {len(nouns)} nouns, {len(verbs)} verbs, {len(adjectives)} adjectives.")
	return sorted(nouns), sorted(verbs), sorted(adjectives)


nouns, verbs, adjectives = load_word_classes(output_file)


# --- NUMBER FUNCTIONS ---
def number_from_length(word: str) -> int:
	return (len(word) % 9) or 9


def number_from_first_letter(word: str) -> int:
	first = word[0].upper()
	return ord(first) - ord("A") + 1


def number_from_letter_of_number(word: str) -> int | list[int]:
	"""
	Maps the first letter of number words to their numeric value(s).
	Returns a single int or a list of ints for ambiguous cases.
	"""
	map_letter_to_number = {
		"O": 1,      # One
		"T": [2, 3], # Two, Three
		"F": [4, 5], # Four, Five
		"S": [6, 7], # Six, Seven
		"E": 8,      # Eight
		"N": 9       # Nine
	}
	
	first_letter = word[0].upper()
	return map_letter_to_number.get(first_letter, 0)  # Default to 0 if not found

number_methods = {
	"length": number_from_length,
	"alphabet": number_from_first_letter,
	"letter": number_from_letter_of_number,
}

# --- PUZZLE GENERATOR ---
def get_daily_puzzle(puzzle_date=None, random_seed=None, max_attempts=20):
	
	# Use Eastern Time (America/New_York) for consistency
	eastern = ZoneInfo("America/New_York")
	
	if puzzle_date is None:
		# Get current date at midnight Eastern Time
		now_eastern = datetime.now(eastern)
		puzzle_date = now_eastern.date()

	# Make seed different each day, but deterministic for same day
	if random_seed is None:
		random_seed = int(puzzle_date.strftime("%Y%m%d"))  # 20251105 → integer seed
	random.seed(random_seed)

	word_types = ["NOUN", "VERB", "ADJECTIVE"]
	type_to_words = {"NOUN": nouns, "VERB": verbs, "ADJECTIVE": adjectives}
	rule_methods = list(number_methods.keys())

	for _ in range(max_attempts):
		random.shuffle(word_types)
		random.shuffle(rule_methods)

		clues, used_numbers, used_rules = [], set(), set()
		success = True

		for wtype, rule in zip(word_types, rule_methods):
			words_pool = type_to_words[wtype]

			if rule == "alphabet":
				valid_words = [w for w in words_pool if "A" <= w[0] <= "I" and len(w) >= 4]
			elif rule == "letter":
				valid_words = [w for w in words_pool if w[0] in {"O", "T", "F", "S", "E", "N"} and len(w) >= 4]
			else:
				valid_words = [w for w in words_pool if len(w) >= 4]

			tries = 0
			while tries < 10:
				word = random.choice(valid_words)
				num = number_methods[rule](word)
				
				# Handle case where num is a list (ambiguous letters like T, F, S)
				if isinstance(num, list):
					# Pick a random number from the list that hasn't been used
					available_nums = [n for n in num if n not in used_numbers]
					if not available_nums:
						tries += 1
						continue
					num = random.choice(available_nums)
				
				tries += 1
				if num not in used_numbers:
					clues.append({"type": wtype, "word": word, "rule": rule, "number": num})
					used_numbers.add(num)
					used_rules.add(rule)
					break
			else:
				success = False
				break

		if success and len(used_numbers) == 3 and len(used_rules) == 3:
			return {
						"clue_1": clues[0]["word"],
						"clue_2": clues[1]["word"],
						"clue_3": clues[2]["word"],
						"numbers_for_clue": [c["number"] for c in clues],
						"word_types": [c["type"] for c in clues]
					}

	raise ValueError("Failed to generate a puzzle meeting all constraints.")


# --- MULTIPLE PUZZLES ---
def save_multiple_puzzles(num_rounds=20, date_for_key=None):
	eastern = ZoneInfo("America/New_York")
	
	if date_for_key is None:
		# Use current date in Eastern Time
		now_eastern = datetime.now(eastern)
		date_for_key = now_eastern.date().isoformat()

	all_puzzles = {}
	all_puzzles_with_types = {}  # Keep full data for printing
	
	for i in range(num_rounds):
		
		# Different seed per round with larger multiplier and offset for more variety
		# Using prime numbers to ensure good distribution
		now_eastern = datetime.now(eastern)
		base_seed = int(now_eastern.strftime("%Y%m%d"))
		seed = (base_seed * 97) + (i * 191) + 42069  # Large prime multipliers + offset
		puzzle = get_daily_puzzle(random_seed=seed)
		
		# Store full data for printing
		all_puzzles_with_types[f"round_{i+1}"] = puzzle

		# Store daily puzzle in a JSON file
		# Storing both clue answer and their word type
		all_puzzles[f"round_{i+1}"] = {
											"clue_1": {
															"word": puzzle["clue_1"],
															"type": puzzle["word_types"][0],
														},
											
											"clue_2": {
															"word": puzzle["clue_2"],
															"type": puzzle["word_types"][1],
														},
											
											"clue_3": {
															"word": puzzle["clue_3"],
															"type": puzzle["word_types"][2],
														},
											
											"numbers_for_clue": puzzle["numbers_for_clue"]
										}

	data_to_save = {date_for_key: all_puzzles}

	with open(json_file, "w", encoding="utf-8") as f:
		json.dump(data_to_save, f, indent=4)

	print(f"\nSaved {num_rounds} rounds to {json_file} under key '{date_for_key}'.")
	print(f"Using Eastern Time (America/New_York): {datetime.now(eastern).strftime('%Y-%m-%d %H:%M:%S %Z')}")
	
if __name__ == "__main__":
	save_multiple_puzzles(num_rounds=20)