const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = 3000;

// Add multer for handling multipart/form-data
const upload = multer();

// Post templates
const postTemplate = (metadata) => {
  const tags = metadata.tags ? metadata.tags.split(',').map(tag => tag.trim()) : [];
  const tagsHtml = tags.map(tag => `<span class="post-tag">${tag}</span>`).join('\n');

  return `<!-- Title: ${metadata.title} -->
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
      <time>${metadata.created}</time>
    </header>

    <main>
      <div class="post-content">
        ${metadata.content || ''}
      </div>

      <footer class="post-footer">
        <div class="post-metadata-footer">
          <span>${metadata.section || 'Notes'}</span>
          <span>•</span>
          <span>Jordan Joe Cooper</span>
        </div>
        <div class="post-tags">
          ${tagsHtml}
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
};

function libraryTemplate(metadata) {
  const tags = metadata.tags ? metadata.tags.split(',').map(tag => tag.trim()) : [];
  const tagsHtml = tags.map(tag => `<span class="post-tag">${tag}</span>`).join('\n');

  // Check for supported image formats
  const imageFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const coverImage = imageFormats.find(format =>
    fs.existsSync(path.join(__dirname, '..', 'images', 'books', metadata.id + format))
  ) || '.jpg'; // Default to jpg if no other format found

  return `<!-- Title: ${metadata.title} -->
<!-- Description: ${metadata.description} -->
<!-- Author: ${metadata.author} -->
<!-- Year: ${metadata.year} -->
<!-- Tags: ${metadata.tags} -->
<!-- Updated: ${metadata.updated} -->
<!-- Created: ${metadata.created} -->
<!-- Type: ${metadata.type} -->
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
      <time>${metadata.created}</time>
    </header>

    <main>
      <div class="book-cover-container">
        <img src="../images/books/${metadata.id}${coverImage}" alt="Cover of ${metadata.title}" class="book-cover-image">
        <h2 class="book-author">${metadata.author}</h2>
      </div>

      <div class="book-content">
        ${metadata.content}
      </div>

      <footer class="post-footer">
        <div class="post-metadata-footer">
          <span>Library</span>
          <span>•</span>
          <span>Jordan Joe Cooper</span>
        </div>
        <div class="post-tags">
          ${tagsHtml}
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
}

// Enable CORS and JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log('Request headers:', req.headers);
  console.log('Request body type:', typeof req.body);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log('Request:', req.method, req.url);
  next();
});

// Serve static files from the root directory
const staticPath = path.join(__dirname, '..');
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));

// Get all posts
app.get('/api/posts', (req, res) => {
  try {
    const postsDir = path.join(__dirname, '..', 'posts');
    const libraryDir = path.join(__dirname, '..', 'library');

    // Immediate test of library directory
    console.log('\n=== TESTING LIBRARY ACCESS ===');
    console.log('Library directory path:', libraryDir);
    console.log('Library exists:', fs.existsSync(libraryDir));
    if (fs.existsSync(libraryDir)) {
      const files = fs.readdirSync(libraryDir);
      console.log('Library contents:', files);
    }
    console.log('=== END LIBRARY TEST ===\n');

    console.log('\n=== Starting API Request ===');
    console.log('Current directory:', __dirname);
    console.log('Posts directory:', postsDir);
    console.log('Library directory:', libraryDir);

    // Get posts
    let posts = [];
    console.log('\n=== Processing Posts ===');
    if (fs.existsSync(postsDir)) {
      const postFiles = fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.html') && file !== 'index.html');
      console.log('Found post files:', postFiles);

      posts = postFiles.map(file => {
        console.log('\nProcessing post file:', file);
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
        const metadata = parsePostMetadata(content);
        const post = {
          id: file.replace('.html', ''),
          ...metadata,
          date: metadata.created,
          file,
          type: 'note',
          path: `/posts/${file}`
        };
        console.log('Created post:', {
          id: post.id,
          title: post.title,
          created: post.created,
          type: post.type
        });
        return post;
      });
      console.log('\nProcessed all posts. Count:', posts.length);
    } else {
      console.log('Posts directory does not exist');
    }

    // Get library items
    let libraryItems = [];
    console.log('\n=== Processing Library Items ===');
    console.log('Library directory path:', libraryDir);

    if (fs.existsSync(libraryDir)) {
      console.log('Library directory exists');
      const libraryFiles = fs.readdirSync(libraryDir)
        .filter(file => file.endsWith('.html'));
      console.log('Found library files:', libraryFiles);

      libraryItems = libraryFiles.map(file => {
        try {
          console.log('\nProcessing library file:', file);
          const filePath = path.join(libraryDir, file);
          console.log('Reading from path:', filePath);

          const content = fs.readFileSync(filePath, 'utf8');
          console.log('File content length:', content.length);

          const metadata = parsePostMetadata(content);
          console.log('Parsed metadata:', {
            title: metadata.title,
            created: metadata.created,
            author: metadata.author,
            type: metadata.type
          });

          const item = {
            id: file.replace('.html', ''),
            title: metadata.title || file.replace('.html', '').replace(/-/g, ' '),
            date: metadata.created,
            created: metadata.created,
            updated: metadata.updated || metadata.created,
            description: metadata.description || '',
            section: 'Library',
            type: 'library',
            author: metadata.author,
            file,
            path: `/library/${file}`,  // Add leading slash back
            content: metadata.content || ''
          };
          console.log('Created library item:', {
            id: item.id,
            title: item.title,
            created: item.created,
            type: item.type,
            path: item.path
          });
          return item;
        } catch (error) {
          console.error('Error processing library file:', file, '\nError:', error);
          return null;
        }
      }).filter(item => item !== null);

      console.log('\nProcessed all library items. Count:', libraryItems.length);
      console.log('Library items:', libraryItems.map(item => ({
        id: item.id,
        title: item.title,
        created: item.created
      })));
    } else {
      console.error('Library directory does not exist at:', libraryDir);
    }

    // Combine and sort items
    console.log('\n=== Combining Items ===');
    console.log('Posts count:', posts.length);
    console.log('Library items count:', libraryItems.length);

    const allItems = [...posts, ...libraryItems];
    console.log('Combined items count:', allItems.length);

    const sortedItems = allItems.sort((a, b) => {
      const dateA = new Date(a.created || '1970-01-01');
      const dateB = new Date(b.created || '1970-01-01');
      return dateB - dateA;
    });

    console.log('\n=== Final Response ===');
    console.log('Total items:', sortedItems.length);
    console.log('Items:', sortedItems.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      created: item.created,
      path: item.path
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
    console.log('\n=== Getting Single Post ===');
    console.log('Requested ID:', req.params.id);

    // Try posts directory first
    let filePath = path.join(__dirname, '..', 'posts', `${req.params.id}.html`);

    // If not found in posts, try library directory
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, '..', 'library', `${req.params.id}.html`);
    }

    console.log('Reading file from:', filePath);
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    console.log('File content length:', content.length);

    const metadata = parsePostMetadata(content);
    console.log('Parsed metadata:', metadata);

    // For library items, preserve the book cover container
    if (filePath.includes('/library/')) {
      const bookCoverMatch = content.match(/<div class="book-cover-container">([\s\S]*?)<\/div>/);
      if (bookCoverMatch) {
        metadata.bookCoverHtml = bookCoverMatch[0];
        // Set the image path directly based on the id
        metadata.bookCoverPath = `/images/books/${req.params.id}.jpg`;
      }
    }

    // Extract the main content
    let mainContent = '';
    if (filePath.includes('/library/')) {
      console.log('Extracting library content');
      const bookContentStart = '<div class="book-content">';
      const bookContentEnd = '<footer class="post-footer">';
      const startIndex = content.indexOf(bookContentStart);
      const endIndex = content.indexOf(bookContentEnd);
      if (startIndex !== -1 && endIndex !== -1) {
        // Get everything between book-content div start and footer
        mainContent = content.substring(startIndex + bookContentStart.length, endIndex).trim();
        console.log('Found book content:', mainContent);
      } else {
        console.log('No book content found');
      }
    } else {
      console.log('Extracting post content');
      const postContentMatch = content.match(/<div class="post-content">([\s\S]*?)<\/div>/);
      if (postContentMatch) {
        mainContent = postContentMatch[1].trim();
      }
    }

    console.log('Extracted content length:', mainContent.length);

    const response = {
      id: req.params.id,
      ...metadata,
      content: mainContent,
      type: filePath.includes('/library/') ? 'library' : 'note'
    };

    console.log('Sending response:', {
      id: response.id,
      title: response.title,
      type: response.type,
      contentLength: response.content.length
    });

    res.json(response);
  } catch (error) {
    console.error('Error getting item:', error);
    res.status(500).json({ error: 'Failed to get item', details: error.message });
  }
});

// Create a new post
app.post('/api/posts', upload.single('bookCover'), async (req, res) => {
  try {
    const { title, content, description, tags, section, author, year } = req.body;

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
      type: section === 'Library' ? 'book' : 'note',
      author: section === 'Library' ? author : undefined,
      year: section === 'Library' ? year : undefined
    };

    // Generate filename from title
    const filename = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '.html';

    // Determine target directory based on section
    const targetDir = path.join(__dirname, '..', section === 'Library' ? 'library' : 'posts');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // If it's a library item and has a book cover, process the image
    if (section === 'Library' && req.file) {
      const sharp = require('sharp');
      const imagesDir = path.join(__dirname, '..', 'images', 'books');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const imageFilename = filename.replace('.html', '.jpg');
      const imagePath = path.join(imagesDir, imageFilename);

      // Process and save the image
      await sharp(req.file.buffer)
        .resize(400, 600, { fit: 'contain' })
        .jpeg({ quality: 80 })
        .toFile(imagePath);

      console.log('Saved book cover to:', imagePath);
    }

    // Generate HTML content using appropriate template
    const htmlContent = section === 'Library' ? libraryTemplate(metadata) : postTemplate(metadata);

    // Write file
    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, htmlContent);
    console.log('Saved post to:', filePath);

    // Update homepage
    try {
      console.log('Updating homepage...');
      await require('./update-homepage.js').updateHomepage();
      console.log('Homepage updated successfully');
    } catch (error) {
      console.error('Error updating homepage:', error);
      // Don't fail the whole request if homepage update fails
    }

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
app.put('/api/posts/:id', upload.single('bookCover'), async (req, res) => {
  try {
    const { title, content, description, tags, section, author, year } = req.body;
    console.log('Received PUT request with content:', {
      title,
      content: content ? content.substring(0, 100) + '...' : 'no content',
      contentType: typeof content,
      contentLength: content ? content.length : 0,
      description,
      section
    });

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
    console.log('Original metadata:', {
      title: originalMetadata.title,
      contentLength: originalMetadata.content ? originalMetadata.content.length : 0
    });

    // Generate metadata
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const metadata = {
      title: title || originalMetadata.title,
      description: description || originalMetadata.description,
      section: isLibrary ? 'Library' : (section || 'Notes'),
      tags: tags || originalMetadata.tags || '',
      created: originalMetadata.created || now,
      updated: now,
      content: content || originalMetadata.content || '',
      type: isLibrary ? 'book' : 'note',
      id: req.params.id,
      author: isLibrary ? (author || originalMetadata.author) : undefined,
      year: isLibrary ? (year || originalMetadata.year) : undefined
    };

    console.log('New metadata before template:', {
      title: metadata.title,
      contentLength: metadata.content ? metadata.content.length : 0,
      content: metadata.content ? metadata.content.substring(0, 100) + '...' : 'no content'
    });

    // If it's a library item and has a new book cover, process the image
    if (isLibrary && req.file) {
      const sharp = require('sharp');
      const imagesDir = path.join(__dirname, '..', 'images', 'books');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const imageFilename = fileName.replace('.html', '.jpg');
      const imagePath = path.join(imagesDir, imageFilename);

      // Process and save the image
      await sharp(req.file.buffer)
        .resize(400, 600, { fit: 'contain' })
        .jpeg({ quality: 80 })
        .toFile(imagePath);

      console.log('Saved book cover to:', imagePath);
    }

    // Use the appropriate template
    const template = isLibrary ? libraryTemplate : postTemplate;
    console.log('Generating template with metadata:', {
      title: metadata.title,
      contentLength: metadata.content ? metadata.content.length : 0,
      type: metadata.type
    });
    const newContent = template(metadata);
    console.log('Generated content length:', newContent.length);
    fs.writeFileSync(filePath, newContent);
    console.log('Wrote file to:', filePath);

    // Update homepage
    try {
      console.log('Updating homepage...');
      await require('./update-homepage.js').updateHomepage();
      console.log('Homepage updated successfully');
    } catch (error) {
      console.error('Error updating homepage:', error);
      // Don't fail the whole request if homepage update fails
    }

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
  console.log('Parsing metadata from content length:', content ? content.length : 0);

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
    year: content.match(/<!--\s*Year:\s*(.*?)\s*-->/s)?.[1]
  };

  // Extract content based on type
  if (content.includes('class="book-content"')) {
    // For library items, get content from book-content div
    const match = content.match(/<div class="book-content">([\s\S]*?)<\/div>\s*<footer/);
    if (match) {
      metadata.content = match[1].trim();
    }
  } else {
    // For notes, get content from post-content div
    const match = content.match(/<div class="post-content">([\s\S]*?)<\/div>\s*<footer/);
    if (match) {
      metadata.content = match[1].trim();
    }
  }

  console.log('Extracted metadata:', {
    title: metadata.title,
    contentLength: metadata.content ? metadata.content.length : 0,
    section: metadata.section
  });

  return metadata;
}

// Export the templates
module.exports = {
  postTemplate,
  libraryTemplate
};

// Only start the server if this file is being run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Editor server running at http://localhost:${port}`);
    console.log(`Visit http://localhost:${port}/editor.html to create new posts`);
  });
}
