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
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/posts/${post.slug}</link>
      <guid>${siteUrl}/posts/${post.slug}</guid>
      <category>${escapeXml(post.tag)}</category>
      <description>${escapeXml(`${post.tag} · ${post.readingTime}`)}</description>
    </item>`,
    )
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
