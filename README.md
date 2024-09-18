# Jordan Cooper

Personal site built with html, css and minimal programming. The idea is to build something that looks reasonable and works forever.

# Rules
1. Minimal JavaScript.
2. No Frameworks.
3. Minimal Assets.

# To Do

Find an easy way to cross posts bewteen sites at once
- hackernews
- medium
- devto

## Other
- Migrate old posts from other sites to here
- Point other sites at canonical version of posts
- Replace main jjc domain with this site (deprecate next site)
- Stop showing file extension (.html) on pages
- Split up site into html/css only variant and one that uses JS for other stuff.
## Fun Tooling - seperate to blog frontend
- Create an script to generate meta tags/description on each blog page automatically from its content.
- Add script to run prettier over everything on push.
- Add a WYSIWYG editor for basic html output.
- Add a script to generate a sitemap.
- Find a fun simply way to generate and commit/push posts from mobile
- Add a script that compiles a list of all posts based on keywords and dates and makes them searchable via those keywords or dates if JS is enabled.



# Scripts
Because I like to make my life harder and more scripty than it needs to be I have a few scripts to help with maintenance / updating the site.
- update_posts_table.sh
Make it executable with `chmod +x scripts/update_posts_table.sh`
To Run: `./scripts/update_posts_table.sh`

It will read in all the html files excluding the ones in the ignore list, extract the date and title and add them to the table on the homepage.