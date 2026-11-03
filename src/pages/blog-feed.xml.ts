import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../consts';
import { getPosts, postUrl } from '../utils/posts';

// Served at the same path Wix used so existing feed subscribers keep working.
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    trailingSlash: false,
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post),
      categories: post.data.categories,
      customData: `<dc:creator>${SITE.author}</dc:creator>`,
    })),
    customData: `<language>en-us</language>`,
  });
}
