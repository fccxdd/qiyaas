import random
from datetime import date
import json
import re
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet as wn
# --- Setup: make sure NLTK tagger + WordNet data is available ---
try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

try:
    nltk.data.find('corpora/omw-1.4')
except LookupError:
    nltk.download('omw-1.4')

output_file = "qiyaas/data/dailywordsList.js"
json_file = "qiyaas/data/daily_words.json"

def load_word_classes(filename):
    """Load and classify words into nouns, verbs, and adjectives using WordNet with POS disambiguation."""
    with open(filename, "r", encoding="utf-8") as f:
        text = f.read()

    words = re.findall(r'"([A-Za-z]+)"', text)
    words_lower = [w.lower() for w in words]

    lemmatizer = WordNetLemmatizer()

    nouns, verbs, adjectives = set(), set(), set()

    for word in words_lower:
        # Get counts of senses for each POS type
        noun_senses = len(wn.synsets(word, pos='n'))
        verb_senses = len(wn.synsets(word, pos='v'))
        adj_senses = len(wn.synsets(word, pos='a'))

        # Skip words not found in WordNet
        if noun_senses + verb_senses + adj_senses == 0:
            continue

        # Pick the dominant POS (most senses)
        dominant_pos = max(
            [('n', noun_senses), ('v', verb_senses), ('a', adj_senses)],
            key=lambda x: x[1]
        )[0]

        if dominant_pos == 'n':
            lemma = lemmatizer.lemmatize(word, pos='n').upper()
            nouns.add(lemma)
        elif dominant_pos == 'v':
            lemma = lemmatizer.lemmatize(word, pos='v').upper()
            verbs.add(lemma)
        elif dominant_pos == 'a':
            lemma = lemmatizer.lemmatize(word, pos='a').upper()
            adjectives.add(lemma)

    nouns, verbs, adjectives = sorted(nouns), sorted(verbs), sorted(adjectives)

    print(f"Loaded {len(nouns)} nouns, {len(verbs)} verbs, {len(adjectives)} adjectives (unique POS only).")
    return nouns, verbs, adjectives

nouns, verbs, adjectives = load_word_classes(output_file)

# --- NUMBER FUNCTIONS ---
def number_from_length(word: str) -> int:
    return (len(word) % 9) or 9

def number_from_first_letter(word: str) -> int:
    first = word[0].upper()
    return ord(first) - ord('A') + 1

def number_from_letter_of_number(word: str) -> int:
    map_letter_to_number = {'O': 1, 'T': 2, 'F': 4, 'S': 6, 'E': 8, 'N': 9}
    return map_letter_to_number[word[0].upper()]

number_methods = {
    "length": number_from_length,
    "alphabet": number_from_first_letter,
    "letter": number_from_letter_of_number
}

# --- PUZZLE GENERATOR ---
def get_daily_puzzle(puzzle_date: date = None, random_seed=None, max_attempts=20):
    if puzzle_date is None:
        puzzle_date = date.today()
    if random_seed is not None:
        random.seed(random_seed)
    else:
        random.seed(puzzle_date.isoformat())

    word_types = ["NOUN", "VERB", "ADJECTIVE"]
    type_to_words = {"NOUN": nouns, "VERB": verbs, "ADJECTIVE": adjectives}
    rule_methods = list(number_methods.keys())

    attempt = 0
    while attempt < max_attempts:
        attempt += 1
        random.shuffle(word_types)
        random.shuffle(rule_methods)

        clues = []
        used_numbers = set()
        used_rules = set()
        success = True

        for wtype, rule in zip(word_types, rule_methods):
            words_pool = type_to_words[wtype]

            # Filter alphabet rule for first letters A-I
            if rule == "alphabet":
                valid_words = [w for w in words_pool if 'A' <= w[0].upper() <= 'I']
            # Filter letter rule for specific starting letters
            elif rule == "letter":
                valid_words = [w for w in words_pool if w[0].upper() in {'O', 'T', 'F', 'S', 'E', 'N'}]
            #  Else no filter
            else:
                valid_words = words_pool

            # Pick a word ensuring unique number
            tries = 0
            while tries < 10:
                word = random.choice(valid_words)
                num = number_methods[rule](word)
                tries += 1
                if num not in used_numbers:
                    break
            else:
                success = False
                break

            clues.append({"type": wtype, "word": word, "rule": rule, "number": num})
            used_numbers.add(num)
            used_rules.add(rule)

        if success and len(used_numbers) == 3 and len(used_rules) == 3:
            return {
                "clue_1": clues[0]["word"],
                "clue_2": clues[1]["word"],
                "clue_3": clues[2]["word"],
                "numbers_for_clue": [c["number"] for c in clues]
            }

    raise ValueError("Failed to generate a puzzle meeting all constraints after max attempts")

# --- MULTIPLE PUZZLES ---
def save_multiple_puzzles(num_rounds=20, date_for_key=None):
    if date_for_key is None:
        date_for_key = date.today().isoformat()

    all_puzzles = {}
    for i in range(num_rounds):
        puzzle = get_daily_puzzle(random_seed=i)
        all_puzzles[f"round_{i+1}"] = puzzle

    # Wrap in main date key
    data_to_save = {date_for_key: all_puzzles}

    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(data_to_save, f, indent=4)

    print(f"Saved {num_rounds} rounds to {json_file} under key '{date_for_key}'.")

# --- Example Usage ---
if __name__ == "__main__":
    save_multiple_puzzles(num_rounds=20)
