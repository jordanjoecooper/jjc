# Jordan Cooper

Personal site built with html, css and minimal JS (currently only used in a script to convert markdown to html). The idea is to build something that looks plain,reasonable and works forever without any external dependencies or updates (crucially with JS turned off the site should function as normal).

# Rules
1. Site should work with and without JavaScript enabled.
2. No Frameworks for functionality or styling.

# Scripts
## Markdown is converted to html using [markdown-to-html.js](scripts/markdown-to-html.js)

This will output a new html file in the posts directory.

## A pre-commit hook is used to update the last-updated date in index.html
[create_last_updated_hook.sh](scripts/create_last_updated_hook.sh) and will update the date in the index.html file whenever a commit is pushed to the repo.

Usage
- chmod +x scripts/create_last_updated_hook.sh
- ./scripts/create_last_updated_hook.sh
