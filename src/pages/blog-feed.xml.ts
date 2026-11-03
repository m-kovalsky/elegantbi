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
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post),
      categories: post.data.categories,
      author: `${SITE.email} (${SITE.author})`,
    })),
    customData: `<language>en-us</language>`,
  });
}
