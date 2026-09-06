import { getLatestPosts } from "@/lib/blog";
import { buildRss } from "@/lib/rss";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

function baseUrl(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function GET(request: Request): Promise<Response> {
  const posts = await getLatestPosts(50);
  const xml = buildRss({
    title: `${site.name} — Blog`,
    description: site.stance,
    siteUrl: baseUrl(request),
    posts,
  });
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
