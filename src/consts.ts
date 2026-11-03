export const SITE = {
  title: 'Elegant BI',
  url: 'https://www.elegantbi.com',
  description:
    'Techniques for building elegant, performant and scalable Power BI and Analysis Services data models: tabular modeling, DAX, automation and best practices.',
  tagline:
    'In the not so distant future, companies will be run by a monolithic AI algorithm. Until that time, it is up to us to architect elegant and superlative solutions to empower our company to make the best decisions possible.',
  author: 'Michael Kovalsky',
  authorShort: 'MK',
  linkedin: 'https://www.linkedin.com/in/michaelkovalsky',
  github: 'https://github.com/m-kovalsky',
  locale: 'en-US',
  // Cloudflare Worker that records views, likes and comments (see api/). Override with PUBLIC_API_URL for local dev.
  api: (import.meta.env.PUBLIC_API_URL as string | undefined) || 'https://elegantbi-api.elegantbi.workers.dev',
  // Cloudflare Turnstile site key (public) for the invisible bot check on comments.
  turnstileSiteKey: (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined) ?? '0x4AAAAAAFyX80crGpOjrfjB',
} as const;

export const NAV = [
  { href: '/blog', label: 'Articles' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
