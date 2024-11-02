#!/bin/bash

# Path to the hooks directory
HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

# Create the pre-commit hook file
cat << 'EOF' > "$HOOKS_DIR/pre-commit"
#!/bin/bash

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only)

# Only update if content files have changed
if echo "$STAGED_FILES" | grep -q "\.html$\|\.css$\|\.md$"; then
    # Get the current date in the desired format
    current_date=$(date "+%B %d, %Y")

    # Path to index.html
    INDEX_FILE="index.html"

    # Create a temporary file
    TEMP_FILE=$(mktemp)

    # Update the last-updated line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS version
        sed "/class=\"last-updated\"/c\\
        <div class=\"last-updated\">Last updated: ${current_date}</div>" "$INDEX_FILE" > "$TEMP_FILE"
        mv "$TEMP_FILE" "$INDEX_FILE"
    else
        # Linux version
        sed -i "/class=\"last-updated\"/c\\    <div class=\"last-updated\">Last updated: ${current_date}</div>" "$INDEX_FILE"
    fi

    # Add the modified index.html to the commit
    git add "$INDEX_FILE"
    echo "Updated last-updated date in index.html"

    # Clean up
    rm -f "$TEMP_FILE"
fi

exit 0
EOF

# Make the pre-commit hook executable
chmod +x "$HOOKS_DIR/pre-commit"

echo "Pre-commit hook for updating last-updated date has been created and made executable."