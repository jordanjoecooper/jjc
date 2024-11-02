# Jordan Cooper

Personal site built with html, css and minimal JS (currently none). The idea is to build something that looks plain,reasonable and works forever without any external dependencies or updates.

# Rules
1. No JavaScript for core functionality and site should work it is disabled in the browser.
2. No Frameworks for functionality or styling.
3. Minimal Assets.

# To Do

## Other
- Point other sites at canonical version of posts
- Replace main jjc domain with this site (deprecate next site)
- Stop showing file extension (.html) on pages
- Add a CDN/analytics (if JS enabled)
## Fun Tooling - seperate to blog frontend
- Create an script to generate meta tags/description on each blog page automatically from its content.
- Add a WYSIWYG editor for basic html output.
- Custom github action that runs relevant scripts on any push (sitemap, posts table update etc)

# Scripts
Because I like to make my life harder and more scripty than it needs to be I have a few scripts to help with maintenance / updating the site.

## Update Posts Table
- update_posts_table.sh
Make it executable with `chmod +x scripts/update_posts_table.sh`
To Run: `./scripts/update_posts_table.sh`

It will read in all the html files excluding the ones in the ignore list, extract the date and title and add them to the table on the homepage.

## Create Blog Post
- create_blog_post.sh
Make it executable with `chmod +x scripts/create_blog_post.sh`
To Run: `./scripts/create_blog_post.sh`

It will prompt for a title and create a html file with todays date. It will add a comment with <!-- unpublished --> to the top of the file so that it is not included in the posts table on the homepage.

## Generate Sitemap
- generate_sitemap.sh
Make it executable with `chmod +x scripts/generate_sitemap.sh`
To Run: `./scripts/generate_sitemap.sh`
It will generate a sitemap.xml file in the root directory.

## Update Blog Post Meta Tags
- update_blog_post_meta_tags.sh
Make it executable with `chmod +x scripts/update_blog_post_meta_tags.sh`
To Run: `./scripts/update_blog_post_meta_tags.sh <file_path>`
It will update the meta tags in the blog post.


.