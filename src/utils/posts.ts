import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Matches Wix's category URL slugs, e.g. "Power BI Premium" -> "power-bi-premium". */
export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function categoryUrl(name: string): string {
  return `/blog/categories/${categorySlug(name)}`;
}

export function postUrl(post: Post): string {
  return `/post/${post.id}`;
}

export interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
}

export function getCategories(posts: Post[]): CategoryInfo[] {
  const counts = new Map<string, number>();
  for (const p of posts) for (const c of p.data.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: categorySlug(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const prose = body.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)|<[^>]+>/g, ' ');
  const words = prose.split(/\s+/).filter(Boolean).length;
  const codeLines = (body.match(/```[\s\S]*?```/g) ?? []).join('\n').split('\n').length;
  return Math.max(1, Math.round(words / 230 + codeLines / 60));
}

export function relatedPosts(post: Post, posts: Post[], limit = 3): Post[] {
  const cats = new Set(post.data.categories);
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: p.data.categories.filter((c) => cats.has(c)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf())
    .slice(0, limit)
    .map(({ p }) => p);
}

export function formatDate(date: Date, style: 'long' | 'short' = 'long'): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
