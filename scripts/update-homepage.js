const fs = require('fs');
const path = require('path');
const { generateSitemap } = require('./update-sitemap.js');

// Update sections order to show Library first
const SECTIONS = ['Library', 'Technology', 'Musings'];

async function updateHomepage() {
  const posts = [];
  const postsDir = path.join(process.cwd(), 'posts');
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

      if (title) {
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

  // Group posts by section
  const postsBySection = {};
  SECTIONS.forEach(section => {
    postsBySection[section] = posts.filter(post => post.section === section);
  });

  // Generate HTML
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jordan Joe Cooper's Blog</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="manifest" href="manifest.json">
</head>
<body>
    <div class="container">
        <header>
            <h1>Jordan Joe Cooper's Blog</h1>
            <p>Thoughts on technology, software development, and life.</p>
        </header>
        <main>`;

  // Add sections
  SECTIONS.forEach(section => {
    const sectionPosts = postsBySection[section];
    if (sectionPosts && sectionPosts.length > 0) {
      html += `\n<h2 class="section-header">${section}</h2>`;

      if (section === 'Library') {
        // Render Library section as bookshelf
        html += '\n<div class="bookshelf">';
        sectionPosts.forEach(post => {
          const dateStr = post.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
          });
          html += `
            <a href="${post.file}" class="book">
              <span class="book-title">${post.title}</span>
              <span class="book-date">${dateStr}</span>
            </a>`;
        });
        html += '\n</div>';
      } else {
        // Render other sections as tables
        html += `
        <table>
          <tbody>`;
        sectionPosts.forEach(post => {
          const dateStr = post.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          html += `
            <tr>
              <td class="date">${dateStr}</td>
              <td><a href="${post.file}">${post.title}</a></td>
              <td class="description">${post.description}</td>
            </tr>`;
        });
        html += `
          </tbody>
        </table>`;
      }
    }
  });

  html += `
        </main>
        <footer>
            <p>&copy; ${new Date().getFullYear()} Jordan Joe Cooper. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(process.cwd(), 'posts', 'index.html'), html);
  console.log('Homepage updated successfully');

  // Update sitemap
  await generateSitemap();
}

module.exports = { updateHomepage };

if (require.main === module) {
  updateHomepage();
}