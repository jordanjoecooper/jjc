#!/bin/bash

# Get the current date in the format "Month DD, YYYY"
current_date=$(date "+%B %d, %Y")

# Prompt for the blog post title
read -p "Enter the blog post title: " post_title

# Convert the title to a filename-friendly format
filename=$(echo "$post_title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-').html

# Create the HTML content
cat << EOF > "$filename"
<!-- unpublished -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta
      name="description"
      content="Jordan Joe Coopers website. Writes about making products, software engineering, problem solving and technology"
    />
    <meta
      name="keywords"
      content="Code, Software Engineering, Product, Problem Solving, Programming, Tech, Technology, Jordan Joe Cooper"
    />
    <meta name="author" content="Jordan Joe Cooper" />
    <meta
      property="og:title"
      content="$post_title - Jordan Joe Cooper"
    />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="icon.svg" />
    <link rel="icon" type="image/x-icon" href="icon.ico" />
    <meta property="og:url" content="https://www.jordanjoecooper.com" />
    <title>$post_title - Jordan Joe Cooper</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header>
      <h2>
        <a href="https://jordanjoecooper.github.io/jcuk/">Jordan Joe Cooper</a>
      </h2>
    </header>
    <main>
      <div class="post-heading">
        <h1>$post_title</h1>
        <div class="post-time"><time>$current_date</time></div>
      </div>
      <div>
        <p>
          Your content goes here...
        </p>
      </div>
    </main>
  </body>
</html>
EOF

echo "Blog post created: $filename"