// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import daxGrammar from './src/shiki/dax.tmLanguage.json' with { type: 'json' };
import { placeholderTransformer } from './src/shiki/placeholders.mjs';
import { externalLinks } from './src/markdown/external-links.mjs';

export default defineConfig({
  site: 'https://www.elegantbi.com',
  // Emit /post/slug.html so the original Wix URLs (/post/slug, no trailing slash) keep working on GitHub Pages.
  trailingSlash: 'never',
  build: { format: 'file' },
  compressHTML: true,
  integrations: [sitemap()],
  markdown: {
    processor: satteri({ hastPlugins: [externalLinks] }),
    shikiConfig: {
      themes: { dark: 'vitesse-dark', light: 'vitesse-light' },
      defaultColor: false,
      // @ts-ignore - JSON grammar matches LanguageRegistration at runtime
      langs: [daxGrammar],
      transformers: [placeholderTransformer()],
    },
  },
});
