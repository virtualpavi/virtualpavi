import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: URL }) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  
  return rss({
    title: 'virtualpavi.com Blog',
    description: 'Security insights, automation strategies, and technical deep-dives from 7+ years defending digital infrastructure.',
    site: context.site,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.slug}/`,
        categories: post.data.tags,
      })),
    customData: `<language>en-us</language>`,
  });
}
