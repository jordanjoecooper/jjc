package site

import (
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
)

type Post struct {
	Title       string
	Description string
	Section     string
	Tags        string
	Created     string
	Updated     string
	Type        string
	Content     string
	Slug        string
	Filename    string
}

type LibraryItem struct {
	Title       string
	Description string
	Author      string
	Year        string
	Tags        string
	Created     string
	Updated     string
	Type        string
	Content     string
	ID          string
	Filename    string
}

type Generator struct {
	rootDir string
}

func NewGenerator() *Generator {
	return &Generator{
		rootDir: ".",
	}
}

func (g *Generator) slugify(text string) string {
	// Convert to lowercase and replace non-alphanumeric chars with hyphens
	re := regexp.MustCompile(`[^a-z0-9\s-]`)
	text = strings.ToLower(text)
	text = re.ReplaceAllString(text, "")
	text = regexp.MustCompile(`[\s-]+`).ReplaceAllString(text, "-")
	text = strings.Trim(text, "-")
	return text
}

func (g *Generator) formatDate(date time.Time) string {
	return date.Format("January 2, 2006")
}

func (g *Generator) CreateNewPost(title, description, tags, section string) error {
	date := time.Now()
	formattedDate := g.formatDate(date)
	slug := g.slugify(title)
	filename := slug + ".md"
	postPath := filepath.Join(g.rootDir, "posts", filename)

	// Create posts directory if it doesn't exist
	postsDir := filepath.Join(g.rootDir, "posts")
	if err := os.MkdirAll(postsDir, 0755); err != nil {
		return fmt.Errorf("failed to create posts directory: %w", err)
	}

	// Create markdown content
	content := fmt.Sprintf(`---
title: "%s"
description: "%s"
section: "%s"
tags: "%s"
created: "%s"
updated: "%s"
type: "note"
---

# %s

%s

<!-- Your content here -->
`, title, description, section, tags, formattedDate, formattedDate, title, description)

	if err := os.WriteFile(postPath, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write post file: %w", err)
	}

	fmt.Printf("Created new post: %s\n", postPath)
	return nil
}

func (g *Generator) markdownToHTML(mdContent string) (string, error) {
	// Parse markdown
	extensions := parser.CommonExtensions
	parser := parser.NewWithExtensions(extensions)
	doc := parser.Parse([]byte(mdContent))

	// Convert to HTML
	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	opts := html.RendererOptions{Flags: htmlFlags}
	renderer := html.NewRenderer(opts)
	html := markdown.Render(doc, renderer)

	return string(html), nil
}

func (g *Generator) parseMarkdownFrontmatter(content string) (map[string]string, string, error) {
	// Simple frontmatter parser
	lines := strings.Split(content, "\n")
	metadata := make(map[string]string)
	bodyStart := 0

	if len(lines) > 0 && strings.TrimSpace(lines[0]) == "---" {
		for i := 1; i < len(lines); i++ {
			line := strings.TrimSpace(lines[i])
			if line == "---" {
				bodyStart = i + 1
				break
			}
			if strings.Contains(line, ":") {
				parts := strings.SplitN(line, ":", 2)
				if len(parts) == 2 {
					key := strings.TrimSpace(parts[0])
					value := strings.TrimSpace(strings.Trim(parts[1], `"'`))
					metadata[key] = value
				}
			}
		}
	}

	body := strings.Join(lines[bodyStart:], "\n")
	return metadata, body, nil
}

func (g *Generator) generatePostHTML(post *Post) (string, error) {
	// Convert markdown content to HTML
	htmlContent, err := g.markdownToHTML(post.Content)
	if err != nil {
		return "", fmt.Errorf("failed to convert markdown to HTML: %w", err)
	}

	// Parse tags
	tags := strings.Split(post.Tags, ",")
	var tagsHTML strings.Builder
	for _, tag := range tags {
		tag = strings.TrimSpace(tag)
		if tag != "" {
			tagsHTML.WriteString(fmt.Sprintf(`<span class="post-tag">%s</span>`, tag))
		}
	}

	// Generate HTML using template
	tmpl := `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="{{.Description}}">
  <meta name="keywords" content="{{.Tags}}">
  <meta property="og:title" content="{{.Title}} - Jordan Joe Cooper">
  <meta property="og:type" content="article">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
  <link rel="manifest" href="../site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <title>{{.Title}} - Jordan Joe Cooper</title>
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
      <h1>{{.Title}}</h1>
      <p class="post-description">{{.Description}}</p>
      <time>{{.Created}}</time>
    </header>

    <main>
      <div class="post-content">
        {{.HTMLContent}}
      </div>

      <footer class="post-footer">
        <div class="post-metadata-footer">
          <span>{{.Section}}</span>
          <span>•</span>
          <span>Jordan Joe Cooper</span>
        </div>
        <div class="post-tags">
          {{.TagsHTML}}
        </div>
        <div class="post-time">
          Last updated: <time>{{.Updated}}</time>
        </div>
      </footer>

      <div class="back-button-container">
        <a href="../" class="back-button">Back to home</a>
      </div>
    </main>
  </div>
</body>
</html>`

	t, err := template.New("post").Parse(tmpl)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	var buf strings.Builder
	err = t.Execute(&buf, map[string]interface{}{
		"Title":       post.Title,
		"Description": post.Description,
		"Section":     post.Section,
		"Tags":        post.Tags,
		"Created":     post.Created,
		"Updated":     post.Updated,
		"HTMLContent": template.HTML(htmlContent),
		"TagsHTML":    template.HTML(tagsHTML.String()),
	})
	if err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return buf.String(), nil
}

func (g *Generator) UpdateHomepage() error {
	// Read all markdown posts
	postsDir := filepath.Join(g.rootDir, "posts")
	posts := []*Post{}

	if err := filepath.Walk(postsDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(path, ".md") {
			content, err := os.ReadFile(path)
			if err != nil {
				return err
			}

			metadata, body, err := g.parseMarkdownFrontmatter(string(content))
			if err != nil {
				return err
			}

			post := &Post{
				Title:       metadata["title"],
				Description: metadata["description"],
				Section:     metadata["section"],
				Tags:        metadata["tags"],
				Created:     metadata["created"],
				Updated:     metadata["updated"],
				Type:        metadata["type"],
				Content:     body,
				Slug:        strings.TrimSuffix(filepath.Base(path), ".md"),
				Filename:    filepath.Base(path),
			}
			posts = append(posts, post)
		}
		return nil
	}); err != nil {
		return fmt.Errorf("failed to read posts: %w", err)
	}

	// Sort posts by date (newest first)
	// TODO: Implement proper date sorting

	// Generate homepage HTML
	homepagePath := filepath.Join(g.rootDir, "index.html")
	homepageContent, err := g.generateHomepageHTML(posts)
	if err != nil {
		return fmt.Errorf("failed to generate homepage: %w", err)
	}

	if err := os.WriteFile(homepagePath, []byte(homepageContent), 0644); err != nil {
		return fmt.Errorf("failed to write homepage: %w", err)
	}

	fmt.Printf("Homepage updated with %d posts\n", len(posts))
	return nil
}

func (g *Generator) generateHomepageHTML(posts []*Post) (string, error) {
	// Read the existing homepage template
	templatePath := filepath.Join(g.rootDir, "index.html")
	templateContent, err := os.ReadFile(templatePath)
	if err != nil {
		return "", fmt.Errorf("failed to read homepage template: %w", err)
	}

	// Generate notes section HTML
	var notesHTML strings.Builder
	for _, post := range posts {
		if post.Section == "Notes" {
			date := post.Created
			if date == "" {
				date = "Unknown date"
			}

			notesHTML.WriteString(fmt.Sprintf(`<a href="posts/%s.html" class="note-row">
      <div class="note-header">
        <time>%s</time>
        <h3>%s</h3>
      </div>
      <p>%s</p>
    </a>`, post.Slug, date, post.Title, post.Description))
		}
	}

	// Replace the notes section in the template
	content := string(templateContent)
	content = strings.Replace(content,
		`<!-- Notes will be dynamically inserted here -->`,
		notesHTML.String(),
		1)

	return content, nil
}

func (g *Generator) UpdateSitemap() error {
	baseURL := "https://jordanjoecooper.dev"
	posts := []*Post{}

	// Read all markdown posts
	postsDir := filepath.Join(g.rootDir, "posts")
	if err := filepath.Walk(postsDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(path, ".md") {
			content, err := os.ReadFile(path)
			if err != nil {
				return err
			}

			metadata, _, err := g.parseMarkdownFrontmatter(string(content))
			if err != nil {
				return err
			}

			post := &Post{
				Title:       metadata["title"],
				Description: metadata["description"],
				Created:     metadata["created"],
				Updated:     metadata["updated"],
				Slug:        strings.TrimSuffix(filepath.Base(path), ".md"),
			}
			posts = append(posts, post)
		}
		return nil
	}); err != nil {
		return fmt.Errorf("failed to read posts: %w", err)
	}

	// Generate sitemap XML
	sitemap := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>%s/</loc>
    <lastmod>%s</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>%s/about.html</loc>
    <lastmod>%s</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`, baseURL, time.Now().Format("2006-01-02"), baseURL, time.Now().Format("2006-01-02"))

	// Add posts to sitemap
	for _, post := range posts {
		lastmod := post.Updated
		if lastmod == "" {
			lastmod = post.Created
		}
		if lastmod == "" {
			lastmod = time.Now().Format("2006-01-02")
		}

		sitemap += fmt.Sprintf(`
  <url>
    <loc>%s/posts/%s.html</loc>
    <lastmod>%s</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`, baseURL, post.Slug, lastmod)
	}

	sitemap += `
</urlset>`

	// Write sitemap
	sitemapPath := filepath.Join(g.rootDir, "sitemap.xml")
	if err := os.WriteFile(sitemapPath, []byte(sitemap), 0644); err != nil {
		return fmt.Errorf("failed to write sitemap: %w", err)
	}

	fmt.Printf("Sitemap generated with %d posts\n", len(posts))
	return nil
}

func (g *Generator) UpdateLibrary() error {
	// TODO: Implement library update
	return nil
}

func (g *Generator) ConvertToMarkdown() error {
	postsDir := filepath.Join(g.rootDir, "posts")

	// Create markdown directory if it doesn't exist
	markdownDir := filepath.Join(g.rootDir, "posts-md")
	if err := os.MkdirAll(markdownDir, 0755); err != nil {
		return fmt.Errorf("failed to create markdown directory: %w", err)
	}

	// Walk through HTML posts and convert them
	err := filepath.Walk(postsDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(path, ".html") {
			return g.convertHTMLPostToMarkdown(path, markdownDir)
		}
		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to convert posts: %w", err)
	}

	fmt.Println("HTML to markdown conversion completed")
	return nil
}

func (g *Generator) convertHTMLPostToMarkdown(htmlPath, markdownDir string) error {
	content, err := os.ReadFile(htmlPath)
	if err != nil {
		return fmt.Errorf("failed to read HTML file %s: %w", htmlPath, err)
	}

	// Extract metadata from HTML comments
	metadata := g.extractHTMLMetadata(string(content))

	// Extract content from HTML
	contentHTML := g.extractHTMLContent(string(content))

	// Convert HTML content to markdown (simplified)
	markdownContent := g.htmlToMarkdown(contentHTML)

	// Generate markdown with frontmatter
	filename := filepath.Base(htmlPath)
	markdownFilename := strings.TrimSuffix(filename, ".html") + ".md"
	markdownPath := filepath.Join(markdownDir, markdownFilename)

	markdownFile := fmt.Sprintf(`---
title: "%s"
description: "%s"
section: "%s"
tags: "%s"
created: "%s"
updated: "%s"
type: "%s"
---

%s
`, metadata["title"], metadata["description"], metadata["section"], metadata["tags"],
		metadata["created"], metadata["updated"], metadata["type"], markdownContent)

	if err := os.WriteFile(markdownPath, []byte(markdownFile), 0644); err != nil {
		return fmt.Errorf("failed to write markdown file %s: %w", markdownPath, err)
	}

	fmt.Printf("Converted %s to %s\n", htmlPath, markdownPath)
	return nil
}

func (g *Generator) extractHTMLMetadata(content string) map[string]string {
	metadata := make(map[string]string)

	// Extract metadata from HTML comments
	patterns := map[string]string{
		"title":       `<!--\s*Title:\s*(.*?)\s*-->`,
		"description": `<!--\s*Description:\s*(.*?)\s*-->`,
		"section":     `<!--\s*Section:\s*(.*?)\s*-->`,
		"tags":        `<!--\s*Tags:\s*(.*?)\s*-->`,
		"created":     `<!--\s*Created:\s*(.*?)\s*-->`,
		"updated":     `<!--\s*Updated:\s*(.*?)\s*-->`,
		"type":        `<!--\s*Type:\s*(.*?)\s*-->`,
	}

	for key, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		if match := re.FindStringSubmatch(content); len(match) > 1 {
			metadata[key] = strings.TrimSpace(match[1])
		}
	}

	// Set defaults
	if metadata["section"] == "" {
		metadata["section"] = "Notes"
	}
	if metadata["type"] == "" {
		metadata["type"] = "note"
	}

	return metadata
}

func (g *Generator) extractHTMLContent(content string) string {
	// Extract content from post-content div
	re := regexp.MustCompile(`<div class="post-content">([\s\S]*?)</div>`)
	if match := re.FindStringSubmatch(content); len(match) > 1 {
		return match[1]
	}
	return ""
}

func (g *Generator) htmlToMarkdown(html string) string {
	// Simple HTML to markdown conversion
	// This is a basic implementation - for production, consider using a proper library

	// Remove HTML tags but preserve line breaks
	html = strings.ReplaceAll(html, "<p>", "")
	html = strings.ReplaceAll(html, "</p>", "\n\n")
	html = strings.ReplaceAll(html, "<br>", "\n")
	html = strings.ReplaceAll(html, "<br/>", "\n")
	html = strings.ReplaceAll(html, "<br />", "\n")

	// Convert headings
	html = regexp.MustCompile(`<h1[^>]*>(.*?)</h1>`).ReplaceAllString(html, "# $1")
	html = regexp.MustCompile(`<h2[^>]*>(.*?)</h2>`).ReplaceAllString(html, "## $1")
	html = regexp.MustCompile(`<h3[^>]*>(.*?)</h3>`).ReplaceAllString(html, "### $1")

	// Convert links
	html = regexp.MustCompile(`<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>`).ReplaceAllString(html, "[$2]($1)")

	// Convert bold and italic
	html = regexp.MustCompile(`<strong[^>]*>(.*?)</strong>`).ReplaceAllString(html, "**$1**")
	html = regexp.MustCompile(`<em[^>]*>(.*?)</em>`).ReplaceAllString(html, "*$1*")

	// Remove remaining HTML tags
	html = regexp.MustCompile(`<[^>]*>`).ReplaceAllString(html, "")

	// Clean up whitespace
	html = strings.TrimSpace(html)

	return html
}

func (g *Generator) StartEditor(port int) error {
	// TODO: Implement HTTP server for editor
	return fmt.Errorf("editor not implemented yet")
}
