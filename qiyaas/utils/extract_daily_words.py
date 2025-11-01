import re
import nltk
from better_profanity import profanity
from wordfreq import zipf_frequency

# Make sure NLTK data is ready
try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

profanity.load_censor_words()

# Read words from the JS file
with open("qiyaas/data/wordslist.js", "r", encoding="utf-8") as f:
    text = f.read()

# Extract all words between quotes
all_words = re.findall(r'"([A-Za-z]+)"', text)

# POS-tagging all words once (in lowercase)
tagged_words = nltk.pos_tag([w.lower() for w in all_words])

clean_words = []

for word, tag in tagged_words:
    if (
        len(word) <= 9                                   # only 9 letters or shorter
        and not profanity.contains_profanity(word)       # not profane
        and zipf_frequency(word, "en") > 4.0             # common enough
        and tag not in ("VBD", "VBN")                    # exclude past tense / past participles
    ):
        clean_words.append(word)

# Remove duplicates and sort alphabetically
clean_words = sorted(set(clean_words))

output_path = "qiyaas/data/intmed/filtered_common_words.txt"

# Save to file
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(clean_words))

print(f"Filtered {len(all_words)} words down to {len(clean_words)} clean, common English words (no past tense).")
print(f"Saved to {output_path}")
