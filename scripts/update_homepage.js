const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SECTIONS = ['Technology', 'Musings', 'Work'];

async function updateHomepage() {
  const postsDir = path.join(__dirname, '..', 'posts');
  const indexPath = path.join(__dirname, '..', 'index.html');

  // Read all HTML files in posts directory
  const posts = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.html'))
    .map(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const $ = cheerio.load(content);

      return {
        title: $('h1').text().trim(),
        date: $('time').text().trim(),
        file: file,
        section: $('meta[name="section"]').attr('content') || 'Musings', // Default to Musings if no section
        timestamp: new Date($('time').text().trim()).getTime()
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  // Group posts by section
  const postsBySection = {};
  SECTIONS.forEach(section => {
    postsBySection[section] = posts.filter(post => post.section === section);
  });

  // Read index.html
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const $ = cheerio.load(indexContent);

  // Clear existing posts
  $('.notes-section').empty();

  // Add section headers and posts
  SECTIONS.forEach(section => {
    const sectionPosts = postsBySection[section];
    if (sectionPosts.length > 0) {
      $('.notes-section').append(`
        <h2 class="section-header">${section}</h2>
        <table class="posts-table">
          <tbody>
            ${sectionPosts.map(post => `
              <tr>
                <td><a href="posts/${post.file}">${post.title}</a></td>
                <td>${post.date}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `);
    }
  });

  // Update last modified date
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  $('.last-updated').text(`Last updated: ${formattedDate}`);

  // Write updated content back to index.html
  fs.writeFileSync(indexPath, $.html());
  console.log('Homepage updated successfully');
}

module.exports = updateHomepage;

// If run directly
if (require.main === module) {
  updateHomepage().catch(console.error);
}