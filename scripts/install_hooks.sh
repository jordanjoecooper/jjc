#!/bin/bash

# Get the git hooks directory
HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

# Create the pre-commit hook
cat << 'EOF' > "$HOOKS_DIR/pre-commit"
#!/bin/bash

# Get the repository root directory
REPO_ROOT=$(git rev-parse --show-toplevel)
INDEX_FILE="$REPO_ROOT/index.html"

# Update last-updated timestamp
current_datetime=$(date "+%B %d, %Y at %H:%M")

if [ -f "$INDEX_FILE" ]; then
    TEMP_FILE=$(mktemp)
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -E "/<div class=\"last-updated\">/c\\
        <div class=\"last-updated\">Last updated: ${current_datetime}</div>" "$INDEX_FILE" > "$TEMP_FILE"
        mv "$TEMP_FILE" "$INDEX_FILE"
    else
        sed -i "/<div class=\"last-updated\">/c\\    <div class=\"last-updated\">Last updated: ${current_datetime}</div>" "$INDEX_FILE"
    fi
    
    rm -f "$TEMP_FILE"
    git add "$INDEX_FILE"
    echo "Updated last-updated timestamp to: $current_datetime"
fi

# Update sitemap
node "$REPO_ROOT/scripts/update_sitemap.js"
if [ $? -eq 0 ]; then
    git add "$REPO_ROOT/sitemap.xml"
    echo "Updated sitemap.xml"
fi

EOF

# Make the pre-commit hook executable
chmod +x "$HOOKS_DIR/pre-commit"

echo "Git pre-commit hook installed successfully"