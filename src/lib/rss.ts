import type { Post } from "./blog";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRss(args: {
  title: string;
  description: string;
  siteUrl: string;
  posts: Post[];
}): string {
  const siteUrl = args.siteUrl.replace(/\/+$/, "");
  const items = args.posts
    .map((post) => {
      const categories = post.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");
      const summary =
        post.tags.length > 0 ? `${post.tags.join(" · ")} · ${post.readingTime}` : post.readingTime;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/posts/${escapeXml(post.slug)}</link>
      <guid>${siteUrl}/posts/${escapeXml(post.slug)}</guid>
${categories}
      <description>${escapeXml(summary)}</description>
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(args.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(args.description)}</description>
${items}
  </channel>
</rss>
`;
}
