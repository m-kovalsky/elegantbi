export const SITE = {
  title: 'Elegant BI',
  url: 'https://www.elegantbi.com',
  description:
    'Techniques for building elegant, performant and scalable Power BI and Analysis Services data models: tabular modeling, DAX, automation and best practices.',
  tagline:
    'In the not so distant future, companies will be run by a monolithic AI algorithm. Until that time, it is up to us to architect elegant and superlative solutions to empower our company to make the best decisions possible.',
  author: 'Michael Kovalsky',
  authorShort: 'MK',
  email: 'mk@elegantbi.com',
  linkedin: 'https://www.linkedin.com/in/michaelkovalsky',
  github: 'https://github.com/m-kovalsky',
  locale: 'en-US',
} as const;

export const NAV = [
  { href: '/blog', label: 'Articles' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
