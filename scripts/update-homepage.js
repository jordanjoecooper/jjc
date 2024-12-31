const fs = require('fs');
const path = require('path');
const { generateSitemap } = require('./update-sitemap.js');

// Import the library template from editor-server.js
const { libraryTemplate } = require('./editor-server.js');

async function updateHomepage() {
  const notes = [];

  // Process library items
  const libraryDir = path.join(__dirname, '..', 'library');
  console.log('Looking for library items in:', libraryDir);

  let libraryItems = [];
  if (fs.existsSync(libraryDir)) {
    const libraryFiles = fs.readdirSync(libraryDir)
      .filter(file => file.endsWith('.html'));
    console.log('Found library files:', libraryFiles);

    libraryItems = libraryFiles.map(file => {
      console.log('\nProcessing library file:', file);

      // Read the file content
      const content = fs.readFileSync(path.join(libraryDir, file), 'utf8');
      console.log('\nExtracting metadata from content...');

      // Extract metadata from HTML comments
      const rawMetadata = {
        title: content.match(/<!--\s*Title:\s*(.*?)\s*-->/)?.[1],
        date: content.match(/<!--\s*Created:\s*(.*?)\s*-->/)?.[1],
        description: content.match(/<!--\s*Description:\s*(.*?)\s*-->/)?.[1],
        author: content.match(/<!--\s*Author:\s*(.*?)\s*-->/)?.[1],
        type: 'book',
        tags: content.match(/<!--\s*Tags:\s*(.*?)\s*-->/)?.[1]
      };
      console.log('Extracted raw metadata:', rawMetadata);

      // Extract content from book-content div
      const contentMatch = content.match(/<div class="book-content">([\s\S]*?)<\/div>/);
      const bookContent = contentMatch ? contentMatch[1].trim() : '';

      // Create metadata object
      const metadata = {
        ...rawMetadata,
        content: bookContent,
        id: file.replace('.html', ''),
        created: rawMetadata.date,
        updated: rawMetadata.date
      };
      console.log('Extracted metadata:', metadata);

      // Generate new file content using the template
      const newContent = libraryTemplate(metadata);

      // Write the updated file
      fs.writeFileSync(path.join(libraryDir, file), newContent);

      // Create library item for homepage
      const item = {
        title: metadata.title || file.replace('.html', '').replace(/-/g, ' '),
        date: metadata.date,
        description: metadata.description || '',
        author: metadata.author,
        type: 'book',
        tags: metadata.tags || '',
        file
      };
      console.log('Created library item:', item);
      return item;
    });
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
  console.log('Extracting metadata from content...');
  const metadata = {
    title: content.match(/<!--\s*Title:\s*(.*?)\s*-->/)?.[1],
    created: content.match(/<!--\s*Created:\s*(.*?)\s*-->/)?.[1],
    updated: content.match(/<!--\s*Updated:\s*(.*?)\s*-->/)?.[1],
    description: content.match(/<!--\s*Description:\s*(.*?)\s*-->/)?.[1],
    section: content.match(/<!--\s*Section:\s*(.*?)\s*-->/)?.[1],
    tags: content.match(/<!--\s*Tags:\s*(.*?)\s*-->/)?.[1],
    type: content.match(/<!--\s*Type:\s*(.*?)\s*-->/)?.[1],
    author: content.match(/<!--\s*Author:\s*(.*?)\s*-->/)?.[1]
  };
  console.log('Extracted raw metadata:', metadata);
  return metadata;
}

function generateLibraryGrid(items) {
  if (items.length === 0) return '';

  return items.map(item => {
    // Find the image - try common formats
    const imageFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const baseImagePath = `images/books/${item.file.replace('.html', '')}`;

    // Find which format exists
    let foundFormat = null;
    for (const format of imageFormats) {
      const testPath = path.join(process.cwd(), baseImagePath + format);
      console.log(`Testing ${item.file} with ${format}: ${testPath}`);
      if (fs.existsSync(testPath)) {
        foundFormat = format;
        console.log(`Found format ${format} for ${item.file}`);
        break;
      }
    }

    // If no format found, default to jpg
    if (!foundFormat) {
      foundFormat = '.jpg';
      console.log(`No format found for ${item.file}, defaulting to jpg`);
    }

    const finalPath = `${baseImagePath}${foundFormat}`;
    console.log(`Final path for ${item.file}: ${finalPath}`);

    return `
    <a href="library/${item.file}" class="book">
      <div class="book-cover" style="background-image: url('${finalPath}')"></div>
      <div class="book-info">
        <div class="book-title">${item.title}</div>
        <div class="book-author">by ${item.author}</div>
      </div>
    </a>`;
  }).join('\n');
}

function generateNotesGrid(items) {
  if (items.length === 0) return '';

  return items.map(item => {
    const date = item.created ? new Date(item.created) : new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `<a href="posts/${item.file}" class="note-row">
      <div class="note-header">
        <time>${formattedDate}</time>
        <h3>${item.title}</h3>
      </div>
      <p>${item.description || ''}</p>
    </a>`;
  }).join('\n');
}

module.exports = { updateHomepage };

if (require.main === module) {
  updateHomepage();
}