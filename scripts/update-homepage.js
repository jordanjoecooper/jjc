const fs = require('fs');
const path = require('path');
const { generateSitemap } = require('./update-sitemap.js');

// Update sections order to show Library first
const SECTIONS = ['Library', 'Technology', 'Musings'];

async function updateHomepage() {
  const posts = [];
  const libraryItems = [];
  const postsDir = path.join(process.cwd(), 'posts');
  const libraryDir = path.join(process.cwd(), 'library');

  // Read library items
  if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true });
  }

  const libraryFiles = fs.readdirSync(libraryDir);
  console.log('Found library files:', libraryFiles);

  for (const file of libraryFiles) {
    if (file.endsWith('.html')) {
      const filePath = path.join(libraryDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`Reading library item: ${filePath}`);

      // Extract metadata from meta tags first, then fall back to comments
      const titleMetaMatch = content.match(/<title[^>]*>([^<]+)<\/title>/);
      const authorMetaMatch = content.match(/<h2 class="book-author">by ([^<]+)<\/h2>/);
      const coverMetaMatch = content.match(/<meta property="og:image" content="([^"]+)"/);

      // Extract metadata from HTML comments as fallback
      const titleMatch = content.match(/<!--\s*Title:\s*(.*?)\s*-->/);
      const authorMatch = content.match(/<!--\s*Author:\s*(.*?)\s*-->/);
      const dateMatch = content.match(/<!--\s*Date:\s*(.*?)\s*-->/);
      const coverMatch = content.match(/<!--\s*Cover:\s*(.*?)\s*-->/);

      const title = (titleMetaMatch?.[1] || titleMatch?.[1])?.replace(' - Jordan Joe Cooper', '');
      const author = authorMetaMatch?.[1] || authorMatch?.[1] || '';
      const date = new Date(dateMatch?.[1] || 'December 1, 2024');
      const coverPath = coverMetaMatch?.[1] || coverMatch?.[1] || '';
      // Clean up cover path to work from homepage context
      const cover = coverPath
        .replace('../', '')  // Remove relative path
        .replace(/^\//, ''); // Remove leading slash

      if (title) {
        console.log(`Found library item: ${title} by ${author} with cover: ${cover}`);
        libraryItems.push({
          title,
          author,
          date,
          cover,
          file: file
        });
      }
    }
  }

  // Read regular posts
  const files = fs.readdirSync(postsDir);
  for (const file of files) {
    if (file.endsWith('.html') && file !== 'index.html') {
      const filePath = path.join(postsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract metadata from meta tags first, then fall back to comments
      const sectionMetaMatch = content.match(/<meta\s+name="section"\s+content="([^"]+)"/);
      const titleMetaMatch = content.match(/<title[^>]*>([^<]+)<\/title>/);
      const descMetaMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/);

      // Extract metadata from HTML comments as fallback
      const titleMatch = content.match(/<!--\s*Title:\s*(.*?)\s*-->/);
      const dateMatch = content.match(/<!--\s*Date:\s*(.*?)\s*-->/);
      const descriptionMatch = content.match(/<!--\s*Description:\s*(.*?)\s*-->/);
      const sectionMatch = content.match(/<!--\s*Section:\s*(.*?)\s*-->/);

      const title = (titleMetaMatch?.[1] || titleMatch?.[1])?.replace(' - Jordan Joe Cooper', '');
      const date = new Date(dateMatch?.[1] || 'December 1, 2024');
      const description = descMetaMatch?.[1] || descriptionMatch?.[1] || '';
      const section = sectionMetaMatch?.[1] || sectionMatch?.[1] || 'Technology';

      if (title && section !== 'Library') {  // Skip library items in posts directory
        posts.push({
          title,
          date,
          description,
          section,
          file
        });
      }
    }
  }

  // Sort posts by date
  posts.sort((a, b) => b.date - a.date);
  libraryItems.sort((a, b) => b.date - a.date);

  // Generate HTML
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="description" content="Jordan Joe Cooper's website. Writing about software engineering, problem-solving, and technology.">
    <meta name="author" content="Jordan Joe Cooper">
    <meta property="og:title" content="Jordan Joe Cooper - Head of Engineering, programmer &amp; podcaster">
    <meta property="og:type" content="website">
    <meta property="og:image" content="images/apple-touch-icon.png">
    <meta property="og:url" content="https://www.jordanjoecooper.com">
    <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">
    <link rel="manifest" href="site.webmanifest">
    <title>Jordan Joe Cooper - Head of Engineering, programmer &amp; podcaster</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>
      <a href="https://jordanjoecooper.dev">Jordan Joe Cooper</a>
    </h1>
  </header>
  <main>
    <div class="bio">
      <p>
        Head of Engineering at
        <a href="https://zumi.app">Zumi</a>. Previously,
        Tech Lead and Engineering Manager for multiple teams at
        <a href="https://www.moneyhub.com">Moneyhub</a>. My passion lies in
        leveraging technology to solve problems and drive innovation.
        I occasionally record
        <a href="https://pod.link/diaryofhumanity">The Diary of Humanity</a>
        podcast.
      </p>
      <div class="social-links">
        <a href="https://x.com/jordanjoecooper"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M18.42,14.009L27.891,3h-2.244l-8.224,9.559L10.855,3H3.28l9.932,14.455L3.28,29h2.244l8.684-10.095,6.936,10.095h7.576l-10.301-14.991h0Zm-3.074,3.573l-1.006-1.439L6.333,4.69h3.447l6.462,9.243,1.006,1.439,8.4,12.015h-3.447l-6.854-9.804h0Z"></path></svg></a>
        <a href="https://github.com/jordanjoecooper"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16,2.345c7.735,0,14,6.265,14,14-.002,6.015-3.839,11.359-9.537,13.282-.7,.14-.963-.298-.963-.665,0-.473,.018-1.978,.018-3.85,0-1.312-.437-2.152-.945-2.59,3.115-.35,6.388-1.54,6.388-6.912,0-1.54-.543-2.783-1.435-3.762,.14-.35,.63-1.785-.14-3.71,0,0-1.173-.385-3.85,1.435-1.12-.315-2.31-.472-3.5-.472s-2.38,.157-3.5,.472c-2.677-1.802-3.85-1.435-3.85-1.435-.77,1.925-.28,3.36-.14,3.71-.892,.98-1.435,2.24-1.435,3.762,0,5.355,3.255,6.563,6.37,6.913-.403,.35-.77,.963-.893,1.872-.805,.368-2.818,.963-4.077-1.155-.263-.42-1.05-1.452-2.152-1.435-1.173,.018-.472,.665,.017,.927,.595,.332,1.277,1.575,1.435,1.978,.28,.787,1.19,2.293,4.707,1.645,0,1.173,.018,2.275,.018,2.607,0,.368-.263,.787-.963,.665-5.719-1.904-9.576-7.255-9.573-13.283,0-7.735,6.265-14,14-14Z"></path></svg></a>
        <a href="https://linkedin.com/in/jordanjoecooper"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M26.111,3H5.889c-1.595,0-2.889,1.293-2.889,2.889V26.111c0,1.595,1.293,2.889,2.889,2.889H26.111c1.595,0,2.889-1.293,2.889-2.889V5.889c0-1.595-1.293-2.889-2.889-2.889ZM10.861,25.389h-3.877V12.87h3.877v12.519Zm-1.957-14.158c-1.267,0-2.293-1.034-2.293-2.31s1.026-2.31,2.293-2.31,2.292,1.034,2.292,2.31-1.026,2.31-2.292,2.31Zm16.485,14.158h-3.858v-6.571c0-1.802-.685-2.809-2.111-2.809-1.551,0-2.362,1.048-2.362,2.809v6.571h-3.718V12.87h3.718v1.686s1.118-2.069,3.775-2.069,4.556,1.621,4.556,4.975v7.926Z" fill-rule="evenodd"></path></svg></a>
        <a href="https://jordanjoecooper.medium.com"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M18.05,16c0,5.018-4.041,9.087-9.025,9.087S0,21.018,0,16,4.041,6.913,9.025,6.913s9.025,4.069,9.025,9.087m9.901,0c0,4.724-2.02,8.555-4.513,8.555s-4.513-3.831-4.513-8.555,2.02-8.555,4.512-8.555,4.513,3.83,4.513,8.555m4.05,0c0,4.231-.71,7.664-1.587,7.664s-1.587-3.431-1.587-7.664,.71-7.664,1.587-7.664,1.587,3.431,1.587,7.664"></path></svg></a>
      </div>
      <a class="podcast-link" href="https://pod.link/diaryofhumanity">Any podcast player</a>
    </div>

    <!-- Add Library section first -->
    ${libraryItems.length > 0 ? `
      <div class="notes-section">
        <h2 class="section-header">Library</h2>
        <p>Books I've read and my notes on them.</p>
        <div class="library-grid">
          ${libraryItems.map(item => `
            <a href="library/${item.file}" class="book ${item.cover ? 'has-cover' : ''}">
              ${item.cover ? `
                <div class="book-cover" style="background-image: url('${item.cover}')"></div>
                <div class="book-info">
                  <div class="book-title">${item.title}</div>
                  <div class="book-author">${item.author}</div>
                </div>
              ` : `
                <div class="book-info">
                  <div class="book-title">${item.title}</div>
                  <div class="book-author">${item.author}</div>
                </div>
              `}
            </a>
          `).join('\n')}
        </div>
      </div>
    ` : ''}

    <!-- Add other sections -->
    ${SECTIONS.map(section => {
      const sectionPosts = posts.filter(post => post.section === section);
      if (sectionPosts.length > 0) {
        return `
          <h2 class="section-header">${section}</h2>
          <table>
            <tbody>
              ${sectionPosts.map(post => `
                <tr>
                  <td class="date">${post.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</td>
                  <td><a href="${post.file}">${post.title}</a></td>
                  <td class="description">${post.description}</td>
                </tr>
              `).join('\n')}
            </tbody>
          </table>
        `;
      }
    }).join('\n')}
  </main>
  <div class="last-updated">Last updated: ${new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })}</div>
</body>
</html>`;

  fs.writeFileSync(path.join(process.cwd(), 'posts', 'index.html'), html);
  console.log('Homepage updated successfully');

  // Update sitemap
  await generateSitemap();
}

// Update the library section HTML generation
function generateLibrarySection(libraryPosts) {
  if (!libraryPosts.length) return '';

  return `
    <div class="notes-section">
      <h2 class="section-header">Library</h2>
      <p>Books I've read and my notes on them.</p>
      <div class="library-grid">
        ${libraryPosts.map(post => `
          <a href="posts/${post.id}.html" class="book ${post.bookCover ? 'has-cover' : ''}">
            ${post.bookCover ? `
              <div class="book-cover" style="background-image: url('${post.bookCover}')"></div>
              <div class="book-info">
                <div class="book-title">${post.title}</div>
                <div class="book-author">${post.author}</div>
              </div>
            ` : `
              <div class="book-info">
                <div class="book-title">${post.title}</div>
                <div class="book-author">${post.author}</div>
              </div>
            `}
          </a>
        `).join('\n')}
      </div>
    </div>
  `;
}

module.exports = { updateHomepage };

if (require.main === module) {
  updateHomepage();
}