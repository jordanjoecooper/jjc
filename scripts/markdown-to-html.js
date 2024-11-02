const fs = require('fs');
const path = require('path');

// Simple markdown parser functions
function parseMarkdown(markdown) {
    // Split content into title, date, and body
    const lines = markdown.split('\n');
    const title = lines[0].replace('# ', '').trim();
    const date = lines[1].replace('Date: ', '').trim();
    
    // Remove title and date, join remaining lines
    const content = lines.slice(2).join('\n')
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        // Paragraphs
        .replace(/^\s*\n\s*$/gm, '</p><p>')
        .replace(/^([^<].*)/gm, '$1')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Code blocks
        .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');

    return { title, date, content };
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function createHTML(title, date, content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="description" content="${content.split('\n')[0].replace(/<[^>]*>/g, '')}">
    <meta property="og:image" content="../images/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
    <link rel="manifest" href="../site.webmanifest">
    <meta property="og:url" content="https://www.jordanjoecooper.com/posts/${generateSlug(title)}.html" />
    <title>${title} - Jordan Joe Cooper</title>
    <link rel="stylesheet" href="../styles.css" />
    <meta property="og:title" content="${title} - Jordan Joe Cooper">
</head>
<body>
    <header class="post-heading">
        <h1>${title}</h1>
        <div class="post-time">
            <time>${date}</time> by <a href="https://jordanjoecooper.dev">Jordan Joe Cooper</a>
        </div>
    </header>
    <main>
        <div>
            ${content}
        </div>
        <div class="back-button-container">
            <a href="https://jordanjoecooper.dev" class="back-button">Back</a>
        </div>
    </main>
</body>
</html>`;
}

function convertMarkdownToHTML(markdownPath) {
    try {
        // Read markdown file
        const markdown = fs.readFileSync(markdownPath, 'utf-8');
        
        // Parse markdown
        const { title, date, content } = parseMarkdown(markdown);
        
        // Generate HTML
        const html = createHTML(title, date, content);
        
        // Create output filename
        const slug = generateSlug(title);
        const outputPath = path.join(__dirname, '..', 'posts', `${slug}.html`);
        
        // Write HTML file
        fs.writeFileSync(outputPath, html);
        
        console.log(`Successfully created ${outputPath}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Check if markdown file path is provided
const markdownPath = process.argv[2];
if (!markdownPath) {
    console.error('Please provide a markdown file path');
    process.exit(1);
}

convertMarkdownToHTML(markdownPath);
