const fs = require('fs');
const path = require('path');

async function generateSitemap() {
    const baseUrl = 'https://jordanjoecooper.dev';
    const postsDir = path.join(__dirname, '..', 'posts');
    const currentDate = new Date().toISOString().split('T')[0];

    // Start XML content
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Read posts directory
    const posts = fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.html'))
        .sort();

    // Add entry for each post
    posts.forEach(post => {
        sitemap += `
  <url>
    <loc>${baseUrl}/posts/${post}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Close XML
    sitemap += '\n</urlset>\n';

    // Write sitemap file
    fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), sitemap);
    console.log('Sitemap updated successfully');
}

module.exports = {
    generateSitemap
};

// If run directly
if (require.main === module) {
    generateSitemap().catch(console.error);
}