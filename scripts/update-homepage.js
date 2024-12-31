const fs = require('fs');
const path = require('path');
const { generateSitemap } = require('./update-sitemap.js');

async function updateHomepage() {
  const libraryItems = [];
  const notes = [];

  // Read library items
  const libraryDir = path.join(process.cwd(), 'library');
  console.log('Looking for library items in:', libraryDir);
  if (fs.existsSync(libraryDir)) {
    const libraryFiles = fs.readdirSync(libraryDir);
    console.log('Found library files:', libraryFiles);
    for (const file of libraryFiles) {
      if (file.endsWith('.html')) {
        console.log('\nProcessing library file:', file);
        const content = fs.readFileSync(path.join(libraryDir, file), 'utf8');
        const metadata = extractMetadata(content);
        console.log('Extracted metadata:', metadata);
        if (metadata.title) {
          // Check which image extension exists
          const baseName = file.replace('.html', '');
          const jpgPath = path.join(process.cwd(), 'images', 'books', `${baseName}.jpg`);
          const pngPath = path.join(process.cwd(), 'images', 'books', `${baseName}.png`);
          const imageExt = fs.existsSync(jpgPath) ? 'jpg' : fs.existsSync(pngPath) ? 'png' : 'jpg';

          const item = {
            ...metadata,
            file,
            cover: metadata.type === 'book' ? `images/books/${baseName}.${imageExt}` : null
          };
          console.log('Created library item:', item);
          libraryItems.push(item);
        } else {
          console.log('Skipping file - no title found');
        }
      }
    }
  } else {
    console.log('Library directory not found');
  }
  console.log('\nTotal library items:', libraryItems.length);
  console.log('Library items:', libraryItems);

  // Read posts
  const postsDir = path.join(process.cwd(), 'posts');
  if (fs.existsSync(postsDir)) {
    const postFiles = fs.readdirSync(postsDir);
    for (const file of postFiles) {
      if (file.endsWith('.html') && file !== 'index.html') {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
        const metadata = extractMetadata(content);
        if (metadata.title) {
          notes.push({
            ...metadata,
            file: file
          });
        }
      }
    }
  }

  // Sort all items by date
  libraryItems.sort((a, b) => new Date(b.date) - new Date(a.date));
  notes.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Generate HTML
  const template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  let html = template;

  // Replace library section
  const libraryContent = generateLibraryGrid(libraryItems);
  html = html.replace(
    /<!-- Library items will be dynamically inserted here -->/,
    libraryContent
  );

  // Replace notes section
  const notesContent = generateNotesGrid(notes);
  html = html.replace(
    /<!-- Notes will be dynamically inserted here -->/,
    notesContent
  );

  // Remove articles section for now
  html = html.replace(
    /<section id="articles"[\s\S]*?<\/section>/,
    ''
  );

  fs.writeFileSync(path.join(process.cwd(), 'index.html'), html);
  console.log('Homepage updated successfully');

  // Update sitemap
  await generateSitemap();
}

function extractMetadata(content) {
  console.log('\nExtracting metadata from content...');
  const metadata = {
    title: extractValue(content, 'Title') || extractTitleFromH1(content) || extractMetaContent(content, 'og:title'),
    date: extractValue(content, 'Created') || extractValue(content, 'Date') || extractDateFromTime(content),
    description: extractValue(content, 'Description') || extractMetaContent(content, 'description'),
    author: extractValue(content, 'Author') || 'Jordan Joe Cooper',
    type: extractValue(content, 'Type'),
    tags: extractValue(content, 'Tags') || '',
  };

  // If no type is found but there's an author, it's likely a book
  if (!metadata.type && metadata.author !== 'Jordan Joe Cooper') {
    metadata.type = 'book';
  }

  // Default to note if still no type
  if (!metadata.type) {
    metadata.type = 'note';
  }

  console.log('Extracted raw metadata:', metadata);

  // Clean up title if needed
  if (metadata.title && metadata.title.endsWith(' - Jordan Joe Cooper')) {
    metadata.title = metadata.title.replace(' - Jordan Joe Cooper', '');
  }

  return metadata;
}

function extractValue(content, key) {
  // Try HTML comments first
  const metaMatch = content.match(new RegExp(`<!--\\s*${key}:\\s*(.*?)\\s*-->`));
  if (metaMatch) return metaMatch[1];

  // Try meta tags next
  const metaTagMatch = content.match(new RegExp(`<meta\\s+name="${key.toLowerCase()}"\\s+content="([^"]+)"`));
  if (metaTagMatch) return metaTagMatch[1];

  return '';
}

function extractTitleFromH1(content) {
  const match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  return match ? match[1].trim() : '';
}

function extractDateFromTime(content) {
  const matches = content.match(/<time[^>]*>([^<]+)<\/time>/g);
  if (!matches) return '';

  // Get the first time element that's not in a "Last updated" context
  for (const timeTag of matches) {
    if (!timeTag.includes('Last updated')) {
      const match = timeTag.match(/>([^<]+)</);
      return match ? match[1].trim() : '';
    }
  }
  return '';
}

function extractMetaContent(content, name) {
  const match = content.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`)) ||
                content.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`));
  return match ? match[1] : '';
}

function generateLibraryGrid(items) {
  if (items.length === 0) return '';

  return items.map(item => `
    <a href="library/${item.file}" class="book">
      <div class="book-cover" style="background-image: url('${item.cover}')"></div>
      <div class="book-info">
        <div class="book-title">${item.title}</div>
        <div class="book-author">by ${item.author}</div>
      </div>
    </a>`).join('\n');
}

function generateNotesGrid(items) {
  if (items.length === 0) return '';

  return items.map(item => `
    <a href="posts/${item.file}" class="note-row">
      <div class="note-header">
        <time>${new Date(item.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</time>
        <h3>${item.title}</h3>
      </div>
      <p>${item.description || ''}</p>
    </a>`).join('\n');
}

module.exports = { updateHomepage };

if (require.main === module) {
  updateHomepage();
}