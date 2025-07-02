package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"jjc/internal/site"
)

func main() {
	var (
		command = flag.String("cmd", "", "Command to run: new-post, update-homepage, update-sitemap, update-library, convert-to-markdown")
		title   = flag.String("title", "", "Post title (for new-post)")
		desc    = flag.String("desc", "", "Post description (for new-post)")
		tags    = flag.String("tags", "", "Post tags (comma-separated, for new-post)")
		section = flag.String("section", "Notes", "Post section (for new-post)")
		port    = flag.Int("port", 3000, "Port for editor server (for editor)")
	)
	flag.Parse()

	generator := site.NewGenerator()

	switch *command {
	case "new-post":
		if *title == "" {
			fmt.Println("Error: title is required for new-post")
			os.Exit(1)
		}
		if err := generator.CreateNewPost(*title, *desc, *tags, *section); err != nil {
			log.Fatal("Failed to create new post:", err)
		}
		fmt.Println("New post created successfully")

	case "update-homepage":
		if err := generator.UpdateHomepage(); err != nil {
			log.Fatal("Failed to update homepage:", err)
		}
		fmt.Println("Homepage updated successfully")

	case "update-sitemap":
		if err := generator.UpdateSitemap(); err != nil {
			log.Fatal("Failed to update sitemap:", err)
		}
		fmt.Println("Sitemap updated successfully")

	case "update-library":
		if err := generator.UpdateLibrary(); err != nil {
			log.Fatal("Failed to update library:", err)
		}
		fmt.Println("Library updated successfully")

	case "convert-to-markdown":
		if err := generator.ConvertToMarkdown(); err != nil {
			log.Fatal("Failed to convert to markdown:", err)
		}
		fmt.Println("Conversion to markdown completed")

	case "editor":
		if err := generator.StartEditor(*port); err != nil {
			log.Fatal("Failed to start editor:", err)
		}

	case "":
		fmt.Println("Available commands:")
		fmt.Println("  new-post -title \"Post Title\" -desc \"Description\" -tags \"tag1,tag2\" -section \"Notes\"")
		fmt.Println("  update-homepage")
		fmt.Println("  update-sitemap")
		fmt.Println("  update-library")
		fmt.Println("  convert-to-markdown")
		fmt.Println("  editor -port 3000")
		os.Exit(1)

	default:
		fmt.Printf("Unknown command: %s\n", *command)
		os.Exit(1)
	}
}
