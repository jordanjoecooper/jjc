const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { updateHomepage } = require('./update-homepage.js');
const { generateSitemap } = require('./update-sitemap.js');

function fixPaths() {
  const postsDir = path.join(__dirname, '..', 'posts');
  const posts = fs.readdirSync(postsDir).filter(file => file.endsWith('.html'));

  posts.forEach(file => {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);

    // Fix paths in head
    $('head link[rel="stylesheet"]').attr('href', '../styles.css');
    $('head link[rel="apple-touch-icon"]').attr('href', '../images/apple-touch-icon.png');
    $('head link[rel="icon"][sizes="32x32"]').attr('href', '../images/favicon-32x32.png');
    $('head link[rel="icon"][sizes="16x16"]').attr('href', '../images/favicon-16x16.png');
    $('head link[rel="manifest"]').attr('href', '../site.webmanifest');
    $('head meta[property="og:image"]').attr('content', '../images/apple-touch-icon.png');

    // Write the changes back to the file
    fs.writeFileSync(filePath, $.html());
    console.log(`Fixed paths in ${file}`);
  });
}

// Run the function
try {
  fixPaths();
  console.log('All paths have been fixed successfully');
} catch (error) {
  console.error('Error fixing paths:', error);
}