#!/bin/bash

HOOKS_DIR=".git/hooks"
SCRIPTS_DIR="scripts"

# Create pre-commit hook
cat > "${HOOKS_DIR}/pre-commit" << 'EOL'
#!/bin/bash

echo "🔄 Pre-commit: Rebuilding site..."
./scripts/build.sh

# Stage all generated files
echo "📝 Staging generated files..."
git add index.html sitemap.xml

echo "✅ Pre-commit hook completed"
EOL

# Create pre-push hook
cat > "${HOOKS_DIR}/pre-push" << 'EOL'
#!/bin/bash

echo "🔄 Pre-push: Rebuilding site..."
./scripts/build.sh

# Stage generated files
echo "📝 Staging generated files..."
git add index.html sitemap.xml

# Check if there are any changes to commit
if [[ -n $(git status --porcelain) ]]; then
    echo "📦 Committing generated files..."
    git commit -m "Auto: rebuild site before push [$(date '+%Y-%m-%d %H:%M')]"
    echo "✅ Auto-commit completed"
else
    echo "✅ No changes to commit"
fi

echo "✅ Pre-push hook completed"
EOL

# Make hooks executable
chmod +x "${HOOKS_DIR}/pre-commit"
chmod +x "${HOOKS_DIR}/pre-push"

echo "✅ Git hooks installed successfully!"
echo ""
echo "📋 Hook behavior:"
echo "  • pre-commit: Rebuilds site and stages generated files"
echo "  • pre-push: Rebuilds site, stages files, and auto-commits if needed"
echo ""
echo "🔄 To apply hooks to current repository:"
echo "  ./scripts/install-hooks.sh"