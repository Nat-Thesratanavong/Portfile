import config from "@payload-config";
import { getPayload } from "payload";

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
