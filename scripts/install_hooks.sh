#!/bin/bash

# Get the git hooks directory
HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

# Create the pre-commit hook with the update logic directly inside
cat << 'EOF' > "$HOOKS_DIR/pre-commit"
#!/bin/bash

# Get the repository root directory
REPO_ROOT=$(git rev-parse --show-toplevel)
INDEX_FILE="$REPO_ROOT/index.html"

# Get the current date and time
current_datetime=$(date "+%B %d, %Y at %H:%M")

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

# Stage the modified index.html
git add "$INDEX_FILE"

echo "Updated last-updated timestamp to: $current_datetime"
EOF

# Make the pre-commit hook executable
chmod +x "$HOOKS_DIR/pre-commit"

echo "Git pre-commit hook installed successfully" 