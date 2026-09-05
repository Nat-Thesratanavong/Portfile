import config from "@payload-config";
import { getPayload } from "payload";

export type Cover = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type PostDetail = Post & {
  body: unknown;
  cover: Cover | null;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  tag: string;
};

export type Project = {
  slug: string;
  name: string;
  outcome: string;
  stack: string[];
  year: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function formatMonth(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  const month = parsed.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${month} ${parsed.getUTCFullYear()}`;
}

function toPost(doc: unknown): Post | null {
  if (!isRecord(doc) || doc._status !== "published") {
    return null;
  }
  const title = asString(doc.title);
  const slug = asString(doc.slug);
  const date = asString(doc.date);
  const tag = asString(doc.tag);
  const readingTime = asString(doc.readingTime);
  if (!title || !slug || !date || !tag || !readingTime) {
    return null;
  }
  return { slug, title, date: formatMonth(date), readingTime, tag };
}

function toProject(doc: unknown): Project | null {
  if (!isRecord(doc) || doc._status !== "published") {
    return null;
  }
  const name = asString(doc.name);
  const slug = asString(doc.slug);
  const outcome = asString(doc.outcome);
  const year = asString(doc.year);
  const rawStack = Array.isArray(doc.stack) ? doc.stack : null;
  if (!name || !slug || !outcome || !year || !rawStack) {
    return null;
  }
  const stack: string[] = [];
  for (const entry of rawStack) {
    const item = isRecord(entry) ? asString(entry.item) : null;
    if (item) {
      stack.push(item);
    }
  }
  if (stack.length === 0) {
    return null;
  }
  return { slug, name, outcome, stack, year };
}

async function publishedDocs(collection: "posts" | "projects", limit: number): Promise<unknown[]> {
  const payload = await getPayload({ config });
  const result = (await payload.find({
    collection,
    sort: collection === "posts" ? "-date" : "-year",
    limit,
  })) as unknown as { docs?: unknown };
  return Array.isArray(result.docs) ? result.docs : [];
}

export async function getLatestPosts(limit = 10): Promise<Post[]> {
  const docs = await publishedDocs("posts", limit);
  const posts: Post[] = [];
  for (const doc of docs) {
    const post = toPost(doc);
    if (post) {
      posts.push(post);
    }
  }
  return posts;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toCover(value: unknown): Cover | null {
  if (!isRecord(value)) {
    return null;
  }
  const url = asString(value.url);
  const width = asNumber(value.width);
  const height = asNumber(value.height);
  if (!url || !width || !height) {
    return null;
  }
  const alt = asString(value.alt) ?? "";
  return { url, alt, width, height };
}

function toBody(value: unknown): unknown {
  if (!isRecord(value) || !isRecord(value.root) || !Array.isArray(value.root.children)) {
    return null;
  }
  return value;
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const payload = await getPayload({ config });
  const result = (await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    limit: 1,
  })) as unknown as { docs?: unknown };
  const docs = Array.isArray(result.docs) ? result.docs : [];
  const first = docs.length > 0 ? docs[0] : null;
  const post = toPost(first);
  if (!post || !isRecord(first)) {
    return null;
  }
  return { ...post, body: toBody(first.body), cover: toCover(first.cover) };
}

export async function getPublishedSlugs(): Promise<string[]> {
  const payload = await getPayload({ config });
  const result = (await payload.find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    limit: 100,
  })) as unknown as { docs?: unknown };
  const docs = Array.isArray(result.docs) ? result.docs : [];
  const slugs: string[] = [];
  for (const doc of docs) {
    if (isRecord(doc)) {
      const slug = asString(doc.slug);
      if (slug) {
        slugs.push(slug);
      }
    }
  }
  return slugs;
}

export async function getLatestProjects(limit = 10): Promise<Project[]> {
  const docs = await publishedDocs("projects", limit);
  const projects: Project[] = [];
  for (const doc of docs) {
    const project = toProject(doc);
    if (project) {
      projects.push(project);
    }
  }
  return projects;
}
