# Jordan Cooper

Personal site built with html, css and minimal JS (currently only used in scripts to manage content). The idea is to build something that looks plain, reasonable and works forever without any external dependencies or updates (crucially with JS turned off the site should function as normal).

# Rules
1. Site should work with and without JavaScript enabled.
2. No Frameworks for the live functionality or styling - only for creation on my machine or deployment.

# Setup
1. Install dependencies:
```bash
npm install
```

# Content Management Scripts
The site includes three main scripts for content management:

## 1. Creating New Posts (`editor/new-post.js`)
Creates new blog posts with all necessary metadata and updates site content:
```bash
npm run new-post
```

You will be prompted for:
- Post title
- Post description (for meta tags)
- Tags (comma-separated)

The script automatically:
- Creates a new HTML file with proper metadata and structure
- Updates the homepage
- Updates the sitemap
- Adds proper meta tags and SEO elements

## 2. Updating Homepage (`update_homepage.js`)
Updates the homepage with the latest posts:
```bash
npm run update-homepage
```

This script:
- Scans all posts in the `/posts` directory
- Sorts them by date
- Updates the posts list on the homepage
- Updates the "Last updated" timestamp

## 3. Updating Sitemap (`update_sitemap.js`)
Updates the sitemap with all current posts:
```bash
npm run update-sitemap
```

This script:
- Generates a new sitemap.xml
- Includes all HTML files in the /posts directory
- Updates timestamps

# Git Hooks
The site uses Git hooks to automate updates. To set them up:

1. Make the installation script executable:
```bash
chmod +x scripts/install_hooks.sh
```

2. Run the installation script:
```bash
./scripts/install_hooks.sh
```

This installs two hooks:

### Pre-commit Hook
Runs automatically before each commit:
1. Updates the "Last updated" timestamp
2. Regenerates the sitemap
3. Adds modified files to the commit

### Pre-push Hook
Runs automatically before pushing to remote:
1. Updates the homepage with latest articles
2. If changes are detected:
   - Stages the updated index.html
   - Creates a commit with the changes
   - Includes these changes in the push
