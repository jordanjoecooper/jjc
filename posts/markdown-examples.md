---
title: "Markdown Reference Examples"
description: "Examples of all major markdown blocks for reference. Not published."
section: "Notes"
tags: "markdown, reference, syntax"
created: "July 2, 2025"
updated: "July 2, 2025"
type: "note"
published: false
---

# Markdown Reference Examples

> **Note:** This post is for internal reference and is not published on the site.

---

## Headings

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

---

## Paragraphs

This is a paragraph. It can span multiple lines and will be rendered as a single block of text.

---

## Emphasis

*Italic text*  
**Bold text**  
***Bold and italic text***  
~~Strikethrough~~

---

## Lists

### Unordered List
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

### Ordered List
1. First item
2. Second item
   1. Subitem 2.1
   2. Subitem 2.2
3. Third item

---

## Links

[Inline link](https://example.com)

[Reference link][ref]

[ref]: https://example.com

---

## Images

![Alt text for image](https://via.placeholder.com/150)

---

## Code

Inline code: `let x = 42;`

### Fenced Code Block

```
// This is a code block
function hello() {
  console.log("Hello, world!");
}
```

### Fenced Code Block with Language

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
```

---

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> - You can include lists
> - Or **formatting**

---

## Tables

| Syntax | Description |
|--------|-------------|
| Header | Title       |
| Cell   | Data        |

---

## Horizontal Rule

---

## Task Lists

- [x] Task 1
- [ ] Task 2
- [ ] Task 3

---

## HTML in Markdown

<div style="color: red;">This is raw HTML in markdown.</div>

---

## Escaping

\*This text is not italic\*

---

## Footnotes

Here is a footnote reference.[^1]

[^1]: This is the footnote content. 