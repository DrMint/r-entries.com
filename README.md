# R-Entries

## Overview

R-Entries is a static website template for personal blogs.
It is built with Astro and uses the `@astrojs/mdx` integration.

Key features:

- Content
  - Markdown or MDX content
  - Tag support
- Progressive enhancement
  - JavaScript is only used for some of the QoL features
- Stylish and minimalistic design
  - Follows the typography best practices
  - Follows user light/dark preferences
- Responsive layout
  - Displays a bottom tab bar on mobile and a regular header on desktop
- Enjoyable reading experience:
  - Comfortable line length
  - Table of contents
  - Medium-like image zoom (requires JavaScript)
  - Go to top button (requires JavaScript)
- SEO-friendly
  - Sitemap
  - Open Graph metadata
  - Twitter Card metadata

## Configuration

To configure the building process, the following environment variables are used:

- `PORT` — the port to run the server on
- `SITE_URL` — the URL of the website
- `BASE_PATH` — the base path of the website
- `TRAILING_SLASH` — whether to use trailing slashes in the URLs (accepts: `always`, `never`, `ignore`) (default: `ignore`)

You can set these in the `.env.local` file.
If building in a CI environment, you can set them in the environment variables (see `.github/workflows/build.yml`).

## Personalization

The website appareance and features can be customized in the `src/constants.ts` file.
More information about each option is available in the file.

## Content

To add or modify posts, you need to edit the files in the `src/content/posts` folder.
Each post is stored in a separate folder.
The folder name is the post slug.
The post slug is used in the url as `/posts/{slug}`.

## TODO

- View transitions
  - https://developer.chrome.com/docs/web-platform/view-transitions/cross-document#demo
- TOC observable api
- JSON-LD
- Remove "go to top" button JS dependency
- Search feature
  - https://docs.astro.build/en/guides/search/
- RSS feed on mobile
- Better RSS styling?

- Check
  - [`rehype-callouts`](https://github.com/lin-stephanie/rehype-callouts) — render blockquote-based callouts (admonitions/alerts)
  - [`rehype-code-group`](https://github.com/ITZSHOAIB/rehype-code-group) — group code blocks (or any element) with highly customizable tabs.
  - [`rehype-external-links`](https://github.com/rehypejs/rehype-external-links) — add rel (and target) to external links
  - [`rehype-figure`](https://github.com/josestg/rehype-figure) — support figure and caption from images
  - [`rehype-section`](https://github.com/agentofuser/rehype-section) — wrap headings and their contents into nested `<section>` elements
  - [`rehype-sectionize`](https://github.com/hbsnow/rehype-sectionize) — wrap headings and their contents into nested `<section>` elements, with attributes
