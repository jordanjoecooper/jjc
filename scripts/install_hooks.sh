#!/bin/bash

# Path to the git hooks directory
HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

# Create the pre-commit hook
cat << 'EOF' > "$HOOKS_DIR/pre-commit"
#!/bin/bash

# Run the update script
./scripts/update_last_updated.sh

# Check if the script succeeded
if [ $? -eq 0 ]; then
    # Add the modified index.html to the commit
    git add index.html
    echo "Added updated index.html to commit"
fi

# Allow the commit to proceed
exit 0
EOF

# Make both scripts executable
chmod +x "$HOOKS_DIR/pre-commit"
chmod +x scripts/update_last_updated.sh

echo "Git hooks installed successfully" 