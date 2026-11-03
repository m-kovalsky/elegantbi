# Elegant BI

Source for [elegantbi.com](https://www.elegantbi.com), a technical blog on Power BI, Analysis Services, tabular modeling and DAX.

Built with [Astro](https://astro.build) as a fully static site, deployed to GitHub Pages. All posts were migrated from Wix and live as Markdown in this repo.

## Local development

Requires Node.js 22.23.4+.

```sh
npm install
npm run dev       # http://localhost:4321 (search is unavailable in dev)
npm run build     # static site in dist/ + Pagefind search index
npm run preview   # serve the production build, including search
npm run check     # type-check .astro / .ts files
```

## Writing a post

Each post is a folder in `src/content/posts/`. The folder name is the URL slug (`/post/<slug>`), and images sit next to the Markdown:

```
src/content/posts/my-new-post/
├── index.md
├── cover.png
└── screenshot.png
```

~~~md
---
title: "My New Post"
description: "One or two sentences shown on cards, in search results and social previews."
pubDate: 2026-11-03
updatedDate: 2026-11-10 # optional
categories: ["DAX", "Best Practices"]
heroImage: ./cover.png # optional
draft: false # true = visible in `npm run dev` only
---

Intro paragraph...

## A section (appears in the table of contents)

![Alt text](./screenshot.png)

```dax
Revenue YoY % = DIVIDE ( [Revenue] - [Revenue PY], [Revenue PY] )
```
~~~

Tips:

- Use `##` and `###` headings; they build the "On this page" table of contents.
- Code fences support `dax` (custom grammar in `src/shiki/`), `csharp`, `sql`, `xml`, `bat`, `python`, `powershell`, `json` and every other [Shiki language](https://shiki.style/languages).
- In `bat`/`text` blocks, placeholders like `<Server Name>` or `$(ClientSecret)` are highlighted automatically.
- For a captioned image, wrap it in a figure:

  ```md
  <figure>

  ![Alt text](./image.png)

  <figcaption>Caption text</figcaption>
  </figure>
  ```

- Categories become topic pages at `/blog/categories/<slug>`. Reuse existing names where possible.
- Images are optimized to WebP at build time, so commit originals.

## Project structure

```
src/
├── components/        Header, Footer, PostCard, Cover, Search, TableOfContents, ...
├── content/posts/     All blog posts (Markdown + images)
├── layouts/           BaseLayout (SEO, Open Graph, theme)
├── markdown/          Markdown processor plugins
├── pages/             Routes: /, /blog, /blog/categories/*, /post/*, /about, /resources, /contact, /blog-feed.xml
├── shiki/             DAX grammar + code placeholder highlighter
├── styles/global.css  Design tokens (dark + light themes) and article typography
└── consts.ts          Site title, author, social links, navigation
public/                favicon, default social image, CNAME, robots.txt
```

## URLs preserved from Wix

| Wix URL                         | New site                                |
| ------------------------------- | --------------------------------------- |
| `/post/<slug>`                  | Same (served from `post/<slug>.html`)   |
| `/blog`                         | Same                                    |
| `/blog/categories/<category>`   | Same                                    |
| `/blog-feed.xml` (RSS)          | Same, so existing subscribers keep working |
| `/about`, `/resources`, `/contact` | Same                                 |

## Deployment (GitHub Pages)

Every push to `main` builds and deploys via `.github/workflows/deploy.yml`.

One-time setup:

1. In the GitHub repo, open **Settings > Pages** and set **Source** to **GitHub Actions**.
2. Push to `main` and wait for the **Deploy to GitHub Pages** workflow to finish.
3. In **Settings > Pages > Custom domain**, enter `www.elegantbi.com`. (`public/CNAME` already contains it.)

### Moving the domain off Wix

Update DNS wherever `elegantbi.com` is managed (Wix's DNS settings if Wix is the registrar, or transfer the domain to another registrar first):

| Type  | Host  | Value                                                                 |
| ----- | ----- | --------------------------------------------------------------------- |
| CNAME | `www` | `m-kovalsky.github.io`                                                |
| A     | `@`   | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA  | `@`   | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |

- Remove the old Wix A/CNAME records for `@` and `www`.
- **Leave MX/TXT records alone** so email for `mk@elegantbi.com` keeps working.
- Once DNS has propagated and GitHub shows the domain as verified, enable **Enforce HTTPS**.
- Cancel the Wix premium plan only after the new site is live on the domain.
