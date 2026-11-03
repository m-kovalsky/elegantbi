/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  ADMIN_TOKEN?: string;
  VISITOR_SALT?: string;
  TURNSTILE_SECRET?: string;
}

interface CommentRow {
  id: string;
  slug: string;
  parent_id: string | null;
  name: string;
  body: string;
  created_at: string;
  status: 'published' | 'pending';
  is_author: number;
}

const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/;
const ID = /^[A-Za-z0-9-]{8,64}$/;
const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|monitor/i;
// Anything that looks like a link sends the comment to the moderation queue.
const LINKISH =
  /(https?:\/\/|www\.|\b[a-z0-9-]{2,}\.(com|net|org|io|co|info|biz|xyz|ru|cn|top|site|online|shop|vip|buzz|win|app|dev|me|us|uk|in|tv|live|store|club|link|click)\b)/i;
const RESERVED_NAMES = new Set(['mk', 'michael kovalsky', 'michael', 'kovalsky', 'elegant bi', 'elegantbi', 'admin', 'author']);
const AUTHOR_NAME = 'Michael Kovalsky';
const MAX_BODY = 5000;
const MAX_NAME = 60;

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
    const cors: Record<string, string> = allowed.includes(origin)
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin',
        }
      : { Vary: 'Origin' };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      // Browsers always send Origin on cross-site fetches; refuse writes from other sites.
      if (request.method !== 'GET' && !allowed.includes(origin)) throw new HttpError(403, 'Origin not allowed');
      const { body, cache } = await route(request, env);
      return json(body, 200, { ...cors, 'Cache-Control': cache ?? 'no-store' });
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status, cors);
      console.error(err);
      return json({ error: 'Something went wrong' }, 500, cors);
    }
  },
};

async function route(request: Request, env: Env): Promise<{ body: unknown; cache?: string }> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  if (method === 'GET' && url.pathname === '/stats') return { body: await stats(env), cache: 'public, max-age=60' };

  if (parts[0] === 'posts' && parts[1]) {
    const slug = parts[1];
    if (!SLUG.test(slug)) throw new HttpError(400, 'Invalid post');
    if (method === 'GET' && parts.length === 2) return { body: await getPost(request, env, slug) };
    if (method === 'POST' && parts[2] === 'view') return { body: await addView(request, env, slug) };
    if (method === 'POST' && parts[2] === 'like') return { body: await toggleLike(request, env, slug) };
    if (method === 'POST' && parts[2] === 'comments') return { body: await addComment(request, env, slug) };
  }

  if (parts[0] === 'admin') {
    await requireAdmin(request, env);
    if (method === 'GET' && parts[1] === 'check') return { body: { ok: true } };
    if (method === 'GET' && parts[1] === 'comments') {
      const status = url.searchParams.get('status') === 'published' ? 'published' : 'pending';
      const { results } = await env.DB.prepare(
        'SELECT id, slug, parent_id, name, body, created_at, status, is_author FROM comments WHERE status = ? ORDER BY created_at DESC LIMIT 200',
      )
        .bind(status)
        .all<CommentRow>();
      return { body: { comments: results.map(publicComment) } };
    }
    const id = parts[2];
    if (parts[1] === 'comments' && id && ID.test(id)) {
      if (method === 'POST' && parts[3] === 'approve') {
        await env.DB.prepare("UPDATE comments SET status = 'published' WHERE id = ?").bind(id).run();
        return { body: { ok: true } };
      }
      if (method === 'DELETE') {
        await env.DB.batch([
          env.DB.prepare('DELETE FROM comments WHERE parent_id = ?').bind(id),
          env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id),
        ]);
        return { body: { ok: true } };
      }
    }
  }

  throw new HttpError(404, 'Not found');
}

async function stats(env: Env) {
  const [views, likes, comments] = await env.DB.batch<{ slug: string; n: number }>([
    env.DB.prepare('SELECT slug, views AS n FROM post_views'),
    env.DB.prepare('SELECT slug, COUNT(*) AS n FROM likes GROUP BY slug'),
    env.DB.prepare("SELECT slug, COUNT(*) AS n FROM comments WHERE status = 'published' GROUP BY slug"),
  ]);
  const posts: Record<string, { views: number; likes: number; comments: number }> = {};
  const add = (rows: { slug: string; n: number }[], key: 'views' | 'likes' | 'comments') => {
    for (const r of rows) (posts[r.slug] ??= { views: 0, likes: 0, comments: 0 })[key] = r.n;
  };
  add(views.results, 'views');
  add(likes.results, 'likes');
  add(comments.results, 'comments');
  return { posts };
}

async function getPost(request: Request, env: Env, slug: string) {
  const visitor = await visitorId(request, env, slug);
  const [views, likes, liked, comments] = await env.DB.batch([
    env.DB.prepare('SELECT views FROM post_views WHERE slug = ?').bind(slug),
    env.DB.prepare('SELECT COUNT(*) AS n FROM likes WHERE slug = ?').bind(slug),
    env.DB.prepare('SELECT 1 AS yes FROM likes WHERE slug = ? AND visitor = ?').bind(slug, visitor),
    env.DB.prepare(
      "SELECT id, slug, parent_id, name, body, created_at, status, is_author FROM comments WHERE slug = ? AND status = 'published' ORDER BY created_at",
    ).bind(slug),
  ]);
  return {
    views: (views.results[0] as { views?: number } | undefined)?.views ?? 0,
    likes: (likes.results[0] as { n: number }).n,
    liked: liked.results.length > 0,
    comments: (comments.results as unknown as CommentRow[]).map(publicComment),
  };
}

async function addView(request: Request, env: Env, slug: string) {
  if (BOT_UA.test(request.headers.get('User-Agent') ?? '')) return { counted: false };
  const row = await env.DB.prepare(
    'INSERT INTO post_views (slug, views) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET views = views + 1 RETURNING views',
  )
    .bind(slug)
    .first<{ views: number }>();
  return { counted: true, views: row?.views ?? 0 };
}

async function toggleLike(request: Request, env: Env, slug: string) {
  const visitor = await visitorId(request, env, slug);
  const existing = await env.DB.prepare('SELECT 1 FROM likes WHERE slug = ? AND visitor = ?').bind(slug, visitor).first();
  if (existing) {
    await env.DB.prepare('DELETE FROM likes WHERE slug = ? AND visitor = ?').bind(slug, visitor).run();
  } else {
    await env.DB.prepare('INSERT OR IGNORE INTO likes (slug, visitor, created_at) VALUES (?, ?, ?)')
      .bind(slug, visitor, new Date().toISOString())
      .run();
  }
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM likes WHERE slug = ?').bind(slug).first<{ n: number }>();
  return { liked: !existing, likes: count?.n ?? 0 };
}

async function addComment(request: Request, env: Env, slug: string) {
  const input = await readJson(request);
  const isAdmin = await isAdminRequest(request, env);
  const visitor = await visitorId(request, env, 'comments');

  // Honeypot field and minimum fill time catch most naive bots without bothering people.
  if (typeof input.website === 'string' && input.website.trim()) throw new HttpError(400, 'Comment rejected');
  if (!isAdmin && typeof input.elapsed === 'number' && input.elapsed < 3000) throw new HttpError(400, 'Please take a moment before posting');

  const body = clean(input.body, MAX_BODY);
  if (body.length < 2) throw new HttpError(400, 'Please write a comment');
  let name = isAdmin ? AUTHOR_NAME : clean(input.name, MAX_NAME).replace(/\s+/g, ' ');
  if (!name) throw new HttpError(400, 'Please enter your name');
  if (!isAdmin && RESERVED_NAMES.has(name.toLowerCase())) throw new HttpError(400, 'That name is reserved; please use another');

  // Comments that fail the bot check are queued for review instead of rejected, so a Turnstile hiccup never blocks a reader.
  const verified = isAdmin || !env.TURNSTILE_SECRET || (await verifyTurnstile(env.TURNSTILE_SECRET, input.turnstileToken, request));

  if (!isAdmin) {
    const recent = await env.DB.prepare(
      "SELECT SUM(created_at > datetime('now', '-10 minutes')) AS short, COUNT(*) AS day FROM comments WHERE visitor = ? AND created_at > datetime('now', '-1 day')",
    )
      .bind(visitor)
      .first<{ short: number | null; day: number }>();
    if ((recent?.short ?? 0) >= 5 || (recent?.day ?? 0) >= 30) throw new HttpError(429, 'You are commenting too quickly; please try again later');
  }

  let parentId: string | null = null;
  if (typeof input.parentId === 'string' && input.parentId) {
    if (!ID.test(input.parentId)) throw new HttpError(400, 'Invalid reply target');
    parentId = input.parentId;
    // Replies are one level deep: replying to a reply attaches to its top-level comment.
    const parent = await env.DB.prepare('SELECT slug, parent_id FROM comments WHERE id = ?').bind(parentId).first<{ slug: string; parent_id: string | null }>();
    if (parent) {
      if (parent.slug !== slug) throw new HttpError(400, 'Invalid reply target');
      parentId = parent.parent_id ?? parentId;
    }
  }

  const hasLink = LINKISH.test(`${name} ${body}`);
  const status: CommentRow['status'] = isAdmin || (verified && !hasLink) ? 'published' : 'pending';
  const row: CommentRow = {
    id: crypto.randomUUID(),
    slug,
    parent_id: parentId,
    name,
    body,
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status,
    is_author: isAdmin ? 1 : 0,
  };
  await env.DB.prepare(
    'INSERT INTO comments (id, slug, parent_id, name, body, created_at, status, is_author, visitor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(row.id, row.slug, row.parent_id, row.name, row.body, row.created_at, row.status, row.is_author, visitor)
    .run();
  return { status, reason: status === 'pending' ? (hasLink ? 'link' : 'review') : undefined, comment: publicComment(row) };
}

function publicComment(c: CommentRow) {
  return {
    id: c.id,
    slug: c.slug,
    parentId: c.parent_id,
    name: c.name,
    body: c.body,
    // Stored as SQLite UTC text so datetime() comparisons work; expose ISO 8601.
    createdAt: `${c.created_at.replace(' ', 'T')}Z`,
    status: c.status,
    isAuthor: c.is_author === 1,
  };
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 20_000) throw new HttpError(413, 'Comment is too long');
  try {
    const data = JSON.parse(text);
    if (data && typeof data === 'object' && !Array.isArray(data)) return data;
  } catch {}
  throw new HttpError(400, 'Invalid request');
}

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  // Strip control characters (keep newlines/tabs) and collapse runs of blank lines.
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

async function visitorId(request: Request, env: Env, scope: string): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
  const ua = request.headers.get('User-Agent') ?? '';
  return (await sha256(`${env.VISITOR_SALT ?? 'dev-salt'}|${scope}|${ip}|${ua}`)).slice(0, 32);
}

async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function isAdminRequest(request: Request, env: Env): Promise<boolean> {
  const header = request.headers.get('Authorization') ?? '';
  if (!env.ADMIN_TOKEN || !header.startsWith('Bearer ')) return false;
  // Compare digests so the check takes the same time regardless of where tokens differ.
  const [a, b] = await Promise.all([sha256(header.slice(7)), sha256(env.ADMIN_TOKEN)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function requireAdmin(request: Request, env: Env) {
  if (!(await isAdminRequest(request, env))) throw new HttpError(401, 'Unauthorized');
}

async function verifyTurnstile(secret: string, token: unknown, request: Request): Promise<boolean> {
  if (typeof token !== 'string' || !token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  form.append('remoteip', request.headers.get('CF-Connecting-IP') ?? '');
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    return Boolean(((await res.json()) as { success?: boolean }).success);
  } catch {
    return false;
  }
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...headers },
  });
}
