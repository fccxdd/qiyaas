import random
from datetime import date
import json
import os

input_file = "qiyaas/data/intmed/daily_words_tagged.json"
used_words_file = "qiyaas/data/used_words.json"
output_file = "qiyaas/data/daily_words.json"

# --- WORD CLASSIFICATION (reads JSON with POS tags) ---
def load_word_classes(filename=input_file):
    """Load words organized by their actual POS tags"""
    with open(filename, "r", encoding="utf-8") as f:
        words_by_pos = json.load(f)
    
    # Organize by length for each POS
    nouns = {'short': [], 'medium': [], 'long': []}
    verbs = {'short': [], 'medium': [], 'long': []}
    adjectives = {'short': [], 'medium': [], 'long': []}
    
    # Process nouns
    for word in words_by_pos.get('noun', []):
        length = len(word)
        if 3 <= length <= 5:
            nouns['short'].append(word)
        elif 5 < length <= 7:
            nouns['medium'].append(word)
        elif 7 < length <= 9:
            nouns['long'].append(word)
    
    # Process verbs
    for word in words_by_pos.get('verb', []):
        length = len(word)
        if 3 <= length <= 5:
            verbs['short'].append(word)
        elif 5 < length <= 7:
            verbs['medium'].append(word)
        elif 7 < length <= 9:
            verbs['long'].append(word)
    
    # Process adjectives
    for word in words_by_pos.get('adjective', []):
        length = len(word)
        if 3 <= length <= 5:
            adjectives['short'].append(word)
        elif 5 < length <= 7:
            adjectives['medium'].append(word)
        elif 7 < length <= 9:
            adjectives['long'].append(word)
    
    # Print statistics
    print("\n=== Word Statistics ===")
    for pos_name, pos_dict in [('Nouns', nouns), ('Verbs', verbs), ('Adjectives', adjectives)]:
        print(f"\n{pos_name}:")
        for cat in ['short', 'medium', 'long']:
            print(f"  {cat.capitalize()}: {len(pos_dict[cat])}")
        total = sum(len(pos_dict[cat]) for cat in ['short', 'medium', 'long'])
        print(f"  Total: {total}")
    
    return nouns, verbs, adjectives


def load_used_words():
    """Load the set of words that have already been used"""
    if os.path.exists(used_words_file):
        with open(used_words_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return set(data.get("used_words", []))
    return set()


def save_used_words(used_words):
    """Save the set of used words to file"""
    with open(used_words_file, "w", encoding="utf-8") as f:
        json.dump({"used_words": list(used_words)}, f, indent=2)


def load_existing_puzzle():
    """Load existing puzzle if it exists for today"""
    if os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as f:
            puzzle = json.load(f)
            return puzzle
    return None


# --- NUMBER FUNCTIONS ---
def number_from_length(word: str) -> int:
    return (len(word) % 9) or 9

def number_from_first_letter(word: str) -> int:
    """Convert A-I to 1-9. Word must start with A-I (enforced by pick_word)."""
    first = word[0].upper()
    return ord(first) - ord('A') + 1


def number_from_letter_of_number(word: str) -> int:
    """Map O/T/F/S/E/N to their corresponding numbers. Word must start with these letters (enforced by pick_word)."""
    map_letter_to_number = {'O': 1, 'T': 2, 'F': 4, 'S': 6, 'E': 8, 'N': 9}
    first = word[0].upper()
    return map_letter_to_number[first]


number_methods = {
    "length_rule": number_from_length,
    "alphabet_rule": number_from_first_letter,
    "number_rule": number_from_letter_of_number
}


# --- PUZZLE GENERATOR ---
def get_daily_puzzle(used_words_tracker: set, puzzle_date: date=None, allow_reroll_chance=0.5, force_regenerate=False):
    if puzzle_date is None:
        puzzle_date = date.today()
    
    # Check if puzzle already exists for this date
    if not force_regenerate:
        existing_puzzle = load_existing_puzzle()
        if existing_puzzle and existing_puzzle.get("date") == puzzle_date.isoformat():
            print(f"\nPuzzle for {puzzle_date.isoformat()} already exists. Loading existing puzzle...")
            print(f"Words: {[c['word'] for c in existing_puzzle['clues']]}")
            return existing_puzzle
    
    # Load POS-tagged words
    nouns, verbs, adjectives = load_word_classes(input_file)
    
    random.seed(puzzle_date.isoformat())  # deterministic per date

    # Load words that have already been used
    used_words = load_used_words()

    rule_order = list(number_methods.keys())
    random.shuffle(rule_order)

    # Randomly select length categories for each word type
    length_categories = ['short', 'medium', 'long']
    selected_lengths = random.sample(length_categories, 3)  # One of each length

    def pick_word(word_dict, length_cat, rule):
        words = word_dict[length_cat]
        
        # Filter out words that have already been used
        available_words = [w for w in words if w not in used_words_tracker]
        
        if not available_words:
            raise ValueError(f"No unused {length_cat} words available! All words have been used.")
        
        # For alphabet_rule: only select words starting with A-I
        if rule == "alphabet_rule":
            valid = [w for w in available_words if 'A' <= w[0].upper() <= 'I']
            if not valid:
                raise ValueError(f"No unused {length_cat} words starting with A-I available!")
            return random.choice(valid)
        
        # For number_rule: only select words starting with O, T, F, S, E, N
        if rule == "number_rule":
            valid_letters = {'O', 'T', 'F', 'S', 'E', 'N'}
            valid = [w for w in available_words if w[0].upper() in valid_letters]
            if not valid:
                raise ValueError(f"No unused {length_cat} words starting with O/T/F/S/E/N available!")
            return random.choice(valid)
        
        # For length_rule: any word is fine
        return random.choice(available_words)

    # Assign one length to each word type - NOW USES PROPER POS DICTIONARIES
    noun = pick_word(nouns, selected_lengths[0], rule_order[0])
    verb = pick_word(verbs, selected_lengths[1], rule_order[1])
    adj = pick_word(adjectives, selected_lengths[2], rule_order[2])

    clues = []
    selected_words_today = []
    
    for (word, wtype, rule_name, length_cat) in zip([noun, verb, adj],
                                                      ["NOUN", "VERB", "ADJECTIVE"],
                                                      rule_order,
                                                      selected_lengths):
        num = number_methods[rule_name](word)
        clues.append({
            "type": wtype,
            "word": word,
            "rule": rule_name,
            "number": num,
            "length_category": length_cat,
            "word_length": len(word)
        })
        selected_words_today.append(word)

    # Ensure distinct numbers
    numbers = [c["number"] for c in clues]
    if len(set(numbers)) < 3 and random.random() < allow_reroll_chance:
        wtype = clues[-1]["type"]
        rule_name = clues[-1]["rule"]
        length_cat = clues[-1]["length_category"]
        old_word = clues[-1]["word"]
        
        if wtype == "NOUN":
            new_word = pick_word(nouns, length_cat, rule_name)
        elif wtype == "VERB":
            new_word = pick_word(verbs, length_cat, rule_name)
        else:
            new_word = pick_word(adjectives, length_cat, rule_name)
        
        new_num = number_methods[rule_name](new_word)
        clues[-1] = {
            "type": wtype,
            "word": new_word,
            "rule": rule_name,
            "number": new_num,
            "length_category": length_cat,
            "word_length": len(new_word)
        }
        # Update the selected words list
        selected_words_today[-1] = new_word

    # Mark these words as used
    used_words.update(selected_words_today)
    save_used_words(used_words)
    
    print(f"\nGenerated NEW puzzle for {puzzle_date.isoformat()}")
    print(f"Words used today: {selected_words_today}")
    print(f"Total words used so far: {len(used_words)}")

    # Mark these words as used in the tracker
    used_words_tracker.update(selected_words_today)
    
    return {"date": puzzle_date.isoformat(), "clues": clues}


# --- Example Usage ---
if __name__ == "__main__":
    
    # Load already used words
    used_words = load_used_words()
    
    # This will load existing puzzle if it exists, or generate new one if not
    puzzle = get_daily_puzzle(used_words_tracker=used_words)
    
    # Save to daily_words.json
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(puzzle, f, indent=2)
    
    print(f"\nPuzzle saved to: {output_file}")
    print(json.dumps(puzzle, indent=2))
    
    # If you want to force regenerate (useful for testing), uncomment this:
    # puzzle = get_daily_puzzle(force_regenerate=True)