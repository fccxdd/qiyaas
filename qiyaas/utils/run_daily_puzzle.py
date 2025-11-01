import random
from datetime import date
import json
import re
import nltk
from nltk.stem import WordNetLemmatizer

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

# --- WORD CLASSIFICATION (reads a JS file) ---
def load_word_classes(filename=output_file):
    with open(filename, "r", encoding="utf-8") as f:
        text = f.read()

    # Extract words between quotes (handles "WORD" and 'WORD')
    words = re.findall(r'"([A-Za-z]+)"', text)

    # Convert to lowercase for lemmatization and tagging
    words_lower = [w.lower() for w in words]

    lemmatizer = WordNetLemmatizer()
    tagged = nltk.pos_tag(words_lower)

    nouns, verbs, adjectives = [], [], []

    for word, pos in tagged:
        base_word = word

        # --- Handle Nouns ---
        if pos.startswith("NN"):
            # Lemmatize plural nouns to singular (cats → cat)
            base_word = lemmatizer.lemmatize(word, pos="n").upper()
            nouns.append(base_word)

        # --- Handle Verbs (only present-tense) ---
        elif pos in ("VB", "VBP", "VBZ"):
            # Lemmatize to base form (runs → run)
            base_word = lemmatizer.lemmatize(word, pos="v").upper()
            verbs.append(base_word)

        # --- Handle Adjectives ---
        elif pos.startswith("JJ"):
            adjectives.append(word.upper())

    print(f"Loaded {len(nouns)} nouns, {len(verbs)} present-tense verbs, {len(adjectives)} adjectives.")
    return nouns, verbs, adjectives


nouns, verbs, adjectives = load_word_classes(output_file)

# --- NUMBER FUNCTIONS ---
def number_from_length(word: str) -> int:
    return (len(word) % 9) or 9


def number_from_first_letter(word: str) -> int:
    first = word[0].upper()
    if first < 'A' or first > 'I':
        raise ValueError(f"Word '{word}' cannot use first-letter rule (letter > I)")
    return ord(first) - ord('A') + 1


def number_from_letter_of_number(word: str) -> int:
    map_letter_to_number = {'O': 1, 'T': 2, 'F': 4, 'S': 6, 'E': 8, 'N': 9}
    first = word[0].upper()
    return map_letter_to_number.get(first, number_from_length(word))


number_methods = {
    "length": number_from_length,
    "alphabet": number_from_first_letter,
    "letter": number_from_letter_of_number
}


# --- PUZZLE GENERATOR ---
def get_daily_puzzle(puzzle_date: date = None, allow_reroll_chance=0.5):
    if puzzle_date is None:
        puzzle_date = date.today()
    random.seed(puzzle_date.isoformat())  # deterministic per date

    rule_order = list(number_methods.keys())
    random.shuffle(rule_order)

    def pick_word(words, rule):
        if rule == "alphabet":
            valid = [w for w in words if 'A' <= w[0].upper() <= 'I']
            if not valid:
                raise ValueError("No valid words for alphabet rule!")
            return random.choice(valid)
        return random.choice(words)

    noun = pick_word(nouns, rule_order[0])
    verb = pick_word(verbs, rule_order[1])
    adj = pick_word(adjectives, rule_order[2])

    clues = []
    for (word, wtype, rule_name) in zip([noun, verb, adj],
                                       ["NOUN", "VERB", "ADJECTIVE"],
                                       rule_order):
        num = number_methods[rule_name](word)
        clues.append({"type": wtype, "word": word, "rule": rule_name, "number": num})

    # Ensure distinct numbers
    numbers = [c["number"] for c in clues]
    if len(set(numbers)) < 3 and random.random() < allow_reroll_chance:
        wtype, rule_name = clues[-1]["type"], clues[-1]["rule"]
        if wtype == "NOUN":
            new_word = pick_word(nouns, rule_name)
        elif wtype == "VERB":
            new_word = pick_word(verbs, rule_name)
        else:
            new_word = pick_word(adjectives, rule_name)
        new_num = number_methods[rule_name](new_word)
        clues[-1] = {"type": wtype, "word": new_word, "rule": rule_name, "number": new_num}

    return {"date": puzzle_date.isoformat(), "clues": clues}


# --- Example Usage ---
if __name__ == "__main__":
    puzzle = get_daily_puzzle()
    print(json.dumps(puzzle, indent=2))
