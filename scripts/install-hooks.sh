#!/bin/bash

HOOKS_DIR=".git/hooks"
SCRIPTS_DIR="scripts"

# Create pre-commit hook
cat > "${HOOKS_DIR}/pre-commit" << 'EOL'
#!/bin/bash

# Get the current date and time
DATE=$(date '+%B %d, %Y at %H:%M')

# Update the last updated timestamp in index.html
sed -i '' "s/<div class=\"last-updated\">.*<\/div>/<div class=\"last-updated\">Last updated: ${DATE}<\/div>/" index.html

# Update sitemap
node scripts/update_sitemap.js

# Stage the modified files
git add index.html sitemap.xml
EOL

# Create pre-push hook
cat > "${HOOKS_DIR}/pre-push" << 'EOL'
#!/bin/bash

echo "Updating homepage with latest articles..."
node scripts/update_homepage.js

# Stage and commit the changes if there are any
if [[ -n $(git status -s) ]]; then
    git add index.html
    git commit -m "Update homepage with latest articles"
fi
EOL

# Make hooks executable
chmod +x "${HOOKS_DIR}/pre-commit"
chmod +x "${HOOKS_DIR}/pre-push"

echo "Git hooks installed successfully!"