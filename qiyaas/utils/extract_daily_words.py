import re
import nltk
from better_profanity import profanity
from wordfreq import zipf_frequency
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
import enchant

# Setup
for resource in ['averaged_perceptron_tagger', 'wordnet', 'omw-1.4']:
    try:
        nltk.data.find(f'taggers/{resource}' if 'tagger' in resource else f'corpora/{resource}')
    except LookupError:
        nltk.download(resource)

profanity.load_censor_words()
lemmatizer = WordNetLemmatizer()

us_dict = enchant.Dict("en_US")
uk_dict = enchant.Dict("en_GB")

BLOCKLIST = {'sexy', 'sex'}
FORCE_INCLUDE = {'town'}

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

with open("qiyaas/data/wordslist.js", "r", encoding="utf-8") as f:
    text = f.read()

all_words = re.findall(r'"([A-Za-z]+)"', text)
tagged_words = nltk.pos_tag([w.lower() for w in all_words])

clean_words = []
forced_words_added = set()

for word, tag in tagged_words:
    word_lower = word.lower()
    pos = get_pos_for_lemmatizer(tag)
    lemma = lemmatizer.lemmatize(word_lower, pos)

    # Detect British spellings automatically
    if not us_dict.check(word_lower) and uk_dict.check(word_lower):
        print(f"Skipping British spelling: {word_lower}")
        continue

    # Skip plurals / inflected forms
    if lemma != word_lower:
        print(f"Skipping plural/inflected: {word_lower} to {lemma}")
        continue

    if word_lower in BLOCKLIST:
        print(f"Blocking: {word_lower}")
        continue

    if word_lower in FORCE_INCLUDE:
        clean_words.append(word_lower)
        forced_words_added.add(word_lower)
        print(f"Force-included: {word_lower}")
        continue

    if (
        len(word) <= 9
        and not profanity.contains_profanity(word)
        and zipf_frequency(word, "en") > 4.0
        and tag not in ("VBD", "VBN")
    ):
        clean_words.append(word_lower)

for force_word in FORCE_INCLUDE:
    if force_word not in forced_words_added and force_word not in clean_words:
        clean_words.append(force_word)
        print(f"Force-added '{force_word}'")

clean_words = sorted(set(clean_words))
output_path = "qiyaas/data/intmed/filtered_common_words.txt"

with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(clean_words))

print(f"Filtered {len(all_words)} to {len(clean_words)} clean American singular words.")
