import legacy from '../data/legacy-engagement.json';

export type Segment = { text: string; href?: string; b?: boolean; i?: boolean };
export type Block =
  | { t: 'p'; c: Segment[] }
  | { t: 'code'; text: string }
  | { t: 'ul' | 'ol'; items: Segment[][] }
  | { t: 'img' | 'gif'; src: string; w?: number; h?: number };

export interface LegacyComment {
  id: string;
  author: string;
  isAuthor: boolean;
  date: string;
  blocks: Block[];
  replies?: LegacyComment[];
}

interface LegacyPost {
  views: number;
  likes: number;
  comments: LegacyComment[];
}

const posts = (legacy as unknown as { posts: Record<string, LegacyPost> }).posts;

/** Totals carried over from Wix; the live API adds activity on the new site on top of these. */
export function legacyEngagement(slug: string) {
  const p = posts[slug];
  const comments = p?.comments ?? [];
  return {
    views: p?.views ?? 0,
    likes: p?.likes ?? 0,
    comments,
    commentCount: comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0),
  };
}

export function compactNumber(n: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
