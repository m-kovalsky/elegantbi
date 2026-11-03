import { SITE } from '../consts';

export const API = SITE.api.replace(/\/$/, '');
const ADMIN_KEY = 'ebi-admin-token';

export function adminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null) {
  try {
    if (token) localStorage.setItem(ADMIN_KEY, token);
    else localStorage.removeItem(ADMIN_KEY);
  } catch {}
}

export async function api<T>(path: string, init: RequestInit & { admin?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = init.admin ? adminToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export interface LiveComment {
  id: string;
  slug: string;
  parentId: string | null;
  name: string;
  body: string;
  createdAt: string;
  status: 'published' | 'pending';
  isAuthor: boolean;
}

export interface PostData {
  views: number;
  likes: number;
  liked: boolean;
  comments: LiveComment[];
}

async function recordView(slug: string) {
  // One view per post per browser session; the site owner's own visits are not counted.
  if (adminToken()) return;
  const key = `ebi-viewed:${slug}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {}
  await api(`/posts/${slug}/view`, { method: 'POST', body: '{}' }).catch(() => {});
}

const postCache = new Map<string, Promise<PostData>>();

/** Records the view (once per session) and loads live counts and comments; shared by all components on the page. */
export function loadPost(slug: string): Promise<PostData> {
  if (!postCache.has(slug)) {
    postCache.set(
      slug,
      recordView(slug).then(() => api<PostData>(`/posts/${slug}`)),
    );
  }
  return postCache.get(slug)!;
}

export const fullNumber = (n: number) => n.toLocaleString('en-US');
export const compactNumber = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts.at(-1)![0] : '')).toUpperCase();
}

/** Stable hue per name so avatars stay consistent between visits. */
export function avatarHue(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

const URL_RE = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]])/g;

/** Renders untrusted plain text: paragraphs, line breaks and clickable (nofollow) links. No HTML is interpreted. */
export function renderPlainText(text: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  for (const para of text.split(/\n{2,}/)) {
    const p = el('p');
    para.split('\n').forEach((line, i) => {
      if (i) p.append(el('br'));
      let last = 0;
      for (const m of line.matchAll(URL_RE)) {
        p.append(line.slice(last, m.index));
        const a = el('a', undefined, m[0]);
        a.href = m[0];
        a.rel = 'nofollow ugc noopener noreferrer';
        a.target = '_blank';
        p.append(a);
        last = m.index! + m[0].length;
      }
      p.append(line.slice(last));
    });
    frag.append(p);
  }
  return frag;
}

/** Builds the same markup as the server-rendered (imported) comments in Comments.astro. */
export function renderComment(c: LiveComment, canReply: boolean): HTMLLIElement {
  const li = el('li', 'comment');
  li.id = `comment-${c.id}`;
  li.dataset.commentId = c.id;
  const article = el('article', 'comment-card');
  const header = el('header', 'comment-head');
  const avatar = el('span', `comment-avatar${c.isAuthor ? ' is-author' : ''}`, initials(c.name));
  avatar.setAttribute('aria-hidden', 'true');
  if (!c.isAuthor) avatar.style.setProperty('--hue', String(avatarHue(c.name)));
  const meta = el('div', 'comment-meta');
  meta.append(el('span', 'comment-name', c.name));
  if (c.isAuthor) meta.append(el('span', 'comment-badge', 'Author'));
  const time = el('time', 'comment-date', formatDate(c.createdAt));
  time.dateTime = c.createdAt;
  meta.append(time);
  header.append(avatar, meta);
  const body = el('div', 'comment-body');
  body.append(renderPlainText(c.body));
  article.append(header, body);
  if (canReply) {
    const footer = el('footer', 'comment-actions');
    const btn = el('button', 'comment-reply', 'Reply');
    btn.type = 'button';
    btn.dataset.replyTo = c.id;
    btn.dataset.replyName = c.name;
    footer.append(btn);
    article.append(footer);
  }
  li.append(article);
  return li;
}
