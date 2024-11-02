#!/bin/bash

# Get the current date and time
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS version
    current_datetime=$(date "+%B %d, %Y at %H:%M")
else
    # Linux version
    current_datetime=$(date "+%B %d, %Y at %H:%M")
fi

INDEX_FILE="index.html"

# Check if index.html exists
if [ ! -f "$INDEX_FILE" ]; then
    echo "Error: index.html not found"
    exit 1
fi

# Create a temporary file
TEMP_FILE=$(mktemp)

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS version
    sed -E "/<div class=\"last-updated\">/c\\
    <div class=\"last-updated\">Last updated: ${current_datetime}</div>" "$INDEX_FILE" > "$TEMP_FILE"
    mv "$TEMP_FILE" "$INDEX_FILE"
else
    # Linux version
    sed -i "/<div class=\"last-updated\">/c\\    <div class=\"last-updated\">Last updated: ${current_datetime}</div>" "$INDEX_FILE"
fi

# Clean up
rm -f "$TEMP_FILE"

echo "Updated last-updated date to: $current_datetime" 