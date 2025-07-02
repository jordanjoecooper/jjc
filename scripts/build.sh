#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting site build..."

# Build the Go site generator
echo "📦 Building site generator..."
go build -o site cmd/site/main.go

if [ $? -ne 0 ]; then
    echo "❌ Failed to build site generator"
    exit 1
fi

# Update homepage with latest posts
echo "🏠 Updating homepage..."
./site -cmd update-homepage

# Generate sitemap
echo "🗺️  Updating sitemap..."
./site -cmd update-sitemap

# Update library (if implemented)
echo "📚 Updating library..."
./site -cmd update-library 2>/dev/null || echo "⚠️  Library update not implemented yet"

echo "✅ Build completed successfully!"
echo "📁 Generated files: index.html, sitemap.xml" 