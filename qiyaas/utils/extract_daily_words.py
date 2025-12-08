import re
import json
import nltk
from better_profanity import profanity
from wordfreq import zipf_frequency
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from collections import Counter

# Setup
for resource in ['averaged_perceptron_tagger', 'wordnet', 'omw-1.4']:
	try:
		nltk.data.find(f'taggers/{resource}' if 'tagger' in resource else f'corpora/{resource}')
	except LookupError:
		nltk.download(resource)

profanity.load_censor_words()
lemmatizer = WordNetLemmatizer()

BLOCKLIST = {
	'aba', 'abandon', 'abortion', 'abuse', 'abused', 'absues', 'abuser', 'abusers', 'abusive', 'addiction', 'adultery', 'alcohol', 'alcoholic', 'alexander',  'amen', 'any', 
	'anymore', 'anyway', 'anyways', 'anywhere', 'arousal', 'arthritis', 'assault', 'atheism', 'atheist',
	'beer', 'bisexual', 'bipolar', 'bomb', 'boston', 'bostons', 'bullet',
	'cannabis', 'cancer', 'carcinoma', 'champagne', 'christian', 'cocaine', 
	'dada', 'dak', 'dal', 'dah', 'dated', 'dead', 'death', 'dementia', 'depressed', 'diarrhea', 'die', 'drug', 'dumb', 
	'east', 'erotica', 
	'fatal', 'fascism', 'fascist', 'fatty', 'feces', 'funeral',
	'genocide', 'grief', 'gunshot',
	'handgun', 'hepatitis', 'hickey', 'hindu', 'homeless', 'holocaust', 'horrible', 'horror', 'however', 'idiot', 'idiots', 'idiotic', 'ill', 'illegal', 'illness', 'islam', 'islamic', 
	'khan', 'killer', 
	'lesbian', 'likewise', 'lingerie', 'liquor', 'loser', 'lucifer', 
	'marijuana', 'magnum', 'martini', 'medicaid', 'medicaid', 'mike', 'missile', 'muslim', 
	'north', 'northeast', 'northern', 'nowadays', 
	'other', 'otherwise', 'one', 
	'pic', 'polio',
	'racial', 'racism', 'racist', 
	'sad', 'sadly', 'satanic', 'sexy', 'sex', 'sexual', 'sexually', 'sexuality', 'sexist', 'sexism', 'shooter', 'shotgun', 'slavery', 'slave', 'somebody', 'someday', 'somehow', 'someone', 'sometime', 'sometimes', 'somewhat', 'somewhere',
	'south', 'southeast', 'southern', 'southwest', 'soviet', 'suicide', 'superman', 'stripper', 'stupidity',
	'tequila', 'terror', 'terrorism', 'terrorist', 'tho', 'thou', 'tobacco', 'torture', 'twitter', 
	'ulcer', 'ups', 'urine', 'urinary', 'ute',
	'vaginal', 'var', 'virgin', 'virginity', 'victim', 'violence', 'violent', 
	'warhead', 'war', 'warlord', 'weapon', 'west', 'whiskey', 'whisky', 'wiener',
	'yea', 'yeah', 'yes', 'yet',
	'zee'
}

DIRECTIONAL = {
	'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest',
	'northern', 'southern', 'eastern', 'western', 'left', 'right', 'up', 'down'
}

NUMBER_WORDS = {
	'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
	'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
	'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 
	'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'
}

def get_pos_for_lemmatizer(tag):
	if tag.startswith('J'):
		return wordnet.ADJ
	elif tag.startswith('V'):
		return wordnet.VERB
	elif tag.startswith('N'):
		return wordnet.NOUN
	elif tag.startswith('R'):
		return wordnet.ADV
	return wordnet.NOUN

def get_dominant_pos(word):
	"""Get the most common part of speech for a word across different contexts"""
	synsets = wordnet.synsets(word)
	if not synsets:
		return None
	
	pos_counts = Counter()
	for synset in synsets:
		pos = synset.pos()
		pos_counts[pos] += 1
	
	if not pos_counts:
		return None
	
	# Map wordnet POS to readable form
	pos_map = {
		'n': 'noun',
		'v': 'verb',
		'a': 'adjective',
		's': 'adjective',  # adjective satellite
		'r': 'adverb'
	}
	
	dominant_pos = pos_counts.most_common(1)[0][0]
	return pos_map.get(dominant_pos, None)

def is_plural_or_inflected(word_lower):
	"""Check if a word is a plural or inflected form"""
	# Try lemmatizing as both noun and verb
	noun_lemma = lemmatizer.lemmatize(word_lower, 'n')
	verb_lemma = lemmatizer.lemmatize(word_lower, 'v')
	adj_lemma = lemmatizer.lemmatize(word_lower, 'a')
	
	# If any lemma is different from the original, it's inflected
	if noun_lemma != word_lower or verb_lemma != word_lower or adj_lemma != word_lower:
		return True
	
	return False

input_path = "qiyaas/data/wordsList.js"
output_json_path = "qiyaas/data/intmed/daily_words_tagged.json"
output_txt_path = "qiyaas/data/intmed/daily_words_list.txt"
profanity_output_path = "qiyaas/data/intmed/profanity.txt"

with open(input_path, "r", encoding="utf-8") as f:
	text = f.read()

all_words = re.findall(r'"([A-Za-z]+)"', text)
tagged_words = nltk.pos_tag([w.lower() for w in all_words])  # lowercase here

words_by_pos = {
					'noun': [], 
					'verb': [], 
					'adjective': []
				}

# Track profanity words
profanity_words = set()

for word, tag in tagged_words:
	w = word.lower()

	# skip inflections
	if is_plural_or_inflected(w):
		continue

	# skip if ends with 'ing' (gerunds/present participles)
	if w.endswith('ing'):
		continue

	# Skip adverbs (RB, RBR, RBS tags)
	if tag.startswith('RB'):
		continue

	# skip past tense verbs (VBD) and past participles (VBN)
	if tag in ('VBD', 'VBN'):
		continue
	
	# skip blocklist; directional words; and number words
	if w in BLOCKLIST or w in DIRECTIONAL or w in NUMBER_WORDS:
		continue

	# Check profanity and frequency
	has_profanity = profanity.contains_profanity(w)
	has_sufficient_frequency = zipf_frequency(w, "en") > 3.0
	
	# Track profanity words
	if has_profanity:
		profanity_words.add(w)
	
	if not has_profanity and has_sufficient_frequency:
		word_len = len(w)
	
		# Only include words between 3-9 letters
		if 3 <= word_len <= 9:
			# Get dominant part of speech
			dominant = get_dominant_pos(w)
			if not dominant:
				if tag.startswith('N'):
					dominant = 'noun'
				elif tag.startswith('V'):
					dominant = 'verb'
				elif tag.startswith('J'):
					dominant = 'adjective'
				else:
					continue
	
			# Only include nouns, verbs, and adjectives
			if dominant in ['noun', 'verb', 'adjective']:
				words_by_pos[dominant].append(w)

# ---- PREPARE UPPERCASE VERSION FOR SAVING ----
words_by_pos_upper = {
    pos: sorted({w.upper() for w in words_by_pos[pos]})
    for pos in words_by_pos
}

# ---- SAVE JSON (UPPERCASE) ----
with open(output_json_path, "w", encoding="utf-8") as f:
    json.dump(words_by_pos_upper, f, indent=2)

# ---- SAVE TXT (UPPERCASE) ----
all_words_flat = sorted({w.upper() for pos in words_by_pos for w in words_by_pos[pos]})

with open(output_txt_path, "w", encoding="utf-8") as f:
	for w in all_words_flat:
		f.write(w + "\n")

# ---- SAVE PROFANITY (UPPERCASE) ----
with open(profanity_output_path, "w", encoding="utf-8") as f:
	for w in sorted(profanity_words):
		f.write(w.upper() + "\n")

print(f"Total words by POS:")
print(f"  Nouns: {len(words_by_pos['noun'])}")
print(f"  Verbs: {len(words_by_pos['verb'])}")
print(f"  Adjectives: {len(words_by_pos['adjective'])}")
print(f"  Total unique: {len(all_words_flat)}")
print(f"  Profanity flagged: {len(profanity_words)}")
print(f"\nJSON output saved to: {output_json_path}")
print(f"Text output saved to: {output_txt_path}")
print(f"Profanity words saved to: {profanity_output_path}")