/**
 * Highlights placeholders such as `<Server Name>` or `$(ClientSecret)` in command-line snippets,
 * so posts that say "update the parameters in orange" stay accurate.
 */
const PLACEHOLDER = /(<[^<>"\n]+>|\$\([^)\n]+\))/g;
const LANGS = new Set(['bat', 'cmd', 'batch', 'text', 'txt', 'plaintext', 'powershell', 'shell']);

/** @returns {import('shiki').ShikiTransformer} */
export function placeholderTransformer() {
  return {
    name: 'elegantbi:placeholders',
    tokens(lines) {
      if (!LANGS.has(this.options.lang)) return;
      return lines.map((line) =>
        line.flatMap((token) => {
          if (!PLACEHOLDER.test(token.content)) return [token];
          PLACEHOLDER.lastIndex = 0;
          const parts = token.content.split(PLACEHOLDER).filter(Boolean);
          let offset = token.offset;
          return parts.map((content) => {
            const isPlaceholder = /^(<[^<>"\n]+>|\$\([^)\n]+\))$/.test(content);
            const part = {
              ...token,
              content,
              offset,
              ...(isPlaceholder ? { htmlAttrs: { ...(token.htmlAttrs ?? {}), class: 'code-placeholder' } } : {}),
            };
            offset += content.length;
            return part;
          });
        }),
      );
    },
  };
}
