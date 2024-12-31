const fs = require('fs');
const path = require('path');
const { postTemplate } = require('./editor-server.js');

// Function to extract metadata from post content
function parsePostMetadata(content) {
  const metadata = {};
  const metadataRegex = /<!--\s*(.*?):\s*(.*?)\s*-->/g;
  let match;

  while ((match = metadataRegex.exec(content)) !== null) {
    const [, key, value] = match;
    metadata[key.toLowerCase()] = value;
  }

  // Extract content
  const contentMatch = content.match(/<div class="post-content">([\s\S]*?)<\/div>/);
  metadata.content = contentMatch ? contentMatch[1].trim() : '';

  return metadata;
}

// Get all posts
const postsDir = path.join(__dirname, '..', 'posts');
const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith('.html') && file !== 'index.html');

console.log('Found post files:', files);

// Update each post
files.forEach(file => {
  console.log('\nProcessing post file:', file);
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const metadata = parsePostMetadata(content);

  // Generate new content using template
  const newContent = postTemplate(metadata);
  fs.writeFileSync(filePath, newContent);
  console.log('Updated:', file);
});