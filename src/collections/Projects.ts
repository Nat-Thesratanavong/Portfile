import type { CollectionConfig } from "payload";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type ProjectRef = {
  id: number | string;
  name: string;
  slug: string;
};

function asProjectRef(doc: unknown): ProjectRef | null {
  if (!isRecord(doc)) {
    return null;
  }
  const { id, name, slug } = doc;
  if (
    (typeof id !== "number" && typeof id !== "string") ||
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof slug !== "string" ||
    slug === ""
  ) {
    return null;
  }
  return { id, name, slug };
}

async function findTagByProject(
  payload: { find: (args: unknown) => Promise<unknown> },
  projectId: number | string,
): Promise<Record<string, unknown> | null> {
  const result = (await payload.find({
    collection: "tags",
    where: { project: { equals: projectId } },
    limit: 1,
    depth: 0,
  })) as unknown as { docs?: unknown };
  const docs = Array.isArray(result.docs) ? result.docs : [];
  const first = docs.length > 0 ? docs[0] : null;
  return isRecord(first) ? first : null;
}

type LoosePayload = {
  find: (query: unknown) => Promise<unknown>;
  create: (query: unknown) => Promise<unknown>;
  update: (query: unknown) => Promise<unknown>;
};

// Every project owns exactly one project-mastered tag (label = project
// name). Safe to re-run: existing tags are reused, never duplicated.
export async function syncProjectTag(args: {
  doc: unknown;
  operation: "create" | "update";
  originalDoc?: unknown;
  req: { payload: unknown };
}): Promise<void> {
  const project = asProjectRef(args.doc);
  const payload = args.req.payload as unknown as LoosePayload;
  if (!project) {
    return;
  }
  const tag = await findTagByProject(payload, project.id);
  if (!tag) {
    let tagSlug = project.slug;
    const clash = (await payload.find({
      collection: "tags",
      where: { slug: { equals: tagSlug } },
      limit: 1,
      depth: 0,
    })) as unknown as { docs?: unknown[] };
    if (Array.isArray(clash.docs) && clash.docs.length > 0) {
      tagSlug = `${project.slug}-${String(project.id)}`;
    }
    await payload.create({
      collection: "tags",
      data: { label: project.name, slug: tagSlug, project: project.id },
    });
    return;
  }
  if (args.operation !== "update" || !isRecord(args.originalDoc)) {
    return;
  }
  const previousName = args.originalDoc.name;
  if (typeof previousName !== "string" || previousName === project.name) {
    return;
  }
  const tagId = tag.id;
  if (typeof tagId !== "number" && typeof tagId !== "string") {
    return;
  }
  const data: { label: string; slug?: string } = { label: project.name };
  if (tag.slug === slugify(previousName)) {
    data.slug = slugify(project.name);
  }
  await payload.update({ collection: "tags", id: tagId, data });
}

// Unlink (never delete): posts may reference the tag, so a deleted
// project turns its tag into a free-form one instead of removing it.
export async function unlinkProjectTag(args: {
  doc: unknown;
  req: { payload: unknown };
}): Promise<void> {
  const project = asProjectRef(args.doc);
  if (!project) {
    return;
  }
  const payload = args.req.payload as unknown as LoosePayload;
  const tag = await findTagByProject(payload, project.id);
  if (!tag) {
    return;
  }
  const tagId = tag.id;
  if (typeof tagId !== "number" && typeof tagId !== "string") {
    return;
  }
  await payload.update({ collection: "tags", id: tagId, data: { project: null } });
}

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "year", "_status", "updatedAt"],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if ((operation === "create" || operation === "update") && data) {
          const name = typeof data.name === "string" ? data.name : "";
          const slug = typeof data.slug === "string" ? data.slug : "";
          if (name && !slug) {
            return { ...data, slug: slugify(name) };
          }
        }
        return data;
      },
    ],
    afterChange: [syncProjectTag],
    afterDelete: [unlinkProjectTag],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Auto-filled from the name when left empty.",
      },
    },
    {
      name: "outcome",
      type: "textarea",
      required: true,
    },
    {
      name: "stack",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        {
          name: "item",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "year",
      type: "text",
      required: true,
    },
    {
      name: "links",
      type: "group",
      fields: [
        { name: "github", type: "text" },
        { name: "live", type: "text" },
      ],
    },
    {
      name: "screenshots",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "body",
      type: "richText",
    },
  ],
};
