import nltk
from nltk import word_tokenize, pos_tag
from nltk.corpus import wordnet, names
from geotext import GeoText
import pycountry
from countryinfo import CountryInfo

# --- Download required NLTK data ---
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')
nltk.download('names')
nltk.download('omw-1.4')

# --- Build dynamic country + demonym sets ---
country_names = {c.name.lower() for c in pycountry.countries}
country_adjectives = set()
for c in pycountry.countries:
    try:
        info = CountryInfo(c.name).info()
        demonym = info.get('demonym')
        if demonym:
            country_adjectives.add(demonym.lower())
    except Exception:
        continue

human_names = set(n.lower() for n in names.words())

# --- Read and tokenize source list ---
input_path = 'qiyaas/data/intmed/words_scrabble_raw.txt'
output_path = 'qiyaas/data/intmed/words_list.txt'

with open(input_path, 'r', encoding='utf-8') as f:
    text = f.read()

tokens = [w.lower() for w in word_tokenize(text) if w.isalpha()]

filtered_words = set()

for word, tag in pos_tag(tokens):
    # Skip proper nouns and short words
    if tag.startswith('NNP'):
        continue
    if len(word) < 3:
        continue

    # Validate via WordNet (recognizes plurals)
    if not wordnet.synsets(word):
        continue

    # Remove people names and geography
    if word in human_names:
        continue
    if word in country_names or word in country_adjectives:
        continue

    geo = GeoText(word)
    if geo.countries or geo.cities:
        continue

    # ✅ Keep plural and singular forms
    filtered_words.add(word)

# --- Sort and save ---
if filtered_words:
    sorted_words = sorted(filtered_words)
    with open(output_path, 'w', encoding='utf-8') as f:
        for word in sorted_words:
            f.write(word + '\n')