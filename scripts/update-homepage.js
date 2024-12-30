const fs = require('fs');
const path = require('path');
const { generateSitemap } = require('./update-sitemap.js');

async function updateHomepage() {
  const libraryItems = [];
  const notes = [];

  // Read library items
  const libraryDir = path.join(process.cwd(), 'library');
  if (fs.existsSync(libraryDir)) {
    const libraryFiles = fs.readdirSync(libraryDir);
    for (const file of libraryFiles) {
      if (file.endsWith('.html')) {
        const content = fs.readFileSync(path.join(libraryDir, file), 'utf8');
        const metadata = extractMetadata(content);
        if (metadata.title) {
          libraryItems.push({
            ...metadata,
            file: file
          });
        }
      }
    }
  }

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
  html = html.replace(
    '<!-- Library items will be dynamically inserted here -->',
    generateLibraryGrid(libraryItems)
  );

  // Replace notes section
  const notesContent = generateNotesGrid(notes);
  html = html.replace(
    /<section id="notes">[\s\S]*?<\/section>/,
    `<section id="notes">
      <h2 class="section-header">Notes</h2>
      <p class="section-description">Quick jots, thoughts and observations.</p>
      <div class="notes-grid">${notesContent}</div>
    </section>`
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
  const metadata = {
    title: extractValue(content, 'Title') || extractTitleFromH1(content) || extractMetaContent(content, 'og:title'),
    date: extractValue(content, 'Date') || extractDateFromTime(content),
    description: extractValue(content, 'Description') || extractMetaContent(content, 'description'),
    author: extractValue(content, 'Author') || 'Jordan Joe Cooper',
    type: extractValue(content, 'Type') || 'note',
    tags: extractValue(content, 'Tags') || '',
    cover: extractValue(content, 'Cover') || extractValue(content, 'BookCover') || extractMetaContent(content, 'og:image')
  };

  // Clean up title if needed
  if (metadata.title && metadata.title.endsWith(' - Jordan Joe Cooper')) {
    metadata.title = metadata.title.replace(' - Jordan Joe Cooper', '');
  }

  // Clean up cover path
  if (metadata.cover) {
    metadata.cover = metadata.cover.replace('../', '').replace(/^\//, '');
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
        <div class="book-author">${item.author}</div>
      </div>
    </a>
  `).join('\n');
}

function generateNotesGrid(items) {
  if (items.length === 0) return '';

  return items.map(item => `
    <a href="posts/${item.file}" class="note-card">
      <h3>${item.title}</h3>
      <p class="note-excerpt">${item.description || ''}</p>
      <div class="meta">
        <time>${new Date(item.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</time>
      </div>
    </a>
  `).join('\n');
}

module.exports = { updateHomepage };

if (require.main === module) {
  updateHomepage();
}