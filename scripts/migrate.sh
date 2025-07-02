#!/bin/bash

echo "Starting migration from Node.js to Go..."

# 1. Convert HTML posts to markdown
echo "Step 1: Converting HTML posts to markdown..."
./scripts/builder/bin/site -cmd convert-to-markdown

# 2. Move markdown files to posts directory
echo "Step 2: Moving markdown files..."
if [ -d "posts-md" ]; then
    mv posts-md/*.md posts/ 2>/dev/null || true
    rmdir posts-md
fi

# 3. Build the site
echo "Step 3: Building site with new content..."
./scripts/build.sh

# 4. Update git hooks
echo "Step 4: Updating git hooks..."
./scripts/install-hooks.sh

# 5. Clean up old files (optional)
echo "Step 5: Cleaning up old Node.js files..."
read -p "Remove old Node.js files? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f package.json package-lock.json
    rm -rf node_modules
    echo "Node.js files removed."
fi

echo "Migration completed!"
echo ""
echo "Next steps:"
echo "1. Review the converted markdown files in posts/"
echo "2. Test the site by running: ./scripts/build.sh"
echo "3. Commit your changes"
echo "4. The site is now using Go instead of Node.js!" 