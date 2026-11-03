import { defineHastPlugin } from 'satteri';

/** Opens off-site links in a new tab, matching the original Wix behaviour. */
export const externalLinks = defineHastPlugin({
  name: 'elegantbi:external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href === 'string' && /^https?:\/\//.test(href) && !/^https?:\/\/(www\.)?elegantbi\.com/.test(href)) {
        ctx.setProperty(node, 'target', '_blank');
        ctx.setProperty(node, 'rel', 'noopener noreferrer');
      }
    },
  },
});
