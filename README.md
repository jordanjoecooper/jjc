# Jordan Cooper - Go Site Generator

Personal site built with Go, generating static HTML from markdown content. The site works without JavaScript and has minimal external dependencies.

## Features

- **Markdown Content**: Posts are written in markdown with YAML frontmatter
- **Static Generation**: Go binary generates all HTML, sitemap, and homepage
- **No Runtime Dependencies**: Single Go binary, no Node.js or other runtimes needed
- **Automated Workflow**: Git hooks automatically rebuild and update the site on every commit/push
- **Development Tools**: Simple scripts for common development tasks
- **Library Management**: Book reviews and notes in markdown format

## Quick Start

1. **Install Go** (1.21 or later)
2. **Build the site generator**:
   ```bash
   go build -o scripts/builder/bin/site scripts/builder/cmd/site/main.go
   ```
3. **Install git hooks** (automates everything):
   ```bash
   ./scripts/install-hooks.sh
   ```

## Development Workflow

### Automatic (Recommended)
Once git hooks are installed, everything happens automatically:

```bash
# Create a new post
./scripts/dev.sh new "My New Post"

# Edit the markdown file in posts/
# Commit your changes
git add posts/my-new-post.md
git commit -m "Add new post"

# The site is automatically rebuilt and updated!
```

### Manual Commands
```bash
# Build everything
./scripts/build.sh

# Create a new post
./scripts/builder/bin/site -cmd new-post -title "Post Title" -desc "Description" -tags "tag1,tag2" -section "Notes"

# Update homepage
./scripts/builder/bin/site -cmd update-homepage

# Generate sitemap
./scripts/builder/bin/site -cmd update-sitemap

# Update library
./scripts/builder/bin/site -cmd update-library

# Convert HTML to markdown
./scripts/builder/bin/site -cmd convert-to-markdown

## Development Helper

Use `./scripts/dev.sh` for common tasks:

```bash
./scripts/dev.sh build      # Build the site
./scripts/dev.sh new "Title" # Create new post
./scripts/dev.sh serve       # Start local server
./scripts/dev.sh watch       # Watch for changes
./scripts/dev.sh clean       # Clean up files
```

## Git Hooks

The installed git hooks automatically:

- **pre-commit**: Rebuilds site and stages generated files
- **pre-push**: Rebuilds site, stages files, and auto-commits if needed

This ensures your site is always up-to-date with your content changes.

## Content Structure

### Markdown Posts

Posts are stored in `posts/` as `.md` files with YAML frontmatter:

```markdown
---
title: "Post Title"
description: "Post description"
section: "Notes"
tags: "tag1,tag2"
created: "January 1, 2024"
updated: "January 1, 2024"
type: "note"
---

# Post Title

Your content here...
```

### Library Items

Book reviews and notes are stored in `library/` as `.html` files (to be migrated to markdown).

### Generated Files

- `index.html` - Homepage (auto-generated)
- `sitemap.xml` - Sitemap (auto-generated)
- `posts/*.html` - Individual post pages (auto-generated from markdown)

## File Structure

```
jjc/
├── scripts/
│   ├── builder/
│   │   ├── cmd/site/main.go  # Main CLI entry point
│   │   ├── internal/site/generator.go # Core site generation logic
│   │   └── bin/site          # Go binary (generated)
│   ├── build.sh              # Unified build script
│   ├── dev.sh                # Development helper
│   ├── migrate.sh            # Migration helper
│   └── install-hooks.sh      # Git hooks installer
├── posts/*.md                # Markdown posts
├── library/*.html            # Book reviews (to be migrated)
├── images/                   # Static images and icons
├── styles.css                # Site styles
├── about.html                # About page
├── go.mod                    # Go module file
├── go.sum                    # Go dependencies
├── README-GO.md              # This documentation
└── README.md                 # Original Node.js documentation
```

## Available Commands

### Site Generator Commands
```bash
./scripts/builder/bin/site -cmd new-post -title "Title" -desc "Description" -tags "tags" -section "Notes"
./scripts/builder/bin/site -cmd update-homepage
./scripts/builder/bin/site -cmd update-sitemap
./scripts/builder/bin/site -cmd update-library
./scripts/builder/bin/site -cmd convert-to-markdown
```

### Development Scripts
```bash
./scripts/build.sh            # Build everything
./scripts/dev.sh build        # Build site
./scripts/dev.sh new "Title"  # Create post
./scripts/dev.sh serve        # Local server
./scripts/dev.sh watch        # Auto-rebuild
./scripts/dev.sh clean        # Clean up
./scripts/migrate.sh          # Migration helper
./scripts/install-hooks.sh    # Install git hooks
```

## Migration from Node.js

The old Node.js scripts have been replaced with a single Go binary. To migrate:

1. Convert existing HTML posts to markdown:
   ```bash
   ./site -cmd convert-to-markdown
   ```

2. Move markdown files from `posts-md/` to `posts/`

3. Remove Node.js dependencies:
   ```bash
   rm package.json package-lock.json
   rm -rf node_modules
   ```

4. Update git hooks:
   ```bash
   ./scripts/install-hooks.sh
   ```

## Benefits of Go Migration

- **Simpler Deployment**: Single binary, no runtime dependencies
- **Better Performance**: Faster build times
- **Improved Security**: No Node.js attack surface
- **Easier Maintenance**: Single language, fewer moving parts
- **Markdown Content**: More readable and maintainable content format
- **Automated Workflow**: No manual steps required

## Troubleshooting

### Build Fails
```bash
# Clean and rebuild
./scripts/dev.sh clean
go build -o scripts/builder/bin/site scripts/builder/cmd/site/main.go
./scripts/build.sh
```

### Git Hooks Not Working
```bash
# Reinstall hooks
./scripts/install-hooks.sh
```

### Site Not Updating
```bash
# Force rebuild
./scripts/build.sh
git add index.html sitemap.xml
git commit -m "Force rebuild"
```

### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x site
```

### Go Module Issues
```bash
# Clean and reinstall dependencies
go clean -modcache
go mod tidy
go build -o scripts/builder/bin/site scripts/builder/cmd/site/main.go
```

### Content Not Appearing
```bash
# Check markdown syntax
./site -cmd update-homepage
# Verify frontmatter is correct
# Check file permissions
```

## Next Steps

- [ ] Migrate library items from HTML to markdown
- [ ] Add image optimization
- [ ] Add RSS feed generation
- [ ] Add search functionality 