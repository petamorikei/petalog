# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Petalog is a static blog built with Astro (based on Fuwari template). It uses Tailwind CSS for styling, Svelte for interactive components, and supports multiple languages.

## Commands

```bash
# Development
pnpm dev              # Start dev server at localhost:4321
pnpm build            # Build for production (runs astro build + pagefind indexing)
pnpm preview          # Preview production build locally

# Code quality
pnpm check            # Run Astro checks for errors
pnpm type-check       # TypeScript type checking with --noEmit
pnpm format           # Format code with Biome
pnpm lint             # Lint and fix code with Biome

# Content
pnpm new-post <name>  # Create new post with frontmatter template
```

## Architecture

### Content Collections
- `src/content/posts/` - Blog posts (Markdown/MDX with frontmatter)
- `src/content/spec/` - Special pages like About
- `src/content/config.ts` - Zod schemas defining post frontmatter (title, published, tags, category, etc.)

### Layout Hierarchy
- `Layout.astro` - Base layout handling theme, fonts, meta tags, and PhotoSwipe/OverlayScrollbars initialization
- `MainGridLayout.astro` - Blog layout with sidebar, navbar, banner, and TOC

### Key Configuration Files
- `src/config.ts` - Site settings (title, theme color, banner, navbar, profile, license)
- `astro.config.mjs` - Astro integrations and markdown plugins configuration
- `src/types/config.ts` - TypeScript types for all config options

### Custom Markdown Processing
Markdown is processed through a pipeline defined in `astro.config.mjs`:
- Remark plugins: math, reading time, excerpt, admonitions, directives, sectionize
- Rehype plugins: KaTeX, slug, component rendering (GitHub cards, admonitions), autolink headings
- Custom plugins in `src/plugins/` handle directive parsing and component rendering

### Path Aliases (tsconfig.json)
```
@components/* → src/components/*
@assets/*     → src/assets/*
@constants/*  → src/constants/*
@utils/*      → src/utils/*
@i18n/*       → src/i18n/*
@layouts/*    → src/layouts/*
@/*           → src/*
```

### Styling
- Uses Biome with tabs for indentation and double quotes for strings
- Tailwind CSS with typography plugin
- Stylus for some extended markdown styles
- CSS variables for theme colors (hue-based theming)

## Post Frontmatter

```yaml
---
title: Post Title
published: 2023-09-09
description: Post description
image: ./cover.jpg           # Optional cover image
tags: [Tag1, Tag2]
category: Category Name
draft: false                 # true to hide in production
lang: ja                     # Override site language
---
```
