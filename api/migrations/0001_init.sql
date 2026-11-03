-- Views and likes recorded on the new site. Wix-era totals are stored in the site repo
-- (src/data/legacy-engagement.json) and added on top of these numbers when displayed.
CREATE TABLE post_views (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE likes (
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (slug, visitor)
);

-- New comments. Imported Wix comments live in the site repo, but replies here may
-- reference them through parent_id.
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  parent_id TEXT,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('published', 'pending')),
  is_author INTEGER NOT NULL DEFAULT 0,
  visitor TEXT NOT NULL
);

CREATE INDEX comments_by_post ON comments (slug, status, created_at);
CREATE INDEX comments_by_status ON comments (status, created_at);
CREATE INDEX comments_by_visitor ON comments (visitor, created_at);
