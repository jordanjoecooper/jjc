const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { updateHomepage } = require(path.join(__dirname, 'update-homepage.js'));
const { generateSitemap } = require(path.join(__dirname, 'update-sitemap.js'));

const app = express();
const port = 3049;

const SECTIONS = ['Technology', 'Musings', 'Work', 'Library', 'Chaos', 'IDK'];

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Helper function to parse post metadata
function parsePostMetadata(content) {
  // Try to get metadata from HTML comments first
  const metadata = {
    title: content.match(/<!--\s*Title:\s*(.*?)\s*-->/s)?.[1],
    date: content.match(/<!--\s*Date:\s*(.*?)\s*-->/s)?.[1],
    created: content.match(/<!--\s*Created:\s*(.*?)\s*-->/s)?.[1],
    updated: content.match(/<!--\s*Updated:\s*(.*?)\s*-->/s)?.[1],
    description: content.match(/<!--\s*Description:\s*(.*?)\s*-->/s)?.[1],
    section: content.match(/<!--\s*Section:\s*(.*?)\s*-->/s)?.[1],
    tags: content.match(/<!--\s*Tags:\s*(.*?)\s*-->/s)?.[1],
    type: content.match(/<!--\s*Type:\s*(.*?)\s*-->/s)?.[1] // Add type for distinguishing books
  };

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

  // Set defaults for missing values
  metadata.created = metadata.created || metadata.date;
  metadata.updated = metadata.updated || metadata.date;
  metadata.section = metadata.section || 'Uncategorized';
  metadata.type = metadata.type || (metadata.section === 'Library' ? 'book' : 'post');

  // Clean up title if it includes the site name
  if (metadata.title && metadata.title.includes(' - Jordan Joe Cooper')) {
    metadata.title = metadata.title.replace(' - Jordan Joe Cooper', '');
  }

  return metadata;
}

// Get all posts
app.get('/api/posts', (req, res) => {
  try {
    const postsDir = path.join(__dirname, '..', 'posts');
    console.log('Reading posts from:', postsDir);

    const files = fs.readdirSync(postsDir)
      .filter(file => file.endsWith('.html') && file !== 'index.html');
    console.log('Found files:', files);

    const posts = files.map(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const metadata = parsePostMetadata(content);
      console.log(`Metadata for ${file}:`, metadata);
      return {
        id: file.replace('.html', ''),
        ...metadata,
        file
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('Sending posts:', posts);
    res.json(posts);
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to get posts', details: error.message });
  }
});

// Get single post
app.get('/api/posts/:id', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'posts', `${req.params.id}.html`);
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = parsePostMetadata(content);

    // Extract the main content
    const mainContent = content.match(/<main>\s*<div>([\s\S]*?)<\/div>\s*<div class="back-button-container">/)?.[1] || '';

    res.json({
      id: req.params.id,
      ...metadata,
      content: mainContent.trim()
    });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Update existing post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, description, tags, section, content, type } = req.body;
    const filePath = path.join(__dirname, '..', 'posts', `${req.params.id}.html`);

    // Read existing file to get creation date
    const existingContent = fs.readFileSync(filePath, 'utf8');
    const existingMetadata = parsePostMetadata(existingContent);
    const createdDate = existingMetadata.created || existingMetadata.date;

    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const updatedContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="${description}">
  <meta name="keywords" content="${tags}">
  <meta property="og:title" content="${title} - Jordan Joe Cooper">
  <meta property="og:type" content="website">
  <meta property="og:image" content="../images/apple-touch-icon.png">
  <meta name="section" content="${section}">
  <!-- Metadata -->
  <!-- Title: ${title} -->
  <!-- Date: ${formattedDate} -->
  <!-- Created: ${createdDate} -->
  <!-- Updated: ${formattedDate} -->
  <!-- Description: ${description} -->
  <!-- Section: ${section} -->
  <!-- Tags: ${tags} -->
  <!-- Type: ${type || (section === 'Library' ? 'book' : 'post')} -->
  <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
  <link rel="manifest" href="../site.webmanifest">
  <title>${title} - Jordan Joe Cooper</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <header class="post-heading">
    <h1>${title}</h1>
    <div class="post-time">
      <time>${createdDate}</time> by <a href="https://jordanjoecooper.dev">Jordan Joe Cooper</a>
      <div class="post-metadata">
        Last updated: <time>${formattedDate}</time>
      </div>
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

    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated post: ${filePath}`);

    // Update homepage and sitemap
    await updateHomepage();
    await generateSitemap();

    res.json({ success: true, message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Create new post
app.post('/api/create-post', async (req, res) => {
  try {
    const { title, description, tags, section, content } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Set up environment variables for the new-post script
    const env = {
      ...process.env,
      POST_TITLE: title,
      POST_DESCRIPTION: description,
      POST_TAGS: tags || '',
      POST_SECTION: section || 'Technology',
      POST_CONTENT: content
    };

    // Run new-post script
    const scriptPath = path.join(__dirname, 'new-post.js');
    const child = exec(`node ${scriptPath}`, { env });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
      console.log(data);
    });

    child.stderr.on('data', (data) => {
      stderr += data;
      console.error(data);
    });

    child.on('close', async (code) => {
      if (code === 0) {
        try {
          // Update homepage and sitemap
          await updateHomepage();
          await generateSitemap();

          res.json({
            success: true,
            message: 'Post created successfully',
            details: stdout
          });
        } catch (error) {
          console.error('Error updating homepage/sitemap:', error);
          res.status(500).json({
            error: 'Post created but failed to update homepage/sitemap',
            details: error.message
          });
        }
      } else {
        res.status(500).json({
          error: 'Failed to create post',
          details: stderr
        });
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      error: 'Failed to create post',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something broke!',
    details: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Editor server running at http://localhost:${port}`);
  console.log(`Visit http://localhost:${port}/editor.html to create new posts`);
});