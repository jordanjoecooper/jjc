const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Enable CORS and JSON parsing
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Get all posts
app.get('/api/posts', (req, res) => {
  try {
    const postsDir = path.join(__dirname, '..', 'posts');
    const libraryDir = path.join(__dirname, '..', 'library');

    console.log('Current directory:', __dirname);
    console.log('Posts directory:', postsDir);
    console.log('Library directory:', libraryDir);

    // Get posts
    let posts = [];
    if (fs.existsSync(postsDir)) {
      const postFiles = fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.html') && file !== 'index.html');
      console.log('Found post files:', postFiles);

      posts = postFiles.map(file => {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
        const metadata = parsePostMetadata(content);
        return {
          id: file.replace('.html', ''),
          ...metadata,
          file,
          type: 'note',
          path: `/posts/${file}`
        };
      });
    }

    // Get library items
    let libraryItems = [];
    console.log('Checking library directory:', libraryDir);
    if (fs.existsSync(libraryDir)) {
      console.log('Library directory exists');
      const libraryFiles = fs.readdirSync(libraryDir)
        .filter(file => file.endsWith('.html'));
      console.log('Found library files:', libraryFiles);

      libraryItems = libraryFiles.map(file => {
        try {
          const filePath = path.join(libraryDir, file);
          console.log('Reading library file:', filePath);
          const content = fs.readFileSync(filePath, 'utf8');
          console.log('Successfully read library file content');
          const metadata = parsePostMetadata(content);
          console.log('Parsed library metadata:', metadata);

          // Extract author from the content if not in metadata
          let author = metadata.author;
          if (!author) {
            const authorMatch = content.match(/<h2[^>]*class="book-author"[^>]*>by\s+([^<]+)<\/h2>/);
            if (authorMatch) {
              author = authorMatch[1].trim();
            }
          }

          const item = {
            id: file.replace('.html', ''),
            title: metadata.title || file.replace('.html', '').replace(/-/g, ' '),
            date: metadata.date || metadata.created || new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            created: metadata.created || metadata.date,
            updated: metadata.updated || metadata.date,
            description: metadata.description || '',
            section: 'Library',
            type: 'library',
            author: author,
            file,
            path: `/library/${file}`
          };
          console.log('Created library item:', item);
          return item;
        } catch (error) {
          console.error('Error processing library file:', file, error);
          return null;
        }
      }).filter(item => item !== null); // Remove any failed items
    } else {
      console.log('Library directory does not exist');
    }

    console.log('Posts found:', posts.length, posts.map(p => p.title));
    console.log('Library items found:', libraryItems.length, libraryItems.map(l => l.title));

    // Combine all items
    const allItems = [...posts, ...libraryItems];
    console.log('Total items before sort:', allItems.length);

    // Sort by date
    const sortedItems = allItems.sort((a, b) => {
      const dateA = new Date(b.date || b.created || '1970-01-01');
      const dateB = new Date(a.date || a.created || '1970-01-01');
      return dateA - dateB;
    });

    console.log('Final items:', sortedItems.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title
    })));

    res.json(sortedItems);
  } catch (error) {
    console.error('Error getting posts and library items:', error);
    res.status(500).json({ error: 'Failed to get posts and library items', details: error.message });
  }
});

// Get single post
app.get('/api/posts/:id', (req, res) => {
  try {
    // Try posts directory first
    let filePath = path.join(__dirname, '..', 'posts', `${req.params.id}.html`);

    // If not found in posts, try library directory
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, '..', 'library', `${req.params.id}.html`);
    }

    console.log('Reading file:', filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = parsePostMetadata(content);
    console.log('Parsed metadata:', metadata);

    // Extract the main content - look for different possible patterns
    let mainContent = '';

    // Try to find content within main tags first
    const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    if (mainMatch) {
      console.log('Found main content within <main> tags');
      mainContent = mainMatch[1];

      // Remove the back button container if present
      mainContent = mainContent.replace(/<div class="back-button-container">[\s\S]*?<\/div>/, '');

      // If it's a library item, preserve the book cover container
      if (metadata.type === 'library') {
        console.log('Preserving book cover for library item');
        const bookCoverMatch = mainContent.match(/<div class="book-cover-container">[\s\S]*?<\/div>/);
        if (bookCoverMatch) {
          metadata.bookCoverHtml = bookCoverMatch[0];
        }
      }

      // Extract just the content div
      const contentMatch = mainContent.match(/<div[^>]*>([\s\S]*?)<\/div>\s*$/);
      if (contentMatch) {
        mainContent = contentMatch[1];
      }
    } else {
      console.log('No main tags found, looking for body content');
      // Fallback to looking for content in body
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
      if (bodyMatch) {
        mainContent = bodyMatch[1];
        // Remove header and back button if present
        mainContent = mainContent
          .replace(/<header[^>]*>[\s\S]*?<\/header>/, '')
          .replace(/<div class="back-button-container">[\s\S]*?<\/div>/, '');
      }
    }

    console.log('Extracted content length:', mainContent.length);
    console.log('Content preview:', mainContent.substring(0, 200) + '...');

    res.json({
      id: req.params.id,
      ...metadata,
      content: mainContent.trim(),
      type: filePath.includes('/library/') ? 'library' : 'post'
    });
  } catch (error) {
    console.error('Error getting item:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
});

function parsePostMetadata(content) {
  console.log('Parsing metadata from content:', content.substring(0, 500) + '...');

  // Try to get metadata from HTML comments first
  const metadata = {
    title: content.match(/<!--\s*Title:\s*(.*?)\s*-->/s)?.[1],
    date: content.match(/<!--\s*Date:\s*(.*?)\s*-->/s)?.[1],
    created: content.match(/<!--\s*Created:\s*(.*?)\s*-->/s)?.[1],
    updated: content.match(/<!--\s*Updated:\s*(.*?)\s*-->/s)?.[1],
    description: content.match(/<!--\s*Description:\s*(.*?)\s*-->/s)?.[1],
    section: content.match(/<!--\s*Section:\s*(.*?)\s*-->/s)?.[1],
    tags: content.match(/<!--\s*Tags:\s*(.*?)\s*-->/s)?.[1],
    type: content.match(/<!--\s*Type:\s*(.*?)\s*-->/s)?.[1],
    author: content.match(/<!--\s*Author:\s*(.*?)\s*-->/s)?.[1],
    bookCover: content.match(/<!--\s*Cover:\s*(.*?)\s*-->/s)?.[1]
  };

  console.log('Extracted metadata from comments:', metadata);

  // Fallback to meta tags if needed
  if (!metadata.title) {
    metadata.title = content.match(/<title[^>]*>([^<]+)<\/title>/s)?.[1]?.replace(' - Jordan Joe Cooper', '') ||
                   content.match(/<h1[^>]*>([^<]+)<\/h1>/s)?.[1];
  }

  if (!metadata.date) {
    metadata.date = content.match(/<time[^>]*>([^<]+)<\/time>/s)?.[1];
  }

  if (!metadata.description) {
    metadata.description = content.match(/<meta\s+name="description"\s+content="([^"]+)"/s)?.[1];
  }

  if (!metadata.section) {
    metadata.section = content.match(/<meta\s+name="section"\s+content="([^"]+)"/s)?.[1];
  }

  if (!metadata.tags) {
    metadata.tags = content.match(/<meta\s+name="keywords"\s+content="([^"]+)"/s)?.[1];
  }

  if (!metadata.author && !metadata.type) {
    // Check if this is a library item by looking for book-specific elements
    const hasBookCover = content.includes('book-cover-container');
    const hasAuthor = content.match(/<h2[^>]*class="book-author"[^>]*>by\s+([^<]+)<\/h2>/s);
    if (hasBookCover || hasAuthor) {
      metadata.type = 'library';
      if (hasAuthor) {
        metadata.author = hasAuthor[1];
      }
    }
  }

  // Set defaults for missing values
  metadata.created = metadata.created || metadata.date;
  metadata.updated = metadata.updated || metadata.date;
  metadata.section = metadata.section || 'Uncategorized';
  metadata.type = metadata.type || (metadata.section === 'Library' ? 'library' : 'post');

  // Clean up title if it includes the site name
  if (metadata.title && metadata.title.includes(' - Jordan Joe Cooper')) {
    metadata.title = metadata.title.replace(' - Jordan Joe Cooper', '');
  }

  console.log('Final metadata:', metadata);
  return metadata;
}

// Start the server
app.listen(port, () => {
  console.log(`Editor server running at http://localhost:${port}`);
  console.log(`Visit http://localhost:${port}/editor/editor.html to create new posts`);
});
