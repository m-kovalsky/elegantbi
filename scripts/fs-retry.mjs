// Preloaded by `npm run build`. On Windows, antivirus/indexers briefly lock freshly written files,
// which makes Astro's parallel asset moves fail with EBUSY/EPERM. Retry those renames with backoff.
import fs from 'node:fs';

if (process.platform === 'win32') {
  const rename = fs.promises.rename.bind(fs.promises);
  const RETRYABLE = new Set(['EBUSY', 'EPERM', 'EACCES']);

  fs.promises.rename = async (from, to) => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await rename(from, to);
      } catch (err) {
        if (!RETRYABLE.has(err?.code) || attempt >= 10) throw err;
        await new Promise((r) => setTimeout(r, 50 * 2 ** Math.min(attempt, 5)));
      }
    }
  };
}
