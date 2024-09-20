#!/bin/bash

update_meta_tags() {
    local file_path="$1"
    
    # Extract the title from the <h1> tag
    title=$(sed -n 's/.*<h1>\(.*\)<\/h1>.*/\1/p' "$file_path" | sed 's/^ *//; s/ *$//')

    # Extract the first paragraph of content
    summary=$(sed -n '/<p>/,/<\/p>/p' "$file_path" | head -n 1 | sed 's/<[^>]*>//g' | tr -d '\n' | sed 's/[[:space:]]\+/ /g' | sed 's/^ *//; s/ *$//')

    # If the first paragraph is empty, try the second paragraph
    if [ -z "$summary" ]; then
        summary=$(sed -n '/<p>/,/<\/p>/p' "$file_path" | sed -n '2,/<\/p>/p' | sed 's/<[^>]*>//g' | tr -d '\n' | sed 's/[[:space:]]\+/ /g' | sed 's/^ *//; s/ *$//')
    fi

    # If summary is still empty, use a default description
    if [ -z "$summary" ]; then
        summary="$title - A blog post about software engineering, problem-solving, and technology, written by jordanjoecooper."
    fi

    # Truncate summary to 160 characters and add ellipsis if truncated
    truncated_summary=$(echo "$summary" | cut -c 1-157)
    if [ ${#summary} -gt 157 ]; then
        truncated_summary="${truncated_summary}..."
    fi

    # Create a temporary file
    temp_file=$(mktemp)

    # Process the file and update meta tags
    awk -v title="$title" -v summary="$truncated_summary" '
    BEGIN { updated_desc = 0; updated_og_title = 0; updated_title = 0; skip_next = 0 }
    /<meta name="description"/ { 
        printf "  <meta name=\"description\" content=\"%s\">\n", summary
        updated_desc = 1
        skip_next = 1
        next
    }
    skip_next == 1 && /content=/ { skip_next = 0; next }
    /<meta property="og:title"/ { 
        printf "  <meta property=\"og:title\" content=\"%s - Jordan Joe Cooper\">\n", title
        updated_og_title = 1
        next
    }
    /<title>/ { 
        printf "  <title>%s - Jordan Joe Cooper</title>\n", title
        updated_title = 1
        next
    }
    /<\/head>/ {
        if (!updated_desc) printf "  <meta name=\"description\" content=\"%s\">\n", summary
        if (!updated_og_title) printf "  <meta property=\"og:title\" content=\"%s - Jordan Joe Cooper\">\n", title
        if (!updated_title) printf "  <title>%s - Jordan Joe Cooper</title>\n", title
        print
        next
    }
    { print }
    ' "$file_path" > "$temp_file"

    # Replace the original file with the updated content
    mv "$temp_file" "$file_path"

    echo "Meta tags updated for $file_path"
}

# Check if a file is provided as an argument
if [ $# -eq 0 ]; then
    # No file provided, process all HTML files except index, about, and contact
    for file in *.html; do
        if [[ "$file" != "index.html" && "$file" != "about.html" && "$file" != "contact.html" ]]; then
            update_meta_tags "$file"
        fi
    done
else
    # File provided as argument
    file_path="$1"
    if [ ! -f "$file_path" ]; then
        echo "File does not exist: $file_path"
        exit 1
    fi
    update_meta_tags "$file_path"
fi