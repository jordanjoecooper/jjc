const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = 3000;

// Add multer for handling multipart/form-data
const upload = multer();

// Post templates
const postTemplate = (metadata) => `<!-- Title: ${metadata.title} -->
<!-- Description: ${metadata.description} -->
<!-- Section: ${metadata.section || 'Notes'} -->
<!-- Tags: ${metadata.tags} -->
<!-- Updated: ${metadata.updated} -->
<!-- Created: ${metadata.created} -->
<!-- Type: ${metadata.type || 'note'} -->
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
      <a href="../" class="logo">J</a>
      <div class="nav-links">
        <a href="../about.html">About</a>
      </div>
    </nav>

    <header class="post-heading">
      <h1>${metadata.title}</h1>
      <p class="post-description">${metadata.description}</p>
      <div class="post-metadata-header">
        <span>${metadata.section || 'NOTES'}</span>
        <span>•</span>
        <span>Jordan Joe Cooper</span>
        <span>•</span>
        <time>${metadata.created}</time>
      </div>
    </header>

    <main>
      <div class="post-content">
        ${metadata.content || ''}
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
        <a href="../" class="back-button">Back to home</a>
      </div>
    </main>
  </div>
</body>
</html>`;

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
      <a href="../" class="logo">J</a>
      <div class="nav-links">
        <a href="../about.html">About</a>
      </div>
    </nav>

    <header class="post-heading">
      <h1>${metadata.title}</h1>
      <p class="post-description">${metadata.description}</p>
      <div class="post-metadata-header">
        <span>Library</span>
        <span>•</span>
        <span>Jordan Joe Cooper</span>
        <span>•</span>
        <time>${metadata.created}</time>
      </div>
    </header>

    <main>
      <div class="book-cover-container">
        <img src="../images/books/${metadata.id}.jpg" alt="Cover of ${metadata.title}" class="book-cover-image">
        <h2 class="book-author">by ${metadata.author}</h2>
      </div>

      <div class="book-content">
        ${metadata.content || ''}
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
        <a href="../" class="back-button">Back to home</a>
      </div>
    </main>
  </div>
</body>
</html>`;

// Enable CORS and JSON parsing
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
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
          date: metadata.created,
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
            date: metadata.created,
            created: metadata.created,
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

      // If it's a library item, preserve both the book cover and content
      if (filePath.includes('/library/')) {
        console.log('Processing library item content');
        const bookCoverMatch = mainContent.match(/<div class="book-cover-container">[\s\S]*?<\/div>/);
        const bookContentMatch = mainContent.match(/<div class="book-content">([\s\S]*?)<\/div>/);

        if (bookCoverMatch) {
          metadata.bookCoverHtml = bookCoverMatch[0];
        }
        if (bookContentMatch) {
          metadata.content = bookContentMatch[1];
          mainContent = bookContentMatch[1];
        }
      } else {
        // For regular posts, just get the content div
        const contentMatch = mainContent.match(/<div class="post-content">([\s\S]*?)<\/div>/);
        if (contentMatch) {
          mainContent = contentMatch[1];
        }
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

    // For library items, include both the book cover HTML and content
    const response = {
      id: req.params.id,
      ...metadata,
      content: mainContent.trim(),
      type: filePath.includes('/library/') ? 'library' : 'post'
    };

    if (filePath.includes('/library/')) {
      response.bookCoverHtml = metadata.bookCoverHtml;
    }

    res.json(response);
  } catch (error) {
    console.error('Error getting item:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
});

// Create a new post
app.post('/api/posts', upload.none(), (req, res) => {
  try {
    const { title, content, description, tags, section } = req.body;

    // Generate metadata
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const metadata = {
      title,
      description,
      section: section || 'Notes',
      tags: tags || '',
      created: now,
      updated: now,
      content: content || '',
      type: 'note'
    };

    // Generate filename from title
    const filename = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '.html';

    // Always save new posts to the posts directory
    const targetDir = path.join(__dirname, '..', 'posts');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate HTML content using template
    const htmlContent = postTemplate(metadata);

    // Write file
    fs.writeFileSync(path.join(targetDir, filename), htmlContent);

    res.json({
      success: true,
      message: 'Post created successfully',
      filename
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
});

// Update an existing post
app.put('/api/posts/:id', upload.none(), (req, res) => {
  try {
    const { title, content, description, tags, section, type, author, bookCover } = req.body;
    // Ensure the fileName has .html extension
    const fileName = req.params.id.endsWith('.html') ? req.params.id : `${req.params.id}.html`;

    // First check where the file currently exists
    const postsPath = path.join(__dirname, '..', 'posts', fileName);
    const libraryPath = path.join(__dirname, '..', 'library', fileName);
    const libraryDir = path.join(__dirname, '..', 'library');

    let filePath;
    let isLibrary = section === 'Library';

    // Log the paths we're checking
    console.log('Checking paths:', {
      postsPath,
      libraryPath,
      exists: {
        posts: fs.existsSync(postsPath),
        library: fs.existsSync(libraryPath)
      }
    });

    if (fs.existsSync(postsPath)) {
      filePath = postsPath;
      // If file exists in posts but section is Library, we'll move it
      if (isLibrary) {
        // Ensure library directory exists before moving
        if (!fs.existsSync(libraryDir)) {
          fs.mkdirSync(libraryDir, { recursive: true });
        }
        fs.renameSync(postsPath, libraryPath);
        filePath = libraryPath;
      }
    } else if (fs.existsSync(libraryPath)) {
      filePath = libraryPath;
      // If file exists in library but section is not Library, we'll move it
      if (!isLibrary) {
        fs.renameSync(libraryPath, postsPath);
        filePath = postsPath;
      }
    } else {
      console.error('File not found in either location:', { postsPath, libraryPath });
      return res.status(404).json({
        error: 'File not found in either posts or library directory',
        details: { postsPath, libraryPath }
      });
    }

    // Read the existing file to get its metadata
    console.log('Reading file from:', filePath);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalMetadata = parsePostMetadata(originalContent);

    // Generate metadata
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const metadata = {
      title,
      description,
      section: isLibrary ? 'Library' : (section || 'Notes'),
      tags: tags || '',
      created: originalMetadata.created || now,
      updated: now,
      type: isLibrary ? 'library' : 'note',
      id: req.params.id
    };

    // For library items, we need to handle the content differently
    if (isLibrary) {
      metadata.author = author || originalMetadata.author;
      metadata.bookCover = bookCover || originalMetadata.bookCover;
      // Remove any existing book cover container from the content
      metadata.content = content.replace(/<div class="book-cover-container">[\s\S]*?<\/div>/, '').trim();
    } else {
      metadata.content = content;
    }

    // Use the appropriate template
    const template = isLibrary ? libraryTemplate : postTemplate;
    fs.writeFileSync(filePath, template(metadata));

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      error: 'Failed to update post',
      details: error.message,
      stack: error.stack
    });
  }
});

function parsePostMetadata(content) {
  console.log('Parsing metadata from content:', content.substring(0, 500) + '...');

  // Extract metadata from HTML comments
  const metadata = {
    title: content.match(/<!--\s*Title:\s*(.*?)\s*-->/s)?.[1],
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

  // Set default values
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  metadata.created = metadata.created || now;
  metadata.updated = metadata.updated || metadata.created || now;
  metadata.section = metadata.section || 'Uncategorized';
  metadata.type = metadata.type || 'post';

  console.log('Final metadata:', metadata);
  return metadata;
}

// Start the server
app.listen(port, () => {
  console.log(`Editor server running at http://localhost:${port}`);
  console.log(`Visit http://localhost:${port}/editor/editor.html to create new posts`);
});
