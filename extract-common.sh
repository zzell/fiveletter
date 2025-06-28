#!/bin/bash

INPUT_FILE="SUBTLEXusfrequencyabove1.csv"
OUTPUT_FILE="5_letter_common.json"

# Skip header, extract 5-letter words where FREQcount >= 300
tail -n +2 "$INPUT_FILE" \
  | awk -F',' '{ w=tolower($1); if (length(w) == 5 && $2+0 >= 300) print w }' \
  | sort -u \
  | jq -R . \
  | jq -s . > "$OUTPUT_FILE"

echo "Done. Output written to $OUTPUT_FILE"
