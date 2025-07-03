package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

func isProseBlock(content string) bool {
	// Heuristic: if the content has no typical code symbols and is mostly words, treat as prose
	// Adjust as needed for your content
	codeSymbols := []string{"{", "}", "(", ")", ";", "=", "<", ">", "[", "]", "#", "$", "%", "_", "*", "/", "\\"}
	lines := strings.Split(content, "\n")
	wordCount := 0
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		for _, sym := range codeSymbols {
			if strings.Contains(trimmed, sym) {
				return false
			}
		}
		wordCount += len(strings.Fields(trimmed))
	}
	return wordCount > 5 // Only treat as prose if it's not empty and has enough words
}

func fixFile(path string) error {
	input, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}
	content := string(input)

	// Regex to find <pre><code>...</code></pre> blocks
	re := regexp.MustCompile(`(?s)<pre><code>(.*?)</code></pre>`)
	fixed := re.ReplaceAllStringFunc(content, func(match string) string {
		inner := re.FindStringSubmatch(match)
		if len(inner) < 2 {
			return match
		}
		block := inner[1]
		if isProseBlock(block) {
			// Replace with <p>...</p>, preserving newlines as <br> if needed
			p := strings.ReplaceAll(strings.TrimSpace(block), "\n", "<br>")
			return "<p>" + p + "</p>"
		}
		return match
	})

	if fixed != content {
		err = ioutil.WriteFile(path, []byte(fixed), 0644)
		if err != nil {
			return err
		}
		fmt.Println("Fixed:", path)
	}
	return nil
}

func main() {
	files, err := filepath.Glob("jjc/posts/*.html")
	if err != nil {
		fmt.Println("Error finding files:", err)
		os.Exit(1)
	}
	for _, file := range files {
		err := fixFile(file)
		if err != nil {
			fmt.Println("Error fixing", file, ":", err)
		}
	}
	fmt.Println("Batch fix complete.")
}
