# quote_words.py

# This script takes a plain text word list (one word per line)
# and outputs a version where each word is wrapped in double quotes.

# input_path = 'qiyaas/data/intmed/words_list.txt' # your existing output file
# output_path = 'qiyaas/data/wordsList.js'  # new file with quotes


input_path = 'qiyaas/data/intmed/filtered_common_words.txt' # your existing output file
output_path = 'qiyaas/data/dailywordsList.js'  # new file with quotes

with open(input_path, 'r', encoding='utf-8') as infile:
    words = [line.strip() for line in infile if line.strip()]

with open(output_path, 'w', encoding='utf-8') as outfile:
    outfile.write("const words = [ \n")
    for word in words:
        outfile.write(f'"{word.upper()}",\n')
    outfile.write("]; \n \n")
    outfile.write("export default words;")

