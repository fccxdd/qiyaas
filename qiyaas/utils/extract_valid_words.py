import nltk
from nltk import pos_tag
from nltk.corpus import wordnet, names
from nltk.stem import WordNetLemmatizer
from geotext import GeoText
from countryinfo import CountryInfo
import pycountry
import enchant

# -------------------------------------------------------------------
# LOAD NLTK RESOURCES
# -------------------------------------------------------------------
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
nltk.download('names')

# -------------------------------------------------------------------
# LOAD ENCHANT DICTIONARIES
# -------------------------------------------------------------------
try:
    us_dict = enchant.Dict("en_US")
    gb_dict = enchant.Dict("en_GB")
except enchant.errors.DictNotFoundError as e:
    print(f"Error loading dictionaries: {e}")
    print("You may need to install dictionaries. Try: pip install pyenchant")
    us_dict = None
    gb_dict = None

# -------------------------------------------------------------------
# FORCE REMOVE / FORCE ADD LISTS
# -------------------------------------------------------------------
FORCE_REMOVE = {
                    'paris', 'decolour', 'decoloured', 'decolouring', 'decolours', 'christiania', 'christianias', 'phoenix', 'phonenixes'
                }

FORCE_ADD = {
                'islam', 'islamic', 'christian', 'hindu', 'muslim', 'quran', 'dhikr'
            }

# -------------------------------------------------------------------
# LOAD HUMAN NAMES
# -------------------------------------------------------------------
human_names = {n.lower() for n in names.words()}

# -------------------------------------------------------------------
# LOAD COUNTRIES + DEMONYMS
# -------------------------------------------------------------------
country_names = {c.name.lower() for c in pycountry.countries}

country_demonyms = set()
for c in pycountry.countries:
    try:
        info = CountryInfo(c.name).info()
        d = info.get("demonym")
        if d:
            country_demonyms.add(d.lower())
    except:
        pass

# -------------------------------------------------------------------
# REMOVE PURE NAMES (names that have *no* other meaning)
# -------------------------------------------------------------------
def is_pure_person_name(word):
    """Return True only if a word is a human name AND has no non-person definitions."""
    if word.lower() not in human_names:
        return False

    syns = wordnet.synsets(word.lower())
    if not syns:
        return True

    for syn in syns:
        if syn.lexname() != "noun.person":
            return False

    return True

# -------------------------------------------------------------------
# REMOVE BRITISH SPELLINGS
# -------------------------------------------------------------------
def is_british(word):
    """Detect British spellings via dictionary checks + known patterns."""
    if us_dict is None or gb_dict is None:
        return False

    singular = word.lower()

    if gb_dict.check(singular) and not us_dict.check(singular):
        return True

    # Common British patterns
    patterns = [
        ('our', 'or'), ('re', 'er'), ('ise', 'ize'), ('yse', 'yze'),
        ('isation', 'ization'), ('ogue', 'og'), ('ence', 'ense')
    ]
    for british, american in patterns:
        if singular.endswith(british) and len(singular) > len(british) + 1:
            us_variant = singular[:-len(british)] + american
            if us_dict.check(us_variant) and not us_dict.check(singular):
                return True

    if singular == 'aluminium':
        return True

    # Double-l rule
    if 'll' in singular and any(singular.endswith(suf) for suf in ['lled', 'lling', 'llery', 'ller']):
        us_variant = singular.replace('ll', 'l', 1)
        if us_dict.check(us_variant) and not us_dict.check(singular):
            return True

    return False

# -------------------------------------------------------------------
# EXCLUSIVELY PROPER NOUN
# -------------------------------------------------------------------
def is_exclusively_proper_noun(word):
    """
    True if every sense is either noun.person or noun.location,
    OR WordNet has no synsets.
    """
    syns = wordnet.synsets(word.lower())
    if not syns:
        return True

    for syn in syns:
        if syn.lexname() not in ["noun.person", "noun.location"]:
            return False

    return True

def is_proper_noun_to_remove(word):
    """Return True only if word is a proper noun AND is a city/country."""
    if not is_exclusively_proper_noun(word):
        return False
    geo = GeoText(word.capitalize())
    return bool(geo.cities or geo.countries)

# -------------------------------------------------------------------
# LEMMATIZER FOR PLURAL HANDLING
# -------------------------------------------------------------------
lemmatizer = WordNetLemmatizer()

def normalize(word):
    """Return singular form of word (handles most plurals)."""
    return lemmatizer.lemmatize(word.lower(), pos='n')  # Singular

# -------------------------------------------------------------------
# MAIN FILTER
# -------------------------------------------------------------------
input_path = 'qiyaas/data/intmed/words_scrabble_raw.txt'
output_path = 'qiyaas/data/intmed/valid_words_list.txt'

with open(input_path, 'r', encoding='utf-8') as f:
    raw_words = [w.strip() for w in f.read().split()]

filtered = set()

for raw in raw_words:
    surface = raw.lower()
    singular = normalize(surface)

    # FORCE REMOVE CHECK
    if surface in FORCE_REMOVE:
        continue

    # RULE 1: Length must be between 3-9 characters
    if len(surface) < 3 or len(surface) > 9:
        continue

    # RULE 2: Must exist in WordNet
    if not wordnet.synsets(singular):
        continue

    # RULE 3: Remove demonyms & countries
    if singular in country_names or singular in country_demonyms:
        continue

    # RULE 4: Remove pure human names
    if is_pure_person_name(singular):
        continue

    # RULE 5: Remove British spellings
    if is_british(singular) or is_british(surface):
        continue

    # RULE 6: Remove proper nouns that are places
    if is_proper_noun_to_remove(raw):
        continue

    # Passed all tests → keep original surface form
    filtered.add(surface)

# ADD FORCED WORDS (only if they meet length requirement)
for word in FORCE_ADD:
    if 3 <= len(word) <= 9:
        filtered.add(word)

# -------------------------------------------------------------------
# SAVE OUTPUT
# -------------------------------------------------------------------
filtered_sorted = sorted(filtered)

with open(output_path, 'w', encoding='utf-8') as f:
    for w in filtered_sorted:
        f.write(w + '\n')

print("Total words kept:", len(filtered_sorted))