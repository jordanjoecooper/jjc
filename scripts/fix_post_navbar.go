package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
)

const newNavbar = `<nav class="navbar">
  <div class="container nav-content">
    <a href="/" class="logo">J</a>
    <div class="nav-links">
      <a href="/index.html#notes">Writing</a>
      <a href="../about.html">About</a>
    </div>
  </div>
</nav>`

func fixNavbar(path string) error {
	input, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}
	content := string(input)

	// Replace the first <nav>...</nav> block with the new navbar
	re := regexp.MustCompile(`(?s)<nav.*?</nav>`) // non-greedy match
	fixed := re.ReplaceAllString(content, newNavbar)

	if fixed != content {
		err = ioutil.WriteFile(path, []byte(fixed), 0644)
		if err != nil {
			return err
		}
		fmt.Println("Updated navbar in:", path)
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
		err := fixNavbar(file)
		if err != nil {
			fmt.Println("Error updating navbar in", file, ":", err)
		}
	}
	fmt.Println("Navbar batch update complete.")
}
