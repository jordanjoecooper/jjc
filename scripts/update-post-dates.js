const fs = require('fs');
const path = require('path');

function parsePostMetadata(content) {
  // Try to get metadata from HTML comments first
  const metadata = {
    title: content.match(/<!--\s*Title:\s*(.*?)\s*-->/s)?.[1],
    date: content.match(/<!--\s*Date:\s*(.*?)\s*-->/s)?.[1],
    created: content.match(/<!--\s*Created:\s*(.*?)\s*-->/s)?.[1],
    updated: content.match(/<!--\s*Updated:\s*(.*?)\s*-->/s)?.[1],
    description: content.match(/<!--\s*Description:\s*(.*?)\s*-->/s)?.[1],
    section: content.match(/<!--\s*Section:\s*(.*?)\s*-->/s)?.[1],
    tags: content.match(/<!--\s*Tags:\s*(.*?)\s*-->/s)?.[1]
  };

  // If no metadata found in comments, try to get from meta tags and content
  if (!metadata.title) {
    metadata.title = content.match(/<title[^>]*>([^<]+)<\/title>/)?.[1]?.replace(' - Jordan Joe Cooper', '') ||
                    content.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1];
  }

  if (!metadata.description) {
    metadata.description = content.match(/<meta\s+name="description"\s+content="([^"]+)"/)?.[1];
  }

  if (!metadata.section) {
    metadata.section = content.match(/<meta\s+name="section"\s+content="([^"]+)"/)?.[1];
  }

  return metadata;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function updatePostDates() {
  const postsDir = path.join(__dirname, '..', 'posts');
  const files = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.html') && file !== 'index.html');

  const now = new Date();
  const formattedNow = formatDate(now);

  files.forEach(file => {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const metadata = parsePostMetadata(content);

    // Get the title from the filename if it's undefined
    const title = metadata.title || file.replace('.html', '').split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Set created date to December 1, 2024 if undefined
    const createdDate = metadata.created || metadata.date || 'December 1, 2024';

    // Set updated date to now if undefined
    const updatedDate = metadata.updated || formattedNow;

    // Update the header section
    const headerPattern = /<header class="post-heading">[\s\S]*?<\/header>/;
    const newHeader = `<header class="post-heading">
    <h1>${title}</h1>
    <div class="post-time">
      <time>${createdDate}</time> <a href="https://jordanjoecooper.dev">Jordan Joe Cooper</a>
      <div class="post-metadata">
        Last updated: <time>${updatedDate}</time>
      </div>
    </div>
  </header>`;

    content = content.replace(headerPattern, newHeader);

    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  });
}

// Run the update
updatePostDates();