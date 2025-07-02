#!/bin/bash

# Development helper script for the site

case "$1" in
    "build")
        echo "🔨 Building site..."
        ./scripts/build.sh
        ;;
    "new")
        if [ -z "$2" ]; then
            echo "❌ Usage: ./scripts/dev.sh new \"Post Title\""
            exit 1
        fi
        echo "📝 Creating new post: $2"
        ./site -cmd new-post -title "$2" -desc "Description for $2" -tags "tag1,tag2" -section "Notes"
        ;;
    "serve")
        echo "🌐 Starting local server on http://localhost:8000"
        echo "Press Ctrl+C to stop"
        python3 -m http.server 8000
        ;;
    "watch")
        echo "👀 Watching for changes..."
        echo "Press Ctrl+C to stop"
        while true; do
            ./scripts/build.sh
            sleep 5
        done
        ;;
    "clean")
        echo "🧹 Cleaning up..."
        rm -f site
        rm -f posts-md/*.md 2>/dev/null || true
        rmdir posts-md 2>/dev/null || true
        echo "✅ Cleanup completed"
        ;;
    *)
        echo "🚀 Site Development Helper"
        echo ""
        echo "Usage: ./scripts/dev.sh <command>"
        echo ""
        echo "Commands:"
        echo "  build              Build the site"
        echo "  new \"Title\"        Create a new post"
        echo "  serve              Start local server"
        echo "  watch              Watch for changes and rebuild"
        echo "  clean              Clean up generated files"
        echo ""
        echo "Examples:"
        echo "  ./scripts/dev.sh build"
        echo "  ./scripts/dev.sh new \"My New Post\""
        echo "  ./scripts/dev.sh serve"
        ;;
esac 