# Jordan Cooper

Personal site built with html, css and minimal JS (currently only used in a script to convert markdown to html). The idea is to build something that looks plain,reasonable and works forever without any external dependencies or updates (crucially with JS turned off the site should function as normal).

# Rules
1. Site should work with and without JavaScript enabled.
2. No Frameworks for functionality or styling.

# Scripts
## Markdown is converted to html using [markdown-to-html.js](scripts/markdown-to-html.js)

This will output a new html file in the posts directory.


## Git Hooks
I use several Git hooks to automate maintenance tasks. Here's how to set them up:

1. Make the installation scripts executable:

bash
chmod +x scripts/install_hooks.sh
chmod +x scripts/update_last_updated.sh
chmod +x scripts/update_sitemap.js
```

2. Run the installation script:

```bash
./scripts/install_hooks.sh
```

## What the Hooks Do

### Pre-commit Hook
This hook runs automatically before each commit and performs these tasks:

1. Updates the "Last updated" timestamp in index.html with the current date and time
2. Generates an updated sitemap.xml containing:
   - All HTML files in the /posts directory
   - Current dates for lastmod fields
3. Adds both modified files (index.html and sitemap.xml) to the commit
