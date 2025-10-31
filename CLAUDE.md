# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fuwari is a static blog template built with Astro. It's a content-focused blog with markdown support, smooth animations, search functionality, and i18n support.

## Development Commands

**Package Manager**: This project uses `pnpm` (enforced via preinstall hook). Always use `pnpm` instead of `npm` or `yarn`.

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start dev server at localhost:4321 |
| `pnpm build` | Build production site to `./dist/` (includes Pagefind search indexing) |
| `pnpm preview` | Preview production build locally |
| `pnpm check` | Run Astro type checking |
| `pnpm type-check` | Run TypeScript type checking with isolatedDeclarations |
| `pnpm format` | Format code using Biome |
| `pnpm lint` | Lint and fix code using Biome |
| `pnpm new-post <filename>` | Create a new blog post with frontmatter |

**Before committing code**: Always run `pnpm check` and `pnpm format`

## Architecture

### Content Management

- **Blog posts**: Located in `src/content/posts/`
- **Static pages**: Located in `src/content/spec/` (e.g., about.md)
- **Content schema**: Defined in `src/content/config.ts` using Zod
- Posts require frontmatter with: `title`, `published`, optional: `description`, `image`, `tags`, `category`, `draft`, `lang`
- Use `pnpm new-post <filename>` to create new posts with proper frontmatter template

### Configuration System

The blog is configured through `src/config.ts` which exports:
- `siteConfig`: Site metadata, theme colors, banner, ToC settings, favicon
- `navBarConfig`: Navigation links (uses LinkPresets from `src/constants/link-presets.ts`)
- `profileConfig`: Avatar, bio, social links
- `licenseConfig`: Content license info
- `expressiveCodeConfig`: Code block theme configuration

### Internationalization (i18n)

- Language files: `src/i18n/languages/*.ts`
- Translation keys: `src/i18n/i18nKey.ts`
- Translation system: `src/i18n/translation.ts` with `getTranslation()` and `i18n()` functions
- Site language set in `siteConfig.lang`
- Per-post language override via `lang` frontmatter field

### Markdown Pipeline

The markdown processing pipeline (configured in `astro.config.mjs`) includes:

**Remark plugins** (process markdown):
- `remarkMath`: LaTeX math support
- `remarkReadingTime`: Calculate reading time
- `remarkExcerpt`: Extract post excerpts
- `remarkGithubAdmonitionsToDirectives`: Convert GitHub-style admonitions
- `remarkDirective`: Handle custom directives
- `remarkSectionize`: Create semantic sections
- `parseDirectiveNode`: Custom directive processing

**Rehype plugins** (process HTML):
- `rehypeKatex`: Render math with KaTeX
- `rehypeSlug`: Add IDs to headings
- `rehypeComponents`: Custom components (GitHub cards, admonitions: note, tip, important, caution, warning)
- `rehypeAutolinkHeadings`: Add anchor links to headings

### Expressive Code

Custom Expressive Code plugins in `src/plugins/expressive-code/`:
- `language-badge.ts`: Display language badges on code blocks
- `custom-copy-button.ts`: Custom copy functionality

### Routing & Pages

- **Home/Index**: `src/pages/[...page].astro` (paginated post list)
- **Archive**: `src/pages/archive.astro`
- **About**: `src/pages/about.astro` (renders content from `src/content/spec/about.md`)
- **Single post**: `src/pages/posts/[...slug].astro`
- **RSS**: `src/pages/rss.xml.ts`
- **Robots**: `src/pages/robots.txt.ts`

### Layout System

- **Base layout**: `src/layouts/Layout.astro` (HTML structure, global styles, Swup integration)
- **Main grid layout**: `src/layouts/MainGridLayout.astro` (sidebar + main content grid)

### Component Architecture

**Astro components** (`src/components/`):
- Framework: Mix of Astro (.astro) and Svelte (.svelte) components
- Astro for static/server-side rendering
- Svelte for interactive client-side features (search, dark mode, settings, archive panel)

**Key components**:
- `PostCard.astro`, `PostMeta.astro`, `PostPage.astro`: Post display
- `Navbar.astro`, `Footer.astro`: Layout components
- `widget/`: Sidebar widgets (Profile, Categories, Tags, TOC, SideBar)
- `control/`: Interactive controls (BackToTop, Pagination, ButtonLink, ButtonTag)
- Svelte components: `Search.svelte`, `LightDarkSwitch.svelte`, `ArchivePanel.svelte`, `DisplaySettings.svelte`

### Utilities

Located in `src/utils/`:
- `content-utils.ts`: Content fetching and processing
- `date-utils.ts`: Date formatting
- `url-utils.ts`: URL handling
- `setting-utils.ts`: User settings management

### Styling

- **Framework**: Tailwind CSS with custom configuration
- **Typography**: `@tailwindcss/typography` for prose content
- **Fonts**: JetBrains Mono Variable (code), Roboto (text)
- **Icons**: Iconify with Font Awesome 6 icon sets
- **Animations**: Swup for page transitions
- **Dark mode**: Supported via theme toggle

### Search

- **Engine**: Pagefind (built during `pnpm build`)
- **Configuration**: `pagefind.yml`
- **Integration**: Search component in `src/components/Search.svelte`
- Search index is generated from the `dist/` directory after Astro build

### Code Quality

- **Formatter/Linter**: Biome (config in `biome.json`)
- **Style**: Tabs for indentation, double quotes for JavaScript
- **Special rules for**: Svelte, Astro, and Vue files (relaxed unused variable checks)

## Important Notes

- The site uses Swup for smooth page transitions - avoid breaking the container structure in `main` and `#toc`
- Custom directive components are registered in `astro.config.mjs` under `rehypeComponents`
- Search is only available after running `pnpm build` (Pagefind indexes the built site)
- Theme color is customizable via `siteConfig.themeColor.hue` (0-360)
- Update `site` and `base` in `astro.config.mjs` before deploying to production
