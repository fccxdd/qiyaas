import nltk
from nltk import word_tokenize, pos_tag
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer

# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')
nltk.download('omw-1.4')

# Map POS tag to WordNet POS tag
def get_wordnet_pos(tag):
    if tag.startswith('J'):
        return wordnet.ADJ
    elif tag.startswith('V'):
        return wordnet.VERB
    elif tag.startswith('N'):
        return wordnet.NOUN
    elif tag.startswith('R'):
        return wordnet.ADV
    else:
        return wordnet.NOUN  # Default to noun

lemmatizer = WordNetLemmatizer()

# Read and tokenize the file
with open('qiyaas/data/words_raw.txt', 'r', encoding='utf-8') as f:
    text = f.read()

tokens = word_tokenize(text)

# Remove punctuation and make everything lowercase
tokens = [word.lower() for word in tokens if word.isalpha()]

# POS tagging
tagged_tokens = pos_tag(tokens, lang='eng')

# Lemmatize and filter
lemmatized_words = set()
for word, tag in tagged_tokens:
    lemma = lemmatizer.lemmatize(word, get_wordnet_pos(tag))
    if len(lemma) >= 3:  # Keep only words longer than 3 letters
        lemmatized_words.add(lemma)

# Sort the words
sorted_words = sorted(lemmatized_words)

# Write output without blank lines
with open('qiyaas/data/words_list.txt', 'w', encoding='utf-8') as f:
    for word in sorted_words:
        f.write(f"{word}\n")
