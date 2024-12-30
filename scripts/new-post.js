const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { generateSitemap } = require('./update-sitemap.js');
const { updateHomepage } = require('./update-homepage.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SECTIONS = ['Technology', 'Notes', 'musings', 'Work', 'Library', 'Chaos', 'IDK'];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(date) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

async function promptUser() {
  // If we have environment variables from the editor, use those
  if (process.env.POST_TITLE) {
    return {
      title: process.env.POST_TITLE,
      description: process.env.POST_DESCRIPTION,
      tags: process.env.POST_TAGS,
      section: process.env.POST_SECTION,
      content: process.env.POST_CONTENT
    };
  }

  // Otherwise, prompt the user
  const questions = {
    title: 'Enter post title: ',
    description: 'Enter post description (for meta tags): ',
    tags: 'Enter tags (comma-separated): ',
    section: `Select section (${SECTIONS.join('/')}): `
  };

  const answers = {};

  for (const [key, question] of Object.entries(questions)) {
    if (key === 'section') {
      let section;
      do {
        section = await new Promise(resolve => rl.question(question, resolve));
        section = section.trim();
        if (!SECTIONS.includes(section)) {
          console.log(`Invalid section. Please choose from: ${SECTIONS.join(', ')}`);
        }
      } while (!SECTIONS.includes(section));
      answers[key] = section;
    } else {
      answers[key] = await new Promise(resolve => rl.question(question, resolve));
    }
  }

  return answers;
}

async function createNewPost() {
  const answers = await promptUser();
  const date = new Date();
  const formattedDate = formatDate(date);
  const slug = slugify(answers.title);
  const fileName = `${slug}.html`;
  const filePath = path.join(__dirname, '..', 'posts', fileName);

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="${answers.description}">
  <meta name="keywords" content="${answers.tags}">
  <meta property="og:title" content="${answers.title} - Jordan Joe Cooper">
  <meta property="og:type" content="website">
  <meta property="og:image" content="../images/apple-touch-icon.png">
  <meta name="section" content="${answers.section}">
  <!-- Metadata -->
  <!-- Title: ${answers.title} -->
  <!-- Date: ${formattedDate} -->
  <!-- Created: ${formattedDate} -->
  <!-- Updated: ${formattedDate} -->
  <!-- Description: ${answers.description} -->
  <!-- Section: ${answers.section} -->
  <!-- Tags: ${answers.tags} -->
  <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
  <link rel="manifest" href="../site.webmanifest">
  <title>${answers.title} - Jordan Joe Cooper</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <header class="post-heading">
    <h1>${answers.title}</h1>
    <div class="post-time">
      <time>${formattedDate}</time> by <a href="https://jordanjoecooper.dev">Jordan Joe Cooper</a>
      <div class="post-metadata">
        Last updated: <time>${formattedDate}</time>
      </div>
    </div>
  </header>
  <main>
    <div>
      ${answers.content || '<!-- Your content here -->'}
    </div>
    <div class="back-button-container">
      <a href="https://jordanjoecooper.dev" class="back-button">Back</a>
    </div>
  </main>
</body>
</html>`;

  fs.writeFileSync(filePath, template);
  console.log(`Created new post: ${filePath}`);

  // Update homepage
  await updateHomepage();

  // Update sitemap
  await generateSitemap();

  if (rl.close) {
    rl.close();
  }
}

createNewPost().catch(console.error);