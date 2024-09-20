#!/bin/bash

# Set the base URL of your website
BASE_URL="https://jordanjoecooper.github.io/jcuk"

# Set the output file name
SITEMAP_FILE="sitemap.xml"

# Start the sitemap XML
echo '<?xml version="1.0" encoding="UTF-8"?>' > $SITEMAP_FILE
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' >> $SITEMAP_FILE

# Add the homepage
echo "  <url>
    <loc>$BASE_URL/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>" >> $SITEMAP_FILE

# Find all HTML files in the current directory, excluding index.html
for file in *.html; do
    if [[ "$file" != "index.html" ]]; then
        # Check if the file is marked as unpublished
        if ! grep -q "<!-- unpublished -->" "$file"; then
            # Extract the last modified date of the file
            LASTMOD=$(date -r "$file" +%Y-%m-%d)
            echo "  <url>
    <loc>$BASE_URL/$file</loc>
    <lastmod>$LASTMOD</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>" >> $SITEMAP_FILE
        fi
    fi
done

# Close the sitemap XML
echo '</urlset>' >> $SITEMAP_FILE

echo "Sitemap generated and saved as $SITEMAP_FILE"