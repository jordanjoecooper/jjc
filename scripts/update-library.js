const fs = require('fs');
const path = require('path');

// Library item template
const libraryTemplate = (metadata) => `<!-- Title: ${metadata.title} -->
<!-- Description: ${metadata.description} -->
<!-- Author: ${metadata.author} -->
<!-- Tags: ${metadata.tags} -->
<!-- Updated: ${metadata.updated} -->
<!-- Created: ${metadata.created} -->
<!-- Type: book -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="${metadata.description}">
  <meta name="keywords" content="${metadata.tags}">
  <meta property="og:title" content="${metadata.title} - Jordan Joe Cooper">
  <meta property="og:type" content="article">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
  <link rel="manifest" href="../site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <title>${metadata.title} - Jordan Joe Cooper</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <div class="container">
    <nav>
      <a href="/" class="logo">J</a>
      <div class="nav-links">
        <a href="../about.html">About</a>
      </div>
    </nav>

    <header class="post-heading">
      <h1>${metadata.title}</h1>
      <p class="post-description">${metadata.description}</p>
      <div class="post-metadata-header">
        <span>LIBRARY</span>
        <span>•</span>
        <span>${metadata.author}</span>
        <span>•</span>
        <time>${metadata.created}</time>
      </div>
    </header>

    <main>
      <div class="post-content">
        ${metadata.content}
      </div>

      <footer class="post-footer">
        <div class="post-tags">
          ${metadata.tags.split(',').map(tag =>
            `<span class="post-tag">${tag.trim()}</span>`
          ).join('\n          ')}
        </div>
        <div class="post-time">
          Last updated: <time>${metadata.updated}</time>
        </div>
      </footer>

      <div class="back-button-container">
        <a href="/" class="back-button">Back to home</a>
      </div>
    </main>
  </div>
</body>
</html>`;

function parseLibraryMetadata(content) {
  // Extract metadata from HTML comments
  const metadata = {
    title: content.match(/<!--\s*Title:\s*(.*?)\s*-->/s)?.[1],
    created: content.match(/<!--\s*Created:\s*(.*?)\s*-->/s)?.[1] || content.match(/<!--\s*Date:\s*(.*?)\s*-->/s)?.[1],
    updated: content.match(/<!--\s*Updated:\s*(.*?)\s*-->/s)?.[1],
    description: content.match(/<!--\s*Description:\s*(.*?)\s*-->/s)?.[1],
    author: content.match(/<!--\s*Author:\s*(.*?)\s*-->/s)?.[1],
    tags: content.match(/<!--\s*Tags:\s*(.*?)\s*-->/s)?.[1]
  };

  // Extract content from the body
  let content_html = '';
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (mainMatch) {
    const contentDiv = mainMatch[1].match(/<div[^>]*>([\s\S]*?)<\/div>/);
    if (contentDiv) {
      content_html = contentDiv[1].trim();
    }
  }

  // If no content found in main, try looking in body
  if (!content_html) {
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if (bodyMatch) {
      content_html = bodyMatch[1]
        .replace(/<header[^>]*>[\s\S]*?<\/header>/, '')
        .replace(/<div class="back-button-container">[\s\S]*?<\/div>/, '')
        .trim();
    }
  }

  metadata.content = content_html;
  return metadata;
}

// Update all items in the library directory
const libraryDir = path.join(__dirname, '..', 'library');
const items = fs.readdirSync(libraryDir)
  .filter(file => file.endsWith('.html'));

console.log('Found library items:', items);

items.forEach(file => {
  const filePath = path.join(libraryDir, file);
  console.log('Processing:', file);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = parseLibraryMetadata(content);
    console.log('Extracted metadata:', metadata);

    // Generate new content using template
    const newContent = libraryTemplate(metadata);

    // Write the updated file
    fs.writeFileSync(filePath, newContent);
    console.log('Updated:', file);
  } catch (error) {
    console.error('Error processing', file, error);
  }
});

console.log('Done updating library items!');