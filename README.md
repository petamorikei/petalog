# Petalog

Petalog is Petamori Kei's personal blog, built with Astro and Panda CSS.

This project was created from the Fuwari template and has been customized for this blog.

## Features

- Static site generation with Astro
- Styling with Panda CSS
- Responsive layout
- Light and dark themes
- Search powered by Pagefind
- Extended Markdown syntax
- Table of contents
- RSS feed and sitemap

## Getting Started

The Node.js version is defined in `.node-version`. The pnpm version is defined by the `packageManager` field in `package.json`.

1. Install the development tools and dependencies.

   ```sh
   mise install
   pnpm install
   ```

2. Start the local development server.

   ```sh
   pnpm dev
   ```

3. Create a post and edit it under `src/content/posts/`.

   ```sh
   pnpm new-post <filename>
   ```

## Frontmatter of Posts

```yaml
---
title: My First Blog Post
published: 2026-08-12
description: A short description of the post.
image: ./cover.jpg
tags: [Example]
category: Notes
draft: false
lang: en
---
```

Set `lang` only when a post uses a language different from the site's default language.

## Markdown Extended Syntax

The blog supports GitHub Flavored Markdown and the following extensions:

- Admonitions
- GitHub repository cards
- Mathematical notation with KaTeX
- Enhanced code blocks with Expressive Code

## Commands

| Command | Action |
|:--|:--|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the local development server |
| `pnpm build` | Build the production site and search index into `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm check` | Run Astro diagnostics |
| `pnpm type-check` | Run the TypeScript type check |
| `pnpm format` | Format source files with Biome |
| `pnpm lint` | Apply Biome lint fixes to source files |
| `pnpm test:e2e` | Run the Playwright end-to-end tests |
| `pnpm new-post <filename>` | Create a new post |

## Deployment

The blog is intended to be deployed as static assets on Cloudflare Workers. Deployment automation will be added after the Cloudflare project and public URL are configured.

## License

The source code is distributed under the included MIT License. Blog content is published under the license configured on the site.
