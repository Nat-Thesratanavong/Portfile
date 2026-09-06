import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/blog";
import { buildRss, escapeXml } from "@/lib/rss";

const post: Post = {
  slug: "hello-world",
  title: "Fish & Chips <b>",
  date: "Jan 2025",
  readingTime: "6 min",
  tag: "Next.js",
};

describe("escapeXml", () => {
  it("escapes markup-significant characters", () => {
    expect(escapeXml(`a&b<c>d"e'f`)).toBe("a&amp;b&lt;c&gt;d&quot;e&apos;f");
  });
});

describe("buildRss", () => {
  it("renders channel metadata and one item per post", () => {
    const xml = buildRss({
      title: "John Doe — Blog",
      description: "Writing about the web",
      siteUrl: "https://example.com",
      posts: [post],
    });
    expect(xml).toContain("<title>John Doe — Blog</title>");
    expect(xml).toContain("<link>https://example.com</link>");
    expect(xml).toContain("<title>Fish &amp; Chips &lt;b&gt;</title>");
    expect(xml).toContain("<link>https://example.com/posts/hello-world</link>");
    expect(xml).toContain("<category>Next.js</category>");
  });

  it("renders a valid channel with no items when empty", () => {
    const xml = buildRss({
      title: "Blog",
      description: "Writing",
      siteUrl: "https://example.com/",
      posts: [],
    });
    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
    expect(xml).toContain("<link>https://example.com</link>");
  });
});
