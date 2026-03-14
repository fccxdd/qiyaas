import re
import json
import nltk
from better_profanity import profanity
from wordfreq import zipf_frequency
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
import spacy
from collections import Counter
from nltk.corpus import brown

nlp = spacy.load("en_core_web_sm")  # or en_core_web_lg for better accuracy

# Setup
for resource in ['averaged_perceptron_tagger', 'wordnet', 'omw-1.4', 'brown']:
	try:
		nltk.data.find(f'taggers/{resource}' if 'tagger' in resource else f'corpora/{resource}')
	except LookupError:
		nltk.download(resource)

profanity.load_censor_words()
lemmatizer = WordNetLemmatizer()

BLOCKLIST = {
				'aba', 'abandon', 'abortion', 'abuse', 'abused', 'absues', 'abuser', 'abusers', 'abusive', 'addict', 'addiction', 'adultery', 'agnostic', 'alcohol', 'alcoholic', 'alexander',  'amen', 'any', 'apartheid', 'apostle', 'apostolic', 
				'anymore', 'anyway', 'anyways', 'anywhere', 'arousal', 'argentine', 'arthritis', 'assassin', 'assault', 'atheism', 'atheist', 'autism', 'autistic',
				'babe', 'bar', 'beer', 'berlin', 'bible', 'bisexual', 'bipolar', 'bitchy', 'black', 'blackjack', 'blacklist', 'blackmail', 'blackness', 'blackout', 'blind', 'bomb', 'bomber', 'booty', 'bouncer', 'bordeaux', 'bosom', 'boston', 'bostons', 'bra', 'brandy', 'brasil', 'brothel', 'bullet', 'butt', 'burial',
				'cannabis', 'cancer', 'cancerous', 'carcinoma', 'catholic', 'champagne', 'chit', 'christian', 'church', 'cigarette', 'cleavage', 'cocaine', 'cockroach', 'cocktail', 'coercion', 'coffin', 'communist', 'condom', 'crack', 'crappy', 'crash', 'cremation', 'crime', 'criminal',
				'dada', 'dak', 'dal', 'dah', 'dated', 'dead', 'death', 'dementia', 'demon', 'depressed', 'devil', 'diarrhea', 'die', 'dirty', 'disease', 'dope', 'drug', 'dumb', 
				'eff', 'erotica', 'ethnic', 'execution', 'explosion', 'extremism', 'extremist', 
				'fatal', 'fascism', 'fascist', 'fatty', 'feces', 'fetish', 'fight', 'firearm', 'firepower', 'fraud', 'funeral',
				'gangsta', 'genital', 'genitals', 'genitalia', 'genocide', 'gentile', 'gin', 'grave', 'graveyard', 'grenade', 'grief', 'groin', 'gun', 'gunfire', 'gunman', 'gunpoint', 'gunpowder', 'gunshot',
				'handgun', 'harem', 'hijack', 'heathen', 'hepatitis', 'hex', 'hickey', 'hindu', 'hobo', 'homeless', 'homicide', 'holocaust', 'horrible', 'horror', 'hostage', 'however', 'hubby', 'hunk',
				'idiot', 'idiots', 'idiotic', 'ill', 'illegal', 'illness', 'imam', 'islam', 'islamic', 
				'jew',
				'khan', 'killer', 'kink', 'knife',
				'latino', 'lewd', 'lesbian', 'liberal', 'libido', 'likewise', 'lingerie', 'liquor', 'loser', 'lucifer', 'lynch',
				'mafia', 'manure', 'marijuana', 'margarita', 'marseille', 'magnum', 'martini', 'medicaid', 'mike', 'minority', 'missile', 'morphine', 'mosque', 'murder', 'murderer', 'murderous', 'muslim', 
				'nasty', 'nowadays', 'nudity',
				'obese', 'obesity', 'other', 'otherwise', 'one', 'onstage',
				'peck', 'pic', 'pistol', 'pixie', 'polio', 'pom', 'pope', 'poverty', 'premature', 'priest', 'puke', 'purgatory', 
				'quran',
				'rabbi', 'racial', 'racism', 'racist', 'radical', 'randy', 'redneck', 'refugee', 'roach', 'robber',
				'sad', 'sadly', 'satanic', 'seduction', 'secutive', 'servant', 'sexy', 'sex', 'sexual', 'sexually', 'sexuality', 'sexist', 'sexism', 'shank', 'shanghai', 'sharia', 'sheik', 'sheikh', 'shiva', 'shiv', 'shoot', 'shooter', 'shootout', 'shotgun', 'sick', 'slaughter', 'slave', 'slavery', 'smack', 'somebody', 'someday', 'somehow', 'someone', 'sometime', 'sometimes', 'somewhat', 'somewhere',
				'soviet', 'spank', 'spit', 'stringer', 'stripper', 'stupidity', 'sucker', 'suicide', 'superman', 'synagogue', 'syphilis',
				'taboo', 'tang', 'temple', 'tequila', 'terror', 'terrorism', 'terrorist', 'tho', 'thou', 'tobacco', 'toilet', 'torah', 'torture', 'twitter', 
				'ulcer', 'ups', 'urine', 'urinary', 'ute',
				'vaginal', 'var', 'vibrator', 'virgin', 'virginity', 'victim', 'violence', 'violent', 'voodoo', 
				'warhead', 'war', 'warlord', 'weapon', 'welfare', 'whiskey', 'whisky', 'white', 'who', 'why', 'wiener',
				'yahoo', 'yea', 'yeah', 'yes', 'yet',
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

FORCE_ADD = {
				'baptize', 
				'bicep', 
				'crooked',
				'fulfill',
				'internet',
				'king'
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

# Add this near the top, after your setup code
print("Building POS lookup from Brown corpus...")
brown_pos_lookup = {}
for w, tag in brown.tagged_words():
    w_lower = w.lower()
    if w_lower not in brown_pos_lookup:
        brown_pos_lookup[w_lower] = []
    brown_pos_lookup[w_lower].append(tag)

# Convert to dominant POS
brown_dominant_pos = {}
for word, tags in brown_pos_lookup.items():
    tag_counts = Counter(tags)
    most_common_tag = tag_counts.most_common(1)[0][0]
    
    if most_common_tag.startswith('NN'):
        brown_dominant_pos[word] = 'noun'
    elif most_common_tag.startswith('VB'):
        brown_dominant_pos[word] = 'verb'
    elif most_common_tag.startswith('JJ'):
        brown_dominant_pos[word] = 'adjective'
    elif most_common_tag.startswith('RB'):
        brown_dominant_pos[word] = 'adverb'
print("Done building lookup!")

# Then replace your function with a simple lookup:
def get_dominant_pos_from_corpus(word):
    """Get POS based on actual corpus usage"""
    return brown_dominant_pos.get(word.lower(), None)

def get_dominant_pos_ensemble(word):
    """Ensemble method: Brown + WordNet + morphology"""
    votes = []
    w = word.lower()
    
    # Method 1: Brown corpus (double weight)
    brown_result = get_dominant_pos_from_corpus(w)
    if brown_result:
        votes.extend([brown_result, brown_result])
    
    # Method 2: WordNet with smart weighting
    synsets = wordnet.synsets(w)
    if synsets:
        pos_counts = Counter()
        for idx, synset in enumerate(synsets):
            weight = 1.0 / (idx + 1)  # Earlier synsets are more common
            pos_counts[synset.pos()] += weight
        
        # Noun preference for noun/verb ambiguity
        if 'n' in pos_counts and 'v' in pos_counts:
            if pos_counts['n'] >= pos_counts['v'] * 0.3:
                dominant = 'n'
            else:
                dominant = pos_counts.most_common(1)[0][0]
        else:
            dominant = pos_counts.most_common(1)[0][0]
        
        pos_map = {'n': 'noun', 'v': 'verb', 'a': 'adjective', 
                   's': 'adjective', 'r': 'adverb'}
        wordnet_result = pos_map.get(dominant)
        if wordnet_result:
            votes.append(wordnet_result)
    
    # Method 3: Morphology rules
    if w.endswith('ly') and len(w) > 4:
        votes.append('adverb')
    elif w.endswith(('ness', 'ment', 'tion', 'sion', 'ance', 'ence')):
        votes.append('noun')
    elif w.endswith(('ful', 'less', 'ous', 'ive', 'able', 'ible', 'al')):
        votes.append('adjective')
    elif w.endswith(('ify', 'ize', 'ate')) and len(w) > 5:
        votes.append('verb')
    
    if not votes:
        return None
    
    # Majority vote
    vote_counts = Counter(votes)
    return vote_counts.most_common(1)[0][0]

# Then just use this in your main loop:
dominant = get_dominant_pos_ensemble(w)

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
			dominant = get_dominant_pos_ensemble(w)
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